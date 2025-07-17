import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../lib/design-system';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    testID?: string;
  };
  backgroundColor?: string;
  titleColor?: string;
  style?: ViewStyle;
}

export function Header({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightAction,
  backgroundColor = colors.white,
  titleColor = colors.text.primary,
  style,
}: HeaderProps) {
  const headerStyle: ViewStyle = {
    backgroundColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.mediumGray,
    ...style,
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 56,
  };

  const titleContainerStyle: ViewStyle = {
    flex: 1,
    alignItems: showBackButton ? 'flex-start' : 'center',
    marginLeft: showBackButton ? spacing.sm : 0,
    marginRight: rightAction ? spacing.sm : 0,
  };

  const titleTextStyle: TextStyle = {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: titleColor,
    textAlign: showBackButton ? 'left' : 'center',
  };

  const subtitleTextStyle: TextStyle = {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs / 2,
    textAlign: showBackButton ? 'left' : 'center',
  };

  const iconButtonStyle: ViewStyle = {
    padding: spacing.xs,
    borderRadius: 8,
    backgroundColor: 'transparent',
  };

  return (
    <SafeAreaView style={headerStyle} edges={['top']}>
      <View style={containerStyle}>
        {/* Back button */}
        {showBackButton && (
          <TouchableOpacity 
            style={iconButtonStyle}
            onPress={onBackPress}
            testID="header-back-button"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        )}

        {/* Title and subtitle */}
        <View style={titleContainerStyle}>
          <Text style={titleTextStyle} numberOfLines={1}>
            {title}
              </Text>
          {subtitle && (
            <Text style={subtitleTextStyle} numberOfLines={1}>
              {subtitle}
              </Text>
          )}
        </View>

        {/* Right action */}
        {rightAction ? (
          <TouchableOpacity
            style={iconButtonStyle}
            onPress={rightAction.onPress}
            testID={rightAction.testID || 'header-right-action'}
          >
            <Ionicons
              name={rightAction.icon}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        ) : (
          // Placeholder to maintain spacing when no right action
          showBackButton && <View style={{ width: 40 }} />
        )}
      </View>
    </SafeAreaView>
  );
}

// Preset header configurations for common use cases
export const HeaderPresets = {
  // Main screen header with title only
  main: (title: string) => ({
    title,
    showBackButton: false,
  }),

  // Detail screen header with back button
  detail: (title: string, onBackPress: () => void) => ({
    title,
    showBackButton: true,
    onBackPress,
  }),

  // Screen with action button
  withAction: (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    onActionPress: () => void
  ) => ({
    title,
    rightAction: {
      icon,
      onPress: onActionPress,
    },
  }),

  // Settings style header
  settings: (title: string, onBackPress?: () => void) => ({
    title,
    showBackButton: !!onBackPress,
    onBackPress,
    backgroundColor: colors.neutral.lightGray,
  }),
};

export default Header; 