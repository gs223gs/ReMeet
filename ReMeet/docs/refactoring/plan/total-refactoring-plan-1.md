### **他担当者のリファクタリング案のレビュー**

各担当者のリファクタリング案を `refactoring-rule.md` に基づいてレビューし、改善点やより良いアプローチを指摘します。

#### **担当1: 画面とナビゲーション (Screens & Routing)** - `refactoring-plan-1.md`

**全体的な評価:**
カスタムフックによるロジック分離、共通コンポーネントの抽出、スタイルシートの分離など、`refactoring-rule.md` の原則（単一責任、DRY、コンポーネント設計）に沿った非常に良いアプローチです。特に、`components/features/` ディレクトリの導入は、Atomic Design の Organisms レベルのコンポーネントを配置する場所として適切です。

**指摘事項・改善提案:**

*   **フェーズ4: 登録・編集画面の統合と簡素化**
    *   `app/person-edit.tsx` を削除し、`app/person-register.tsx` に統合する案は良いですが、`PersonFormScreen` を修正する、という点が気になります。担当2の計画で `PersonFormScreen` は廃止されるべきコンポーネントとされているため、この統合は `app/person-register.tsx` (または `app/person/[id].tsx` のような動的ルーティングのファイル) が直接 `PersonForm` を利用し、`usePersonForm` (担当2の計画で提案) のロジックで登録・編集を切り替える形になるべきです。
    *   **改善案:** 担当1の計画と担当2の計画の連携を明確にする。`PersonFormScreen` の廃止を前提とし、`app/person-register.tsx` が `usePersonForm` と `PersonForm` を直接利用する形に修正する。
*   **`StyleSheet` の分離:**
    *   `app/(tabs)/people.styles.ts` のようにスタイルを分離する案は良いですが、Atomic Design の観点から、コンポーネントのスタイルはコンポーネント自身と同じディレクトリに配置するのが一般的です。例えば、`components/features/people/PeopleList/PeopleList.styles.ts` のように、コンポーネントの内部にスタイルを閉じ込める方が、コンポーネントのポータビリティが高まります。
    *   **改善案:** スタイルシートの分離先を、関連するコンポーネントのディレクトリ内に変更することを検討する。

#### **担当2: UIコンポーネント (UI Components)** - `refactoring-plan-2.md`

**全体的な評価:**
Atomic Design の導入、Presentational/Container パターンの徹底、カスタムフックによるロジックの集約という、非常に野心的で正しい方向性の計画です。特に `components/screens` の廃止は、責務の明確化において重要な一歩です。

**指摘事項・改善提案:**

*   **フェーズ1: 基盤整備とAtomsの定義**
    *   `components` ディレクトリを `atoms`, `molecules`, `organisms` に再編成する、というタスクは、他のフェーズの前提となるため、計画の初期段階で明確に定義されているのは良いです。
*   **フェーズ2: フォーム関連コンポーネントの刷新**
    *   `TagInput`, `TagInputWithSuggestions`, `TagSelector` を廃止し、`TagInputField.tsx` に統合する案は非常に良いです。これにより、タグ関連のUI/UXが一貫し、コードの重複も解消されます。
    *   `PersonForm.tsx` と `EventForm.tsx` からビジネスロジックを完全に分離する、という点も Presentational コンポーネントの原則に則っており、素晴らしいです。
*   **フェーズ3: UIコンポーネントの整理と汎用化**
    *   `SwipeablePersonCard.tsx` を `SwipeableCard.tsx` に統合し、汎用化する案も DRY 原則に沿っており、適切です。
*   **フェーズ4: ビジネスロジックのカスタムフック化**
    *   `components/screens` の廃止と、`usePersonForm.ts`, `useEventForm.ts`, `useTags.ts` の新規作成は、ロジックとUIの分離を徹底する上で不可欠であり、最も重要な変更点の一つです。

**懸念点:**
*   この計画は非常に広範囲にわたる変更を含むため、各タスクの依存関係と実行順序をより詳細に計画する必要があります。特に、`components/screens` の廃止とカスタムフック化は、担当1の画面コンポーネントの修正と密接に連携する必要があります。

#### **担当3: アプリケーションロジックと状態 (Business Logic & State)** - `refactoring-plan-3.md`

**全体的な評価:**
データ層の基盤整備（リポジトリインターフェース、モックリポジトリ、サービス層）、状態管理とUIロジックの分離（Jotaiのサーバー状態関連Atom廃止、カスタムフックへの抽出）、Suspenseの活用など、非常に高度で適切なリファクタリング計画です。特に、Jotaiのサーバー状態関連Atomの廃止は、React Query の利用を徹底するという点で理にかなっています。

