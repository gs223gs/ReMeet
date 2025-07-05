import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TagInput } from '../../../components/forms/TagInput';

// useThemeColorフックをモック
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

describe('TagInput', () => {
  const mockOnChangeText = jest.fn();
  const mockOnBlur = jest.fn();

  beforeEach(() => {
    mockOnChangeText.mockClear();
    mockOnBlur.mockClear();
  });

  it('基本的なプロパティが正しく表示される', () => {
    // Arrange（準備）
    const props = {
      label: 'タグ',
      placeholder: 'タグを入力',
      value: '',
      onChangeText: mockOnChangeText,
      testID: 'tag-input',
    };

    // Act（実行）
    const { getByText, getByTestId } = render(<TagInput {...props} />);

    // Assert（検証）
    expect(getByText('タグ')).toBeTruthy();
    expect(getByTestId('tag-input')).toBeTruthy();
    expect(getByTestId('tag-input').props.placeholder).toBe('タグを入力');
  });

  it('入力値が正しく表示される', () => {
    // Arrange（準備）
    const props = {
      label: 'タグ',
      value: 'React, TypeScript',
      onChangeText: mockOnChangeText,
      testID: 'tag-input',
    };

    // Act（実行）
    const { getByTestId } = render(<TagInput {...props} />);

    // Assert（検証）
    expect(getByTestId('tag-input').props.value).toBe('React, TypeScript');
  });

  it('テキスト変更時にonChangeTextが呼ばれる', () => {
    // Arrange（準備）
    const props = {
      label: 'タグ',
      value: '',
      onChangeText: mockOnChangeText,
      testID: 'tag-input',
    };

    // Act（実行）
    const { getByTestId } = render(<TagInput {...props} />);
    fireEvent.changeText(getByTestId('tag-input'), 'React');

    // Assert（検証）
    expect(mockOnChangeText).toHaveBeenCalledWith('React');
  });

  it('ブラー時にonBlurが呼ばれる', () => {
    // Arrange（準備）
    const props = {
      label: 'タグ',
      value: '',
      onChangeText: mockOnChangeText,
      onBlur: mockOnBlur,
      testID: 'tag-input',
    };

    // Act（実行）
    const { getByTestId } = render(<TagInput {...props} />);
    fireEvent(getByTestId('tag-input'), 'blur');

    // Assert（検証）
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('エラーメッセージが表示される', () => {
    // Arrange（準備）
    const props = {
      label: 'タグ',
      value: '',
      onChangeText: mockOnChangeText,
      error: 'タグは必須です',
      testID: 'tag-input',
    };

    // Act（実行）
    const { getByText, getByTestId } = render(<TagInput {...props} />);

    // Assert（検証）
    expect(getByText('タグは必須です')).toBeTruthy();
    expect(getByTestId('tag-input-error')).toBeTruthy();
  });

  it('サジェストが表示される', () => {
    // Arrange（準備）
    const props = {
      label: 'タグ',
      value: 'React',
      onChangeText: mockOnChangeText,
      suggestions: ['React', 'ReactNative', 'Redux'],
      testID: 'tag-input',
    };

    // Act（実行）
    const { getByTestId } = render(<TagInput {...props} />);
    fireEvent(getByTestId('tag-input'), 'focus');

    // Assert（検証）
    expect(getByTestId('tag-input-suggestion-React')).toBeTruthy();
    expect(getByTestId('tag-input-suggestion-ReactNative')).toBeTruthy();
  });

  it('サジェストをタップすると値が更新される', () => {
    // Arrange（準備）
    const props = {
      label: 'タグ',
      value: 'Rea',
      onChangeText: mockOnChangeText,
      suggestions: ['React', 'ReactNative'],
      testID: 'tag-input',
    };

    // Act（実行）
    const { getByTestId } = render(<TagInput {...props} />);
    fireEvent(getByTestId('tag-input'), 'focus');
    fireEvent.press(getByTestId('tag-input-suggestion-React'));

    // Assert（検証）
    expect(mockOnChangeText).toHaveBeenCalledWith('React');
  });

  it('既に入力済みのタグはサジェストから除外される', () => {
    // Arrange（準備）
    const props = {
      label: 'タグ',
      value: 'React, Type',
      onChangeText: mockOnChangeText,
      suggestions: ['React', 'TypeScript', 'JavaScript'],
      testID: 'tag-input',
    };

    // Act（実行）
    const { getByTestId, queryByText } = render(<TagInput {...props} />);
    fireEvent(getByTestId('tag-input'), 'focus');

    // Assert（検証）
    // Reactは既に入力済みなのでサジェストに表示されない
    expect(queryByText('React')).toBeNull();
    // TypeScriptは部分マッチするのでサジェストに表示される
    expect(getByTestId('tag-input-suggestion-TypeScript')).toBeTruthy();
  });

  it('複数タグの最大数テスト', () => {
    // Arrange（準備）
    const suggestions = Array.from({ length: 10 }, (_, i) => `asuggest${i}`);
    const props = {
      label: 'タグ',
      value: 'a',
      onChangeText: mockOnChangeText,
      suggestions,
      testID: 'tag-input',
    };

    // Act（実行）
    const { queryByTestId, getByTestId } = render(<TagInput {...props} />);
    fireEvent(getByTestId('tag-input'), 'focus');

    // Assert（検証）
    // 最大5個までしか表示されない
    expect(queryByTestId('tag-input-suggestion-asuggest0')).toBeTruthy();
    expect(queryByTestId('tag-input-suggestion-asuggest4')).toBeTruthy();
    expect(queryByTestId('tag-input-suggestion-asuggest5')).toBeNull();
  });
});