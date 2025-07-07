# Claude リファクタリング計画書

## 概要

既存の4つのリファクタリング計画を分析し、統合的で実現可能なリファクタリング計画を提案します。本計画は、コードの保守性向上、型安全性の強化、責務の分離を主軸として、プロジェクト全体の品質向上を目指します。

## 現状分析

### 主要な課題
1. **UIロジックとビジネスロジックの密結合**
2. **コンポーネントの責務が不明確**
3. **データ層の抽象化不足**
4. **型安全性の不徹底**
5. **テストカバレッジの不足**

## 統合リファクタリング戦略

### 基本原則
- **単一責任の原則**: 各モジュール、クラス、関数は単一の責任を持つ
- **DRY**: 重複コードは排除し、共通化可能な箇所を抽出
- **型安全**: TypeScriptの型定義を厳格にし、`any`の使用を禁止
- **段階的移行**: 既存機能を破壊せず、段階的にリファクタリング

## 詳細リファクタリング計画

### 既存機能の保護方針

**重要**: 以下の機能は絶対に失わないように注意深く移行する
1. **スワイプメニューの同時開放制御** - openedMenuIdAtomとの連携
2. **Jotai ↔ TanStack Query の双方向データフロー**
3. **タグの新規作成フロー** - findOrCreateByNames
4. **日付選択のテーマ対応** - DateTimePicker設定
5. **フォームバリデーションの詳細ルール** - Zodスキーマ
6. **useFocusEffectによるページフォーカス時データフェッチ**
7. **人物-イベント関連付け機能**
8. **削除確認ダイアログとキャッシュ無効化**

### フェーズ1: 基盤整備（最優先）

#### 1.1 ディレクトリ構造の再編成
```
重さ: 小
期間: 1日
既存機能への影響: なし
```

- [ ] `components` ディレクトリを `atoms`, `molecules`, `organisms` に再編成
- [ ] `hooks` ディレクトリを新規作成
- [ ] `repositories` ディレクトリを新規作成
- [ ] `services` ディレクトリを整理
- [ ] **既存ファイルのimport pathを全て更新**

#### 1.2 共通コンポーネントの整備
```
重さ: 小
期間: 1日
既存機能への影響: なし
```

- [ ] `components/atoms/` に基本コンポーネント移動
  - `ThemedText.tsx`, `ThemedView.tsx`, `FormInput.tsx`, `TagChip.tsx`
- [ ] `components/common/` に共通UIコンポーネント作成
  - `LoadingIndicator.tsx`, `ErrorState.tsx`, `EmptyState.tsx`
- [ ] **既存コンポーネントの全機能（props, styling, theme対応）を維持**

#### 1.3 型定義の統一
```
重さ: 小
期間: 1日
既存機能への影響: なし
```

- [ ] `UserProfile` 型を `Person` 型の拡張として修正
- [ ] `any` 型の使用を段階的に削減（一度にゼロにはしない）
- [ ] 型定義を各コンポーネントの外部に配置
- [ ] **PersonWithRelations, Event, Tag型の全フィールドを維持**

### フェーズ2: データ層の抽象化（高優先）

#### 2.1 リポジトリパターンの導入
```
重さ: 大
期間: 3日
既存機能への影響: 中（注意深く実装）
```

- [ ] `repositories/interfaces/` ディレクトリ作成
  - `IPersonRepository.ts`, `IEventRepository.ts`, `ITagRepository.ts`
- [ ] `repositories/implementations/` ディレクトリ作成
  - `MockPersonRepository.ts`, `MockEventRepository.ts`, `MockTagRepository.ts`
- [ ] **既存の `sqlite-services` の全メソッドを新しいリポジトリに移行**
- [ ] **PersonService.findOrCreateByNames() などの既存APIを完全に維持**

#### 2.2 サービス層の構築
```
重さ: 中
期間: 2日
既存機能への影響: 小
```

- [ ] 既存の `PersonService`, `EventService`, `TagService` を保持
- [ ] **新しいリポジトリを使用するように内部実装のみ変更**
- [ ] **外部APIは変更せず、内部での依存性注入のみ導入**
- [ ] **既存のビジネスロジック（フィルタリング、検索）を維持**

