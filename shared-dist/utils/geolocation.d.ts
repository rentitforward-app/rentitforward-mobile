/**
 * Geolocation utilities for distance calculation and coordinate handling
 */
import type { Coordinates, DistanceCalculationOptions, LocationBounds } from '../types/location';
/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @param options Distance calculation options
 * @returns Distance in specified units (default: kilometers)
 */
export declare function calculateDistance(coord1: Coordinates, coord2: Coordinates, options?: DistanceCalculationOptions): number;
/**
 * Validate if coordinates are valid
 * @param coordinates Coordinates to validate
 * @returns True if coordinates are valid
 */
export declare function isValidCoordinates(coordinates: Coordinates): boolean;
/**
 * Check if coordinates are within Australia's bounds
 * @param coordinates Coordinates to check
 * @returns True if coordinates are within Australia
 */
export declare function isWithinAustralia(coordinates: Coordinates): boolean;
/**
 * Calculate the center point between multiple coordinates
 * @param coordinates Array of coordinates
 * @returns Center coordinate
 */
export declare function calculateCenterPoint(coordinates: Coordinates[]): Coordinates | null;
/**
 * Calculate bounds that encompass all coordinates with optional padding
 * @param coordinates Array of coordinates
 * @param paddingKm Optional padding in kilometers
 * @returns Location bounds
 */
export declare function calculateBounds(coordinates: Coordinates[], paddingKm?: number): LocationBounds | null;
/**
 * Check if a coordinate is within given bounds
 * @param coordinate Coordinate to check
 * @param bounds Location bounds
 * @returns True if coordinate is within bounds
 */
export declare function isWithinBounds(coordinate: Coordinates, bounds: LocationBounds): boolean;
/**
 * Find coordinates within a radius from a center point
 * @param center Center coordinate
 * @param coordinates Array of coordinates to filter
 * @param radiusKm Radius in kilometers
 * @returns Filtered coordinates within radius
 */
export declare function findWithinRadius(center: Coordinates, coordinates: {
    id: string;
    coordinates: Coordinates;
}[], radiusKm: number): {
    id: string;
    coordinates: Coordinates;
    distance: number;
}[];
/**
 * Sort coordinates by distance from a reference point
 * @param referencePoint Reference coordinate
 * @param coordinates Array of coordinates to sort
 * @returns Sorted array with distances
 */
export declare function sortByDistance<T extends {
    coordinates: Coordinates;
}>(referencePoint: Coordinates, coordinates: T[]): (T & {
    distance: number;
})[];
/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @param unit Display unit
 * @returns Formatted distance string
 */
export declare function formatDistance(distance: number, unit?: 'km' | 'miles'): string;
/**
 * Convert PostGIS POINT string to coordinates
 * @param pointString PostGIS POINT string (e.g., "POINT(151.2093 -33.8688)")
 * @returns Coordinates object or null if invalid
 */
export declare function parsePostGISPoint(pointString: string): Coordinates | null;
/**
 * Convert coordinates to PostGIS POINT string
 * @param coordinates Coordinates to convert
 * @returns PostGIS POINT string
 */
export declare function toPostGISPoint(coordinates: Coordinates): string;
/**
 * Get default location for the application (Australia center)
 * @returns Default coordinates
 */
export declare function getDefaultLocation(): Coordinates;
