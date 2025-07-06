import { View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

/**
 * Android/Web用のTabBarBackground
 * テーマに応じた背景色を適用
 */
export default function TabBarBackground() {
  const tabBarBackground = useThemeColor({}, 'tabBarBackground');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: tabBarBackground,
        borderTopWidth: 1,
        borderTopColor: borderColor,
      }}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
