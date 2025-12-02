import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);

  const buttonStyle: ViewStyle = [
    styles.button,
    styles[`button_${variant}`],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyleFinal: TextStyle = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_size_${size}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.surface : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyleFinal}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    button: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    button_primary: {
      backgroundColor: colors.primary,
    },
    button_secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    button_outline: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
    },
    button_ghost: {
      backgroundColor: 'transparent',
    },
    size_sm: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    size_md: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    size_lg: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      minHeight: 56,
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontSize: 16,
      fontWeight: '600',
    },
    text_primary: {
      color: colors.surface,
    },
    text_secondary: {
      color: colors.text,
    },
    text_outline: {
      color: colors.primary,
    },
    text_ghost: {
      color: colors.text,
    },
    text_size_sm: {
      fontSize: 14,
    },
    text_size_md: {
      fontSize: 16,
    },
    text_size_lg: {
      fontSize: 18,
    },
    textDisabled: {
      opacity: 0.6,
    },
  });
