import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { colors, spacing } from '../lib/design-system';

interface ShimmerLoadingProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function ShimmerLoading({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}: ShimmerLoadingProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };

    shimmer();
  }, [shimmerAnimation]);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.gray[200],
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: colors.gray[300],
          opacity,
        }}
      />
    </View>
  );
}

interface ConversationShimmerProps {
  style?: ViewStyle;
}

export function ConversationShimmer({ style }: ConversationShimmerProps) {
  return (
    <View style={[{ padding: spacing.md }, style]}>
      {/* Header shimmer */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
      }}>
        <ShimmerLoading width={40} height={40} borderRadius={20} style={{ marginRight: spacing.sm }} />
        <View style={{ flex: 1 }}>
          <ShimmerLoading width="60%" height={16} style={{ marginBottom: spacing.xs }} />
          <ShimmerLoading width="40%" height={12} />
        </View>
      </View>

      {/* Booking context shimmer */}
      <View style={{
        backgroundColor: colors.gray[50],
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.lg,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
          <ShimmerLoading width={8} height={8} borderRadius={4} style={{ marginRight: spacing.sm }} />
          <ShimmerLoading width="70%" height={14} />
        </View>
        <ShimmerLoading width="50%" height={12} style={{ marginLeft: spacing.lg }} />
      </View>

      {/* Messages shimmer */}
      <View style={{ flex: 1 }}>
        {/* System message */}
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <ShimmerLoading width="80%" height={14} borderRadius={12} />
        </View>

        {/* Message bubbles */}
        {[1, 2, 3, 4].map((_, index) => (
          <View key={index} style={{
            flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
            marginBottom: spacing.md,
          }}>
            <View style={{
              maxWidth: '80%',
              backgroundColor: index % 2 === 0 ? colors.white : colors.primary.main + '20',
              borderRadius: 16,
              padding: spacing.sm,
              borderWidth: index % 2 === 0 ? 1 : 0,
              borderColor: colors.gray[200],
            }}>
              <ShimmerLoading 
                width={Math.random() * 100 + 100} 
                height={14} 
                style={{ marginBottom: spacing.xs }} 
              />
              {Math.random() > 0.5 && (
                <ShimmerLoading width={Math.random() * 80 + 60} height={14} />
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Input area shimmer */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
        gap: spacing.sm,
      }}>
        <ShimmerLoading width="80%" height={40} borderRadius={20} />
        <ShimmerLoading width={60} height={40} borderRadius={20} />
      </View>
    </View>
  );
}
