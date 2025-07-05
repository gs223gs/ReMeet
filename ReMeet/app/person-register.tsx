import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PersonRegistrationForm } from '@/components/forms/PersonRegistrationForm';
import { PersonRegistrationFormData } from '@/types/forms';
import { PersonService, TagService } from '@/database/sqlite-services';

/**
 * 人物登録画面
 * READMEの仕様に基づいた人物情報の登録機能
 */
export default function PersonRegisterScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  /**
   * 画面初期化時に既存タグを読み込む
   * useEffectを使わずにコンポーネント初期化時に実行
   */
  const loadTags = async () => {
    try {
      const tags = await TagService.findAll();
      setAvailableTags(tags.map(tag => tag.name));
    } catch (error) {
      console.error('タグの読み込みに失敗しました:', error);
      // エラー時はデフォルトタグを設定
      setAvailableTags([
        'フロントエンド', 'バックエンド', 'React', 'TypeScript', 'JavaScript', 
        'Python', 'Node.js', 'デザイナー', 'エンジニア', 'プロダクトマネージャー'
      ]);
    } finally {
      setIsLoadingTags(false);
    }
  };

  // 初回レンダリング時にタグを読み込む
  if (isLoadingTags) {
    loadTags();
  }

  /**
   * 新規タグ追加処理
   * データベースに保存してから利用可能タグリストを更新
   */
  const handleNewTagsAdded = async (newTags: string[]) => {
    try {
      // 新規タグをデータベースに保存
      const createdTags = await TagService.createMany(newTags);
      
      setAvailableTags(prev => {
        // 重複を避けて新規タグを先頭に追加
        const uniqueNewTags = createdTags.map(tag => tag.name).filter(tagName => !prev.includes(tagName));
        return [...uniqueNewTags, ...prev];
      });
    } catch (error) {
      console.error('新規タグの作成に失敗しました:', error);
      Alert.alert(
        'エラー',
        'タグの保存中にエラーが発生しました。',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * フォーム送信時の処理
   * Prisma DBへの保存処理を実装
   */
  const handleSubmit = async (data: PersonRegistrationFormData) => {
    setIsSubmitting(true);

    try {
      // タグ名を配列に変換
      const tagNames = data.tags 
        ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      // タグをデータベースに作成または取得
      let tagIds: string[] = [];
      if (tagNames.length > 0) {
        const tags = await TagService.createMany(tagNames);
        tagIds = tags.map(tag => tag.id);
      }

      // 人物データを準備
      const personData = {
        name: data.name,
        handle: data.handle || undefined,
        company: data.company || undefined,
        position: data.position || undefined,
        description: data.description || undefined,
        productName: data.product_name || undefined,
        memo: data.memo || undefined,
        githubId: data.github_id || undefined,
        tagIds: tagIds,
      };

      // 人物をデータベースに保存
      const savedPerson = await PersonService.create(personData);
      
      console.log('Person saved successfully:', savedPerson);
      
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
    } catch (error) {
      console.error('人物の登録に失敗しました:', error);
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
      {!isLoadingTags && (
        <PersonRegistrationForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          availableTags={availableTags}
          onNewTagsAdded={handleNewTagsAdded}
        />
      )}
    </ThemedView>
  );
}