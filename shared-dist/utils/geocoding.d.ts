/**
 * Geocoding utilities for converting between addresses and coordinates
 */
import type { Coordinates, GeocodingResult, GeocodingConfig } from '../types/location';
/**
 * Geocode an address to coordinates using the specified provider
 * @param address Address string to geocode
 * @param config Geocoding configuration
 * @returns Geocoding result with coordinates and location data
 */
export declare function geocodeAddress(address: string, config: GeocodingConfig): Promise<GeocodingResult>;
/**
 * Reverse geocode coordinates to an address
 * @param coordinates Coordinates to reverse geocode
 * @param config Geocoding configuration
 * @returns Geocoding result with address data
 */
export declare function reverseGeocode(coordinates: Coordinates, config: GeocodingConfig): Promise<GeocodingResult>;
/**
 * Validate and clean address string for geocoding
 * @param address Address string to clean
 * @returns Cleaned address string
 */
export declare function cleanAddressForGeocoding(address: string): string;
/**
 * Check if geocoding result is within Australia
 * @param result Geocoding result to validate
 * @returns True if result is valid and within Australia
 */
export declare function isValidAustralianResult(result: GeocodingResult): boolean;
/**
 * Create a cache key for geocoding results
 * @param address Address string
 * @param provider Geocoding provider
 * @returns Cache key string
 */
export declare function createGeocodingCacheKey(address: string, provider: string): string;
