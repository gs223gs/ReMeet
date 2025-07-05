/**
 * react-native-sqlite-storage用の人物管理サービス
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
 * react-native-sqlite-storage用の人物サービスクラス
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
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          // 人物を作成
          tx.executeSql(
            `INSERT INTO persons (
              id, name, handle, company, position, description, 
              product_name, memo, github_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              personId,
              data.name.trim(),
              data.handle || null,
              data.company || null,
              data.position || null,
              data.description || null,
              data.productName || null,
              data.memo || null,
              data.githubId || null,
            ],
            (_, result) => {
              // タグとの関連を作成
              if (data.tagIds && data.tagIds.length > 0) {
                data.tagIds.forEach((tagId) => {
                  tx.executeSql(
                    'INSERT INTO persons_tags (person_id, tag_id) VALUES (?, ?)',
                    [personId, tagId]
                  );
                });
              }
            },
            (_, error) => {
              reject(new Error(`人物の作成に失敗しました: ${error.message}`));
              return false;
            }
          );
        }, 
        (error) => {
          reject(new Error(`人物の登録に失敗しました: ${error.message}`));
        },
        async () => {
          // トランザクション成功後、作成した人物を取得
          try {
            const [results] = await db.executeSql(
              'SELECT * FROM persons WHERE id = ?',
              [personId]
            );
            if (results.rows.length > 0) {
              resolve(results.rows.item(0) as Person);
            } else {
              reject(new Error('人物の作成に失敗しました'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      throw new Error(`人物の登録に失敗しました: ${error}`);
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
      const [personResults] = await db.executeSql(
        'SELECT * FROM persons WHERE id = ?',
        [id]
      );

      if (personResults.rows.length === 0) {
        return null;
      }

      const person = personResults.rows.item(0) as Person;

      // 関連するタグを取得
      const [tagResults] = await db.executeSql(`
        SELECT t.* FROM tags t
        INNER JOIN persons_tags pt ON t.id = pt.tag_id
        WHERE pt.person_id = ?
        ORDER BY t.name ASC
      `, [id]);

      const tags: Tag[] = [];
      for (let i = 0; i < tagResults.rows.length; i++) {
        tags.push(tagResults.rows.item(i) as Tag);
      }

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

      const [results] = await db.executeSql(query, params);
      const persons: Person[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        persons.push(results.rows.item(i) as Person);
      }

      // 各人物のタグ情報を取得
      const personsWithTags: PersonWithTags[] = [];
      for (const person of persons) {
        const [tagResults] = await db.executeSql(`
          SELECT t.* FROM tags t
          INNER JOIN persons_tags pt ON t.id = pt.tag_id
          WHERE pt.person_id = ?
          ORDER BY t.name ASC
        `, [person.id]);

        const tags: Tag[] = [];
        for (let i = 0; i < tagResults.rows.length; i++) {
          tags.push(tagResults.rows.item(i) as Tag);
        }

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
      const [results] = await db.executeSql(
        'SELECT COUNT(*) as count FROM persons'
      );

      if (results.rows.length > 0) {
        return results.rows.item(0).count || 0;
      }
      return 0;
    } catch (error) {
      throw new Error(`人物数の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 人物を削除する
   * @param id 削除する人物のID
   */
  static async delete(id: string): Promise<void> {
    try {
      const db = await getDatabase();
      await db.executeSql('DELETE FROM persons WHERE id = ?', [id]);
    } catch (error) {
      throw new Error(`人物の削除に失敗しました: ${error}`);
    }
  }
}