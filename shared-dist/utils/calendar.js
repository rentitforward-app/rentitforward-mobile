"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDuration = calculateDuration;
exports.generateDateRange = generateDateRange;
exports.isDateAvailable = isDateAvailable;
exports.getUnavailableDates = getUnavailableDates;
exports.checkDateRangeAvailability = checkDateRangeAvailability;
exports.validateDateRange = validateDateRange;
exports.formatDateRange = formatDateRange;
exports.getNextAvailableDate = getNextAvailableDate;
exports.isValidBookingGap = isValidBookingGap;
exports.createBookingBlocks = createBookingBlocks;
const date_fns_1 = require("date-fns");
/**
 * Calculate duration between two dates in days
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Duration in days
 */
function calculateDuration(startDate, endDate) {
    // Inclusive duration: count both pickup (start) and return (end) dates
    return (0, date_fns_1.differenceInDays)(endDate, startDate) + 1;
}
/**
 * Generate array of date strings for a given range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of ISO date strings
 */
function generateDateRange(startDate, endDate) {
    const dates = [];
    let currentDate = (0, date_fns_1.startOfDay)(startDate);
    const end = (0, date_fns_1.startOfDay)(endDate);
    while (currentDate <= end) {
        dates.push((0, date_fns_1.format)(currentDate, 'yyyy-MM-dd'));
        currentDate = (0, date_fns_1.addDays)(currentDate, 1);
    }
    return dates;
}
/**
 * Check if a specific date is available for booking
 * @param date - ISO date string to check
 * @param availability - Array of availability data
 * @returns true if available, false if not
 */
function isDateAvailable(date, availability) {
    const dateAvailability = availability.find(a => a.date === date);
    return !dateAvailability || dateAvailability.status === 'available';
}
/**
 * Get array of unavailable dates
 * @param availability - Array of availability data
 * @returns Array of unavailable date strings
 */
function getUnavailableDates(availability) {
    return availability
        .filter(a => a.status !== 'available')
        .map(a => a.date);
}
/**
 * Check if a date range is completely available
 * @param startDate - Start date
 * @param endDate - End date
 * @param availability - Array of availability data
 * @returns Object with availability status and conflicts
 */
function checkDateRangeAvailability(startDate, endDate, availability) {
    const dateRange = generateDateRange(startDate, endDate);
    const conflicts = [];
    dateRange.forEach(date => {
        if (!isDateAvailable(date, availability)) {
            conflicts.push(date);
        }
    });
    return {
        available: conflicts.length === 0,
        conflicts,
    };
}
/**
 * Validate date range for booking rules
 * @param startDate - Start date
 * @param endDate - End date
 * @param minDate - Minimum allowed date (default: today)
 * @param maxDate - Maximum allowed date (default: 1 year from today)
 * @returns Validation result with errors
 */
function validateDateRange(startDate, endDate, minDate = (0, date_fns_1.startOfDay)(new Date()), maxDate = (0, date_fns_1.addDays)(new Date(), 365)) {
    const errors = [];
    if (!startDate) {
        errors.push('Start date is required');
    }
    if (!endDate) {
        errors.push('End date is required');
    }
    if (startDate && endDate) {
        if ((0, date_fns_1.isBefore)(startDate, minDate)) {
            errors.push('Start date cannot be in the past');
        }
        if ((0, date_fns_1.isAfter)(startDate, maxDate)) {
            errors.push('Start date is too far in the future');
        }
        if ((0, date_fns_1.isBefore)(endDate, startDate)) {
            errors.push('End date must be after start date');
        }
        if ((0, date_fns_1.isAfter)(endDate, maxDate)) {
            errors.push('End date is too far in the future');
        }
        const duration = calculateDuration(startDate, endDate);
        if (duration < 1) {
            errors.push('Minimum rental period is 1 day');
        }
        if (duration > 365) {
            errors.push('Maximum rental period is 365 days');
        }
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Format date range for display
 * @param startDate - Start date
 * @param endDate - End date
 * @param options - Formatting options
 * @returns Formatted date range string
 */
function formatDateRange(startDate, endDate, options = {}) {
    const { dateFormat = 'MMM d', separator = ' - ', showYear = false, } = options;
    const formatString = showYear ? `${dateFormat}, yyyy` : dateFormat;
    const startFormatted = (0, date_fns_1.format)(startDate, formatString);
    const endFormatted = (0, date_fns_1.format)(endDate, formatString);
    return `${startFormatted}${separator}${endFormatted}`;
}
/**
 * Get the next available date from a given date
 * @param fromDate - Date to start searching from
 * @param availability - Array of availability data
 * @param maxDaysToCheck - Maximum days to search (default: 30)
 * @returns Next available date or null if none found
 */
function getNextAvailableDate(fromDate, availability, maxDaysToCheck = 30) {
    let currentDate = (0, date_fns_1.startOfDay)(fromDate);
    for (let i = 0; i < maxDaysToCheck; i++) {
        const dateString = (0, date_fns_1.format)(currentDate, 'yyyy-MM-dd');
        if (isDateAvailable(dateString, availability)) {
            return currentDate;
        }
        currentDate = (0, date_fns_1.addDays)(currentDate, 1);
    }
    return null;
}
/**
 * Calculate the minimum gap between bookings (if required)
 * @param endDate - End date of previous booking
 * @param startDate - Start date of next booking
 * @param minimumGapDays - Minimum required gap in days (default: 0)
 * @returns true if gap is sufficient
 */
function isValidBookingGap(endDate, startDate, minimumGapDays = 0) {
    const gap = (0, date_fns_1.differenceInDays)(startDate, endDate);
    return gap >= minimumGapDays;
}
/**
 * Create blocked date entries for a booking
 * @param startDate - Booking start date
 * @param endDate - Booking end date
 * @param bookingId - ID of the booking
 * @param status - Status of the blocked dates
 * @returns Array of CalendarAvailability entries
 */
function createBookingBlocks(startDate, endDate, bookingId, status = 'booked') {
    const dateRange = generateDateRange(startDate, endDate);
    return dateRange.map(date => ({
        date,
        status,
        bookingId,
    }));
}
