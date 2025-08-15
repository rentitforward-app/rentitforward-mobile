"use strict";
/**
 * Location-related types for geolocation and mapping functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAJOR_AUSTRALIAN_CITIES = exports.DEFAULT_AUSTRALIA_LOCATION = exports.AUSTRALIAN_STATES = void 0;
/**
 * Australian states and territories
 */
exports.AUSTRALIAN_STATES = [
    { code: 'NSW', name: 'New South Wales' },
    { code: 'VIC', name: 'Victoria' },
    { code: 'QLD', name: 'Queensland' },
    { code: 'WA', name: 'Western Australia' },
    { code: 'SA', name: 'South Australia' },
    { code: 'TAS', name: 'Tasmania' },
    { code: 'ACT', name: 'Australian Capital Territory' },
    { code: 'NT', name: 'Northern Territory' },
];
/**
 * Default location for Australia (geographic center)
 */
exports.DEFAULT_AUSTRALIA_LOCATION = {
    latitude: -25.2744,
    longitude: 133.7751,
};
/**
 * Major Australian cities with coordinates
 */
exports.MAJOR_AUSTRALIAN_CITIES = {
    sydney: { latitude: -33.8688, longitude: 151.2093, name: 'Sydney', state: 'NSW' },
    melbourne: { latitude: -37.8136, longitude: 144.9631, name: 'Melbourne', state: 'VIC' },
    brisbane: { latitude: -27.4698, longitude: 153.0251, name: 'Brisbane', state: 'QLD' },
    perth: { latitude: -31.9505, longitude: 115.8605, name: 'Perth', state: 'WA' },
    adelaide: { latitude: -34.9285, longitude: 138.6007, name: 'Adelaide', state: 'SA' },
    canberra: { latitude: -35.2809, longitude: 149.1300, name: 'Canberra', state: 'ACT' },
    hobart: { latitude: -42.8821, longitude: 147.3272, name: 'Hobart', state: 'TAS' },
    darwin: { latitude: -12.4634, longitude: 130.8456, name: 'Darwin', state: 'NT' },
};
