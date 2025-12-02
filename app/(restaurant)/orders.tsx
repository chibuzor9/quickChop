import { Card } from '@/components/ui/card';
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
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Order {
    _id: string;
    customerId: {
        fullName: string;
        phoneNumber: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    total: number;
    status: string;
    createdAt: string;
    deliveryAddress: string;
    customerPhone: string;
    riderId?: {
        fullName: string;
    };
}

const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'picked-up', label: 'Picked Up' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'delivered':
            return '#10b981';
        case 'cancelled':
            return '#ef4444';
        case 'picked-up':
            return '#3b82f6';
        case 'ready':
            return '#8b5cf6';
        case 'preparing':
            return '#f59e0b';
        case 'confirmed':
            return '#06b6d4';
        default:
            return '#6b7280';
    }
};

export default function OrdersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [selectedStatus])
  );

  const loadOrders = async () => {
    try {
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      const response = await restaurantService.getOrders(params);

      if (response.data && response.data.data) {
        setOrders(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await restaurantService.updateOrderStatus(orderId, { status: newStatus });
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      loadOrders();
    } catch (error: any) {
      console.error('Failed to update order:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update order status');
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
        case 'pending':
            return 'confirmed';
        case 'confirmed':
            return 'preparing';
        case 'preparing':
            return 'ready';
        default:
            return null;
    }
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const orderDate = new Date(item.createdAt);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const formattedTime = orderDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const isExpanded = expandedOrder === item._id;
    const nextStatus = getNextStatus(item.status);
    const canUpdateStatus = nextStatus !== null;

    return (
      <Card style={styles.orderCard}>
        <TouchableOpacity
          onPress={() => setExpandedOrder(isExpanded ? null : item._id)}
          activeOpacity={0.7}
        >
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderCustomer}>{item.customerId.fullName}</Text>
              <Text style={styles.orderTime}>
                {formattedDate} • {formattedTime}
              </Text>
            </View>
            <View style={styles.orderRight}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(item.status)}15` },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
              <MaterialIcons
                name={isExpanded ? 'expand-less' : 'expand-more'}
                size={24}
                color={colors.textMuted}
              />
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <View style={styles.itemsPreview}>
              {item.items.slice(0, 2).map((orderItem, index) => (
                <Text key={index} style={styles.itemText}>
                  {orderItem.quantity}x {orderItem.name}
                </Text>
              ))}
              {item.items.length > 2 && (
                <Text style={styles.moreItems}>+{item.items.length - 2} more</Text>
              )}
            </View>
            <Text style={styles.orderTotal}>₦{Math.round(item.total).toLocaleString('en-NG')}</Text>
          </View>
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* All Items */}
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Order Items</Text>
              {item.items.map((orderItem, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemQuantity}>{orderItem.quantity}x</Text>
                  <Text style={styles.itemName}>{orderItem.name}</Text>
                  <Text style={styles.itemPrice}>₦{Math.round(orderItem.price * orderItem.quantity).toLocaleString('en-NG')}</Text>
                </View>
              ))}
            </View>

            {/* Customer Info */}
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Customer Information</Text>
              <View style={styles.infoRow}>
                <MaterialIcons name="person" size={16} color={colors.textMuted} />
                <Text style={styles.infoText}>{item.customerId.fullName}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={16} color={colors.textMuted} />
                <Text style={styles.infoText}>{item.customerPhone}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="location-on" size={16} color={colors.textMuted} />
                <Text style={styles.infoText}>{item.deliveryAddress}</Text>
              </View>
            </View>

            {/* Rider Info */}
            {item.riderId && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Rider</Text>
                <View style={styles.infoRow}>
                  <MaterialIcons name="delivery-dining" size={16} color={colors.textMuted} />
                  <Text style={styles.infoText}>{item.riderId.fullName}</Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            {canUpdateStatus && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.updateButton, { backgroundColor: colors.primary }]}
                  onPress={() => updateOrderStatus(item._id, nextStatus)}
                >
                  <Text style={styles.updateButtonText}>
                    Mark as {nextStatus}
                  </Text>
                </TouchableOpacity>

                {item.status === 'pending' && (
                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: '#ef4444' }]}
                    onPress={() => {
                      Alert.alert(
                        'Cancel Order',
                        'Are you sure you want to cancel this order?',
                        [
                          { text: 'No', style: 'cancel' },
                          {
                            text: 'Yes, Cancel',
                            style: 'destructive',
                            onPress: () => updateOrderStatus(item._id, 'cancelled'),
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel Order</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Status Filter */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusOptions}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedStatus === item.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedStatus(item.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedStatus === item.value && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterContent}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt-long" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Orders</Text>
            <Text style={styles.emptySubtitle}>
              No orders found for the selected filter
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
    filterSection: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterContent: {
      paddingHorizontal: 16,
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
    },
    filterTextActive: {
      color: colors.surface,
    },
    listContent: {
      padding: 16,
    },
    orderCard: {
      marginBottom: 16,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    orderInfo: {
      flex: 1,
    },
    orderCustomer: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    orderTime: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    orderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    orderSummary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    itemsPreview: {
      flex: 1,
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
    },
    orderTotal: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    expandedSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    detailSection: {
      marginBottom: 16,
    },
    detailTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
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
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 6,
    },
    infoText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    actionButtons: {
      gap: 12,
      marginTop: 8,
    },
    updateButton: {
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    updateButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.surface,
      textTransform: 'capitalize',
    },
    cancelButton: {
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ef4444',
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
