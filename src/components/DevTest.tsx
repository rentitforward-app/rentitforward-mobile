import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

export const DevTest: React.FC = () => {
  const { user, isLoading } = useAuthStore();
  const { addNotification } = useUIStore();

  const testNotification = () => {
    addNotification({
      type: 'success',
      title: 'Development Environment Test',
      message: 'All systems are working correctly! 🎉',
    });
  };

  return (
    <View className="p-4 bg-white rounded-lg border border-gray-200">
      <Text className="text-lg font-bold text-gray-900 mb-4">
        Development Environment Test
      </Text>
      
      <View className="space-y-3">
        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
          <Text className="text-sm text-gray-700">
            Auth Status: {isLoading ? 'Loading...' : user ? 'Authenticated' : 'Not authenticated'}
          </Text>
        </View>

        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
          <Text className="text-sm text-gray-700">
            Zustand Store: Working
          </Text>
        </View>

        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
          <Text className="text-sm text-gray-700">
            NativeWind: Working
          </Text>
        </View>

        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
          <Text className="text-sm text-gray-700">
            TypeScript: Working
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="mt-4 bg-primary-500 px-4 py-2 rounded-lg"
        onPress={testNotification}
      >
        <Text className="text-white font-medium text-center">
          Test Notification
        </Text>
      </TouchableOpacity>
    </View>
  );
}; 