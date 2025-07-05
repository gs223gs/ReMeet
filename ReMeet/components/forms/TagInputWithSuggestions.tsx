import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface TagInputWithSuggestionsProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  availableTags: string[];
  error?: string;
  testID?: string;
  placeholder?: string;
}

/**
 * テキスト入力 + 既存タグ選択メニュー
 * 新規タグはテキスト入力、既存タグはトグルメニューから選択
 */
export function TagInputWithSuggestions({
  label,
  value,
  onChangeText,
  onBlur,
  availableTags,
  error,
  testID,
  placeholder,
}: TagInputWithSuggestionsProps) {
  const [showExistingTags, setShowExistingTags] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'tint');
  const defaultBorderColor = useThemeColor({}, 'tabIconDefault');
  const borderColor = error ? '#FF6B6B' : defaultBorderColor;

  // 現在のタグを配列に変換
  const currentTags = value
    ? value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];

  // 既存タグをタップした時の処理
  const handleExistingTagPress = (tag: string) => {
    if (currentTags.includes(tag)) {
      // 既に選択されている場合は削除
      const newTags = currentTags.filter(t => t !== tag);
      onChangeText(newTags.join(', '));
    } else {
      // 選択されていない場合は追加
      const newTags = [...currentTags, tag];
      onChangeText(newTags.join(', '));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>
        {label}
      </Text>

      {/* テキスト入力フィールド */}
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
        placeholderTextColor={defaultBorderColor}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        autoCapitalize="none"
        testID={testID}
      />

      {/* 既存タグ選択トグルボタン */}
      {availableTags.length > 0 && (
        <Pressable
          style={[styles.toggleButton, { borderColor: primaryColor }]}
          onPress={() => setShowExistingTags(!showExistingTags)}
          testID={`${testID}-toggle`}
        >
          <Text style={[styles.toggleButtonText, { color: primaryColor }]}>
            {showExistingTags ? '▼ 既存タグを隠す' : '▶ 既存タグから選択'}
          </Text>
        </Pressable>
      )}

      {/* 既存タグ選択メニュー */}
      {showExistingTags && availableTags.length > 0 && (
        <View style={[styles.existingTagsContainer, { backgroundColor }]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsScrollContent}
          >
            {availableTags.map((tag, index) => {
              const isSelected = currentTags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  style={({ pressed }) => [
                    styles.existingTagChip,
                    {
                      backgroundColor: isSelected ? primaryColor : backgroundColor,
                      borderColor: isSelected ? primaryColor : borderColor,
                    },
                    pressed && styles.tagChipPressed,
                  ]}
                  onPress={() => handleExistingTagPress(tag)}
                  testID={`${testID}-existing-tag-${index}`}
                >
                  <Text
                    style={[
                      styles.existingTagText,
                      {
                        color: isSelected ? backgroundColor : textColor,
                      },
                    ]}
                  >
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 選択中タグの表示 */}
      {currentTags.length > 0 && (
        <View style={[styles.selectedTagsInfo, { backgroundColor: 'rgba(0, 0, 0, 0.05)' }]}>
          <Text style={[styles.selectedTagsText, { color: textColor }]}>
            選択中: {currentTags.join(', ')}
          </Text>
        </View>
      )}

      {/* エラーメッセージ */}
      {error && (
        <Text style={styles.errorText} testID={`${testID}-error`}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
  toggleButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  existingTagsContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagsScrollContent: {
    flexDirection: 'row',
    gap: 8,
  },
  existingTagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  tagChipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  existingTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTagsInfo: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  selectedTagsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
});