### フェーズ3: UIロジックの分離（高優先）

#### 3.1 カスタムフックの作成
```
重さ: 大
期間: 4日
既存機能への影響: 大（慎重に実装）
```

- [ ] `hooks/usePeopleScreen.ts` - **useFocusEffect, openedMenuIdAtom, スワイプ削除を含む**
- [ ] `hooks/usePersonDetail.ts` - **削除確認ダイアログとキャッシュ無効化を含む**
- [ ] `hooks/useEventsScreen.ts` - **人物-イベント関連付け機能を含む**
- [ ] `hooks/usePersonForm.ts` - **Zodバリデーション、タグ新規作成を含む**
- [ ] `hooks/useEventForm.ts` - **DateTimePicker設定、テーマ対応を含む**

#### 3.2 画面コンポーネントの簡素化
```
重さ: 大
期間: 3日
既存機能への影響: 大（慎重に実装）
```

- [ ] `app/(tabs)/people.tsx` を**全機能維持**でカスタムフック使用に移行
- [ ] `app/person-detail.tsx` を**全機能維持**でカスタムフック使用に移行
- [ ] `app/(tabs)/events.tsx` を**全機能維持**でカスタムフック使用に移行
- [ ] **Jotai ↔ TanStack Query の双方向データフローを維持**

### フェーズ4: フォームコンポーネントの統合（中優先）

#### 4.1 統合フォームコンポーネント
```
重さ: 大
期間: 3日
既存機能への影響: 大（慎重に実装）
```

- [ ] `PersonRegistrationForm.tsx` を削除し、`PersonForm.tsx` に統合
- [ ] `components/molecules/TagInputField.tsx` を新規作成
  - **TagInputWithSuggestions の全機能（新規作成、選択、削除）を維持**
  - **既存タグ選択 + 新規タグ作成フローを完全に維持**
- [ ] `components/molecules/DateField.tsx` を新規作成
  - **DateTimePicker のテーマ対応を維持**
  - **過去の日付のみ選択可能な制限を維持**
- [ ] `components/organisms/PersonForm.tsx` として責務を分離
  - **全バリデーションルール（Zodスキーマ）を維持**

#### 4.2 登録・編集画面の統合
```
重さ: 中
期間: 2日
既存機能への影響: 中（注意深く実装）
```

- [ ] `app/person-edit.tsx` を削除
- [ ] `app/person-register.tsx` で `id` パラメータによる切り替え実装
- [ ] **既存の編集機能（データ取得、更新、バリデーション）を完全に維持**
- [ ] `app/event-register.tsx` も同様の構造に統一

### フェーズ5: 状態管理の最適化（低優先）

#### 5.1 サーバー状態管理の一元化
```
重さ: 中
期間: 2日
既存機能への影響: 大（慎重に実装）
```

- [ ] **重要**: Jotaiのサーバー状態関連Atom廃止は段階的に実施
  - `peopleAtom`, `peopleLoadingAtom`, `peopleErrorAtom`
- [ ] **スワイプメニューの同時開放制御を破壊しないように注意**
- [ ] **openedMenuIdAtom は維持**
- [ ] `useQuery` による直接的なデータ取得に移行（既存の動作と同じになるよう調整）
- [ ] `QueryClient` のシングルトン化

#### 5.2 Suspenseの活用
```
重さ: 中
期間: 1日
既存機能への影響: 小
```

- [ ] React QueryとSuspenseを組み合わせたローディング管理
- [ ] **既存のローディング状態表示を維持**
- [ ] 非同期データ取得コンポーネントでの適用

### フェーズ6: UIコンポーネントの汎用化（低優先）

#### 6.1 汎用コンポーネントの作成
```
重さ: 中
期間: 2日
既存機能への影響: 中（注意深く実装）
```

- [ ] `SwipeablePersonCard.tsx` を削除
- [ ] `SwipeableCard.tsx` に汎用化して統合
- [ ] **スワイプ削除機能とopenedMenuIdAtomの連携を完全に維持**
- [ ] `components/organisms/SwipeableCard.tsx` として配置

