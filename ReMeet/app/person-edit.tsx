import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PersonFormScreen } from '@/components/screens/PersonFormScreen';

/**
 * 人物編集画面
 * 既存の人物情報を編集する機能
 * PersonFormScreenコンポーネントを編集モードで使用したシンプルな実装
 */
export default function PersonEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PersonFormScreen
      title="人物編集"
      isEditMode={true}
      personId={id}
    />
  );
}