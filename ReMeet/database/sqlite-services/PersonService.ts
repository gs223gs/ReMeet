/**
 * expo-sqlite用の人物管理サービス
 * SQLiteデータベースを使用した人物のCRUD操作
 */
import { getDatabase, generateId } from '../sqlite-client';
import { Person, Tag, PersonWithTags } from '../sqlite-types';

/**
 * 人物登録用のデータ型
 */
export interface CreatePersonData {
  name: string;
  handle?: string;
  company?: string;
  position?: string;
  description?: string;
  productName?: string;
  memo?: string;
  githubId?: string;
  tagIds?: string[]; // タグIDの配列
}

/**
 * 人物更新用のデータ型
 */
export interface UpdatePersonData {
  name?: string;
  handle?: string;
  company?: string;
  position?: string;
  description?: string;
  productName?: string;
  memo?: string;
  githubId?: string;
  tagIds?: string[]; // タグIDの配列
}

/**
 * 人物検索用のフィルター
 */
export interface PersonSearchFilter {
  name?: string;
  company?: string;
  tagIds?: string[];
}

/**
 * expo-sqlite用の人物サービスクラス
 */
export class PersonService {
  /**
   * 人物を登録する
   * @param data 登録する人物のデータ
   * @returns 登録された人物データ
   */
  static async create(data: CreatePersonData): Promise<Person> {
    try {
      // 入力値のバリデーション
      if (!data.name || data.name.trim() === '') {
        throw new Error('名前は必須項目です');
      }

      const db = await getDatabase();
      const personId = generateId();

      // トランザクション内で人物とタグの関連を同時に登録
      await db.withTransactionAsync(async () => {
        // 人物を作成
        await db.runAsync(`
          INSERT INTO persons (
            id, name, handle, company, position, description, 
            product_name, memo, github_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          personId,
          data.name.trim(),
          data.handle || null,
          data.company || null,
          data.position || null,
          data.description || null,
          data.productName || null,
          data.memo || null,
          data.githubId || null,
        ]);

        // タグとの関連を作成
        if (data.tagIds && data.tagIds.length > 0) {
          for (const tagId of data.tagIds) {
            await db.runAsync(
              'INSERT INTO persons_tags (person_id, tag_id) VALUES (?, ?)',
              [personId, tagId]
            );
          }
        }
      });

      // 作成した人物を取得して返す
      const person = await db.getFirstAsync<Person>(
        'SELECT * FROM persons WHERE id = ?',
        [personId]
      );

      if (!person) {
        throw new Error('人物の作成に失敗しました');
      }

      return person;
    } catch (error) {
      throw new Error(`人物の登録に失敗しました: ${error}`);
    }
  }

  /**
   * 人物を更新する
   * @param id 更新する人物のID
   * @param data 更新データ
   * @returns 更新された人物データ
   */
  static async update(id: string, data: UpdatePersonData): Promise<Person> {
    try {
      const db = await getDatabase();

      await db.withTransactionAsync(async () => {
        // 人物データを更新
        await db.runAsync(`
          UPDATE persons SET
            name = COALESCE(?, name),
            handle = COALESCE(?, handle),
            company = COALESCE(?, company),
            position = COALESCE(?, position),
            description = COALESCE(?, description),
            product_name = COALESCE(?, product_name),
            memo = COALESCE(?, memo),
            github_id = COALESCE(?, github_id),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [
          data.name || null,
          data.handle || null,
          data.company || null,
          data.position || null,
          data.description || null,
          data.productName || null,
          data.memo || null,
          data.githubId || null,
          id
        ]);

        // タグの関連を更新（既存の関連をすべて削除して新しく作成）
        if (data.tagIds !== undefined) {
          await db.runAsync('DELETE FROM persons_tags WHERE person_id = ?', [id]);

          if (data.tagIds.length > 0) {
            for (const tagId of data.tagIds) {
              await db.runAsync(
                'INSERT INTO persons_tags (person_id, tag_id) VALUES (?, ?)',
                [id, tagId]
              );
            }
          }
        }
      });

      // 更新された人物を取得して返す
      const person = await db.getFirstAsync<Person>(
        'SELECT * FROM persons WHERE id = ?',
        [id]
      );

      if (!person) {
        throw new Error('更新対象の人物が見つかりません');
      }

      return person;
    } catch (error) {
      throw new Error(`人物の更新に失敗しました: ${error}`);
    }
  }

  /**
   * 人物を削除する
   * @param id 削除する人物のID
   */
  static async delete(id: string): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM persons WHERE id = ?', [id]);
    } catch (error) {
      throw new Error(`人物の削除に失敗しました: ${error}`);
    }
  }

  /**
   * 人物をIDで取得する
   * @param id 人物のID
   * @returns 人物データ（タグ情報を含む）
   */
  static async findById(id: string): Promise<PersonWithTags | null> {
    try {
      const db = await getDatabase();
      
      // 人物情報を取得
      const person = await db.getFirstAsync<Person>(
        'SELECT * FROM persons WHERE id = ?',
        [id]
      );

      if (!person) {
        return null;
      }

      // 関連するタグを取得
      const tags = await db.getAllAsync<Tag>(`
        SELECT t.* FROM tags t
        INNER JOIN persons_tags pt ON t.id = pt.tag_id
        WHERE pt.person_id = ?
        ORDER BY t.name ASC
      `, [id]);

      return {
        ...person,
        tags,
      };
    } catch (error) {
      throw new Error(`人物の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 人物一覧を取得する
   * @param filter 検索フィルター
   * @returns 人物データの配列
   */
  static async findMany(filter?: PersonSearchFilter): Promise<PersonWithTags[]> {
    try {
      const db = await getDatabase();
      
      let query = 'SELECT * FROM persons';
      const params: any[] = [];
      const conditions: string[] = [];

      // フィルター条件を追加
      if (filter?.name) {
        conditions.push('name LIKE ?');
        params.push(`%${filter.name}%`);
      }

      if (filter?.company) {
        conditions.push('company LIKE ?');
        params.push(`%${filter.company}%`);
      }

      if (filter?.tagIds && filter.tagIds.length > 0) {
        const placeholders = filter.tagIds.map(() => '?').join(',');
        conditions.push(`id IN (
          SELECT DISTINCT person_id FROM persons_tags 
          WHERE tag_id IN (${placeholders})
        )`);
        params.push(...filter.tagIds);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';

      const persons = await db.getAllAsync<Person>(query, params);

      // 各人物のタグ情報を取得
      const personsWithTags: PersonWithTags[] = [];
      for (const person of persons) {
        const tags = await db.getAllAsync<Tag>(`
          SELECT t.* FROM tags t
          INNER JOIN persons_tags pt ON t.id = pt.tag_id
          WHERE pt.person_id = ?
          ORDER BY t.name ASC
        `, [person.id]);

        personsWithTags.push({
          ...person,
          tags,
        });
      }

      return personsWithTags;
    } catch (error) {
      throw new Error(`人物一覧の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 人物の総数を取得する
   * @returns 人物の総数
   */
  static async count(): Promise<number> {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM persons'
      );

      return result?.count || 0;
    } catch (error) {
      throw new Error(`人物数の取得に失敗しました: ${error}`);
    }
  }
}