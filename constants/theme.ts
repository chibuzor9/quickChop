/**
 * QuickChop Theme Colors
 * Orange-themed food delivery app colors
 */

import { Platform } from 'react-native';

// Primary orange color for QuickChop branding
const primaryOrange = '#F97316'; // Vibrant orange
const primaryOrangeDark = '#EA580C'; // Slightly darker for dark mode

export const Colors = {
  light: {
        // Primary brand colors
        primary: primaryOrange,
        primaryDark: '#EA580C',
        primaryLight: '#FFEDD5',

        // Text colors
        text: '#1F2937',
        textMuted: '#6B7280',
        textLight: '#9CA3AF',

        // Background colors
        background: '#FFFFFF',
        surface: '#F9FAFB',
        surfaceHover: '#F3F4F6',

        // Border colors
        border: '#E5E7EB',
        borderLight: '#F3F4F6',

        // Status colors
        success: '#22C55E',
        successLight: '#DCFCE7',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        error: '#EF4444',
        errorLight: '#FEE2E2',
        info: '#3B82F6',
        infoLight: '#DBEAFE',

        // Legacy support
        tint: primaryOrange,
        icon: '#6B7280',
        tabIconDefault: '#6B7280',
        tabIconSelected: primaryOrange,
  },
  dark: {
      // Primary brand colors
      primary: primaryOrange,
      primaryDark: '#C2410C',
      primaryLight: '#431407',

      // Text colors
      text: '#F9FAFB',
      textMuted: '#9CA3AF',
      textLight: '#6B7280',

      // Background colors
      background: '#111827',
      surface: '#1F2937',
      surfaceHover: '#374151',

      // Border colors
      border: '#374151',
      borderLight: '#1F2937',

      // Status colors
      success: '#22C55E',
      successLight: '#14532D',
      warning: '#F59E0B',
      warningLight: '#78350F',
      error: '#EF4444',
      errorLight: '#7F1D1D',
      info: '#3B82F6',
      infoLight: '#1E3A8A',

      // Legacy support
      tint: primaryOrange,
      icon: '#9CA3AF',
      tabIconDefault: '#9CA3AF',
      tabIconSelected: primaryOrange,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
