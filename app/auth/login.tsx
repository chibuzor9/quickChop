import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { authService } = await import('@/services/api');
      const response = await authService.login(email, password);

      // Navigate based on user role
      if (response.user?.role === 'customer') {
        router.push('/(customer)');
      } else if (response.user?.role === 'rider') {
        router.push('/(rider)');
      } else if (response.user?.role === 'restaurant') {
        router.push('/(restaurant)');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setErrors({
        form: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.headerSection}>
          <MaterialIcons
            name="local-shipping"
            size={40}
            color={colors.primary}
          />
          <Text style={styles.logo}>QuickChop</Text>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            Get your favorite meals delivered, fast.
          </Text>

          {/* Error Message */}
          {errors.form && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errors.form}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              icon={
                <MaterialIcons
                  name="mail"
                  size={24}
                  color={colors.primary}
                />
              }
            />

            <TextInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              icon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
              <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Button
            title={loading ? 'Logging in...' : 'Login'}
            variant="primary"
            size="lg"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={[styles.socialButton, { borderColor: colors.border }]}>
              <FontAwesome
                name="facebook"
                size={24}
                color="#1877F2"
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { borderColor: colors.border }]}>
              <FontAwesome
                name="google"
                size={24}
                color="#DB4437"
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { borderColor: colors.border }]}>
              <MaterialIcons
                name="apple"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 24,
      marginTop: 16,
    },
    logo: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    contentSection: {
      flex: 1,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
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
    form: {
      marginBottom: 24,
    },
    forgotPasswordLink: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
      textAlign: 'right',
      marginTop: -8,
      marginBottom: 16,
    },
    loginButton: {
      marginBottom: 20,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 12,
      color: colors.textMuted,
      fontSize: 14,
    },
    socialButtonsContainer: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'center',
      marginBottom: 24,
    },
    socialButton: {
      width: 56,
      height: 56,
      borderRadius: 12,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    socialButtonEmoji: {
      fontSize: 24,
      fontWeight: '600',
    },
    footerSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 16,
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
