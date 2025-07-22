import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { ReviewCard } from './ReviewCard';
import {
  type ReviewWithUser,
  type ReviewFilter,
  ReviewType,
} from 'rentitforward-shared/src/types/review';
import { reviewFilters } from 'rentitforward-shared/src/utils/reviews';
import { colors, spacing, typography } from 'rentitforward-shared/src/design-system';

interface ReviewListProps {
  reviews: ReviewWithUser[];
  currentUserId?: string;
  showBookingInfo?: boolean;
  showFilters?: boolean;
  initialFilter?: Partial<ReviewFilter>;
  onEdit?: (review: ReviewWithUser) => void;
  onDelete?: (reviewId: string) => void;
  onRespond?: (reviewId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function ReviewList({
  reviews,
  currentUserId,
  showBookingInfo = false,
  showFilters = true,
  initialFilter,
  onEdit,
  onDelete,
  onRespond,
  isLoading = false,
  emptyMessage = 'No reviews found.',
  onRefresh,
  refreshing = false,
}: ReviewListProps) {
  const [filters, setFilters] = useState<Partial<ReviewFilter>>({
    sortBy: 'newest',
    ...initialFilter,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Apply filters to reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filter by rating range
    if (filters.minRating || filters.maxRating) {
      filtered = reviewFilters.filterByRating(filtered, filters.minRating, filters.maxRating);
    }

    // Filter by type
    if (filters.type) {
      filtered = reviewFilters.filterByType(filtered, filters.type);
    }

    // Filter by has comment
    if (filters.hasComment !== undefined) {
      filtered = filtered.filter((review) =>
        filters.hasComment ? !!review.comment : !review.comment
      );
    }

    // Sort reviews
    if (filters.sortBy) {
      filtered = reviewFilters.sortReviews(filtered, filters.sortBy);
    }

    return filtered;
  }, [reviews, filters]);

  const updateFilter = (key: keyof ReviewFilter, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ sortBy: 'newest' });
  };

  const renderReviewCard = useCallback(
    ({ item }: { item: ReviewWithUser }) => (
      <ReviewCard
        review={item}
        currentUserId={currentUserId}
        showBookingInfo={showBookingInfo}
        onEdit={onEdit}
        onDelete={onDelete}
        onRespond={onRespond}
      />
    ),
    [currentUserId, showBookingInfo, onEdit, onDelete, onRespond]
  );

  const keyExtractor = useCallback((item: ReviewWithUser) => item.id, []);

  const renderEmptyComponent = () => (
    <View style={{ alignItems: 'center', paddingVertical: spacing['3xl'] }}>
      <View style={{ marginBottom: spacing.md }}>
        <Text style={{ fontSize: 48, color: colors.gray[400] }}>📝</Text>
      </View>
      <Text
        style={{
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.medium,
          color: colors.gray[900],
          marginBottom: spacing.xs,
        }}
      >
        No Reviews Yet
      </Text>
      <Text
        style={{
          fontSize: typography.sizes.base,
          color: colors.gray[500],
          textAlign: 'center',
          lineHeight: typography.lineHeights.relaxed,
        }}
      >
        {emptyMessage}
      </Text>
      {Object.keys(filters).length > 1 && (
        <TouchableOpacity onPress={clearFilters} style={{ marginTop: spacing.md }}>
          <Text
            style={{
              fontSize: typography.sizes.sm,
              color: colors.primary.green,
            }}
          >
            Clear filters to see all reviews
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLoadingComponent = () => (
    <View style={{ paddingVertical: spacing.lg }}>
      <ActivityIndicator size="large" color={colors.primary.green} />
    </View>
  );

  const renderHeader = () => (
    <View style={{ marginBottom: spacing.md }}>
      {/* Header with filter button */}
      {showFilters && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}
        >
          <Text
            style={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.medium,
              color: colors.gray[900],
            }}
          >
            Reviews ({filteredReviews.length})
          </Text>
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              backgroundColor: colors.gray[100],
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.gray[700],
                marginRight: spacing.xs,
              }}
            >
              Filters
            </Text>
            <Text style={{ fontSize: 12, color: colors.gray[500] }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        {renderHeader()}
        {renderLoadingComponent()}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filteredReviews}
        renderItem={renderReviewCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={refreshing}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.lg,
        }}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.white }}>
          {/* Modal Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.gray[200],
            }}
          >
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={{ fontSize: typography.sizes.base, color: colors.primary.green }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
              }}
            >
              Filter Reviews
            </Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={{ fontSize: typography.sizes.base, color: colors.primary.green }}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filter Options */}
          <View style={{ flex: 1, padding: spacing.md }}>
            {/* Sort By */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                }}
              >
                Sort By
              </Text>
              {[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'rating_high', label: 'Highest Rated' },
                { value: 'rating_low', label: 'Lowest Rated' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => updateFilter('sortBy', option.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: spacing.sm,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: filters.sortBy === option.value ? colors.primary.green : colors.gray[300],
                      backgroundColor: filters.sortBy === option.value ? colors.primary.green : colors.white,
                      marginRight: spacing.sm,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: typography.sizes.base,
                      color: colors.gray[700],
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating Range */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                }}
              >
                Rating Range
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600], marginBottom: spacing.xs }}>
                    Minimum
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <TouchableOpacity
                        key={rating}
                        onPress={() => updateFilter('minRating', rating === filters.minRating ? undefined : rating)}
                        style={{
                          flex: 1,
                          paddingVertical: spacing.xs,
                          alignItems: 'center',
                          backgroundColor: filters.minRating === rating ? colors.primary.green : colors.gray[100],
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: typography.sizes.sm,
                            color: filters.minRating === rating ? colors.white : colors.gray[700],
                          }}
                        >
                          {rating}★
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600], marginBottom: spacing.xs }}>
                    Maximum
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <TouchableOpacity
                        key={rating}
                        onPress={() => updateFilter('maxRating', rating === filters.maxRating ? undefined : rating)}
                        style={{
                          flex: 1,
                          paddingVertical: spacing.xs,
                          alignItems: 'center',
                          backgroundColor: filters.maxRating === rating ? colors.primary.green : colors.gray[100],
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: typography.sizes.sm,
                            color: filters.maxRating === rating ? colors.white : colors.gray[700],
                          }}
                        >
                          {rating}★
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Review Type */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                }}
              >
                Review Type
              </Text>
              {[
                { value: undefined, label: 'All Types' },
                { value: ReviewType.RENTER_TO_OWNER, label: 'Renter to Owner' },
                { value: ReviewType.OWNER_TO_RENTER, label: 'Owner to Renter' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => updateFilter('type', option.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: spacing.sm,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: filters.type === option.value ? colors.primary.green : colors.gray[300],
                      backgroundColor: filters.type === option.value ? colors.primary.green : colors.white,
                      marginRight: spacing.sm,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: typography.sizes.base,
                      color: colors.gray[700],
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Apply Button */}
          <View
            style={{
              padding: spacing.md,
              borderTopWidth: 1,
              borderTopColor: colors.gray[200],
            }}
          >
            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              style={{
                backgroundColor: colors.primary.green,
                paddingVertical: spacing.sm,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                }}
              >
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
} 