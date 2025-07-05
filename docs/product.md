# 機能仕様

## タグ機能
- 人物登録時にタグを設定可能
- 追加ボタン方式でタグを個別に追加
- 既存タグの再利用によりデータの一貫性を保つ
- タグによる人物の分類・検索が可能
- 選択済みタグの表示と削除機能
- 追加したタグは自動的に選択状態になる

## データ形式
- タグは文字列配列として管理
- 保存時はカンマ区切りの文字列に変換
- 例: "フロントエンド, React, TypeScript"
- 最大200文字まで入力可能

## コンポーネント仕様

### TagInputWithSuggestions
- **機能**: メインのタグ入力コンポーネント
- **特徴**:
  - 追加ボタンによる個別タグ追加
  - 既存タグトグルメニューからの選択
  - 選択済みタグの一覧表示（バツボタンで削除可能）
  - 入力がない場合は追加ボタンが無効化

### TagChip
- **機能**: 個別タグの表示コンポーネント
- **特徴**:
  - 選択状態の視覚的表現
  - 削除ボタン（オプション）
  - テーマカラー対応（theme オブジェクトで色設定を統合）

### TagInput（レガシー）
- **機能**: サジェスト機能付きタグ入力
- **特徴**: リアルタイムサジェスト、カンマ区切り入力

### TagSelector（レガシー）
- **機能**: 既存タグからの選択
- **特徴**: 水平スクロール、複数選択

# ディレクトリ構造
```
ReMeet/
├── __tests__/                    # テストファイル
│   └── components/               # コンポーネントのテスト
│       ├── ThemedText.test.tsx   # ThemedTextコンポーネントのテスト
│       └── forms/               # フォーム関連のテスト
│           ├── FormInput.test.tsx        # FormInputコンポーネントのテスト
│           ├── PersonRegistrationForm.test.tsx  # 個人登録フォームのテスト
│           ├── TagInput.test.tsx         # タグ入力コンポーネントのテスト
│           ├── TagInputWithSuggestions.test.tsx # タグ入力（追加ボタン式）のテスト
│           ├── TagSelector.test.tsx      # タグ選択コンポーネントのテスト
│           └── UserRegistrationForm.test.tsx  # ユーザー登録フォームのテスト
├── app/                         # アプリケーションのページ
│   ├── (tabs)/                  # タブナビゲーション
│   │   ├── _layout.tsx          # タブレイアウト
│   │   ├── index.tsx            # ホーム画面
│   │   └── explore.tsx          # 探索画面
│   ├── _layout.tsx              # ルートレイアウト
│   ├── +not-found.tsx           # 404ページ
│   ├── person-register.tsx      # 個人登録画面
│   └── register.tsx             # ユーザー登録画面
├── components/                  # 再利用可能なコンポーネント
│   ├── forms/                   # フォーム関連コンポーネント
│   │   ├── FormInput.tsx        # 汎用フォーム入力コンポーネント
│   │   ├── PersonRegistrationForm.tsx  # 個人登録フォームコンポーネント
│   │   ├── TagChip.tsx          # タグチップコンポーネント（個別タグ表示）
│   │   ├── TagInput.tsx         # タグ入力コンポーネント（サジェスト機能付き）
│   │   ├── TagInputWithSuggestions.tsx  # タグ入力（追加ボタン式）
│   │   ├── TagSelector.tsx      # タグ選択コンポーネント
│   │   └── UserRegistrationForm.tsx  # ユーザー登録フォームコンポーネント
│   ├── ui/                      # UI基本コンポーネント
│   │   ├── IconSymbol.tsx       # アイコンシンボル
│   │   └── TabBarBackground.tsx # タブバー背景
│   ├── Collapsible.tsx          # 折りたたみ可能コンポーネント
│   ├── ExternalLink.tsx         # 外部リンクコンポーネント
│   ├── HapticTab.tsx            # ハプティックフィードバック付きタブ
│   ├── HelloWave.tsx            # ウェーブアニメーション
│   ├── ParallaxScrollView.tsx   # パララックススクロールビュー
│   ├── ThemedText.tsx           # テーマ対応テキスト
│   └── ThemedView.tsx           # テーマ対応ビュー
├── types/                       # 型定義
│   └── forms.ts                 # フォーム関連の型定義とZodスキーマ
├── hooks/                       # カスタムフック
│   ├── useColorScheme.ts        # カラースキーム管理
│   └── useThemeColor.ts         # テーマカラー管理
├── constants/                   # 定数定義
│   └── Colors.ts                # カラー定数
├── assets/                      # 静的アセット
│   ├── fonts/                   # フォントファイル
│   └── images/                  # 画像ファイル
├── docs/                        # ドキュメント
│   └── product.md               # プロダクト構成ドキュメント（本ファイル）
├── jest.config.js               # Jest設定
├── package.json                 # パッケージ定義
└── tsconfig.json                # TypeScript設定
```

# コーディング規約

## 必須ルール
1. **useEffect使用禁止** - パフォーマンスと保守性の観点から
2. **map関数でのindex使用禁止** - 必ず一意のkeyを使用
3. **TDD（テスト駆動開発）** - 実装前にテストを書く
4. **日本語でのコミット** - コミットメッセージは日本語で記載

## リファクタリング履歴

### 2025-07-05
- **useEffect除去**: TagInput.tsxから不要なuseEffectを削除
- **key修正**: 全コンポーネントでmap関数のkeyをindexから一意の値に変更
- **TagChip追加**: 個別タグ表示用の再利用可能コンポーネントを作成
- **props最適化**: TagChipのカラー関連propsをthemeオブジェクトに統合
- **testID更新**: 動的なindexベースのIDから意味のある名前に変更