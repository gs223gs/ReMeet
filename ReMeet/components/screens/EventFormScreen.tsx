import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { EventForm } from '@/components/forms/EventForm';
import { EventRegistrationFormData } from '@/types/eventForms';
import { EventService } from '@/database/sqlite-services';

export interface EventFormScreenProps {
  /** 画面のタイトル */
  title: string;
  /** 編集モードかどうか */
  isEditMode?: boolean;
  /** 編集対象のイベントID（編集モードの場合） */
  eventId?: string;
  /** 説明文 */
  description?: string;
}

/**
 * イベントフォーム画面コンポーネント
 * 登録・編集で共通利用される画面ラッパー
 * ビジネスロジック（データ取得、送信）を含む
 */
export function EventFormScreen({
  title,
  isEditMode = false,
  eventId,
  description
}: EventFormScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // 既存イベントデータの取得（編集モード時）
  const { data: existingEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      try {
        return await EventService.findById(eventId);
      } catch (error) {
        console.error('Failed to load event:', error);
        return null;
      }
    },
    enabled: isEditMode && !!eventId,
  });

  // 初期データを準備
  const getInitialData = (): EventRegistrationFormData => {
    if (isEditMode && existingEvent) {
      // 編集モード：既存データを初期値として設定
      return {
        name: existingEvent.name,
        date: existingEvent.date,
        location: existingEvent.location || '',
      };
    }
    
    // 登録モード：空の初期値
    return {
      name: '',
      date: null,
      location: '',
    };
  };

  const initialData = getInitialData();

  // フォーム送信処理
  const handleSubmit = async (data: EventRegistrationFormData) => {
    if (!eventId && isEditMode) {
      Alert.alert('エラー', '編集モードでイベントIDが指定されていません');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditMode && eventId) {
        // 更新処理
        await EventService.update({
          id: eventId,
          name: data.name,
          date: data.date,
          location: data.location || null,
        });
        
        Alert.alert(
          '成功',
          'イベントを更新しました',
          [
            {
              text: 'OK',
              onPress: () => {
                // キャッシュを無効化
                queryClient.invalidateQueries({ queryKey: ['events'] });
                queryClient.invalidateQueries({ queryKey: ['event', eventId] });
                router.back();
              }
            }
          ]
        );
      } else {
        // 登録処理
        await EventService.create({
          name: data.name,
          date: data.date,
          location: data.location || null,
        });
        
        Alert.alert(
          '成功',
          'イベントを登録しました',
          [
            {
              text: 'OK',
              onPress: () => {
                // キャッシュを無効化
                queryClient.invalidateQueries({ queryKey: ['events'] });
                router.back();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error(`Event ${isEditMode ? 'update' : 'registration'} error:`, error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : `イベントの${isEditMode ? '更新' : '登録'}に失敗しました`;
      
      Alert.alert('エラー', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 編集モードでイベントIDが指定されていない場合のエラー
  if (isEditMode && !eventId) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ThemedText style={{ fontSize: 18, marginBottom: 20 }}>
          イベントIDが指定されていません
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* ヘッダー */}
      {title && (
        <ThemedView style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
          <ThemedText type="title">{title}</ThemedText>
          {description && (
            <ThemedText style={{ marginTop: 8, opacity: 0.6 }}>
              {description}
            </ThemedText>
          )}
        </ThemedView>
      )}

      {/* イベントフォーム */}
      <EventForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialData={initialData}
        isEditMode={isEditMode}
      />
    </ThemedView>
  );
}