"use strict";
/**
 * Geolocation utilities for distance calculation and coordinate handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = calculateDistance;
exports.isValidCoordinates = isValidCoordinates;
exports.isWithinAustralia = isWithinAustralia;
exports.calculateCenterPoint = calculateCenterPoint;
exports.calculateBounds = calculateBounds;
exports.isWithinBounds = isWithinBounds;
exports.findWithinRadius = findWithinRadius;
exports.sortByDistance = sortByDistance;
exports.formatDistance = formatDistance;
exports.parsePostGISPoint = parsePostGISPoint;
exports.toPostGISPoint = toPostGISPoint;
exports.getDefaultLocation = getDefaultLocation;
const location_1 = require("../types/location");
/**
 * Earth's radius in kilometers
 */
const EARTH_RADIUS_KM = 6371;
/**
 * Conversion factor from kilometers to miles
 */
const KM_TO_MILES = 0.621371;
/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @param options Distance calculation options
 * @returns Distance in specified units (default: kilometers)
 */
function calculateDistance(coord1, coord2, options = {}) {
    const { unit = 'km', precision = 2 } = options;
    // Convert latitude and longitude from degrees to radians
    const lat1Rad = toRadians(coord1.latitude);
    const lat2Rad = toRadians(coord2.latitude);
    const deltaLatRad = toRadians(coord2.latitude - coord1.latitude);
    const deltaLngRad = toRadians(coord2.longitude - coord1.longitude);
    // Haversine formula
    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // Distance in kilometers
    let distance = EARTH_RADIUS_KM * c;
    // Convert to miles if requested
    if (unit === 'miles') {
        distance *= KM_TO_MILES;
    }
    // Round to specified precision
    return Math.round(distance * Math.pow(10, precision)) / Math.pow(10, precision);
}
/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
/**
 * Convert radians to degrees
 * @param radians Angle in radians
 * @returns Angle in degrees
 */
function toDegrees(radians) {
    return radians * (180 / Math.PI);
}
/**
 * Validate if coordinates are valid
 * @param coordinates Coordinates to validate
 * @returns True if coordinates are valid
 */
function isValidCoordinates(coordinates) {
    const { latitude, longitude } = coordinates;
    return (typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180 &&
        !isNaN(latitude) &&
        !isNaN(longitude));
}
/**
 * Check if coordinates are within Australia's bounds
 * @param coordinates Coordinates to check
 * @returns True if coordinates are within Australia
 */
function isWithinAustralia(coordinates) {
    if (!isValidCoordinates(coordinates)) {
        return false;
    }
    const { latitude, longitude } = coordinates;
    // Approximate bounds of Australia
    const australiaBounds = {
        north: -9, // Cape York, Queensland
        south: -55, // Heard Island (including territories)
        east: 169, // Norfolk Island
        west: 96, // Western Australia coast
    };
    return (latitude <= australiaBounds.north &&
        latitude >= australiaBounds.south &&
        longitude <= australiaBounds.east &&
        longitude >= australiaBounds.west);
}
/**
 * Calculate the center point between multiple coordinates
 * @param coordinates Array of coordinates
 * @returns Center coordinate
 */
function calculateCenterPoint(coordinates) {
    if (coordinates.length === 0) {
        return null;
    }
    if (coordinates.length === 1) {
        return coordinates[0];
    }
    let x = 0;
    let y = 0;
    let z = 0;
    coordinates.forEach(coord => {
        const latRad = toRadians(coord.latitude);
        const lngRad = toRadians(coord.longitude);
        x += Math.cos(latRad) * Math.cos(lngRad);
        y += Math.cos(latRad) * Math.sin(lngRad);
        z += Math.sin(latRad);
    });
    const total = coordinates.length;
    x /= total;
    y /= total;
    z /= total;
    const centralLng = Math.atan2(y, x);
    const centralSquareRoot = Math.sqrt(x * x + y * y);
    const centralLat = Math.atan2(z, centralSquareRoot);
    return {
        latitude: toDegrees(centralLat),
        longitude: toDegrees(centralLng),
    };
}
/**
 * Calculate bounds that encompass all coordinates with optional padding
 * @param coordinates Array of coordinates
 * @param paddingKm Optional padding in kilometers
 * @returns Location bounds
 */
