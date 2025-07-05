# ディレクトリ構造
```
ReMeet/
├── __tests__/                    # テストファイル
│   └── components/               # コンポーネントのテスト
│       ├── ThemedText.test.tsx   # ThemedTextコンポーネントのテスト
│       └── forms/               # フォーム関連のテスト
│           ├── FormInput.test.tsx        # FormInputコンポーネントのテスト
│           └── UserRegistrationForm.test.tsx  # ユーザー登録フォームのテスト
├── app/                         # アプリケーションのページ
│   ├── (tabs)/                  # タブナビゲーション
│   │   ├── _layout.tsx          # タブレイアウト
│   │   ├── index.tsx            # ホーム画面
│   │   └── explore.tsx          # 探索画面
│   ├── _layout.tsx              # ルートレイアウト
│   ├── +not-found.tsx           # 404ページ
│   └── register.tsx             # ユーザー登録画面
├── components/                  # 再利用可能なコンポーネント
│   ├── forms/                   # フォーム関連コンポーネント
│   │   ├── FormInput.tsx        # 汎用フォーム入力コンポーネント
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
├── jest.config.js               # Jest設定
├── package.json                 # パッケージ定義
└── tsconfig.json                # TypeScript設定
```