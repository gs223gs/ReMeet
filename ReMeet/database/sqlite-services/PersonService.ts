/**
 * 人物管理サービス（モック実装）
 * 実際のSQLiteデータベースの代わりにメモリ内ストレージを使用
 */
import type { Person, PersonWithTags } from '../sqlite-types';

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
 * 人物検索用のフィルター
 */
export interface PersonSearchFilter {
  name?: string;
  company?: string;
  tagIds?: string[];
}

// メモリ内ストレージ（実際の実装ではSQLiteを使用）
let mockPersons: PersonWithTags[] = [
  {
    id: 'person-1',
    name: '山田太郎',
    handle: '@yamada_taro',
    company: '株式会社テック',
    position: 'フロントエンドエンジニア',
    description: 'React/TypeScriptでの開発が得意です',
    productName: 'TaskManager Pro',
    memo: 'React Conference 2024で出会いました',
    githubId: 'yamada-taro',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    tags: [
      { id: 'tag-1', name: 'React', createdAt: new Date('2025-01-01') },
      { id: 'tag-2', name: 'TypeScript', createdAt: new Date('2025-01-01') },
    ],
  },
  {
    id: 'person-2',
    name: '佐藤花子',
    handle: '@sato_hanako',
    company: '株式会社デザイン',
    position: 'UIデザイナー',
    description: 'ユーザビリティを重視したデザインを心がけています',
    productName: 'DesignSystem Kit',
    memo: 'Design Thinking Workshop参加者',
    githubId: null,
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
    tags: [
      { id: 'tag-3', name: 'UI/UX', createdAt: new Date('2025-01-01') },
      { id: 'tag-4', name: 'Figma', createdAt: new Date('2025-01-01') },
    ],
  },
  {
    id: 'person-3',
    name: '田中次郎',
    handle: null,
    company: 'スタートアップABC',
    position: 'CTO',
    description: null,
    productName: 'AI Platform',
    memo: 'AI/ML勉強会で知り合い',
    githubId: 'tanaka-jiro',
    createdAt: new Date('2025-01-03'),
    updatedAt: new Date('2025-01-03'),
    tags: [
      { id: 'tag-5', name: 'AI/ML', createdAt: new Date('2025-01-01') },
      { id: 'tag-6', name: 'Python', createdAt: new Date('2025-01-01') },
      { id: 'tag-7', name: 'スタートアップ', createdAt: new Date('2025-01-01') },
    ],
  },
];
let idCounter = 4;

/**
 * 人物サービスクラス
 */
export class PersonService {
  /**
   * IDを生成する
   */
  private static generateId(): string {
    return `person-${idCounter++}`;
  }

  /**
   * 人物を登録する
   * @param data 登録する人物のデータ
   * @returns 登録された人物データ
   */
  static async create(data: CreatePersonData): Promise<Person> {
    if (!data.name || data.name.trim() === '') {
      throw new Error('名前は必須項目です');
    }

    const newPerson: PersonWithTags = {
      id: this.generateId(),
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
      tags: [], // 今回は簡略化でタグは空配列
    };

    mockPersons.push(newPerson);
    return newPerson;
  }

  /**
   * 人物をIDで取得する
   * @param id 人物のID
   * @returns 人物データ（タグ情報を含む）
   */
  static async findById(id: string): Promise<PersonWithTags | null> {
    const person = mockPersons.find(p => p.id === id);
    return person || null;
  }

  /**
   * 人物一覧を取得する
   * @param filter 検索フィルター
   * @returns 人物データの配列
   */
  static async findMany(filter?: PersonSearchFilter): Promise<PersonWithTags[]> {
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
  static async count(): Promise<number> {
    return mockPersons.length;
  }

  /**
   * 人物を削除する
   * @param id 削除する人物のID
   */
  static async delete(id: string): Promise<void> {
    const index = mockPersons.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPersons.splice(index, 1);
    }
  }

  /**
   * モックデータをクリアする（テスト用）
   */
  static clearMockData(): void {
    mockPersons = [];
    idCounter = 1;
  }

  /**
   * モックデータを追加する（テスト用）
   */
  static addMockData(data: PersonWithTags[]): void {
    mockPersons.push(...data);
  }
}