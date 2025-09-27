import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../lib/design-system';

// Define cancellation reasons locally
const BookingCancellationReason = {
  // Renter reasons
  CHANGE_OF_PLANS: 'change_of_plans',
  NO_LONGER_NEED_ITEM: 'no_longer_need_item',
  FOUND_ALTERNATIVE_RENTAL: 'found_alternative_rental',
  
  // Owner reasons
  ITEM_NO_LONGER_AVAILABLE: 'item_no_longer_available',
  ITEM_DAMAGED: 'item_damaged',
  EMERGENCY_SITUATION: 'emergency_situation',
  DOUBLE_BOOKED: 'double_booked',
  
  // General reasons
  PAYMENT_FAILED: 'payment_failed',
  POLICY_VIOLATION: 'policy_violation',
  OTHER: 'other'
} as const;

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, note: string) => Promise<void>;
  booking: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    owner_name: string;
    renter_name: string;
  };
  isRenter: boolean;
}

// Define role-specific cancellation reasons
const getCancellationReasons = (isRenter: boolean) => {
  if (isRenter) {
    return [
      { value: BookingCancellationReason.CHANGE_OF_PLANS, label: 'Change of plans' },
      { value: BookingCancellationReason.NO_LONGER_NEED_ITEM, label: 'No longer need the item' },
      { value: BookingCancellationReason.FOUND_ALTERNATIVE_RENTAL, label: 'Found an alternative rental' },
      { value: BookingCancellationReason.OTHER, label: 'Other reason' }
    ];
  } else {
    return [
      { value: BookingCancellationReason.ITEM_NO_LONGER_AVAILABLE, label: 'Item no longer available' },
      { value: BookingCancellationReason.ITEM_DAMAGED, label: 'Item damaged' },
      { value: BookingCancellationReason.EMERGENCY_SITUATION, label: 'Emergency situation' },
      { value: BookingCancellationReason.DOUBLE_BOOKED, label: 'Double booked' },
      { value: BookingCancellationReason.OTHER, label: 'Other reason' }
    ];
  }
};

