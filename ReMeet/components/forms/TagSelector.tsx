import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface TagSelectorProps {
  label: string;
  selectedTags: string[];
  availableTags: string[];
  onTagsChange: (tags: string[]) => void;
  error?: string;
  testID?: string;
}

/**
 * トグル式タグセレクター
 * 使用頻度順で表示し、タップで選択/解除
 */
export function TagSelector({
  label,
  selectedTags,
  availableTags,
  onTagsChange,
  error,
  testID,
}: TagSelectorProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'tint');

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // タグを削除
      const newTags = selectedTags.filter(t => t !== tag);
      onTagsChange(newTags);
    } else {
      // タグを追加
      const newTags = [...selectedTags, tag];
      onTagsChange(newTags);
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <Text style={[styles.label, { color: textColor }]}>
        {label}
      </Text>

      {/* 選択済みタグ表示 */}
      {selectedTags.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          <Text style={[styles.selectedTagsLabel, { color: textColor }]}>
            選択中: {selectedTags.join(', ')}
          </Text>
        </View>
      )}

      {/* タグ選択エリア */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tagsScrollView}
        contentContainerStyle={styles.tagsContainer}
      >
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Pressable
              key={tag}
              style={({ pressed }) => [
                styles.tagChip,
                {
                  backgroundColor: isSelected ? primaryColor : backgroundColor,
                  borderColor: isSelected ? primaryColor : textColor,
                },
                pressed && styles.tagChipPressed,
              ]}
              onPress={() => handleTagToggle(tag)}
              testID={`${testID}-tag-${tag}`}
            >
              <Text
                style={[
                  styles.tagText,
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
  selectedTagsContainer: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 6,
  },
  selectedTagsLabel: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  tagsScrollView: {
    maxHeight: 120,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagChipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
});