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
    <View style={[{ flex: 1, backgroundColor: '#f9fafb' }, style]}>
      {/* Header shimmer */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* Back button */}
          <ShimmerLoading width={24} height={24} borderRadius={4} style={{ marginRight: spacing.md }} />
          {/* User name */}
          <ShimmerLoading width="40%" height={18} style={{ marginRight: spacing.sm }} />
          {/* Verified badge */}
          <ShimmerLoading width={60} height={14} borderRadius={7} />
        </View>
        {/* Notification icon */}
        <ShimmerLoading width={24} height={24} borderRadius={4} />
      </View>

      {/* Conversation context shimmer */}
      <View style={{
        backgroundColor: colors.white,
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          {/* Status dot */}
          <ShimmerLoading width={8} height={8} borderRadius={4} style={{ marginRight: spacing.sm }} />
          {/* Listing title */}
          <ShimmerLoading width="75%" height={14} />
        </View>
        {/* Context subtitle */}
        <ShimmerLoading width="45%" height={12} style={{ marginLeft: 16 }} />
      </View>

      {/* Messages container */}
      <View style={{ flex: 1, padding: spacing.md }}>
        {/* System message shimmer */}
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <View style={{
            backgroundColor: '#f3f4f6',
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: 12,
            alignItems: 'center',
          }}>
            <ShimmerLoading width={200} height={14} />
          </View>
        </View>

        {/* Message bubbles */}
        {/* Left message bubble */}
        <View style={{ alignSelf: 'flex-start', marginBottom: spacing.md, maxWidth: '80%' }}>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.gray[200],
          }}>
            <ShimmerLoading width={180} height={16} style={{ marginBottom: 4 }} />
            <ShimmerLoading width={120} height={16} />
          </View>
          <ShimmerLoading width={60} height={12} style={{ marginTop: 4 }} />
        </View>

        {/* Right message bubble */}
        <View style={{ alignSelf: 'flex-end', marginBottom: spacing.md, maxWidth: '80%' }}>
          <View style={{
            backgroundColor: '#44d62c',
            borderRadius: 16,
            borderBottomRightRadius: 4,
            padding: 12,
          }}>
            <ShimmerLoading width={90} height={16} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
          </View>
          <ShimmerLoading width={50} height={12} style={{ marginTop: 4, alignSelf: 'flex-end' }} />
        </View>

        {/* Left message bubble */}
        <View style={{ alignSelf: 'flex-start', marginBottom: spacing.md, maxWidth: '80%' }}>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.gray[200],
          }}>
            <ShimmerLoading width={80} height={16} />
          </View>
          <ShimmerLoading width={60} height={12} style={{ marginTop: 4 }} />
        </View>

        {/* Multiple right message bubbles */}
        <View style={{ alignSelf: 'flex-end', marginBottom: spacing.md, maxWidth: '80%' }}>
          <View style={{
            backgroundColor: '#44d62c',
            borderRadius: 16,
            borderBottomRightRadius: 4,
            padding: 12,
            marginBottom: 4,
          }}>
            <ShimmerLoading width={60} height={16} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
          </View>
          <View style={{
            backgroundColor: '#44d62c',
            borderRadius: 16,
            borderBottomRightRadius: 4,
            padding: 12,
          }}>
            <ShimmerLoading width={50} height={16} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
          </View>
          <ShimmerLoading width={50} height={12} style={{ marginTop: 4, alignSelf: 'flex-end' }} />
        </View>
      </View>

      {/* Input area shimmer */}
      <View style={{
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          padding: spacing.md,
          gap: spacing.sm,
        }}>
          {/* Message input */}
          <View style={{ flex: 1 }}>
            <ShimmerLoading 
              width="100%" 
              height={44} 
              borderRadius={20}
              style={{ backgroundColor: '#f9fafb' }}
            />
          </View>
          {/* Send button */}
          <ShimmerLoading 
            width={70} 
            height={44} 
            borderRadius={20}
            style={{ backgroundColor: '#d1d5db' }}
          />
        </View>
      </View>
    </View>
  );
}
