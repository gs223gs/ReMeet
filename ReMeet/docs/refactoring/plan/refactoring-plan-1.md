### 【改訂版】リファクタリング計画書 (担当1: 画面とナビゲーション)

### 概要

`app/`ディレクトリ内のスクリーンコンポーネントは、UIロジックとビジネスロジックが密結合しており、保守性が低下しています。本計画では、**カスタムフックによるロジックの完全な分離**を主軸に、責務の明確化とコード品質の向上を目指します。

### TODOリスト

#### 1. `app/(tabs)/people.tsx` のリファクタリング (全体: 大)

-   [ ] **(重さ: 大)** `hooks/usePeopleScreen.ts` を新規作成し、データ取得(`useQuery`)、状態管理(`useAtom`)、画面遷移(`useRouter`)、削除処理(`useSwipeDelete`)など、全てのビジネスロジックをこのフックに集約する。
-   [ ] **(重さ: 中)** `app/(tabs)/people.tsx` を、`usePeopleScreen` フックを呼び出し、返された状態とハンドラーをビューに渡すだけの責務に限定する。
-   [ ] **(重さ: 中)** 人物リストのUI部分を `components/features/people/PeopleList.tsx` として新規に切り出す。
-   [ ] **(重さ: 小)** ローディング、エラー、空状態の表示を、それぞれ `components/common/LoadingIndicator.tsx`, `components/common/ErrorState.tsx`, `components/common/EmptyState.tsx` として共通コンポーネントに分離する。
-   [ ] **(重さ: 小)** `StyleSheet` の定義を `app/(tabs)/people.styles.ts` に分離する。

#### 2. `app/person-detail.tsx` のリファクタリング (全体: 大)

-   [ ] **(重さ: 大)** `hooks/usePersonDetail.ts` を新規作成し、ID取得(`useLocalSearchParams`)、データ取得(`useQuery`)、削除処理(`usePersonMutations`)、確認アラート表示などのロジックをすべて集約する。
-   [ ] **(重さ: 中)** `app/person-detail.tsx` を、`usePersonDetail` フックを利用する形に書き換える。
-   [ ] **(重さ: 中)** 人物詳細カードのUIを `components/features/person/PersonDetailCard.tsx` として新規に切り出す。
-   [ ] **(重さ: 小)** `StyleSheet` の定義を `app/person-detail.styles.ts` に分離する。

#### 3. `app/(tabs)/events.tsx` のリファクタリング (全体: 中)

-   [ ] **(重さ: 中)** `hooks/useEventsScreen.ts` を新規作成し、データ取得や画面遷移ロジックを集約する。
-   [ ] **(重さ: 中)** `app/(tabs)/events.tsx` を、`useEventsScreen` フックを利用する形に書き換える。
-   [ ] **(重さ: 小)** イベントリストのUI部分を `components/features/events/EventList.tsx` として切り出す。
-   [ ] **(重さ: 小)** `people.tsx`で作成した共通コンポーネント（`LoadingIndicator`, `ErrorState`, `EmptyState`）を再利用する。
-   [ ] **(重さ: 小)** `StyleSheet` の定義を `app/(tabs)/events.styles.ts` に分離する。

#### 4. 登録・編集画面の統合と簡素化 (全体: 中)

-   [ ] **(重さ: 中)** `app/person-edit.tsx` を削除する。
-   [ ] **(重さ: 中)** `app/person-register.tsx` の責務を、`PersonFormScreen` コンポーネントを呼び出すことに変更し、`id` パラメータの有無で編集モードと新規登録モードを切り替えるように `PersonFormScreen` を修正する。これにより、事実上 `person-register.tsx` が登録と編集のエントリーポイントとなる。
-   [ ] **(重さ: 小)** `app/event-register.tsx` も同様に、将来的な編集機能を見越して、`EventFormScreen` が `id` の有無でモードを切り替えられる構造に統一する。

#### 5. レイアウトとナビゲーションの整理 (全体: 小)

-   [ ] **(重さ: 小)** `app/_layout.tsx` と `app/(tabs)/_layout.tsx` を精査し、`Stack.Screen` の `options` が冗長になっていないか確認する。共通化できる設定があればまとめる。
-   [ ] **(重さ: 小)** `app/+not-found.tsx` のスタイルを `not-found.styles.ts` に分離する。