import React from 'react';
import { Alert } from 'react-native';
import { renderHook } from '@testing-library/react-native';
import { useSwipeDelete } from '@/hooks/useSwipeDelete';
import { usePersonMutations } from '@/hooks/usePersonMutations';
import type { PersonWithRelations } from '@/database/sqlite-types';
import { render } from '@/test-utils/test-utils';

/**
 * useSwipeDeleteフックのテスト
 */

// usePersonMutationsをモック
jest.mock('@/hooks/usePersonMutations');

// Alertをモック
jest.spyOn(Alert, 'alert');

describe('useSwipeDelete', () => {
  const mockDeletePersonMutation = {
    mutate: jest.fn(),
    isPending: false,
  };

  const mockUsePersonMutations = usePersonMutations as jest.MockedFunction<typeof usePersonMutations>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePersonMutations.mockReturnValue({
      deletePersonMutation: mockDeletePersonMutation,
      createPersonMutation: {} as any,
      updatePersonMutation: {} as any,
      refreshPeopleAtom: jest.fn(),
    });
  });

  const mockPerson: PersonWithRelations = {
    id: 'test-person-1',
    name: 'テスト太郎',
    handle: '@test_taro',
    company: 'テスト株式会社',
    position: 'エンジニア',
    description: 'テスト用のユーザーです',
    productName: 'テストアプリ',
    memo: 'テストメモ',
    githubId: 'test-taro',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    tags: [],
    events: [],
    relations: [],
  };

  describe('初期状態', () => {
    it('適切な初期値を返す', () => {
      const { result } = renderHook(() => useSwipeDelete());

      expect(result.current.handleSwipeDelete).toBeInstanceOf(Function);
      expect(result.current.isDeleting).toBe(false);
    });

    it('usePersonMutationsを呼び出す', () => {
      renderHook(() => useSwipeDelete());

      expect(mockUsePersonMutations).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleSwipeDelete', () => {
    it('削除確認アラートを表示する', () => {
      const { result } = renderHook(() => useSwipeDelete());

      result.current.handleSwipeDelete(mockPerson);

      expect(Alert.alert).toHaveBeenCalledWith(
        '削除確認',
        'テスト太郎さんの情報を削除しますか？',
        [
          {
            text: 'キャンセル',
            style: 'cancel',
          },
          {
            text: '削除する',
            style: 'destructive',
            onPress: expect.any(Function),
          },
        ]
      );
    });

    it('削除確認で「削除する」を選択するとdeletePersonMutationが呼ばれる', () => {
      const { result } = renderHook(() => useSwipeDelete());

      result.current.handleSwipeDelete(mockPerson);

      // Alert.alertの第3引数（ボタン配列）の2番目のボタン（削除する）のonPressを実行
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2][1]; // 「削除する」ボタン
      deleteButton.onPress();

      expect(mockDeletePersonMutation.mutate).toHaveBeenCalledWith(mockPerson.id);
    });
  });

  describe('ローディング状態', () => {
    it('削除中の状態を正しく返す', () => {
      mockUsePersonMutations.mockReturnValue({
        deletePersonMutation: {
          ...mockDeletePersonMutation,
          isPending: true,
        },
        createPersonMutation: {} as any,
        updatePersonMutation: {} as any,
        refreshPeopleAtom: jest.fn(),
      });

      const { result } = renderHook(() => useSwipeDelete());

      expect(result.current.isDeleting).toBe(true);
    });
  });

  describe('異なる人物での削除', () => {
    it('人物名が正しくアラートに表示される', () => {
      const anotherPerson = {
        ...mockPerson,
        id: 'another-person',
        name: '別の太郎',
      };

      const { result } = renderHook(() => useSwipeDelete());

      result.current.handleSwipeDelete(anotherPerson);

      expect(Alert.alert).toHaveBeenCalledWith(
        '削除確認',
        '別の太郎さんの情報を削除しますか？',
        expect.any(Array)
      );
    });
  });
});