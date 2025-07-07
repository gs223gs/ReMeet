# リファクタリング計画書

このドキュメントは、ReMeetプロジェクトのリファクタリングに向けた分析作業を4人で分担するための計画書です。
各担当者は、割り当てられたファイル群を精査し、**ファイルごとの特徴**と**リファクタリング候補**を洗い出してください。

## 分担案

プロジェクトを以下の4つのグループ（レイヤー）に分割します。

---

### **担当1: 画面とナビゲーション (Screens & Routing)**

**責務:** ユーザーが直接目にする画面の構造と、画面間の遷移（ナビゲーション）を担当します。Expo Routerの規約に沿ったファイル群が対象です。

*   **対象ディレクトリ:** `app/`
*   **ファイルリスト:**
    *   `/app/_layout.tsx`
    *   `/app/+not-found.tsx`
    *   `/app/event-register.tsx`
    *   `/app/person-detail.tsx`
    *   `/app/person-edit.tsx`
    *   `/app/person-register.tsx`
    *   `/app/register.tsx`
    *   `/app/(tabs)/_layout.tsx`
    *   `/app/(tabs)/events.tsx`
    *   `/app/(tabs)/explore.tsx`
    *   `/app/(tabs)/index.tsx`
    *   `/app/(tabs)/people.tsx`

---

### **担当2: UIコンポーネント (UI Components)**

**責務:** アプリケーション全体で再利用されるUI部品を担当します。フォーム部品から汎用的なカード、アイコンまで、見た目に関するコンポーネント全般が対象です。

*   **対象ディレクトリ:** `components/`
*   **ファイルリスト:**
    *   `/components/HapticTab.tsx`
    *   `/components/ThemedText.tsx`
    *   `/components/ThemedView.tsx`
    *   `/components/forms/EventForm.tsx`
    *   `/components/forms/FormInput.tsx`
    *   `/components/forms/PersonForm.tsx`
    *   `/components/forms/PersonRegistrationForm.tsx`
    *   `/components/forms/TagChip.tsx`
    *   `/components/forms/TagInput.tsx`
    *   `/components/forms/TagInputWithSuggestions.tsx`
    *   `/components/forms/TagSelector.tsx`
    *   `/components/forms/UserRegistrationForm.tsx`
    *   `/components/screens/EventFormScreen.tsx`
    *   `/components/screens/PersonFormScreen.tsx`
    *   `/components/ui/IconSymbol.ios.tsx`
    *   `/components/ui/IconSymbol.tsx`
    *   `/components/ui/SwipeableCard.tsx`
    *   `/components/ui/SwipeableCardList.tsx`
    *   `/components/ui/SwipeablePersonCard.tsx`
    *   `/components/ui/TabBarBackground.ios.tsx`
    *   `/components/ui/TabBarBackground.tsx`

---

### **担当3: アプリケーションロジックと状態 (Business Logic & State)**

**責務:** アプリケーションの動作を制御するビジネスロジック（カスタムフック）と、アプリ全体で共有される状態（Atoms）、およびそれらに関連する型定義を担当します。

*   **対象ディレクトリ:** `hooks/`, `atoms/`, `types/`
*   **ファイルリスト:**
    *   `/hooks/useColorScheme.ts`
    *   `/hooks/useColorScheme.web.ts`
    *   `/hooks/usePersonMutations.ts`
    *   `/hooks/useSwipeDelete.ts`
    *   `/hooks/useThemeColor.ts`
    *   `/atoms/peopleAtoms.ts`
    *   `/types/eventForms.ts`
    *   `/types/forms.ts`

---

### **担当4 (Gemini): データ永続化とプロジェクト基盤 (Data & Infrastructure)**

**責務:** データベースとのやり取り、リポジトリパターン、アプリケーションの基本設定（テーマ、コンテキスト）、およびプロジェクト全体の構成ファイルを担当します。

*   **対象ディレクトリ:** `database/`, `repositories/`, `constants/`, `contexts/`, プロジェクトルート
*   **ファイルリスト:**
    *   `/database/sqlite-services/EventService.ts`
    *   `/database/sqlite-services/index.ts`
    *   `/database/sqlite-services/PersonService.ts`
    *   `/database/sqlite-services/TagService.ts`
    *   `/database/sqlite-types.ts`
    *   `/repositories/implementations/` (空)
    *   `/repositories/interfaces/` (空)
    *   `/constants/Colors.ts`
    *   `/contexts/ThemeContext.tsx`
    *   `/scripts/reset-project.js`
    *   `/__mocks__/@react-native-async-storage/async-storage.js`
    *   `/.env`
    *   `/.gitignore`
    *   `/app.json`
    *   `/babel.config.js`
    *   `/eslint.config.js`
    *   `/jest.config.js`
    *   `/jest.setup.js`
    *   `/package-lock.json`
    *   `/package.json`
    *   `/tsconfig.json`

