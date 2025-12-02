import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { customerService } from '@/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Google Maps API Key from environment variable
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Lagos area coordinates for common locations
const LAGOS_LOCATIONS: { [key: string]: { lat: number; lng: number } } = {
  // Islands
  'victoria island': { lat: 6.4281, lng: 3.4219 },
  'ikoyi': { lat: 6.4541, lng: 3.4316 },
  'lekki': { lat: 6.4474, lng: 3.4736 },
  'ajah': { lat: 6.4667, lng: 3.5667 },
  'banana island': { lat: 6.4333, lng: 3.4333 },
  
  // Mainland
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
  
  // Default Lagos center
  'lagos': { lat: 6.5244, lng: 3.3792 },
};

// Function to get coordinates from delivery address
const getCoordinatesFromAddress = (address: string): { lat: number; lng: number } => {
  if (!address) return LAGOS_LOCATIONS['lagos'];
  
  const lowerAddress = address.toLowerCase();
  
  // Check if any known location is in the address
  for (const [location, coords] of Object.entries(LAGOS_LOCATIONS)) {
    if (lowerAddress.includes(location)) {
      return coords;
    }
  }
  
  // Default to Lagos center
  return LAGOS_LOCATIONS['lagos'];
};

interface Order {
    _id: string;
    status: string;
    restaurantId: {
        name: string;
        address: string;
        phoneNumber: string;
    };
    riderId?: {
        fullName: string;
        phoneNumber: string;
    };
    deliveryAddress: string;
    customerPhone: string;
    estimatedDeliveryTime: string;
    total: number;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
}

const getStatusSteps = (currentStatus: string) => {
    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked-up', 'delivered'];
    const currentIndex = statuses.indexOf(currentStatus);

    return [
        { label: 'Order Placed', status: 'pending', completed: currentIndex >= 0 },
        { label: 'Confirmed', status: 'confirmed', completed: currentIndex >= 1 },
        { label: 'Preparing Food', status: 'preparing', completed: currentIndex >= 2 },
        { label: 'Ready for Pickup', status: 'ready', completed: currentIndex >= 3 },
        { label: 'Out for Delivery', status: 'picked-up', completed: currentIndex >= 4 },
        { label: 'Delivered', status: 'delivered', completed: currentIndex >= 5 },
    ];
};

