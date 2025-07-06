import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PersonForm } from '@/components/forms/PersonForm';
import { PersonRegistrationFormData } from '@/types/forms';
import { TagService } from '@/database/sqlite-services';
import { peopleAtom } from '@/atoms/peopleAtoms';
import { usePersonMutations } from '@/hooks/usePersonMutations';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [people] = useAtom(peopleAtom);
  const queryClient = useQueryClient();
  
  // 人物のCRUD操作フック
  const { createPersonMutation, updatePersonMutation } = usePersonMutations();

  // 既存人物データをjotaiから取得（編集モード時）
  const existingPerson = isEditMode && personId ? people.find(p => p.id === personId) : null;

  // TanStack Queryでタグ一覧を取得
  const { data: availableTags = [] } = useQuery({
    queryKey: ['tags'],
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
          console.log('新規タグを追加:', tagName);
        } catch (error) {
          if (error instanceof Error && !error.message.includes('既に存在します')) {
            console.error(`Failed to create tag: ${tagName}`, error);
          }
        }
      }
      // キャッシュを無効化して再取得
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
    } catch (error) {
      console.error('Failed to add new tags:', error);
    }
  };

  // フォーム送信処理
  const handleSubmit = async (data: PersonRegistrationFormData) => {
    if (!personId && isEditMode) {
      console.error('編集モードで人物IDが指定されていません');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditMode && personId) {
        // 更新処理
        await updatePersonMutation.mutateAsync({ personId, data });
      } else {
        // 登録処理
        await createPersonMutation.mutateAsync(data);
      }
    } catch (error) {
      // エラーはusePersonMutationsのonErrorで処理される
      console.error(`Person ${isEditMode ? 'update' : 'registration'} error:`, error);
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

      {/* 人物フォーム */}
      <PersonForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting || createPersonMutation.isPending || updatePersonMutation.isPending}
        availableTags={availableTags}
        onNewTagsAdded={handleNewTagsAdded}
        initialData={initialData}
        isEditMode={isEditMode}
      />
    </ThemedView>
  );
}