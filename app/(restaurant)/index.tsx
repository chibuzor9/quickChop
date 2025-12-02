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
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DashboardData {
    todayOrders: number;
    todayRevenue: string;
    pendingOrders: number;
    totalOrders: number;
    totalRevenue: string;
    restaurantInfo: {
        name: string;
        isOpen: boolean;
    };
}

interface Order {
    _id: string;
    customerId: {
        fullName: string;
    };
    items: Array<{
        name: string;
        quantity: number;
    }>;
    total: number;
    status: string;
    createdAt: string;
}

export default function RestaurantDashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [dashboardRes, ordersRes] = await Promise.all([
        restaurantService.getDashboard(),
        restaurantService.getOrders({ status: 'pending' }),
      ]);

      if (dashboardRes.data && dashboardRes.data.data) {
        setDashboardData(dashboardRes.data.data);
      }

      if (ordersRes.data && ordersRes.data.data) {
        setPendingOrders(ordersRes.data.data.slice(0, 5)); // Show only first 5
      }
    } catch (error: any) {
      console.error('Failed to load dashboard:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleRestaurantStatus = async () => {
    if (!dashboardData) return;

    const newStatus = !dashboardData.restaurantInfo.isOpen;

    try {
      await restaurantService.updateSettings({ isOpen: newStatus });
      Alert.alert(
        'Success',
        `Restaurant is now ${newStatus ? 'open' : 'closed'}`
      );
      loadData();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      Alert.alert('Error', 'Failed to update restaurant status');
    }
  };

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: '/(restaurant)/orders',
      params: { orderId },
    });
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
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              {dashboardData?.restaurantInfo.name}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.statusToggle,
              {
                backgroundColor: dashboardData?.restaurantInfo.isOpen
                  ? '#10b981'
                  : '#ef4444',
              },
            ]}
            onPress={toggleRestaurantStatus}
          >
            <MaterialIcons
              name={dashboardData?.restaurantInfo.isOpen ? 'check-circle' : 'cancel'}
              size={20}
              color={colors.surface}
            />
            <Text style={styles.statusText}>
              {dashboardData?.restaurantInfo.isOpen ? 'Open' : 'Closed'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        {dashboardData && (
          <>
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <MaterialIcons name="today" size={32} color={colors.primary} />
                <Text style={styles.statLabel}>Today's Orders</Text>
                <Text style={styles.statValue}>{dashboardData.todayOrders}</Text>
                <Text style={styles.statSubtext}>
                  ₦{Math.round(dashboardData.todayRevenue).toLocaleString('en-NG')} revenue
                </Text>
              </Card>

              <Card style={styles.statCard}>
                <MaterialIcons name="pending" size={32} color="#f59e0b" />
                <Text style={styles.statLabel}>Pending</Text>
                <Text style={styles.statValue}>{dashboardData.pendingOrders}</Text>
                <Text style={styles.statSubtext}>needs attention</Text>
              </Card>
            </View>

            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <MaterialIcons name="receipt-long" size={32} color="#3b82f6" />
                <Text style={styles.statLabel}>Total Orders</Text>
                <Text style={styles.statValue}>{dashboardData.totalOrders}</Text>
                <Text style={styles.statSubtext}>all time</Text>
              </Card>

              <Card style={styles.statCard}>
                <MaterialIcons name="attach-money" size={32} color="#10b981" />
                <Text style={styles.statLabel}>Total Revenue</Text>
                <Text style={styles.statValue}>₦{Math.round(dashboardData.totalRevenue).toLocaleString('en-NG')}</Text>
                <Text style={styles.statSubtext}>all time</Text>
              </Card>
            </View>
          </>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(restaurant)/orders')}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}15` }]}>
                <MaterialIcons name="receipt" size={28} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Manage Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(restaurant)/menu')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#f59e0b15' }]}>
                <MaterialIcons name="restaurant-menu" size={28} color="#f59e0b" />
              </View>
              <Text style={styles.actionText}>Menu Items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(restaurant)/analytics')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#3b82f615' }]}>
                <MaterialIcons name="bar-chart" size={28} color="#3b82f6" />
              </View>
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(restaurant)/settings')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#6b728015' }]}>
                <MaterialIcons name="settings" size={28} color="#6b7280" />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Orders</Text>
              <TouchableOpacity onPress={() => router.push('/(restaurant)/orders')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {pendingOrders.map((order) => {
              const orderTime = new Date(order.createdAt);
              const timeAgo = Math.floor((Date.now() - orderTime.getTime()) / 60000);

              return (
                <TouchableOpacity
                  key={order._id}
                  onPress={() => handleOrderPress(order._id)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <View style={styles.orderInfo}>
                        <Text style={styles.orderCustomer}>
                          {order.customerId.fullName}
                        </Text>
                        <Text style={styles.orderTime}>{timeAgo} min ago</Text>
                      </View>
                      <Text style={styles.orderTotal}>₦{Math.round(order.total).toLocaleString('en-NG')}</Text>
                    </View>

                    <View style={styles.orderItems}>
                      {order.items.slice(0, 2).map((item, index) => (
                        <Text key={index} style={styles.orderItemText}>
                          {item.quantity}x {item.name}
                        </Text>
                      ))}
                      {order.items.length > 2 && (
                        <Text style={styles.moreItems}>
                          +{order.items.length - 2} more
                        </Text>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
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
    statusToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.surface,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 20,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 8,
      textAlign: 'center',
    },
    statValue: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginTop: 4,
    },
    statSubtext: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
      textAlign: 'center',
    },
    section: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    actionCard: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    orderCard: {
      marginBottom: 12,
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
    orderTotal: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    orderItems: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    orderItemText: {
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
  });
