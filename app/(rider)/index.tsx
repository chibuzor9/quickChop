import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { riderService } from '@/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Lagos area coordinates for common locations
const LAGOS_LOCATIONS: { [key: string]: { lat: number; lng: number } } = {
  'victoria island': { lat: 6.4281, lng: 3.4219 },
  'ikoyi': { lat: 6.4541, lng: 3.4316 },
  'lekki': { lat: 6.4474, lng: 3.4736 },
  'ajah': { lat: 6.4667, lng: 3.5667 },
  'banana island': { lat: 6.4333, lng: 3.4333 },
  'ikeja': { lat: 6.5964, lng: 3.3425 },
  'yaba': { lat: 6.5151, lng: 3.3725 },
  'surulere': { lat: 6.4968, lng: 3.3553 },
  'maryland': { lat: 6.5740, lng: 3.3665 },
  'gbagada': { lat: 6.5501, lng: 3.3911 },
  'apapa': { lat: 6.4489, lng: 3.3590 },
  'mushin': { lat: 6.5298, lng: 3.3498 },
  'festac': { lat: 6.4642, lng: 3.2806 },
  'oshodi': { lat: 6.5333, lng: 3.3167 },
  'isolo': { lat: 6.5273, lng: 3.3303 },
  'agege': { lat: 6.6152, lng: 3.3198 },
  'ojota': { lat: 6.5829, lng: 3.3797 },
  'anthony': { lat: 6.5653, lng: 3.3724 },
  'lagos': { lat: 6.5244, lng: 3.3792 },
};

const getCoordinatesFromAddress = (address: string): { lat: number; lng: number } => {
  if (!address) return LAGOS_LOCATIONS['lagos'];
  const lowerAddress = address.toLowerCase();
  for (const [location, coords] of Object.entries(LAGOS_LOCATIONS)) {
    if (lowerAddress.includes(location)) {
      return coords;
    }
  }
  return LAGOS_LOCATIONS['lagos'];
};

interface Delivery {
    _id: string;
    restaurantId: {
        name: string;
        address: string;
        phoneNumber: string;
    };
    customerId: {
        fullName: string;
        phoneNumber: string;
    };
    deliveryAddress: string;
    deliveryFee: number;
    total: number;
    items: Array<{
        name: string;
        quantity: number;
    }>;
    status: string;
    estimatedDeliveryTime: string;
}

interface Earnings {
    totalEarnings: string;
    todayEarnings: string;
    totalDeliveries: number;
    todayDeliveries: number;
}

