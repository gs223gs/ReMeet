
# リファクタリング計画 TODOリスト - 担当3: `app` と `database`

### **フェーズ1: データ層の基盤整備 (アーキテクチャ改善)**

-   `[ ]` **(重さ: 中)** リポジトリインターフェースの定義 (`repositories/interfaces`)
    -   `IPersonRepository`, `ITagRepository`, `IEventRepository` を作成する。
-   `[ ]` **(重さ: 大)** モックリポジトリの実装 (`repositories/implementations`)
    -   既存の `sqlite-services` のロジックを、上記インターフェースを実装するモックリポジトリ (`MockPersonRepository` 等) に移行する。
-   `[ ]` **(重さ: 中)** サービス層の構築 (`services`)
    -   ビジネスロジックを持つ `PersonService` 等を新設し、リポジトリをDI（依存性注入）で受け取る構造にする。
-   `[ ]` **(重さ: 小)** 型定義のDRY化 (`database/sqlite-types.ts`)
    -   `UserProfile` 型が `Person` 型を拡張 (`extends`) するように修正する。
-   `[ ]` **(重さ: 小)** QueryClientのシングルトン化 (`app/_layout.tsx`)
    -   `QueryClient` のインスタンスをコンポーネント外で生成するように修正する。

### **フェーズ2: 状態管理とUIロジックの分離**

-   `[ ]` **(重さ: 中)** サーバー状態管理の一元化
    -   Jotaiのサーバー状態関連Atom (`peopleAtom`, `peopleLoadingAtom`, `peopleErrorAtom`) を廃止する。
    -   `people.tsx` が `useQuery` から直接データを取得するようにリファクタリングする。
-   `[ ]` **(重さ: 大)** UIロジックのカスタムフックへの抽出
    -   `people.tsx` のロジックを `usePeopleList` フックに抽出する。
    -   `person-detail.tsx` のロジックを `usePersonDetail` フックに抽出する。
    -   画面コンポーネントは、フックから受け取った状態と関数を描画に専念するプレゼンテーショナルコンポーネントにする。
-   `[ ]` **(重さ: 中)** 副作用の集約
    -   `usePersonMutations` フック内の `onSuccess`/`onError` に、アラート表示や画面遷移などの副作用を完全に集約する。

### **フェーズ3: コンポーネント単位の改善**

-   `[ ]` **(重さ: 中)** Suspenseの活用
    -   `app/(tabs)/events.tsx` など、非同期でデータを取得するコンポーネントで、React Queryと `Suspense` を組み合わせたローディング管理を導入する。
