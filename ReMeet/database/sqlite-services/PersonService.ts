/**
 * 人物管理サービス（モック実装）
 * 新しいDB仕様に基づいた実装
 * 実際のSQLiteデータベースの代わりにメモリ内ストレージを使用
 */
import type { Person, PersonWithTags, PersonWithRelations, Tag, Event } from '../sqlite-types';
import { TagService } from './TagService';

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
  tagIds?: string[];
}

/**
 * 人物更新用のデータ型
 */
export interface UpdatePersonData {
  id: string;
  name: string;
  handle?: string | null;
  company?: string | null;
  position?: string | null;
  description?: string | null;
  productName?: string | null;
  memo?: string | null;
  githubId?: string | null;
  tagIds?: string[];
}

/**
 * 人物検索用のフィルター
 */
export interface PersonSearchFilter {
  name?: string;
  company?: string;
  tagIds?: string[];
}

// メモリ内ストレージ（実際の実装ではSQLiteを使用）
let mockPersons: PersonWithRelations[] = [
  {
    id: 'person-1',
    name: '山田太郎',
    handle: '@yamada_taro',
    company: '株式会社テック',
    position: 'フロントエンドエンジニア',
    description: 'React/TypeScriptでの開発が得意です',
    productName: 'TaskManager Pro',
    memo: '技術的な質問をよくする人。勉強熱心。',
    githubId: 'yamada-taro',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    tags: [
      { id: 'tag-1', name: 'React' },
      { id: 'tag-2', name: 'TypeScript' },
    ],
    events: [
      { id: 'event-1', name: 'React Conference 2024', date: new Date('2024-12-01'), location: '東京国際フォーラム' },
    ],
    relations: [],
  },
  {
    id: 'person-2',
    name: '佐藤花子',
    handle: '@sato_hanako',
    company: '株式会社デザイン',
    position: 'UIデザイナー',
    description: 'ユーザビリティを重視したデザインを心がけています',
    productName: 'DesignSystem Kit',
    memo: 'デザインシステムの知見が豊富。相談に乗ってくれる。',
    githubId: null,
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
    tags: [
      { id: 'tag-3', name: 'UI/UX' },
      { id: 'tag-4', name: 'Figma' },
    ],
    events: [
      { id: 'event-2', name: 'Design Thinking Workshop', date: new Date('2024-11-15'), location: 'WeWork渋谷' },
    ],
    relations: [],
  },
  {
    id: 'person-3',
    name: '田中次郎',
    handle: null,
    company: 'スタートアップABC',
    position: 'CTO',
    description: null,
    productName: 'AI Platform',
    memo: 'AI/ML分野の最新動向に詳しい。投資の話もする。',
    githubId: 'tanaka-jiro',
    createdAt: new Date('2025-01-03'),
    updatedAt: new Date('2025-01-03'),
    tags: [
      { id: 'tag-5', name: 'AI/ML' },
      { id: 'tag-6', name: 'Python' },
      { id: 'tag-7', name: 'スタートアップ' },
    ],
    events: [
      { id: 'event-3', name: 'AI/ML勉強会', date: new Date('2024-12-20'), location: 'オンライン' },
    ],
    relations: [],
  },
];
let idCounter = 4;

/**
 * IDを生成する
 */
function generateId(): string {
  return `person-${idCounter++}`;
}

/**
 * 人物を登録する
 * @param data 登録する人物のデータ
 * @returns 登録された人物データ
 */
