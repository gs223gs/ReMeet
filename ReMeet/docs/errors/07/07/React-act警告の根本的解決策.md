# React act警告の根本的解決策

## 問題概要

テスト実行時に以下のact警告が頻繁に発生している：

```
An update to [ComponentName] inside a test was not wrapped in act(...)
```

## 原因特定

### 表面的原因
- TanStack Queryの非同期状態更新がテスト中に発生
- Reactの状態更新がactでラップされていない

### 根本的原因（設計問題）
1. **アーキテクチャ設計の問題**
   - useEffect禁止なのにTanStack Queryで過度な非同期処理
   - Jotai + TanStack Queryの二重状態管理で複雑化
   - データフェッチのタイミングが不適切（レンダリング時）

2. **コンポーネント設計の問題**
   - コンポーネントが大きすぎる（100行超え）
   - ビジネスロジックとUI層の分離不足
   - プレゼンテーションとコンテナの責務混在

3. **テスト設計の問題**
   - テストが非同期処理に依存しすぎている
   - モックとリアルデータの境界が曖昧
   - 統合テスト的になりすぎてユニットテストでない

4. **技術選択の問題**
   - TanStack Query + useFocusEffect の組み合わせ
   - リアルタイム更新が不要なのに複雑な状態管理
   - シンプルな状態でも非同期ライブラリ使用

## 対策考案

### 現場での対策基準
- ✅ 現場で行っているやり方か？
- ✅ 中長期的に見たら技術的負債にならないか？

### 対策案比較

#### ❌ 表面的対策（避けるべき）
```javascript
// 1. 個別actラップ - メンテナンス性低下
act(() => {
  render(<Component />);
});

// 2. console.error抑制 - 問題隠蔽
jest.spyOn(console, 'error').mockImplementation(() => {});
```

#### ✅ 根本的対策（推奨）

### A. 設計レベルの改善（最優先）

#### 1. アーキテクチャの簡素化
```typescript
// ❌ 現在：複雑な非同期状態管理
const { data, isLoading } = useQuery(['people'], PersonService.findMany);
const [people, setPeople] = useAtom(peopleAtom);

// ✅ 改善：シンプルな状態管理
const [people, setPeople] = useState<Person[]>([]);
const loadPeople = useCallback(async () => {
  const data = await PersonService.findMany();
  setPeople(data);
}, []);
```

#### 2. コンポーネント分割
```typescript
// ❌ 現在：200行超の巨大コンポーネント
export default function HomeScreen() {
  // データフェッチ + UI + ビジネスロジック
}

// ✅ 改善：責務分離
export default function HomeScreen() {
  return <PeopleContainer />;
}

const PeopleContainer = () => {
  // データフェッチのみ
  return <PeopleList people={people} />;
};

const PeopleList = ({ people }) => {
  // UI表示のみ
};
```

#### 3. テスタブルな設計
```typescript
// ❌ 現在：テストが複雑
it('人物一覧が表示される', async () => {
  // TanStack Query + Jotai + useFocusEffect のモック地獄
});

// ✅ 改善：シンプルなテスト
it('人物一覧が表示される', () => {
  const people = [mockPerson];
  render(<PeopleList people={people} />);
  expect(screen.getByText('山田太郎')).toBeTruthy();
});
```

### B. 技術選択の見直し

#### 現在の技術スタック問題点
- **TanStack Query**: 過度な使用でテストが複雑化
- **Jotai + TanStack Query**: 二重状態管理
- **useFocusEffect**: useEffect禁止なのに副作用多用

#### 改善案
```typescript
// Simple State Management with Custom Hooks
const usePeople = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadPeople = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PersonService.findMany();
      setPeople(data);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { people, loading, loadPeople };
};
```

### 1. テスト環境設定の改善

**jest.setup.js**
```javascript
// React 18対応のact警告を適切に処理
import { configure } from '@testing-library/react-native';

configure({
  // act警告の閾値を調整
  asyncUtilTimeout: 5000,
});

// TanStack Query用のグローバル設定
import { QueryClient } from '@tanstack/react-query';

// テスト用QueryClientの統一設定
global.createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0,
      // act警告を減らすための設定
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

### 2. カスタムレンダラーの改善

**test-utils.tsx**
```typescript
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // 各テストで独立したQueryClient
  const queryClient = global.createTestQueryClient();
  
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </JotaiProvider>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: AllTheProviders, ...options });
};
```

### 3. 適切な非同期テスト手法

```typescript
// ❌ 不適切な方法
it('データが表示される', () => {
  render(<Component />);
  expect(screen.getByText('データ')).toBeTruthy(); // act警告発生
});

