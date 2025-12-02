import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import 'react-native-reanimated';

// Suppress pointerEvents deprecation warning
LogBox.ignoreLogs(['pointerEvents is deprecated']);

// Custom themes with orange primary color
const QuickChopLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

const QuickChopDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? QuickChopDarkTheme : QuickChopLightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Entry point - redirects to welcome */}
        <Stack.Screen name="index" />
        
        {/* Welcome/Onboarding Screen */}
        <Stack.Screen name="welcome" />
        
        {/* Auth Screens */}
        <Stack.Screen name="auth" />
        
        {/* Customer Dashboard */}
        <Stack.Screen name="(customer)" />
        
        {/* Restaurant Dashboard */}
        <Stack.Screen name="(restaurant)" />
        
        {/* Rider Dashboard */}
        <Stack.Screen name="(rider)" />
        
        {/* Legacy tabs - hidden */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Modal */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