export async function create(data: CreatePersonData): Promise<PersonWithRelations> {
    if (!data.name || data.name.trim() === '') {
      throw new Error('名前は必須項目です');
    }

    // タグIDから実際のタグ情報を取得
    let tags: Tag[] = [];
    if (data.tagIds && data.tagIds.length > 0) {
      const tagPromises = data.tagIds.map(tagId => TagService.findById(tagId));
      const tagResults = await Promise.all(tagPromises);
      tags = tagResults.filter((tag): tag is Tag => tag !== null);
    }

    const newPerson: PersonWithRelations = {
      id: generateId(),
      name: data.name.trim(),
      handle: data.handle || null,
      company: data.company || null,
      position: data.position || null,
      description: data.description || null,
      productName: data.productName || null,
      memo: data.memo || null,
      githubId: data.githubId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: tags, // 実際のタグ情報を設定
      events: [], // 今回は簡略化でイベントは空配列
      relations: [], // 今回は簡略化で関係は空配列
    };

    mockPersons.push(newPerson);
    return newPerson;
  }

/**
 * 人物をIDで取得する
 * @param id 人物のID
 * @returns 人物データ（タグ情報を含む）
 */
export async function findById(id: string): Promise<PersonWithRelations | null> {
    const person = mockPersons.find(p => p.id === id);
    return person || null;
  }

/**
 * 人物一覧を取得する
 * @param filter 検索フィルター
 * @returns 人物データの配列
 */
export async function findMany(filter?: PersonSearchFilter): Promise<PersonWithRelations[]> {
    let filteredPersons = [...mockPersons];

    if (filter?.name) {
      filteredPersons = filteredPersons.filter(person =>
        person.name.toLowerCase().includes(filter.name!.toLowerCase())
      );
    }

    if (filter?.company) {
      filteredPersons = filteredPersons.filter(person =>
        person.company?.toLowerCase().includes(filter.company!.toLowerCase())
      );
    }

    // 作成日の降順でソート
    return filteredPersons.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

/**
 * 人物の総数を取得する
 * @returns 人物の総数
 */
export async function count(): Promise<number> {
    return mockPersons.length;
  }

/**
 * 人物を更新する
 * @param data 更新する人物のデータ
 * @returns 更新された人物データ
 */
export async function update(data: UpdatePersonData): Promise<PersonWithRelations> {
  const personIndex = mockPersons.findIndex(p => p.id === data.id);
  if (personIndex === -1) {
    throw new Error('指定された人物が見つかりません');
  }

  if (!data.name || data.name.trim() === '') {
    throw new Error('名前は必須項目です');
  }

  // 現在の人物データを取得
  const currentPerson = mockPersons[personIndex];

  // タグIDから実際のタグ情報を取得
  let tags: Tag[] = [];
  if (data.tagIds && data.tagIds.length > 0) {
    const tagPromises = data.tagIds.map(tagId => TagService.findById(tagId));
    const tagResults = await Promise.all(tagPromises);
    tags = tagResults.filter((tag): tag is Tag => tag !== null);
  }

  // 更新された人物データを作成
  const updatedPerson: PersonWithRelations = {
    ...currentPerson,
    name: data.name.trim(),
    handle: data.handle,
    company: data.company,
    position: data.position,
    description: data.description,
    productName: data.productName,
    memo: data.memo,
    githubId: data.githubId,
    updatedAt: new Date(),
    tags: tags, // 実際のタグ情報を設定
    // events と relations は既存のデータを保持
  };

  // 配列内の人物データを置換
  mockPersons[personIndex] = updatedPerson;
  return updatedPerson;
}

/**
 * 人物を削除する
 * @param id 削除する人物のID
 */
export async function deleteById(id: string): Promise<void> {
    const index = mockPersons.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPersons.splice(index, 1);
    }
  }

/**
 * モックデータをクリアする（テスト用）
 */
export function clearMockData(): void {
    mockPersons = [];
    idCounter = 1;
  }

/**
 * モックデータを追加する（テスト用）
 */
export function addMockData(data: PersonWithRelations[]): void {
  mockPersons.push(...data);
}

/**
 * PersonServiceのエクスポート（互換性のため）
 */
export const PersonService = {
  create,
  findById,
  findMany,
  count,
  update,
  delete: deleteById,
  clearMockData,
  addMockData,
};