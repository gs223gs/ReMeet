import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PersonRegistrationForm } from '@/components/forms/PersonRegistrationForm';
import { PersonRegistrationFormData } from '@/types/forms';
import { PersonService, TagService } from '@/database/sqlite-services';
import type { CreatePersonData } from '@/database/sqlite-services';
import { peopleAtom } from '@/atoms/peopleAtoms';

/**
 * 人物登録画面
 * READMEの仕様に基づいた人物情報の登録機能
 * TanStack Query + Jotai を使用してuseEffect禁止を実現
 */
export default function PersonRegisterScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [, setPeople] = useAtom(peopleAtom);

  // TanStack Queryでタグ一覧を取得
  const { refetch: refetchTags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const tags = await TagService.findAll();
      return tags.map(tag => tag.name);
    },
    onSuccess: (tags) => {
      setAvailableTags(tags);
    },
    onError: (error) => {
      console.error('Failed to load available tags:', error);
      // エラー時はデフォルトタグを設定
      setAvailableTags([
        'フロントエンド', 'バックエンド', 'React', 'TypeScript', 'JavaScript', 
        'Python', 'Node.js', 'デザイナー', 'エンジニア', 'プロダクトマネージャー'
      ]);
    },
    enabled: false, // 手動実行のみ
  });

  // 画面フォーカス時にタグ一覧を読み込み
  useFocusEffect(
    React.useCallback(() => {
      refetchTags();
    }, [refetchTags])
  );

  /**
   * 新規タグ追加処理
   * タグをデータベースに保存し、利用可能タグ一覧を更新
   */
  const handleNewTagsAdded = async (newTags: string[]) => {
    try {
      // 新規タグをデータベースに保存
      const createdTags = [];
      for (const tagName of newTags) {
        try {
          const createdTag = await TagService.create({ name: tagName });
          createdTags.push(createdTag.name);
        } catch (error) {
          // 重複エラーの場合は無視（既存タグ）
          if (error instanceof Error && error.message.includes('既に存在します')) {
            createdTags.push(tagName);
          } else {
            console.error(`Failed to create tag: ${tagName}`, error);
          }
        }
      }
      
      // 利用可能タグ一覧を更新
      setAvailableTags(prev => {
        const uniqueNewTags = createdTags.filter(tag => !prev.includes(tag));
        return [...uniqueNewTags, ...prev];
      });
    } catch (error) {
      console.error('Failed to add new tags:', error);
    }
  };

  // 人物追加のMutation
  const addPersonMutation = useMutation({
    mutationFn: async (data: PersonRegistrationFormData) => {
      // タグ名からタグIDを取得または作成
      let tagIds: string[] = [];
      if (data.tags && data.tags.trim() !== '') {
        const tagNames = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        if (tagNames.length > 0) {
          tagIds = await TagService.findOrCreateByNames(tagNames);
        }
      }
      
      // フォームデータをPersonService用の形式に変換
      const personData: CreatePersonData = {
        name: data.name,
        handle: data.handle || undefined,
        company: data.company || undefined,
        position: data.position || undefined,
        description: data.description || undefined,
        productName: data.productName || undefined,
        memo: data.memo || undefined,
        githubId: data.githubId || undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined, // タグIDを設定
      };
      
      // PersonServiceを使って人物を登録
      const createdPerson = await PersonService.create(personData);
      return { createdPerson, formData: data };
    },
    onSuccess: async ({ createdPerson, formData }) => {
      // 人物追加後に最新データをフェッチしてJotaiに保存
      const updatedPeople = await PersonService.findMany();
      setPeople(updatedPeople);
      
      // 送信データをコンソールに出力（デバッグ用）
      console.log('Person registration data:', formData);
      console.log('Created person:', createdPerson);
      
      // 成功メッセージを表示
      Alert.alert(
        '登録完了',
        `${formData.name}さんの情報を登録しました。`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error) => {
      // エラー処理
      console.error('Person registration error:', error);
      Alert.alert(
        'エラー',
        '登録中にエラーが発生しました。もう一度お試しください。',
        [{ text: 'OK' }]
      );
    },
  });

  /**
   * フォーム送信時の処理
   * Mutationを使用した実際のデータ保存処理
   */
  const handleSubmit = (data: PersonRegistrationFormData) => {
    setIsSubmitting(true);
    addPersonMutation.mutate(data, {
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
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
        availableTags={availableTags}
        onNewTagsAdded={handleNewTagsAdded}
      />
    </ThemedView>
  );
}