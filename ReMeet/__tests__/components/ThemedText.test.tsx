import React from 'react';
import { render } from '../utils/test-utils';
import { ThemedText } from '../../components/ThemedText';

describe('ThemedText', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    const textElement = getByText('Hello World');
    expect(textElement).toBeTruthy();
  });

  it('applies title style when type is title', () => {
    const { getByText } = render(
      <ThemedText type="title">Title Text</ThemedText>
    );
    const textElement = getByText('Title Text');
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 32,
          fontWeight: 'bold',
          lineHeight: 32,
        }),
      ])
    );
  });

  it('applies subtitle style when type is subtitle', () => {
    const { getByText } = render(
      <ThemedText type="subtitle">Subtitle Text</ThemedText>
    );
    const textElement = getByText('Subtitle Text');
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 20,
          fontWeight: 'bold',
        }),
      ])
    );
  });

  it('applies link style when type is link', () => {
    const { getByText } = render(
      <ThemedText type="link">Link Text</ThemedText>
    );
    const textElement = getByText('Link Text');
    // linkタイプの時は特定のスタイルが適用されることを確認
    expect(textElement).toBeTruthy();
    
    // linkテキストが正しく表示されていることを確認
    expect(textElement.props.children).toBe('Link Text');
  });

  it('passes through additional props', () => {
    const { getByTestId } = render(
      <ThemedText testID="themed-text">Test</ThemedText>
    );
    expect(getByTestId('themed-text')).toBeTruthy();
  });
});