import React from 'react';
import { Stack } from 'expo-router';

export default function SafetyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="insurance-protection" />
      <Stack.Screen name="legal" />
    </Stack>
  );
}
