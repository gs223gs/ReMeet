import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TagSelector } from '../../../components/forms/TagSelector';

// useThemeColorフックをモック
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

describe('TagSelector', () => {
  const mockOnTagsChange = jest.fn();
  const defaultProps = {
    label: 'タグ',
    selectedTags: [],
    availableTags: ['React', 'TypeScript', 'JavaScript', 'Node.js'],
    onTagsChange: mockOnTagsChange,
    testID: 'tag-selector',
  };

  beforeEach(() => {
    mockOnTagsChange.mockClear();
  });

  it('基本的なプロパティが正しく表示される', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByText } = render(<TagSelector {...defaultProps} />);

    // Assert（検証）
    expect(getByText('タグ')).toBeTruthy();
    expect(getByText('React')).toBeTruthy();
    expect(getByText('TypeScript')).toBeTruthy();
  });

  it('タグをタップすると選択される', () => {
    // Arrange（準備）
    // Act（実行）
    const { getByTestId } = render(<TagSelector {...defaultProps} />);
    fireEvent.press(getByTestId('tag-selector-tag-0')); // Reactをタップ

    // Assert（検証）
    expect(mockOnTagsChange).toHaveBeenCalledWith(['React']);
  });

  it('選択済みタグをタップすると選択解除される', () => {
    // Arrange（準備）
    const props = {
      ...defaultProps,
      selectedTags: ['React'],
    };

    // Act（実行）
    const { getByTestId } = render(<TagSelector {...props} />);
    fireEvent.press(getByTestId('tag-selector-tag-0')); // Reactをタップ

    // Assert（検証）
    expect(mockOnTagsChange).toHaveBeenCalledWith([]);
  });

  it('複数のタグを選択できる', () => {
    // Arrange（準備）
    const props = {
      ...defaultProps,
      selectedTags: ['React'],
    };

    // Act（実行）
    const { getByTestId } = render(<TagSelector {...props} />);
    fireEvent.press(getByTestId('tag-selector-tag-1')); // TypeScriptをタップ

    // Assert（検証）
    expect(mockOnTagsChange).toHaveBeenCalledWith(['React', 'TypeScript']);
  });

  it('選択済みタグが表示される', () => {
    // Arrange（準備）
    const props = {
      ...defaultProps,
      selectedTags: ['React', 'TypeScript'],
    };

    // Act（実行）
    const { getByText } = render(<TagSelector {...props} />);

    // Assert（検証）
    expect(getByText('選択中: React, TypeScript')).toBeTruthy();
  });

  it('エラーメッセージが表示される', () => {
    // Arrange（準備）
    const props = {
      ...defaultProps,
      error: 'タグは必須です',
    };

    // Act（実行）
    const { getByText, getByTestId } = render(<TagSelector {...props} />);

    // Assert（検証）
    expect(getByText('タグは必須です')).toBeTruthy();
    expect(getByTestId('tag-selector-error')).toBeTruthy();
  });

  it('利用可能なタグが空の場合でもエラーにならない', () => {
    // Arrange（準備）
    const props = {
      ...defaultProps,
      availableTags: [],
    };

    // Act（実行）
    const { getByText } = render(<TagSelector {...props} />);

    // Assert（検証）
    expect(getByText('タグ')).toBeTruthy();
  });
});