// ✅ 適切な方法
it('データが表示される', async () => {
  render(<Component />);
  
  // 非同期操作の完了を適切に待つ
  await waitFor(() => {
    expect(screen.getByText('データ')).toBeTruthy();
  });
});

// ✅ より良い方法 - findByを使用
it('データが表示される', async () => {
  render(<Component />);
  
  // findByは内部でwaitForを使用し、act問題を回避
  const element = await screen.findByText('データ');
  expect(element).toBeTruthy();
});
```

### 4. TanStack Query専用のテストヘルパー

```typescript
// hooks/test-helpers/queryTestUtils.ts
export const waitForQueryToSettle = async () => {
  // TanStack Queryの全ての非同期操作完了を待つ
  await waitFor(() => {
    // QueryClientの状態をチェック
  });
};

export const mockQuerySuccess = <T>(data: T) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
});
```

## 対策実施（段階的リファクタリング計画）

### Phase 1: 設計改善（最優先）
1. **HomeScreen/PeopleScreenの分割**
   - コンテナ・プレゼンテーション分離
   - 100行以下のコンポーネントに分割
   - ビジネスロジックとUI層の分離

2. **カスタムフックによる状態管理簡素化**
   - TanStack Query依存の削減
   - シンプルなuseStateベースの管理
   - 必要最小限の非同期処理

3. **テスタブルな設計への移行**
   - プロップス駆動のコンポーネント
   - 純粋関数的なレンダリング
   - 副作用の最小化

### Phase 2: テスト設計改善
1. **ユニットテストとして分離**
   - 非同期処理に依存しないテスト
   - モックの最小化
   - 単一責務のテスト

2. **プレゼンテーションレイヤーテスト**
   ```typescript
   // プロップスのみをテスト
   render(<PeopleList people={mockPeople} />);
   ```

3. **ビジネスロジックレイヤーテスト**
   ```typescript
   // カスタムフックを個別テスト
   const { result } = renderHook(() => usePeople());
   ```

### Phase 3: 技術的負債解消
1. TanStack Queryの適切な使用範囲決定
2. Jotaiの使用目的明確化
3. 非同期処理パターンの統一

### Phase 4: テスト環境整備（補完）
1. jest.setup.jsの改善
2. test-utils.tsxの改善
3. CI/CDでの品質チェック

## 実装ガイドライン

### 新規テスト作成時のチェックリスト
- [ ] findByを優先的に使用
- [ ] waitForで非同期操作完了を待つ
- [ ] テスト用QueryClientを使用
- [ ] act警告が出ないことを確認

### 禁止事項
- console.error抑制による警告隠蔽
- 無意味なact()ラッピング
- setTimeout等での強制的な待機

## 期待効果

### 短期効果
- act警告の根本的解消
- テスト実行時間の安定化
- CI/CDの成功率向上

### 長期効果
- テストコード品質の向上
- 新規開発者のオンボーディング改善
- 技術的負債の削減

## 結論

act警告は**設計問題のシグナル**である。現場では以下の優先順位で対処する：

### 最重要：設計改善
1. **アーキテクチャの簡素化** - 複雑な非同期状態管理の見直し
2. **コンポーネント分割** - 100行以下、単一責務の徹底
3. **テスタブルな設計** - プロップス駆動、副作用最小化

### 補完：環境整備
- テスト環境設定の最適化
- 適切な非同期テスト手法

**表面的なact対策（actラップ、console.error抑制）は技術的負債を増やすため禁止**

### 期待効果
- act警告の根本的解消
- テストコードの大幅簡素化  
- 新規開発者のオンボーディング改善
- 中長期的な保守性向上

現場での判断基準：「テストが複雑になる設計は見直す」

## 関連ドキュメント
- [React Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [TanStack Query Testing Guide](https://tanstack.com/query/latest/docs/react/guides/testing)
- [React 18 Testing Updates](https://react.dev/blog/2022/03/08/react-18-upgrade-guide#configuring-your-testing-environment)