# ReMeet

ミートアップであった人を記録するアプリ

# ReMeet 要件定義書（v2.1 ― 改訂版）

---

## 1. プロジェクト概要

- **アプリ名**：ReMeet
- **目的**

  1. 出会った人物のプロフィール・SNS 情報を一元管理
  2. タグで人物・イベントを整理し高速にフィルタリング
  3. NFC カードを用いたワンタップ登録／呼び出し
  4. MindNode 風グラフで人間関係・共通点を可視化
  5. GitHub など外部 SNS の最新情報をキャッシュ付きで取得

- **想定ユーザー**
  - 技術カンファレンス・勉強会に参加するエンジニア
  - 新しいガジェット（NFC 名刺）に抵抗がない層
  - 拡散チャネルは口コミと SNS

---

## 2. ユーザーストーリー（抜粋）

| ID  | ストーリー                                                     | 受け入れ基準                                    |
| --- | -------------------------------------------------------------- | ----------------------------------------------- |
| S1  | NFC カードをかざすと登録画面が開き、カード ID が自動入力される | 1 秒以内に画面遷移し、ID がフォームに表示される |
| S2  | 人物登録時に複数タグを追加し、後でタグ検索できる               | タグチップの追加・削除 UI、AND/OR フィルタ      |
| S3  | ホームで名前・会社・タグから高速検索できる                     | 入力 200 ms 以内に結果リストが更新              |
| S4  | GitHub ID からスター数・最終更新を取得し、24 h キャッシュ      | オフライン時は前回キャッシュ表示                |
| S5  | グラフで共通イベントやタグで人物が自動接続される               | ノード数 200 で FPS 40 以上                     |
| S6  | 設定画面で自分のプロフィール編集と NFC 書き込みができる        | 書き込み成功率 95 % 以上                        |

---

## 3. 機能一覧

| カテゴリ       | 機能                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| 共通           | Realm 暗号化 DB、ダーク／ライトテーマ、自動バックアップ（iOS CloudKit / Android Auto Backup） |
| タグ管理       | タグ CRUD、タグマージ、重複検知                                                               |
| NFC 連携       | 読み取り時フォアグラウンド起動、上書き確認ダイアログ、書き込みロールバック                    |
| ホーム         | 人物リスト（仮想リスト）、高速全文検索、並び替え                                              |
| チュートリアル | 初回起動フロー、NFC 操作アニメーション                                                        |
| 人物登録／編集 | 動的フォーム生成（Schema → react-hook-form ＋ zod）、必須項目バリデーション                   |
| GitHub 画面    | GraphQL API でバルク取得、24 h キャッシュ、自動リフレッシュ                                   |
| グラフ画面     | Skia Canvas ＋レイアウト WebWorker、ピンチズーム／パン、ノードドラッグ                        |
| 設定           | ユーザープロフィール、NFC 書き込み、テーマ・ロケール                                          |

---

## 4. 画面遷移図（Mermaid）

flowchart LR  
 Home[ホーム] --> |＋| Add[人物追加]  
 Home --> Detail[人物詳細]  
 Home --> Tutorial[チュートリアル]  
 Home --> Graph[関係グラフ]  
 Home --> Settings[設定]  
 Detail --> GitHub[GitHub ステータス]  
 Settings --> NFCWrite[NFC 書き込み]

---

## 5. データモデル（Realm スキーマ）

### 5.1 Person

```
export const PersonSchema = {
  name: 'Person',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    handle: 'string?',
    company: 'string?',
    position: 'string?',
    description: 'string?',
    product_name: 'string?',
    memo: 'string?',
    github_id: 'string?',
    nfc_id: 'string?',
    events: 'Event[]',          // 多対多
    tags: 'Tag[]',              // 多対多
    relations: 'Relation[]',    // 自分発の Relation
    attributes: 'Attribute[]',  // 動的カスタムフィールド
    created_at: 'date',
    updated_at: 'date'
  }
};
```

### 5.2 Attribute（動的カスタムフィールド）