export default function TrackOrderScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrderDetails();
    // Set up polling for real-time updates
    const interval = setInterval(loadOrderDetails, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      const response = await customerService.trackOrder(id as string);
      if (response.data && response.data.data) {
        setOrder(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to load order:', error);
      if (!order) {
        Alert.alert('Error', 'Failed to load order details');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrderDetails();
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const getEstimatedTime = () => {
    if (!order?.estimatedDeliveryTime) return 'Calculating...';

    const eta = new Date(order.estimatedDeliveryTime);
    const now = new Date();
    const diff = eta.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 0) return 'Arriving soon';
    if (minutes < 60) return `${minutes} minutes away`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m away`;
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

  if (!order || !order._id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <Button title="Go Back" variant="primary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const statusSteps = getStatusSteps(order.status);
  const isCancelled = order.status === 'cancelled';

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
          <Text style={styles.headerTitle}>Track Order</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <MaterialIcons
              name="refresh"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Order ID */}
        <View style={styles.orderIdSection}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderId}>#{order._id?.slice(-8).toUpperCase() || 'N/A'}</Text>
        </View>

        {/* Live Map */}
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            (() => {
              const deliveryCoords = getCoordinatesFromAddress(order.deliveryAddress);
              const { lat, lng } = deliveryCoords;
              // Create a bounding box around the delivery location
              const bbox = `${lng - 0.02},${lat - 0.02},${lng + 0.02},${lat + 0.02}`;
              
              return (
                <iframe
                  style={{
                    width: '100%',
                    height: 300,
                    border: 0,
                    borderRadius: 12,
                  }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
                />
              );
            })()
          ) : (
            <View style={styles.mapPlaceholder}>
              <MaterialIcons
                name="map"
                size={100}
                color={colors.primary}
              />
              <Text style={styles.mapText}>Map view available on web</Text>
            </View>
          )}
          {order.status === 'picked-up' && (
            <View style={styles.mapOverlay}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Rider is on the way!</Text>
              </View>
            </View>
          )}
        </View>

        {/* Cancelled Status */}
        {isCancelled && (
          <View style={styles.section}>
            <Card style={styles.cancelledCard}>
              <MaterialIcons name="cancel" size={48} color="#dc2626" />
              <Text style={styles.cancelledText}>Order Cancelled</Text>
              <Text style={styles.cancelledSubtext}>
                This order has been cancelled and will not be delivered.
              </Text>
            </Card>
          </View>
        )}

        {/* Order Status */}
        {!isCancelled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            <Card>
              {statusSteps.map((step, index) => (
                <View key={index}>
                  <View style={styles.statusStep}>
                    <View
                      style={[
                        styles.statusDot,
                        step.completed && styles.statusDotCompleted,
                      ]}
                    >
                      {step.completed && (
                        <MaterialIcons
                          name="check"
                          size={14}
                          color={colors.surface}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.statusLabel,
                        step.completed && styles.statusLabelCompleted,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View
                      style={[
                        styles.statusLine,
                        step.completed && styles.statusLineCompleted,
                      ]}
                    />
                  )}
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Rider Info */}
        {order.riderId && !isCancelled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rider Information</Text>
            <Card style={styles.riderCard}>
              <View style={styles.riderHeader}>
                <View style={styles.riderAvatar}>
                  <MaterialIcons
                    name="delivery-dining"
                    size={40}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.riderInfo}>
                  <Text style={styles.riderName}>{order.riderId.fullName}</Text>
                  <Text style={styles.riderPhone}>{order.riderId.phoneNumber}</Text>
                </View>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(order.riderId!.phoneNumber)}
                >
                  <MaterialIcons
                    name="call"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* Delivery Info */}
        {!isCancelled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            <Card style={styles.deliveryCard}>
              <View style={styles.deliveryRow}>
                <MaterialIcons
                  name="schedule"
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryLabel}>Estimated Time</Text>
                  <Text style={styles.deliveryValue}>{getEstimatedTime()}</Text>
                </View>
              </View>
              <View style={styles.deliveryRow}>
                <MaterialIcons
                  name="location-on"
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryLabel}>Delivery Address</Text>
                  <Text style={styles.deliveryValue}>{order.deliveryAddress}</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Restaurant Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurant</Text>
          <Card style={styles.restaurantCard}>
            <View style={styles.restaurantHeader}>
              <View style={styles.restaurantIcon}>
                <MaterialIcons
                  name="restaurant"
                  size={32}
                  color={colors.primary}
                />
              </View>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{order.restaurantId.name}</Text>
                <Text style={styles.restaurantAddress}>{order.restaurantId.address}</Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(order.restaurantId.phoneNumber)}
              >
                <MaterialIcons
                  name="call"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <Card>
            {order.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₦{Math.round(item.price * item.quantity).toLocaleString('en-NG')}</Text>
              </View>
            ))}
            <View style={styles.orderTotal}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₦{Math.round(order.total).toLocaleString('en-NG')}</Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Footer */}
      {!isCancelled && (
        <View style={styles.footer}>
          <Button
            title="Contact Support"
            variant="outline"
            size="lg"
            onPress={() => Alert.alert('Support', 'Customer support feature coming soon')}
          />
        </View>
      )}
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      gap: 16,
    },
    errorText: {
      fontSize: 16,
      color: colors.textMuted,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    orderIdSection: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      alignItems: 'center',
    },
    orderIdLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    orderId: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: 4,
    },
    mapContainer: {
      marginHorizontal: 16,
      marginVertical: 12,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    mapPlaceholder: {
      height: 300,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    mapText: {
      marginTop: 8,
      color: colors.textMuted,
      fontSize: 14,
    },
    mapOverlay: {
      position: 'absolute',
      top: 16,
      left: 16,
      right: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    liveIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(16, 185, 129, 0.95)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#fff',
      marginRight: 6,
    },
    liveText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    mapSubtext: {
      marginTop: 4,
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    section: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    cancelledCard: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 16,
    },
    cancelledText: {
      fontSize: 20,
      fontWeight: '700',
      color: '#dc2626',
      marginTop: 16,
    },
    cancelledSubtext: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 8,
    },
    statusStep: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
    },
    statusDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      marginTop: 2,
    },
    statusDotCompleted: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    statusLabel: {
      fontSize: 14,
      color: colors.textMuted,
      flex: 1,
    },
    statusLabelCompleted: {
      color: colors.text,
      fontWeight: '600',
    },
    statusLine: {
      width: 2,
      height: 20,
      backgroundColor: colors.border,
      marginLeft: 11,
    },
    statusLineCompleted: {
      backgroundColor: colors.primary,
    },
    riderCard: {
      paddingVertical: 16,
      paddingHorizontal: 12,
    },
    riderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    riderAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    riderInfo: {
      flex: 1,
    },
    riderName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    riderPhone: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    callButton: {
      padding: 8,
      backgroundColor: colors.background,
      borderRadius: 20,
    },
    deliveryCard: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      gap: 16,
    },
    deliveryRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    deliveryInfo: {
      flex: 1,
    },
    deliveryLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    deliveryValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginTop: 4,
    },
    restaurantCard: {
      paddingVertical: 16,
      paddingHorizontal: 12,
    },
    restaurantHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    restaurantIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    restaurantInfo: {
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
    orderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemQuantity: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
      width: 40,
    },
    itemName: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    orderTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderTopWidth: 2,
      borderTopColor: colors.border,
      marginTop: 8,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    totalValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
