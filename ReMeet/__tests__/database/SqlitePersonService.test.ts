/**
 * expo-sqlite用PersonServiceのテスト
 * AAAパターン（Arrange, Act, Assert）でテストを構成
 */
import { PersonService, CreatePersonData, UpdatePersonData } from '@/database/sqlite-services/PersonService';
import { TagService } from '@/database/sqlite-services/TagService';

// SQLiteのモック設定
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    withTransactionAsync: jest.fn((fn) => fn()),
    closeAsync: jest.fn(),
  }),
}));

// データベースクライアントのモック
jest.mock('@/database/sqlite-client', () => ({
  getDatabase: jest.fn(),
  generateId: jest.fn(() => 'test-id-123'),
  closeDatabase: jest.fn(),
}));

describe('sqlite PersonService', () => {
  const mockDb = {
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    withTransactionAsync: jest.fn((fn) => fn()),
    closeAsync: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { getDatabase } = require('@/database/sqlite-client');
    getDatabase.mockResolvedValue(mockDb);
    
    // withTransactionAsyncのモックを設定
    mockDb.withTransactionAsync.mockImplementation(async (fn) => {
      return await fn();
    });
  });

  describe('create', () => {
    it('基本的な人物データを正しく登録できる', async () => {
      // Arrange: テストデータを準備
      const personData: CreatePersonData = {
        name: '山田太郎',
        handle: '@yamada_taro',
        company: '株式会社テスト',
        position: 'エンジニア',
        description: 'フロントエンドエンジニアです',
        productName: 'テストアプリ',
        memo: 'メモです',
        githubId: 'yamada-taro',
      };

      const mockPerson = {
        id: 'test-id-123',
        name: '山田太郎',
        handle: '@yamada_taro',
        company: '株式会社テスト',
        position: 'エンジニア',
        description: 'フロントエンドエンジニアです',
        product_name: 'テストアプリ',
        memo: 'メモです',
        github_id: 'yamada-taro',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      };

      mockDb.getFirstAsync.mockResolvedValue(mockPerson);

      // Act: 人物を作成
      const result = await PersonService.create(personData);

      // Assert: 結果を検証
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id-123');
      expect(result.name).toBe(personData.name);
      expect(result.handle).toBe(personData.handle);
      expect(result.company).toBe(personData.company);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO persons'),
        expect.arrayContaining(['test-id-123', '山田太郎'])
      );
    });

    it('必須項目（名前）のみで人物を登録できる', async () => {
      // Arrange: 必須項目のみのテストデータ
      const personData: CreatePersonData = {
        name: '佐藤花子',
      };

      const mockPerson = {
        id: 'test-id-123',
        name: '佐藤花子',
        handle: null,
        company: null,
        position: null,
        description: null,
        product_name: null,
        memo: null,
        github_id: null,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      };

      mockDb.getFirstAsync.mockResolvedValue(mockPerson);

      // Act: 人物を作成
      const result = await PersonService.create(personData);

      // Assert: 結果を検証
      expect(result).toBeDefined();
      expect(result.name).toBe(personData.name);
      expect(result.handle).toBeNull();
      expect(result.company).toBeNull();
    });

    it('空の名前で登録を試みるとエラーになる', async () => {
      // Arrange: 無効なテストデータ
      const personData: CreatePersonData = {
        name: '',
      };

      // Act & Assert: エラーが発生することを確認
      await expect(PersonService.create(personData)).rejects.toThrow('名前は必須項目です');
    });

    it('タグ付きで人物を登録できる', async () => {
      // Arrange: タグIDを含むテストデータ
      const personData: CreatePersonData = {
        name: '田中次郎',
        tagIds: ['tag-1', 'tag-2'],
      };

      const mockPerson = {
        id: 'test-id-123',
        name: '田中次郎',
        handle: null,
        company: null,
        position: null,
        description: null,
        product_name: null,
        memo: null,
        github_id: null,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      };

      mockDb.getFirstAsync.mockResolvedValue(mockPerson);

      // Act: 人物を作成
      const result = await PersonService.create(personData);

      // Assert: 結果を検証
      expect(result).toBeDefined();
      expect(result.name).toBe(personData.name);
      
      // タグの関連付けが実行されたことを確認
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'INSERT INTO persons_tags (person_id, tag_id) VALUES (?, ?)',
        ['test-id-123', 'tag-1']
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'INSERT INTO persons_tags (person_id, tag_id) VALUES (?, ?)',
        ['test-id-123', 'tag-2']
      );
    });
  });

  describe('findById', () => {
    it('存在する人物を正しく取得できる', async () => {
      // Arrange: モックレスポンスを設定
      const mockPerson = {
        id: 'test-id-123',
        name: '鈴木一郎',
        company: '株式会社サンプル',
        handle: null,
        position: null,
        description: null,
        product_name: null,
        memo: null,
        github_id: null,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      };

      const mockTags = [
        { id: 'tag-1', name: 'React', created_at: '2025-01-01T00:00:00.000Z' },
        { id: 'tag-2', name: 'TypeScript', created_at: '2025-01-01T00:00:00.000Z' },
      ];

      mockDb.getFirstAsync.mockResolvedValueOnce(mockPerson); // 人物情報の取得
      mockDb.getAllAsync.mockResolvedValueOnce(mockTags);    // タグ情報の取得

      // Act: IDで人物を検索
      const result = await PersonService.findById('test-id-123');

      // Assert: 結果を検証
      expect(result).toBeDefined();
      expect(result!.id).toBe('test-id-123');
      expect(result!.name).toBe('鈴木一郎');
      expect(result!.company).toBe('株式会社サンプル');
      expect(result!.tags).toHaveLength(2);
      expect(result!.tags[0].name).toBe('React');
    });

    it('存在しない人物を検索するとnullが返る', async () => {
      // Arrange: 空の結果を設定
      mockDb.getFirstAsync.mockResolvedValue(null);

      // Act: 存在しないIDで検索
      const result = await PersonService.findById('non-existent-id');

      // Assert: nullが返ることを確認
      expect(result).toBeNull();
    });
  });

  describe('count', () => {
    it('登録されている人物の総数を取得できる', async () => {
      // Arrange: カウント結果を設定
      mockDb.getFirstAsync.mockResolvedValue({ count: 5 });

      // Act: 人物数を取得
      const result = await PersonService.count();

      // Assert: 結果を検証
      expect(result).toBe(5);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM persons'
      );
    });

    it('人物が登録されていない場合は0を返す', async () => {
      // Arrange: 空の結果を設定
      mockDb.getFirstAsync.mockResolvedValue(null);

      // Act: 人物数を取得
      const result = await PersonService.count();

      // Assert: 結果を検証
      expect(result).toBe(0);
    });
  });
});