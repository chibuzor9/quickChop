import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { customerService } from '@/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function CheckoutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();
  const params = useLocalSearchParams();

  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const cart = params.cart ? JSON.parse(params.cart as string) : [];
  const restaurantId = params.restaurantId as string;
  const deliveryFee = parseFloat(params.deliveryFee as string) || 0;

  const subtotal = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    try {
      setLoading(true);

      const items = cart.map((item: any) => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const orderData = {
        restaurantId,
        items,
        deliveryAddress: address,
        customerPhone: phoneNumber,
        paymentMethod,
        specialInstructions,
      };

      const response = await customerService.placeOrder(orderData);
      console.log('Order response:', response);

      // Handle the response - placeOrder returns axios response
      const data = response.data || response;
      if (data.success || data.data) {
        const orderId = data.data?._id || data._id;
        router.replace({
          pathname: '/(customer)/payment-success',
          params: { orderId },
        });
      } else {
        throw new Error('Order placement failed');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TextInput
            label="Street Address"
            placeholder="Enter your address"
            value={address}
            onChangeText={setAddress}
            icon={
              <MaterialIcons
                name="location-on"
                size={24}
                color={colors.primary}
              />
            }
          />
          <TextInput
            label="Phone Number"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            icon={
              <MaterialIcons
                name="phone"
                size={24}
                color={colors.primary}
              />
            }
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cart.map((item: any, index: number) => (
            <View key={index} style={styles.cartItem}>
              <Text style={styles.cartItemName}>{item.name} x{item.quantity}</Text>
              <Text style={styles.cartItemPrice}>₦{Math.round(item.price * item.quantity).toLocaleString('en-NG')}</Text>
            </View>
          ))}
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₦{Math.round(subtotal).toLocaleString('en-NG')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₦{Math.round(deliveryFee).toLocaleString('en-NG')}</Text>
            </View>
            <View
              style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 }]}
            >
              <Text style={styles.summaryTotal}>Total</Text>
              <Text style={styles.summaryTotal}>₦{Math.round(total).toLocaleString('en-NG')}</Text>
            </View>
          </Card>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {['card', 'transfer', 'cash'].map((method) => (
            <TouchableOpacity
              key={method}
              style={styles.paymentOption}
              onPress={() => setPaymentMethod(method)}
            >
              <View
                style={[
                  styles.radio,
                  paymentMethod === method && styles.radioSelected,
                  { borderColor: paymentMethod === method ? colors.primary : colors.border },
                ]}
              >
                {paymentMethod === method && (
                  <View style={styles.radioDot} />
                )}
              </View>
              <View style={styles.paymentLabel}>
                <MaterialIcons
                  name={
                    method === 'card'
                      ? 'credit-card'
                      : method === 'transfer'
                      ? 'account-balance'
                      : 'local-atm'
                  }
                  size={24}
                  color={colors.text}
                />
                <Text style={styles.paymentText}>
                  {method === 'card'
                    ? 'Credit/Debit Card'
                    : method === 'transfer'
                    ? 'Bank Transfer'
                    : 'Cash on Delivery'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <TextInput
            label="Special Instructions"
            placeholder="Any special requests? (optional)"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
            icon={
              <MaterialIcons
                name="edit-note"
                size={24}
                color={colors.primary}
              />
            }
          />
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <Button
          title={loading ? 'Placing Order...' : `Place Order - ₦${Math.round(total).toLocaleString('en-NG')}`}
          variant="primary"
          size="lg"
          onPress={handleCheckout}
          disabled={loading}
        />
      </View>
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
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    summaryLabel: {
      fontSize: 14,
      color: colors.textMuted,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    summaryTotal: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    paymentOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    radioSelected: {
      borderColor: colors.primary,
    },
    radioDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    paymentLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    paymentText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    cartItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cartItemName: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    cartItemPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    summaryCard: {
      marginTop: 12,
    },
  });
