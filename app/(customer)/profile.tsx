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
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      const user = response.user;
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setAddress(user.address || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try logging in again.');
      // If profile fetch fails, might be auth issue - logout
      await authService.logout();
      router.replace('/welcome');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await authService.updateProfile({ fullName, phoneNumber, address });
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await authService.logout();
        // Use href for better web compatibility
        if (Platform.OS === 'web') {
          window.location.href = '/welcome';
        } else {
          router.replace('/welcome');
        }
      } catch (error) {
        console.error('Logout error:', error);
        // Still navigate to welcome even if logout fails
        if (Platform.OS === 'web') {
          window.location.href = '/welcome';
        } else {
          router.replace('/welcome');
        }
      }
    };

    // Use window.confirm on web, Alert on native
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        await doLogout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: doLogout,
          },
        ]
      );
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => (editing ? setEditing(false) : setEditing(true))}
          >
            <MaterialIcons
              name={editing ? 'close' : 'edit'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={64} color={colors.primary} />
          </View>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Card>
            <TextInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              editable={editing}
              icon={
                <MaterialIcons
                  name="person-outline"
                  size={24}
                  color={colors.primary}
                />
              }
            />
            <TextInput
              label="Email"
              value={email}
              editable={false}
              icon={
                <MaterialIcons
                  name="email"
                  size={24}
                  color={colors.textMuted}
                />
              }
            />
            <TextInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={editing}
              keyboardType="phone-pad"
              icon={
                <MaterialIcons
                  name="phone"
                  size={24}
                  color={colors.primary}
                />
              }
            />
            <TextInput
              label="Default Address"
              value={address}
              onChangeText={setAddress}
              editable={editing}
              multiline
              numberOfLines={2}
              icon={
                <MaterialIcons
                  name="location-on"
                  size={24}
                  color={colors.primary}
                />
              }
            />
          </Card>
        </View>

        {/* Save Button */}
        {editing && (
          <View style={styles.section}>
            <Button
              title={saving ? 'Saving...' : 'Save Changes'}
              variant="primary"
              size="lg"
              onPress={handleSave}
              disabled={saving}
            />
          </View>
        )}

        {/* Settings Options */}
        {!editing && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <Card>
                <TouchableOpacity style={styles.settingItem}>
                  <MaterialIcons
                    name="notifications"
                    size={24}
                    color={colors.text}
                  />
                  <Text style={styles.settingText}>Notifications</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <MaterialIcons
                    name="payment"
                    size={24}
                    color={colors.text}
                  />
                  <Text style={styles.settingText}>Payment Methods</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <MaterialIcons
                    name="location-on"
                    size={24}
                    color={colors.text}
                  />
                  <Text style={styles.settingText}>Saved Addresses</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <MaterialIcons
                    name="help"
                    size={24}
                    color={colors.text}
                  />
                  <Text style={styles.settingText}>Help & Support</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <MaterialIcons
                    name="info"
                    size={24}
                    color={colors.text}
                  />
                  <Text style={styles.settingText}>About</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </Card>
            </View>

            {/* Logout Button */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <MaterialIcons name="logout" size={20} color="#ef4444" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {/* App Version */}
            <View style={styles.versionSection}>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </>
        )}
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    userName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: colors.textMuted,
    },
    section: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 16,
      flex: 1,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#ef4444',
      backgroundColor: 'transparent',
    },
    logoutButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ef4444',
    },
    versionSection: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    versionText: {
      fontSize: 12,
      color: colors.textMuted,
    },
  });
