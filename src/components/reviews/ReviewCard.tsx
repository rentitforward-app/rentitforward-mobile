import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  type ReviewWithUser,
  getReviewTagLabel,
  getReviewTagColor,
  ReviewType,
} from 'rentitforward-shared/src/types/review';
import {
  reviewFormatting,
  reviewDisplay,
} from 'rentitforward-shared/src/utils/reviews';
import { colors, spacing, typography } from 'rentitforward-shared/src/design-system';

interface ReviewCardProps {
  review: ReviewWithUser;
  currentUserId?: string;
  showBookingInfo?: boolean;
  onEdit?: (review: ReviewWithUser) => void;
  onDelete?: (reviewId: string) => void;
  onRespond?: (reviewId: string) => void;
}

export function ReviewCard({
  review,
  currentUserId,
  showBookingInfo = false,
  onEdit,
  onDelete,
  onRespond,
}: ReviewCardProps) {
  const [showFullComment, setShowFullComment] = useState(false);
  const [showDetailedRatings, setShowDetailedRatings] = useState(false);

  const isReviewer = currentUserId === review.reviewerId;
  const isReviewee = currentUserId === review.revieweeId;
  const canEdit = isReviewer && onEdit;
  const canDelete = isReviewer && onDelete;
  const canRespond = isReviewee && onRespond && !review.response;

  const tagsByColor = reviewDisplay.getTagsByColor(review.tags);
  const hasDetailedRatings = reviewDisplay.shouldShowDetailedRatings(review);

  const comment = review.comment || '';
  const shouldTruncate = comment.length > 150;
  const displayComment = showFullComment ? comment : reviewFormatting.truncateComment(comment);

  const handleDelete = () => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete!(review.id),
        },
      ]
    );
  };

  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{ marginRight: spacing.sm }}>
            {review.reviewer.avatar ? (
              <Image
                source={{ uri: review.reviewer.avatar }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                }}
              />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: colors.gray[300],
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: colors.gray[600],
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.medium,
                  }}
                >
                  {review.reviewer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.medium,
                color: colors.gray[900],
              }}
            >
              {review.reviewer.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[500],
                }}
              >
                {reviewFormatting.formatRelativeTime(review.createdAt)}
              </Text>
              {review.isEdited && (
                <Text
                  style={{
                    fontSize: typography.sizes.xs,
                    color: colors.gray[400],
                    marginLeft: spacing.xs,
                  }}
                >
                  (edited)
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Actions Menu */}
        {(canEdit || canDelete || canRespond) && (
          <TouchableOpacity
            onPress={() => {
              const options = [];
              if (canEdit) options.push('Edit');
              if (canDelete) options.push('Delete');
              if (canRespond) options.push('Respond');
              options.push('Cancel');

              Alert.alert('Review Actions', 'Choose an action', [
                ...options.slice(0, -1).map((option) => ({
                  text: option,
                  onPress: () => {
                    if (option === 'Edit' && onEdit) onEdit(review);
                    if (option === 'Delete' && onDelete) handleDelete();
                    if (option === 'Respond' && onRespond) onRespond(review.id);
                  },
                })),
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
            style={{
              padding: spacing.xs,
            }}
          >
            <Text style={{ fontSize: 18, color: colors.gray[400] }}>⋯</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rating */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Text
              key={star}
              style={{
                fontSize: typography.sizes.lg,
                color: star <= review.rating ? '#FBBF24' : colors.gray[300],
                marginRight: 2,
              }}
            >
              ★
            </Text>
          ))}
        </View>
        <Text
          style={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            color: colors.gray[700],
            marginLeft: spacing.xs,
          }}
        >
          {reviewFormatting.formatRating(review.rating)}/5
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.gray[500],
            marginLeft: spacing.xs,
          }}
        >
          {reviewDisplay.getReviewTypeLabel(review.type)}
        </Text>
      </View>

      {/* Booking Info */}
      {showBookingInfo && (
        <View
          style={{
            backgroundColor: colors.gray[50],
            padding: spacing.sm,
            borderRadius: 8,
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600] }}>
            <Text style={{ fontWeight: typography.weights.medium }}>Booking:</Text> {review.booking.listingTitle}
          </Text>
          <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[500] }}>
            {reviewFormatting.formatDate(review.booking.startDate)} - {reviewFormatting.formatDate(review.booking.endDate)}
          </Text>
        </View>
      )}

      {/* Comment */}
      {comment && (
        <View style={{ marginBottom: spacing.md }}>
          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.gray[800],
              lineHeight: typography.lineHeights.relaxed,
            }}
          >
            {displayComment}
          </Text>
          {shouldTruncate && (
            <TouchableOpacity
              onPress={() => setShowFullComment(!showFullComment)}
              style={{ marginTop: spacing.xs }}
            >
              <Text
                style={{
                  fontSize: typography.sizes.sm,
                  color: colors.primary.green,
                }}
              >
                {showFullComment ? 'Show less' : 'Show more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Tags */}
      {review.tags.length > 0 && (
        <View style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {/* Positive tags */}
            {tagsByColor.positive.map((tag) => (
              <View
                key={tag}
                style={{
                  paddingHorizontal: spacing.xs,
                  paddingVertical: 4,
                  backgroundColor: '#D1FAE5',
                  borderColor: '#6EE7B7',
                  borderWidth: 1,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.sizes.xs,
                    color: '#065F46',
                  }}
                >
                  {getReviewTagLabel(tag)}
                </Text>
              </View>
            ))}
            {/* Neutral tags */}
            {tagsByColor.neutral.map((tag) => (
              <View
                key={tag}
                style={{
                  paddingHorizontal: spacing.xs,
                  paddingVertical: 4,
                  backgroundColor: '#FEF3C7',
                  borderColor: '#FCD34D',
                  borderWidth: 1,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.sizes.xs,
                    color: '#92400E',
                  }}
                >
                  {getReviewTagLabel(tag)}
                </Text>
              </View>
            ))}
            {/* Negative tags */}
            {tagsByColor.negative.map((tag) => (
              <View
                key={tag}
                style={{
                  paddingHorizontal: spacing.xs,
                  paddingVertical: 4,
                  backgroundColor: '#FEE2E2',
                  borderColor: '#FCA5A5',
                  borderWidth: 1,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.sizes.xs,
                    color: '#991B1B',
                  }}
                >
                  {getReviewTagLabel(tag)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Detailed Ratings */}
      {hasDetailedRatings && (
        <View style={{ marginBottom: spacing.md }}>
          <TouchableOpacity
            onPress={() => setShowDetailedRatings(!showDetailedRatings)}
            style={{ marginBottom: spacing.xs }}
          >
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.gray[600],
              }}
            >
              {showDetailedRatings ? '−' : '+'} Detailed Ratings
            </Text>
          </TouchableOpacity>

          {showDetailedRatings && review.detailedRatings && (
            <View style={{ gap: spacing.xs }}>
              {Object.entries(review.detailedRatings).map(([key, rating]) => {
                if (!rating) return null;

                const label = {
                  communication: 'Communication',
                  reliability: 'Reliability',
                  cleanliness: review.type === ReviewType.RENTER_TO_OWNER ? 'Item Cleanliness' : 'Care of Item',
                  accuracy: review.type === ReviewType.RENTER_TO_OWNER ? 'Listing Accuracy' : 'As Expected',
                  experience: 'Overall Experience',
                }[key] || key;

                return (
                  <View
                    key={key}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: typography.sizes.sm,
                        color: colors.gray[600],
                        flex: 1,
                      }}
                    >
                      {label}:
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Text
                            key={star}
                            style={{
                              fontSize: typography.sizes.xs,
                              color: star <= rating ? '#FBBF24' : colors.gray[300],
                            }}
                          >
                            ★
                          </Text>
                        ))}
                      </View>
                      <Text
                        style={{
                          fontSize: typography.sizes.sm,
                          color: colors.gray[500],
                          marginLeft: spacing.xs,
                        }}
                      >
                        {rating}/5
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Response */}
      {review.response && (
        <View
          style={{
            marginTop: spacing.md,
            padding: spacing.sm,
            backgroundColor: '#EBF8FF',
            borderLeftWidth: 4,
            borderLeftColor: '#3B82F6',
            borderRadius: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
            <Text
              style={{
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.medium,
                color: '#1E40AF',
              }}
            >
              Response from {review.reviewee.name}
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.xs,
                color: '#3B82F6',
                marginLeft: spacing.xs,
              }}
            >
              {reviewFormatting.formatRelativeTime(review.response.createdAt)}
            </Text>
          </View>
          <Text
            style={{
              fontSize: typography.sizes.sm,
              color: '#1E40AF',
            }}
          >
            {review.response.comment}
          </Text>
        </View>
      )}
    </View>
  );
} 