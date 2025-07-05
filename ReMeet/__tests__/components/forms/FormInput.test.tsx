import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FormInput } from '../../../components/forms/FormInput';

// useThemeColorフックをモック
jest.mock('../../../hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

describe('FormInput', () => {
  // Arrange（準備）フェーズで使用する共通のプロパティ
  const defaultProps = {
    label: 'テストラベル',
    placeholder: 'テストプレースホルダー',
  };

  it('ラベルが正しく表示される', () => {
    // Arrange（準備）
    const label = 'ユーザー名';
    
    // Act（実行）
    const { getByText } = render(
      <FormInput {...defaultProps} label={label} />
    );
    
    // Assert（検証）
    expect(getByText(label)).toBeTruthy();
  });

  it('必須フィールドの場合、アスタリスクが表示される', () => {
    // Arrange（準備）
    const props = { ...defaultProps, required: true };
    
    // Act（実行）
    const { getByText } = render(<FormInput {...props} />);
    
    // Assert（検証）
    expect(getByText('*')).toBeTruthy();
  });

  it('エラーメッセージが正しく表示される', () => {
    // Arrange（準備）
    const errorMessage = '入力エラーです';
    const props = { ...defaultProps, error: errorMessage };
    
    // Act（実行）
    const { getByText } = render(<FormInput {...props} />);
    
    // Assert（検証）
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('テキスト入力時にonChangeTextが呼ばれる', () => {
    // Arrange（準備）
    const onChangeText = jest.fn();
    const testText = 'テスト入力';
    const props = { ...defaultProps, onChangeText };
    
    // Act（実行）
    const { getByPlaceholderText } = render(<FormInput {...props} />);
    const input = getByPlaceholderText(defaultProps.placeholder);
    fireEvent.changeText(input, testText);
    
    // Assert（検証）
    expect(onChangeText).toHaveBeenCalledWith(testText);
  });

  it('エラーがある場合、入力フィールドのボーダーが赤になる', () => {
    // Arrange（準備）
    const props = { ...defaultProps, error: 'エラー' };
    
    // Act（実行）
    const { getByPlaceholderText } = render(<FormInput {...props} />);
    const input = getByPlaceholderText(defaultProps.placeholder);
    
    // Assert（検証）
    // borderColorとborderWidthが設定されていることを確認
    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: '#ff3b30' }),
        expect.objectContaining({ borderWidth: 2 }),
      ])
    );
  });
});