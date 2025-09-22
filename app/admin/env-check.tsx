import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';
import { 
  validateMobileEnvironmentConfig, 
  getEnvironmentSummary,
  logEnvironmentValidation,
  type MobileEnvValidationResult 
} from '../../src/lib/env-validation';
import { useAuth } from '../../src/components/AuthProvider';

interface ConfigSection {
  title: string;
  items: Array<{
    label: string;
    value: boolean;
    required: boolean;
  }>;
}

export default function MobileEnvCheckScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [validation, setValidation] = useState<MobileEnvValidationResult | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadEnvironmentData = async () => {
    try {
      const validationResult = validateMobileEnvironmentConfig();
      const summaryData = getEnvironmentSummary();
      
      setValidation(validationResult);
      setSummary(summaryData);
      
      // Log to console for debugging
      logEnvironmentValidation();
    } catch (error) {
      console.error('Error loading environment data:', error);
      Alert.alert('Error', 'Failed to load environment configuration');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEnvironmentData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEnvironmentData();
  };

  const handleTestNotifications = () => {
    Alert.alert(
      'Test Notifications',
      'This would test the notification system. Feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleCopyToClipboard = () => {
    const configText = JSON.stringify({
      validation,
      summary,
      timestamp: new Date().toISOString(),
    }, null, 2);
    
    // In a real app, you'd use Clipboard API
    Alert.alert(
      'Configuration Data',
      'Configuration data logged to console. Check the debug logs.',
      [{ text: 'OK' }]
    );
    
    console.log('Mobile Environment Configuration:', configText);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header 
          title="Environment Check"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading environment configuration...</Text>
        </View>
      </View>
    );
  }

  if (!validation || !summary) {
    return (
      <View style={styles.container}>
        <Header 
          title="Environment Check"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.semantic.error} />
          <Text style={styles.errorTitle}>Failed to Load Configuration</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadEnvironmentData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const configSections: ConfigSection[] = [
    {
      title: 'Supabase Configuration',
      items: [
        { label: 'Supabase URL', value: validation.config.supabase.url, required: true },
        { label: 'Anonymous Key', value: validation.config.supabase.anonKey, required: true },
      ],
    },
    {
      title: 'Firebase Configuration',
      items: [
        { label: 'Project ID', value: validation.config.firebase.projectId, required: true },
        { label: 'API Key', value: validation.config.firebase.apiKey, required: true },
        { label: 'App ID', value: validation.config.firebase.appId, required: true },
        { label: 'Messaging Sender ID', value: validation.config.firebase.messagingSenderId, required: true },
      ],
    },
    {
      title: 'Backend Configuration',
      items: [
        { label: 'Base URL', value: validation.config.backend.baseUrl, required: true },
      ],
    },
    {
      title: 'Expo Configuration',
      items: [
        { label: 'Project ID', value: validation.config.expo.projectId, required: false },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Header 
        title="Environment Check"
        showBackButton={true}
        onBackPress={() => router.back()}
      />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overall Status */}
        <View style={[
          styles.statusCard,
          validation.isValid ? styles.statusSuccess : styles.statusError
        ]}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={validation.isValid ? 'checkmark-circle' : 'alert-circle'} 
              size={24} 
              color={validation.isValid ? colors.semantic.success : colors.semantic.error} 
            />
            <Text style={[
              styles.statusTitle,
              validation.isValid ? styles.statusTitleSuccess : styles.statusTitleError
            ]}>
              {validation.isValid ? 'Configuration Valid' : 'Configuration Issues'}
            </Text>
          </View>
          <Text style={styles.statusDescription}>
            {validation.isValid 
              ? 'All required environment variables are properly configured.'
              : `${validation.errors.length} error(s) and ${validation.warnings.length} warning(s) found.`
            }
          </Text>
        </View>

        {/* Platform Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Platform Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Platform:</Text>
              <Text style={styles.infoValue}>{summary.platform}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Expo Version:</Text>
              <Text style={styles.infoValue}>{summary.expoVersion}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Project ID:</Text>
              <Text style={styles.infoValue}>{summary.projectId || 'Not set'}</Text>
            </View>
          </View>
        </View>

        {/* Configuration Sections */}
        {configSections.map((section, index) => (
          <View key={index} style={styles.configCard}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <View style={styles.configList}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.configItem}>
                  <View style={styles.configItemLeft}>
                    <Ionicons 
                      name={item.value ? 'checkmark-circle' : 'close-circle'} 
                      size={20} 
                      color={item.value ? colors.semantic.success : colors.semantic.error} 
                    />
                    <Text style={styles.configLabel}>{item.label}</Text>
                    {item.required && (
                      <Text style={styles.requiredBadge}>Required</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.configStatus,
                    item.value ? styles.configStatusSuccess : styles.configStatusError
                  ]}>
                    {item.value ? 'Set' : 'Missing'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Errors */}
        {validation.errors.length > 0 && (
          <View style={styles.errorCard}>
            <Text style={styles.cardTitle}>Errors</Text>
            {validation.errors.map((error, index) => (
              <View key={index} style={styles.errorItem}>
                <Ionicons name="alert-circle" size={16} color={colors.semantic.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <View style={styles.warningCard}>
            <Text style={styles.cardTitle}>Warnings</Text>
            {validation.warnings.map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <Ionicons name="warning" size={16} color={colors.semantic.warning} />
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleTestNotifications}>
            <Ionicons name="notifications" size={20} color={colors.primary.main} />
            <Text style={styles.actionButtonText}>Test Notifications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleCopyToClipboard}>
            <Ionicons name="copy" size={20} color={colors.primary.main} />
            <Text style={styles.actionButtonText}>Copy Config</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.semantic.error,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  statusCard: {
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: colors.semantic.success + '20',
    borderColor: colors.semantic.success + '40',
  },
  statusError: {
    backgroundColor: colors.semantic.error + '20',
    borderColor: colors.semantic.error + '40',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  statusTitleSuccess: {
    color: colors.semantic.success,
  },
  statusTitleError: {
    color: colors.semantic.error,
  },
  statusDescription: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoGrid: {
    gap: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  configCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  configList: {
    gap: spacing.sm,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  configLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  requiredBadge: {
    fontSize: typography.sizes.xs,
    color: colors.semantic.error,
    backgroundColor: colors.semantic.error + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
  configStatus: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  configStatusSuccess: {
    color: colors.semantic.success,
  },
  configStatusError: {
    color: colors.semantic.error,
  },
  errorCard: {
    backgroundColor: colors.semantic.error + '20',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.semantic.error + '40',
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.semantic.error,
    marginLeft: spacing.sm,
    flex: 1,
  },
  warningCard: {
    backgroundColor: colors.semantic.warning + '20',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.semantic.warning + '40',
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: typography.sizes.sm,
    color: colors.semantic.warning,
    marginLeft: spacing.sm,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.primary.main,
    marginLeft: spacing.sm,
  },
});

