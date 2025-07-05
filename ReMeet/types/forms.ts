import { z } from 'zod';

/**
 * ユーザー登録フォームのバリデーションスキーマ
 * 各フィールドには日本語のエラーメッセージを設定
 */
export const userRegistrationSchema = z.object({
  // 名前: 1文字以上100文字以下
  name: z
    .string()
    .min(1, '名前は必須です')
    .max(100, '名前は100文字以内で入力してください'),
  
  // メールアドレス: 有効なメール形式
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  
  // パスワード: 8文字以上、英数字を含む
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*[0-9])/,
      'パスワードは英字と数字を含む必要があります'
    ),
  
  // パスワード確認: パスワードと一致
  passwordConfirmation: z
    .string()
    .min(1, 'パスワード確認は必須です'),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'パスワードが一致しません',
  path: ['passwordConfirmation'],
});

/**
 * ユーザー登録フォームの型定義
 * Zodスキーマから自動的に型を生成
 */
export type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;

/**
 * 人物登録フォームのバリデーションスキーマ
 * READMEのPersonスキーマに基づいた項目構成
 */
export const personRegistrationSchema = z.object({
  // 名前: 必須、1文字以上100文字以下
  name: z
    .string()
    .min(1, '名前は必須です')
    .max(100, '名前は100文字以内で入力してください'),
  
  // ハンドル名（SNSなど）: 任意、100文字以内
  handle: z
    .string()
    .max(100, 'ハンドル名は100文字以内で入力してください')
    .optional(),
  
  // 会社名: 任意、100文字以内
  company: z
    .string()
    .max(100, '会社名は100文字以内で入力してください')
    .optional(),
  
  // 役職: 任意、100文字以内
  position: z
    .string()
    .max(100, '役職は100文字以内で入力してください')
    .optional(),
  
  // 自己紹介・説明: 任意、500文字以内
  description: z
    .string()
    .max(500, '自己紹介は500文字以内で入力してください')
    .optional(),
  
  // プロダクト名: 任意、100文字以内
  product_name: z
    .string()
    .max(100, 'プロダクト名は100文字以内で入力してください')
    .optional(),
  
  // メモ: 任意、500文字以内
  memo: z
    .string()
    .max(500, 'メモは500文字以内で入力してください')
    .optional(),
  
  // GitHub ID: 任意、GitHubのusername制約に準拠
  github_id: z
    .string()
    .refine(
      (value) => {
        // 空文字列の場合はバリデーションをスキップ
        if (!value || value.trim() === '') return true;
        // GitHub IDのフォーマットチェック
        return /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?!-))*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(value);
      },
      {
        message: 'GitHub IDは1-39文字で、英数字とハイフンのみ使用可能です。先頭末尾にハイフン、連続ハイフンは使用できません'
      }
    )
    .refine(
      (value) => {
        // 空文字列の場合はバリデーションをスキップ
        if (!value || value.trim() === '') return true;
        // 長さチェック
        return value.length <= 39;
      },
      {
        message: 'GitHub IDは39文字以内で入力してください'
      }
    )
    .optional(),
  
  // タグ: 任意、カンマ区切りで複数指定可能
  tags: z
    .string()
    .max(200, 'タグは200文字以内で入力してください')
    .optional(),

  // NFC ID: 任意、システムで自動設定されることもある
  nfc_id: z
    .string()
    .max(50, 'NFC IDは50文字以内で入力してください')
    .optional(),
});

/**
 * 人物登録フォームの型定義
 * Zodスキーマから自動的に型を生成
 */
export type PersonRegistrationFormData = z.infer<typeof personRegistrationSchema>;