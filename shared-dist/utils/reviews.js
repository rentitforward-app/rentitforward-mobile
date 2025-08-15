"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewNotifications = exports.reviewDisplay = exports.reviewFilters = exports.reviewStats = exports.reviewFormatting = exports.reviewValidation = void 0;
const review_1 = require("../types/review");
// Review validation utilities
exports.reviewValidation = {
    canEditReview: (review) => {
        const reviewCreatedAt = new Date(review.createdAt);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - reviewCreatedAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceCreation <= 24;
    },
    canDeleteReview: (review) => {
        const reviewCreatedAt = new Date(review.createdAt);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - reviewCreatedAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceCreation <= 1;
    },
    isValidRating: (rating) => {
        return Number.isInteger(rating) && rating >= 1 && rating <= 5;
    },
    isValidComment: (comment) => {
        return comment.length >= 10 && comment.length <= 1000;
    },
    maxTagsAllowed: 5,
    isValidTagSelection: (tags) => {
        return tags.length <= exports.reviewValidation.maxTagsAllowed;
    }
};
// Review formatting utilities
exports.reviewFormatting = {
    formatRating: (rating) => {
        return rating.toFixed(1);
    },
    formatRelativeTime: (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
        if (diffInSeconds < 60) {
            return 'Just now';
        }
        else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }
        else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
        else if (diffInSeconds < 31536000) {
            const months = Math.floor(diffInSeconds / 2592000);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }
        else {
            const years = Math.floor(diffInSeconds / 31536000);
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
    },
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    generateStarRating: (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        return '★'.repeat(fullStars) +
            (hasHalfStar ? '☆' : '') +
            '☆'.repeat(emptyStars);
    },
    truncateComment: (comment, maxLength = 150) => {
        if (comment.length <= maxLength)
            return comment;
        return comment.substring(0, maxLength).trim() + '...';
    }
};
// Review statistics calculations
exports.reviewStats = {
    calculateAverageRating: (reviews) => {
        if (reviews.length === 0)
            return 0;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return totalRating / reviews.length;
    },
    calculateRatingDistribution: (reviews) => {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
                distribution[review.rating]++;
            }
        });
        return distribution;
    },
    calculateDetailedAverages: (reviews) => {
        const validReviews = reviews.filter(r => r.detailedRatings);
        if (validReviews.length === 0)
            return undefined;
        const totals = {
            communication: 0,
            reliability: 0,
            cleanliness: 0,
            accuracy: 0,
            experience: 0
        };
        const counts = {
            communication: 0,
            reliability: 0,
            cleanliness: 0,
            accuracy: 0,
            experience: 0
        };
        validReviews.forEach(review => {
            if (review.detailedRatings) {
                Object.entries(review.detailedRatings).forEach(([key, value]) => {
                    if (value && key in totals) {
                        totals[key] += value;
                        counts[key]++;
                    }
                });
            }
        });
        const averages = {};
        Object.keys(totals).forEach(key => {
            const count = counts[key];
            if (count > 0) {
                averages[key] = totals[key] / count;
            }
        });
        return averages;
    },
    getMostUsedTags: (reviews, limit = 10) => {
        const tagCounts = {};
        reviews.forEach(review => {
            review.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag: tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },
    generateReviewStats: (reviews) => {
        return {
            totalReviews: reviews.length,
            averageRating: exports.reviewStats.calculateAverageRating(reviews),
            ratingDistribution: exports.reviewStats.calculateRatingDistribution(reviews),
            detailedAverages: exports.reviewStats.calculateDetailedAverages(reviews),
            mostUsedTags: exports.reviewStats.getMostUsedTags(reviews),
            reviewsByType: {
                asRenter: reviews.filter(r => r.type === review_1.ReviewType.OWNER_TO_RENTER).length,
                asOwner: reviews.filter(r => r.type === review_1.ReviewType.RENTER_TO_OWNER).length
            }
        };
    }
};
// Review filtering and sorting
exports.reviewFilters = {
    filterByRating: (reviews, minRating, maxRating) => {
        return reviews.filter(review => {
            if (minRating && review.rating < minRating)
                return false;
            if (maxRating && review.rating > maxRating)
                return false;
            return true;
        });
    },
    filterByType: (reviews, type) => {
        return reviews.filter(review => review.type === type);
    },
    filterByTags: (reviews, tags) => {
        return reviews.filter(review => tags.some(tag => review.tags.includes(tag)));
    },
    filterByDateRange: (reviews, startDate, endDate) => {
        return reviews.filter(review => {
            const reviewDate = new Date(review.createdAt);
            if (startDate && reviewDate < new Date(startDate))
                return false;
            if (endDate && reviewDate > new Date(endDate))
                return false;
            return true;
        });
    },
    sortReviews: (reviews, sortBy) => {
        const sorted = [...reviews];
        switch (sortBy) {
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case 'rating_high':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'rating_low':
                return sorted.sort((a, b) => a.rating - b.rating);
            default: // newest
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }
};
// Review display helpers
exports.reviewDisplay = {
    getReviewTypeLabel: (type) => {
        return type === review_1.ReviewType.RENTER_TO_OWNER ? 'Renter to Owner' : 'Owner to Renter';
    },
    getReviewTitle: (type, reviewerName) => {
        const role = type === review_1.ReviewType.RENTER_TO_OWNER ? 'renter' : 'owner';
        return `Review from ${reviewerName} (as ${role})`;
    },
    shouldShowDetailedRatings: (review) => {
        return !!(review.detailedRatings && Object.keys(review.detailedRatings).length > 0);
    },
    getTagsByColor: (tags) => {
        return {
            positive: tags.filter(tag => (0, review_1.getReviewTagColor)(tag) === 'positive'),
            neutral: tags.filter(tag => (0, review_1.getReviewTagColor)(tag) === 'neutral'),
            negative: tags.filter(tag => (0, review_1.getReviewTagColor)(tag) === 'negative')
        };
    },
    getRatingColor: (rating) => {
        if (rating >= 4)
            return 'green';
        if (rating >= 3)
            return 'yellow';
        return 'red';
    },
    getRatingEmoji: (rating) => {
        if (rating >= 4.5)
            return '😊';
        if (rating >= 4)
            return '🙂';
        if (rating >= 3)
            return '😐';
        if (rating >= 2)
            return '🙁';
        return '😞';
    }
};
// Review notification helpers
exports.reviewNotifications = {
    generateReviewRequestMessage: (bookingTitle, reviewerRole) => {
        return `Please review your recent ${reviewerRole === 'renter' ? 'rental' : 'booking'} of "${bookingTitle}"`;
    },
    generateReviewReceivedMessage: (reviewerName, rating) => {
        return `${reviewerName} left you a ${rating}-star review`;
    },
    generateReviewResponseMessage: (responderName) => {
        return `${responderName} responded to your review`;
    }
};