**指摘事項・改善提案:**

*   **フェーズ1: データ層の基盤整備 (アーキテクチャ改善)**
    *   「モックリポジトリの実装」とありますが、担当4の計画では直接SQLite実装への移行が提案されています。この点で担当3と担当4の計画に齟齬があります。
    *   **改善案:** 担当3と担当4で、リポジトリ層の実装方針（モックを挟むか、直接SQLiteか）を統一する必要があります。理想的には、担当4がSQLiteリポジトリを実装し、担当3のサービス層がそれをDIで利用する形が望ましいです。
*   **フェーズ2: 状態管理とUIロジックの分離**
    *   `people.tsx` のロジックを `usePeopleList` フックに抽出する、というタスクは、担当1の `usePeopleScreen.ts` と重複する可能性があります。
    *   **改善案:** 担当1と担当3で、画面レベルのカスタムフックの責務分担を明確にする必要があります。`usePeopleScreen` が画面全体のロジック（データ取得、ナビゲーション、削除など）を担い、`usePeopleList` はその中のリスト表示に関するロジック（フィルタリング、ソートなど）を担う、といった棲み分けが考えられます。

#### **担当4 (Gemini): データ永続化とプロジェクト基盤 (Data & Infrastructure)** - `refactoring-plan-4.md`

**全体的な評価:**
リポジトリパターンの導入、SQLiteへの移行、DIの検討など、データ永続化層のアーキテクチャを大幅に改善する計画であり、非常に適切です。

**指摘事項・改善提案:**

*   **フェーズ2: SQLite実装への移行**
    *   「現在の `database/sqlite-services/` 内のモック実装を、新しく作成したSQLiteリポジトリ実装を利用するように変更する」というタスクは、担当3の「モックリポジトリの実装」と直接的に競合します。
    *   **改善案:** 担当3と連携し、SQLiteリポジトリを直接実装する方針で進めることを明確にする。`database/sqlite-services/` は、リポジトリ層の上に位置するサービス層として、ビジネスロジックを担うように再定義する。
*   **フェーズ3: サービス層のクリーンアップとDIの検討**
    *   DIの検討は非常に重要です。これはテスト容易性だけでなく、将来的なデータベース変更（例: Firebaseへの移行）にも柔軟に対応できる基盤となります。積極的に導入を推奨します。

---

### **完全なリファクタリング TODO リスト (`total-refactoring-plan-1.md`)**

上記のレビューを踏まえ、各担当の計画を統合・調整し、`refactoring-rule.md` に従って完全なリファクタリング TODO リストを作成します。重複するタスクや競合するタスクは調整し、依存関係を考慮したフェーズ分けを行います。

**重さの定義:**
*   **小:** 1〜2ファイル程度の修正。影響範囲が限定的。
*   **中:** 複数ファイルにまたがる修正。コンポーネントの統合やロジックの分離を含む。
*   **大:** アーキテクチャの根幹に関わる変更。広範囲な影響が想定され、慎重な作業が必要。

---

### **フェーズ0: 全体アーキテクチャの合意と準備 (共通)**

*   [ ] **タスク:** Atomic Design のディレクトリ構造 (`components/atoms`, `components/molecules`, `components/organisms`, `components/features`) を作成し、既存ファイルを移動する。
    *   **重さ:** 大
*   [ ] **タスク:** `components/screens` ディレクトリを完全に廃止する。
    *   **重さ:** 小
*   [ ] **タスク:** `repositories/interfaces/` ディレクトリ内に、各エンティティ（Person, Event, Tag）に対応するリポジトリインターフェースを定義する。
    *   **重さ:** 中
*   [ ] **タスク:** `database/sqlite-types.ts` の型定義をレビューし、リポジトリ層で利用しやすいように調整する。`UserProfile` 型が `Person` 型を拡張するように修正する。
    *   **重さ:** 小
*   [ ] **タスク:** `QueryClient` のインスタンスをコンポーネント外で生成し、シングルトン化する。
    *   **重さ:** 小

### **フェーズ1: データ永続化層の構築 (担当4 主導)**

*   [ ] **タスク:** `repositories/implementations/sqlite/` ディレクトリを新規作成し、SQLiteデータベースとの実際のやり取りを担う具体的なリポジトリ実装クラスを定義する。
    *   **詳細:** `SQLitePersonRepository.ts`, `SQLiteEventRepository.ts`, `SQLiteTagRepository.ts`。各クラスは対応するインターフェースを実装する。
    *   **重さ:** 大
