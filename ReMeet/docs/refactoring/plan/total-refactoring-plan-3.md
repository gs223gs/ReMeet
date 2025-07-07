# ReMeet 全体リファクタリング計画書

## 概要

本計画書は、ReMeetプロジェクトのコード品質向上、保守性強化、および将来的な拡張性確保を目的とした全体リファクタリング計画をまとめたものです。現在のコードベースにおけるUIとビジネスロジックの密結合、データアクセス層の抽象化不足、重複コードなどの課題に対し、Atomic Design、リポジトリパターン、カスタムフックなどのモダンなアーキテクチャパターンを導入し、解決を図ります。

## リファクタリングの基本原則

*   **単一責任の原則**: 各モジュール、クラス、関数は単一の責任を持つ。
*   **DRY (Don't Repeat Yourself)**: 重複コードは排除し、共通化可能な箇所を抽出する。
*   **型安全**: TypeScriptの型定義を厳格にし、`any`や`unknown`の多用を避ける。
*   **安定依存性**: 依存関係はインターフェースや抽象化層を通じて管理する。
*   **UIとロジックの分離**: プレゼンテーショナルコンポーネントとコンテナコンポーネントを明確に分ける。

## 詳細計画 (TODOリスト)

### フェーズ0: 初期準備と共通基盤の整備

*   `[ ]` **(重さ: 小)** QueryClientのシングルトン化 (`app/_layout.tsx`)
    *   `QueryClient` のインスタンスをコンポーネント外で生成し、アプリケーション全体でシングルトンとして利用する。
*   `[ ]` **(重さ: 小)** `components` ディレクトリのAtomic Design構造化
    *   `components` ディレクトリを `atoms`, `molecules`, `organisms`, `features` に再編成する。
    *   `ThemedText.tsx`, `ThemedView.tsx` を `components/atoms/` に移動する。
    *   `FormInput.tsx` を `components/atoms/FormInput.tsx` に移動し、テーマカラーのハードコード（エラーカラー等）を解消する。
    *   `TagChip.tsx` を `components/atoms/TagChip.tsx` に移動する。
    *   `IconSymbol` 関連ファイルを `components/atoms/IconSymbol/` ディレクトリにまとめ、`index.tsx`, `index.ios.tsx` として配置する。
*   `[ ]` **(重さ: 小)** 型定義のDRY化 (`database/sqlite-types.ts`)
    *   `UserProfile` 型が `Person` 型を拡張 (`extends`) するように修正する。

### フェーズ1: データ層の抽象化とリポジトリパターン導入

*   `[ ]` **(重さ: 中)** リポジトリインターフェースの定義 (`repositories/interfaces`)
    *   `IPersonRepository.ts`, `IEventRepository.ts`, `ITagRepository.ts` を作成し、CRUD操作のメソッドシグネチャを定義する。
*   `[ ]` **(重さ: 大)** モックリポジトリの実装 (`repositories/implementations/mock`)
    *   既存の `database/sqlite-services` のモックロジックを、上記インターフェースを実装するモックリポジトリ (`MockPersonRepository.ts`, `MockEventRepository.ts`, `MockTagRepository.ts`) に移行する。
*   `[ ]` **(重さ: 大)** SQLiteリポジトリの実装 (`repositories/implementations/sqlite`)
    *   SQLiteデータベースとの実際のやり取りを担う具体的なリポジトリ実装クラス (`SQLitePersonRepository.ts` など) を定義し、対応するインターフェースを実装する。
*   `[ ]` **(重さ: 大)** サービス層の構築とDI (`services`)
    *   ビジネスロジックを持つ `PersonService`, `EventService`, `TagService` を新設し、コンストラクタやDIコンテナ経由で対応するリポジトリインターフェースの実装を受け取る構造にする。
    *   `database/sqlite-services/index.ts` のエクスポートを、新しいサービス層の構造に合わせて調整する。
*   `[ ]` **(重さ: 大)** データベース初期化およびマイグレーションの仕組み導入
    *   `database/init.ts` や `database/migrations/` ディレクトリを作成し、アプリ起動時にデータベースの準備を行うロジックを実装する。

### フェーズ2: UIコンポーネントの刷新と汎用化

*   `[ ]` **(重さ: 大)** `TagInput`, `TagInputWithSuggestions`, `TagSelector` の廃止と統合
    *   責務を統合した `components/molecules/TagInputField.tsx` を新規作成する。新規タグ入力、サジェスト、既存タグ選択をすべて担い、`value`は`string[]`で扱う。
*   `[ ]` **(重さ: 中)** `DateTimePicker` のロジックをカプセル化した `components/molecules/DateField.tsx` を新規作成する。
*   `[ ]` **(重さ: 中)** `PersonRegistrationForm.tsx` を削除し、ロジックを `PersonForm.tsx` に統合する。
*   `[ ]` **(重さ: 大)** `PersonForm.tsx` からビジネスロジックを完全に分離し、`components/organisms/PersonForm.tsx` として配置する。
*   `[ ]` **(重さ: 大)** `EventForm.tsx` からビジネスロジックを完全に分離し、`components/organisms/EventForm.tsx` として配置する。
*   `[ ]` **(重さ: 中)** `SwipeablePersonCard.tsx` を削除し、`SwipeableCard.tsx` に機能を統合・汎用化する。
    *   `person` prop を汎用的な `item` prop に変更し、Jotaiへの依存を疎結合にする。
*   `[ ]` **(重さ: 中)** 汎用化した `SwipeableCard.tsx` と `SwipeableCardList.tsx` を `components/organisms/` に配置する。
*   `[ ]` **(重さ: 小)** `TabBarBackground` 関連ファイルを `components/molecules/TabBarBackground/` にまとめ、`index.tsx`, `index.ios.tsx` として配置する。

### フェーズ3: UIとロジックの分離 (カスタムフック化)

*   `[ ]` **(重さ: 中)** サーバー状態管理の一元化
    *   Jotaiのサーバー状態関連Atom (`peopleAtom`, `peopleLoadingAtom`, `peopleErrorAtom`) を廃止する。
    *   `app/(tabs)/people.tsx` が `useQuery` から直接データを取得するようにリファクタリングする。
*   `[ ]` **(重さ: 大)** `app/(tabs)/people.tsx` のロジックを `hooks/usePeopleScreen.ts` に抽出する。
    *   データ取得(`useQuery`)、状態管理、画面遷移(`useRouter`)、削除処理(`useSwipeDelete`)など、全てのビジネスロジックをこのフックに集約する。
    *   `app/(tabs)/people.tsx` を、`usePeopleScreen` フックを呼び出し、返された状態とハンドラーをビューに渡すだけの責務に限定する。
    *   人物リストのUI部分を `components/features/people/PeopleList.tsx` として新規に切り出す。
    *   ローディング、エラー、空状態の表示を、それぞれ `components/common/LoadingIndicator.tsx`, `components/common/ErrorState.tsx`, `components/common/EmptyState.tsx` として共通コンポーネントに分離する。
    *   `StyleSheet` の定義を `app/(tabs)/people.styles.ts` に分離する。
*   `[ ]` **(重さ: 大)** `app/person-detail.tsx` のロジックを `hooks/usePersonDetailScreen.ts` に抽出する。
    *   ID取得(`useLocalSearchParams`)、データ取得(`useQuery`)、削除処理(`usePersonMutations`)、確認アラート表示などのロジックをすべて集約する。
    *   `app/person-detail.tsx` を、`usePersonDetailScreen` フックを利用する形に書き換える。
    *   人物詳細カードのUIを `components/features/person/PersonDetailCard.tsx` として新規に切り出す。
    *   `StyleSheet` の定義を `app/person-detail.styles.ts` に分離する。
*   `[ ]` **(重さ: 中)** `app/(tabs)/events.tsx` のロジックを `hooks/useEventsScreen.ts` に抽出する。
    *   データ取得や画面遷移ロジックを集約する。
    *   `app/(tabs)/events.tsx` を、`useEventsScreen` フックを利用する形に書き換える。
    *   イベントリストのUI部分を `components/features/events/EventList.tsx` として切り出す。
    *   `people.tsx`で作成した共通コンポーネント（`LoadingIndicator`, `ErrorState`, `EmptyState`）を再利用する。
    *   `StyleSheet` の定義を `app/(tabs)/events.styles.ts` に分離する。
*   `[ ]` **(重さ: 大)** `PersonFormScreen` が持っていたデータ取得・送信・状態管理ロジックを抽出し、`hooks/usePersonForm.ts` を新規作成する。
*   `[ ]` **(重さ: 大)** `EventFormScreen` が持っていたロジックを抽出し、`hooks/useEventForm.ts` を新規作成する。
*   `[ ]` **(重さ: 中)** タグ関連のデータ取得・作成ロジックを `hooks/useTags.ts` として新規作成する。
*   `[ ]` **(重さ: 中)** 登録・編集画面の統合と簡素化
    *   `app/person-edit.tsx` を削除する。
    *   `app/person-register.tsx` の責務を、`PersonFormScreen` コンポーネントを呼び出すことに変更し、`id` パラメータの有無で編集モードと新規登録モードを切り替えるように `PersonFormScreen` を修正する。
    *   `app/event-register.tsx` も同様に、将来的な編集機能を見越して、`EventFormScreen` が `id` の有無でモードを切り替えられる構造に統一する。
*   `[ ]` **(重さ: 中)** 副作用の集約
    *   `usePersonMutations` フック内の `onSuccess`/`onError` に、アラート表示や画面遷移などの副作用を完全に集約する。
*   `[ ]` **(重さ: 小)** `components/screens` ディレクトリを完全に廃止する。
*   `[ ]` **(重さ: 小)** レイアウトとナビゲーションの整理
    *   `app/_layout.tsx` と `app/(tabs)/_layout.tsx` を精査し、`Stack.Screen` の `options` が冗長になっていないか確認する。共通化できる設定があればまとめる。
    *   `app/+not-found.tsx` のスタイルを `not-found.styles.ts` に分離する。

### フェーズ4: プロジェクト基盤のレビューと改善

*   `[ ]` **(重さ: 小)** `constants/Colors.ts` をレビューし、テーマカラーの定義が適切か、拡張性があるかを確認する。
*   `[ ]` **(重さ: 小)** `contexts/ThemeContext.tsx` をレビューし、テーマ管理のロジックが適切か、`useThemeColor` との連携がスムーズかを確認する。
*   `[ ]` **(重さ: 小)** `package.json` の依存関係をレビューし、不要なパッケージがないか、バージョンが適切かを確認する。
*   `[ ]` **(重さ: 小)** `tsconfig.json` をレビューし、TypeScriptの設定がプロジェクトの要件に合致しているか、厳密性が適切かを確認する。
*   `[ ]` **(重さ: 小)** `jest.config.js`, `jest.setup.js` をレビューし、テスト環境の設定が適切か、モックの管理が効率的かを確認する。
*   `[ ]` **(重さ: 小)** `scripts/reset-project.js` をレビューし、開発環境のリセットスクリプトが意図通りに動作するか、安全かを確認する。

## 注意点・リスク

*   **連携とコミュニケーション:** 各フェーズ、特にフェーズ1とフェーズ3は複数の担当者の作業が密接に連携するため、頻繁なコミュニケーションとコードレビューが不可欠です。
*   **段階的な導入:** 一度に全てを変更するのではなく、小さな単位で変更を加え、テストを行いながら進めることでリスクを最小限に抑えます。
*   **テストの徹底:** リファクタリング中は既存のテストが壊れないことを確認し、必要に応じて新しいテストを追加します。特に、データ層の変更は広範囲に影響するため、単体テストと結合テストを徹底します。
*   **パフォーマンス:** リファクタリング後のアプリケーションのパフォーマンスを継続的に監視し、問題があれば最適化を行います。
*   **学習コスト:** 新しいアーキテクチャパターン（リポジトリパターン、DIなど）の導入には、チームメンバーの学習コストが発生する可能性があります。必要に応じて勉強会などを開催し、知識共有を促進します。
