import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PersonRegistrationForm } from '@/components/forms/PersonRegistrationForm';
import { PersonRegistrationFormData } from '@/types/forms';

/**
 * 人物登録画面
 * READMEの仕様に基づいた人物情報の登録機能
 */
export default function PersonRegisterScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * フォーム送信時の処理
   * 実際のアプリケーションではRealm DBへの保存処理を実装
   */
  const handleSubmit = async (data: PersonRegistrationFormData) => {
    setIsSubmitting(true);

    try {
      // ここで実際のRealm DB保存処理を行う
      // 今回はシミュレーションのため、1秒待機
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 送信データをコンソールに出力（デバッグ用）
      console.log('Person registration data:', data);
      
      // 成功メッセージを表示
      Alert.alert(
        '登録完了',
        `${data.name}さんの情報を登録しました。`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch {
      // エラー処理
      Alert.alert(
        'エラー',
        '登録中にエラーが発生しました。もう一度お試しください。',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* ヘッダー */}
      <ThemedView style={{ paddingTop: 60, paddingHorizontal: 20 }}>
        <ThemedText type="title">人物登録</ThemedText>
        <ThemedText style={{ marginTop: 8, opacity: 0.6 }}>
          出会った人の情報を登録してください
        </ThemedText>
      </ThemedView>

      {/* 人物登録フォーム */}
      <PersonRegistrationForm 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        tagSuggestions={['フロントエンド', 'バックエンド', 'React', 'TypeScript', 'JavaScript', 'Python', 'Node.js', 'デザイナー', 'エンジニア', 'プロダクトマネージャー']}
      />
    </ThemedView>
  );
}