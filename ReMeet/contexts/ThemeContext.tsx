import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeType } from '@/hooks/useColorScheme';

const THEME_STORAGE_KEY = '@ReMeet:theme';

interface ThemeContextType {
  colorScheme: ColorSchemeType;
  toggleColorScheme: (theme: ColorSchemeType) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorSchemeType>('light');

  // 初回ロード時にテーマを読み込む
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'github'].includes(savedTheme)) {
          setColorScheme(savedTheme as ColorSchemeType);
        }
      } catch (error) {
        console.error('テーマの読み込みに失敗しました:', error);
      }
    };
    loadTheme();
  }, []);

  // テーマを切り替える
  const toggleColorScheme = async (theme: ColorSchemeType) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setColorScheme(theme);
    } catch (error) {
      console.error('テーマの保存に失敗しました:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};