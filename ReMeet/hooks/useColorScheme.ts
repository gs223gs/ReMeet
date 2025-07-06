import { useTheme } from '@/contexts/ThemeContext';

export type ColorSchemeType = 'light' | 'dark' | 'github';

/**
 * カスタムカラースキームフック
 * ThemeContextから現在のテーマを取得する
 */
export const useColorScheme = () => {
  return useTheme();
};