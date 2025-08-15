import { z } from 'zod';
export declare enum ReviewType {
    RENTER_TO_OWNER = "renter_to_owner",
    OWNER_TO_RENTER = "owner_to_renter"
}
export declare enum ReviewTag {
    EXCELLENT_COMMUNICATION = "excellent_communication",
    CLEAN_ITEM = "clean_item",
    AS_DESCRIBED = "as_described",
    EASY_PICKUP = "easy_pickup",
    FLEXIBLE = "flexible",
    RESPONSIVE = "responsive",
    RELIABLE = "reliable",
    FRIENDLY = "friendly",
    PROFESSIONAL = "professional",
    GREAT_VALUE = "great_value",
    LATE_RESPONSE = "late_response",
    ITEM_CONDITION_OKAY = "item_condition_okay",
    PICKUP_DELAYED = "pickup_delayed",
    COMMUNICATION_UNCLEAR = "communication_unclear",
    ITEM_NOT_AS_DESCRIBED = "item_not_as_described",
    POOR_CONDITION = "poor_condition",
    DIFFICULT_COMMUNICATION = "difficult_communication",
    UNRELIABLE = "unreliable"
}
export declare const ReviewSchema: z.ZodObject<{
    id: z.ZodString;
    bookingId: z.ZodString;
    reviewerId: z.ZodString;
    revieweeId: z.ZodString;
    type: z.ZodNativeEnum<typeof ReviewType>;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodNativeEnum<typeof ReviewTag>, "many">>;
    detailedRatings: z.ZodOptional<z.ZodObject<{
        communication: z.ZodOptional<z.ZodNumber>;
        reliability: z.ZodOptional<z.ZodNumber>;
        cleanliness: z.ZodOptional<z.ZodNumber>;
        accuracy: z.ZodOptional<z.ZodNumber>;
        experience: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    }, {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    }>>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    isEdited: z.ZodDefault<z.ZodBoolean>;
    editedAt: z.ZodOptional<z.ZodString>;
    response: z.ZodOptional<z.ZodObject<{
        comment: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        comment: string;
    }, {
        createdAt: string;
        comment: string;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: ReviewType;
    createdAt: string;
    updatedAt: string;
    rating: number;
    tags: ReviewTag[];
    bookingId: string;
    reviewerId: string;
    revieweeId: string;
    isPublic: boolean;
    isEdited: boolean;
    comment?: string | undefined;
    detailedRatings?: {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    } | undefined;
    editedAt?: string | undefined;
    response?: {
        createdAt: string;
        comment: string;
    } | undefined;
}, {
    id: string;
    type: ReviewType;
    createdAt: string;
    updatedAt: string;
    rating: number;
    bookingId: string;
    reviewerId: string;
    revieweeId: string;
    tags?: ReviewTag[] | undefined;
    comment?: string | undefined;
    detailedRatings?: {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    } | undefined;
    isPublic?: boolean | undefined;
    isEdited?: boolean | undefined;
    editedAt?: string | undefined;
    response?: {
        createdAt: string;
        comment: string;
    } | undefined;
}>;
export declare const CreateReviewSchema: z.ZodObject<{
    bookingId: z.ZodString;
    type: z.ZodNativeEnum<typeof ReviewType>;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodNativeEnum<typeof ReviewTag>, "many">>;
    detailedRatings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        communication: z.ZodOptional<z.ZodNumber>;
        reliability: z.ZodOptional<z.ZodNumber>;
        cleanliness: z.ZodOptional<z.ZodNumber>;
        accuracy: z.ZodOptional<z.ZodNumber>;
        experience: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    }, {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    }>>>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: ReviewType;
    rating: number;
    tags: ReviewTag[];
    bookingId: string;
    isPublic: boolean;
    comment?: string | undefined;
    detailedRatings?: {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    } | undefined;
}, {
    type: ReviewType;
    rating: number;
    bookingId: string;
    tags?: ReviewTag[] | undefined;
    comment?: string | undefined;
    detailedRatings?: {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    } | undefined;
    isPublic?: boolean | undefined;
}>;
export declare const UpdateReviewSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ReviewTag>, "many">>;
    detailedRatings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        communication: z.ZodOptional<z.ZodNumber>;
        reliability: z.ZodOptional<z.ZodNumber>;
        cleanliness: z.ZodOptional<z.ZodNumber>;
        accuracy: z.ZodOptional<z.ZodNumber>;
        experience: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    }, {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    }>>>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rating?: number | undefined;
    tags?: ReviewTag[] | undefined;
    comment?: string | undefined;
    detailedRatings?: {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    } | undefined;
    isPublic?: boolean | undefined;
}, {
    rating?: number | undefined;
    tags?: ReviewTag[] | undefined;
    comment?: string | undefined;
    detailedRatings?: {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    } | undefined;
    isPublic?: boolean | undefined;
}>;
export declare const ReviewResponseSchema: z.ZodObject<{
    reviewId: z.ZodString;
    comment: z.ZodString;
}, "strip", z.ZodTypeAny, {
    comment: string;
    reviewId: string;
}, {
    comment: string;
    reviewId: string;
}>;
export declare const ReviewFilterSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    reviewerId: z.ZodOptional<z.ZodString>;
    revieweeId: z.ZodOptional<z.ZodString>;
    listingId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof ReviewType>>;
    minRating: z.ZodOptional<z.ZodNumber>;
    maxRating: z.ZodOptional<z.ZodNumber>;
    hasComment: z.ZodOptional<z.ZodBoolean>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    searchText: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["newest", "oldest", "rating_high", "rating_low"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sortBy: "newest" | "oldest" | "rating_high" | "rating_low";
    page: number;
    limit: number;
    listingId?: string | undefined;
    type?: ReviewType | undefined;
    reviewerId?: string | undefined;
    revieweeId?: string | undefined;
    isPublic?: boolean | undefined;
    userId?: string | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
    hasComment?: boolean | undefined;
    searchText?: string | undefined;
}, {
    listingId?: string | undefined;
    type?: ReviewType | undefined;
    sortBy?: "newest" | "oldest" | "rating_high" | "rating_low" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    reviewerId?: string | undefined;
    revieweeId?: string | undefined;
    isPublic?: boolean | undefined;
    userId?: string | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
    hasComment?: boolean | undefined;
    searchText?: string | undefined;
}>;
export declare const ReviewStatsSchema: z.ZodObject<{
    totalReviews: z.ZodNumber;
    averageRating: z.ZodNumber;
    ratingDistribution: z.ZodObject<{
        1: z.ZodNumber;
        2: z.ZodNumber;
        3: z.ZodNumber;
        4: z.ZodNumber;
        5: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        1: number;
        2: number;
        5: number;
        4: number;
        3: number;
    }, {
        1: number;
        2: number;
        5: number;
        4: number;
        3: number;
    }>;
    detailedAverages: z.ZodOptional<z.ZodObject<{
        communication: z.ZodOptional<z.ZodNumber>;
        reliability: z.ZodOptional<z.ZodNumber>;
        cleanliness: z.ZodOptional<z.ZodNumber>;
        accuracy: z.ZodOptional<z.ZodNumber>;
        experience: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    }, {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    }>>;
    mostUsedTags: z.ZodDefault<z.ZodArray<z.ZodObject<{
        tag: z.ZodNativeEnum<typeof ReviewTag>;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        tag: ReviewTag;
        count: number;
    }, {
        tag: ReviewTag;
        count: number;
    }>, "many">>;
    reviewsByType: z.ZodObject<{
        asRenter: z.ZodNumber;
        asOwner: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        asRenter: number;
        asOwner: number;
    }, {
        asRenter: number;
        asOwner: number;
    }>;
}, "strip", z.ZodTypeAny, {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        1: number;
        2: number;
        5: number;
        4: number;
        3: number;
    };
    mostUsedTags: {
        tag: ReviewTag;
        count: number;
    }[];
    reviewsByType: {
        asRenter: number;
        asOwner: number;
    };
    detailedAverages?: {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    } | undefined;
}, {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        1: number;
        2: number;
        5: number;
        4: number;
        3: number;
    };
    reviewsByType: {
        asRenter: number;
        asOwner: number;
    };
    detailedAverages?: {
        communication?: number | undefined;
        reliability?: number | undefined;
        cleanliness?: number | undefined;
        accuracy?: number | undefined;
        experience?: number | undefined;
    } | undefined;
    mostUsedTags?: {
        tag: ReviewTag;
        count: number;
    }[] | undefined;
}>;
export declare const ReviewNotificationSchema: z.ZodObject<{
    bookingId: z.ZodString;
    notificationType: z.ZodEnum<["review_request", "review_received", "review_response"]>;
    recipientId: z.ZodString;
    senderId: z.ZodString;
    reviewId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    bookingId: string;
    notificationType: "review_request" | "review_received" | "review_response";
    recipientId: string;
    senderId: string;
    reviewId?: string | undefined;
}, {
    bookingId: string;
    notificationType: "review_request" | "review_received" | "review_response";
    recipientId: string;
    senderId: string;
    reviewId?: string | undefined;
}>;
export type Review = z.infer<typeof ReviewSchema>;
export type CreateReview = z.infer<typeof CreateReviewSchema>;
export type UpdateReview = z.infer<typeof UpdateReviewSchema>;
export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;
export type ReviewFilter = z.infer<typeof ReviewFilterSchema>;
export type ReviewStats = z.infer<typeof ReviewStatsSchema>;
export type ReviewNotification = z.infer<typeof ReviewNotificationSchema>;
export type ReviewWithUser = Review & {
    reviewer: {
        id: string;
        name: string;
        avatar?: string;
    };
    reviewee: {
        id: string;
        name: string;
        avatar?: string;
    };
    booking: {
        id: string;
        listingTitle: string;
        startDate: string;
        endDate: string;
    };
};
export type ReviewSummary = {
    id: string;
    rating: number;
    comment?: string;
    tags: ReviewTag[];
    reviewer: {
        name: string;
        avatar?: string;
    };
    createdAt: string;
};
export declare const getReviewTagLabel: (tag: ReviewTag) => string;
export declare const getReviewTagColor: (tag: ReviewTag) => "positive" | "neutral" | "negative";
