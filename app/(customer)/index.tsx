import { Card } from '@/components/ui/card';
import { TextInput } from '@/components/ui/text-input';
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
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  image: string;
  cuisines: string[];
}

const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Chioma\'s Kitchen',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: '₦500',
    image: 'https://via.placeholder.com/200',
    cuisines: ['Nigerian', 'Continental'],
  },
  {
    id: '2',
    name: 'Pizza Palace',
    rating: 4.5,
    deliveryTime: '30-40 min',
    deliveryFee: '₦600',
    image: 'https://via.placeholder.com/200',
    cuisines: ['Italian', 'Pizza'],
  },
  {
    id: '3',
    name: 'Rice & Beans Co',
    rating: 4.7,
    deliveryTime: '20-30 min',
    deliveryFee: '₦400',
    image: 'https://via.placeholder.com/200',
    cuisines: ['Nigerian'],
  },
  {
    id: '4',
    name: 'Jollof Junction',
    rating: 4.9,
    deliveryTime: '25-35 min',
    deliveryFee: '₦500',
    image: 'https://via.placeholder.com/200',
    cuisines: ['Nigerian', 'West African'],
  },
];

export default function CustomerHomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      // Load data when screen is focused
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await customerService.getRestaurants();
      console.log('📦 Restaurants response:', response);
      
      // The API returns { success: true, count: X, data: [...] }
      if (response && response.data && Array.isArray(response.data)) {
        const formattedRestaurants = response.data.map((r: any) => ({
          id: r._id,
          name: r.name,
          rating: r.rating || 4.5,
          deliveryTime: r.deliveryTime || '25-35 min',
          deliveryFee: r.deliveryFee ? `₦${Math.round(r.deliveryFee)}` : '₦500',
          image: r.image,
          cuisines: r.cuisine || [],
        }));
        setRestaurants(formattedRestaurants);
      } else {
        console.log('⚠️ No restaurants from API');
        setRestaurants([]);
      }
    } catch (error) {
      console.error('Failed to load restaurants:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRestaurantPress = (restaurantId: string) => {
    router.push(`/(customer)/restaurant/${restaurantId}`);
  };

  const renderRestaurantCard = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      onPress={() => handleRestaurantPress(item.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.restaurantCard}>
        {/* Restaurant Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <MaterialIcons
              name="restaurant"
              size={48}
              color={colors.primary}
            />
          </View>
          <View style={styles.ratingBadge}>
            <MaterialIcons
              name="star"
              size={16}
              color="#fbbf24"
            />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text style={styles.cuisines}>{item.cuisines.join(', ')}</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MaterialIcons
                name="delivery-dining"
                size={16}
                color={colors.textMuted}
              />
              <Text style={styles.detailText}>{item.deliveryTime}</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container]}>
      <FlatList
        data={restaurants}
        renderItem={renderRestaurantCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Good Afternoon!</Text>
                <Text style={styles.location}>Lagos, Nigeria</Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <MaterialIcons
                  name="notifications"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchSection}>
              <TextInput
                placeholder="Search restaurants or dishes..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                icon={
                  <MaterialIcons
                    name="search"
                    size={20}
                    color={colors.primary}
                  />
                }
                containerStyle={styles.searchInput}
              />
            </View>

            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesSection}
              contentContainerStyle={styles.categoriesContent}
            >
              {['All', 'Nigerian', 'Pizza', 'Chinese', 'Fast Food'].map(
                (category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryChip,
                      index === 0 && styles.categoryChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        index === 0 && styles.categoryTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>

            {/* Restaurants Header */}
            <View style={styles.restaurantsHeader}>
              <Text style={styles.restaurantsTitle}>
                Available Restaurants
              </Text>
            </View>

            {/* Loading State */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading restaurants...</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="restaurant" size={64} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No restaurants found</Text>
              <Text style={styles.emptySubtitle}>
                Pull down to refresh or check back later
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
    },
    greeting: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    location: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 4,
    },
    notificationButton: {
      padding: 8,
    },
    searchSection: {
      marginBottom: 16,
    },
    searchInput: {
      marginBottom: 0,
    },
    categoriesSection: {
      marginBottom: 20,
    },
    categoriesContent: {
      gap: 8,
      paddingRight: 16,
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
    restaurantsHeader: {
      marginBottom: 12,
    },
    restaurantsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    restaurantCard: {
      overflow: 'hidden',
      marginBottom: 16,
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: 180,
      marginBottom: 12,
    },
    imagePlaceholder: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    ratingBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      flexDirection: 'row',
      backgroundColor: colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ratingText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    infoContainer: {
      paddingHorizontal: 0,
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    cuisines: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 8,
    },
    detailsRow: {
      flexDirection: 'row',
      gap: 16,
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
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 12,
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
