/**
 * タグ管理サービス（モック実装）
 * 新しいDB仕様に基づいた実装
 * 実際のSQLiteデータベースの代わりにメモリ内ストレージを使用
 */
import type { Tag } from '../sqlite-types';

/**
 * タグ登録用のデータ型
 */
export interface CreateTagData {
  name: string;
}

/**
 * タグ検索用のフィルター
 */
export interface TagSearchFilter {
  name?: string;
}

// メモリ内ストレージ（実際の実装ではSQLiteを使用）
let mockTags: Tag[] = [
  { id: 'tag-1', name: 'React' },
  { id: 'tag-2', name: 'TypeScript' },
  { id: 'tag-3', name: 'UI/UX' },
  { id: 'tag-4', name: 'Figma' },
  { id: 'tag-5', name: 'AI/ML' },
  { id: 'tag-6', name: 'Python' },
  { id: 'tag-7', name: 'スタートアップ' },
  { id: 'tag-8', name: 'フロントエンド' },
  { id: 'tag-9', name: 'バックエンド' },
  { id: 'tag-10', name: 'JavaScript' },
  { id: 'tag-11', name: 'Node.js' },
  { id: 'tag-12', name: 'デザイナー' },
  { id: 'tag-13', name: 'エンジニア' },
  { id: 'tag-14', name: 'プロダクトマネージャー' },
];
let idCounter = 15;

/**
 * IDを生成する
 */
function generateId(): string {
  return `tag-${idCounter++}`;
}

/**
 * タグを登録する
 * @param data 登録するタグのデータ
 * @returns 登録されたタグデータ
 */
export async function create(data: CreateTagData): Promise<Tag> {
  if (!data.name || data.name.trim() === '') {
    throw new Error('タグ名は必須項目です');
  }

  const trimmedName = data.name.trim();

  // 既存のタグ名と重複チェック
  const existingTag = mockTags.find(tag => 
    tag.name.toLowerCase() === trimmedName.toLowerCase()
  );
  
  if (existingTag) {
    throw new Error(`タグ「${trimmedName}」は既に存在します`);
  }

  const newTag: Tag = {
    id: generateId(),
    name: trimmedName,
  };

  mockTags.push(newTag);
  return newTag;
}

/**
 * タグをIDで取得する
 * @param id タグのID
 * @returns タグデータ
 */
export async function findById(id: string): Promise<Tag | null> {
  const tag = mockTags.find(t => t.id === id);
  return tag || null;
}

/**
 * タグを名前で取得する
 * @param name タグ名
 * @returns タグデータ
 */
export async function findByName(name: string): Promise<Tag | null> {
  const tag = mockTags.find(t => 
    t.name.toLowerCase() === name.toLowerCase()
  );
  return tag || null;
}

/**
 * タグ一覧を取得する
 * @param filter 検索フィルター
 * @returns タグデータの配列
 */
export async function findMany(filter?: TagSearchFilter): Promise<Tag[]> {
  let filteredTags = [...mockTags];

  if (filter?.name) {
    filteredTags = filteredTags.filter(tag =>
      tag.name.toLowerCase().includes(filter.name!.toLowerCase())
    );
  }

  // 名前の昇順でソート
  return filteredTags.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
}

/**
 * 全てのタグを取得する
 * @returns 全てのタグデータの配列
 */
export async function findAll(): Promise<Tag[]> {
  return findMany();
}

/**
 * タグの総数を取得する
 * @returns タグの総数
 */
export async function count(): Promise<number> {
  return mockTags.length;
}

/**
 * タグを削除する
 * @param id 削除するタグのID
 */
export async function deleteById(id: string): Promise<void> {
  const index = mockTags.findIndex(t => t.id === id);
  if (index !== -1) {
    mockTags.splice(index, 1);
  }
}

/**
 * 複数のタグ名からタグIDを取得または作成する
 * 存在しないタグは新規作成する
 * @param tagNames タグ名の配列
 * @returns タグIDの配列
 */
export async function findOrCreateByNames(tagNames: string[]): Promise<string[]> {
  const tagIds: string[] = [];
  
  for (const tagName of tagNames) {
    if (!tagName || tagName.trim() === '') {
      continue;
    }
    
    const trimmedName = tagName.trim();
    
    // 既存のタグを検索
    let tag = await findByName(trimmedName);
    
    // 存在しない場合は新規作成
    if (!tag) {
      tag = await create({ name: trimmedName });
    }
    
    tagIds.push(tag.id);
  }
  
  return tagIds;
}

/**
 * モックデータをクリアする（テスト用）
 */
export function clearMockData(): void {
  mockTags = [];
  idCounter = 1;
}

/**
 * モックデータを追加する（テスト用）
 */
export function addMockData(data: Tag[]): void {
  mockTags.push(...data);
}

/**
 * モックデータをリセットする（テスト用）
 */
export function resetMockData(): void {
  mockTags = [
    { id: 'tag-1', name: 'React' },
    { id: 'tag-2', name: 'TypeScript' },
    { id: 'tag-3', name: 'UI/UX' },
    { id: 'tag-4', name: 'Figma' },
    { id: 'tag-5', name: 'AI/ML' },
    { id: 'tag-6', name: 'Python' },
    { id: 'tag-7', name: 'スタートアップ' },
    { id: 'tag-8', name: 'フロントエンド' },
    { id: 'tag-9', name: 'バックエンド' },
    { id: 'tag-10', name: 'JavaScript' },
    { id: 'tag-11', name: 'Node.js' },
    { id: 'tag-12', name: 'デザイナー' },
    { id: 'tag-13', name: 'エンジニア' },
    { id: 'tag-14', name: 'プロダクトマネージャー' },
  ];
  idCounter = 15;
}

/**
 * TagServiceのエクスポート（互換性のため）
 */
export const TagService = {
  create,
  findById,
  findByName,
  findMany,
  findAll,
  count,
  delete: deleteById,
  findOrCreateByNames,
  clearMockData,
  addMockData,
  resetMockData,
};