/**
 * PersonServiceのテスト
 * AAAパターン（Arrange, Act, Assert）でテストを構成
 */
import { PersonService, CreatePersonData, UpdatePersonData } from '@/database/services/PersonService';
import { TagService } from '@/database/services/TagService';
import prisma from '@/database/client';

// テスト用のデータベースをメモリ内に作成するためのセットアップ
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

describe('PersonService', () => {
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

      // Act: 人物を作成
      const result = await PersonService.create(personData);

      // Assert: 結果を検証
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(personData.name);
      expect(result.handle).toBe(personData.handle);
      expect(result.company).toBe(personData.company);
      expect(result.position).toBe(personData.position);
      expect(result.description).toBe(personData.description);
      expect(result.productName).toBe(personData.productName);
      expect(result.memo).toBe(personData.memo);
      expect(result.githubId).toBe(personData.githubId);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('必須項目（名前）のみで人物を登録できる', async () => {
      // Arrange: 必須項目のみのテストデータ
      const personData: CreatePersonData = {
        name: '佐藤花子',
      };

      // Act: 人物を作成
      const result = await PersonService.create(personData);

      // Assert: 結果を検証
      expect(result).toBeDefined();
      expect(result.name).toBe(personData.name);
      expect(result.handle).toBeNull();
      expect(result.company).toBeNull();
      expect(result.position).toBeNull();
    });

    it('タグ付きで人物を登録できる', async () => {
      // Arrange: タグを事前に作成
      const tag1 = await TagService.create({ name: 'React' });
      const tag2 = await TagService.create({ name: 'TypeScript' });
      
      const personData: CreatePersonData = {
        name: '田中次郎',
        tagIds: [tag1.id, tag2.id],
      };

      // Act: 人物を作成
      const result = await PersonService.create(personData);

      // Assert: 結果を検証
      expect(result).toBeDefined();
      expect(result.name).toBe(personData.name);
      
      // タグの関連も確認
      const personWithTags = await PersonService.findById(result.id);
      expect(personWithTags).toBeDefined();
      // タグの関連が正しく設定されていることを確認
      const personTagsCount = await prisma.personTag.count({
        where: { personId: result.id }
      });
      expect(personTagsCount).toBe(2);
    });

    it('空の名前で登録を試みるとエラーになる', async () => {
      // Arrange: 無効なテストデータ
      const personData: CreatePersonData = {
        name: '',
      };

      // Act & Assert: エラーが発生することを確認
      await expect(PersonService.create(personData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('存在する人物を正しく取得できる', async () => {
      // Arrange: テスト用の人物を作成
      const createdPerson = await PersonService.create({
        name: '鈴木一郎',
        company: '株式会社サンプル',
      });

      // Act: IDで人物を検索
      const result = await PersonService.findById(createdPerson.id);

      // Assert: 結果を検証
      expect(result).toBeDefined();
      expect(result!.id).toBe(createdPerson.id);
      expect(result!.name).toBe('鈴木一郎');
      expect(result!.company).toBe('株式会社サンプル');
    });

    it('存在しない人物を検索するとnullが返る', async () => {
      // Arrange: 存在しないID
      const nonExistentId = 'non-existent-id';

      // Act: 存在しないIDで検索
      const result = await PersonService.findById(nonExistentId);

      // Assert: nullが返ることを確認
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('人物の情報を正しく更新できる', async () => {
      // Arrange: テスト用の人物を作成
      const createdPerson = await PersonService.create({
        name: '更新前の名前',
        company: '更新前の会社',
      });

      const updateData: UpdatePersonData = {
        name: '更新後の名前',
        company: '更新後の会社',
        position: '新しい役職',
      };

      // Act: 人物を更新
      const result = await PersonService.update(createdPerson.id, updateData);

      // Assert: 結果を検証
      expect(result.name).toBe(updateData.name);
      expect(result.company).toBe(updateData.company);
      expect(result.position).toBe(updateData.position);
      expect(result.updatedAt.getTime()).toBeGreaterThan(result.createdAt.getTime());
    });

    it('存在しない人物の更新を試みるとエラーになる', async () => {
      // Arrange: 存在しないID
      const nonExistentId = 'non-existent-id';
      const updateData: UpdatePersonData = {
        name: '更新後の名前',
      };

      // Act & Assert: エラーが発生することを確認
      await expect(PersonService.update(nonExistentId, updateData)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('人物を正しく削除できる', async () => {
      // Arrange: テスト用の人物を作成
      const createdPerson = await PersonService.create({
        name: '削除対象の人物',
      });

      // Act: 人物を削除
      await PersonService.delete(createdPerson.id);

      // Assert: 削除されたことを確認
      const deletedPerson = await PersonService.findById(createdPerson.id);
      expect(deletedPerson).toBeNull();
    });

    it('存在しない人物の削除を試みるとエラーになる', async () => {
      // Arrange: 存在しないID
      const nonExistentId = 'non-existent-id';

      // Act & Assert: エラーが発生することを確認
      await expect(PersonService.delete(nonExistentId)).rejects.toThrow();
    });
  });

  describe('findMany', () => {
    it('すべての人物を取得できる', async () => {
      // Arrange: テスト用のデータを準備
      await PersonService.create({
        name: 'フロントエンド太郎',
        company: 'A社',
      });
      
      await PersonService.create({
        name: 'バックエンド花子',
        company: 'B社',
      });
      
      await PersonService.create({
        name: 'フルスタック次郎',
        company: 'A社',
      });
      
      // Act: すべての人物を取得
      const result = await PersonService.findMany();

      // Assert: 結果を検証
      expect(result).toHaveLength(3);
      expect(result[0].createdAt.getTime()).toBeGreaterThanOrEqual(result[1].createdAt.getTime());
    });

    it('名前で絞り込み検索ができる', async () => {
      // Arrange: テスト用のデータを準備
      await PersonService.create({
        name: 'フロントエンド太郎',
        company: 'A社',
      });
      
      await PersonService.create({
        name: 'バックエンド花子',
        company: 'B社',
      });
      
      const filter = { name: 'フロント' };

      // Act: 名前で検索
      const result = await PersonService.findMany(filter);

      // Assert: 結果を検証
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('フロントエンド太郎');
    });

    it('会社名で絞り込み検索ができる', async () => {
      // Arrange: テスト用のデータを準備
      await PersonService.create({
        name: 'フロントエンド太郎',
        company: 'A社',
      });
      
      await PersonService.create({
        name: 'フルスタック次郎',
        company: 'A社',
      });
      
      const filter = { company: 'A社' };

      // Act: 会社名で検索
      const result = await PersonService.findMany(filter);

      // Assert: 結果を検証
      expect(result).toHaveLength(2);
      expect(result.every(person => person.company === 'A社')).toBe(true);
    });
  });

  describe('count', () => {
    it('登録されている人物の総数を取得できる', async () => {
      // Arrange: テスト用のデータを準備
      await PersonService.create({ name: '人物1' });
      await PersonService.create({ name: '人物2' });
      await PersonService.create({ name: '人物3' });

      // Act: 人物数を取得
      const result = await PersonService.count();

      // Assert: 結果を検証
      expect(result).toBe(3);
    });

    it('人物が登録されていない場合は0を返す', async () => {
      // Arrange: データなし（beforeEachでクリア済み）

      // Act: 人物数を取得
      const result = await PersonService.count();

      // Assert: 結果を検証
      expect(result).toBe(0);
    });
  });
});