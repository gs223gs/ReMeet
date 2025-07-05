import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { UserRegistrationForm } from '@/components/forms/UserRegistrationForm';
import { UserRegistrationFormData } from '@/types/forms';

/**
 * ユーザー登録画面
 * フォームからユーザー情報を取得し、登録処理を行う
 */
export default function RegisterScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * フォーム送信時の処理
   * 実際のアプリケーションではAPIへの送信処理を実装
   */
  const handleSubmit = async (data: UserRegistrationFormData) => {
    setIsSubmitting(true);

    try {
      // ここで実際のAPI呼び出しを行う
      // 今回はシミュレーションのため、1秒待機
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 送信データをコンソールに出力（デバッグ用）
      console.log('Registration data:', data);
      
      // 成功メッセージを表示
      Alert.alert(
        '登録完了',
        '登録が完了しました。',
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
        <ThemedText type="title">ユーザー登録</ThemedText>
        <ThemedText style={{ marginTop: 8, opacity: 0.6 }}>
          以下の情報を入力してください
        </ThemedText>
      </ThemedView>

      {/* 登録フォーム */}
      <UserRegistrationForm 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </ThemedView>
  );
}