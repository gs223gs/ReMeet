import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function BlurTabBarBackground() {
  const { colorScheme } = useColorScheme();
  
  // テーマに応じてBlurViewのtintを設定
  const getTintStyle = () => {
    switch (colorScheme) {
      case 'dark':
        return 'systemMaterialDark';
      case 'github':
        return 'systemMaterialLight';
      case 'light':
      default:
        return 'systemMaterialLight';
    }
  };

  return (
    <BlurView
      tint={getTintStyle()}
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
