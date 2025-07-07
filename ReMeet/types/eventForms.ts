import { z } from 'zod';

/**
 * イベント登録フォームのバリデーションスキーマ
 * イベントテーブルの仕様に基づいた項目構成
 */
export const eventRegistrationSchema = z.object({
  // イベント名: 必須、1文字以上100文字以下
  name: z
    .string()
    .min(1, 'イベント名は必須です')
    .max(100, 'イベント名は100文字以内で入力してください'),
  
  // 開催日: 任意
  date: z
    .date()
    .optional()
    .nullable(),
  
  // 開催場所: 任意、200文字以内
  location: z
    .string()
    .max(200, '開催場所は200文字以内で入力してください')
    .optional(),
});

/**
 * イベント登録フォームの型定義
 * Zodスキーマから自動的に型を生成
 */
export type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;