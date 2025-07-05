/**
 * Prismaクライアントのシングルトンインスタンス
 * データベースへの接続を管理し、アプリケーション全体で共有する
 */
import { PrismaClient } from './generated';

// グローバルな型定義でPrismaClientを追加
declare global {
  var __prisma: PrismaClient | undefined;
}

// シングルトンパターンでPrismaClientを管理
// 開発環境ではホットリロード時にインスタンスが再作成されるのを防ぐ
const prisma = global.__prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

export default prisma;