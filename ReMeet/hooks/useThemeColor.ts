/**
 * テーマカラーを取得するカスタムフック
 * light、dark、githubの3つのテーマに対応
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme, ColorSchemeType } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string; github?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark & keyof typeof Colors.github
) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colorFromProps = props[theme as keyof typeof props];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
