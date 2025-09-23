import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileTokens } from '../lib/design-system';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  itemTitle: string;
  recipientName: string;
  isRenter: boolean; // true if reviewing as renter, false if reviewing as owner
}

export function ReviewModal({ 
  visible, 
  onClose, 
  bookingId, 
  itemTitle, 
  recipientName, 
  isRenter 
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/submit-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Review Submitted!',
          'Thank you for your feedback. Your review helps build trust in our community.',
          [
            {
              text: 'Done',
              onPress: () => {
                setRating(0);
                setComment('');
                onClose();
              },
            },
          ]
        );
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
            disabled={submitting}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? mobileTokens.colors.accent.yellow : mobileTokens.colors.gray[300]}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Tap a star to rate';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Leave a Review</Text>
          <TouchableOpacity onPress={onClose} disabled={submitting}>
            <Ionicons name="close" size={24} color={mobileTokens.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Rental Info */}
          <View style={styles.rentalInfo}>
            <Text style={styles.itemTitle}>{itemTitle}</Text>
            <Text style={styles.recipientText}>
              {isRenter 
                ? `How was your rental experience with ${recipientName}?`
                : `How was ${recipientName} as a renter?`
              }
            </Text>
          </View>

          {/* Star Rating */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Your Rating</Text>
            {renderStarRating()}
            <Text style={styles.ratingText}>{getRatingText()}</Text>
          </View>

          {/* Comment Section */}
          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>
              Additional Comments (Optional)
            </Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder={
                isRenter
                  ? "Describe your experience with the item and the owner..."
                  : "Share your experience with this renter..."
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
              editable={!submitting}
            />
            <Text style={styles.characterCount}>{comment.length}/500</Text>
          </View>

          {/* Guidelines */}
          <View style={styles.guidelines}>
            <View style={styles.guidelineHeader}>
              <Ionicons name="information-circle" size={20} color={mobileTokens.colors.info} />
              <Text style={styles.guidelineTitle}>Review Guidelines</Text>
            </View>
            <Text style={styles.guidelineText}>
              • Be honest and constructive in your feedback{'\n'}
              • Focus on the rental experience and communication{'\n'}
              • Avoid personal attacks or inappropriate language{'\n'}
              • Reviews help build trust in our community
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              rating === 0 && styles.submitButtonDisabled,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitReview}
            disabled={rating === 0 || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="star" size={20} color="white" />
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: mobileTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: mobileTokens.colors.gray[200],
  },
  headerTitle: {
    fontSize: mobileTokens.typography.sizes.lg,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.text.primary,
  },
  content: {
    flex: 1,
    padding: mobileTokens.spacing.md,
  },
  rentalInfo: {
    marginBottom: mobileTokens.spacing.lg,
  },
  itemTitle: {
    fontSize: mobileTokens.typography.sizes.lg,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.text.primary,
    marginBottom: mobileTokens.spacing.sm,
  },
  recipientText: {
    fontSize: mobileTokens.typography.sizes.base,
    color: mobileTokens.colors.text.secondary,
    lineHeight: 22,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: mobileTokens.spacing.lg,
    paddingVertical: mobileTokens.spacing.md,
    backgroundColor: mobileTokens.colors.background.secondary,
    borderRadius: 12,
  },
  ratingLabel: {
    fontSize: mobileTokens.typography.sizes.base,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.text.primary,
    marginBottom: mobileTokens.spacing.md,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: mobileTokens.spacing.sm,
  },
  starButton: {
    padding: mobileTokens.spacing.xs,
  },
  ratingText: {
    fontSize: mobileTokens.typography.sizes.sm,
    color: mobileTokens.colors.text.secondary,
    fontWeight: mobileTokens.typography.weights.medium,
  },
  commentSection: {
    marginBottom: mobileTokens.spacing.lg,
  },
  commentLabel: {
    fontSize: mobileTokens.typography.sizes.base,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.text.primary,
    marginBottom: mobileTokens.spacing.sm,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: mobileTokens.colors.gray[300],
    borderRadius: 8,
    padding: mobileTokens.spacing.sm,
    fontSize: mobileTokens.typography.sizes.base,
    color: mobileTokens.colors.text.primary,
    minHeight: 100,
    backgroundColor: 'white',
  },
  characterCount: {
    fontSize: mobileTokens.typography.sizes.xs,
    color: mobileTokens.colors.text.tertiary,
    textAlign: 'right',
    marginTop: mobileTokens.spacing.xs,
  },
  guidelines: {
    backgroundColor: mobileTokens.colors.info + '10',
    borderRadius: 8,
    padding: mobileTokens.spacing.md,
    marginBottom: mobileTokens.spacing.md,
  },
  guidelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: mobileTokens.spacing.sm,
  },
  guidelineTitle: {
    fontSize: mobileTokens.typography.sizes.sm,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.info,
    marginLeft: mobileTokens.spacing.xs,
  },
  guidelineText: {
    fontSize: mobileTokens.typography.sizes.xs,
    color: mobileTokens.colors.text.secondary,
    lineHeight: 16,
  },
  footer: {
    padding: mobileTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: mobileTokens.colors.gray[200],
  },
  submitButton: {
    backgroundColor: mobileTokens.colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: mobileTokens.spacing.md,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: mobileTokens.colors.gray[300],
  },
  submitButtonText: {
    color: 'white',
    fontSize: mobileTokens.typography.sizes.base,
    fontWeight: mobileTokens.typography.weights.semibold,
    marginLeft: mobileTokens.spacing.sm,
  },
});
