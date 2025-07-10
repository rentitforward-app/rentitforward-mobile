import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/components/AuthProvider';
import { Providers } from '../src/components/Providers';
import '../src/lib/sentry'; // Initialize Sentry
// import '../global.css'; // Temporarily disabled for NativeWind issues

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Providers>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="booking/[listingId]" options={{ headerShown: false }} />
            <Stack.Screen name="booking/calendar" options={{ headerShown: false }} />
            <Stack.Screen name="booking/summary" options={{ headerShown: false }} />
            <Stack.Screen name="booking/success" options={{ headerShown: false }} />
            <Stack.Screen name="bookings/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="conversations/index" options={{ headerShown: false }} />
            <Stack.Screen name="conversations/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
            <Stack.Screen name="profile/verification" options={{ headerShown: false }} />
            <Stack.Screen name="search/filters" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </Providers>
    </SafeAreaProvider>
  );
} 