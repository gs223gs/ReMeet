import React, { useState, useEffect } from 'react';
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
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
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
    // タイムアウトをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    const tags = value.split(',').map(tag => tag.trim());
    tags[tags.length - 1] = suggestion;
    onChangeText(tags.join(', '));
    setShowSuggestions(false);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    setShowSuggestions(true);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // 少し遅延させてサジェストのタップを可能にする
    timeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
      timeoutRef.current = null;
    }, 200);
    onBlur?.();
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>
        {label}
      </Text>
      
      <TextInput
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
          {filteredSuggestions.map((suggestion, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.suggestionItem, 
                { borderColor },
                pressed && styles.suggestionItemPressed
              ]}
              onPress={() => handleSuggestionPress(suggestion)}
              testID={`${testID}-suggestion-${index}`}
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
    zIndex: 1000,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 14,
  },
  suggestionItemPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});