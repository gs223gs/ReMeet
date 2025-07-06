import { TagService } from '../../../database/sqlite-services/TagService';
import type { CreateTagData } from '../../../database/sqlite-services/TagService';

describe('TagService', () => {
  // 各テストの前にモックデータをリセット
  beforeEach(() => {
    TagService.resetMockData();
  });

  // 各テストの後にモックデータをクリア
  afterEach(() => {
    TagService.clearMockData();
  });

  describe('create', () => {
    it('有効なタグ名で新規タグを作成できる', async () => {
      // Arrange（準備）
      const tagData: CreateTagData = {
        name: 'Flutter',
      };

      // Act（実行）
      const createdTag = await TagService.create(tagData);

      // Assert（検証）
      expect(createdTag).toBeDefined();
      expect(createdTag.id).toMatch(/^tag-\d+$/);
      expect(createdTag.name).toBe('Flutter');
    });

    it('タグ名の前後の空白が自動的にトリムされる', async () => {
      // Arrange（準備）
      const tagData: CreateTagData = {
        name: '  Vue.js  ',
      };

      // Act（実行）
      const createdTag = await TagService.create(tagData);

      // Assert（検証）
      expect(createdTag.name).toBe('Vue.js');
    });

    it('空のタグ名の場合、エラーが発生する', async () => {
      // Arrange（準備）
      const tagData: CreateTagData = {
        name: '',
      };

      // Act & Assert（実行と検証）
      await expect(TagService.create(tagData)).rejects.toThrow('タグ名は必須項目です');
    });

    it('空白のみのタグ名の場合、エラーが発生する', async () => {
      // Arrange（準備）
      const tagData: CreateTagData = {
        name: '   ',
      };

      // Act & Assert（実行と検証）
      await expect(TagService.create(tagData)).rejects.toThrow('タグ名は必須項目です');
    });

    it('重複するタグ名の場合、エラーが発生する', async () => {
      // Arrange（準備）
      const tagData: CreateTagData = {
        name: 'React', // 既存のタグ名
      };

      // Act & Assert（実行と検証）
      await expect(TagService.create(tagData)).rejects.toThrow('タグ「React」は既に存在します');
    });

    it('大文字小文字を区別せずに重複チェックされる', async () => {
      // Arrange（準備）
      const tagData: CreateTagData = {
        name: 'react', // 小文字でReactと重複
      };

      // Act & Assert（実行と検証）
      await expect(TagService.create(tagData)).rejects.toThrow('タグ「react」は既に存在します');
    });
  });

  describe('findById', () => {
    it('存在するタグIDで検索できる', async () => {
      // Arrange（準備）
      // Act（実行）
      const tag = await TagService.findById('tag-1');

      // Assert（検証）
      expect(tag).toBeDefined();
      expect(tag?.id).toBe('tag-1');
      expect(tag?.name).toBe('React');
    });

    it('存在しないタグIDで検索した場合、nullが返される', async () => {
      // Arrange（準備）
      // Act（実行）
      const tag = await TagService.findById('tag-999');

      // Assert（検証）
      expect(tag).toBeNull();
    });
  });

  describe('findByName', () => {
    it('存在するタグ名で検索できる', async () => {
      // Arrange（準備）
      // Act（実行）
      const tag = await TagService.findByName('React');

      // Assert（検証）
      expect(tag).toBeDefined();
      expect(tag?.id).toBe('tag-1');
      expect(tag?.name).toBe('React');
    });

    it('大文字小文字を区別せずに検索される', async () => {
      // Arrange（準備）
      // Act（実行）
      const tag = await TagService.findByName('react');

      // Assert（検証）
      expect(tag).toBeDefined();
      expect(tag?.name).toBe('React');
    });

    it('存在しないタグ名で検索した場合、nullが返される', async () => {
      // Arrange（準備）
      // Act（実行）
      const tag = await TagService.findByName('存在しないタグ');

      // Assert（検証）
      expect(tag).toBeNull();
    });
  });

  describe('findAll', () => {
    it('全てのタグを取得できる', async () => {
      // Arrange（準備）
      // Act（実行）
      const tags = await TagService.findAll();

      // Assert（検証）
      expect(tags).toBeDefined();
      expect(tags.length).toBeGreaterThan(0);
      expect(tags[0]).toHaveProperty('id');
      expect(tags[0]).toHaveProperty('name');
    });

    it('タグが名前の昇順でソートされている', async () => {
      // Arrange（準備）
      // Act（実行）
      const tags = await TagService.findAll();

      // Assert（検証）
      const sortedNames = tags.map(tag => tag.name).sort((a, b) => a.localeCompare(b, 'ja'));
      const actualNames = tags.map(tag => tag.name);
      expect(actualNames).toEqual(sortedNames);
    });
  });

  describe('findMany', () => {
    it('フィルターなしで全てのタグを取得できる', async () => {
      // Arrange（準備）
      // Act（実行）
      const tags = await TagService.findMany();

      // Assert（検証）
      expect(tags.length).toBeGreaterThan(0);
    });

    it('名前フィルターで部分一致検索ができる', async () => {
      // Arrange（準備）
      const filter = { name: 'Script' }; // TypeScript, JavaScriptにマッチ

      // Act（実行）
      const tags = await TagService.findMany(filter);

      // Assert（検証）
      expect(tags.length).toBeGreaterThan(0);
      tags.forEach(tag => {
        expect(tag.name.toLowerCase()).toContain('script');
      });
    });

    it('該当しないフィルターの場合、空配列が返される', async () => {
      // Arrange（準備）
      const filter = { name: '存在しない検索語' };

      // Act（実行）
      const tags = await TagService.findMany(filter);

      // Assert（検証）
      expect(tags).toEqual([]);
    });
  });

  describe('count', () => {
    it('タグの総数を取得できる', async () => {
      // Arrange（準備）
      // Act（実行）
      const totalCount = await TagService.count();

      // Assert（検証）
      expect(totalCount).toBeGreaterThan(0);
      expect(typeof totalCount).toBe('number');
    });
  });

  describe('deleteById', () => {
    it('存在するタグを削除できる', async () => {
      // Arrange（準備）
      const initialCount = await TagService.count();

      // Act（実行）
      await TagService.delete('tag-1');

      // Assert（検証）
      const afterCount = await TagService.count();
      expect(afterCount).toBe(initialCount - 1);

      const deletedTag = await TagService.findById('tag-1');
      expect(deletedTag).toBeNull();
    });

    it('存在しないタグIDで削除しても何も起こらない', async () => {
      // Arrange（準備）
      const initialCount = await TagService.count();

      // Act（実行）
      await TagService.delete('tag-999');

      // Assert（検証）
      const afterCount = await TagService.count();
      expect(afterCount).toBe(initialCount);
    });
  });

  describe('findOrCreateByNames', () => {
    it('存在するタグ名の場合、既存のタグIDを返す', async () => {
      // Arrange（準備）
      const tagNames = ['React', 'TypeScript'];

      // Act（実行）
      const tagIds = await TagService.findOrCreateByNames(tagNames);

      // Assert（検証）
      expect(tagIds).toHaveLength(2);
      expect(tagIds).toContain('tag-1'); // React
      expect(tagIds).toContain('tag-2'); // TypeScript
    });

    it('存在しないタグ名の場合、新規作成してIDを返す', async () => {
      // Arrange（準備）
      const tagNames = ['Flutter', 'Dart'];
      const initialCount = await TagService.count();

      // Act（実行）
      const tagIds = await TagService.findOrCreateByNames(tagNames);

      // Assert（検証）
      expect(tagIds).toHaveLength(2);
      
      const afterCount = await TagService.count();
      expect(afterCount).toBe(initialCount + 2);

      // 作成されたタグが実際に存在することを確認
      const flutterTag = await TagService.findByName('Flutter');
      const dartTag = await TagService.findByName('Dart');
      expect(flutterTag).toBeDefined();
      expect(dartTag).toBeDefined();
      expect(tagIds).toContain(flutterTag?.id);
      expect(tagIds).toContain(dartTag?.id);
    });

    it('既存と新規が混在する場合、適切に処理される', async () => {
      // Arrange（準備）
      const tagNames = ['React', 'Flutter']; // Reactは既存、Flutterは新規
      const initialCount = await TagService.count();

      // Act（実行）
      const tagIds = await TagService.findOrCreateByNames(tagNames);

      // Assert（検証）
      expect(tagIds).toHaveLength(2);
      expect(tagIds).toContain('tag-1'); // 既存のReact

      const afterCount = await TagService.count();
      expect(afterCount).toBe(initialCount + 1); // 新規タグが1つ追加
    });

    it('空の配列の場合、空の配列を返す', async () => {
      // Arrange（準備）
      const tagNames: string[] = [];

      // Act（実行）
      const tagIds = await TagService.findOrCreateByNames(tagNames);

      // Assert（検証）
      expect(tagIds).toEqual([]);
    });

    it('空文字列やスペースのみの要素は無視される', async () => {
      // Arrange（準備）
      const tagNames = ['React', '', '  ', 'Flutter'];

      // Act（実行）
      const tagIds = await TagService.findOrCreateByNames(tagNames);

      // Assert（検証）
      expect(tagIds).toHaveLength(2); // 空文字とスペースは無視される
    });
  });

  describe('clearMockData', () => {
    it('モックデータをクリアできる', () => {
      // Arrange（準備）
      // Act（実行）
      TagService.clearMockData();

      // Assert（検証）
      TagService.count().then(count => {
        expect(count).toBe(0);
      });
    });
  });

  describe('resetMockData', () => {
    it('モックデータを初期状態にリセットできる', () => {
      // Arrange（準備）
      TagService.clearMockData();

      // Act（実行）
      TagService.resetMockData();

      // Assert（検証）
      TagService.count().then(count => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });
});