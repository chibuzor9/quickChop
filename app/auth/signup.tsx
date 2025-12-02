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

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'rider' | 'restaurant'>('customer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { authService } = await import('@/services/api');

      // Use the selected role from dropdown
      const response = await authService.signup({
        fullName,
        email,
        password,
        role,
      });

      // Navigate to role selection or directly to app
      if (response.user?.role) {
        if (response.user.role === 'customer') {
          router.push('/(customer)');
        } else if (response.user.role === 'rider') {
          router.push('/(rider)');
        } else if (response.user.role === 'restaurant') {
          router.push('/(restaurant)');
        }
      } else {
        router.push('/auth/role-select');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Sign up failed. Please try again.';
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
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.subtitle}>Join QuickChop today</Text>

          {/* Error Message */}
          {errors.form && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errors.form}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Full Name"
              placeholder="Enter your full name"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              icon={
                <MaterialIcons
                  name="person"
                  size={24}
                  color={colors.primary}
                />
              }
            />

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

            {/* Role Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>I am a</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'customer' && styles.roleOptionSelected,
                    { borderColor: role === 'customer' ? colors.primary : colors.border }
                  ]}
                  onPress={() => setRole('customer')}
                >
                  <MaterialIcons
                    name="person"
                    size={24}
                    color={role === 'customer' ? colors.primary : colors.textMuted}
                  />
                  <Text style={[
                    styles.roleOptionText,
                    { color: role === 'customer' ? colors.primary : colors.text }
                  ]}>
                    Customer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'rider' && styles.roleOptionSelected,
                    { borderColor: role === 'rider' ? colors.primary : colors.border }
                  ]}
                  onPress={() => setRole('rider')}
                >
                  <MaterialIcons
                    name="delivery-dining"
                    size={24}
                    color={role === 'rider' ? colors.primary : colors.textMuted}
                  />
                  <Text style={[
                    styles.roleOptionText,
                    { color: role === 'rider' ? colors.primary : colors.text }
                  ]}>
                    Rider
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'restaurant' && styles.roleOptionSelected,
                    { borderColor: role === 'restaurant' ? colors.primary : colors.border }
                  ]}
                  onPress={() => setRole('restaurant')}
                >
                  <MaterialIcons
                    name="restaurant"
                    size={24}
                    color={role === 'restaurant' ? colors.primary : colors.textMuted}
                  />
                  <Text style={[
                    styles.roleOptionText,
                    { color: role === 'restaurant' ? colors.primary : colors.text }
                  ]}>
                    Restaurant
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextInput
              label="Password"
              placeholder="Create a password"
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

            <TextInput
              label="Confirm Password"
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              icon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialIcons
                    name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              }
            />
          </View>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            <View
              style={[
                styles.checkbox,
                agreeToTerms && { backgroundColor: colors.primary },
                { borderColor: errors.terms ? '#ef4444' : colors.border },
              ]}
            >
              {agreeToTerms && (
                <MaterialIcons
                  name="check"
                  size={16}
                  color={colors.surface}
                />
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms && (
            <Text style={styles.errorText}>{errors.terms}</Text>
          )}

          {/* Sign Up Button */}
          <Button
            title={loading ? 'Creating Account...' : 'Create Account'}
            variant="primary"
            size="lg"
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
            style={styles.signupButton}
          />
        </View>

        {/* Login Link */}
        <View style={styles.footerSection}>
          <Text style={styles.loginText}>Already have an account?{' '}</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>Log In</Text>
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
      justifyContent: 'space-between',
      marginBottom: 24,
      marginTop: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      flex: 1,
    },
    contentSection: {
      flex: 1,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 20,
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
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    roleSelector: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    roleOption: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderRadius: 12,
      borderWidth: 2,
      backgroundColor: colors.surface,
      gap: 8,
    },
    roleOptionSelected: {
      backgroundColor: `${colors.primary}10`,
    },
    roleOptionText: {
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
      marginHorizontal: 0,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
      marginTop: 2,
    },
    termsText: {
      flex: 1,
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
    },
    termsLink: {
      color: colors.primary,
      fontWeight: '600',
    },
    errorText: {
      color: '#ef4444',
      fontSize: 12,
      marginTop: -12,
      marginBottom: 12,
    },
    signupButton: {
      marginVertical: 20,
    },
    footerSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 16,
    },
    loginText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    loginLink: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
  });
