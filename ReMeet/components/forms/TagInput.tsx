import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface TagInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  testID?: string;
  suggestions?: string[];
}

/**
 * タグ入力コンポーネント
 * 既存タグのサジェスト機能付き
 */
export function TagInput({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  testID,
  suggestions = []
}: TagInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = React.useRef<TextInput>(null);
  const textColor = useThemeColor({}, 'text');
  const defaultBorderColor = useThemeColor({}, 'tabIconDefault');
  const backgroundColor = useThemeColor({}, 'background');
  
  const borderColor = error ? '#FF6B6B' : defaultBorderColor;

  // 入力中のタグに基づいてサジェストをフィルタリング
  const filteredSuggestions = (() => {
    if (!showSuggestions) return [];
    
    // 値が空の場合は全サジェストを表示
    if (!value || value.trim() === '') {
      return suggestions.slice(0, 5);
    }
    
    const currentTags = value.split(',').map(tag => tag.trim().toLowerCase());
    const currentInput = currentTags[currentTags.length - 1];
    
    // 現在の入力が空の場合（カンマの後など）は全サジェストを表示
    if (!currentInput) {
      return suggestions
        .filter(suggestion => !currentTags.slice(0, -1).includes(suggestion.toLowerCase()))
        .slice(0, 5);
    }
    
    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(currentInput) &&
        !currentTags.slice(0, -1).includes(suggestion.toLowerCase())
      )
      .slice(0, 5);
  })();

  const handleSuggestionPress = (suggestion: string) => {
    setIsSelectingSuggestion(true);
    
    // タイムアウトをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    const tags = value.split(',').map(tag => tag.trim());
    tags[tags.length - 1] = suggestion;
    const newValue = tags.join(', ');
    
    onChangeText(newValue);
    setShowSuggestions(false);
    
    // フォーカスを維持
    setTimeout(() => {
      setIsSelectingSuggestion(false);
      inputRef.current?.focus();
    }, 50);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    setShowSuggestions(true);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // サジェスト選択中はblurを無視
    if (isSelectingSuggestion) {
      return;
    }
    
    // 少し遅延させてサジェストのタップを可能にする
    timeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
      timeoutRef.current = null;
    }, 200);
    onBlur?.();
  };

  // タイムアウトのクリーンアップは自動で行われるため、useEffectは不要

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>
        {label}
      </Text>
      
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            color: textColor,
            borderColor,
            backgroundColor,
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={useThemeColor({}, 'tabIconDefault')}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize="none"
        testID={testID}
      />

      {/* エラーメッセージ */}
      {error && (
        <Text style={styles.errorText} testID={`${testID}-error`}>
          {error}
        </Text>
      )}

      {/* サジェスト */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor }]}>
          {filteredSuggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              style={({ pressed }) => [
                styles.suggestionItem, 
                { borderColor },
                pressed && styles.suggestionItemPressed
              ]}
              onPress={() => handleSuggestionPress(suggestion)}
              onPressIn={() => setIsSelectingSuggestion(true)}
              onPressOut={() => {}}
              testID={`${testID}-suggestion-${suggestion}`}
            >
              <Text style={[styles.suggestionText, { color: textColor }]}>
                {suggestion}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
    overflow: 'visible',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
    zIndex: 9999,
    elevation: 10, // Android用
    shadowColor: '#000', // iOS用
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    minHeight: 48, // 十分なタップエリアを確保
  },
  suggestionText: {
    fontSize: 14,
  },
  suggestionItemPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});