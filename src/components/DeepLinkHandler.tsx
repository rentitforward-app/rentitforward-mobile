import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';

export function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    // Handle deep links when app is already running
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      if (url.includes('reset-password')) {
        // Extract URL parameters from the deep link
        const urlObj = new URL(url);
        const searchParams = urlObj.searchParams;
        
        // Get tokens from URL parameters
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        console.log('Reset password deep link params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type
        });
        
        if (accessToken && refreshToken && type === 'recovery') {
          // Navigate to reset password screen with tokens
          router.replace({
            pathname: '/(auth)/reset-password',
            params: {
              access_token: accessToken,
              refresh_token: refreshToken,
              type: type
            }
          });
        } else {
          console.error('Invalid reset password deep link parameters');
          // Navigate to forgot password screen if tokens are invalid
          router.replace('/(auth)/forgot-password');
        }
      }
    };

    // Handle deep link when app is opened from a link
    const getInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('Initial URL:', initialUrl);
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('Error getting initial URL:', error);
      }
    };

    // Handle deep links when app is already running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Check for initial URL when component mounts
    getInitialURL();

    return () => {
      subscription?.remove();
    };
  }, [router]);

  return null; // This component doesn't render anything
}
