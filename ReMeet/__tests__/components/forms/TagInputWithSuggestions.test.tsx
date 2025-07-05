import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TagInputWithSuggestions } from '../../../components/forms/TagInputWithSuggestions';

// useThemeColorフックをモック
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

describe('TagInputWithSuggestions', () => {
  const mockOnChangeText = jest.fn();
  const mockOnBlur = jest.fn();
  const defaultProps = {
    label: 'タグ',
    value: [] as string[],
    onChangeText: mockOnChangeText,
    onBlur: mockOnBlur,
    availableTags: ['React', 'TypeScript', 'JavaScript'],
    testID: 'tag-input',
  };

  beforeEach(() => {
    mockOnChangeText.mockClear();
    mockOnBlur.mockClear();
  });

  it('基本的なプロパティが正しく表示される', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByText, getByTestId } = render(
      <TagInputWithSuggestions {...defaultProps} />
    );

    // Assert（検証）
    expect(getByText('タグ')).toBeTruthy();
    expect(getByTestId('tag-input')).toBeTruthy();
  });

  it('テキスト入力が動作する', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId } = render(
      <TagInputWithSuggestions {...defaultProps} />
    );
    
    fireEvent.changeText(getByTestId('tag-input'), '新規タグ');

    // Assert（検証）
    // 入力フィールドの値が更新されることを確認（実際の値は内部状態）
    expect(getByTestId('tag-input').props.value).toBe('新規タグ');
  });

  it('Enterキーでタグが追加される', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId } = render(
      <TagInputWithSuggestions {...defaultProps} />
    );
    
    // テキストを入力
    fireEvent.changeText(getByTestId('tag-input'), '新規タグ');
    // Enterキーを押下
    fireEvent(getByTestId('tag-input'), 'onKeyPress', { nativeEvent: { key: 'Enter' } });

    // Assert（検証）
    expect(mockOnChangeText).toHaveBeenCalledWith(['新規タグ']);
  });

  it('重複するタグは追加されない', () => {
    // Arrange（準備）
    const props = {
      ...defaultProps,
      value: ['React'],
    };

    // Act（実行）
    const { getByTestId } = render(
      <TagInputWithSuggestions {...props} />
    );
    
    // 既存のタグと同じ名前を入力
    fireEvent.changeText(getByTestId('tag-input'), 'React');
    fireEvent(getByTestId('tag-input'), 'onKeyPress', { nativeEvent: { key: 'Enter' } });

    // Assert（検証）
    expect(mockOnChangeText).not.toHaveBeenCalled();
  });

  it('既存タグトグルボタンが表示される', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId } = render(
      <TagInputWithSuggestions {...defaultProps} />
    );

    // Assert（検証）
    expect(getByTestId('tag-input-toggle')).toBeTruthy();
  });

  it('トグルボタンで既存タグメニューが表示される', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId, getByText } = render(
      <TagInputWithSuggestions {...defaultProps} />
    );
    
    fireEvent.press(getByTestId('tag-input-toggle'));

    // Assert（検証）
    expect(getByText('React')).toBeTruthy();
    expect(getByText('TypeScript')).toBeTruthy();
  });

  it('既存タグをタップして選択できる', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId } = render(
      <TagInputWithSuggestions {...defaultProps} />
    );
    
    // メニューを開く
    fireEvent.press(getByTestId('tag-input-toggle'));
    // タグを選択
    fireEvent.press(getByTestId('tag-input-existing-tag-0'));

    // Assert（検証）
    expect(mockOnChangeText).toHaveBeenCalledWith(['React']);
  });

  it('複数の既存タグを選択できる', () => {
    // Arrange（準備）
    const props = {
      ...defaultProps,
      value: ['React'],
    };

    // Act（実行）
    const { getByTestId } = render(
      <TagInputWithSuggestions {...props} />
    );
    
    // メニューを開く
    fireEvent.press(getByTestId('tag-input-toggle'));
    // TypeScriptを追加選択
    fireEvent.press(getByTestId('tag-input-existing-tag-1'));

    // Assert（検証）
    expect(mockOnChangeText).toHaveBeenCalledWith(['React', 'TypeScript']);
  });

  it('選択済みタグを再度タップすると削除される', () => {
    // Arrange（準備）
    const props = {
      ...defaultProps,
      value: ['React', 'TypeScript'],
    };

    // Act（実行）
    const { getByTestId } = render(
      <TagInputWithSuggestions {...props} />
    );
    
    // メニューを開く
    fireEvent.press(getByTestId('tag-input-toggle'));
    // Reactを削除
    fireEvent.press(getByTestId('tag-input-existing-tag-0'));

    // Assert（検証）
    expect(mockOnChangeText).toHaveBeenCalledWith(['TypeScript']);
  });

  it('選択済みタグが表示される', () => {
    // Arrange（準備）
    const props = {
      ...defaultProps,
      value: ['React', 'TypeScript'],
    };

    // Act（実行）
    const { getByText } = render(
      <TagInputWithSuggestions {...props} />
    );

    // Assert（検証）
    expect(getByText('選択済みタグ:')).toBeTruthy();
    expect(getByText('React')).toBeTruthy();
    expect(getByText('TypeScript')).toBeTruthy();
  });

  it('バツボタンでタグを削除できる', () => {
    // Arrange（準備）
    const props = {
      ...defaultProps,
      value: ['React', 'TypeScript'],
    };

    // Act（実行）
    const { getByTestId } = render(
      <TagInputWithSuggestions {...props} />
    );
    
    // Reactのバツボタンをタップ
    fireEvent.press(getByTestId('tag-input-remove-tag-0'));

    // Assert（検証）
    expect(mockOnChangeText).toHaveBeenCalledWith(['TypeScript']);
  });

  it('エラーメッセージが表示される', () => {
    // Arrange（準備）
    const props = {
      ...defaultProps,
      error: 'タグは必須です',
    };

    // Act（実行）
    const { getByText, getByTestId } = render(
      <TagInputWithSuggestions {...props} />
    );

    // Assert（検証）
    expect(getByText('タグは必須です')).toBeTruthy();
    expect(getByTestId('tag-input-error')).toBeTruthy();
  });

  it('利用可能なタグが空の場合はトグルボタンが表示されない', () => {
    // Arrange（準備）
    const props = {
      ...defaultProps,
      availableTags: [],
    };

    // Act（実行）
    const { queryByTestId } = render(
      <TagInputWithSuggestions {...props} />
    );

    // Assert（検証）
    expect(queryByTestId('tag-input-toggle')).toBeNull();
  });

  it('空白のみのタグは追加されない', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId } = render(
      <TagInputWithSuggestions {...defaultProps} />
    );
    
    // 空白のみを入力
    fireEvent.changeText(getByTestId('tag-input'), '   ');
    fireEvent(getByTestId('tag-input'), 'onKeyPress', { nativeEvent: { key: 'Enter' } });

    // Assert（検証）
    expect(mockOnChangeText).not.toHaveBeenCalled();
  });

  it('タグ追加後に入力フィールドがクリアされる', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId } = render(
      <TagInputWithSuggestions {...defaultProps} />
    );
    
    // テキストを入力してEnterキーを押下
    fireEvent.changeText(getByTestId('tag-input'), '新規タグ');
    fireEvent(getByTestId('tag-input'), 'onKeyPress', { nativeEvent: { key: 'Enter' } });

    // Assert（検証）
    expect(getByTestId('tag-input').props.value).toBe('');
  });
});