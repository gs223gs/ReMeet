
# ディレクトリ構造
```
ReMeet/
├── __tests__/                    # テストファイル
│   ├── app/                     # アプリケーションのテスト
│   │   └── (tabs)/             # タブ画面のテスト
│   │       └── people.test.tsx  # 人物一覧画面のテスト
│   └── components/              # コンポーネントのテスト
│       ├── ThemedText.test.tsx  # ThemedTextコンポーネントのテスト
│       └── forms/              # フォーム関連のテスト
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
│   │   ├── explore.tsx          # 探索画面
│   │   └── people.tsx           # 人物一覧画面
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
│   │   ├── IconSymbol.tsx       # アイコンシンボル（iOS用もあり）
│   │   └── TabBarBackground.tsx # タブバー背景（iOS用もあり）
│   ├── HapticTab.tsx            # ハプティックフィードバック付きタブ
│   ├── ThemedText.tsx           # テーマ対応テキスト
│   └── ThemedView.tsx           # テーマ対応ビュー
├── database/                    # データベース関連
│   ├── sqlite-services/         # SQLiteサービス層
│   │   ├── PersonService.ts     # 人物データのサービス
│   │   └── index.ts            # エクスポート用インデックス
│   └── sqlite-types.ts          # SQLite用の型定義
├── types/                       # 型定義
│   └── forms.ts                 # フォーム関連の型定義とZodスキーマ
├── hooks/                       # カスタムフック
│   ├── useColorScheme.ts        # カラースキーム管理
│   ├── useColorScheme.web.ts   # Web用カラースキーム管理
│   └── useThemeColor.ts         # テーマカラー管理
├── constants/                   # 定数定義
│   └── Colors.ts                # カラー定数
├── assets/                      # 静的アセット
│   ├── fonts/                   # フォントファイル
│   │   └── SpaceMono-Regular.ttf
│   └── images/                  # 画像ファイル
│       ├── adaptive-icon.png
│       ├── favicon.png
│       ├── icon.png
│       └── splash-icon.png
├── scripts/                     # ユーティリティスクリプト
│   └── reset-project.js         # プロジェクトリセット用スクリプト
├── app.json                     # Expoアプリ設定
├── expo-env.d.ts                # Expo環境型定義
├── eslint.config.js             # ESLint設定
├── jest.config.js               # Jest設定
├── package.json                 # パッケージ定義
└── tsconfig.json                # TypeScript設定
```
