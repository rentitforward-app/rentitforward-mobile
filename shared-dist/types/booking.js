"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingFilterSchema = exports.UpdateBookingSchema = exports.CreateBookingSchema = exports.BookingSchema = exports.DeliveryMethod = exports.BookingCancellationReason = exports.BookingStatus = void 0;
const zod_1 = require("zod");
// Booking Types (Updated January 2025 for owner approval workflow)
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["PENDING_PAYMENT"] = "pending_payment";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["ACTIVE"] = "active";
    BookingStatus["COMPLETED"] = "completed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["REJECTED"] = "rejected";
    BookingStatus["DISPUTED"] = "disputed";
    BookingStatus["REFUNDED"] = "refunded"; // Payment refunded
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var BookingCancellationReason;
(function (BookingCancellationReason) {
    BookingCancellationReason["USER_REQUESTED"] = "user_requested";
    BookingCancellationReason["OWNER_CANCELLED"] = "owner_cancelled";
    BookingCancellationReason["ITEM_UNAVAILABLE"] = "item_unavailable";
    BookingCancellationReason["PAYMENT_FAILED"] = "payment_failed";
    BookingCancellationReason["POLICY_VIOLATION"] = "policy_violation";
    BookingCancellationReason["DAMAGE_REPORTED"] = "damage_reported";
    BookingCancellationReason["OTHER"] = "other";
})(BookingCancellationReason || (exports.BookingCancellationReason = BookingCancellationReason = {}));
var DeliveryMethod;
(function (DeliveryMethod) {
    DeliveryMethod["PICKUP"] = "pickup";
    DeliveryMethod["DELIVERY"] = "delivery";
    DeliveryMethod["MEETUP"] = "meetup";
})(DeliveryMethod || (exports.DeliveryMethod = DeliveryMethod = {}));
// Booking Schema
exports.BookingSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    listingId: zod_1.z.string().uuid(),
    ownerId: zod_1.z.string().uuid(),
    renterId: zod_1.z.string().uuid(),
    status: zod_1.z.nativeEnum(BookingStatus).default(BookingStatus.PENDING),
    // Dates and Duration
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    durationDays: zod_1.z.number().min(1),
    // Pricing Breakdown
    pricing: zod_1.z.object({
        basePrice: zod_1.z.number().min(0),
        totalDays: zod_1.z.number().min(1),
        subtotal: zod_1.z.number().min(0),
        weeklyDiscount: zod_1.z.number().min(0).optional(),
        monthlyDiscount: zod_1.z.number().min(0).optional(),
        cleaningFee: zod_1.z.number().min(0).optional(),
        deliveryFee: zod_1.z.number().min(0).optional(),
        serviceFee: zod_1.z.number().min(0),
        securityDeposit: zod_1.z.number().min(0).optional(),
        tax: zod_1.z.number().min(0),
        total: zod_1.z.number().min(0),
        currency: zod_1.z.string().default('AUD')
    }),
    // Delivery Information
    delivery: zod_1.z.object({
        method: zod_1.z.nativeEnum(DeliveryMethod),
        pickupAddress: zod_1.z.string().optional(),
        deliveryAddress: zod_1.z.string().optional(),
        meetupLocation: zod_1.z.string().optional(),
        pickupTime: zod_1.z.string().datetime().optional(),
        deliveryTime: zod_1.z.string().datetime().optional(),
        returnTime: zod_1.z.string().datetime().optional(),
        notes: zod_1.z.string().optional()
    }),
    // Special Requirements
    specialRequests: zod_1.z.string().optional(),
    renterNotes: zod_1.z.string().optional(),
    ownerNotes: zod_1.z.string().optional(),
    // Status Tracking
    confirmedAt: zod_1.z.string().datetime().optional(),
    startedAt: zod_1.z.string().datetime().optional(),
    completedAt: zod_1.z.string().datetime().optional(),
    cancelledAt: zod_1.z.string().datetime().optional(),
    cancellationReason: zod_1.z.nativeEnum(BookingCancellationReason).optional(),
    cancellationNote: zod_1.z.string().optional(),
    // Communication
    lastMessageAt: zod_1.z.string().datetime().optional(),
    unreadMessagesCount: zod_1.z.number().min(0).default(0),
    // Reviews
    renterReviewId: zod_1.z.string().uuid().optional(),
    ownerReviewId: zod_1.z.string().uuid().optional(),
    // Metadata
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// Create Booking Schema
exports.CreateBookingSchema = zod_1.z.object({
    listingId: zod_1.z.string().uuid(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    delivery: exports.BookingSchema.shape.delivery,
    specialRequests: zod_1.z.string().optional(),
    renterNotes: zod_1.z.string().optional()
});
// Update Booking Schema
exports.UpdateBookingSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(BookingStatus).optional(),
    delivery: exports.BookingSchema.shape.delivery.partial().optional(),
    specialRequests: zod_1.z.string().optional(),
    renterNotes: zod_1.z.string().optional(),
    ownerNotes: zod_1.z.string().optional(),
    cancellationReason: zod_1.z.nativeEnum(BookingCancellationReason).optional(),
    cancellationNote: zod_1.z.string().optional()
});
// Booking Filter Schema
exports.BookingFilterSchema = zod_1.z.object({
    status: zod_1.z.array(zod_1.z.nativeEnum(BookingStatus)).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    ownerId: zod_1.z.string().uuid().optional(),
    renterId: zod_1.z.string().uuid().optional(),
    listingId: zod_1.z.string().uuid().optional(),
    sortBy: zod_1.z.enum(['newest', 'oldest', 'start_date', 'end_date', 'total']).default('newest'),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20)
});
