/**
 * TagServiceのテスト
 * AAAパターン（Arrange, Act, Assert）でテストを構成
 */
import { TagService, CreateTagData } from '@/database/services/TagService';
import prisma from '@/database/client';

// テスト用のデータベースセットアップ
beforeAll(async () => {
  // テスト前にデータベースをクリア
  await prisma.$executeRaw`DELETE FROM persons_tags`;
  await prisma.$executeRaw`DELETE FROM persons`;
  await prisma.$executeRaw`DELETE FROM tags`;
});

beforeEach(async () => {
  // 各テスト前にデータをクリア
  await prisma.$executeRaw`DELETE FROM persons_tags`;
  await prisma.$executeRaw`DELETE FROM persons`;
  await prisma.$executeRaw`DELETE FROM tags`;
});

afterAll(async () => {
  // テスト終了後にデータベース接続を閉じる
  await prisma.$disconnect();
});

describe('TagService', () => {
  describe('create', () => {
    it('新しいタグを正しく作成できる', async () => {
      // Arrange: テストデータを準備
      const tagData: CreateTagData = {
        name: 'React',
      };

      // Act: タグを作成
      const result = await TagService.create(tagData);

      // Assert: 結果を検証
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(tagData.name);
      expect(result.createdAt).toBeDefined();
    });

    it('既存のタグ名で作成を試みると既存のタグが返される', async () => {
      // Arrange: 既存のタグを作成
      const existingTag = await TagService.create({ name: 'TypeScript' });
      
      // Act: 同じ名前でタグを作成
      const result = await TagService.create({ name: 'TypeScript' });

      // Assert: 既存のタグが返されることを確認
      expect(result.id).toBe(existingTag.id);
      expect(result.name).toBe('TypeScript');
    });

    it('前後の空白が除去されてタグが作成される', async () => {
      // Arrange: 空白を含むテストデータ
      const tagData: CreateTagData = {
        name: '  JavaScript  ',
      };

      // Act: タグを作成
      const result = await TagService.create(tagData);

      // Assert: 空白が除去されることを確認
      expect(result.name).toBe('JavaScript');
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

  describe('createMany', () => {
    it('複数のタグを一括作成できる', async () => {
      // Arrange: 複数のタグ名
      const tagNames = ['React', 'TypeScript', 'Node.js'];

      // Act: 複数のタグを作成
      const result = await TagService.createMany(tagNames);

      // Assert: 結果を検証
      expect(result).toHaveLength(3);
      expect(result.map(tag => tag.name)).toEqual(expect.arrayContaining(tagNames));
    });

    it('重複するタグ名が含まれていても正しく処理される', async () => {
      // Arrange: 既存のタグを作成し、重複を含むリスト
      await TagService.create({ name: 'Python' });
      const tagNames = ['Python', 'Django', 'Flask'];

      // Act: 複数のタグを作成
      const result = await TagService.createMany(tagNames);

      // Assert: 結果を検証
      expect(result).toHaveLength(3);
      expect(result.map(tag => tag.name)).toEqual(expect.arrayContaining(tagNames));
    });
  });

  describe('findById', () => {
    it('存在するタグを正しく取得できる', async () => {
      // Arrange: テスト用のタグを作成
      const createdTag = await TagService.create({ name: 'Vue.js' });

      // Act: IDでタグを検索
      const result = await TagService.findById(createdTag.id);

      // Assert: 結果を検証
      expect(result).toBeDefined();
      expect(result!.id).toBe(createdTag.id);
      expect(result!.name).toBe('Vue.js');
    });

    it('存在しないタグを検索するとnullが返る', async () => {
      // Arrange: 存在しないID
      const nonExistentId = 'non-existent-id';

      // Act: 存在しないIDで検索
      const result = await TagService.findById(nonExistentId);

      // Assert: nullが返ることを確認
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('名前でタグを正しく検索できる', async () => {
      // Arrange: テスト用のタグを作成
      await TagService.create({ name: 'Angular' });

      // Act: 名前でタグを検索
      const result = await TagService.findByName('Angular');

      // Assert: 結果を検証
      expect(result).toBeDefined();
      expect(result!.name).toBe('Angular');
    });

    it('存在しない名前で検索するとnullが返る', async () => {
      // Arrange: 存在しない名前
      const nonExistentName = 'NonExistentFramework';

      // Act: 存在しない名前で検索
      const result = await TagService.findByName(nonExistentName);

      // Assert: nullが返ることを確認
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('すべてのタグを名前順で取得できる', async () => {
      // Arrange: 複数のタグを作成
      await TagService.create({ name: 'Zebra' });
      await TagService.create({ name: 'Alpha' });
      await TagService.create({ name: 'Beta' });

      // Act: すべてのタグを取得
      const result = await TagService.findAll();

      // Assert: 結果を検証
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Alpha');
      expect(result[1].name).toBe('Beta');
      expect(result[2].name).toBe('Zebra');
    });

    it('タグが存在しない場合は空の配列が返る', async () => {
      // Arrange: データなし（beforeEachでクリア済み）

      // Act: すべてのタグを取得
      const result = await TagService.findAll();

      // Assert: 空の配列が返ることを確認
      expect(result).toEqual([]);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      // テスト用のデータを準備
      await TagService.create({ name: 'JavaScript' });
      await TagService.create({ name: 'TypeScript' });
      await TagService.create({ name: 'CoffeeScript' });
      await TagService.create({ name: 'Python' });
    });

    it('検索キーワードに一致するタグを取得できる', async () => {
      // Arrange: 検索キーワード
      const searchTerm = 'Script';

      // Act: タグを検索
      const result = await TagService.search(searchTerm);

      // Assert: 結果を検証
      expect(result).toHaveLength(3);
      expect(result.map(tag => tag.name)).toEqual([
        'CoffeeScript',
        'JavaScript', 
        'TypeScript'
      ]);
    });

    it('一致するタグがない場合は空の配列が返る', async () => {
      // Arrange: 一致しない検索キーワード
      const searchTerm = 'NonExistent';

      // Act: タグを検索
      const result = await TagService.search(searchTerm);

      // Assert: 空の配列が返ることを確認
      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('タグを正しく削除できる', async () => {
      // Arrange: テスト用のタグを作成
      const createdTag = await TagService.create({ name: '削除対象タグ' });

      // Act: タグを削除
      await TagService.delete(createdTag.id);

      // Assert: 削除されたことを確認
      const deletedTag = await TagService.findById(createdTag.id);
      expect(deletedTag).toBeNull();
    });

    it('存在しないタグの削除を試みるとエラーになる', async () => {
      // Arrange: 存在しないID
      const nonExistentId = 'non-existent-id';

      // Act & Assert: エラーが発生することを確認
      await expect(TagService.delete(nonExistentId)).rejects.toThrow();
    });
  });

  describe('count', () => {
    it('登録されているタグの総数を取得できる', async () => {
      // Arrange: テスト用のタグを作成
      await TagService.create({ name: 'タグ1' });
      await TagService.create({ name: 'タグ2' });
      await TagService.create({ name: 'タグ3' });

      // Act: タグ数を取得
      const result = await TagService.count();

      // Assert: 結果を検証
      expect(result).toBe(3);
    });

    it('タグが登録されていない場合は0を返す', async () => {
      // Arrange: データなし（beforeEachでクリア済み）

      // Act: タグ数を取得
      const result = await TagService.count();

      // Assert: 結果を検証
      expect(result).toBe(0);
    });
  });
});