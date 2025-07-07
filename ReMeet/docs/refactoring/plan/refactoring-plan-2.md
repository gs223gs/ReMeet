### **担当2: UIコンポーネント リファクタリング計画 (TODOリスト)**

この計画は、コンポーネントの責務を明確化し、保守性と再利用性を向上させるためのものです。**Atomic Design**の考え方を導入し、ロジックとビューを分離します。

**重さの定義:**
*   **小:** 1〜2ファイル程度の修正。影響範囲が限定的。
*   **中:** 複数ファイルにまたがる修正。コンポーネントの統合やロジックの分離を含む。
*   **大:** アーキテクチャの根幹に関わる変更。広範囲な影響が想定され、慎重な作業が必要。

---

### **フェーズ1: 基盤整備とAtomsの定義**

*   [ ] **タスク:** `components` ディレクトリを `atoms`, `molecules`, `organisms` に再編成する。
    *   **重さ:** 小
*   [ ] **タスク:** `ThemedText.tsx`, `ThemedView.tsx` を `components/atoms/` に移動する。
    *   **重さ:** 小
*   [ ] **タスク:** `FormInput.tsx` を `components/atoms/FormInput.tsx` に移動し、テーマカラーのハードコード（エラーカラー等）を解消する。
    *   **重さ:** 小
*   [ ] **タスク:** `TagChip.tsx` を `components/atoms/TagChip.tsx` に移動する。
    *   **重さ:** 小
*   [ ] **タスク:** `IconSymbol` 関連ファイルを `components/atoms/IconSymbol/` ディレクトリにまとめ、`index.tsx`, `index.ios.tsx` として配置する。
    *   **重さ:** 小

---

### **フェーズ2: フォーム関連コンポーネントの刷新**

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

---

### **フェーズ3: UIコンポーネントの整理と汎用化**

*   [ ] **タスク:** `SwipeablePersonCard.tsx` を削除し、`SwipeableCard.tsx` に機能を統合・汎用化する。
    *   **詳細:** `person` prop を汎用的な `item` prop に変更し、Jotaiへの依存を疎結合にする。
    *   **重さ:** 中
*   [ ] **タスク:** 汎用化した `SwipeableCard.tsx` と `SwipeableCardList.tsx` を `components/organisms/` に配置する。
    *   **重さ:** 中
*   [ ] **タスク:** `TabBarBackground` 関連ファイルを `components/molecules/TabBarBackground/` にまとめ、`index.tsx`, `index.ios.tsx` として配置する。
    *   **重さ:** 小

---

### **フェーズ4: ビジネスロジックのカスタムフック化**

*   [ ] **タスク:** `components/screens` ディレクトリを完全に廃止する。
    *   **重さ:** 小
*   [ ] **タスク:** `PersonFormScreen` が持っていたデータ取得・送信・状態管理ロジックを抽出し、`hooks/usePersonForm.ts` を新規作成する。
    *   **重さ:** 大
*   [ ] **タスク:** `EventFormScreen` が持っていたロジックを抽出し、`hooks/useEventForm.ts` を新規作成する。
    *   **重さ:** 大
*   [ ] **タスク:** タグ関連のデータ取得・作成ロジックを `hooks/useTags.ts` として新規作成する。
    *   **重さ:** 中