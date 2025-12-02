import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function OrderDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();
  const { id } = useLocalSearchParams();

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
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Card>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderId}>Order #QC123456</Text>
                <Text style={styles.orderDate}>15 Nov 2024, 2:30 PM</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: colors.success + '20' },
                ]}
              >
                <Text style={[styles.statusText, { color: colors.success }]}>
                  Delivered
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <Card>
            {[
              { name: 'Jollof Rice', qty: 2, price: 1500 },
              { name: 'Pepper Soup', qty: 1, price: 2000 },
            ].map((item, index) => (
              <View key={index}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>×{item.qty}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    ₦{Math.round(item.price * item.qty).toLocaleString('en-NG')}
                  </Text>
                </View>
                {index < 1 && (
                  <View style={{ height: 1, backgroundColor: colors.border }} />
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <Card>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Subtotal</Text>
              <Text style={styles.paymentValue}>₦4,000</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Delivery Fee</Text>
              <Text style={styles.paymentValue}>₦500</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tax</Text>
              <Text style={styles.paymentValue}>₦480</Text>
            </View>
            <View
              style={[
                styles.paymentRow,
                { borderTopWidth: 1, borderTopColor: colors.border, paddingTopVertical: 12 },
              ]}
            >
              <Text style={styles.paymentTotal}>Total</Text>
              <Text style={styles.paymentTotal}>₦4,980</Text>
            </View>
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Button
            title="Reorder"
            variant="primary"
            size="lg"
            onPress={() => router.back()}
          />
          <Button
            title="Contact Restaurant"
            variant="outline"
            size="lg"
            onPress={() => {}}
            style={{ marginTop: 12 }}
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
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    orderId: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    orderDate: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    itemQty: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    paymentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    paymentLabel: {
      fontSize: 14,
      color: colors.textMuted,
    },
    paymentValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    paymentTotal: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
  });
