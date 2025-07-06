/**
 * 人物一覧画面のテスト
 * AAAパターン（Arrange, Act, Assert）でテストを構成
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import PeopleScreen from '@/app/(tabs)/people';
import { PersonService } from '@/database/sqlite-services';
import type { PersonWithRelations } from '@/database/sqlite-types';

// PersonServiceのモック
jest.mock('@/database/sqlite-services', () => ({
  PersonService: {
    findMany: jest.fn(),
  },
}));

// React Navigationのモック
jest.mock('@react-navigation/native', () => {
  const actualReact = jest.requireActual('react');
  return {
    useFocusEffect: jest.fn((callback) => {
      // コンポーネントがマウントされた後に実行
      actualReact.useEffect(() => {
        callback();
      }, []);
    }),
  };
});

const mockPersonService = PersonService as jest.Mocked<typeof PersonService>;

describe('PeopleScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      render(<PeopleScreen />);

      // Assert: 人物データが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeTruthy();
        expect(screen.getByText('@yamada_taro')).toBeTruthy();
        expect(screen.getByText('株式会社テスト')).toBeTruthy();
        expect(screen.getByText('エンジニア')).toBeTruthy();
        expect(screen.getByText('📱 テストアプリ')).toBeTruthy();
        expect(screen.getByText('💻 yamada-taro')).toBeTruthy();
        expect(screen.getByText('💭 メモです')).toBeTruthy();
        expect(screen.getByText('📅 React Conference 2024')).toBeTruthy();
        expect(screen.getByText('📍 東京国際フォーラム')).toBeTruthy();
        expect(screen.getByText('React')).toBeTruthy();
        expect(screen.getByText('TypeScript')).toBeTruthy();
      });

      await waitFor(() => {
        expect(screen.getByText('佐藤花子')).toBeTruthy();
        expect(screen.getByText('株式会社サンプル')).toBeTruthy();
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
      render(<PeopleScreen />);

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
      render(<PeopleScreen />);

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
      render(<PeopleScreen />);

      // Assert: ヘッダーが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('人物一覧')).toBeTruthy();
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
      render(<PeopleScreen />);

      // Assert: 名前のみが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('田中一郎')).toBeTruthy();
        expect(screen.getByText('1人が登録されています')).toBeTruthy();
      });

      // オプション項目は表示されないことを確認
      expect(screen.queryByText('📱')).toBeNull();
      expect(screen.queryByText('💻')).toBeNull();
      expect(screen.queryByText('💭')).toBeNull();
      expect(screen.queryByText('📅')).toBeNull();
      expect(screen.queryByText('📍')).toBeNull();
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
      render(<PeopleScreen />);

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
    it('初回読み込み時にローディング表示される', () => {
      // Arrange: 長時間かかる非同期処理をモック
      mockPersonService.findMany.mockImplementation(
        () => new Promise(() => {}) // 永続的にペンディング状態
      );

      // Act: コンポーネントをレンダリング
      render(<PeopleScreen />);

      // Assert: ローディング表示されることを確認
      expect(screen.getByText('読み込み中...')).toBeTruthy();
      expect(screen.getByText('人物一覧')).toBeTruthy();
      expect(screen.getByText('登録済みの人物情報')).toBeTruthy();
    });
  });
});