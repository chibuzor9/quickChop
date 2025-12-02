import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { riderService } from '@/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

interface EarningsData {
    totalEarnings: string;
    todayEarnings: string;
    totalDeliveries: number;
    todayDeliveries: number;
}

interface DeliveryHistory {
    orderId: string;
    restaurant: {
        name: string;
    };
    deliveryFee: number;
    earnings: string;
    deliveredAt: string;
}

export default function EarningsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [history, setHistory] = useState<DeliveryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [earningsRes, historyRes] = await Promise.all([
        riderService.getEarnings(),
        riderService.getEarningsHistory(),
      ]);

      if (earningsRes.data && earningsRes.data.data) {
        setEarnings(earningsRes.data.data);
      }

      if (historyRes.data && historyRes.data.data) {
        setHistory(historyRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderHistoryItem = ({ item }: { item: DeliveryHistory }) => {
    const deliveryDate = new Date(item.deliveredAt);
    const formattedDate = deliveryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const formattedTime = deliveryDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Card style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.restaurantInfo}>
            <MaterialIcons name="restaurant" size={20} color={colors.primary} />
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
              <Text style={styles.deliveryDate}>
                {formattedDate} • {formattedTime}
              </Text>
            </View>
          </View>
          <View style={styles.earningsInfo}>
            <Text style={styles.earningsAmount}>₦{Math.round(parseFloat(item.earnings)).toLocaleString('en-NG')}</Text>
            <Text style={styles.deliveryFeeLabel}>
              from ₦{Math.round(item.deliveryFee).toLocaleString('en-NG')} fee
            </Text>
          </View>
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

  const averageEarningsPerDelivery = earnings && earnings.totalDeliveries > 0
    ? (parseFloat(earnings.totalEarnings) / earnings.totalDeliveries).toFixed(2)
    : '0.00';

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item, index) => `${item.orderId}-${index}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Earnings</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Earnings Summary */}
            {earnings && (
              <>
                <View style={styles.summarySection}>
                  <Card style={styles.totalEarningsCard}>
                    <MaterialIcons name="account-balance-wallet" size={48} color="#10b981" />
                    <Text style={styles.totalEarningsLabel}>Total Earnings</Text>
                    <Text style={styles.totalEarningsValue}>₦{Math.round(parseFloat(earnings.totalEarnings)).toLocaleString('en-NG')}</Text>
                    <Text style={styles.totalDeliveries}>
                      {earnings.totalDeliveries} total deliveries
                    </Text>
                  </Card>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <Card style={styles.statCard}>
                    <MaterialIcons name="today" size={24} color={colors.primary} />
                    <Text style={styles.statLabel}>Today</Text>
                    <Text style={styles.statValue}>₦{Math.round(parseFloat(earnings.todayEarnings)).toLocaleString('en-NG')}</Text>
                    <Text style={styles.statSubtext}>
                      {earnings.todayDeliveries} deliveries
                    </Text>
                  </Card>

                  <Card style={styles.statCard}>
                    <MaterialIcons name="trending-up" size={24} color="#f59e0b" />
                    <Text style={styles.statLabel}>Average</Text>
                    <Text style={styles.statValue}>₦{Math.round(parseFloat(averageEarningsPerDelivery)).toLocaleString('en-NG')}</Text>
                    <Text style={styles.statSubtext}>per delivery</Text>
                  </Card>
                </View>

                {/* Earnings Breakdown */}
                <View style={styles.breakdownSection}>
                  <Card>
                    <View style={styles.breakdownHeader}>
                      <MaterialIcons name="info-outline" size={20} color={colors.primary} />
                      <Text style={styles.breakdownTitle}>How Earnings Work</Text>
                    </View>
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Your Share:</Text>
                      <Text style={styles.breakdownValue}>80% of delivery fee</Text>
                    </View>
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Platform Fee:</Text>
                      <Text style={styles.breakdownValue}>20% of delivery fee</Text>
                    </View>
                    <View style={styles.breakdownNote}>
                      <Text style={styles.breakdownNoteText}>
                        Complete more deliveries to increase your earnings!
                      </Text>
                    </View>
                  </Card>
                </View>
              </>
            )}

            {/* History Header */}
            <View style={styles.historyHeaderSection}>
              <Text style={styles.historyTitle}>Delivery History</Text>
              <Text style={styles.historySubtitle}>
                {history.length} completed deliveries
              </Text>
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt-long" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Delivery History</Text>
            <Text style={styles.emptySubtitle}>
              Complete deliveries to start earning!
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
    summarySection: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    totalEarningsCard: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 16,
    },
    totalEarningsLabel: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 12,
    },
    totalEarningsValue: {
      fontSize: 48,
      fontWeight: '700',
      color: '#10b981',
      marginTop: 8,
    },
    totalDeliveries: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 4,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
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
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginTop: 4,
    },
    statSubtext: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    breakdownSection: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    breakdownHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    breakdownTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    breakdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    breakdownLabel: {
      fontSize: 14,
      color: colors.text,
    },
    breakdownValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    breakdownNote: {
      backgroundColor: `${colors.primary}10`,
      padding: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    breakdownNoteText: {
      fontSize: 13,
      color: colors.primary,
      textAlign: 'center',
    },
    historyHeaderSection: {
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 12,
    },
    historyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    historySubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 4,
    },
    listContent: {
      paddingBottom: 24,
    },
    historyCard: {
      marginHorizontal: 16,
      marginBottom: 12,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    restaurantInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    restaurantDetails: {
      flex: 1,
    },
    restaurantName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    deliveryDate: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    earningsInfo: {
      alignItems: 'flex-end',
    },
    earningsAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: '#10b981',
    },
    deliveryFeeLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
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