#### 6.2 スタイルの分離
```
重さ: 小
期間: 1日
既存機能への影響: なし
```

- [ ] `StyleSheet` 定義を各画面の `.styles.ts` ファイルに分離
- [ ] `app/(tabs)/people.styles.ts`
- [ ] `app/person-detail.styles.ts`
- [ ] `app/(tabs)/events.styles.ts`

## 実装順序と優先度

### 高優先度（Week 1-2）
1. フェーズ1: 基盤整備
2. フェーズ2: データ層の抽象化
3. フェーズ3: UIロジックの分離

### 中優先度（Week 3-4）
4. フェーズ4: フォームコンポーネントの統合

### 低優先度（後で実施）
5. フェーズ5: 状態管理の最適化
6. フェーズ6: UIコンポーネントの汎用化

## 注意点・リスク

### 技術的リスク
1. **既存機能の破壊**: 段階的な移行により最小化
2. **スワイプメニューの同時開放制御**: openedMenuIdAtomとの連携を破壊しないよう注意
3. **Jotai ↔ TanStack Query データフロー**: 双方向データフローを維持
4. **タグ新規作成フロー**: findOrCreateByNamesの動作を維持
5. **フォームバリデーション**: Zodスキーマの全ルールを維持

### 対策
1. **段階的移行**: 機能単位で段階的に実装し、各段階でテスト
2. **機能テスト**: 各フェーズで既存機能の動作確認を徹底
3. **並行開発**: 既存機能を残しつつ新機能を追加し、最後に切り替え
4. **ロールバック計画**: 問題が発生した場合の戻し手順を準備

## 成功指標

1. **機能保持**
   - **全既存機能が完全に動作すること（最重要）**
   - スワイプメニューの同時開放制御が正常に動作
   - タグ新規作成フローが正常に動作
   - フォームバリデーションが正常に動作
   - 削除確認ダイアログが正常に動作

2. **コード品質**
   - 1ファイル100行以内の維持
   - `any` 型の使用を段階的に削減
   - ESLint/TypeScriptエラーゼロ

3. **保守性**
   - 責務の明確化
   - 依存関係の単純化
   - 再利用可能なコンポーネント作成

4. **テストカバレッジ**
   - 重要なロジックのテストカバレッジ80%以上
   - 全てのCustom Hookのテスト実装

## 最終的な目標アーキテクチャ

```
app/
├── (tabs)/
│   ├── people.tsx          # プレゼンテーショナル（全機能維持）
│   └── events.tsx          # プレゼンテーショナル（全機能維持）
├── person-detail.tsx       # プレゼンテーショナル（全機能維持）
└── person-register.tsx     # プレゼンテーショナル（登録・編集統合）

components/
├── atoms/                  # 基本コンポーネント
├── molecules/              # 複合コンポーネント（TagInputField, DateField）
├── organisms/              # 複雑なコンポーネント（PersonForm, EventForm）
└── common/                 # 共通コンポーネント

hooks/                      # カスタムフック（全機能を含む）
├── usePeopleScreen.ts      # useFocusEffect, openedMenuIdAtom含む
├── usePersonDetail.ts      # 削除確認ダイアログ含む
├── usePersonForm.ts        # Zodバリデーション, タグ新規作成含む
└── useEventForm.ts         # DateTimePicker設定含む

repositories/               # データアクセス層
├── interfaces/
└── implementations/

services/                   # ビジネスロジック層（既存API維持）
├── PersonService.ts
├── EventService.ts
└── TagService.ts

atoms/                      # 状態管理（重要なatomは維持）
├── peopleAtoms.ts          # openedMenuIdAtom維持
└── ...
```

## 重要な保証事項

1. **既存機能の100%保持**: リファクタリング後も全ての既存機能が正常に動作
2. **段階的移行**: 一度に全てを変更せず、段階的に安全に移行
3. **テスト駆動**: 各段階で既存機能の動作を確認
4. **ロールバック可能**: 問題が発生した場合に即座に元に戻せる

本計画により、**既存機能を失うことなく**、保守性が高く、拡張性に優れたアーキテクチャを実現します。