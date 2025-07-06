/**
 * PersonFormScreenのテスト
 * TanStack Query使用版
 * AAAパターン（Arrange, Act, Assert）でテストを構成
 */
import React from 'react';
import { render, screen, waitFor } from '../../../test-utils/test-utils';
import { PersonFormScreen } from '@/components/screens/PersonFormScreen';
import { PersonService, TagService } from '@/database/sqlite-services';
import type { PersonWithRelations } from '@/database/sqlite-types';
import type { Tag } from '@/database/sqlite-types';

// PersonServiceのモック
jest.mock('@/database/sqlite-services', () => ({
  PersonService: {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  TagService: {
    findAll: jest.fn(),
    findOrCreateByNames: jest.fn(),
    create: jest.fn(),
  },
}));

// expo-routerのモック
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

// React Navigation関連のモック（使用しないが念のため）
jest.mock('@react-navigation/native', () => ({}));

// Alert.alertのモック
jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(jest.fn());

const mockPersonService = PersonService as jest.Mocked<typeof PersonService>;
const mockTagService = TagService as jest.Mocked<typeof TagService>;

describe('PersonFormScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBack.mockClear();
  });

  describe('登録モード', () => {
    it('登録画面が正しく表示される', async () => {
      // Arrange: テストデータを準備
      const mockTags: Tag[] = [
        { id: 'tag-1', name: 'React' },
        { id: 'tag-2', name: 'TypeScript' },
      ];

      mockTagService.findAll.mockResolvedValue(mockTags);

      // Act: コンポーネントをレンダリング
      render(
        <PersonFormScreen
          title="人物登録"
          description="出会った人の情報を登録してください"
          isEditMode={false}
        />
      );


      // Assert: 画面の表示を確認
      await waitFor(() => {
        expect(screen.getByText('人物登録')).toBeTruthy();
        expect(screen.getByText('出会った人の情報を登録してください')).toBeTruthy();
        expect(screen.getByTestId('submit-button')).toBeTruthy();
        expect(screen.getByTestId('submit-button')).toHaveTextContent('登録する');
      });
    });
  });

  describe('編集モード', () => {
    it('人物IDが指定されていない場合にエラーメッセージが表示される', async () => {
      // Arrange: 人物IDを指定しない
      
      // Act: コンポーネントをレンダリング
      render(
        <PersonFormScreen
          title="人物編集"
          isEditMode={true}
          // personIdを指定しない
        />
      );

      // Assert: エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('人物IDが指定されていません')).toBeTruthy();
      });
    });
  });

  describe('タグ処理', () => {
    it('タグ一覧が正しく読み込まれる', async () => {
      // Arrange: テストデータを準備
      const mockTags: Tag[] = [
        { id: 'tag-1', name: 'React' },
        { id: 'tag-2', name: 'TypeScript' },
        { id: 'tag-3', name: 'Node.js' },
      ];

      mockTagService.findAll.mockResolvedValue(mockTags);

      // Act: コンポーネントをレンダリング
      render(
        <PersonFormScreen
          title="人物登録"
          isEditMode={false}
        />
      );


      // Assert: タグサービスが呼ばれることを確認
      await waitFor(() => {
        expect(mockTagService.findAll).toHaveBeenCalled();
      });
    });
  });
});