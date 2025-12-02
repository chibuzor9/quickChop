import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header/Logo Section */}
        <View style={styles.headerSection}>
          <MaterialIcons
            name="restaurant"
            size={48}
            color={colors.primary}
          />
          <Text style={styles.logo}>QuickChop</Text>
        </View>

        {/* Main Content Section */}
        <View style={styles.contentSection}>
          {/* Illustration Placeholder */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationPlaceholder}>
              <MaterialIcons
                name="delivery-dining"
                size={100}
                color={colors.primary}
              />
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textSection}>
            <Text style={styles.title}>Your favorite food, delivered fast.</Text>
            <Text style={styles.description}>
              Get delicious local meals delivered to your doorstep with real-time
              tracking in Nigeria.
            </Text>
          </View>
        </View>

        {/* Footer/CTA Section */}
        <View style={styles.footerSection}>
          <Button
            title="Create Account"
            variant="primary"
            size="lg"
            onPress={() => router.push('/auth/signup')}
            style={styles.button}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?{' '}</Text>
            <Text
              style={styles.loginLink}
              onPress={() => router.push('/auth/login')}
            >
              Log In
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    headerSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingTop: 32,
      paddingBottom: 16,
    },
    logo: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
    },
    contentSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 32,
    },
    illustrationContainer: {
      width: '100%',
      maxWidth: 300,
      aspectRatio: 1,
      marginBottom: 24,
    },
    illustrationPlaceholder: {
      flex: 1,
      borderRadius: 24,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    textSection: {
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 40,
    },
    description: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 24,
    },
    footerSection: {
      paddingVertical: 24,
    },
    button: {
      marginBottom: 16,
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 8,
    },
    loginText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    loginLink: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
  });
