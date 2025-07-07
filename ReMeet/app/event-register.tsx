import React from 'react';
import { EventFormScreen } from '@/components/screens/EventFormScreen';

/**
 * イベント登録画面
 * 新しいイベント情報の登録機能
 * EventFormScreenコンポーネントを使用したシンプルな実装
 */
export default function EventRegisterScreen() {
  return (
    <EventFormScreen
      title="イベント登録"
      description="参加したイベントの情報を登録してください"
      isEditMode={false}
    />
  );
}