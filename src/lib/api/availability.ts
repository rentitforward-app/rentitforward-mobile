import { CalendarAvailability } from '../../shared-dist/utils/calendar';
import { supabase } from '../supabase';

/**
 * API client for fetching listing availability data using Supabase RPC
 */
export const availabilityAPI = {
  /**
   * Fetch availability data for a listing within a date range using Supabase RPC
   * @param listingId - ID of the listing
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @returns Promise with availability data
   */
  getAvailability: async (
    listingId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarAvailability[]> => {
    console.log(`📞 Calling RPC get_listing_availability with:`, {
      p_listing_id: listingId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    const { data, error } = await supabase
      .rpc('get_listing_availability', {
        p_listing_id: listingId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

    if (error) {
      console.error('❌ Error fetching availability from RPC:', error);
      console.error('❌ RPC call details:', {
        listingId,
        startDate,
        endDate,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
      });
      throw new Error(`Failed to fetch availability data: ${error.message}`);
    }

    console.log(`📊 RPC returned ${data?.length || 0} availability records:`, data);

    const mappedData = (data || []).map((item: any) => ({
      date: item.date,
      status: item.status || 'available',
      bookingId: item.booking_id,
      blockedReason: item.blocked_reason,
    }));

    console.log(`🔄 Mapped availability data:`, mappedData);

    return mappedData;
  },

  /**
   * Get availability data with fallback to empty array
   * @param listingId - ID of the listing
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @returns Promise with availability data or empty array on error
   */
  getAvailabilitySafe: async (
    listingId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarAvailability[]> => {
    try {
      console.log(`🔍 Fetching availability for listing ${listingId} from ${startDate} to ${endDate}`);
      const result = await availabilityAPI.getAvailability(listingId, startDate, endDate);
      console.log(`✅ Availability fetched successfully:`, result);
      return result;
    } catch (error) {
      console.error('❌ Availability API failed:', error);
      console.warn('Availability API not available, returning empty data:', error);
      return [];
    }
  },
};
