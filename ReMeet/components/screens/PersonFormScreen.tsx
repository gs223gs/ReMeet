import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PersonForm } from '@/components/forms/PersonForm';
import { PersonRegistrationFormData } from '@/types/forms';
import { PersonService, TagService } from '@/database/sqlite-services';
import type { CreatePersonData, UpdatePersonData } from '@/database/sqlite-services/PersonService';
import { peopleAtom } from '@/atoms/peopleAtoms';

export interface PersonFormScreenProps {
  /** 画面のタイトル */
  title: string;
  /** 編集モードかどうか */
  isEditMode?: boolean;
  /** 編集対象の人物ID（編集モードの場合） */
  personId?: string;
  /** 説明文 */
  description?: string;
}

/**
 * 人物フォーム画面コンポーネント
 * 登録・編集で共通利用される画面ラッパー
 * ビジネスロジック（データ取得、送信）を含む
 */
export function PersonFormScreen({
  title,
  isEditMode = false,
  personId,
  description
}: PersonFormScreenProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [people, setPeople] = useAtom(peopleAtom);

  // 既存人物データをjotaiから取得（編集モード時）
  const existingPerson = isEditMode && personId ? people.find(p => p.id === personId) : null;

  // TanStack Queryでタグ一覧を取得
  const { data: availableTags = [] } = useQuery({
    queryKey: ['tags', isEditMode ? 'edit' : 'register'],
    queryFn: async () => {
      try {
        const tags = await TagService.findAll();
        return tags.map(tag => tag.name);
      } catch (error) {
        console.error('Failed to load available tags:', error);
        // エラー時はデフォルトタグを返却
        return [
          'フロントエンド', 'バックエンド', 'React', 'TypeScript', 'JavaScript', 
          'Python', 'Node.js', 'デザイナー', 'エンジニア', 'プロダクトマネージャー'
        ];
      }
    },
  });

  // 初期データを準備
  const getInitialData = (): PersonRegistrationFormData => {
    if (isEditMode && existingPerson) {
      // 編集モード：jotaiから既存データを初期値として設定
      return {
        name: existingPerson.name,
        handle: existingPerson.handle || '',
        company: existingPerson.company || '',
        position: existingPerson.position || '',
        description: existingPerson.description || '',
        productName: existingPerson.productName || '',
        tags: existingPerson.tags ? existingPerson.tags.map(tag => tag.name).join(', ') : '',
        memo: existingPerson.memo || '',
        githubId: existingPerson.githubId || '',
      };
    }
    
    // 登録モードまたは編集モードでpersonが見つからない場合：空の初期値
    return {
      name: '',
      handle: '',
      company: '',
      position: '',
      description: '',
      productName: '',
      tags: '',
      memo: '',
      githubId: '',
    };
  };

  const initialData = getInitialData();

  // 新規タグ追加処理（TanStack Queryのキャッシュを無効化して再取得）
  const handleNewTagsAdded = async (newTags: string[]) => {
    try {
      for (const tagName of newTags) {
        try {
          await TagService.create({ name: tagName });
        } catch (error) {
          if (error instanceof Error && !error.message.includes('既に存在します')) {
            console.error(`Failed to create tag: ${tagName}`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to add new tags:', error);
    }
  };

  // 人物登録のMutation
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
      
      const personData: CreatePersonData = {
        name: data.name,
        handle: data.handle || undefined,
        company: data.company || undefined,
        position: data.position || undefined,
        description: data.description || undefined,
        productName: data.productName || undefined,
        memo: data.memo || undefined,
        githubId: data.githubId || undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
      };
      
      return await PersonService.create(personData);
    },
  });

  // 人物更新のMutation
  const updatePersonMutation = useMutation({
    mutationFn: async (data: PersonRegistrationFormData) => {
      if (!personId) {
        throw new Error('人物IDが指定されていません');
      }

      // タグ名からタグIDを取得または作成
      let tagIds: string[] = [];
      if (data.tags && data.tags.trim() !== '') {
        const tagNames = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        if (tagNames.length > 0) {
          tagIds = await TagService.findOrCreateByNames(tagNames);
        }
      }
      
      const updateData: UpdatePersonData = {
        id: personId,
        name: data.name,
        handle: data.handle || null,
        company: data.company || null,
        position: data.position || null,
        description: data.description || null,
        productName: data.productName || null,
        memo: data.memo || null,
        githubId: data.githubId || null,
        tagIds: tagIds,
      };

      return await PersonService.update(updateData);
    },
  });

  // フォーム送信処理
  const handleSubmit = async (data: PersonRegistrationFormData) => {
    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        // 更新処理
        await updatePersonMutation.mutateAsync(data);
        
        Alert.alert(
          '更新完了',
          '人物情報を更新しました',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            }
          ]
        );
      } else {
        // 登録処理
        const createdPerson = await addPersonMutation.mutateAsync(data);
        
        console.log('Person registration data:', data);
        console.log('Created person:', createdPerson);
        
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
      }
      
      // Jotaiのatomを更新して最新データを反映
      const allPeople = await PersonService.findMany();
      setPeople(allPeople);
      
    } catch (error) {
      console.error(`Person ${isEditMode ? 'update' : 'registration'} error:`, error);
      Alert.alert(
        'エラー',
        `${isEditMode ? '更新' : '登録'}中にエラーが発生しました。もう一度お試しください。`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 編集モードで人物IDが指定されていない場合のエラー
  if (isEditMode && !personId) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ThemedText style={{ fontSize: 18, marginBottom: 20 }}>
          人物IDが指定されていません
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* ヘッダー */}
      <ThemedView style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <ThemedText type="title">{title}</ThemedText>
        {description && (
          <ThemedText style={{ marginTop: 8, opacity: 0.6 }}>
            {description}
          </ThemedText>
        )}
      </ThemedView>

      {/* 人物フォーム */}
      <PersonForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        availableTags={availableTags}
        onNewTagsAdded={handleNewTagsAdded}
        initialData={initialData}
        isEditMode={isEditMode}
      />
    </ThemedView>
  );
}