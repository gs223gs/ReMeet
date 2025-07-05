/**
 * SQLiteデータベースの型定義
 */

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
  createdAt: Date;
}

/**
 * タグ情報を含む人物データの型定義
 */
export interface PersonWithTags extends Person {
  tags: Tag[];
}