/**
 * Booking utilities for shared logic across web and mobile platforms
 */
export interface BookingPickupInfo {
    canConfirmPickup: boolean;
    canReturn: boolean;
    hasBeenPickedUp: boolean;
    showPickupButton: boolean;
    isPickupAvailable: boolean;
    isReturnAvailable: boolean;
    pickupButtonText: string;
    pickupButtonNote: string | null;
    daysUntilPickup: number | null;
    daysUntilReturn: number | null;
}
export interface BookingForPickup {
    status: string;
    start_date: string;
    end_date: string;
    pickup_confirmed_by_renter?: boolean;
    return_confirmed_by_renter?: boolean;
}
/**
 * Calculate pickup button availability and state information
 * Pickup button is available from start date 00:00 until end date 23:59
 */
export declare function getPickupButtonInfo(booking: BookingForPickup): BookingPickupInfo;
/**
 * Format date for pickup/return display
 */
export declare function formatPickupDate(dateString: string): string;
/**
 * Check if current time is within pickup availability window
 */
export declare function isWithinPickupWindow(startDate: string, endDate: string): boolean;
/**
 * Get pickup window description for display
 */
export declare function getPickupWindowDescription(startDate: string, endDate: string): string;
