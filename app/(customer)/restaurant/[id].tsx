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
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    isAvailable: boolean;
    preparationTime: number;
}

interface Restaurant {
    _id: string;
    name: string;
    description: string;
    cuisine: string[];
    image: string;
    rating: number;
    reviewCount: number;
    deliveryTime: string;
    deliveryFee: number;
    minimumOrder: number;
    address: string;
    phoneNumber: string;
    isOpen: boolean;
}

interface CartItem extends MenuItem {
    quantity: number;
}

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];
    const styles = createStyles(colors);
    const router = useRouter();

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        if (id && typeof id === 'string' && id.length > 10) {
            loadData();
        } else {
            setLoading(false);
            console.error('Invalid restaurant ID:', id);
        }
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const restaurantId = id as string;
            
            const [restaurantRes, menuRes] = await Promise.all([
                customerService.getRestaurantDetails(restaurantId),
                customerService.getMenu(restaurantId),
            ]);

            // Handle the API response structure
            const restaurantData = restaurantRes.data?.data || restaurantRes.data;
            const menuData = menuRes.data?.data || menuRes.data || [];
            
            setRestaurant(restaurantData);
            setMenuItems(menuData);
        } catch (error: any) {
            console.error('Failed to load data:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to load restaurant data');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', ...new Set(menuItems.map((item) => item.category))];

    const filteredMenu =
        selectedCategory === 'All'
            ? menuItems
            : menuItems.filter((item) => item.category === selectedCategory);

    const addToCart = (item: MenuItem) => {
        const existingItem = cart.find((cartItem) => cartItem._id === item._id);
        if (existingItem) {
            setCart(
                cart.map((cartItem) =>
                    cartItem._id === item._id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                )
            );
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId: string) => {
        const existingItem = cart.find((cartItem) => cartItem._id === itemId);
        if (existingItem && existingItem.quantity > 1) {
            setCart(
                cart.map((cartItem) =>
                    cartItem._id === itemId
                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                        : cartItem
                )
            );
        } else {
            setCart(cart.filter((cartItem) => cartItem._id !== itemId));
        }
    };

    const getCartItemQuantity = (itemId: string) => {
        const item = cart.find((cartItem) => cartItem._id === itemId);
        return item ? item.quantity : 0;
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = () => {
        if (!restaurant) return;

        if (cartTotal < restaurant.minimumOrder) {
            Alert.alert(
                'Minimum Order',
                `Minimum order is ₦${restaurant.minimumOrder.toFixed(0)}`
            );
            return;
        }

        router.push({
            pathname: '/(customer)/checkout',
            params: {
                restaurantId: restaurant._id,
                cart: JSON.stringify(cart),
                deliveryFee: restaurant.deliveryFee,
            },
        });
    };

    const renderMenuItem = ({ item }: { item: MenuItem }) => {
        const quantity = getCartItemQuantity(item._id);

        return (
            <Card style={styles.menuCard}>
                <View style={styles.menuItemContent}>
                    <View style={styles.menuItemInfo}>
                        <Text style={styles.menuItemName}>{item.name}</Text>
                        <Text style={styles.menuItemDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                        <Text style={styles.menuItemPrice}>₦{item.price.toFixed(0)}</Text>
                        {item.preparationTime > 0 && (
                            <Text style={styles.prepTime}>~{item.preparationTime} min</Text>
                        )}
                    </View>

                    <View style={styles.menuItemActions}>
                        <View style={styles.imagePlaceholder}>
                            <MaterialIcons name="restaurant" size={32} color={colors.primary} />
                        </View>

                        {!item.isAvailable ? (
                            <Text style={styles.unavailableText}>Unavailable</Text>
                        ) : quantity > 0 ? (
                            <View style={styles.quantityControls}>
                                <TouchableOpacity
                                    onPress={() => removeFromCart(item._id)}
                                    style={styles.quantityButton}
                                >
                                    <MaterialIcons name="remove" size={20} color={colors.surface} />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{quantity}</Text>
                                <TouchableOpacity
                                    onPress={() => addToCart(item)}
                                    style={styles.quantityButton}
                                >
                                    <MaterialIcons name="add" size={20} color={colors.surface} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Button
                                title="Add"
                                variant="primary"
                                size="sm"
                                onPress={() => addToCart(item)}
                            />
                        )}
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

    if (!restaurant) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Restaurant not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={filteredMenu}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>{restaurant.name}</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        {/* Restaurant Info */}
                        <View style={styles.restaurantInfo}>
                            <View style={styles.restaurantImage}>
                                <MaterialIcons
                                    name="restaurant"
                                    size={64}
                                    color={colors.primary}
                                />
                            </View>

                            <View style={styles.infoSection}>
                                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                                <Text style={styles.restaurantDescription}>
                                    {restaurant.description}
                                </Text>
                                <Text style={styles.cuisines}>{restaurant.cuisine.join(', ')}</Text>

                                <View style={styles.detailsRow}>
                                    <View style={styles.detailItem}>
                                        <MaterialIcons name="star" size={16} color="#fbbf24" />
                                        <Text style={styles.detailText}>
                                            {restaurant.rating} ({restaurant.reviewCount})
                                        </Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <MaterialIcons
                                            name="delivery-dining"
                                            size={16}
                                            color={colors.textMuted}
                                        />
                                        <Text style={styles.detailText}>{restaurant.deliveryTime}</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <MaterialIcons name="paid" size={16} color={colors.textMuted} />
                                        <Text style={styles.detailText}>₦{restaurant.deliveryFee.toFixed(0)} delivery</Text>
                                    </View>
                                </View>

                                {!restaurant.isOpen && (
                                    <View style={styles.closedBanner}>
                                        <Text style={styles.closedText}>Currently Closed</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Categories */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoriesSection}
                            contentContainerStyle={styles.categoriesContent}
                        >
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryChip,
                                        selectedCategory === category && styles.categoryChipActive,
                                    ]}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            selectedCategory === category && styles.categoryTextActive,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.menuTitle}>Menu</Text>
                    </>
                }
                contentContainerStyle={styles.listContent}
            />

            {/* Cart Footer */}
            {cartItemCount > 0 && (
                <View style={styles.cartFooter}>
                    <View style={styles.cartInfo}>
                        <Text style={styles.cartItemCount}>{cartItemCount} items</Text>
                        <Text style={styles.cartTotal}>₦{cartTotal.toFixed(0)}</Text>
                    </View>
                    <Button
                        title="Checkout"
                        variant="primary"
                        onPress={handleCheckout}
                        disabled={!restaurant.isOpen}
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
        },
        errorText: {
            fontSize: 16,
            color: colors.textMuted,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        backButton: {
            padding: 8,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
        },
        restaurantInfo: {
            padding: 16,
        },
        restaurantImage: {
            width: '100%',
            height: 200,
            backgroundColor: colors.surface,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
        },
        infoSection: {
            gap: 8,
        },
        restaurantName: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
        },
        restaurantDescription: {
            fontSize: 14,
            color: colors.textMuted,
            lineHeight: 20,
        },
        cuisines: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: '600',
        },
        detailsRow: {
            flexDirection: 'row',
            gap: 16,
            marginTop: 8,
        },
        detailItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        detailText: {
            fontSize: 12,
            color: colors.textMuted,
        },
        closedBanner: {
            backgroundColor: '#fee2e2',
            padding: 12,
            borderRadius: 8,
            marginTop: 12,
        },
        closedText: {
            color: '#dc2626',
            fontWeight: '600',
            textAlign: 'center',
        },
        categoriesSection: {
            marginBottom: 16,
        },
        categoriesContent: {
            gap: 8,
            paddingHorizontal: 16,
        },
        categoryChip: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
        },
        categoryChipActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        categoryText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textMuted,
        },
        categoryTextActive: {
            color: colors.surface,
        },
        menuTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            paddingHorizontal: 16,
            marginBottom: 12,
        },
        listContent: {
            paddingHorizontal: 16,
            paddingBottom: 100,
        },
        menuCard: {
            marginBottom: 12,
        },
        menuItemContent: {
            flexDirection: 'row',
            gap: 12,
        },
        menuItemInfo: {
            flex: 1,
        },
        menuItemName: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        menuItemDescription: {
            fontSize: 13,
            color: colors.textMuted,
            marginBottom: 8,
        },
        menuItemPrice: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.primary,
        },
        prepTime: {
            fontSize: 12,
            color: colors.textMuted,
            marginTop: 4,
        },
        menuItemActions: {
            alignItems: 'center',
            gap: 8,
        },
        imagePlaceholder: {
            width: 80,
            height: 80,
            backgroundColor: colors.background,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        unavailableText: {
            fontSize: 12,
            color: '#dc2626',
            fontWeight: '600',
        },
        quantityControls: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        quantityButton: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        quantityText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            minWidth: 24,
            textAlign: 'center',
        },
        cartFooter: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
        },
        cartInfo: {
            flex: 1,
        },
        cartItemCount: {
            fontSize: 14,
            color: colors.textMuted,
        },
        cartTotal: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
        },
    });
