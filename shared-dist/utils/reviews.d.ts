import { Review, ReviewTag, ReviewType, ReviewStats } from '../types/review';
export declare const reviewValidation: {
    canEditReview: (review: Review) => boolean;
    canDeleteReview: (review: Review) => boolean;
    isValidRating: (rating: number) => boolean;
    isValidComment: (comment: string) => boolean;
    maxTagsAllowed: number;
    isValidTagSelection: (tags: ReviewTag[]) => boolean;
};
export declare const reviewFormatting: {
    formatRating: (rating: number) => string;
    formatRelativeTime: (dateString: string) => string;
    formatDate: (dateString: string) => string;
    generateStarRating: (rating: number) => string;
    truncateComment: (comment: string, maxLength?: number) => string;
};
export declare const reviewStats: {
    calculateAverageRating: (reviews: Review[]) => number;
    calculateRatingDistribution: (reviews: Review[]) => {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
    calculateDetailedAverages: (reviews: Review[]) => {
        communication?: number;
        reliability?: number;
        cleanliness?: number;
        accuracy?: number;
        experience?: number;
    } | undefined;
    getMostUsedTags: (reviews: Review[], limit?: number) => {
        tag: ReviewTag;
        count: number;
    }[];
    generateReviewStats: (reviews: Review[]) => ReviewStats;
};
export declare const reviewFilters: {
    filterByRating: (reviews: Review[], minRating?: number, maxRating?: number) => Review[];
    filterByType: (reviews: Review[], type: ReviewType) => Review[];
    filterByTags: (reviews: Review[], tags: ReviewTag[]) => Review[];
    filterByDateRange: (reviews: Review[], startDate?: string, endDate?: string) => Review[];
    sortReviews: (reviews: Review[], sortBy: "newest" | "oldest" | "rating_high" | "rating_low") => Review[];
};
export declare const reviewDisplay: {
    getReviewTypeLabel: (type: ReviewType) => string;
    getReviewTitle: (type: ReviewType, reviewerName: string) => string;
    shouldShowDetailedRatings: (review: Review) => boolean;
    getTagsByColor: (tags: ReviewTag[]) => {
        positive: ReviewTag[];
        neutral: ReviewTag[];
        negative: ReviewTag[];
    };
    getRatingColor: (rating: number) => "green" | "yellow" | "red";
    getRatingEmoji: (rating: number) => string;
};
export declare const reviewNotifications: {
    generateReviewRequestMessage: (bookingTitle: string, reviewerRole: "renter" | "owner") => string;
    generateReviewReceivedMessage: (reviewerName: string, rating: number) => string;
    generateReviewResponseMessage: (responderName: string) => string;
};
