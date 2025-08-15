/**
 * Calendar availability status for a specific date
 */
export interface CalendarAvailability {
    date: string;
    status: 'available' | 'booked' | 'blocked' | 'tentative';
    bookingId?: string;
    blockedReason?: string;
}
/**
 * Date range selection state
 */
export interface DateRangeSelection {
    startDate: Date | null;
    endDate: Date | null;
    duration: number;
}
/**
 * Availability query parameters
 */
export interface AvailabilityQuery {
    listingId: string;
    startDate: string;
    endDate: string;
}
/**
 * API response for availability data
 */
export interface AvailabilityResponse {
    listingId: string;
    dates: CalendarAvailability[];
    lastUpdated: string;
}
/**
 * Calculate duration between two dates in days
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Duration in days
 */
export declare function calculateDuration(startDate: Date, endDate: Date): number;
/**
 * Generate array of date strings for a given range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of ISO date strings
 */
export declare function generateDateRange(startDate: Date, endDate: Date): string[];
/**
 * Check if a specific date is available for booking
 * @param date - ISO date string to check
 * @param availability - Array of availability data
 * @returns true if available, false if not
 */
export declare function isDateAvailable(date: string, availability: CalendarAvailability[]): boolean;
/**
 * Get array of unavailable dates
 * @param availability - Array of availability data
 * @returns Array of unavailable date strings
 */
export declare function getUnavailableDates(availability: CalendarAvailability[]): string[];
/**
 * Check if a date range is completely available
 * @param startDate - Start date
 * @param endDate - End date
 * @param availability - Array of availability data
 * @returns Object with availability status and conflicts
 */
export declare function checkDateRangeAvailability(startDate: Date, endDate: Date, availability: CalendarAvailability[]): {
    available: boolean;
    conflicts: string[];
};
/**
 * Validate date range for booking rules
 * @param startDate - Start date
 * @param endDate - End date
 * @param minDate - Minimum allowed date (default: today)
 * @param maxDate - Maximum allowed date (default: 1 year from today)
 * @returns Validation result with errors
 */
export declare function validateDateRange(startDate: Date | null, endDate: Date | null, minDate?: Date, maxDate?: Date): {
    valid: boolean;
    errors: string[];
};
/**
 * Format date range for display
 * @param startDate - Start date
 * @param endDate - End date
 * @param options - Formatting options
 * @returns Formatted date range string
 */
export declare function formatDateRange(startDate: Date, endDate: Date, options?: {
    dateFormat?: string;
    separator?: string;
    showYear?: boolean;
}): string;
/**
 * Get the next available date from a given date
 * @param fromDate - Date to start searching from
 * @param availability - Array of availability data
 * @param maxDaysToCheck - Maximum days to search (default: 30)
 * @returns Next available date or null if none found
 */
export declare function getNextAvailableDate(fromDate: Date, availability: CalendarAvailability[], maxDaysToCheck?: number): Date | null;
/**
 * Calculate the minimum gap between bookings (if required)
 * @param endDate - End date of previous booking
 * @param startDate - Start date of next booking
 * @param minimumGapDays - Minimum required gap in days (default: 0)
 * @returns true if gap is sufficient
 */
export declare function isValidBookingGap(endDate: Date, startDate: Date, minimumGapDays?: number): boolean;
/**
 * Create blocked date entries for a booking
 * @param startDate - Booking start date
 * @param endDate - Booking end date
 * @param bookingId - ID of the booking
 * @param status - Status of the blocked dates
 * @returns Array of CalendarAvailability entries
 */
export declare function createBookingBlocks(startDate: Date, endDate: Date, bookingId: string, status?: CalendarAvailability['status']): CalendarAvailability[];
