import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PersonRegistrationForm } from '../../../components/forms/PersonRegistrationForm';

// useThemeColorフックをモック
jest.mock('../../../hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

describe('PersonRegistrationForm', () => {
  // Arrange（準備）フェーズで使用する共通のプロパティ
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    // 各テストの前にモック関数をリセット
    mockOnSubmit.mockClear();
  });

  it('全ての必須フィールドが表示される', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId } = render(
      <PersonRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    // Assert（検証）
    expect(getByTestId('name-input')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeTruthy();
  });

  it('全ての任意フィールドが表示される', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId } = render(
      <PersonRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    // Assert（検証）
    expect(getByTestId('handle-input')).toBeTruthy();
    expect(getByTestId('company-input')).toBeTruthy();
    expect(getByTestId('position-input')).toBeTruthy();
    expect(getByTestId('description-input')).toBeTruthy();
    expect(getByTestId('product-name-input')).toBeTruthy();
    expect(getByTestId('github-id-input')).toBeTruthy();
    expect(getByTestId('tags-input')).toBeTruthy();
    expect(getByTestId('nfc-id-input')).toBeTruthy();
    expect(getByTestId('memo-input')).toBeTruthy();
  });

  it('有効な入力で送信が成功する', async () => {
    // Arrange（準備）
    const validData = {
      name: '山田太郎',
      handle: '@yamada',
      company: '株式会社テスト',
      position: 'エンジニア',
      description: 'React開発者です',
      product_name: 'テストアプリ',
      github_id: 'yamada-taro',
      tags: 'React, TypeScript',
      nfc_id: 'nfc123',
      memo: 'テストメモ',
    };
    
    // Act（実行）
    const { getByTestId } = render(
      <PersonRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    // 各フィールドに入力
    fireEvent.changeText(getByTestId('name-input'), validData.name);
    fireEvent.changeText(getByTestId('handle-input'), validData.handle);
    fireEvent.changeText(getByTestId('company-input'), validData.company);
    fireEvent.changeText(getByTestId('position-input'), validData.position);
    fireEvent.changeText(getByTestId('description-input'), validData.description);
    fireEvent.changeText(getByTestId('product-name-input'), validData.product_name);
    fireEvent.changeText(getByTestId('github-id-input'), validData.github_id);
    
    // タグを入力（Enterキーで追加）
    const tags = validData.tags.split(', ');
    for (const tag of tags) {
      fireEvent.changeText(getByTestId('tags-input'), tag);
      fireEvent.press(getByTestId('tags-input-add-button'));
    }
    
    fireEvent.changeText(getByTestId('nfc-id-input'), validData.nfc_id);
    fireEvent.changeText(getByTestId('memo-input'), validData.memo);
    
    // 送信ボタンをクリック
    fireEvent.press(getByTestId('submit-button'));
    
    // Assert（検証）
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      const actualCall = mockOnSubmit.mock.calls[0][0];
      expect(actualCall).toEqual(validData);
    });
  });

  it('名前が空の場合、エラーが表示される', async () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId, getByText } = render(
      <PersonRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    // 送信ボタンをクリック（名前は空のまま）
    fireEvent.press(getByTestId('submit-button'));
    
    // Assert（検証）
    await waitFor(() => {
      expect(getByText('名前は必須です')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('名前が100文字を超える場合、エラーが表示される', async () => {
    // Arrange（準備）
    const longName = 'あ'.repeat(101); // 101文字の名前
    
    // Act（実行）
    const { getByTestId, getByText } = render(
      <PersonRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    fireEvent.changeText(getByTestId('name-input'), longName);
    fireEvent.press(getByTestId('submit-button'));
    
    // Assert（検証）
    await waitFor(() => {
      expect(getByText('名前は100文字以内で入力してください')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('GitHub IDに無効な文字が含まれる場合、エラーが表示される', async () => {
    // Arrange（準備）
    const invalidGitHubId = 'invalid@id'; // @は無効な文字
    
    // Act（実行）
    const { getByTestId, getByText } = render(
      <PersonRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    fireEvent.changeText(getByTestId('name-input'), '山田太郎'); // 必須項目
    fireEvent.changeText(getByTestId('github-id-input'), invalidGitHubId);
    fireEvent.press(getByTestId('submit-button'));
    
    // Assert（検証）
    await waitFor(() => {
      expect(getByText('GitHub IDは1-39文字で、英数字とハイフンのみ使用可能です。先頭末尾にハイフン、連続ハイフンは使用できません')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('GitHub IDが先頭にハイフンを含む場合、エラーが表示される', async () => {
    // Arrange（準備）
    const invalidGitHubId = '-invalid'; // 先頭ハイフンは無効
    
    // Act（実行）
    const { getByTestId, getByText } = render(
      <PersonRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    fireEvent.changeText(getByTestId('name-input'), '山田太郎'); // 必須項目
    fireEvent.changeText(getByTestId('github-id-input'), invalidGitHubId);
    fireEvent.press(getByTestId('submit-button'));
    
    // Assert（検証）
    await waitFor(() => {
      expect(getByText('GitHub IDは1-39文字で、英数字とハイフンのみ使用可能です。先頭末尾にハイフン、連続ハイフンは使用できません')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('GitHub IDが末尾にハイフンを含む場合、エラーが表示される', async () => {
    // Arrange（準備）
    const invalidGitHubId = 'invalid-'; // 末尾ハイフンは無効
    
    // Act（実行）
    const { getByTestId, getByText } = render(
      <PersonRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    fireEvent.changeText(getByTestId('name-input'), '山田太郎'); // 必須項目
    fireEvent.changeText(getByTestId('github-id-input'), invalidGitHubId);
    fireEvent.press(getByTestId('submit-button'));
    
    // Assert（検証）
    await waitFor(() => {
      expect(getByText('GitHub IDは1-39文字で、英数字とハイフンのみ使用可能です。先頭末尾にハイフン、連続ハイフンは使用できません')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('GitHub IDが連続ハイフンを含む場合、エラーが表示される', async () => {
    // Arrange（準備）
    const invalidGitHubId = 'inval--id'; // 連続ハイフンは無効
    
    // Act（実行）
    const { getByTestId, getByText } = render(
      <PersonRegistrationForm onSubmit={mockOnSubmit} />
    );
    
    fireEvent.changeText(getByTestId('name-input'), '山田太郎'); // 必須項目
    fireEvent.changeText(getByTestId('github-id-input'), invalidGitHubId);
    fireEvent.press(getByTestId('submit-button'));
    
    // Assert（検証）
    await waitFor(() => {
      expect(getByText('GitHub IDは1-39文字で、英数字とハイフンのみ使用可能です。先頭末尾にハイフン、連続ハイフンは使用できません')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('有効なGitHub IDの場合、エラーが表示されない', async () => {
    // Arrange（準備）
    const validGitHubIds = [
      'user',
      'user123',
      'user-name',
      'a', // 1文字
      'a'.repeat(39), // 39文字
    ];
    
    for (const validId of validGitHubIds) {
      // Act（実行）
      const { getByTestId, queryByText } = render(
        <PersonRegistrationForm onSubmit={mockOnSubmit} />
      );
      
      fireEvent.changeText(getByTestId('name-input'), '山田太郎'); // 必須項目
      fireEvent.changeText(getByTestId('github-id-input'), validId);
      fireEvent.press(getByTestId('submit-button'));
      
      // Assert（検証）
      await waitFor(() => {
        expect(queryByText('GitHub IDは1-39文字で、英数字とハイフンのみ使用可能です。先頭末尾にハイフン、連続ハイフンは使用できません')).toBeNull();
      });
    }
  });

  it('送信中は送信ボタンが無効になる', () => {
    // Arrange（準備）
    const isSubmitting = true;
    
    // Act（実行）
    const { getByTestId } = render(
      <PersonRegistrationForm onSubmit={mockOnSubmit} isSubmitting={isSubmitting} />
    );
    
    const submitButton = getByTestId('submit-button');
    
    // Assert（検証）
    expect(submitButton.props.accessibilityState.disabled).toBe(true);
  });

  it('初期値が設定される', () => {
    // Arrange（準備）
    const initialData = {
      name: '初期名前',
      company: '初期会社',
      github_id: 'initial-user',
      tags: 'JavaScript, Node.js',
    };
    
    // Act（実行）
    const { getByTestId } = render(
      <PersonRegistrationForm 
        onSubmit={mockOnSubmit} 
        initialData={initialData}
      />
    );
    
    // Assert（検証）
    expect(getByTestId('name-input').props.value).toBe(initialData.name);
    expect(getByTestId('company-input').props.value).toBe(initialData.company);
    expect(getByTestId('github-id-input').props.value).toBe(initialData.github_id);
    // タグの初期値は選択済みタグとして表示される
    expect(getByTestId('tags-input').props.value).toBe(''); // 入力フィールドは空
  });
});