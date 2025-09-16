import { Stack } from 'expo-router';

export default function PaymentLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="success" 
        options={{ 
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
