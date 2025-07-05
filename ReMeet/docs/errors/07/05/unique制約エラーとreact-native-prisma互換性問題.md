# UNIQUE制約エラーとReact Native環境でのPrisma互換性問題

## 発生日時
2025年7月5日

## エラー概要
人物登録機能の実装中に以下の2つの主要なエラーが発生した：

1. **Prisma互換性エラー**: React Native環境でPrismaクライアントが動作しない
2. **UNIQUE制約エラー**: タグ作成時の重複チェック不備によるデータベースエラー

## エラー詳細

### 1. Prismaクライアント互換性エラー
```
ERROR  タグの読み込みに失敗しました: [Error: タグ一覧の取得に失敗しました: Error: PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in ``).
```

**原因**: PrismaクライアントはNode.js環境向けに設計されており、React Native環境では直接実行できない。

### 2. UNIQUE制約エラー
```
ERROR  人物の登録に失敗しました: [Error: タグの一括作成に失敗しました: Error: タグの作成に失敗しました: Error: Calling the 'finalizeAsync' function has failed
→ Caused by: Error code 19: UNIQUE constraint failed: tags.name]
```

**原因**: タグの重複チェックロジックが不完全で、既存のタグ名でINSERTを実行してしまった。

## 根本的原因分析

### Prisma互換性問題
- Prismaクライアントはブラウザ環境やReact Native環境での実行に制限がある
- SQLiteへの直接アクセスにはネイティブライブラリが必要
- Expo環境では専用のSQLiteライブラリ（expo-sqlite）が推奨されている

### UNIQUE制約エラー
- `getAllAsync`を使用した重複チェックで競合状態が発生
- 複数のタグを同時に作成する際の排他制御不備
- エラーハンドリングで既存データの取得ロジックが不十分

## 解決策の実装

### 1. expo-sqliteへの移行
```typescript
// 旧: Prismaクライアント
import { PersonService, TagService } from '@/database/services';

// 新: expo-sqlite
import { PersonService, TagService } from '@/database/sqlite-services';
```

**実装内容**:
- `sqlite-client.ts`: データベース接続とスキーマ管理
- `sqlite-services/`: 各エンティティのCRUD操作
- React Native環境での安定動作を確保

### 2. UNIQUE制約エラーの解決
```typescript
// 改善前
const existingTags = await db.getAllAsync<Tag>(
  'SELECT * FROM tags WHERE name = ?',
  [normalizedName]
);

// 改善後
const existingTag = await db.getFirstAsync<Tag>(
  'SELECT * FROM tags WHERE name = ?',
  [normalizedName]
);

if (existingTag) {
  return existingTag;
}

try {
  await db.runAsync(
    'INSERT INTO tags (id, name) VALUES (?, ?)',
    [tagId, normalizedName]
  );
} catch (insertError: any) {
  // UNIQUE制約エラーの場合は既存のタグを返す
  if (insertError.message && insertError.message.includes('UNIQUE constraint failed')) {
    const existingTagAfterError = await db.getFirstAsync<Tag>(
      'SELECT * FROM tags WHERE name = ?',
      [normalizedName]
    );
    if (existingTagAfterError) {
      return existingTagAfterError;
    }
  }
  throw insertError;
}
```

## 対策のポイント

### 技術的対策
1. **適切なライブラリ選択**: React Native環境に最適化されたexpo-sqliteを採用
2. **競合状態対応**: try-catchによるUNIQUE制約エラーの適切な処理
3. **パフォーマンス改善**: `getFirstAsync`による単一レコード取得の最適化

### 設計的対策
1. **エラーハンドリング強化**: 各レイヤーでの適切なエラーメッセージ
2. **トランザクション管理**: データの整合性を保つための適切な処理
3. **テスト対応**: モック化による単体テストの実装

## 予防策

### 開発時の注意事項
1. **環境固有の制約確認**: ライブラリ選択時の動作環境チェック
2. **データベース制約の考慮**: UNIQUE制約などのDB制約を考慮した実装
3. **競合状態のテスト**: 同時実行シナリオでのテスト実施

### コードレビューポイント
1. データベース操作での例外処理の妥当性
2. React Native環境での動作検証
3. 制約違反時のフォールバック処理の実装

## 学習事項

1. **プラットフォーム制約の重要性**: 開発環境とターゲット環境の違いを事前に把握する
2. **データベース制約の活用**: UNIQUE制約を活用しつつ、適切なエラーハンドリングを実装する
3. **段階的な移行**: 大きな変更は段階的に実施し、各段階での動作確認を徹底する

## 参考資料
- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [React Native Database Options](https://reactnative.dev/docs/database)
- [SQLite UNIQUE Constraint Handling](https://www.sqlite.org/lang_conflict.html)