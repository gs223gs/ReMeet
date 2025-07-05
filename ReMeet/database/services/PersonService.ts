/**
 * 人物登録・管理サービス
 * データベースアクセスロジックを抽象化し、ビジネスロジックを提供
 */
import prisma from '../client';
import { Person, Tag } from '../types';

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
 * 人物サービスクラス
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

      // トランザクションを使用して人物とタグの関連を同時に登録
      const person = await prisma.$transaction(async (tx) => {
        // 人物を作成
        const newPerson = await tx.person.create({
          data: {
            name: data.name.trim(),
            handle: data.handle,
            company: data.company,
            position: data.position,
            description: data.description,
            productName: data.productName,
            memo: data.memo,
            githubId: data.githubId,
          },
        });

        // タグとの関連を作成
        if (data.tagIds && data.tagIds.length > 0) {
          await tx.personTag.createMany({
            data: data.tagIds.map((tagId) => ({
              personId: newPerson.id,
              tagId,
            })),
          });
        }

        return newPerson;
      });

      return person;
    } catch (error) {
      throw new Error(`人物の登録に失敗しました: ${error}`);
    }
  }

  /**
   * 人物を更新する
   * @param id 更新する人物のID
   * @param data 更新データ
   * @returns 更新された人物データ
   */
  static async update(id: string, data: UpdatePersonData): Promise<Person> {
    try {
      const person = await prisma.$transaction(async (tx) => {
        // 人物データを更新
        const updatedPerson = await tx.person.update({
          where: { id },
          data: {
            name: data.name,
            handle: data.handle,
            company: data.company,
            position: data.position,
            description: data.description,
            productName: data.productName,
            memo: data.memo,
            githubId: data.githubId,
          },
        });

        // タグの関連を更新（既存の関連をすべて削除して新しく作成）
        if (data.tagIds !== undefined) {
          await tx.personTag.deleteMany({
            where: { personId: id },
          });

          if (data.tagIds.length > 0) {
            await tx.personTag.createMany({
              data: data.tagIds.map((tagId) => ({
                personId: id,
                tagId,
              })),
            });
          }
        }

        return updatedPerson;
      });

      return person;
    } catch (error) {
      throw new Error(`人物の更新に失敗しました: ${error}`);
    }
  }

  /**
   * 人物を削除する
   * @param id 削除する人物のID
   */
  static async delete(id: string): Promise<void> {
    try {
      await prisma.person.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`人物の削除に失敗しました: ${error}`);
    }
  }

  /**
   * 人物をIDで取得する
   * @param id 人物のID
   * @returns 人物データ（タグ情報を含む）
   */
  static async findById(id: string): Promise<Person | null> {
    try {
      const person = await prisma.person.findUnique({
        where: { id },
        include: {
          personTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return person;
    } catch (error) {
      throw new Error(`人物の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 人物一覧を取得する
   * @param filter 検索フィルター
   * @returns 人物データの配列
   */
  static async findMany(filter?: PersonSearchFilter): Promise<Person[]> {
    try {
      const persons = await prisma.person.findMany({
        where: {
          name: filter?.name ? { contains: filter.name } : undefined,
          company: filter?.company ? { contains: filter.company } : undefined,
          personTags: filter?.tagIds?.length
            ? {
                some: {
                  tagId: {
                    in: filter.tagIds,
                  },
                },
              }
            : undefined,
        },
        include: {
          personTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return persons;
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
      return await prisma.person.count();
    } catch (error) {
      throw new Error(`人物数の取得に失敗しました: ${error}`);
    }
  }
}