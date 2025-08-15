/**
 * Location-related types for geolocation and mapping functionality
 */
export interface Coordinates {
    latitude: number;
    longitude: number;
}
export interface Location extends Coordinates {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}
export interface GeolocationPosition extends Coordinates {
    accuracy?: number;
    altitude?: number;
    heading?: number;
    speed?: number;
    timestamp?: number;
}
export interface GeolocationResult {
    success: boolean;
    location?: GeolocationPosition;
    error?: string;
}
export interface GeocodingResult {
    success: boolean;
    location?: Location;
    coordinates?: Coordinates;
    error?: string;
}
export interface DistanceCalculationOptions {
    unit?: 'km' | 'miles';
    precision?: number;
}
export interface ListingWithDistance {
    id: string;
    distance?: number;
    coordinates?: Coordinates;
}
export interface LocationBounds {
    northeast: Coordinates;
    southwest: Coordinates;
}
export interface LocationSearchParams {
    userLocation?: Coordinates;
    radius?: number;
    bounds?: LocationBounds;
    maxResults?: number;
}
/**
 * Configuration for geocoding services
 */
export interface GeocodingConfig {
    apiKey: string;
    provider: 'google' | 'mapbox' | 'nominatim';
    language?: string;
    region?: string;
}
/**
 * Australian states and territories
 */
export declare const AUSTRALIAN_STATES: readonly [{
    readonly code: "NSW";
    readonly name: "New South Wales";
}, {
    readonly code: "VIC";
    readonly name: "Victoria";
}, {
    readonly code: "QLD";
    readonly name: "Queensland";
}, {
    readonly code: "WA";
    readonly name: "Western Australia";
}, {
    readonly code: "SA";
    readonly name: "South Australia";
}, {
    readonly code: "TAS";
    readonly name: "Tasmania";
}, {
    readonly code: "ACT";
    readonly name: "Australian Capital Territory";
}, {
    readonly code: "NT";
    readonly name: "Northern Territory";
}];
export type AustralianStateCode = typeof AUSTRALIAN_STATES[number]['code'];
/**
 * Default location for Australia (geographic center)
 */
export declare const DEFAULT_AUSTRALIA_LOCATION: Coordinates;
/**
 * Major Australian cities with coordinates
 */
export declare const MAJOR_AUSTRALIAN_CITIES: {
    readonly sydney: {
        readonly latitude: -33.8688;
        readonly longitude: 151.2093;
        readonly name: "Sydney";
        readonly state: "NSW";
    };
    readonly melbourne: {
        readonly latitude: -37.8136;
        readonly longitude: 144.9631;
        readonly name: "Melbourne";
        readonly state: "VIC";
    };
    readonly brisbane: {
        readonly latitude: -27.4698;
        readonly longitude: 153.0251;
        readonly name: "Brisbane";
        readonly state: "QLD";
    };
    readonly perth: {
        readonly latitude: -31.9505;
        readonly longitude: 115.8605;
        readonly name: "Perth";
        readonly state: "WA";
    };
    readonly adelaide: {
        readonly latitude: -34.9285;
        readonly longitude: 138.6007;
        readonly name: "Adelaide";
        readonly state: "SA";
    };
    readonly canberra: {
        readonly latitude: -35.2809;
        readonly longitude: 149.13;
        readonly name: "Canberra";
        readonly state: "ACT";
    };
    readonly hobart: {
        readonly latitude: -42.8821;
        readonly longitude: 147.3272;
        readonly name: "Hobart";
        readonly state: "TAS";
    };
    readonly darwin: {
        readonly latitude: -12.4634;
        readonly longitude: 130.8456;
        readonly name: "Darwin";
        readonly state: "NT";
    };
};
