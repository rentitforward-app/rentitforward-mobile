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
    const { data, error } = await supabase
      .rpc('get_listing_availability', {
        p_listing_id: listingId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

    if (error) {
      console.error('Error fetching availability from RPC:', error);
      throw new Error('Failed to fetch availability data');
    }

    return (data || []).map((item: any) => ({
      date: item.date,
      status: item.status || 'available',
      bookingId: item.booking_id,
      blockedReason: item.blocked_reason,
    }));
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
      return await availabilityAPI.getAvailability(listingId, startDate, endDate);
    } catch (error) {
      console.warn('Availability API not available, returning empty data:', error);
      return [];
    }
  },
};
