/**
 * SQLite用の型定義
 * データベースから取得されるデータの型を定義
 */

/**
 * 基本的なデータベースエンティティの共通フィールド
 */
export interface BaseEntity {
  id: string;
  created_at: string;
}

/**
 * ユーザープロフィール
 */
export interface User extends BaseEntity {
  name: string;
  handle?: string | null;
  company?: string | null;
  position?: string | null;
  description?: string | null;
  product_name?: string | null;
  memo?: string | null;
  github_id?: string | null;
  receipt?: string | null;
  updated_at: string;
}

/**
 * 人物データ
 */
export interface Person extends BaseEntity {
  name: string;
  handle?: string | null;
  company?: string | null;
  position?: string | null;
  description?: string | null;
  product_name?: string | null;
  memo?: string | null;
  github_id?: string | null;
  updated_at: string;
}

/**
 * タグデータ
 */
export interface Tag extends BaseEntity {
  name: string;
}

/**
 * イベントデータ
 */
export interface Event extends BaseEntity {
  name: string;
  date?: string | null;
  location?: string | null;
}

/**
 * 人物間の関係
 */
export interface Relation extends BaseEntity {
  source_id: string;
  target_id: string;
  relation_type: string;
}

/**
 * 人物-タグ関連
 */
export interface PersonTag {
  person_id: string;
  tag_id: string;
}

/**
 * 人物-イベント関連
 */
export interface PersonEvent {
  person_id: string;
  event_id: string;
}

/**
 * タグ情報付きの人物データ
 */
export interface PersonWithTags extends Person {
  tags: Tag[];
}