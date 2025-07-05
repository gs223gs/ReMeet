import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';

export interface TagChipTheme {
  /**
   * テキストカラー
   */
  textColor: string;
  /**
   * 背景色
   */
  backgroundColor: string;
  /**
   * プライマリカラー
   */
  primaryColor: string;
  /**
   * ボーダーカラー
   */
  borderColor: string;
}

export interface TagChipProps {
  /**
   * タグのテキスト
   */
  tag: string;
  /**
   * 選択状態
   */
  isSelected?: boolean;
  /**
   * 削除可能かどうか
   */
  removable?: boolean;
  /**
   * タグがタップされた時のコールバック
   */
  onPress?: (tag: string) => void;
  /**
   * 削除ボタンがタップされた時のコールバック
   */
  onRemove?: (tag: string) => void;
  /**
   * テーマ色設定
   */
  theme: TagChipTheme;
  /**
   * テストID
   */
  testID?: string;
}

/**
 * タグを表示するチップコンポーネント
 * 選択可能・削除可能な状態を管理
 */
export function TagChip({
  tag,
  isSelected = false,
  removable = false,
  onPress,
  onRemove,
  theme,
  testID,
}: TagChipProps) {
  const chipBackgroundColor = isSelected ? theme.primaryColor : theme.backgroundColor;
  const chipTextColor = isSelected ? theme.backgroundColor : theme.textColor;
  const chipBorderColor = isSelected ? theme.primaryColor : theme.borderColor;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: chipBackgroundColor,
          borderColor: chipBorderColor,
        },
        pressed && styles.chipPressed,
      ]}
      onPress={() => onPress?.(tag)}
      testID={testID}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: chipTextColor,
          },
        ]}
      >
        {tag}
      </Text>
      {removable && (
        <Pressable
          style={styles.removeButton}
          onPress={() => onRemove?.(tag)}
          testID={`${testID}-remove`}
        >
          <Text style={[styles.removeButtonText, { color: theme.backgroundColor }]}>
            ×
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 4,
  },
  chipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});