import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../lib/design-system';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  textColor?: string;
  maxCount?: number;
  showZero?: boolean;
}

export function NotificationBadge({
  count,
  size = 'small',
  color = colors.semantic.error,
  textColor = colors.white,
  maxCount = 99,
  showZero = false,
}: NotificationBadgeProps) {
  // Don't render if count is 0 and showZero is false
  if (count === 0 && !showZero) {
    return null;
  }

  // Size configurations
  const sizeConfig = {
    small: {
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      fontSize: typography.sizes.xs - 2, // 10px
      paddingHorizontal: 4,
    },
    medium: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      fontSize: typography.sizes.xs, // 12px
      paddingHorizontal: 6,
    },
    large: {
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      fontSize: typography.sizes.sm, // 14px
      paddingHorizontal: 8,
    },
  };

  const config = sizeConfig[size];
  
  // Format count display
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <View
      style={{
        backgroundColor: color,
        minWidth: config.minWidth,
        height: config.height,
        borderRadius: config.borderRadius,
        paddingHorizontal: config.paddingHorizontal,
        justifyContent: 'center',
        alignItems: 'center',
        // Add a subtle border for better visibility
        borderWidth: 1,
        borderColor: colors.white,
        // Shadow for depth
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
      }}
    >
      <Text
        style={{
          color: textColor,
          fontSize: config.fontSize,
          fontWeight: typography.weights.bold,
          textAlign: 'center',
          lineHeight: config.fontSize + 2, // Ensure proper vertical centering
        }}
        numberOfLines={1}
      >
        {displayCount}
      </Text>
    </View>
  );
}

interface TabIconWithBadgeProps {
  children: React.ReactNode;
  badgeCount: number;
  showBadge?: boolean;
}

export function TabIconWithBadge({ 
  children, 
  badgeCount, 
  showBadge = true 
}: TabIconWithBadgeProps) {
  return (
    <View style={{ position: 'relative' }}>
      {children}
      {showBadge && badgeCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -8,
            zIndex: 1,
          }}
        >
          <NotificationBadge count={badgeCount} size="small" />
        </View>
      )}
    </View>
  );
}

interface NotificationIconProps {
  focused: boolean;
  color: string;
  size: number;
  badgeCount: number;
}

export function NotificationIcon({ 
  focused, 
  color, 
  size, 
  badgeCount 
}: NotificationIconProps) {
  const iconName = focused ? "notifications" : "notifications-outline";
  
  return (
    <TabIconWithBadge badgeCount={badgeCount}>
      <Ionicons name={iconName} size={size} color={color} />
    </TabIconWithBadge>
  );
}

