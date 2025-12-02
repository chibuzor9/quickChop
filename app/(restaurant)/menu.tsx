import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextInput } from '@/components/ui/text-input';
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
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    preparationTime: number;
    isAvailable: boolean;
}

export default function MenuManagementScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [preparationTime, setPreparationTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadMenu();
    }, [])
  );

  const loadMenu = async () => {
    try {
      const response = await restaurantService.getMenu();
      if (response.data && response.data.data) {
        setMenuItems(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to load menu:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load menu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMenu();
  };

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setPreparationTime('');
    setIsAvailable(true);
    setModalVisible(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setPreparationTime(item.preparationTime.toString());
    setIsAvailable(item.isAvailable);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !category.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      const itemData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        preparationTime: preparationTime ? parseInt(preparationTime) : 0,
        isAvailable,
      };

      if (editingItem) {
        await restaurantService.updateMenuItem(editingItem._id, itemData);
        Alert.alert('Success', 'Menu item updated successfully');
      } else {
        await restaurantService.addMenuItem(itemData);
        Alert.alert('Success', 'Menu item added successfully');
      }

      setModalVisible(false);
      loadMenu();
    } catch (error: any) {
      console.error('Failed to save menu item:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: MenuItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await restaurantService.deleteMenuItem(item._id);
              Alert.alert('Success', 'Menu item deleted');
              loadMenu();
            } catch (error: any) {
              console.error('Failed to delete item:', error);
              Alert.alert('Error', 'Failed to delete menu item');
            }
          },
        },
      ]
    );
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await restaurantService.updateMenuItem(item._id, {
        isAvailable: !item.isAvailable,
      });
      loadMenu();
    } catch (error: any) {
      console.error('Failed to update availability:', error);
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <Card style={styles.menuCard}>
      <View style={styles.menuCardContent}>
        <View style={styles.menuItemIcon}>
          <MaterialIcons name="restaurant" size={32} color={colors.primary} />
        </View>

        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.menuItemMeta}>
            <Text style={styles.menuItemPrice}>₦{Math.round(item.price).toLocaleString('en-NG')}</Text>
            <Text style={styles.menuItemCategory}>{item.category}</Text>
          </View>
          {item.preparationTime > 0 && (
            <Text style={styles.prepTime}>~{item.preparationTime} min</Text>
          )}
        </View>

        <View style={styles.menuItemActions}>
          <Switch
            value={item.isAvailable}
            onValueChange={() => toggleAvailability(item)}
            trackColor={{ false: '#d1d5db', true: colors.primary }}
            thumbColor={colors.surface}
          />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openEditModal(item)}
          >
            <MaterialIcons name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {!item.isAvailable && (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const categories = [...new Set(menuItems.map((item) => item.category))];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Management</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{menuItems.length}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{categories.length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {menuItems.filter((item) => item.isAvailable).length}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
      </View>

      {/* Menu List */}
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="restaurant-menu" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Menu Items</Text>
            <Text style={styles.emptySubtitle}>
              Add your first menu item to get started
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.emptyButtonText}>Add Menu Item</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'Add Item'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              label="Item Name *"
              placeholder="e.g., Jollof Rice"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              label="Description"
              placeholder="Brief description of the item"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Price *"
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />

            <TextInput
              label="Category *"
              placeholder="e.g., Main Dish, Drinks"
              value={category}
              onChangeText={setCategory}
            />

            <TextInput
              label="Preparation Time (minutes)"
              placeholder="0"
              value={preparationTime}
              onChangeText={setPreparationTime}
              keyboardType="number-pad"
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Available</Text>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: '#d1d5db', true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                title={saving ? 'Saving...' : 'Save'}
                variant="primary"
                size="lg"
                onPress={handleSave}
                disabled={saving}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    addButton: {
      padding: 4,
    },
    statsSection: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },
    listContent: {
      padding: 16,
    },
    menuCard: {
      marginBottom: 16,
      position: 'relative',
    },
    menuCardContent: {
      flexDirection: 'row',
      gap: 12,
    },
    menuItemIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
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
      marginBottom: 6,
    },
    menuItemMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuItemPrice: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    menuItemCategory: {
      fontSize: 12,
      color: colors.textMuted,
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
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
    iconButton: {
      padding: 8,
    },
    unavailableBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: '#fee2e2',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    unavailableText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#dc2626',
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
      marginBottom: 24,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    emptyButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.surface,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    modalContent: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      marginTop: 8,
    },
    switchLabel: {
      fontSize: 16,
      color: colors.text,
    },
    modalButtons: {
      marginTop: 24,
      marginBottom: 32,
    },
  });