*   [ ] **タスク:** データベース初期化（スキーマ作成）およびマイグレーションの仕組みを導入する。
    *   **詳細:** `database/init.ts` や `database/migrations/` ディレクトリを作成し、アプリ起動時にデータベースの準備を行うロジックを実装する。
    *   **重さ:** 大
*   [ ] **タスク:** `database/sqlite-services/` を、新しく作成したSQLiteリポジトリ実装を利用するサービス層として再定義する。
    *   **詳細:** 各サービスは、対応するリポジトリインターフェースのインスタンスをDIで受け取るように修正し、直接データベース操作を行わないようにする。
    *   **重さ:** 大
*   [ ] **タスク:** `database/sqlite-services/index.ts` のエクスポートエイリアスをレビューし、よりシンプルで分かりやすい命名規則に統一する。
    *   **重さ:** 小

### **フェーズ2: 共通UIコンポーネントの整理と汎用化 (担当2 主導)**

*   [ ] **タスク:** `ThemedText.tsx`, `ThemedView.tsx` を `components/atoms/` に移動する。
    *   **重さ:** 小
*   [ ] **タスク:** `FormInput.tsx` を `components/atoms/FormInput.tsx` に移動し、テーマカラーのハードコード（エラーカラー等）を解消する。
    *   **重さ:** 小
*   [ ] **タスク:** `TagChip.tsx` を `components/atoms/TagChip.tsx` に移動する。
    *   **重さ:** 小
*   [ ] **タスク:** `IconSymbol` 関連ファイルを `components/atoms/IconSymbol/` ディレクトリにまとめ、`index.tsx`, `index.ios.tsx` として配置する。
    *   **重さ:** 小
*   [ ] **タスク:** `TabBarBackground` 関連ファイルを `components/molecules/TabBarBackground/` にまとめ、`index.tsx`, `index.ios.tsx` として配置する。
    *   **重さ:** 小
*   [ ] **タスク:** `SwipeablePersonCard.tsx` を削除し、`SwipeableCard.tsx` に機能を統合・汎用化する。
    *   **詳細:** `person` prop を汎用的な `item` prop に変更し、Jotaiへの依存を疎結合にする。
    *   **重さ:** 中
*   [ ] **タスク:** 汎用化した `SwipeableCard.tsx` と `SwipeableCardList.tsx` を `components/organisms/` に配置する。
    *   **重さ:** 中

### **フェーズ3: フォーム関連コンポーネントの刷新とロジック分離 (担当2 & 担当3 連携)**

*   [ ] **タスク:** `TagInput`, `TagInputWithSuggestions`, `TagSelector` を廃止し、責務を統合した `components/molecules/TagInputField.tsx` を新規作成する。
    *   **詳細:** 新規タグ入力、サジェスト、既存タグ選択をすべて担い、`value`は`string[]`で扱う。
    *   **重さ:** 大
*   [ ] **タスク:** `DateTimePicker` のロジックをカプセル化した `components/molecules/DateField.tsx` を新規作成する。
    *   **重さ:** 中
*   [ ] **タスク:** `PersonRegistrationForm.tsx` を削除し、ロジックを `PersonForm.tsx` に統合する。
    *   **重さ:** 中
*   [ ] **タスク:** `PersonForm.tsx` からビジネスロジックを完全に分離し、`components/organisms/PersonForm.tsx` として配置する。
    *   **重さ:** 大
*   [ ] **タスク:** `EventForm.tsx` からビジネスロジックを完全に分離し、`components/organisms/EventForm.tsx` として配置する。
    *   **重さ:** 大
*   [ ] **タスク:** `PersonFormScreen` が持っていたデータ取得・送信・状態管理ロジックを抽出し、`hooks/usePersonForm.ts` を新規作成する。
    *   **重さ:** 大
*   [ ] **タスク:** `EventFormScreen` が持っていたロジックを抽出し、`hooks/useEventForm.ts` を新規作成する。
    *   **重さ:** 大
*   [ ] **タスク:** タグ関連のデータ取得・作成ロジックを `hooks/useTags.ts` として新規作成する。
    *   **重さ:** 中

### **フェーズ4: 画面ロジックのカスタムフック化とUIの切り出し (担当1 & 担当3 連携)**

*   [ ] **タスク:** `hooks/usePeopleScreen.ts` を新規作成し、`app/(tabs)/people.tsx` のデータ取得(`useQuery`)、状態管理、画面遷移、削除処理など、全てのビジネスロジックをこのフックに集約する。
    *   **重さ:** 大
