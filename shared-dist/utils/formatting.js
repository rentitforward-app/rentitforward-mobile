"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPostcode = exports.isValidPhone = exports.isValidEmail = exports.getImageUrl = exports.formatFileSize = exports.getRatingStars = exports.formatRating = exports.formatDaysBetween = exports.formatRelativeTime = exports.formatDate = exports.formatPriceRange = exports.formatPrice = exports.titleCase = exports.capitalizeFirst = exports.truncateText = exports.slugify = void 0;
// Text Formatting Utilities
const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};
exports.slugify = slugify;
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength).trim() + '...';
};
exports.truncateText = truncateText;
const capitalizeFirst = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
exports.capitalizeFirst = capitalizeFirst;
const titleCase = (text) => {
    return text
        .toLowerCase()
        .split(' ')
        .map(word => (0, exports.capitalizeFirst)(word))
        .join(' ');
};
exports.titleCase = titleCase;
// Price Formatting Utilities
const formatPrice = (amount, currency = 'AUD', locale = 'en-AU') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};
exports.formatPrice = formatPrice;
const formatPriceRange = (minPrice, maxPrice, currency = 'AUD', locale = 'en-AU') => {
    const min = (0, exports.formatPrice)(minPrice, currency, locale);
    const max = (0, exports.formatPrice)(maxPrice, currency, locale);
    return `${min} - ${max}`;
};
exports.formatPriceRange = formatPriceRange;
// Date Formatting Utilities
const formatDate = (date, format = 'medium', locale = 'en-AU') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const options = {
        short: { day: 'numeric', month: 'short', year: 'numeric' },
        medium: { day: 'numeric', month: 'long', year: 'numeric' },
        long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
        full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    }[format];
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
};
exports.formatDate = formatDate;
const formatRelativeTime = (date, locale = 'en-AU') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (diffInSeconds < 60)
        return rtf.format(-diffInSeconds, 'second');
    if (diffInSeconds < 3600)
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    if (diffInSeconds < 86400)
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    if (diffInSeconds < 2592000)
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    if (diffInSeconds < 31536000)
        return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
};
exports.formatRelativeTime = formatRelativeTime;
const formatDaysBetween = (startDate, endDate) => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
exports.formatDaysBetween = formatDaysBetween;
// Distance and Location Utilities
// formatDistance moved to geolocation.ts to avoid duplicate exports
// calculateDistance moved to geolocation.ts to avoid duplicate exports
// Rating and Review Utilities
const formatRating = (rating, precision = 1) => {
    return rating.toFixed(precision);
};
exports.formatRating = formatRating;
const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return '★'.repeat(fullStars) +
        (hasHalfStar ? '☆' : '') +
        '☆'.repeat(emptyStars);
};
exports.getRatingStars = getRatingStars;
// File and Image Utilities
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
const getImageUrl = (path, bucket = 'listings', baseUrl = '') => {
    return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
};
exports.getImageUrl = getImageUrl;
// Validation Utilities
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPhone = (phone) => {
    // Australian phone number validation
    const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};
exports.isValidPhone = isValidPhone;
const isValidPostcode = (postcode) => {
    // Australian postcode validation
    const postcodeRegex = /^\d{4}$/;
    return postcodeRegex.test(postcode);
};
exports.isValidPostcode = isValidPostcode;