export function CancelBookingModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  booking, 
  isRenter 
}: CancelBookingModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const startDate = new Date(booking.start_date);
  const endDate = new Date(booking.end_date);
  const now = new Date();
  const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isLessThan24Hours = hoursUntilStart < 24;
  const cancellationFee = isLessThan24Hours ? booking.total_amount * 0.5 : 0;
  const refundAmount = booking.total_amount - cancellationFee;

  const handleConfirm = async () => {
    if (!selectedReason) {
      setError('Please select a cancellation reason');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onConfirm(selectedReason, note);
      onClose();
    } catch (err: any) {
      console.error('Cancellation error:', err);
      
      // Handle specific error types
      if (err?.message?.includes('Authentication failed') || err?.message?.includes('user may no longer exist')) {
        setError('Authentication failed - user may no longer exist. Please sign in again.');
      } else if (err?.message?.includes('Network')) {
        setError('Network error. Please check your connection and try again.');
      } else if (err?.response?.status === 401) {
        setError('Session expired. Please sign in again.');
      } else if (err?.response?.status === 403) {
        setError('You do not have permission to cancel this booking.');
      } else if (err?.response?.status === 404) {
        setError('Booking not found. It may have already been cancelled.');
      } else {
        setError(err?.message || 'Failed to cancel booking. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedReason('');
      setNote('');
      setError('');
      onClose();
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="warning" size={20} color={colors.semantic.error} />
              </View>
              <Text style={styles.headerTitle}>Cancel Booking</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isLoading}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.gray[400]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Booking Info */}
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingTitle}>{booking.title}</Text>
              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="time" size={16} color={colors.gray[600]} />
                  <Text style={styles.detailText}>
                    Booking Period: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="cash" size={16} color={colors.gray[600]} />
                  <Text style={styles.detailText}>Total: ${booking.total_amount.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Cancellation Policy Warning */}
            <View style={[
              styles.policyWarning,
              isLessThan24Hours ? styles.lateCancellation : styles.freeCancellation
            ]}>
              <View style={styles.policyContent}>
                <Ionicons 
                  name="warning" 
                  size={20} 
                  color={isLessThan24Hours ? colors.semantic.warning : colors.semantic.success} 
                />
                <View style={styles.policyText}>
                  <Text style={[
                    styles.policyTitle,
                    isLessThan24Hours ? styles.lateTitle : styles.freeTitle
                  ]}>
                    {isLessThan24Hours ? 'Late Cancellation Fee' : 'Free Cancellation'}
                  </Text>
                  <Text style={[
                    styles.policyDescription,
                    isLessThan24Hours ? styles.lateDescription : styles.freeDescription
                  ]}>
                    {isLessThan24Hours 
                      ? `Cancelling less than 24 hours before pickup will result in a 50% cancellation fee ($${cancellationFee.toFixed(2)}).`
                      : 'You can cancel this booking for free since it\'s more than 24 hours before pickup.'
                    }
                  </Text>
                </View>
              </View>
            </View>

            {/* Refund Summary */}
            <View style={styles.refundSummary}>
              <Text style={styles.refundTitle}>Refund Summary</Text>
              <View style={styles.refundDetails}>
                <View style={styles.refundRow}>
                  <Text style={styles.refundLabel}>Original Amount:</Text>
                  <Text style={styles.refundValue}>${booking.total_amount.toFixed(2)}</Text>
                </View>
                {cancellationFee > 0 && (
                  <View style={styles.refundRow}>
                    <Text style={styles.refundLabel}>Cancellation Fee:</Text>
                    <Text style={styles.refundValue}>-${cancellationFee.toFixed(2)}</Text>
                  </View>
                )}
                <View style={[styles.refundRow, styles.refundTotal]}>
                  <Text style={styles.refundTotalLabel}>Refund Amount:</Text>
                  <Text style={styles.refundTotalValue}>${refundAmount.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Cancellation Reason */}
            <View style={styles.reasonSection}>
              <Text style={styles.label}>Why are you cancelling? *</Text>
              <View style={styles.reasonContainer}>
                {getCancellationReasons(isRenter).map((reason) => (
                  <TouchableOpacity
                    key={reason.value}
                    style={[
                      styles.reasonOption,
                      selectedReason === reason.value && styles.reasonOptionSelected
                    ]}
                    onPress={() => setSelectedReason(reason.value)}
                    disabled={isLoading}
                  >
                    <View style={[
                      styles.radioButton,
                      selectedReason === reason.value && styles.radioButtonSelected
                    ]}>
                      {selectedReason === reason.value && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={[
                      styles.reasonText,
                      selectedReason === reason.value && styles.reasonTextSelected
                    ]}>
                      {reason.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Additional Note */}
            <View style={styles.noteSection}>
              <Text style={styles.label}>Additional Note (Optional)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Let us know if there's anything else we should know..."
                style={styles.noteInput}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isLoading}
              />
            </View>

            {/* Notification Info */}
            <View style={styles.notificationInfo}>
              <View style={styles.notificationContent}>
                <Ionicons name="mail" size={20} color={colors.gray[600]} />
                <View style={styles.notificationText}>
                  <Text style={styles.notificationTitle}>Notification</Text>
                  <Text style={styles.notificationDescription}>
                    {isRenter ? booking.owner_name : booking.renter_name} will be notified of this cancellation via email.
                  </Text>
                </View>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Keep Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button, 
                styles.confirmButton,
                (!selectedReason || isLoading) && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirm}
              disabled={isLoading || !selectedReason}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.confirmButtonText}>Cancel Booking</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    height: 40,
    width: 40,
    backgroundColor: colors.semantic.error + '20',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  bookingInfo: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bookingTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  bookingDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    marginLeft: spacing.xs,
  },
  policyWarning: {
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  lateCancellation: {
    backgroundColor: colors.semantic.warning + '20',
    borderColor: colors.semantic.warning + '40',
  },
  freeCancellation: {
    backgroundColor: colors.semantic.success + '20',
    borderColor: colors.semantic.success + '40',
  },
  policyContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  policyText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  policyTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  lateTitle: {
    color: colors.semantic.warning,
  },
  freeTitle: {
    color: colors.semantic.success,
  },
  policyDescription: {
    fontSize: typography.sizes.sm,
  },
  lateDescription: {
    color: colors.semantic.warning,
  },
  freeDescription: {
    color: colors.semantic.success,
  },
  refundSummary: {
    backgroundColor: colors.primary.main + '20',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  refundTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  refundDetails: {
    gap: spacing.xs,
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  refundLabel: {
    fontSize: typography.sizes.sm,
    color: colors.primary.main,
  },
  refundValue: {
    fontSize: typography.sizes.sm,
    color: colors.primary.main,
  },
  refundTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.primary.main + '40',
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  refundTotalLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
  },
  refundTotalValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
  },
  reasonSection: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  reasonContainer: {
    gap: spacing.sm,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  reasonOptionSelected: {
    borderColor: colors.semantic.error,
    backgroundColor: colors.semantic.error + '10',
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  radioButtonSelected: {
    borderColor: colors.semantic.error,
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: colors.semantic.error,
  },
  reasonText: {
    fontSize: typography.sizes.base,
    color: colors.gray[700],
  },
  reasonTextSelected: {
    color: colors.semantic.error,
    fontWeight: typography.weights.medium,
  },
  noteSection: {
    marginBottom: spacing.lg,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.gray[900],
    minHeight: 80,
  },
  notificationInfo: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  notificationTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.gray[800],
    marginBottom: spacing.xs,
  },
  notificationDescription: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
  },
  errorContainer: {
    backgroundColor: colors.semantic.error + '20',
    borderWidth: 1,
    borderColor: colors.semantic.error + '40',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.semantic.error,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  cancelButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.gray[700],
  },
  confirmButton: {
    backgroundColor: colors.semantic.error,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  confirmButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.white,
  },
});