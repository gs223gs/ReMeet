/**
 * expo-sqlite用TagServiceのテスト
 * AAAパターン（Arrange, Act, Assert）でテストを構成
 */
import { TagService, CreateTagData } from '@/database/sqlite-services/TagService';

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
  generateId: jest.fn(() => 'test-tag-id-123'),
  closeDatabase: jest.fn(),
}));

describe('sqlite TagService', () => {
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
  });

  describe('create', () => {
    it('新しいタグを正しく作成できる', async () => {
      // Arrange: テストデータを準備
      const tagData: CreateTagData = {
        name: 'React',
      };

      const mockTag = {
        id: 'test-tag-id-123',
        name: 'React',
        created_at: '2025-01-01T00:00:00.000Z',
      };

      mockDb.getFirstAsync
        .mockResolvedValueOnce(null) // 既存タグのチェック（存在しない）
        .mockResolvedValueOnce(mockTag); // 作成したタグの取得

      // Act: タグを作成
      const result = await TagService.create(tagData);

      // Assert: 結果を検証
      expect(result).toBeDefined();
      expect(result.id).toBe('test-tag-id-123');
      expect(result.name).toBe('React');
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'INSERT INTO tags (id, name) VALUES (?, ?)',
        ['test-tag-id-123', 'React']
      );
    });

    it('既存のタグ名で作成を試みると既存のタグが返される', async () => {
      // Arrange: 既存のタグを設定
      const existingTag = {
        id: 'existing-tag-id',
        name: 'TypeScript',
        created_at: '2025-01-01T00:00:00.000Z',
      };

      mockDb.getFirstAsync.mockResolvedValue(existingTag);
      
      // Act: 同じ名前でタグを作成
      const result = await TagService.create({ name: 'TypeScript' });

      // Assert: 既存のタグが返されることを確認
      expect(result.id).toBe('existing-tag-id');
      expect(result.name).toBe('TypeScript');
      expect(mockDb.runAsync).not.toHaveBeenCalled(); // INSERTが実行されないことを確認
    });

    it('前後の空白が除去されてタグが作成される', async () => {
      // Arrange: 空白を含むテストデータ
      const tagData: CreateTagData = {
        name: '  JavaScript  ',
      };

      const mockTag = {
        id: 'test-tag-id-123',
        name: 'JavaScript',
        created_at: '2025-01-01T00:00:00.000Z',
      };

      mockDb.getFirstAsync
        .mockResolvedValueOnce(null) // 既存タグのチェック
        .mockResolvedValueOnce(mockTag); // 作成したタグの取得

      // Act: タグを作成
      const result = await TagService.create(tagData);

      // Assert: 空白が除去されることを確認
      expect(result.name).toBe('JavaScript');
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM tags WHERE name = ?',
        ['JavaScript'] // 正規化された名前で検索されること
      );
    });

    it('空の名前でタグ作成を試みるとエラーになる', async () => {
      // Arrange: 空の名前
      const tagData: CreateTagData = {
        name: '',
      };

      // Act & Assert: エラーが発生することを確認
      await expect(TagService.create(tagData)).rejects.toThrow('タグ名を入力してください');
    });

    it('空白のみの名前でタグ作成を試みるとエラーになる', async () => {
      // Arrange: 空白のみの名前
      const tagData: CreateTagData = {
        name: '   ',
      };

      // Act & Assert: エラーが発生することを確認
      await expect(TagService.create(tagData)).rejects.toThrow('タグ名を入力してください');
    });
  });

  describe('findAll', () => {
    it('すべてのタグを名前順で取得できる', async () => {
      // Arrange: 複数のタグを設定
      const mockTags = [
        { id: 'tag-1', name: 'Alpha', created_at: '2025-01-01T00:00:00.000Z' },
        { id: 'tag-2', name: 'Beta', created_at: '2025-01-01T00:00:00.000Z' },
        { id: 'tag-3', name: 'Zebra', created_at: '2025-01-01T00:00:00.000Z' },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockTags);

      // Act: すべてのタグを取得
      const result = await TagService.findAll();

      // Assert: 結果を検証
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Alpha');
      expect(result[1].name).toBe('Beta');
      expect(result[2].name).toBe('Zebra');
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM tags ORDER BY name ASC'
      );
    });

    it('タグが存在しない場合は空の配列が返る', async () => {
      // Arrange: 空の結果を設定
      mockDb.getAllAsync.mockResolvedValue([]);

      // Act: すべてのタグを取得
      const result = await TagService.findAll();

      // Assert: 空の配列が返ることを確認
      expect(result).toEqual([]);
    });
  });

  describe('search', () => {
    it('検索キーワードに一致するタグを取得できる', async () => {
      // Arrange: 検索結果を設定
      const mockTags = [
        { id: 'tag-1', name: 'CoffeeScript', created_at: '2025-01-01T00:00:00.000Z' },
        { id: 'tag-2', name: 'JavaScript', created_at: '2025-01-01T00:00:00.000Z' },
        { id: 'tag-3', name: 'TypeScript', created_at: '2025-01-01T00:00:00.000Z' },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockTags);

      // Act: タグを検索
      const result = await TagService.search('Script');

      // Assert: 結果を検証
      expect(result).toHaveLength(3);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM tags WHERE name LIKE ? ORDER BY name ASC',
        ['%Script%']
      );
    });

    it('一致するタグがない場合は空の配列が返る', async () => {
      // Arrange: 空の結果を設定
      mockDb.getAllAsync.mockResolvedValue([]);

      // Act: タグを検索
      const result = await TagService.search('NonExistent');

      // Assert: 空の配列が返ることを確認
      expect(result).toEqual([]);
    });
  });

  describe('count', () => {
    it('登録されているタグの総数を取得できる', async () => {
      // Arrange: カウント結果を設定
      mockDb.getFirstAsync.mockResolvedValue({ count: 10 });

      // Act: タグ数を取得
      const result = await TagService.count();

      // Assert: 結果を検証
      expect(result).toBe(10);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM tags'
      );
    });

    it('タグが登録されていない場合は0を返す', async () => {
      // Arrange: 空の結果を設定
      mockDb.getFirstAsync.mockResolvedValue(null);

      // Act: タグ数を取得
      const result = await TagService.count();

      // Assert: 結果を検証
      expect(result).toBe(0);
    });
  });
});