export default function RiderDashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'available' | 'active'>('available');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [availableRes, activeRes, earningsRes] = await Promise.all([
        riderService.getAvailableDeliveries(),
        riderService.getActiveDeliveries(),
        riderService.getEarnings(),
      ]);

      if (availableRes.data && availableRes.data.data) {
        setAvailableDeliveries(availableRes.data.data);
      }

      if (activeRes.data && activeRes.data.data) {
        setActiveDeliveries(activeRes.data.data);
      }

      if (earningsRes.data && earningsRes.data.data) {
        setEarnings(earningsRes.data.data);
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      if (Platform.OS === 'web') {
        console.error('Failed to load data:', error.response?.data?.message || 'Failed to load data');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAcceptDelivery = async (deliveryId: string) => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to accept this delivery?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Accept Delivery',
            'Are you sure you want to accept this delivery?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Accept', onPress: () => resolve(true) },
            ]
          );
        });

    if (confirmed) {
      try {
        await riderService.acceptDelivery(deliveryId);
        if (Platform.OS === 'web') {
          alert('Delivery accepted!');
        } else {
          Alert.alert('Success', 'Delivery accepted!');
        }
        loadData();
      } catch (error: any) {
        console.error('Failed to accept delivery:', error);
        if (Platform.OS === 'web') {
          alert(error.response?.data?.message || 'Failed to accept delivery');
        } else {
          Alert.alert('Error', error.response?.data?.message || 'Failed to accept delivery');
        }
      }
    }
  };

  const handleCompleteDelivery = async (deliveryId: string) => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Confirm that this order has been delivered?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Complete Delivery',
            'Confirm that this order has been delivered?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Complete', onPress: () => resolve(true) },
            ]
          );
        });

    if (confirmed) {
      try {
        await riderService.completeDelivery(deliveryId);
        if (Platform.OS === 'web') {
          alert('Delivery completed!');
        } else {
          Alert.alert('Success', 'Delivery completed!');
        }
        loadData();
      } catch (error: any) {
        console.error('Failed to complete delivery:', error);
        if (Platform.OS === 'web') {
          alert(error.response?.data?.message || 'Failed to complete delivery');
        } else {
          Alert.alert('Error', error.response?.data?.message || 'Failed to complete delivery');
        }
      }
    }
  };

  const renderDeliveryCard = ({ item }: { item: Delivery }) => {
    const isActive = selectedTab === 'active';

    return (
      <Card style={styles.deliveryCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.restaurantInfo}>
            <MaterialIcons name="restaurant" size={32} color={colors.primary} />
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantName}>{item.restaurantId.name}</Text>
              <Text style={styles.restaurantAddress}>{item.restaurantId.address}</Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsLabel}>Items:</Text>
          {item.items.slice(0, 2).map((orderItem, index) => (
            <Text key={index} style={styles.itemText}>
              • {orderItem.quantity}x {orderItem.name}
            </Text>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItems}>+{item.items.length - 2} more</Text>
          )}
        </View>

        {/* Delivery Info */}
        <View style={styles.deliveryInfo}>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={16} color={colors.textMuted} />
            <Text style={styles.infoText}>{item.customerId.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={16} color={colors.textMuted} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.deliveryAddress}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={16} color={colors.textMuted} />
            <Text style={styles.infoText}>{item.customerId.phoneNumber}</Text>
          </View>
        </View>

        {/* Map */}
        {Platform.OS === 'web' && (
          <View style={styles.mapSection}>
            {(() => {
              const deliveryCoords = getCoordinatesFromAddress(item.deliveryAddress);
              const { lat, lng } = deliveryCoords;
              const bbox = `${lng - 0.015},${lat - 0.015},${lng + 0.015},${lat + 0.015}`;
              
              return (
                <iframe
                  style={{
                    width: '100%',
                    height: 200,
                    border: 0,
                    borderRadius: 8,
                  }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
                />
              );
            })()}
            <View style={styles.mapLabel}>
              <MaterialIcons name="place" size={16} color={colors.primary} />
              <Text style={styles.mapLabelText}>Delivery Location</Text>
            </View>
          </View>
        )}

        {/* Earnings */}
        <View style={styles.earningsSection}>
          <Text style={styles.earningsLabel}>Your Earnings:</Text>
          <Text style={styles.earningsAmount}>₦{Math.round(item.deliveryFee * 0.8).toLocaleString('en-NG')}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionButtons}>
          {!isActive ? (
            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: colors.primary }]}
              onPress={() => handleAcceptDelivery(item._id)}
            >
              <Text style={styles.acceptButtonText}>Accept Delivery</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.completeButton, { backgroundColor: '#10b981' }]}
              onPress={() => handleCompleteDelivery(item._id)}
            >
              <Text style={styles.completeButtonText}>Mark as Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
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

  const deliveries = selectedTab === 'available' ? availableDeliveries : activeDeliveries;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={deliveries}
        renderItem={renderDeliveryCard}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Rider Dashboard</Text>
                <Text style={styles.headerSubtitle}>
                  Welcome back!
                </Text>
              </View>
              <TouchableOpacity
                style={styles.earningsButton}
                onPress={() => router.push('/(rider)/earnings')}
              >
                <MaterialIcons name="account-balance-wallet" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Earnings Cards */}
            {earnings && (
              <View style={styles.earningsCards}>
                <Card style={styles.earningsCard}>
                  <MaterialIcons name="attach-money" size={32} color="#10b981" />
                  <Text style={styles.earningsCardLabel}>Today's Earnings</Text>
                  <Text style={styles.earningsCardValue}>₦{Math.round(parseFloat(earnings.todayEarnings)).toLocaleString('en-NG')}</Text>
                  <Text style={styles.earningsCardSubtext}>{earnings.todayDeliveries} deliveries</Text>
                </Card>

                <Card style={styles.earningsCard}>
                  <MaterialIcons name="trending-up" size={32} color={colors.primary} />
                  <Text style={styles.earningsCardLabel}>Total Earnings</Text>
                  <Text style={styles.earningsCardValue}>₦{Math.round(parseFloat(earnings.totalEarnings)).toLocaleString('en-NG')}</Text>
                  <Text style={styles.earningsCardSubtext}>{earnings.totalDeliveries} deliveries</Text>
                </Card>
              </View>
            )}

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'available' && styles.tabActive]}
                onPress={() => setSelectedTab('available')}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'available' && styles.tabTextActive,
                  ]}
                >
                  Available ({availableDeliveries.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
                onPress={() => setSelectedTab('active')}
              >
                <Text
                  style={[styles.tabText, selectedTab === 'active' && styles.tabTextActive]}
                >
                  Active ({activeDeliveries.length})
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name={selectedTab === 'available' ? 'delivery-dining' : 'check-circle'}
              size={64}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'available'
                ? 'No Available Deliveries'
                : 'No Active Deliveries'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'available'
                ? 'Check back soon for new delivery requests'
                : 'Accept a delivery to get started'}
            </Text>
          </View>
        }
      />
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
      paddingVertical: 20,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 4,
    },
    earningsButton: {
      padding: 8,
    },
    earningsCards: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    earningsCard: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 20,
    },
    earningsCardLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 8,
    },
    earningsCardValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginTop: 4,
    },
    earningsCardSubtext: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    tabs: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 16,
      gap: 12,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
    },
    tabTextActive: {
      color: colors.surface,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    deliveryCard: {
      marginBottom: 16,
    },
    cardHeader: {
      marginBottom: 12,
    },
    restaurantInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    restaurantDetails: {
      flex: 1,
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    restaurantAddress: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    itemsSection: {
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemsLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 6,
    },
    itemText: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 4,
    },
    moreItems: {
      fontSize: 13,
      color: colors.textMuted,
      fontStyle: 'italic',
      marginTop: 2,
    },
    deliveryInfo: {
      paddingVertical: 12,
      gap: 8,
    },
    mapSection: {
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    mapLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 8,
    },
    mapLabelText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    infoText: {
      fontSize: 13,
      color: colors.text,
      flex: 1,
    },
    earningsSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    earningsLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    earningsAmount: {
      fontSize: 20,
      fontWeight: '700',
      color: '#10b981',
    },
    actionButtons: {
      marginTop: 12,
    },
    acceptButton: {
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    acceptButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.surface,
    },
    completeButton: {
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    completeButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.surface,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 48,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