*   [ ] **タスク:** `app/(tabs)/people.tsx` を、`usePeopleScreen` フックを呼び出し、返された状態とハンドラーをビューに渡すだけの責務に限定する。
    *   **重さ:** 中
*   [ ] **タスク:** 人物リストのUI部分を `components/features/people/PeopleList.tsx` として新規に切り出す。
    *   **重さ:** 中
*   [ ] **タスク:** `hooks/usePersonDetail.ts` を新規作成し、`app/person-detail.tsx` のID取得(`useLocalSearchParams`)、データ取得(`useQuery`)、削除処理(`usePersonMutations`)、確認アラート表示などのロジックをすべて集約する。
    *   **重さ:** 大
*   [ ] **タスク:** `app/person-detail.tsx` を、`usePersonDetail` フックを利用する形に書き換える。
    *   **重さ:** 中
*   [ ] **タスク:** 人物詳細カードのUIを `components/features/person/PersonDetailCard.tsx` として新規に切り出す。
    *   **重さ:** 中
*   [ ] **タスク:** `hooks/useEventsScreen.ts` を新規作成し、`app/(tabs)/events.tsx` のデータ取得や画面遷移ロジックを統合する。
    *   **重さ:** 中
*   [ ] **タスク:** `app/(tabs)/events.tsx` を、`useEventsScreen` フックを利用する形に書き換える。
    *   **重さ:** 中
*   [ ] **タスク:** イベントリストのUI部分を `components/features/events/EventList.tsx` として切り出す。
    *   **重さ:** 小
*   [ ] **タスク:** `app/person-edit.tsx` を削除し、`app/person-register.tsx` が `usePersonForm` と `PersonForm` を直接利用し、`id` パラメータの有無で編集モードと新規登録モードを切り替えるように修正する。
    *   **重さ:** 中
*   [ ] **タスク:** `app/event-register.tsx` も同様に、`useEventForm` と `EventForm` を直接利用し、`id` の有無でモードを切り替えられる構造に統一する。
    *   **重さ:** 小

### **フェーズ5: 共通処理と基盤の最終調整 (共通)**

*   [ ] **タスク:** ローディング、エラー、空状態の表示を、それぞれ `components/common/LoadingIndicator.tsx`, `components/common/ErrorState.tsx`, `components/common/EmptyState.tsx` として共通コンポーネントに分離する。
    *   **重さ:** 小
*   [ ] **タスク:** `StyleSheet` の定義を、関連するコンポーネントのディレクトリ内に移動する。
    *   **重さ:** 中
*   [ ] **タスク:** `app/_layout.tsx` と `app/(tabs)/_layout.tsx` を精査し、`Stack.Screen` の `options` が冗長になっていないか確認する。共通化できる設定があればまとめる。
    *   **重さ:** 小
*   [ ] **タスク:** `app/+not-found.tsx` のスタイルを `not-found.styles.ts` に分離する。
    *   **重さ:** 小
*   [ ] **タスク:** `constants/Colors.ts` をレビューし、テーマカラーの定義が適切か、拡張性があるかを確認する。
    *   **重さ:** 小
*   [ ] **タスク:** `contexts/ThemeContext.tsx` をレビューし、テーマ管理のロジックが適切か、`useThemeColor` との連携がスムーズかを確認する。
    *   **重さ:** 小
*   [ ] **タスク:** `package.json` の依存関係をレビューし、不要なパッケージがないか、バージョンが適切かを確認する。
    *   **重さ:** 小
*   [ ] **タスク:** `tsconfig.json` をレビューし、TypeScriptの設定がプロジェクトの要件に合致しているか、厳密性が適切かを確認する。
    *   **重さ:** 小
*   [ ] **タスク:** `jest.config.js`, `jest.setup.js` をレビューし、テスト環境の設定が適切か、モックの管理が効率的かを確認する。
    *   **重さ:** 小
*   [ ] **タスク:** `scripts/reset-project.js` をレビューし、開発環境のリセットスクリプトが意図通りに動作するか、安全かを確認する。
    *   **重さ:** 小
*   [ ] **タスク:** `usePersonMutations` フック内の `onSuccess`/`onError` に、アラート表示や画面遷移などの副作用を完全に集約する。
    *   **重さ:** 中
*   [ ] **タスク:** `app/(tabs)/events.tsx` など、非同期でデータを取得するコンポーネントで、React Queryと `Suspense` を組み合わせたローディング管理を導入する。
    *   **重さ:** 中
