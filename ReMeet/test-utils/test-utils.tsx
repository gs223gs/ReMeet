/**
 * テストユーティリティ
 * ThemeProvider、TanStack QueryのQueryClientProvider、Jotai Providerなど必要なProviderを提供
 */
import React from 'react';
import { render, RenderOptions, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { ThemeProvider } from '@/contexts/ThemeContext';

/**
 * テスト用のQueryClientを作成
 * 各テストで独立したQueryClientを使用
 */
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // テスト中はリトライしない
      retry: false,
      // キャッシュ時間を0に設定してテストの独立性を保つ
      staleTime: 0,
      gcTime: 0,
    },
  },
});

/**
 * すべてのProviderでラップするWrapper
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // 各テストで新しいQueryClientを作成
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </JotaiProvider>
    </QueryClientProvider>
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
export { AllTheProviders as TestProviders };