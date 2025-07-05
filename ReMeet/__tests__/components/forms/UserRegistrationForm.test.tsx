import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { UserRegistrationForm } from '../../../components/forms/UserRegistrationForm';

// useThemeColorフックをモック
jest.mock('../../../hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

describe('UserRegistrationForm', () => {
  // Arrange（準備）フェーズで使用する共通のプロパティ
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    // 各テストの前にモック関数をリセット
    mockOnSubmit.mockClear();
  });

  it('全てのフィールドが表示される', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId } = render(
      <UserRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    // Assert（検証）
    expect(getByTestId('name-input')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('password-confirmation-input')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeTruthy();
  });

  it('有効な入力で送信が成功する', async () => {
    // Arrange（準備）
    const validData = {
      name: '山田太郎',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    };
    
    // Act（実行）
    const { getByTestId } = render(
      <UserRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    // 各フィールドに入力
    fireEvent.changeText(getByTestId('name-input'), validData.name);
    fireEvent.changeText(getByTestId('email-input'), validData.email);
    fireEvent.changeText(getByTestId('password-input'), validData.password);
    fireEvent.changeText(
      getByTestId('password-confirmation-input'), 
      validData.passwordConfirmation
    );
    
    // 送信ボタンをクリック
    fireEvent.press(getByTestId('submit-button'));
    
    // Assert（検証）
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      const actualCall = mockOnSubmit.mock.calls[0][0];
      expect(actualCall).toEqual(validData);
    });
  });

  it('必須フィールドが空の場合、エラーが表示される', async () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId, getByText } = render(
      <UserRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    // 送信ボタンをクリック（フィールドは空のまま）
    fireEvent.press(getByTestId('submit-button'));
    
    // Assert（検証）
    await waitFor(() => {
      expect(getByText('名前は必須です')).toBeTruthy();
      expect(getByText('メールアドレスは必須です')).toBeTruthy();
      expect(getByText('パスワードは8文字以上で入力してください')).toBeTruthy();
      expect(getByText('パスワード確認は必須です')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('無効なメールアドレスの場合、エラーが表示される', async () => {
    // Arrange（準備）
    const invalidEmail = 'invalid-email';
    
    // Act（実行）
    const { getByTestId, getByText } = render(
      <UserRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    fireEvent.changeText(getByTestId('email-input'), invalidEmail);
    fireEvent.press(getByTestId('submit-button'));
    
    // Assert（検証）
    await waitFor(() => {
      expect(getByText('有効なメールアドレスを入力してください')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('パスワードが一致しない場合、エラーが表示される', async () => {
    // Arrange（準備）
    const password = 'password123';
    const differentPassword = 'password456';
    
    // Act（実行）
    const { getByTestId, getByText } = render(
      <UserRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    fireEvent.changeText(getByTestId('password-input'), password);
    fireEvent.changeText(
      getByTestId('password-confirmation-input'), 
      differentPassword
    );
    fireEvent.press(getByTestId('submit-button'));
    
    // Assert（検証）
    await waitFor(() => {
      expect(getByText('パスワードが一致しません')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('送信中は送信ボタンが無効になる', () => {
    // Arrange（準備）
    const isSubmitting = true;
    
    // Act（実行）
    const { getByTestId } = render(
      <UserRegistrationForm onSubmit={mockOnSubmit} isSubmitting={isSubmitting} />
    );
    
    const submitButton = getByTestId('submit-button');
    
    // Assert（検証）
    expect(submitButton.props.accessibilityState.disabled).toBe(true);
  });
});