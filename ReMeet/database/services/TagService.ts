/**
 * タグ管理サービス
 * タグの登録、取得、管理を行うサービスクラス
 */
import prisma from '../client';
import { Tag } from '../types';

/**
 * タグ作成用のデータ型
 */
export interface CreateTagData {
  name: string;
}

/**
 * タグサービスクラス
 */
export class TagService {
  /**
   * タグを作成する
   * 既存のタグ名の場合は既存のタグを返す（重複を防ぐ）
   * @param data タグ作成データ
   * @returns 作成されたタグデータ
   */
  static async create(data: CreateTagData): Promise<Tag> {
    try {
      // タグ名の正規化（前後の空白を除去）
      const normalizedName = data.name.trim();
      
      if (!normalizedName) {
        throw new Error('タグ名を入力してください');
      }

      // 既存のタグをチェック
      const existingTag = await prisma.tag.findUnique({
        where: { name: normalizedName },
      });

      if (existingTag) {
        return existingTag;
      }

      // 新しいタグを作成
      const newTag = await prisma.tag.create({
        data: {
          name: normalizedName,
        },
      });

      return newTag;
    } catch (error) {
      throw new Error(`タグの作成に失敗しました: ${error}`);
    }
  }

  /**
   * 複数のタグを一括作成する
   * @param tagNames タグ名の配列
   * @returns 作成されたタグのデータ配列
   */
  static async createMany(tagNames: string[]): Promise<Tag[]> {
    try {
      const tags: Tag[] = [];
      
      for (const tagName of tagNames) {
        const tag = await this.create({ name: tagName });
        tags.push(tag);
      }

      return tags;
    } catch (error) {
      throw new Error(`タグの一括作成に失敗しました: ${error}`);
    }
  }

  /**
   * タグをIDで取得する
   * @param id タグのID
   * @returns タグデータ
   */
  static async findById(id: string): Promise<Tag | null> {
    try {
      const tag = await prisma.tag.findUnique({
        where: { id },
      });

      return tag;
    } catch (error) {
      throw new Error(`タグの取得に失敗しました: ${error}`);
    }
  }

  /**
   * タグ名で検索する
   * @param name タグ名
   * @returns タグデータ
   */
  static async findByName(name: string): Promise<Tag | null> {
    try {
      const tag = await prisma.tag.findUnique({
        where: { name },
      });

      return tag;
    } catch (error) {
      throw new Error(`タグの検索に失敗しました: ${error}`);
    }
  }

  /**
   * すべてのタグを取得する
   * @returns タグデータの配列
   */
  static async findAll(): Promise<Tag[]> {
    try {
      const tags = await prisma.tag.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      return tags;
    } catch (error) {
      throw new Error(`タグ一覧の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 検索キーワードに基づいてタグを取得する
   * @param searchTerm 検索キーワード
   * @returns マッチするタグデータの配列
   */
  static async search(searchTerm: string): Promise<Tag[]> {
    try {
      const tags = await prisma.tag.findMany({
        where: {
          name: {
            contains: searchTerm,
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return tags;
    } catch (error) {
      throw new Error(`タグの検索に失敗しました: ${error}`);
    }
  }

  /**
   * 使用されているタグのみを取得する
   * @returns 使用されているタグデータの配列
   */
  static async findUsedTags(): Promise<Tag[]> {
    try {
      const tags = await prisma.tag.findMany({
        where: {
          personTags: {
            some: {},
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return tags;
    } catch (error) {
      throw new Error(`使用済みタグの取得に失敗しました: ${error}`);
    }
  }

  /**
   * 使用されていないタグを取得する
   * @returns 使用されていないタグデータの配列
   */
  static async findUnusedTags(): Promise<Tag[]> {
    try {
      const tags = await prisma.tag.findMany({
        where: {
          personTags: {
            none: {},
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return tags;
    } catch (error) {
      throw new Error(`未使用タグの取得に失敗しました: ${error}`);
    }
  }

  /**
   * タグを削除する
   * @param id 削除するタグのID
   */
  static async delete(id: string): Promise<void> {
    try {
      await prisma.tag.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`タグの削除に失敗しました: ${error}`);
    }
  }

  /**
   * 使用されていないタグを一括削除する
   * @returns 削除されたタグの数
   */
  static async deleteUnusedTags(): Promise<number> {
    try {
      const result = await prisma.tag.deleteMany({
        where: {
          personTags: {
            none: {},
          },
        },
      });

      return result.count;
    } catch (error) {
      throw new Error(`未使用タグの削除に失敗しました: ${error}`);
    }
  }

  /**
   * タグの総数を取得する
   * @returns タグの総数
   */
  static async count(): Promise<number> {
    try {
      return await prisma.tag.count();
    } catch (error) {
      throw new Error(`タグ数の取得に失敗しました: ${error}`);
    }
  }
}