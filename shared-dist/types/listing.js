"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingFilterSchema = exports.UpdateListingSchema = exports.CreateListingSchema = exports.ListingSchema = exports.PricingSchema = exports.AvailabilitySchema = exports.ListingImageSchema = exports.PricingType = exports.ListingCategory = exports.ListingCondition = exports.ListingStatus = void 0;
const zod_1 = require("zod");
// Listing Types
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["DRAFT"] = "draft";
    ListingStatus["ACTIVE"] = "active";
    ListingStatus["INACTIVE"] = "inactive";
    ListingStatus["SUSPENDED"] = "suspended";
    ListingStatus["DELETED"] = "deleted";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
var ListingCondition;
(function (ListingCondition) {
    ListingCondition["NEW"] = "new";
    ListingCondition["LIKE_NEW"] = "like_new";
    ListingCondition["EXCELLENT"] = "excellent";
    ListingCondition["GOOD"] = "good";
    ListingCondition["FAIR"] = "fair";
    ListingCondition["POOR"] = "poor";
})(ListingCondition || (exports.ListingCondition = ListingCondition = {}));
var ListingCategory;
(function (ListingCategory) {
    ListingCategory["TOOLS_DIY_EQUIPMENT"] = "tools_diy_equipment";
    ListingCategory["CAMERAS_PHOTOGRAPHY_GEAR"] = "cameras_photography_gear";
    ListingCategory["EVENT_PARTY_EQUIPMENT"] = "event_party_equipment";
    ListingCategory["CAMPING_OUTDOOR_GEAR"] = "camping_outdoor_gear";
    ListingCategory["TECH_ELECTRONICS"] = "tech_electronics";
    ListingCategory["VEHICLES_TRANSPORT"] = "vehicles_transport";
    ListingCategory["HOME_GARDEN_APPLIANCES"] = "home_garden_appliances";
    ListingCategory["SPORTS_FITNESS_EQUIPMENT"] = "sports_fitness_equipment";
    ListingCategory["MUSICAL_INSTRUMENTS_GEAR"] = "musical_instruments_gear";
    ListingCategory["COSTUMES_PROPS"] = "costumes_props";
    ListingCategory["MAKER_CRAFT_SUPPLIES"] = "maker_craft_supplies";
    ListingCategory["CLOTHING_SHOES_ACCESSORIES"] = "clothing_shoes_accessories";
})(ListingCategory || (exports.ListingCategory = ListingCategory = {}));
var PricingType;
(function (PricingType) {
    PricingType["DAILY"] = "daily";
    PricingType["WEEKLY"] = "weekly";
    PricingType["MONTHLY"] = "monthly";
    PricingType["HOURLY"] = "hourly";
})(PricingType || (exports.PricingType = PricingType = {}));
// Listing Image Schema
exports.ListingImageSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    url: zod_1.z.string().url(),
    thumbnail: zod_1.z.string().url().optional(),
    alt: zod_1.z.string().optional(),
    order: zod_1.z.number().min(0),
    uploadedAt: zod_1.z.string().datetime()
});
// Listing Availability Schema
exports.AvailabilitySchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    unavailableDates: zod_1.z.array(zod_1.z.string().datetime()).optional(),
    minimumRentalPeriod: zod_1.z.number().min(1).default(1), // in days
    maximumRentalPeriod: zod_1.z.number().min(1).optional(),
    advanceBookingDays: zod_1.z.number().min(0).default(0)
});
// Listing Pricing Schema
exports.PricingSchema = zod_1.z.object({
    basePrice: zod_1.z.number().min(0),
    currency: zod_1.z.string().default('AUD'),
    pricingType: zod_1.z.nativeEnum(PricingType).default(PricingType.DAILY),
    weeklyDiscount: zod_1.z.number().min(0).max(100).optional(),
    monthlyDiscount: zod_1.z.number().min(0).max(100).optional(),
    securityDeposit: zod_1.z.number().min(0).optional(),
    cleaningFee: zod_1.z.number().min(0).optional(),
    deliveryFee: zod_1.z.number().min(0).optional(),
    pickupFee: zod_1.z.number().min(0).optional()
});
// Main Listing Schema
exports.ListingSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    ownerId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1, 'Title is required').max(100),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters').max(2000),
    category: zod_1.z.nativeEnum(ListingCategory),
    condition: zod_1.z.nativeEnum(ListingCondition),
    brand: zod_1.z.string().optional(),
    model: zod_1.z.string().optional(),
    year: zod_1.z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
    specifications: zod_1.z.record(zod_1.z.string()).optional(),
    images: zod_1.z.array(exports.ListingImageSchema).min(1, 'At least one image is required'),
    pricing: exports.PricingSchema,
    availability: exports.AvailabilitySchema,
    location: zod_1.z.object({
        address: zod_1.z.string(),
        city: zod_1.z.string(),
        state: zod_1.z.string(),
        postcode: zod_1.z.string(),
        country: zod_1.z.string().default('Australia'),
        coordinates: zod_1.z.object({
            lat: zod_1.z.number(),
            lng: zod_1.z.number()
        }),
        deliveryRadius: zod_1.z.number().min(0).optional(), // in km
        pickupAvailable: zod_1.z.boolean().default(true),
        deliveryAvailable: zod_1.z.boolean().default(false)
    }),
    features: zod_1.z.array(zod_1.z.string()).optional(),
    includedItems: zod_1.z.array(zod_1.z.string()).optional(),
    requirements: zod_1.z.array(zod_1.z.string()).optional(),
    restrictions: zod_1.z.array(zod_1.z.string()).optional(),
    instructions: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(ListingStatus).default(ListingStatus.DRAFT),
    viewCount: zod_1.z.number().min(0).default(0),
    favoriteCount: zod_1.z.number().min(0).default(0),
    bookingCount: zod_1.z.number().min(0).default(0),
    rating: zod_1.z.number().min(0).max(5).default(0),
    reviewCount: zod_1.z.number().min(0).default(0),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    publishedAt: zod_1.z.string().datetime().optional(),
    featuredUntil: zod_1.z.string().datetime().optional(),
    lastBookedAt: zod_1.z.string().datetime().optional()
});
// Listing Creation Schema
exports.CreateListingSchema = exports.ListingSchema.omit({
    id: true,
    ownerId: true,
    status: true,
    viewCount: true,
    favoriteCount: true,
    bookingCount: true,
    rating: true,
    reviewCount: true,
    createdAt: true,
    updatedAt: true,
    publishedAt: true,
    lastBookedAt: true
});
// Listing Update Schema
exports.UpdateListingSchema = exports.CreateListingSchema.partial();
// Listing Search/Filter Schema
exports.ListingFilterSchema = zod_1.z.object({
    category: zod_1.z.nativeEnum(ListingCategory).optional(),
    minPrice: zod_1.z.number().min(0).optional(),
    maxPrice: zod_1.z.number().min(0).optional(),
    condition: zod_1.z.array(zod_1.z.nativeEnum(ListingCondition)).optional(),
    location: zod_1.z.object({
        lat: zod_1.z.number(),
        lng: zod_1.z.number(),
        radius: zod_1.z.number().min(0).default(10) // km
    }).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    deliveryAvailable: zod_1.z.boolean().optional(),
    pickupAvailable: zod_1.z.boolean().optional(),
    features: zod_1.z.array(zod_1.z.string()).optional(),
    sortBy: zod_1.z.enum(['relevance', 'price_low', 'price_high', 'newest', 'rating', 'distance']).default('relevance'),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20)
});
