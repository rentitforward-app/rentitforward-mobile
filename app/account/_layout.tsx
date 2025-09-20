import React from 'react';
import { Stack } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="payment-options" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="community-guidelines" />
      <Stack.Screen name="insurance-protection" />
      <Stack.Screen name="legal" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="contact-us" />
    </Stack>
  );
}
