import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { PersonService, TagService } from '@/database/sqlite-services';
import type { CreatePersonData, UpdatePersonData } from '@/database/sqlite-services/PersonService';
import { PersonRegistrationFormData } from '@/types/forms';
import { peopleAtom } from '@/atoms/peopleAtoms';

/**
 * 人物のCRUD操作を行うカスタムフック
 * 登録・更新・削除時のJotai更新を共通化
 */
export function usePersonMutations() {
  const router = useRouter();
  const [, setPeople] = useAtom(peopleAtom);
  const queryClient = useQueryClient();

  /**
   * Jotaiの人物リストを最新データで更新する共通関数
   */
  const refreshPeopleAtom = async () => {
    try {
      const allPeople = await PersonService.findMany();
      setPeople(allPeople);
    } catch (error) {
      console.error('Failed to refresh people atom:', error);
    }
  };

  /**
   * フォームデータからタグIDを取得または作成する共通関数
   */
  const processTagIds = async (tagsString?: string): Promise<string[]> => {
    if (!tagsString || tagsString.trim() === '') {
      return [];
    }

    const tagNames = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (tagNames.length === 0) {
      return [];
    }

    return await TagService.findOrCreateByNames(tagNames);
  };

  /**
   * 人物登録のMutation
   */
  const createPersonMutation = useMutation({
    mutationFn: async (data: PersonRegistrationFormData) => {
      const tagIds = await processTagIds(data.tags);
      
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
      
      const createdPerson = await PersonService.create(personData);
      
      // Jotaiの人物リストを更新
      await refreshPeopleAtom();
      
      // タグキャッシュも無効化（新規タグが作成された可能性があるため）
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
      
      return createdPerson;
    },
    onSuccess: (createdPerson, data) => {
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
    },
    onError: (error) => {
      console.error('Person registration error:', error);
      Alert.alert(
        'エラー',
        '登録中にエラーが発生しました。もう一度お試しください。',
        [{ text: 'OK' }]
      );
    },
  });

  /**
   * 人物更新のMutation
   */
  const updatePersonMutation = useMutation({
    mutationFn: async ({ personId, data }: { personId: string; data: PersonRegistrationFormData }) => {
      const tagIds = await processTagIds(data.tags);
      
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

      const updatedPerson = await PersonService.update(updateData);
      
      // Jotaiの人物リストを更新
      await refreshPeopleAtom();
      
      // タグキャッシュも無効化（新規タグが作成された可能性があるため）
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
      
      return updatedPerson;
    },
    onSuccess: (updatedPerson, { data }) => {
      console.log('Person update data:', data);
      console.log('Updated person:', updatedPerson);
      
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
    },
    onError: (error) => {
      console.error('Person update error:', error);
      Alert.alert(
        'エラー',
        '更新中にエラーが発生しました。もう一度お試しください。',
        [{ text: 'OK' }]
      );
    },
  });

  /**
   * 人物削除のMutation（将来的な拡張用）
   */
  const deletePersonMutation = useMutation({
    mutationFn: async (personId: string) => {
      await PersonService.delete(personId);
      
      // Jotaiの人物リストを更新
      await refreshPeopleAtom();
      
      return personId;
    },
    onSuccess: () => {
      Alert.alert(
        '削除完了',
        '人物情報を削除しました',
        [{ text: 'OK' }]
      );
    },
    onError: (error) => {
      console.error('Person deletion error:', error);
      Alert.alert(
        'エラー',
        '削除中にエラーが発生しました。もう一度お試しください。',
        [{ text: 'OK' }]
      );
    },
  });

  return {
    createPersonMutation,
    updatePersonMutation,
    deletePersonMutation,
    refreshPeopleAtom,
  };
}