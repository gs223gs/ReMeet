/**
 * 人物詳細画面のテスト
 * TanStack Query使用版
 * AAAパターン（Arrange, Act, Assert）でテストを構成
 */
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '../../test-utils/test-utils';
import PersonDetailScreen from '@/app/person-detail';
import { PersonService } from '@/database/sqlite-services';
import type { PersonWithRelations } from '@/database/sqlite-types';

// PersonServiceのモック
jest.mock('@/database/sqlite-services', () => ({
  PersonService: {
    findById: jest.fn(),
  },
}));

// expo-routerのモック
const mockLocalSearchParams = { id: 'person-1' };
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockLocalSearchParams,
  useRouter: () => ({
    push: mockPush,
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

describe('PersonDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockUseFocusEffectCallback = null;
    // デフォルトのパラメータを設定
    (mockLocalSearchParams as any).id = 'person-1';
  });

  describe('データ読み込み', () => {
    it('人物詳細データが正しく表示される', async () => {
      // Arrange: テストデータを準備
      const mockPerson: PersonWithRelations = {
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
        updatedAt: new Date('2025-01-02'),
        tags: [
          { id: 'tag-1', name: 'React' },
          { id: 'tag-2', name: 'TypeScript' },
        ],
        events: [
          { 
            id: 'event-1', 
            name: 'React Conference 2024', 
            date: new Date('2024-12-01'), 
            location: '東京国際フォーラム' 
          },
        ],
        relations: [],
      };

      mockPersonService.findById.mockResolvedValue(mockPerson);

      // Act: コンポーネントをレンダリング
      render(<PersonDetailScreen />);

      // Assert: 人物詳細データが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeTruthy();
        expect(screen.getByText('@yamada_taro')).toBeTruthy();
        expect(screen.getByText('🏢 株式会社テスト')).toBeTruthy();
        expect(screen.getByText('💼 エンジニア')).toBeTruthy();
        expect(screen.getByText('フロントエンドエンジニアです')).toBeTruthy();
        expect(screen.getByText('📱 テストアプリ')).toBeTruthy();
        expect(screen.getByText('💻 yamada-taro')).toBeTruthy();
        expect(screen.getByText('💭 メモです')).toBeTruthy();
        expect(screen.getByText('📅 React Conference 2024')).toBeTruthy();
        expect(screen.getByText('📍 東京国際フォーラム')).toBeTruthy();
        expect(screen.getByText('React')).toBeTruthy();
        expect(screen.getByText('TypeScript')).toBeTruthy();
        expect(screen.getByText('編集')).toBeTruthy();
      });

      // 登録日・更新日の確認
      await waitFor(() => {
        expect(screen.getByText('登録日: 2025/1/1')).toBeTruthy();
        expect(screen.getByText('更新日: 2025/1/2')).toBeTruthy();
      });
    });

    it('人物が見つからない場合にエラーメッセージが表示される', async () => {
      // Arrange: nullを返すようにモック
      mockPersonService.findById.mockResolvedValue(null);

      // Act: コンポーネントをレンダリング
      render(<PersonDetailScreen />);

      // Assert: エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('指定された人物が見つかりません')).toBeTruthy();
      });
    });

    it('データ読み込みエラー時にエラーメッセージが表示される', async () => {
      // Arrange: エラーを発生させる
      const mockError = new Error('データベース接続エラー');
      mockPersonService.findById.mockRejectedValue(mockError);

      // スパイでAlert.alertをモック
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');

      // Act: コンポーネントをレンダリング
      render(<PersonDetailScreen />);

      // Assert: エラーアラートが表示されることを確認
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'エラー',
          '人物詳細データの読み込みに失敗しました。',
          [{ text: 'OK' }]
        );
      });

      await waitFor(() => {
        expect(screen.getByText('データの読み込みに失敗しました')).toBeTruthy();
      });

      alertSpy.mockRestore();
    });

    it('IDが指定されていない場合にエラーメッセージが表示される', async () => {
      // Arrange: IDをundefinedに設定
      (mockLocalSearchParams as any).id = undefined;

      // Act: コンポーネントをレンダリング
      render(<PersonDetailScreen />);

      // Assert: エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('人物IDが指定されていません')).toBeTruthy();
      });
    });
  });

  describe('表示内容', () => {

    it('必須項目のみの人物データが正しく表示される', async () => {
      // Arrange: 必須項目のみのテストデータ
      const mockPerson: PersonWithRelations = {
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
      };

      mockPersonService.findById.mockResolvedValue(mockPerson);

      // Act: コンポーネントをレンダリング
      render(<PersonDetailScreen />);

      // Assert: 名前のみが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('田中一郎')).toBeTruthy();
        expect(screen.getByText('登録日: 2025/1/1')).toBeTruthy();
      });

      // オプション項目は表示されないことを確認
      expect(screen.queryByText('勤務先')).toBeNull();
      expect(screen.queryByText('説明')).toBeNull();
      expect(screen.queryByText('関連情報')).toBeNull();
      expect(screen.queryByText('タグ')).toBeNull();
      expect(screen.queryByText('出会った場所・イベント')).toBeNull();
      expect(screen.queryByText('メモ')).toBeNull();
    });

    it('タグが複数ある場合に正しく表示される', async () => {
      // Arrange: 複数タグのテストデータ
      const mockPerson: PersonWithRelations = {
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
      };

      mockPersonService.findById.mockResolvedValue(mockPerson);

      // Act: コンポーネントをレンダリング
      render(<PersonDetailScreen />);

      // Assert: 全てのタグが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('鈴木次郎')).toBeTruthy();
        expect(screen.getByText('タグ')).toBeTruthy();
        expect(screen.getByText('React')).toBeTruthy();
        expect(screen.getByText('TypeScript')).toBeTruthy();
        expect(screen.getByText('Node.js')).toBeTruthy();
        expect(screen.getByText('Python')).toBeTruthy();
      });
    });

    it('複数のイベントが正しく表示される', async () => {
      // Arrange: 複数イベントのテストデータ
      const mockPerson: PersonWithRelations = {
        id: 'person-1',
        name: '佐藤花子',
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
        events: [
          { 
            id: 'event-1', 
            name: 'React Conference 2024', 
            date: new Date('2024-12-01'), 
            location: '東京国際フォーラム' 
          },
          { 
            id: 'event-2', 
            name: 'Tech Meetup Tokyo', 
            date: null,
            location: '渋谷' 
          },
        ],
        relations: [],
      };

      mockPersonService.findById.mockResolvedValue(mockPerson);

      // Act: コンポーネントをレンダリング
      render(<PersonDetailScreen />);

      // Assert: 全てのイベントが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('佐藤花子')).toBeTruthy();
        expect(screen.getByText('出会った場所・イベント')).toBeTruthy();
        expect(screen.getByText('📅 React Conference 2024')).toBeTruthy();
        expect(screen.getByText('📆 2024/12/1')).toBeTruthy();
        expect(screen.getByText('📍 東京国際フォーラム')).toBeTruthy();
        expect(screen.getByText('📅 Tech Meetup Tokyo')).toBeTruthy();
        expect(screen.getByText('📍 渋谷')).toBeTruthy();
      });
    });
  });

  describe('ローディング状態', () => {
    it('初回読み込み時にローディング表示される', async () => {
      // Arrange: 長時間かかる非同期処理をモック
      mockPersonService.findById.mockImplementation(
        () => new Promise(() => {}) // 永続的にペンディング状態
      );

      // Act: コンポーネントをレンダリング
      render(<PersonDetailScreen />);

      // Assert: ローディング表示されることを確認
      expect(screen.getByText('読み込み中...')).toBeTruthy();
    });
  });

  describe('ユーザーインタラクション', () => {

    it('TanStack Queryでデータが正しく読み込まれる', async () => {
      // Arrange: テストデータを準備
      const mockPerson: PersonWithRelations = {
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
      };

      mockPersonService.findById.mockResolvedValue(mockPerson);

      // Act: コンポーネントをレンダリング
      render(<PersonDetailScreen />);

      // Assert: TanStack Queryがデータを正しく読み込むことを確認
      await waitFor(() => {
        expect(screen.getByText('テスト太郎')).toBeTruthy();
        expect(mockPersonService.findById).toHaveBeenCalledWith('person-1');
      });

      // ScrollViewが表示されることを確認
      const scrollView = screen.getByTestId('person-detail-scroll-view');
      expect(scrollView).toBeTruthy();
    });

    it('編集ボタンをタップすると編集画面に遷移する', async () => {
      // Arrange: テストデータを準備
      const mockPerson: PersonWithRelations = {
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
      };

      mockPersonService.findById.mockResolvedValue(mockPerson);

      // Act: コンポーネントをレンダリング
      render(<PersonDetailScreen />);

      // Assert: 編集ボタンが表示されることを確認
      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeTruthy();
      });

      // 編集ボタンをタップ
      const editButton = screen.getByTestId('edit-button');
      fireEvent.press(editButton);

      // Assert: 編集画面への遷移が呼ばれることを確認
      expect(mockPush).toHaveBeenCalledWith('/person-edit?id=person-1');
    });
  });
});