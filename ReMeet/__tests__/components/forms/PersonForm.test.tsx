import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PersonForm } from '../../../components/forms/PersonForm';

// useThemeColorフックをモック
jest.mock('../../../hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

describe('PersonForm', () => {
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
      <PersonForm onSubmit={mockOnSubmit} />
    );
    
    // Assert（検証）
    expect(getByTestId('name-input')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeTruthy();
  });

  it('全ての任意フィールドが表示される', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId } = render(
      <PersonForm onSubmit={mockOnSubmit} />
    );
    
    // Assert（検証）
    expect(getByTestId('handle-input')).toBeTruthy();
    expect(getByTestId('company-input')).toBeTruthy();
    expect(getByTestId('position-input')).toBeTruthy();
    expect(getByTestId('description-input')).toBeTruthy();
    expect(getByTestId('product-name-input')).toBeTruthy();
    expect(getByTestId('github-id-input')).toBeTruthy();
    expect(getByTestId('tags-input')).toBeTruthy();
    expect(getByTestId('memo-input')).toBeTruthy();
  });

  it('編集モードでは「更新する」ボタンが表示される', async () => {
    // Arrange
    const mockOnSubmit = jest.fn();
    
    // Act
    const { getByTestId } = render(
      <PersonForm 
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        availableTags={['React', 'TypeScript']}
        isEditMode={true}
      />
    );

    // Assert
    const submitButton = getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('更新する');
  });

  it('登録モードでは「登録する」ボタンが表示される', async () => {
    // Arrange
    const mockOnSubmit = jest.fn();
    
    // Act
    const { getByTestId } = render(
      <PersonForm 
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        availableTags={['React', 'TypeScript']}
        isEditMode={false}
      />
    );

    // Assert
    const submitButton = getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('登録する');
  });

  it('有効な入力で送信が成功する', async () => {
    // Arrange（準備）
    const validData = {
      name: '山田太郎',
      handle: '@yamada',
      company: '株式会社テスト',
      position: 'エンジニア',
      description: 'React開発者です',
      productName: 'テストアプリ',
      githubId: 'yamada-taro',
      tags: 'React, TypeScript',
      memo: 'テストメモ',
    };
    
    // Act（実行）
    const { getByTestId } = render(
      <PersonForm onSubmit={mockOnSubmit} />
    );
    
    // 各フィールドに入力
    fireEvent.changeText(getByTestId('name-input'), validData.name);
    fireEvent.changeText(getByTestId('handle-input'), validData.handle);
    fireEvent.changeText(getByTestId('company-input'), validData.company);
    fireEvent.changeText(getByTestId('position-input'), validData.position);
    fireEvent.changeText(getByTestId('description-input'), validData.description);
    fireEvent.changeText(getByTestId('product-name-input'), validData.productName);
    fireEvent.changeText(getByTestId('github-id-input'), validData.githubId);
    
    // タグを入力（Enterキーで追加）
    const tags = validData.tags.split(', ');
    for (const tag of tags) {
      fireEvent.changeText(getByTestId('tags-input'), tag);
      fireEvent.press(getByTestId('tags-input-add-button'));
    }
    
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
      <PersonForm onSubmit={mockOnSubmit} />
    );
    
    // 送信ボタンをクリック（名前は空のまま）
    fireEvent.press(getByTestId('submit-button'));
    
    // Assert（検証）
    await waitFor(() => {
      expect(getByText('名前は必須です')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('送信中は送信ボタンが無効になる', () => {
    // Arrange（準備）
    const isSubmitting = true;
    
    // Act（実行）
    const { getByTestId } = render(
      <PersonForm onSubmit={mockOnSubmit} isSubmitting={isSubmitting} />
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
      githubId: 'initial-user',
      tags: 'JavaScript, Node.js',
    };
    
    // Act（実行）
    const { getByTestId } = render(
      <PersonForm 
        onSubmit={mockOnSubmit} 
        initialData={initialData}
      />
    );
    
    // Assert（検証）
    expect(getByTestId('name-input').props.value).toBe(initialData.name);
    expect(getByTestId('company-input').props.value).toBe(initialData.company);
    expect(getByTestId('github-id-input').props.value).toBe(initialData.githubId);
    // タグの初期値は選択済みタグとして表示される
    expect(getByTestId('tags-input').props.value).toBe(''); // 入力フィールドは空
  });
});