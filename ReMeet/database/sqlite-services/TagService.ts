/**
 * expo-sqlite用のタグ管理サービス
 * SQLiteデータベースを使用したタグのCRUD操作
 */
import { getDatabase, generateId } from '../sqlite-client';
import { Tag } from '../sqlite-types';

/**
 * タグ作成用のデータ型
 */
export interface CreateTagData {
  name: string;
}

/**
 * expo-sqlite用のタグサービスクラス
 */
export class TagService {
  /**
   * タグを作成する
   * 既存のタグ名の場合は既存のタグを返す（重複を防ぐ）
   * @param data タグ作成データ
   * @returns 作成されたタグデータ
   */
  static async create(data: CreateTagData): Promise<Tag> {
    try {
      const db = await getDatabase();
      
      // タグ名の正規化（前後の空白を除去）
      const normalizedName = data.name.trim();
      
      if (!normalizedName) {
        throw new Error('タグ名を入力してください');
      }

      // 既存のタグをチェック
      const existingTag = await db.getFirstAsync<Tag>(
        'SELECT * FROM tags WHERE name = ?',
        [normalizedName]
      );

      if (existingTag) {
        return existingTag;
      }

      // 新しいタグを作成
      const tagId = generateId();
      
      try {
        await db.runAsync(
          'INSERT INTO tags (id, name) VALUES (?, ?)',
          [tagId, normalizedName]
        );
      } catch (insertError: any) {
        // UNIQUE制約エラーの場合は既存のタグを返す（競合状態対策）
        if (insertError.message && insertError.message.includes('UNIQUE constraint failed')) {
          const existingTagAfterError = await db.getFirstAsync<Tag>(
            'SELECT * FROM tags WHERE name = ?',
            [normalizedName]
          );
          if (existingTagAfterError) {
            return existingTagAfterError;
          }
        }
        throw insertError;
      }

      // 作成したタグを取得して返す
      const newTag = await db.getFirstAsync<Tag>(
        'SELECT * FROM tags WHERE id = ?',
        [tagId]
      );

      if (!newTag) {
        throw new Error('タグの作成に失敗しました');
      }

      return newTag;
    } catch (error) {
      throw new Error(`タグの作成に失敗しました: ${error}`);
    }
  }

  /**
   * 複数のタグを一括作成する
   * @param tagNames タグ名の配列
   * @returns 作成されたタグのデータ配列
   */
  static async createMany(tagNames: string[]): Promise<Tag[]> {
    try {
      const tags: Tag[] = [];
      
      for (const tagName of tagNames) {
        const tag = await this.create({ name: tagName });
        tags.push(tag);
      }

      return tags;
    } catch (error) {
      throw new Error(`タグの一括作成に失敗しました: ${error}`);
    }
  }

  /**
   * タグをIDで取得する
   * @param id タグのID
   * @returns タグデータ
   */
  static async findById(id: string): Promise<Tag | null> {
    try {
      const db = await getDatabase();
      const tag = await db.getFirstAsync<Tag>(
        'SELECT * FROM tags WHERE id = ?',
        [id]
      );

      return tag || null;
    } catch (error) {
      throw new Error(`タグの取得に失敗しました: ${error}`);
    }
  }

  /**
   * タグ名で検索する
   * @param name タグ名
   * @returns タグデータ
   */
  static async findByName(name: string): Promise<Tag | null> {
    try {
      const db = await getDatabase();
      const tag = await db.getFirstAsync<Tag>(
        'SELECT * FROM tags WHERE name = ?',
        [name]
      );

      return tag || null;
    } catch (error) {
      throw new Error(`タグの検索に失敗しました: ${error}`);
    }
  }

  /**
   * すべてのタグを取得する
   * @returns タグデータの配列
   */
  static async findAll(): Promise<Tag[]> {
    try {
      const db = await getDatabase();
      const tags = await db.getAllAsync<Tag>(
        'SELECT * FROM tags ORDER BY name ASC'
      );

      return tags;
    } catch (error) {
      throw new Error(`タグ一覧の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 検索キーワードに基づいてタグを取得する
   * @param searchTerm 検索キーワード
   * @returns マッチするタグデータの配列
   */
  static async search(searchTerm: string): Promise<Tag[]> {
    try {
      const db = await getDatabase();
      const tags = await db.getAllAsync<Tag>(
        'SELECT * FROM tags WHERE name LIKE ? ORDER BY name ASC',
        [`%${searchTerm}%`]
      );

      return tags;
    } catch (error) {
      throw new Error(`タグの検索に失敗しました: ${error}`);
    }
  }

  /**
   * 使用されているタグのみを取得する
   * @returns 使用されているタグデータの配列
   */
  static async findUsedTags(): Promise<Tag[]> {
    try {
      const db = await getDatabase();
      const tags = await db.getAllAsync<Tag>(`
        SELECT DISTINCT t.* FROM tags t
        INNER JOIN persons_tags pt ON t.id = pt.tag_id
        ORDER BY t.name ASC
      `);

      return tags;
    } catch (error) {
      throw new Error(`使用済みタグの取得に失敗しました: ${error}`);
    }
  }

  /**
   * 使用されていないタグを取得する
   * @returns 使用されていないタグデータの配列
   */
  static async findUnusedTags(): Promise<Tag[]> {
    try {
      const db = await getDatabase();
      const tags = await db.getAllAsync<Tag>(`
        SELECT t.* FROM tags t
        LEFT JOIN persons_tags pt ON t.id = pt.tag_id
        WHERE pt.tag_id IS NULL
        ORDER BY t.name ASC
      `);

      return tags;
    } catch (error) {
      throw new Error(`未使用タグの取得に失敗しました: ${error}`);
    }
  }

  /**
   * タグを削除する
   * @param id 削除するタグのID
   */
  static async delete(id: string): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM tags WHERE id = ?', [id]);
    } catch (error) {
      throw new Error(`タグの削除に失敗しました: ${error}`);
    }
  }

  /**
   * 使用されていないタグを一括削除する
   * @returns 削除されたタグの数
   */
  static async deleteUnusedTags(): Promise<number> {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(`
        DELETE FROM tags
        WHERE id NOT IN (
          SELECT DISTINCT tag_id FROM persons_tags
        )
      `);

      return result.changes;
    } catch (error) {
      throw new Error(`未使用タグの削除に失敗しました: ${error}`);
    }
  }

  /**
   * タグの総数を取得する
   * @returns タグの総数
   */
  static async count(): Promise<number> {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM tags'
      );

      return result?.count || 0;
    } catch (error) {
      throw new Error(`タグ数の取得に失敗しました: ${error}`);
    }
  }
}