function calculateBounds(coordinates, paddingKm = 0) {
    if (coordinates.length === 0) {
        return null;
    }
    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLng = coordinates[0].longitude;
    let maxLng = coordinates[0].longitude;
    coordinates.forEach(coord => {
        minLat = Math.min(minLat, coord.latitude);
        maxLat = Math.max(maxLat, coord.latitude);
        minLng = Math.min(minLng, coord.longitude);
        maxLng = Math.max(maxLng, coord.longitude);
    });
    // Apply padding if specified
    if (paddingKm > 0) {
        // Approximate degrees per kilometer (varies by latitude)
        const latPadding = paddingKm / 111; // ~111 km per degree of latitude
        const lngPadding = paddingKm / (111 * Math.cos(toRadians((minLat + maxLat) / 2)));
        minLat -= latPadding;
        maxLat += latPadding;
        minLng -= lngPadding;
        maxLng += lngPadding;
    }
    return {
        southwest: { latitude: minLat, longitude: minLng },
        northeast: { latitude: maxLat, longitude: maxLng },
    };
}
/**
 * Check if a coordinate is within given bounds
 * @param coordinate Coordinate to check
 * @param bounds Location bounds
 * @returns True if coordinate is within bounds
 */
function isWithinBounds(coordinate, bounds) {
    return (coordinate.latitude >= bounds.southwest.latitude &&
        coordinate.latitude <= bounds.northeast.latitude &&
        coordinate.longitude >= bounds.southwest.longitude &&
        coordinate.longitude <= bounds.northeast.longitude);
}
/**
 * Find coordinates within a radius from a center point
 * @param center Center coordinate
 * @param coordinates Array of coordinates to filter
 * @param radiusKm Radius in kilometers
 * @returns Filtered coordinates within radius
 */
function findWithinRadius(center, coordinates, radiusKm) {
    return coordinates
        .map(item => ({
        ...item,
        distance: calculateDistance(center, item.coordinates),
    }))
        .filter(item => item.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
}
/**
 * Sort coordinates by distance from a reference point
 * @param referencePoint Reference coordinate
 * @param coordinates Array of coordinates to sort
 * @returns Sorted array with distances
 */
function sortByDistance(referencePoint, coordinates) {
    return coordinates
        .map(item => ({
        ...item,
        distance: calculateDistance(referencePoint, item.coordinates),
    }))
        .sort((a, b) => a.distance - b.distance);
}
/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @param unit Display unit
 * @returns Formatted distance string
 */
function formatDistance(distance, unit = 'km') {
    const displayDistance = unit === 'miles' ? distance * KM_TO_MILES : distance;
    const unitLabel = unit === 'miles' ? 'mi' : 'km';
    if (displayDistance < 1) {
        const meters = Math.round(displayDistance * 1000);
        return `${meters}m`;
    }
    if (displayDistance < 10) {
        return `${displayDistance.toFixed(1)} ${unitLabel}`;
    }
    return `${Math.round(displayDistance)} ${unitLabel}`;
}
/**
 * Convert PostGIS POINT string to coordinates
 * @param pointString PostGIS POINT string (e.g., "POINT(151.2093 -33.8688)")
 * @returns Coordinates object or null if invalid
 */
function parsePostGISPoint(pointString) {
    if (!pointString || typeof pointString !== 'string') {
        return null;
    }
    // Match POINT(longitude latitude) format
    const match = pointString.match(/POINT\s*\(\s*([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)\s*\)/i);
    if (!match) {
        return null;
    }
    const longitude = parseFloat(match[1]);
    const latitude = parseFloat(match[2]);
    const coordinates = { latitude, longitude };
    return isValidCoordinates(coordinates) ? coordinates : null;
}
/**
 * Convert coordinates to PostGIS POINT string
 * @param coordinates Coordinates to convert
 * @returns PostGIS POINT string
 */
function toPostGISPoint(coordinates) {
    if (!isValidCoordinates(coordinates)) {
        throw new Error('Invalid coordinates provided');
    }
    return `POINT(${coordinates.longitude} ${coordinates.latitude})`;
}
/**
 * Get default location for the application (Australia center)
 * @returns Default coordinates
 */
function getDefaultLocation() {
    return { ...location_1.DEFAULT_AUSTRALIA_LOCATION };
}
