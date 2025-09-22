import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography } from '../../lib/design-system';
import { issueReportService } from '../../services/issueReportService';

interface IssueReportsSectionProps {
  bookingId: string;
  onViewReports?: () => void;
}

export function IssueReportsSection({ bookingId, onViewReports }: IssueReportsSectionProps) {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['issue-reports', bookingId],
    queryFn: () => issueReportService.getIssueReports(bookingId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Issue Reports</Text>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </View>
    );
  }

  if (!reports || reports.length === 0) {
    return null; // Don't show section if no reports
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return colors.semantic.success;
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#f97316';
      case 'critical':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'information-circle-outline';
      case 'medium':
        return 'warning-outline';
      case 'high':
        return 'alert-outline';
      case 'critical':
        return 'alert-circle';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return colors.semantic.warning;
      case 'in_progress':
        return '#3b82f6';
      case 'resolved':
        return colors.semantic.success;
      case 'closed':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Issue Reports ({reports.length})</Text>
      <View style={styles.reportsCard}>
        <View style={styles.reportsHeader}>
          <Ionicons name="warning-outline" size={24} color={colors.semantic.warning} />
          <Text style={styles.reportsTitle}>Reported Issues</Text>
        </View>
        
        {reports.slice(0, 3).map((report, index) => (
          <View key={report.id} style={[styles.reportItem, index > 0 && styles.reportItemBorder]}>
            <View style={styles.reportHeader}>
              <View style={styles.reportTitleRow}>
                <Ionicons 
                  name={getSeverityIcon(report.severity) as any} 
                  size={16} 
                  color={getSeverityColor(report.severity)} 
                />
                <Text style={styles.reportTitle} numberOfLines={1}>
                  {report.title}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                <Text style={styles.statusText}>
                  {report.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.reportDescription} numberOfLines={2}>
              {report.description}
            </Text>
            
            <View style={styles.reportMeta}>
              <Text style={styles.reportDate}>
                {new Date(report.created_at).toLocaleDateString()}
              </Text>
              <Text style={styles.reportType}>
                {report.issue_type.replace('_', ' ')}
              </Text>
            </View>
          </View>
        ))}
        
        {reports.length > 3 && (
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={onViewReports}
          >
            <Text style={styles.viewAllText}>
              View all {reports.length} reports
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  loadingCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  reportsCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  reportsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reportsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  reportItem: {
    paddingVertical: spacing.sm,
  },
  reportItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  reportTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.white,
  },
  reportDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  reportType: {
    fontSize: typography.sizes.xs,
    color: colors.primary.main,
    fontWeight: typography.weights.medium,
    textTransform: 'capitalize',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: spacing.sm,
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.medium,
    marginRight: spacing.xs,
  },
});

