import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { restaurantService } from '@/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RestaurantSettings {
    name: string;
    description: string;
    phone: string;
    address: string;
    deliveryFee: number;
    minimumOrder: number;
    estimatedDeliveryTime: number;
    isOpen: boolean;
    openingTime: string;
    closingTime: string;
}

export default function RestaurantSettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const response = await restaurantService.getSettings();
      if (response.data && response.data.data) {
        const data = response.data.data;
        setSettings(data);

        // Populate form fields
        setName(data.name || '');
        setDescription(data.description || '');
        setPhone(data.phoneNumber || '');
        setAddress(data.address || '');
        setDeliveryFee(data.deliveryFee?.toString() || '');
        setMinimumOrder(data.minimumOrder?.toString() || '');
        setEstimatedDeliveryTime(data.estimatedDeliveryTime?.toString() || '');
        setIsOpen(data.isOpen ?? true);
        setOpeningTime(data.openingTime || '');
        setClosingTime(data.closingTime || '');
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      if (Platform.OS === 'web') {
        alert(error.response?.data?.message || 'Failed to load settings');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to load settings');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSettings();
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      if (Platform.OS === 'web') {
        alert('Please fill in all required fields (Name, Phone, Address)');
      } else {
        Alert.alert('Error', 'Please fill in all required fields (Name, Phone, Address)');
      }
      return;
    }

    try {
      setSaving(true);

      const updateData: any = {
        name: name.trim(),
        description: description.trim(),
        phone: phone.trim(),
        address: address.trim(),
        isOpen,
      };

      if (deliveryFee) updateData.deliveryFee = parseFloat(deliveryFee);
      if (minimumOrder) updateData.minimumOrder = parseFloat(minimumOrder);
      if (estimatedDeliveryTime) updateData.estimatedDeliveryTime = parseInt(estimatedDeliveryTime);
      if (openingTime) updateData.openingTime = openingTime;
      if (closingTime) updateData.closingTime = closingTime;

      await restaurantService.updateSettings(updateData);
      if (Platform.OS === 'web') {
        alert('Settings updated successfully!');
      } else {
        Alert.alert('Success', 'Settings updated successfully');
      }
      loadSettings();
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      if (Platform.OS === 'web') {
        alert(error.response?.data?.message || 'Failed to save settings');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to save settings');
      }
    } finally {
      setSaving(false);
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Restaurant Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurant Status</Text>
          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <MaterialIcons
                  name={isOpen ? 'check-circle' : 'cancel'}
                  size={32}
                  color={isOpen ? '#10b981' : '#ef4444'}
                />
                <View style={styles.statusText}>
                  <Text style={styles.statusLabel}>Current Status</Text>
                  <Text style={[styles.statusValue, { color: isOpen ? '#10b981' : '#ef4444' }]}>
                    {isOpen ? 'Open for Orders' : 'Closed'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isOpen}
                onValueChange={setIsOpen}
                trackColor={{ false: '#d1d5db', true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>
          </Card>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Card>
            <TextInput
              label="Restaurant Name *"
              placeholder="Enter restaurant name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              label="Description"
              placeholder="Brief description of your restaurant"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Phone Number *"
              placeholder="e.g., +234 123 456 7890"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <TextInput
              label="Address *"
              placeholder="Restaurant address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />
          </Card>
        </View>

        {/* Delivery Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Settings</Text>
          <Card>
            <TextInput
              label="Delivery Fee"
              placeholder="0.00"
              value={deliveryFee}
              onChangeText={setDeliveryFee}
              keyboardType="decimal-pad"
            />

            <TextInput
              label="Minimum Order Amount"
              placeholder="0.00"
              value={minimumOrder}
              onChangeText={setMinimumOrder}
              keyboardType="decimal-pad"
            />

            <TextInput
              label="Estimated Delivery Time (minutes)"
              placeholder="30"
              value={estimatedDeliveryTime}
              onChangeText={setEstimatedDeliveryTime}
              keyboardType="number-pad"
            />
          </Card>
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          <Card>
            <TextInput
              label="Opening Time"
              placeholder="e.g., 09:00 AM"
              value={openingTime}
              onChangeText={setOpeningTime}
            />

            <TextInput
              label="Closing Time"
              placeholder="e.g., 10:00 PM"
              value={closingTime}
              onChangeText={setClosingTime}
            />

            <View style={styles.infoBox}>
              <MaterialIcons name="info-outline" size={16} color={colors.textMuted} />
              <Text style={styles.infoText}>
                Set your regular business hours. You can toggle open/closed status above anytime.
              </Text>
            </View>
          </Card>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <Button
            title={saving ? 'Saving...' : 'Save Settings'}
            variant="primary"
            size="lg"
            onPress={handleSave}
            disabled={saving}
          />
        </View>

        {/* Additional Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Actions</Text>

          <TouchableOpacity style={styles.actionItem} onPress={() => {
            if (Platform.OS === 'web') {
              alert('Help & Support\n\nContact support at support@quickchop.com');
            } else {
              Alert.alert('Help & Support', 'Contact support at support@quickchop.com');
            }
          }}>
            <View style={styles.actionLeft}>
              <MaterialIcons name="help-outline" size={24} color={colors.text} />
              <Text style={styles.actionText}>Help & Support</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => {
            if (Platform.OS === 'web') {
              alert('About\n\nQuickChop v1.0.0\nDelivery App for Restaurants');
            } else {
              Alert.alert('About', 'QuickChop v1.0.0\nDelivery App for Restaurants');
            }
          }}>
            <View style={styles.actionLeft}>
              <MaterialIcons name="info-outline" size={24} color={colors.text} />
              <Text style={styles.actionText}>About QuickChop</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionItem, styles.logoutItem]}
            onPress={async () => {
              try {
                await restaurantService.logout();
                // Use window.location for better web compatibility
                if (Platform.OS === 'web') {
                  window.location.href = '/welcome';
                } else {
                  router.replace('/welcome');
                }
              } catch (error) {
                console.error('Logout error:', error);
                if (Platform.OS === 'web') {
                  window.location.href = '/welcome';
                } else {
                  router.replace('/welcome');
                }
              }
            }}
          >
            <View style={styles.actionLeft}>
              <MaterialIcons name="logout" size={24} color="#ef4444" />
              <Text style={[styles.actionText, { color: '#ef4444' }]}>Logout</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ef4444" />
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
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    section: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    statusCard: {
      paddingVertical: 20,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    statusText: {
      flex: 1,
    },
    statusLabel: {
      fontSize: 14,
      color: colors.textMuted,
    },
    statusValue: {
      fontSize: 18,
      fontWeight: '700',
      marginTop: 4,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    saveSection: {
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    actionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    actionText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    logoutItem: {
      borderColor: '#ef4444',
      backgroundColor: '#fef2f2',
    },
  });
