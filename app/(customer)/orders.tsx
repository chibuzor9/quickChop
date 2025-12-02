import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { customerService } from '@/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
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
    restaurantId: {
        _id: string;
        name: string;
        image: string;
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
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'delivered':
            return '#10b981';
        case 'cancelled':
            return '#ef4444';
        case 'picked-up':
            return '#3b82f6';
        case 'ready':
        case 'preparing':
            return '#f59e0b';
        default:
            return '#6b7280';
    }
};

const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
};

export default function OrdersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      const response = await customerService.getOrders();
      if (response.data && response.data.data) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/(customer)/track-order/${orderId}`);
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const orderDate = new Date(item.createdAt);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = orderDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        onPress={() => handleOrderPress(item._id)}
        activeOpacity={0.7}
      >
        <Card style={styles.orderCard}>
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.restaurantInfo}>
              <View style={styles.restaurantIcon}>
                <MaterialIcons name="restaurant" size={24} color={colors.primary} />
              </View>
              <View style={styles.restaurantDetails}>
                <Text style={styles.restaurantName}>{item.restaurantId.name}</Text>
                <Text style={styles.orderDate}>
                  {formattedDate} • {formattedTime}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(item.status)}15` },
              ]}
            >
              <Text
                style={[styles.statusText, { color: getStatusColor(item.status) }]}
              >
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          {/* Items */}
          <View style={styles.itemsSection}>
            {item.items.slice(0, 2).map((orderItem, index) => (
              <Text key={index} style={styles.itemText}>
                {orderItem.quantity}x {orderItem.name}
              </Text>
            ))}
            {item.items.length > 2 && (
              <Text style={styles.moreItems}>
                +{item.items.length - 2} more item{item.items.length - 2 > 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {/* Footer */}
          <View style={styles.orderFooter}>
            <View style={styles.deliveryInfo}>
              <MaterialIcons
                name="location-on"
                size={14}
                color={colors.textMuted}
              />
              <Text style={styles.addressText} numberOfLines={1}>
                {item.deliveryAddress}
              </Text>
            </View>
            <Text style={styles.totalAmount}>${item.total.toFixed(2)}</Text>
          </View>

          {/* Action Hint */}
          <View style={styles.actionHint}>
            <Text style={styles.actionHintText}>
              {item.status === 'delivered'
                ? 'View Details'
                : 'Track Order'}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
          </View>
        </Card>
      </TouchableOpacity>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <Text style={styles.headerSubtitle}>
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="receipt-long" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            Start ordering from your favorite restaurants!
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(customer)/')}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
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
    header: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
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
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    restaurantInfo: {
      flexDirection: 'row',
      flex: 1,
      marginRight: 12,
    },
    restaurantIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    restaurantDetails: {
      flex: 1,
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    orderDate: {
      fontSize: 12,
      color: colors.textMuted,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    itemsSection: {
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      marginTop: 4,
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    deliveryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 12,
    },
    addressText: {
      fontSize: 12,
      color: colors.textMuted,
      marginLeft: 4,
      flex: 1,
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    actionHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionHintText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginRight: 4,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 24,
    },
    browseButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    browseButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.surface,
    },
  });
