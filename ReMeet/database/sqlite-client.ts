/**
 * expo-sqliteを使用したSQLiteデータベースクライアント
 * React Native環境で動作するデータベース接続とスキーマ管理
 */
import * as SQLite from 'expo-sqlite';

/**
 * データベース名
 */
const DATABASE_NAME = 'remeet.db';

/**
 * SQLiteデータベースインスタンス
 */
let database: SQLite.SQLiteDatabase | null = null;

/**
 * データベース接続を取得する
 * シングルトンパターンでデータベースインスタンスを管理
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!database) {
    database = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await initializeDatabase(database);
  }
  return database;
};

/**
 * データベースのスキーマを初期化する
 * アプリ起動時にテーブルが存在しない場合は作成
 */
const initializeDatabase = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    // 外部キー制約を有効化
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // usersテーブルの作成
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        handle TEXT,
        company TEXT,
        position TEXT,
        description TEXT,
        product_name TEXT,
        memo TEXT,
        github_id TEXT,
        receipt TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // personsテーブルの作成
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS persons (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        handle TEXT,
        company TEXT,
        position TEXT,
        description TEXT,
        product_name TEXT,
        memo TEXT,
        github_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // tagsテーブルの作成
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // eventsテーブルの作成
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        date DATETIME,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // relationsテーブルの作成
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS relations (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        relation_type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_id) REFERENCES persons (id) ON DELETE CASCADE,
        FOREIGN KEY (target_id) REFERENCES persons (id) ON DELETE CASCADE
      );
    `);

    // persons_tagsテーブルの作成（中間テーブル）
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS persons_tags (
        person_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (person_id, tag_id),
        FOREIGN KEY (person_id) REFERENCES persons (id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
      );
    `);

    // persons_eventsテーブルの作成（中間テーブル）
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS persons_events (
        person_id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        PRIMARY KEY (person_id, event_id),
        FOREIGN KEY (person_id) REFERENCES persons (id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );
    `);

    console.log('データベースの初期化が完了しました');
  } catch (error) {
    console.error('データベースの初期化に失敗しました:', error);
    throw error;
  }
};

/**
 * 一意のIDを生成する
 * cuidのシンプルな代替実装
 */
export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`;
};

/**
 * データベース接続を閉じる
 * 通常はアプリ終了時に呼び出す
 */
export const closeDatabase = async (): Promise<void> => {
  if (database) {
    await database.closeAsync();
    database = null;
  }
};