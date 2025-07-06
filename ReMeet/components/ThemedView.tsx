import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  githubColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, githubColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor, github: githubColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
