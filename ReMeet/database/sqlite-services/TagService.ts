/**
 * タグ管理サービス（モック実装）
 * 実際のSQLiteデータベースの代わりにメモリ内ストレージを使用
 */
import type { Tag } from '../sqlite-types';

/**
 * タグ作成用のデータ型
 */
export interface CreateTagData {
  name: string;
}

// メモリ内ストレージ（実際の実装ではSQLiteを使用）
let mockTags: Tag[] = [];
let idCounter = 1;

/**
 * タグサービスクラス
 */
export class TagService {
  /**
   * IDを生成する
   */
  private static generateId(): string {
    return `tag-${idCounter++}`;
  }

  /**
   * タグを作成する
   * 既存のタグ名の場合は既存のタグを返す（重複を防ぐ）
   * @param data タグ作成データ
   * @returns 作成されたタグデータ
   */
  static async create(data: CreateTagData): Promise<Tag> {
    const normalizedName = data.name.trim();
    
    if (!normalizedName) {
      throw new Error('タグ名を入力してください');
    }

    // 既存のタグをチェック
    const existingTag = mockTags.find(tag => tag.name === normalizedName);
    if (existingTag) {
      return existingTag;
    }

    // 新しいタグを作成
    const newTag: Tag = {
      id: this.generateId(),
      name: normalizedName,
      createdAt: new Date(),
    };

    mockTags.push(newTag);
    return newTag;
  }

  /**
   * 複数のタグを一括作成する
   * @param tagNames タグ名の配列
   * @returns 作成されたタグのデータ配列
   */
  static async createMany(tagNames: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];
    
    for (const tagName of tagNames) {
      const tag = await this.create({ name: tagName });
      tags.push(tag);
    }

    return tags;
  }

  /**
   * すべてのタグを取得する
   * @returns タグデータの配列
   */
  static async findAll(): Promise<Tag[]> {
    return [...mockTags].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * タグをIDで取得する
   * @param id タグのID
   * @returns タグデータ
   */
  static async findById(id: string): Promise<Tag | null> {
    const tag = mockTags.find(t => t.id === id);
    return tag || null;
  }

  /**
   * タグ名で検索する
   * @param name タグ名
   * @returns タグデータ
   */
  static async findByName(name: string): Promise<Tag | null> {
    const tag = mockTags.find(t => t.name === name);
    return tag || null;
  }

  /**
   * 検索キーワードに基づいてタグを取得する
   * @param searchTerm 検索キーワード
   * @returns マッチするタグデータの配列
   */
  static async search(searchTerm: string): Promise<Tag[]> {
    const filtered = mockTags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * タグの総数を取得する
   * @returns タグの総数
   */
  static async count(): Promise<number> {
    return mockTags.length;
  }

  /**
   * タグを削除する
   * @param id 削除するタグのID
   */
  static async delete(id: string): Promise<void> {
    const index = mockTags.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTags.splice(index, 1);
    }
  }

  /**
   * モックデータをクリアする（テスト用）
   */
  static clearMockData(): void {
    mockTags = [];
    idCounter = 1;
  }

  /**
   * モックデータを追加する（テスト用）
   */
  static addMockData(data: Tag[]): void {
    mockTags.push(...data);
  }
}