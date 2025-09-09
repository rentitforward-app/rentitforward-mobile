import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../lib/design-system';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showNotificationIcon?: boolean;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
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
  showNotificationIcon = true,
  onBackPress,
  onNotificationPress,
  rightAction,
  backgroundColor = colors.white,
  titleColor = colors.gray[900],
  style,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      // Default behavior - navigate to notifications
      router.push('/notifications');
    }
  };
  const headerStyle: ViewStyle = {
    paddingTop: insets.top,
    backgroundColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...style,
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  };

  const titleContainerStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
  };

  const titleTextStyle: TextStyle = {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: titleColor,
    textAlign: 'center',
  };

  const subtitleTextStyle: TextStyle = {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs / 2,
    textAlign: 'center',
  };

  const iconButtonStyle: ViewStyle = {
    padding: spacing.xs,
    borderRadius: 20,
    backgroundColor: 'transparent',
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <View style={headerStyle}>
        <View style={containerStyle}>
          {/* Left side - Back button or spacer */}
          <View style={{ width: 40, alignItems: 'flex-start' }}>
            {showBackButton ? (
              <TouchableOpacity
                onPress={handleBackPress}
                style={iconButtonStyle}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                testID="header-back-button"
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={titleColor}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Center - Title and subtitle */}
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

          {/* Right side - Notification icon, custom action, or spacer */}
          <View style={{ width: 40, alignItems: 'flex-end' }}>
            {rightAction ? (
              <TouchableOpacity
                style={iconButtonStyle}
                onPress={rightAction.onPress}
                testID={rightAction.testID || 'header-right-action'}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={rightAction.icon}
                  size={24}
                  color={titleColor}
                />
              </TouchableOpacity>
            ) : showNotificationIcon ? (
              <TouchableOpacity
                onPress={handleNotificationPress}
                style={iconButtonStyle}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                testID="header-notification-button"
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={titleColor}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </>
  );
}

// Preset header configurations for common use cases
export const HeaderPresets = {
  // Main screen header with title and notification icon
  main: (title: string) => ({
    title,
    showBackButton: false,
    showNotificationIcon: true,
  }),

  // Detail screen header with back button and notification icon
  detail: (title: string, onBackPress?: () => void) => ({
    title,
    showBackButton: true,
    showNotificationIcon: true,
    onBackPress,
  }),

  // Screen with custom action button (replaces notification icon)
  withAction: (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    onActionPress: () => void
  ) => ({
    title,
    showBackButton: false,
    showNotificationIcon: false,
    rightAction: {
      icon,
      onPress: onActionPress,
    },
  }),

  // Settings style header
  settings: (title: string, onBackPress?: () => void) => ({
    title,
    showBackButton: !!onBackPress,
    showNotificationIcon: true,
    onBackPress,
    backgroundColor: colors.neutral.lightGray,
  }),

  // Sub-page header with back button and notification icon
  subPage: (title: string, onBackPress?: () => void) => ({
    title,
    showBackButton: true,
    showNotificationIcon: true,
    onBackPress,
  }),
};

export default Header; 