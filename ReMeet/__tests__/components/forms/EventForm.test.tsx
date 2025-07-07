import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { EventForm } from '@/components/forms/EventForm';
import { EventRegistrationFormData } from '@/types/eventForms';

// DateTimePickerをモック
jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="date-time-picker" {...props} />,
  };
});

// ThemedTextをモック
jest.mock('@/components/ThemedText', () => {
  const { Text } = require('react-native');
  return {
    ThemedText: (props: any) => <Text {...props} />,
  };
});

// useThemeColorをモック
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#000000',
}));

describe('EventForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正しくレンダリングされる', () => {
    const { getByTestId, getByText } = render(
      <EventForm onSubmit={mockOnSubmit} />
    );

    expect(getByTestId('event-name-input')).toBeTruthy();
    expect(getByTestId('event-location-input')).toBeTruthy();
    expect(getByTestId('date-picker-button')).toBeTruthy();
    expect(getByText('登録する')).toBeTruthy();
  });

  it('編集モードで「更新する」ボタンが表示される', () => {
    const { getByText } = render(
      <EventForm onSubmit={mockOnSubmit} isEditMode={true} />
    );

    expect(getByText('更新する')).toBeTruthy();
  });

  it('初期値が正しく設定される', () => {
    const initialData: Partial<EventRegistrationFormData> = {
      name: '初期イベント',
      date: new Date('2024-12-01'),
      location: '初期会場',
    };

    const { getByTestId } = render(
      <EventForm onSubmit={mockOnSubmit} initialData={initialData} />
    );

    const nameInput = getByTestId('event-name-input');
    expect(nameInput.props.value).toBe('初期イベント');

    const locationInput = getByTestId('event-location-input');
    expect(locationInput.props.value).toBe('初期会場');
  });

  it('必須フィールドが空の場合エラーメッセージが表示される', async () => {
    const { getByText, getByTestId } = render(
      <EventForm onSubmit={mockOnSubmit} />
    );

    const submitButton = getByText('登録する');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('イベント名は必須です')).toBeTruthy();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('有効なデータで送信できる', async () => {
    const { getByText, getByTestId } = render(
      <EventForm onSubmit={mockOnSubmit} />
    );

    const nameInput = getByTestId('event-name-input');
    const locationInput = getByTestId('event-location-input');

    fireEvent.changeText(nameInput, 'テストイベント');
    fireEvent.changeText(locationInput, 'テスト会場');

    const submitButton = getByText('登録する');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'テストイベント',
        date: null,
        location: 'テスト会場',
      });
    });
  });

  it('日付選択ボタンをクリックするとDateTimePickerが表示される', () => {
    const { getByTestId, queryByTestId } = render(
      <EventForm onSubmit={mockOnSubmit} />
    );

    // 初期状態では表示されない
    expect(queryByTestId('date-time-picker')).toBeFalsy();

    const dateButton = getByTestId('date-picker-button');
    fireEvent.press(dateButton);

    // クリック後は表示される
    expect(getByTestId('date-time-picker')).toBeTruthy();
  });

  it('日付をクリアできる', () => {
    const initialData: Partial<EventRegistrationFormData> = {
      name: 'テスト',
      date: new Date('2024-12-01'),
    };

    const { getByTestId, queryByTestId } = render(
      <EventForm onSubmit={mockOnSubmit} initialData={initialData} />
    );

    // クリアボタンが表示されている
    expect(getByTestId('clear-date-button')).toBeTruthy();

    const clearButton = getByTestId('clear-date-button');
    fireEvent.press(clearButton);

    // クリア後はボタンが非表示になる
    expect(queryByTestId('clear-date-button')).toBeFalsy();
  });

  it('送信中は送信ボタンが無効になる', () => {
    const { getByText } = render(
      <EventForm onSubmit={mockOnSubmit} isSubmitting={true} />
    );

    const submitButton = getByText('登録する');
    expect(submitButton.props.disabled).toBe(true);
  });

  it('イベント名が100文字を超える場合エラーが表示される', async () => {
    const { getByText, getByTestId } = render(
      <EventForm onSubmit={mockOnSubmit} />
    );

    const nameInput = getByTestId('event-name-input');
    const longName = 'あ'.repeat(101);
    
    fireEvent.changeText(nameInput, longName);
    
    const submitButton = getByText('登録する');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('イベント名は100文字以内で入力してください')).toBeTruthy();
    });
  });

  it('開催場所が200文字を超える場合エラーが表示される', async () => {
    const { getByText, getByTestId } = render(
      <EventForm onSubmit={mockOnSubmit} />
    );

    const nameInput = getByTestId('event-name-input');
    const locationInput = getByTestId('event-location-input');
    const longLocation = 'あ'.repeat(201);
    
    fireEvent.changeText(nameInput, 'テストイベント');
    fireEvent.changeText(locationInput, longLocation);
    
    const submitButton = getByText('登録する');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('開催場所は200文字以内で入力してください')).toBeTruthy();
    });
  });
});