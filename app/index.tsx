import { authService } from '@/services/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

// Platform-aware secure storage
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    const SecureStore = await import('expo-secure-store');
    return SecureStore.getItemAsync(key);
  },
};

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if we have a token
      const token = await storage.getItem('authToken');
      
      if (!token) {
        // No token, redirect to welcome
        router.replace('/welcome');
        return;
      }

      // Token exists, verify it's valid by fetching user profile
      const response = await authService.getProfile();
      
      if (response.data && response.data.user) {
        const userRole = response.data.user.role;
        
        // Redirect based on role
        switch (userRole) {
          case 'customer':
            router.replace('/(customer)');
            break;
          case 'rider':
            router.replace('/(rider)');
            break;
          case 'restaurant':
            router.replace('/(restaurant)');
            break;
          default:
            router.replace('/welcome');
        }
      } else {
        // Invalid token, redirect to welcome
        router.replace('/welcome');
      }
    } catch (error) {
      console.log('Auth check failed, redirecting to welcome');
      // Token invalid or expired, redirect to welcome
      router.replace('/welcome');
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading spinner while checking auth
  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff6b35" />
      </View>
    );
  }

  return null;
}
