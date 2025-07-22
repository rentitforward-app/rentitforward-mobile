import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateReviewSchema,
  ReviewType,
  ReviewTag,
  type CreateReview,
  getReviewTagLabel,
  getReviewTagColor,
} from 'rentitforward-shared/src/types/review';
import { colors, spacing, typography } from 'rentitforward-shared/src/design-system';

interface ReviewFormProps {
  bookingId: string;
  reviewType: ReviewType;
  revieweeName: string;
  listingTitle: string;
  onSubmit: (data: CreateReview) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const availableTags = Object.values(ReviewTag);

export function ReviewForm({
  bookingId,
  reviewType,
  revieweeName,
  listingTitle,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ReviewFormProps) {
  const [selectedTags, setSelectedTags] = useState<ReviewTag[]>([]);
  const [showDetailedRatings, setShowDetailedRatings] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateReview>({
    resolver: zodResolver(CreateReviewSchema),
    defaultValues: {
      bookingId,
      type: reviewType,
      rating: 5,
      comment: '',
      tags: [],
      isPublic: true,
      detailedRatings: {
        communication: 5,
        reliability: 5,
        cleanliness: 5,
        accuracy: 5,
        experience: 5,
      },
    },
  });

  const rating = watch('rating');
  const comment = watch('comment');

  const handleTagToggle = (tag: ReviewTag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : selectedTags.length < 5
      ? [...selectedTags, tag]
      : selectedTags;

    setSelectedTags(newTags);
    setValue('tags', newTags);
  };

  const handleRatingChange = (newRating: number) => {
    setValue('rating', newRating);
  };

  const onFormSubmit = async (data: CreateReview) => {
    try {
      await onSubmit({
        ...data,
        tags: selectedTags,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
  };

  const isRenterReview = reviewType === ReviewType.RENTER_TO_OWNER;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.white }}
      contentContainerStyle={{ padding: spacing.md }}
    >
      {/* Header */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={{
            fontSize: typography.sizes['2xl'],
            fontWeight: typography.weights.bold,
            color: colors.gray[900],
            marginBottom: spacing.xs,
          }}
        >
          {isRenterReview ? 'Review Owner' : 'Review Renter'}
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[600],
            lineHeight: typography.lineHeights.relaxed,
          }}
        >
          Share your experience with <Text style={{ fontWeight: typography.weights.medium }}>{revieweeName}</Text> for "
          <Text style={{ fontWeight: typography.weights.medium }}>{listingTitle}</Text>"
        </Text>
      </View>

      {/* Overall Rating */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            color: colors.gray[700],
            marginBottom: spacing.sm,
          }}
        >
          Overall Rating *
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleRatingChange(star)}
              style={{ marginRight: spacing.xs }}
            >
              <Text
                style={{
                  fontSize: typography.sizes['2xl'],
                  color: star <= rating ? '#FBBF24' : colors.gray[300],
                }}
              >
                ★
              </Text>
            </TouchableOpacity>
          ))}
          <Text
            style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[600],
              marginLeft: spacing.sm,
            }}
          >
            {rating}/5 stars
          </Text>
        </View>
        {errors.rating && (
          <Text style={{ fontSize: typography.sizes.sm, color: colors.semantic.error, marginTop: spacing.xs }}>
            {errors.rating.message}
          </Text>
        )}
      </View>

      {/* Comment */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            color: colors.gray[700],
            marginBottom: spacing.sm,
          }}
        >
          Written Review
        </Text>
        <Controller
          control={control}
          name="comment"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              placeholder="Share details about your experience..."
              style={{
                borderWidth: 1,
                borderColor: errors.comment ? colors.semantic.error : colors.gray[300],
                borderRadius: 8,
                padding: spacing.sm,
                fontSize: typography.sizes.base,
                color: colors.gray[900],
                textAlignVertical: 'top',
                minHeight: 100,
              }}
            />
          )}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
          {errors.comment && (
            <Text style={{ fontSize: typography.sizes.sm, color: colors.semantic.error }}>
              {errors.comment.message}
            </Text>
          )}
          <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[500] }}>
            {comment?.length || 0}/1000 characters
          </Text>
        </View>
      </View>

      {/* Tags */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            color: colors.gray[700],
            marginBottom: spacing.sm,
          }}
        >
          Quick Tags (optional, max 5)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            const colorType = getReviewTagColor(tag);

            const buttonStyle = {
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: 20,
              borderWidth: 1,
              margin: 2,
              backgroundColor: isSelected
                ? colorType === 'positive'
                  ? colors.primary.green
                  : colorType === 'negative'
                  ? colors.semantic.error
                  : colors.semantic.warning
                : colors.gray[50],
              borderColor: isSelected
                ? colorType === 'positive'
                  ? colors.primary.green
                  : colorType === 'negative'
                  ? colors.semantic.error
                  : colors.semantic.warning
                : colors.gray[300],
            };

            const textStyle = {
              fontSize: typography.sizes.sm,
              color: isSelected ? colors.white : colors.gray[700],
            };

            return (
              <TouchableOpacity
                key={tag}
                onPress={() => handleTagToggle(tag)}
                disabled={!isSelected && selectedTags.length >= 5}
                style={[buttonStyle, (!isSelected && selectedTags.length >= 5) && { opacity: 0.5 }]}
              >
                <Text style={textStyle}>{getReviewTagLabel(tag)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[500], marginTop: spacing.xs }}>
          {selectedTags.length}/5 tags selected
        </Text>
      </View>

      {/* Detailed Ratings Toggle */}
      <TouchableOpacity
        onPress={() => setShowDetailedRatings(!showDetailedRatings)}
        style={{ marginBottom: spacing.md }}
      >
        <Text style={{ fontSize: typography.sizes.sm, color: colors.primary.green }}>
          {showDetailedRatings ? '−' : '+'} Detailed Ratings (optional)
        </Text>
      </TouchableOpacity>

      {/* Detailed Ratings */}
      {showDetailedRatings && (
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.gray[200],
            borderRadius: 8,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          {[
            { key: 'communication', label: 'Communication' },
            { key: 'reliability', label: 'Reliability' },
            { key: 'cleanliness', label: isRenterReview ? 'Item Cleanliness' : 'Care of Item' },
            { key: 'accuracy', label: isRenterReview ? 'Listing Accuracy' : 'As Expected' },
            { key: 'experience', label: 'Overall Experience' },
          ].map(({ key, label }) => (
            <View key={key} style={{ marginBottom: spacing.md }}>
              <Text
                style={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.xs,
                }}
              >
                {label}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setValue(`detailedRatings.${key}` as any, star)}
                    style={{ marginRight: spacing.xs }}
                  >
                    <Text
                      style={{
                        fontSize: typography.sizes.lg,
                        color:
                          star <= (watch(`detailedRatings.${key}` as any) || 0) ? '#FBBF24' : colors.gray[300],
                      }}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Privacy Setting */}
      <Controller
        control={control}
        name="isPublic"
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            onPress={() => onChange(!value)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderWidth: 2,
                borderColor: value ? colors.primary.green : colors.gray[300],
                backgroundColor: value ? colors.primary.green : colors.white,
                borderRadius: 4,
                marginRight: spacing.sm,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {value && (
                <Text style={{ color: colors.white, fontSize: 12, fontWeight: 'bold' }}>✓</Text>
              )}
            </View>
            <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[700] }}>
              Make this review public (recommended)
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Submit Buttons */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.md }}>
        <TouchableOpacity
          onPress={handleSubmit(onFormSubmit)}
          disabled={isSubmitting}
          style={{
            flex: 1,
            backgroundColor: isSubmitting ? colors.gray[400] : colors.primary.green,
            paddingVertical: spacing.sm,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
        >
          {isSubmitting && (
            <ActivityIndicator size="small" color={colors.white} style={{ marginRight: spacing.xs }} />
          )}
          <Text
            style={{
              color: colors.white,
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.semibold,
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancel}
          disabled={isSubmitting}
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderWidth: 1,
            borderColor: colors.gray[300],
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isSubmitting ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              color: colors.gray[700],
              fontSize: typography.sizes.base,
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 