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