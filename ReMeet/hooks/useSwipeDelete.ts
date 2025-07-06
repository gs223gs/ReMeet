import { Alert } from 'react-native';
import { usePersonMutations } from './usePersonMutations';
import type { PersonWithRelations } from '@/database/sqlite-types';

/**
 * スワイプ削除機能専用のカスタムフック
 * 既存のusePersonMutationsを活用して削除確認ダイアログ付きの削除機能を提供
 */
export function useSwipeDelete() {
  const { deletePersonMutation } = usePersonMutations();

  /**
   * スワイプ削除のハンドラー
   * 削除確認ダイアログを表示してから削除を実行
   * @param person 削除対象の人物
   */
  const handleSwipeDelete = (person: PersonWithRelations) => {
    Alert.alert(
      "削除確認",
      `${person.name}さんの情報を削除しますか？`,
      [
        {
          text: "キャンセル",
          style: "cancel",
        },
        {
          text: "削除する",
          style: "destructive",
          onPress: () => {
            deletePersonMutation.mutate(person.id);
          },
        },
      ]
    );
  };

  return {
    handleSwipeDelete,
    isDeleting: deletePersonMutation.isPending,
  };
}