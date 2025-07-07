import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EventsScreen from '@/app/(tabs)/events';
import { EventService } from '@/database/sqlite-services';
import { useRouter } from 'expo-router';

// モック
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/database/sqlite-services', () => ({
  EventService: {
    findAll: jest.fn(),
  },
}));

// ThemedTextとThemedViewをモック
jest.mock('@/components/ThemedText', () => {
  const { Text } = require('react-native');
  return {
    ThemedText: (props: any) => <Text {...props} />,
  };
});

jest.mock('@/components/ThemedView', () => {
  const { View } = require('react-native');
  return {
    ThemedView: (props: any) => <View {...props} />,
  };
});

// useThemeColorをモック
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#000000',
}));

// カスタムレンダラー
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('EventsScreen', () => {
  const mockPush = jest.fn();
  const mockEvents = [
    {
      id: 'event-1',
      name: 'React Conference 2024',
      date: new Date('2024-12-01'),
      location: '東京国際フォーラム',
    },
    {
      id: 'event-2',
      name: 'Design Workshop',
      date: new Date('2024-11-15'),
      location: 'オンライン',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (EventService.findAll as jest.Mock).mockResolvedValue(mockEvents);
  });

  it('正しくレンダリングされる', async () => {
    const { getByText, getByTestId } = renderWithProviders(<EventsScreen />);

    await waitFor(() => {
      expect(getByText('イベント')).toBeTruthy();
      expect(getByText('2件のイベントが登録されています')).toBeTruthy();
      expect(getByTestId('add-event-button')).toBeTruthy();
    });
  });

  it('イベント一覧が表示される', async () => {
    const { getByText } = renderWithProviders(<EventsScreen />);

    await waitFor(() => {
      expect(getByText('React Conference 2024')).toBeTruthy();
      expect(getByText('Design Workshop')).toBeTruthy();
      expect(getByText(/東京国際フォーラム/)).toBeTruthy();
      expect(getByText(/オンライン/)).toBeTruthy();
    });
  });

  it('追加ボタンをクリックするとイベント登録画面に遷移する', async () => {
    const { getByTestId } = renderWithProviders(<EventsScreen />);

    await waitFor(() => {
      const addButton = getByTestId('add-event-button');
      fireEvent.press(addButton);
      
      expect(mockPush).toHaveBeenCalledWith('/event-register');
    });
  });

  it('イベントがない場合、空の状態が表示される', async () => {
    (EventService.findAll as jest.Mock).mockResolvedValue([]);
    
    const { getByText } = renderWithProviders(<EventsScreen />);

    await waitFor(() => {
      expect(getByText('まだイベントが登録されていません')).toBeTruthy();
      expect(getByText('「+」ボタンから新しいイベントを追加してください')).toBeTruthy();
    });
  });

  it('読み込み中の状態が表示される', () => {
    const { getByText } = renderWithProviders(<EventsScreen />);
    
    expect(getByText('読み込み中...')).toBeTruthy();
  });

  it('エラー時の状態が表示される', async () => {
    (EventService.findAll as jest.Mock).mockRejectedValue(new Error('読み込みエラー'));
    
    const { getByText } = renderWithProviders(<EventsScreen />);

    await waitFor(() => {
      expect(getByText('イベントの読み込みに失敗しました')).toBeTruthy();
    });
  });

  it('日付が正しい形式で表示される', async () => {
    const { getByText } = renderWithProviders(<EventsScreen />);

    await waitFor(() => {
      // 日本語の日付形式をチェック
      expect(getByText(/2024年12月1日/)).toBeTruthy();
      expect(getByText(/2024年11月15日/)).toBeTruthy();
    });
  });

  it('FlatListが正しく設定されている', async () => {
    const { getByTestId } = renderWithProviders(<EventsScreen />);

    await waitFor(() => {
      const flatList = getByTestId('events-flatlist');
      expect(flatList).toBeTruthy();
      expect(flatList.props.data).toEqual(mockEvents);
      expect(flatList.props.refreshing).toBe(false);
    });
  });
});