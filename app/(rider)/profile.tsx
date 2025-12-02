import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

export default function RiderProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.data && response.data.user) {
        setProfile(response.data.user);
        setFullName(response.data.user.fullName);
        setPhoneNumber(response.data.user.phoneNumber || '');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateProfile({
        fullName,
        phoneNumber,
      });
      if (Platform.OS === 'web') {
        alert('Profile updated successfully!');
      }
      setEditing(false);
      loadProfile();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      if (Platform.OS === 'web') {
        alert(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to logout?')
      : true;

    if (confirmed) {
      await authService.logout();
      if (Platform.OS === 'web') {
        window.location.href = '/welcome';
      } else {
        router.replace('/welcome');
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Picture */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={64} color={colors.surface} />
          </View>
          <Text style={styles.roleBadge}>Rider</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <Card>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              {editing ? (
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your name"
                  style={styles.input}
                />
              ) : (
                <Text style={styles.infoValue}>{profile?.fullName}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile?.email}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              {editing ? (
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              ) : (
                <Text style={styles.infoValue}>
                  {profile?.phoneNumber || 'Not set'}
                </Text>
              )}
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          {editing ? (
            <View style={styles.buttonGroup}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setEditing(false);
                  setFullName(profile?.fullName || '');
                  setPhoneNumber(profile?.phoneNumber || '');
                }}
                style={{ flex: 1 }}
              />
              <Button
                title={saving ? 'Saving...' : 'Save'}
                variant="primary"
                onPress={handleSave}
                disabled={saving}
                style={{ flex: 1 }}
              />
            </View>
          ) : (
            <Button
              title="Edit Profile"
              variant="primary"
              onPress={() => setEditing(true)}
            />
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Card>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(rider)/earnings')}
            >
              <View style={styles.actionLeft}>
                <MaterialIcons
                  name="account-balance-wallet"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.actionText}>View Earnings</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(rider)')}
            >
              <View style={styles.actionLeft}>
                <MaterialIcons
                  name="delivery-dining"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.actionText}>Active Deliveries</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Button
            title="Logout"
            variant="secondary"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      paddingBottom: 32,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    roleBadge: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      backgroundColor: `${colors.primary}20`,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
    },
    section: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    infoRow: {
      paddingVertical: 16,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    input: {
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: 12,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    actionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    actionText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    logoutButton: {
      borderColor: '#dc2626',
    },
  });
