import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface TagInputWithSuggestionsProps {
  label: string;
  value: string[];
  onChangeText: (tags: string[]) => void;
  onBlur?: () => void;
  availableTags: string[];
  error?: string;
  testID?: string;
  placeholder?: string;
}

/**
 * エンターキー入力でタグ追加 + 既存タグ選択メニュー
 * 新規タグはエンターキーで追加、既存タグはトグルメニューから選択
 * 選択済みタグは下部にバツボタン付きで表示
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
  const [inputText, setInputText] = useState('');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'tint');
  const defaultBorderColor = useThemeColor({}, 'tabIconDefault');
  const borderColor = error ? '#FF6B6B' : defaultBorderColor;

  // 現在のタグ配列
  const currentTags = value || [];

  // 新規タグ追加処理（追加ボタン方式）
  const handleAddTag = () => {
    const trimmedText = inputText.trim();
    if (trimmedText && !currentTags.includes(trimmedText)) {
      // ログ出力（後で実際のロジックに置き換える）
      console.log('新規タグを追加:', trimmedText);
      
      const newTags = [...currentTags, trimmedText];
      onChangeText(newTags);
      setInputText('');
    }
  };

  // 既存タグをタップした時の処理
  const handleExistingTagPress = (tag: string) => {
    if (currentTags.includes(tag)) {
      // 既に選択されている場合は削除
      const newTags = currentTags.filter(t => t !== tag);
      onChangeText(newTags);
    } else {
      // 選択されていない場合は追加
      const newTags = [...currentTags, tag];
      onChangeText(newTags);
    }
  };

  // タグ削除処理
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    onChangeText(newTags);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>
        {label}
      </Text>

      {/* テキスト入力フィールドと追加ボタン */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              borderColor,
              backgroundColor,
            }
          ]}
          placeholder={placeholder || "タグを入力してください"}
          placeholderTextColor={defaultBorderColor}
          value={inputText}
          onChangeText={setInputText}
          onBlur={onBlur}
          autoCapitalize="none"
          testID={testID}
        />
        <Pressable
          style={[
            styles.addButton,
            {
              backgroundColor: primaryColor,
              opacity: inputText.trim() ? 1 : 0.5,
            }
          ]}
          onPress={handleAddTag}
          disabled={!inputText.trim()}
          testID={`${testID}-add-button`}
        >
          <Text style={[styles.addButtonText, { color: backgroundColor }]}>
            追加
          </Text>
        </Pressable>
      </View>

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

      {/* 選択済みタグリスト（バツボタン付き） */}
      {currentTags.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          <Text style={[styles.selectedTagsLabel, { color: textColor }]}>
            選択済みタグ:
          </Text>
          <View style={styles.selectedTagsList}>
            {currentTags.map((tag, index) => (
              <View
                key={tag}
                style={[styles.selectedTagChip, { backgroundColor: primaryColor }]}
                testID={`${testID}-selected-tag-${index}`}
              >
                <Text style={[styles.selectedTagText, { color: backgroundColor }]}>
                  {tag}
                </Text>
                <Pressable
                  style={styles.removeTagButton}
                  onPress={() => handleRemoveTag(tag)}
                  testID={`${testID}-remove-tag-${index}`}
                >
                  <Text style={[styles.removeTagButtonText, { color: backgroundColor }]}>
                    ×
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  selectedTagsContainer: {
    marginTop: 12,
  },
  selectedTagsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  selectedTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  selectedTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeTagButton: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeTagButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
});