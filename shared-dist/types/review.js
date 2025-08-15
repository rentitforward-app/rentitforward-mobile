"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewTagColor = exports.getReviewTagLabel = exports.ReviewNotificationSchema = exports.ReviewStatsSchema = exports.ReviewFilterSchema = exports.ReviewResponseSchema = exports.UpdateReviewSchema = exports.CreateReviewSchema = exports.ReviewSchema = exports.ReviewTag = exports.ReviewType = void 0;
const zod_1 = require("zod");
// Review Types
var ReviewType;
(function (ReviewType) {
    ReviewType["RENTER_TO_OWNER"] = "renter_to_owner";
    ReviewType["OWNER_TO_RENTER"] = "owner_to_renter";
})(ReviewType || (exports.ReviewType = ReviewType = {}));
var ReviewTag;
(function (ReviewTag) {
    // Positive tags
    ReviewTag["EXCELLENT_COMMUNICATION"] = "excellent_communication";
    ReviewTag["CLEAN_ITEM"] = "clean_item";
    ReviewTag["AS_DESCRIBED"] = "as_described";
    ReviewTag["EASY_PICKUP"] = "easy_pickup";
    ReviewTag["FLEXIBLE"] = "flexible";
    ReviewTag["RESPONSIVE"] = "responsive";
    ReviewTag["RELIABLE"] = "reliable";
    ReviewTag["FRIENDLY"] = "friendly";
    ReviewTag["PROFESSIONAL"] = "professional";
    ReviewTag["GREAT_VALUE"] = "great_value";
    // Neutral/Improvement tags
    ReviewTag["LATE_RESPONSE"] = "late_response";
    ReviewTag["ITEM_CONDITION_OKAY"] = "item_condition_okay";
    ReviewTag["PICKUP_DELAYED"] = "pickup_delayed";
    ReviewTag["COMMUNICATION_UNCLEAR"] = "communication_unclear";
    // Negative tags (rare, for serious issues)
    ReviewTag["ITEM_NOT_AS_DESCRIBED"] = "item_not_as_described";
    ReviewTag["POOR_CONDITION"] = "poor_condition";
    ReviewTag["DIFFICULT_COMMUNICATION"] = "difficult_communication";
    ReviewTag["UNRELIABLE"] = "unreliable";
})(ReviewTag || (exports.ReviewTag = ReviewTag = {}));
// Review Schema
exports.ReviewSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    bookingId: zod_1.z.string().uuid(),
    reviewerId: zod_1.z.string().uuid(),
    revieweeId: zod_1.z.string().uuid(),
    type: zod_1.z.nativeEnum(ReviewType),
    // Review Content
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().min(10).max(1000).optional(),
    tags: zod_1.z.array(zod_1.z.nativeEnum(ReviewTag)).max(5).default([]),
    // Optional detailed ratings
    detailedRatings: zod_1.z.object({
        communication: zod_1.z.number().min(1).max(5).optional(),
        reliability: zod_1.z.number().min(1).max(5).optional(),
        cleanliness: zod_1.z.number().min(1).max(5).optional(), // For items
        accuracy: zod_1.z.number().min(1).max(5).optional(), // How accurate the listing was
        experience: zod_1.z.number().min(1).max(5).optional() // Overall experience
    }).optional(),
    // Review Status
    isPublic: zod_1.z.boolean().default(true),
    isEdited: zod_1.z.boolean().default(false),
    editedAt: zod_1.z.string().datetime().optional(),
    // Response from reviewee
    response: zod_1.z.object({
        comment: zod_1.z.string().max(500),
        createdAt: zod_1.z.string().datetime()
    }).optional(),
    // Metadata
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// Create Review Schema
exports.CreateReviewSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid(),
    type: zod_1.z.nativeEnum(ReviewType),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().min(10).max(1000).optional(),
    tags: zod_1.z.array(zod_1.z.nativeEnum(ReviewTag)).max(5).default([]),
    detailedRatings: exports.ReviewSchema.shape.detailedRatings.optional(),
    isPublic: zod_1.z.boolean().default(true)
});
// Update Review Schema
exports.UpdateReviewSchema = zod_1.z.object({
    rating: zod_1.z.number().min(1).max(5).optional(),
    comment: zod_1.z.string().min(10).max(1000).optional(),
    tags: zod_1.z.array(zod_1.z.nativeEnum(ReviewTag)).max(5).optional(),
    detailedRatings: exports.ReviewSchema.shape.detailedRatings.optional(),
    isPublic: zod_1.z.boolean().optional()
});
// Review Response Schema
exports.ReviewResponseSchema = zod_1.z.object({
    reviewId: zod_1.z.string().uuid(),
    comment: zod_1.z.string().max(500)
});
// Review Filter Schema
exports.ReviewFilterSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid().optional(),
    reviewerId: zod_1.z.string().uuid().optional(),
    revieweeId: zod_1.z.string().uuid().optional(),
    listingId: zod_1.z.string().uuid().optional(),
    type: zod_1.z.nativeEnum(ReviewType).optional(),
    minRating: zod_1.z.number().min(1).max(5).optional(),
    maxRating: zod_1.z.number().min(1).max(5).optional(),
    hasComment: zod_1.z.boolean().optional(),
    isPublic: zod_1.z.boolean().optional(),
    searchText: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['newest', 'oldest', 'rating_high', 'rating_low']).default('newest'),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20)
});
// Review Statistics Schema
exports.ReviewStatsSchema = zod_1.z.object({
    totalReviews: zod_1.z.number().min(0),
    averageRating: zod_1.z.number().min(0).max(5),
    ratingDistribution: zod_1.z.object({
        1: zod_1.z.number().min(0),
        2: zod_1.z.number().min(0),
        3: zod_1.z.number().min(0),
        4: zod_1.z.number().min(0),
        5: zod_1.z.number().min(0)
    }),
    detailedAverages: zod_1.z.object({
        communication: zod_1.z.number().min(0).max(5).optional(),
        reliability: zod_1.z.number().min(0).max(5).optional(),
        cleanliness: zod_1.z.number().min(0).max(5).optional(),
        accuracy: zod_1.z.number().min(0).max(5).optional(),
        experience: zod_1.z.number().min(0).max(5).optional()
    }).optional(),
    mostUsedTags: zod_1.z.array(zod_1.z.object({
        tag: zod_1.z.nativeEnum(ReviewTag),
        count: zod_1.z.number().min(0)
    })).max(10).default([]),
    reviewsByType: zod_1.z.object({
        asRenter: zod_1.z.number().min(0),
        asOwner: zod_1.z.number().min(0)
    })
});
// Review Notification Schema
exports.ReviewNotificationSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid(),
    notificationType: zod_1.z.enum(['review_request', 'review_received', 'review_response']),
    recipientId: zod_1.z.string().uuid(),
    senderId: zod_1.z.string().uuid(),
    reviewId: zod_1.z.string().uuid().optional()
});
// Helper functions for display
const getReviewTagLabel = (tag) => {
    const labels = {
        [ReviewTag.EXCELLENT_COMMUNICATION]: 'Excellent Communication',
        [ReviewTag.CLEAN_ITEM]: 'Clean Item',
        [ReviewTag.AS_DESCRIBED]: 'As Described',
        [ReviewTag.EASY_PICKUP]: 'Easy Pickup',
        [ReviewTag.FLEXIBLE]: 'Flexible',
        [ReviewTag.RESPONSIVE]: 'Responsive',
        [ReviewTag.RELIABLE]: 'Reliable',
        [ReviewTag.FRIENDLY]: 'Friendly',
        [ReviewTag.PROFESSIONAL]: 'Professional',
        [ReviewTag.GREAT_VALUE]: 'Great Value',
        [ReviewTag.LATE_RESPONSE]: 'Late Response',
        [ReviewTag.ITEM_CONDITION_OKAY]: 'Item Condition Okay',
        [ReviewTag.PICKUP_DELAYED]: 'Pickup Delayed',
        [ReviewTag.COMMUNICATION_UNCLEAR]: 'Communication Unclear',
        [ReviewTag.ITEM_NOT_AS_DESCRIBED]: 'Not As Described',
        [ReviewTag.POOR_CONDITION]: 'Poor Condition',
        [ReviewTag.DIFFICULT_COMMUNICATION]: 'Difficult Communication',
        [ReviewTag.UNRELIABLE]: 'Unreliable'
    };
    return labels[tag];
};
exports.getReviewTagLabel = getReviewTagLabel;
const getReviewTagColor = (tag) => {
    const positiveColors = [
        ReviewTag.EXCELLENT_COMMUNICATION,
        ReviewTag.CLEAN_ITEM,
        ReviewTag.AS_DESCRIBED,
        ReviewTag.EASY_PICKUP,
        ReviewTag.FLEXIBLE,
        ReviewTag.RESPONSIVE,
        ReviewTag.RELIABLE,
        ReviewTag.FRIENDLY,
        ReviewTag.PROFESSIONAL,
        ReviewTag.GREAT_VALUE
    ];
    const negativeColors = [
        ReviewTag.ITEM_NOT_AS_DESCRIBED,
        ReviewTag.POOR_CONDITION,
        ReviewTag.DIFFICULT_COMMUNICATION,
        ReviewTag.UNRELIABLE
    ];
    if (positiveColors.includes(tag))
        return 'positive';
    if (negativeColors.includes(tag))
        return 'negative';
    return 'neutral';
};
exports.getReviewTagColor = getReviewTagColor;
