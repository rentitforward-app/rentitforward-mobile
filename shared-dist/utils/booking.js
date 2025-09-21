"use strict";
/**
 * Booking utilities for shared logic across web and mobile platforms
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPickupButtonInfo = getPickupButtonInfo;
exports.formatPickupDate = formatPickupDate;
exports.isWithinPickupWindow = isWithinPickupWindow;
exports.getPickupWindowDescription = getPickupWindowDescription;
/**
 * Calculate pickup button availability and state information
 * Pickup button is available from start date 00:00 until end date 23:59
 */
function getPickupButtonInfo(booking) {
    const today = new Date();
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);
    // Set start date to beginning of day (00:00)
    const startOfPickupDay = new Date(startDate);
    startOfPickupDay.setHours(0, 0, 0, 0);
    // Set end date to end of day (23:59:59)
    const endOfPickupPeriod = new Date(endDate);
    endOfPickupPeriod.setHours(23, 59, 59, 999);
    // Calculate time differences
    const isBeforePickupPeriod = today < startOfPickupDay;
    const isAfterPickupPeriod = today > endOfPickupPeriod;
    const isWithinPickupPeriod = today >= startOfPickupDay && today <= endOfPickupPeriod;
    // Calculate days until pickup/return
    const daysUntilPickup = isBeforePickupPeriod
        ? Math.ceil((startOfPickupDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null;
    const daysUntilReturn = isWithinPickupPeriod
        ? Math.ceil((endOfPickupPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null;
    // Determine booking state
    const hasBeenPickedUp = booking.status === 'active' || booking.status === 'picked_up';
    const showPickupButton = booking.status === 'confirmed' || booking.status === 'payment_required';
    // Pickup availability logic
    const isPickupAvailable = isWithinPickupPeriod && booking.status === 'confirmed' && !hasBeenPickedUp;
    const canConfirmPickup = isPickupAvailable;
    // Return availability logic
    const isReturnAvailable = isWithinPickupPeriod && hasBeenPickedUp;
    const canReturn = isReturnAvailable;
    // Generate button text
    let pickupButtonText;
    if (hasBeenPickedUp && canReturn) {
        pickupButtonText = 'Confirm Return';
    }
    else if (isBeforePickupPeriod) {
        pickupButtonText = 'Confirm Pickup (Not Available Yet)';
    }
    else if (isAfterPickupPeriod && !hasBeenPickedUp) {
        pickupButtonText = 'Pickup Date Passed';
    }
    else if (isWithinPickupPeriod && booking.status !== 'confirmed') {
        pickupButtonText = 'Complete Payment First';
    }
    else {
        pickupButtonText = 'Confirm Pickup';
    }
    // Generate button note
    let pickupButtonNote = null;
    if (isBeforePickupPeriod && daysUntilPickup) {
        const startDateFormatted = startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        pickupButtonNote = `Pickup button will be active starting ${startDateFormatted} at 12:00 AM (${daysUntilPickup} day${daysUntilPickup !== 1 ? 's' : ''} from now)`;
    }
    else if (isAfterPickupPeriod && !hasBeenPickedUp) {
        pickupButtonNote = 'Pickup date has passed. Contact support if you need assistance.';
    }
    else if (isWithinPickupPeriod && booking.status !== 'confirmed') {
        pickupButtonNote = 'Complete payment first to enable pickup confirmation.';
    }
    else if (hasBeenPickedUp && canReturn) {
        pickupButtonNote = 'Ready for return confirmation.';
    }
    else if (hasBeenPickedUp && !canReturn) {
        const endDateFormatted = endDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        pickupButtonNote = `Return confirmation available until ${endDateFormatted} at 11:59 PM`;
    }
    return {
        canConfirmPickup,
        canReturn,
        hasBeenPickedUp,
        showPickupButton,
        isPickupAvailable,
        isReturnAvailable,
        pickupButtonText,
        pickupButtonNote,
        daysUntilPickup,
        daysUntilReturn
    };
}
/**
 * Format date for pickup/return display
 */
function formatPickupDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
/**
 * Check if current time is within pickup availability window
 */
function isWithinPickupWindow(startDate, endDate) {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set to beginning and end of respective days
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return today >= start && today <= end;
}
/**
 * Get pickup window description for display
 */
function getPickupWindowDescription(startDate, endDate) {
    const start = formatPickupDate(startDate);
    const end = formatPickupDate(endDate);
    return `Available from ${start} at 12:00 AM until ${end} at 11:59 PM`;
}
