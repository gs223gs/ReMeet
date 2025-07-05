/**
 * SQLiteデータベースの型定義
 * README.mdのデータモデル仕様に基づく
 */

/**
 * ユーザープロフィールデータの型定義
 */
export interface UserProfile {
  id: string;
  name: string;
  handle?: string | null;
  company?: string | null;
  position?: string | null;
  description?: string | null;
  productName?: string | null;
  memo?: string | null;
  githubId?: string | null;
  receipt?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 人物データの型定義
 */
export interface Person {
  id: string;
  name: string;
  handle?: string | null;
  company?: string | null;
  position?: string | null;
  description?: string | null;
  productName?: string | null;
  memo?: string | null;
  githubId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * タグデータの型定義
 */
export interface Tag {
  id: string;
  name: string;
}

/**
 * イベントデータの型定義
 */
export interface Event {
  id: string;
  name: string;
  date?: Date | null;
  location?: string | null;
}

/**
 * 人物間の関係の型定義
 */
export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: string;
  createdAt: Date;
}

/**
 * 人物とタグの中間テーブル
 */
export interface PersonTag {
  personId: string;
  tagId: string;
}

/**
 * 人物とイベントの中間テーブル
 */
export interface PersonEvent {
  personId: string;
  eventId: string;
}

/**
 * タグ情報を含む人物データの型定義
 */
export interface PersonWithTags extends Person {
  tags: Tag[];
}

/**
 * イベント情報を含む人物データの型定義
 */
export interface PersonWithEvents extends Person {
  events: Event[];
}

/**
 * 完全な人物データの型定義（タグ・イベント・関係情報を含む）
 */
export interface PersonWithRelations extends Person {
  tags: Tag[];
  events: Event[];
  relations: Relation[];
}