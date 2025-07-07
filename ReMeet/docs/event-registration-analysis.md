# 人物登録・編集画面へのイベント情報追加機能 影響範囲調査レポート

## 調査概要
人物登録画面と人物編集画面に、イベント情報の登録・編集機能が不足している問題について影響範囲を調査しました。

## 現在の実装状況

### 1. 画面構成
- **登録画面**: `app/person-register.tsx` - PersonFormScreenを利用
- **編集画面**: `app/person-edit.tsx` - PersonFormScreenを編集モードで利用  
- **共通フォーム**: `components/screens/PersonFormScreen.tsx` - ビジネスロジック層
- **フォームUI**: `components/forms/PersonForm.tsx` - プレゼンテーション層

### 2. 現在のフォーム項目（PersonForm.tsx:99-275）
- 名前（必須）
- ハンドル名  
- 会社名
- 役職
- 自己紹介
- プロダクト名
- GitHub ID
- タグ（TagInputWithSuggestionsで実装済み）
- メモ

**問題**: イベント関連の入力項目が完全に欠落

### 3. データベース構造（sqlite-types.ts:6-12）
```typescript
export interface Event {
  id: string;
  name: string;
  date?: Date | null;
  location?: string | null;
}

export interface PersonWithRelations {
  // ...人物情報
  events: Event[];  // 多対多関係
}
```

### 4. PersonService実装状況（PersonService.ts）
- Person作成・更新・削除・検索機能は実装済み
- **問題**: create/update関数でイベント関連付け処理が未実装
- モックデータではeventsフィールドを空配列で初期化（156行目）

### 5. フォーム型定義（types/forms.ts:48-123）
現在の`PersonRegistrationFormData`にはイベント関連の項目が一切含まれていない

## 必要な追加実装

### 1. 型定義の更新（types/forms.ts）
```typescript
export const personRegistrationSchema = z.object({
  // 既存項目...
  
  // 追加: イベント関連項目
  eventIds: z.array(z.string()).optional(),
});
```

### 2. フォームコンポーネントの更新（components/forms/PersonForm.tsx）
- イベント選択・追加UIコンポーネントの実装
- 既存のTagInputWithSuggestionsと同様の仕組みでイベント管理

### 3. PersonServiceの拡張（PersonService.ts）
- create関数（130-162行目）にイベント関連付け処理追加
- update関数（213-253行目）にイベント関連付け処理追加

### 4. EventServiceの実装
- イベント管理用のサービス実装（おそらく未実装）
- TagServiceと同様の構造で実装

### 5. テストの更新
- 新しいフォーム項目に対応したテスト修正
- PersonForm, PersonFormScreen のテストケース追加

## 実装の優先順位

### 高優先度
1. **PersonRegistrationFormData型にイベント項目追加**
2. **PersonFormにイベント選択UI追加**
3. **PersonServiceにイベント関連付け機能実装**

### 中優先度
4. **EventService実装**
5. **テストコード更新**

### 低優先度
6. **エラーハンドリング強化**
7. **ドキュメント更新**

## 技術的考慮事項

### アーキテクチャ一貫性
- 既存のタグ管理機能（TagInputWithSuggestions）と同様のパターンで実装
- TanStack Queryを使用したデータフェッチング
- Jotai atomsによる状態管理との整合性

### パフォーマンス
- イベント一覧の取得はTanStack Queryでキャッシュ
- フォーム送信時の新規イベント作成処理

### セキュリティ
- zod によるバリデーション
- 型安全性の確保

## 想定開発工数
- **設計・型定義**: 0.5日
- **UI実装**: 1日
- **ビジネスロジック実装**: 1日
- **テスト実装**: 0.5日
- **総工数**: 3日

## リスク
- 既存のPersonForm周りの複雑性
- イベントデータの一意性制約
- 大量のイベントデータに対するパフォーマンス

## 結論
影響範囲は限定的であり、既存のタグ管理機能を参考にした実装により、比較的安全に機能追加が可能です。