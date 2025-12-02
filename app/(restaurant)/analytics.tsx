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
    View
} from 'react-native';

interface AnalyticsData {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: string;
    averageOrderValue: string;
    topSellingItems: Array<{
        name: string;
        quantity: number;
        revenue: string;
    }>;
    revenueByCategory: Array<{
        category: string;
        revenue: string;
        orders: number;
    }>;
}

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [])
  );

  const loadAnalytics = async () => {
    try {
      const response = await restaurantService.getAnalytics();
      if (response.data && response.data.data) {
        setAnalytics(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
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

  const completionRate = analytics && analytics.totalOrders > 0
    ? ((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1)
    : '0.0';

  const cancellationRate = analytics && analytics.totalOrders > 0
    ? ((analytics.cancelledOrders / analytics.totalOrders) * 100).toFixed(1)
    : '0.0';

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
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={{ width: 24 }} />
        </View>

        {analytics && (
          <>
            {/* Revenue Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Revenue Overview</Text>
              <Card style={styles.revenueCard}>
                <MaterialIcons name="attach-money" size={48} color="#10b981" />
                <Text style={styles.revenueLabel}>Total Revenue</Text>
                <Text style={styles.revenueValue}>₦{Math.round(analytics.totalRevenue).toLocaleString('en-NG')}</Text>
                <View style={styles.revenueStats}>
                  <View style={styles.revenueStat}>
                    <Text style={styles.revenueStatLabel}>Avg Order Value</Text>
                    <Text style={styles.revenueStatValue}>₦{Math.round(analytics.averageOrderValue).toLocaleString('en-NG')}</Text>
                  </View>
                  <View style={styles.revenueDivider} />
                  <View style={styles.revenueStat}>
                    <Text style={styles.revenueStatLabel}>Total Orders</Text>
                    <Text style={styles.revenueStatValue}>{analytics.totalOrders}</Text>
                  </View>
                </View>
              </Card>
            </View>

            {/* Order Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Statistics</Text>
              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: '#10b98115' }]}>
                    <MaterialIcons name="check-circle" size={32} color="#10b981" />
                  </View>
                  <Text style={styles.statValue}>{analytics.completedOrders}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                  <View style={styles.percentageBadge}>
                    <Text style={[styles.percentageText, { color: '#10b981' }]}>
                      {completionRate}%
                    </Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: '#ef444415' }]}>
                    <MaterialIcons name="cancel" size={32} color="#ef4444" />
                  </View>
                  <Text style={styles.statValue}>{analytics.cancelledOrders}</Text>
                  <Text style={styles.statLabel}>Cancelled</Text>
                  <View style={styles.percentageBadge}>
                    <Text style={[styles.percentageText, { color: '#ef4444' }]}>
                      {cancellationRate}%
                    </Text>
                  </View>
                </Card>
              </View>
            </View>

            {/* Top Selling Items */}
            {analytics.topSellingItems && analytics.topSellingItems.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Selling Items</Text>
                {analytics.topSellingItems.map((item, index) => (
                  <Card key={index} style={styles.itemCard}>
                    <View style={styles.itemRank}>
                      <Text style={styles.rankNumber}>#{index + 1}</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>{item.quantity} orders</Text>
                    </View>
                    <View style={styles.itemRevenue}>
                      <Text style={styles.itemRevenueValue}>₦{Math.round(item.revenue).toLocaleString('en-NG')}</Text>
                      <Text style={styles.itemRevenueLabel}>revenue</Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* Revenue by Category */}
            {analytics.revenueByCategory && analytics.revenueByCategory.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Revenue by Category</Text>
                {analytics.revenueByCategory.map((category, index) => {
                  const categoryPercentage = analytics.totalRevenue !== '0'
                    ? ((parseFloat(category.revenue) / parseFloat(analytics.totalRevenue)) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <Card key={index} style={styles.categoryCard}>
                      <View style={styles.categoryHeader}>
                        <View style={styles.categoryIcon}>
                          <MaterialIcons name="restaurant-menu" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.categoryInfo}>
                          <Text style={styles.categoryName}>{category.category}</Text>
                          <Text style={styles.categoryOrders}>{category.orders} orders</Text>
                        </View>
                        <View style={styles.categoryRevenue}>
                          <Text style={styles.categoryRevenueValue}>₦{Math.round(category.revenue).toLocaleString('en-NG')}</Text>
                          <Text style={styles.categoryPercentage}>{categoryPercentage}%</Text>
                        </View>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${categoryPercentage}%`,
                              backgroundColor: colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </Card>
                  );
                })}
              </View>
            )}

            {/* Performance Insights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Insights</Text>
              <Card>
                <View style={styles.insightRow}>
                  <MaterialIcons name="info-outline" size={20} color={colors.primary} />
                  <Text style={styles.insightText}>
                    {analytics.completedOrders > analytics.cancelledOrders
                      ? `Great job! You have a ${completionRate}% order completion rate.`
                      : 'Focus on reducing order cancellations to improve performance.'}
                  </Text>
                </View>
                {analytics.topSellingItems && analytics.topSellingItems.length > 0 && (
                  <View style={styles.insightRow}>
                    <MaterialIcons name="trending-up" size={20} color="#10b981" />
                    <Text style={styles.insightText}>
                      Your top item "{analytics.topSellingItems[0].name}" is driving significant revenue.
                    </Text>
                  </View>
                )}
                <View style={styles.insightRow}>
                  <MaterialIcons name="monetization-on" size={20} color="#f59e0b" />
                  <Text style={styles.insightText}>
                    Average order value is ₦{Math.round(analytics.averageOrderValue).toLocaleString('en-NG')}. Consider upselling to increase this metric.
                  </Text>
                </View>
              </Card>
            </View>
          </>
        )}

        {/* Empty State */}
        {!analytics?.totalOrders && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="bar-chart" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Analytics Data</Text>
            <Text style={styles.emptySubtitle}>
              Start accepting orders to see your analytics
            </Text>
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
    revenueCard: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 16,
    },
    revenueLabel: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 12,
    },
    revenueValue: {
      fontSize: 48,
      fontWeight: '700',
      color: '#10b981',
      marginTop: 8,
    },
    revenueStats: {
      flexDirection: 'row',
      marginTop: 24,
      width: '100%',
      justifyContent: 'space-around',
    },
    revenueStat: {
      alignItems: 'center',
      flex: 1,
    },
    revenueDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    revenueStatLabel: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
    },
    revenueStatValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginTop: 4,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 24,
      paddingHorizontal: 16,
    },
    statIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    statValue: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 4,
    },
    percentageBadge: {
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginTop: 8,
    },
    percentageText: {
      fontSize: 12,
      fontWeight: '600',
    },
    itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingVertical: 16,
    },
    itemRank: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    rankNumber: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    itemQuantity: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    itemRevenue: {
      alignItems: 'flex-end',
    },
    itemRevenueValue: {
      fontSize: 18,
      fontWeight: '700',
      color: '#10b981',
    },
    itemRevenueLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    categoryCard: {
      marginBottom: 12,
      paddingVertical: 16,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    categoryIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    categoryOrders: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    categoryRevenue: {
      alignItems: 'flex-end',
    },
    categoryRevenueValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    categoryPercentage: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.background,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    insightRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    insightText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 64,
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
