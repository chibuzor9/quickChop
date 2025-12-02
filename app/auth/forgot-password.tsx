import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const { authService } = await import('@/services/api');
      await authService.resetPassword(email);
      setSubmitted(true);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={[styles.container]}>
        <View style={styles.content}>
          <MaterialIcons
            name="mark-email-read"
            size={80}
            color={colors.primary}
          />
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a password reset link to {email}
          </Text>
          <Text style={styles.description}>
            Click the link in the email to reset your password. If you don't see
            the email, check your spam folder.
          </Text>

          <View style={styles.actions}>
            <Button
              title="Back to Login"
              variant="primary"
              size="lg"
              onPress={() => router.back()}
            />
            <Button
              title="Change Email"
              variant="outline"
              size="lg"
              onPress={() => setSubmitted(false)}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <TextInput
            label="Email Address"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            icon={
              <MaterialIcons
                name="mail"
                size={24}
                color={colors.primary}
              />
            }
          />

          <Button
            title={loading ? 'Sending...' : 'Send Reset Link'}
            variant="primary"
            size="lg"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            style={styles.button}
          />
        </View>

        {/* Sign Up Link */}
        <View style={styles.footerSection}>
          <Text style={styles.signupText}>Don't have an account?{' '}</Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signupLink}>Create one</Text>
          </TouchableOpacity>
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
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    contentSection: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 20,
    },
    description: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    errorBanner: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: '#ef4444',
    },
    errorBannerText: {
      color: '#dc2626',
      fontSize: 14,
    },
    button: {
      marginTop: 24,
    },
    actions: {
      width: '100%',
    },
    footerSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    signupText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    signupLink: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
  });
