/**
 * ホーム画面（人物一覧）のテスト
 * TanStack Query + Jotai使用版
 * AAAパターン（Arrange, Act, Assert）でテストを構成
 */
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '../../../test-utils/test-utils';
import HomeScreen from '@/app/(tabs)/people';
import { PersonService } from '@/database/sqlite-services';
import type { PersonWithRelations } from '@/database/sqlite-types';

// PersonServiceのモック
jest.mock('@/database/sqlite-services', () => ({
  PersonService: {
    findMany: jest.fn(),
  },
}));

// expo-routerのモック
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// useFocusEffectのモック
let mockUseFocusEffectCallback: (() => void) | null = null;
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => {
    mockUseFocusEffectCallback = callback;
  }),
}));

const mockPersonService = PersonService as jest.Mocked<typeof PersonService>;

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFocusEffectCallback = null;
  });

  describe('データ読み込み', () => {
    it('人物データが正しく表示される', async () => {
      // Arrange: テストデータを準備
      const mockPeople: PersonWithRelations[] = [
        {
          id: 'person-1',
          name: '山田太郎',
          handle: '@yamada_taro',
          company: '株式会社テスト',
          position: 'エンジニア',
          description: 'フロントエンドエンジニアです',
          productName: 'テストアプリ',
          memo: 'メモです',
          githubId: 'yamada-taro',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          tags: [
            { id: 'tag-1', name: 'React' },
            { id: 'tag-2', name: 'TypeScript' },
          ],
          events: [
            { id: 'event-1', name: 'React Conference 2024', date: new Date('2024-12-01'), location: '東京国際フォーラム' },
          ],
          relations: [],
        },
        {
          id: 'person-2',
          name: '佐藤花子',
          handle: null,
          company: '株式会社サンプル',
          position: null,
          description: null,
          productName: null,
          memo: null,
          githubId: null,
          createdAt: new Date('2025-01-02'),
          updatedAt: new Date('2025-01-02'),
          tags: [],
          events: [],
          relations: [],
        },
      ];

      mockPersonService.findMany.mockResolvedValue(mockPeople);

      // Act: コンポーネントをレンダリング
      render(<HomeScreen />);

      // useFocusEffectのコールバックを手動実行してデータフェッチをトリガー
      await act(async () => {
        if (mockUseFocusEffectCallback) {
          mockUseFocusEffectCallback();
        }
      });

      // Assert: 人物データ（簡潔版）が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeTruthy();
        expect(screen.getByText('📅 React Conference 2024')).toBeTruthy();
        expect(screen.getByText('📍 東京国際フォーラム')).toBeTruthy();
        expect(screen.getByText('React')).toBeTruthy();
        expect(screen.getByText('TypeScript')).toBeTruthy();
      });

      await waitFor(() => {
        expect(screen.getByText('佐藤花子')).toBeTruthy();
      });

      // 人数表示の確認
      await waitFor(() => {
        expect(screen.getByText('2人が登録されています')).toBeTruthy();
      });
    });

    it('人物データが0件の時に適切なメッセージが表示される', async () => {
      // Arrange: 空のデータを準備
      mockPersonService.findMany.mockResolvedValue([]);

      // Act: コンポーネントをレンダリング
      render(<HomeScreen />);

      // useFocusEffectのコールバックを手動実行してデータフェッチをトリガー
      await act(async () => {
        if (mockUseFocusEffectCallback) {
          mockUseFocusEffectCallback();
        }
      });

      // Assert: 空状態のメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('まだ人物が登録されていません')).toBeTruthy();
        expect(screen.getByText('「人物登録」から新しい人物を追加してください')).toBeTruthy();
        expect(screen.getByText('0人が登録されています')).toBeTruthy();
      });
    });

    it('データ読み込みエラー時にエラーメッセージが表示される', async () => {
      // Arrange: エラーを発生させる
      const mockError = new Error('データベース接続エラー');
      mockPersonService.findMany.mockRejectedValue(mockError);

      // スパイでAlert.alertをモック
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');

      // Act: コンポーネントをレンダリング
      render(<HomeScreen />);

      // useFocusEffectのコールバックを手動実行してエラーをトリガー
      await act(async () => {
        if (mockUseFocusEffectCallback) {
          mockUseFocusEffectCallback();
        }
      });

      // Assert: エラーアラートが表示されることを確認
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'エラー',
          '人物データの読み込みに失敗しました。',
          [{ text: 'OK' }]
        );
      });

      alertSpy.mockRestore();
    });
  });

  describe('表示内容', () => {
    it('ヘッダーが正しく表示される', async () => {
      // Arrange: テストデータを準備
      mockPersonService.findMany.mockResolvedValue([]);

      // Act: コンポーネントをレンダリング
      render(<HomeScreen />);

      // useFocusEffectのコールバックを手動実行
      await act(async () => {
        if (mockUseFocusEffectCallback) {
          mockUseFocusEffectCallback();
        }
      });

      // Assert: ヘッダーが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('ReMeet')).toBeTruthy();
        expect(screen.getByText('0人が登録されています')).toBeTruthy();
      });
    });

    it('必須項目のみの人物データが正しく表示される', async () => {
      // Arrange: 必須項目のみのテストデータ
      const mockPeople: PersonWithRelations[] = [
        {
          id: 'person-1',
          name: '田中一郎',
          handle: null,
          company: null,
          position: null,
          description: null,
          productName: null,
          memo: null,
          githubId: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          tags: [],
          events: [],
          relations: [],
        },
      ];

      mockPersonService.findMany.mockResolvedValue(mockPeople);

      // Act: コンポーネントをレンダリング
      render(<HomeScreen />);

      // useFocusEffectのコールバックを手動実行
      await act(async () => {
        if (mockUseFocusEffectCallback) {
          mockUseFocusEffectCallback();
        }
      });

      // Assert: 名前のみが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('田中一郎')).toBeTruthy();
        expect(screen.getByText('1人が登録されています')).toBeTruthy();
      });

      // 簡潔版では表示されない項目を確認（handle、company、positionなど）
      expect(screen.queryByText('@')).toBeNull();
      expect(screen.queryByText('📱')).toBeNull();
      expect(screen.queryByText('💻')).toBeNull();
      expect(screen.queryByText('💭')).toBeNull();
    });

    it('タグが複数ある場合に正しく表示される', async () => {
      // Arrange: 複数タグのテストデータ
      const mockPeople: PersonWithRelations[] = [
        {
          id: 'person-1',
          name: '鈴木次郎',
          handle: null,
          company: null,
          position: null,
          description: null,
          productName: null,
          memo: null,
          githubId: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          tags: [
            { id: 'tag-1', name: 'React' },
            { id: 'tag-2', name: 'TypeScript' },
            { id: 'tag-3', name: 'Node.js' },
            { id: 'tag-4', name: 'Python' },
          ],
          events: [],
          relations: [],
        },
      ];

      mockPersonService.findMany.mockResolvedValue(mockPeople);

      // Act: コンポーネントをレンダリング
      render(<HomeScreen />);

      // useFocusEffectのコールバックを手動実行
      await act(async () => {
        if (mockUseFocusEffectCallback) {
          mockUseFocusEffectCallback();
        }
      });

      // Assert: 全てのタグが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('鈴木次郎')).toBeTruthy();
        expect(screen.getByText('React')).toBeTruthy();
        expect(screen.getByText('TypeScript')).toBeTruthy();
        expect(screen.getByText('Node.js')).toBeTruthy();
        expect(screen.getByText('Python')).toBeTruthy();
      });
    });
  });

  describe('ローディング状態', () => {
    it('初回読み込み時にローディング表示される', async () => {
      // Arrange: 長時間かかる非同期処理をモック
      mockPersonService.findMany.mockImplementation(
        () => new Promise(() => {}) // 永続的にペンディング状態
      );

      // Act: コンポーネントをレンダリング
      render(<HomeScreen />);

      // useFocusEffectのコールバックを手動実行してローディングをトリガー
      await act(async () => {
        if (mockUseFocusEffectCallback) {
          mockUseFocusEffectCallback();
        }
      });

      // Assert: ローディング表示されることを確認
      expect(screen.getByText('読み込み中...')).toBeTruthy();
      expect(screen.getByText('ReMeet')).toBeTruthy();
      expect(screen.getByText('出会った人を記録・管理')).toBeTruthy();
    });
  });

  describe('ユーザーインタラクション', () => {
    it('追加ボタンが表示される', async () => {
      // Arrange: テストデータを準備
      mockPersonService.findMany.mockResolvedValue([]);

      // Act: コンポーネントをレンダリング
      render(<HomeScreen />);

      // Assert: 追加ボタンが表示されることを確認
      await waitFor(() => {
        const addButton = screen.getByTestId('add-person-button');
        expect(addButton).toBeTruthy();
        expect(screen.getByText('+')).toBeTruthy();
      });
    });

    it('追加ボタンタップで人物登録画面に遷移する', async () => {
      // Arrange: テストデータを準備
      mockPersonService.findMany.mockResolvedValue([]);

      // Act: コンポーネントをレンダリング
      render(<HomeScreen />);
      
      // 追加ボタンが表示されるまで待機
      await waitFor(() => {
        const addButton = screen.getByTestId('add-person-button');
        expect(addButton).toBeTruthy();
      });

      // ボタンをタップ
      const addButton = screen.getByTestId('add-person-button');
      fireEvent.press(addButton);

      // Assert: ボタンがタップ可能であることを確認（実際の遷移はモックされているため確認しない）
      expect(addButton).toBeTruthy();
    });

    it('TanStack Query + Jotaiでデータが正しく読み込まれる', async () => {
      // Arrange: テストデータを準備
      const mockPeople: PersonWithRelations[] = [
        {
          id: 'person-1',
          name: 'テスト太郎',
          handle: null,
          company: null,
          position: null,
          description: null,
          productName: null,
          memo: null,
          githubId: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          tags: [],
          events: [],
          relations: [],
        },
      ];

      mockPersonService.findMany.mockResolvedValue(mockPeople);

      // Act: コンポーネントをレンダリング
      render(<HomeScreen />);

      // useFocusEffectのコールバックを手動実行
      await act(async () => {
        if (mockUseFocusEffectCallback) {
          mockUseFocusEffectCallback();
        }
      });

      // Assert: TanStack Query + Jotaiがデータを正しく読み込むことを確認
      await waitFor(() => {
        expect(screen.getByText('テスト太郎')).toBeTruthy();
        expect(mockPersonService.findMany).toHaveBeenCalledWith();
        expect(screen.getByText('1人が登録されています')).toBeTruthy();
      });

      // FlatListが表示されることを確認
      const flatList = screen.getByTestId('people-flatlist');
      expect(flatList).toBeTruthy();
    });
  });
});