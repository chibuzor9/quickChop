import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RoleOption {
  id: 'customer' | 'rider' | 'restaurant';
  title: string;
  description: string;
  icon: string;
}

const roles: RoleOption[] = [
  {
    id: 'customer',
    title: 'Customer',
    description: 'Order food from your favorite restaurants',
    icon: 'shopping-bag',
  },
  {
    id: 'rider',
    title: 'Delivery Rider',
    description: 'Earn money by delivering orders',
    icon: 'two-wheeler',
  },
  {
    id: 'restaurant',
    title: 'Restaurant Partner',
    description: 'Manage your restaurant and orders',
    icon: 'restaurant',
  },
];

export default function RoleSelectScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (roleId: string) => {
    setSelectedRole(roleId);
    setLoading(true);

    try {
      // Simulate API call to set user role
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to appropriate app
      if (roleId === 'customer') {
        router.push('/(customer)');
      } else if (roleId === 'rider') {
        router.push('/(rider)');
      } else if (roleId === 'restaurant') {
        router.push('/(restaurant)');
      }
    } catch (error) {
      setSelectedRole(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you want to use QuickChop
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => handleRoleSelect(role.id)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Card
                style={[
                  styles.roleCard,
                  selectedRole === role.id && styles.roleCardSelected,
                ]}
              >
                <MaterialIcons
                  name={role.icon}
                  size={48}
                  color={
                    selectedRole === role.id ? colors.primary : colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.roleTitle,
                    selectedRole === role.id && styles.roleTitleSelected,
                  ]}
                >
                  {role.title}
                </Text>
                <Text style={styles.roleDescription}>{role.description}</Text>

                {selectedRole === role.id && (
                  <View style={styles.selectedBadge}>
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        {selectedRole && (
          <Button
            title={loading ? 'Continuing...' : 'Continue'}
            variant="primary"
            size="lg"
            onPress={() => handleRoleSelect(selectedRole)}
            loading={loading}
            disabled={loading}
            style={styles.continueButton}
          />
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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerSection: {
      marginBottom: 24,
    },
    titleSection: {
      marginBottom: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textMuted,
    },
    rolesContainer: {
      gap: 16,
      marginBottom: 24,
    },
    roleCard: {
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    roleCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    roleTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginTop: 12,
      marginBottom: 8,
    },
    roleTitleSelected: {
      color: colors.primary,
    },
    roleDescription: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
    selectedBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
    },
    continueButton: {
      marginBottom: 32,
    },
  });