```
export const AttributeSchema = {
  name: 'Attribute',
  properties: {
    key: 'string',
    value: 'string'
  }
};
```

### 5.3 Tag

```
export const TagSchema = {
  name: 'Tag',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    persons: { type: 'linkingObjects', objectType: 'Person', property: 'tags' }
  }
};
```

### 5.4 Event

```
export const EventSchema = {
  name: 'Event',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    date: 'date?',
    location: 'string?',
    persons: 'Person[]'
  }
};
```

### 5.5 Relation（人物間の関係）

```
export const RelationSchema = {
  name: 'Relation',
  primaryKey: 'id',
  properties: {
    id: 'string',
    source: 'Person',
    target: 'Person',
    relation_type: 'string',
    created_at: 'date'
  }
};
```

### 5.6 UserProfile（自分の情報）

```
export const UserProfileSchema = {
  name: 'UserProfile',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    avatar_url: 'string?',
    sns: 'string?',
    nfc_id: 'string?',
    created_at: 'date'
  }
};
```

### 5.7 GitHubCache（24 h キャッシュ）

```
export const GitHubCacheSchema = {
  name: 'GitHubCache',
  primaryKey: 'github_id',
  properties: {
    github_id: 'string',
    stars: 'int',
    repos: 'int',
    last_commit: 'date?',
    fetched_at: 'date'
    //github status の画像取得APIを数個
  }
};
```

---

## 6. データ仕様補足

- **GitHub ステータスは GitHubCache に保存し、24 h で自動失効**
- **タグはグローバル共有**。タグ名変更は `id` 不変で `name` 更新
- **イベントは多対多**。同一イベント参加者はグラフで接続
- **NFC ID 重複時は上書き確認ダイアログ＋ Undo**
- **すべてのスキーマに uuid v4・created_at を必須**
- **Realm を AES-256 で暗号化**。鍵は Keychain/Keystore 保存

---

## 7. グラフ描画仕様

- **ノード**：Person
- **中心ノード**：UserProfile
- **エッジ条件**
  - 共通イベント
  - 共通タグ
  - Relation で直接接続
- **実装**
  - react-native-skia + D3-force in WebWorker
  - ピンチズーム／パン／ノードドラッグ
  - ノードタップで Detail へ遷移

---

## 8. 技術スタック

| 項目           | 採用技術                                       | 補足                        |
| -------------- | ---------------------------------------------- | --------------------------- |
| フロントエンド | React Native (Expo + TypeScript)               | EAS Build で OTA 配信       |
| グラフ描画     | Skia Canvas + d3-force                         | JS スレッド負荷分離         |
| ローカル DB    | Realm (暗号化)                                 | Repository パターンで抽象化 |
| キャッシュ     | MMKV                                           | GitHubCache と画像          |
| NFC            | react-native-nfc-manager                       | iOS/Android 両対応          |
| 状態管理       | jotai                                          | Realm LiveQuery と併用      |
| バリデーション | zod + react-hook-form                          | 動的フォーム生成            |
| テスト         | testing-library/react-native                   | NFC/Graph を Detox で E2E   |
| CI/CD          | GitHub Actions (lint/test) + EAS               | macOS runner は EAS に委譲  |
| ドキュメント   | Storybook + ADR (Architecture Decision Record) | 変更履歴を可視化            |

---

---

## 9. セキュリティ・運用

- 生体認証 / PIN でアプリロック
- 暗号化バックアップ：iOS CloudKit Private DB、Android Auto Backup (device-encrypted)

---

## 10. ロードマップ（抜粋）

| フェーズ | スコープ                         |
| -------- | -------------------------------- |
| MVP      | NFC 登録／人物 CRUD／タグ検索    |
| v1.0     | GitHub status 表示／イベント機能 |
| v1.5     | グラフ描画（Skia）               |
| v2.0     | 暗号化バックアップ／E2E テスト   |
| v2.1     | UI/UX 改善・多言語対応           |

---
