/**
 * テストユーティリティ
 * ThemeProviderやその他の必要なProviderを提供
 */
import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '@/contexts/ThemeContext';

/**
 * すべてのProviderでラップするWrapper
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

/**
 * カスタムrender関数
 * 自動的にThemeProviderでラップする
 */
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };