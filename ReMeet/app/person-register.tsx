import React from 'react';
import { PersonFormScreen } from '@/components/screens/PersonFormScreen';

/**
 * 人物登録画面
 * READMEの仕様に基づいた人物情報の登録機能
 * PersonFormScreenコンポーネントを使用したシンプルな実装
 */
export default function PersonRegisterScreen() {
  return (
    <PersonFormScreen
      title="人物登録"
      description="出会った人の情報を登録してください"
      isEditMode={false}
    />
  );
}