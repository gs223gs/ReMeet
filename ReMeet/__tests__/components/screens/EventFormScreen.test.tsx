import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { EventFormScreen } from '@/components/screens/EventFormScreen';
import { EventService } from '@/database/sqlite-services';

// モック
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

jest.mock('@/database/sqlite-services', () => ({
  EventService: {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

// DateTimePickerをモック
jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="date-time-picker" {...props} />,
  };
});

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

// Alertをモック
jest.spyOn(Alert, 'alert');

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

describe('EventFormScreen', () => {
  const mockEvent = {
    id: 'event-1',
    name: 'テストイベント',
    date: new Date('2024-12-01'),
    location: 'テスト会場',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (EventService.findById as jest.Mock).mockResolvedValue(mockEvent);
    (EventService.create as jest.Mock).mockResolvedValue(mockEvent);
    (EventService.update as jest.Mock).mockResolvedValue(mockEvent);
  });

  describe('登録モード', () => {
    it('正しくレンダリングされる', () => {
      const { getByText, getByTestId } = renderWithProviders(
        <EventFormScreen title="イベント登録" />
      );

      expect(getByText('イベント登録')).toBeTruthy();
      expect(getByTestId('event-name-input')).toBeTruthy();
      expect(getByText('登録する')).toBeTruthy();
    });

    it('説明文が表示される', () => {
      const { getByText } = renderWithProviders(
        <EventFormScreen 
          title="イベント登録" 
          description="新しいイベントを登録します"
        />
      );

      expect(getByText('新しいイベントを登録します')).toBeTruthy();
    });

    it('フォーム送信で新規登録される', async () => {
      const { getByText, getByTestId } = renderWithProviders(
        <EventFormScreen title="イベント登録" />
      );

      const nameInput = getByTestId('event-name-input');
      const locationInput = getByTestId('event-location-input');
      const submitButton = getByText('登録する');

      fireEvent.changeText(nameInput, 'テストイベント');
      fireEvent.changeText(locationInput, 'テスト会場');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(EventService.create).toHaveBeenCalledWith({
          name: 'テストイベント',
          date: null,
          location: 'テスト会場',
        });
      });
    });
  });

  describe('編集モード', () => {
    it('編集モードで正しくレンダリングされる', async () => {
      const { getByText, getByTestId } = renderWithProviders(
        <EventFormScreen 
          title="イベント編集" 
          isEditMode={true}
          eventId="event-1"
        />
      );

      await waitFor(() => {
        expect(getByText('更新する')).toBeTruthy();
      });

      expect(EventService.findById).toHaveBeenCalledWith('event-1');
    });

    it('編集モードでEventServiceが呼ばれる', async () => {
      renderWithProviders(
        <EventFormScreen 
          title="イベント編集" 
          isEditMode={true}
          eventId="event-1"
        />
      );

      await waitFor(() => {
        expect(EventService.findById).toHaveBeenCalledWith('event-1');
      });
    });

    it('フォーム送信で更新される', async () => {
      const { getByText, getByTestId } = renderWithProviders(
        <EventFormScreen 
          title="イベント編集" 
          isEditMode={true}
          eventId="event-1"
        />
      );

      // まずデータが読み込まれるのを待つ
      await waitFor(() => {
        expect(EventService.findById).toHaveBeenCalledWith('event-1');
      });

      // フォームが表示されるのを待つ
      await waitFor(() => {
        expect(getByText('更新する')).toBeTruthy();
      });

      const nameInput = getByTestId('event-name-input');
      fireEvent.changeText(nameInput, '更新されたイベント');

      const submitButton = getByText('更新する');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(EventService.update).toHaveBeenCalledWith({
          id: 'event-1',
          name: '更新されたイベント',
          date: null,
          location: null,
        });
      });
    });

    it('eventIdが指定されていない場合エラーが表示される', () => {
      const { getByText } = renderWithProviders(
        <EventFormScreen 
          title="イベント編集" 
          isEditMode={true}
        />
      );

      expect(getByText('イベントIDが指定されていません')).toBeTruthy();
    });
  });

  describe('エラーハンドリング', () => {
    it('登録エラー時にアラートが表示される', async () => {
      (EventService.create as jest.Mock).mockRejectedValue(new Error('登録エラー'));

      const { getByText, getByTestId } = renderWithProviders(
        <EventFormScreen title="イベント登録" />
      );

      const nameInput = getByTestId('event-name-input');
      const submitButton = getByText('登録する');

      fireEvent.changeText(nameInput, 'テストイベント');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('エラー', '登録エラー');
      });
    });


    it('編集モードでeventIdがない場合のエラー処理', async () => {
      const { getByText, getByTestId } = renderWithProviders(
        <EventFormScreen 
          title="イベント編集" 
          isEditMode={true}
        />
      );

      // この場合、フォームは表示されずエラーメッセージが表示される
      expect(getByText('イベントIDが指定されていません')).toBeTruthy();
    });
  });

  describe('成功時の処理', () => {
    it('登録成功時にアラートが表示される', async () => {
      const { getByText, getByTestId } = renderWithProviders(
        <EventFormScreen title="イベント登録" />
      );

      const nameInput = getByTestId('event-name-input');
      const submitButton = getByText('登録する');

      fireEvent.changeText(nameInput, 'テストイベント');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          '成功',
          'イベントを登録しました',
          expect.any(Array)
        );
      });
    });

  });
});