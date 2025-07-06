/**
 * usePersonMutationsフックのテスト
 * AAAパターン（Arrange, Act, Assert）でテストを構成
 */
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { usePersonMutations } from '@/hooks/usePersonMutations';
import { PersonService, TagService } from '@/database/sqlite-services';
import type { PersonWithRelations } from '@/database/sqlite-types';
import { PersonRegistrationFormData } from '@/types/forms';
import { TestProviders } from '../../test-utils/test-utils';

// PersonServiceとTagServiceのモック
jest.mock('@/database/sqlite-services', () => ({
  PersonService: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  TagService: {
    findOrCreateByNames: jest.fn(),
  },
}));

// expo-routerのモック
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

// Alert.alertのモック
jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(jest.fn());

const mockPersonService = PersonService as jest.Mocked<typeof PersonService>;
const mockTagService = TagService as jest.Mocked<typeof TagService>;

describe('usePersonMutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBack.mockClear();
  });

  describe('createPersonMutation', () => {
    it('人物を正常に登録できる', async () => {
      // Arrange: テストデータを準備
      const mockPerson: PersonWithRelations = {
        id: 'person-1',
        name: 'テスト太郎',
        handle: '@test_taro',
        company: 'テスト株式会社',
        position: 'エンジニア',
        description: 'テスト用のユーザーです',
        productName: 'テストアプリ',
        memo: 'テストメモ',
        githubId: 'test-taro',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        tags: [{ id: 'tag-1', name: 'React' }],
        events: [],
        relations: [],
      };

      const formData: PersonRegistrationFormData = {
        name: 'テスト太郎',
        handle: '@test_taro',
        company: 'テスト株式会社',
        position: 'エンジニア',
        description: 'テスト用のユーザーです',
        productName: 'テストアプリ',
        memo: 'テストメモ',
        githubId: 'test-taro',
        tags: 'React',
      };

      mockTagService.findOrCreateByNames.mockResolvedValue(['tag-1']);
      mockPersonService.create.mockResolvedValue(mockPerson);
      mockPersonService.findMany.mockResolvedValue([mockPerson]);

      // Act: フックをレンダリング
      const { result } = renderHook(() => usePersonMutations(), {
        wrapper: TestProviders,
      });

      // Assert: 人物登録を実行
      await act(async () => {
        await result.current.createPersonMutation.mutateAsync(formData);
      });

      await waitFor(() => {
        expect(mockPersonService.create).toHaveBeenCalledWith({
          name: 'テスト太郎',
          handle: '@test_taro',
          company: 'テスト株式会社',
          position: 'エンジニア',
          description: 'テスト用のユーザーです',
          productName: 'テストアプリ',
          memo: 'テストメモ',
          githubId: 'test-taro',
          tagIds: ['tag-1'],
        });
        expect(mockPersonService.findMany).toHaveBeenCalled();
      });
    });

    it('タグなしで人物を登録できる', async () => {
      // Arrange: タグなしのテストデータ
      const mockPerson: PersonWithRelations = {
        id: 'person-1',
        name: 'テスト太郎',
        handle: null,
        company: null,
        position: null,
        description: null,
        productName: null,
        memo: null,
        githubId: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        tags: [],
        events: [],
        relations: [],
      };

      const formData: PersonRegistrationFormData = {
        name: 'テスト太郎',
        handle: '',
        company: '',
        position: '',
        description: '',
        productName: '',
        memo: '',
        githubId: '',
        tags: '',
      };

      mockPersonService.create.mockResolvedValue(mockPerson);
      mockPersonService.findMany.mockResolvedValue([mockPerson]);

      // Act: フックをレンダリング
      const { result } = renderHook(() => usePersonMutations(), {
        wrapper: TestProviders,
      });

      // Assert: 人物登録を実行
      await act(async () => {
        await result.current.createPersonMutation.mutateAsync(formData);
      });

      await waitFor(() => {
        expect(mockPersonService.create).toHaveBeenCalledWith({
          name: 'テスト太郎',
          handle: undefined,
          company: undefined,
          position: undefined,
          description: undefined,
          productName: undefined,
          memo: undefined,
          githubId: undefined,
          tagIds: undefined,
        });
      });
    });
  });

  describe('updatePersonMutation', () => {
    it('人物を正常に更新できる', async () => {
      // Arrange: テストデータを準備
      const mockPerson: PersonWithRelations = {
        id: 'person-1',
        name: '更新太郎',
        handle: '@updated_taro',
        company: '更新株式会社',
        position: 'シニアエンジニア',
        description: '更新されたユーザーです',
        productName: '更新アプリ',
        memo: '更新メモ',
        githubId: 'updated-taro',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
        tags: [{ id: 'tag-2', name: 'TypeScript' }],
        events: [],
        relations: [],
      };

      const formData: PersonRegistrationFormData = {
        name: '更新太郎',
        handle: '@updated_taro',
        company: '更新株式会社',
        position: 'シニアエンジニア',
        description: '更新されたユーザーです',
        productName: '更新アプリ',
        memo: '更新メモ',
        githubId: 'updated-taro',
        tags: 'TypeScript',
      };

      mockTagService.findOrCreateByNames.mockResolvedValue(['tag-2']);
      mockPersonService.update.mockResolvedValue(mockPerson);
      mockPersonService.findMany.mockResolvedValue([mockPerson]);

      // Act: フックをレンダリング
      const { result } = renderHook(() => usePersonMutations(), {
        wrapper: TestProviders,
      });

      // Assert: 人物更新を実行
      await act(async () => {
        await result.current.updatePersonMutation.mutateAsync({
          personId: 'person-1',
          data: formData,
        });
      });

      await waitFor(() => {
        expect(mockPersonService.update).toHaveBeenCalledWith({
          id: 'person-1',
          name: '更新太郎',
          handle: '@updated_taro',
          company: '更新株式会社',
          position: 'シニアエンジニア',
          description: '更新されたユーザーです',
          productName: '更新アプリ',
          memo: '更新メモ',
          githubId: 'updated-taro',
          tagIds: ['tag-2'],
        });
        expect(mockPersonService.findMany).toHaveBeenCalled();
      });
    });

    it('タグを空にして人物を更新できる', async () => {
      // Arrange: タグなしの更新データ
      const mockPerson: PersonWithRelations = {
        id: 'person-1',
        name: '更新太郎',
        handle: null,
        company: null,
        position: null,
        description: null,
        productName: null,
        memo: null,
        githubId: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
        tags: [],
        events: [],
        relations: [],
      };

      const formData: PersonRegistrationFormData = {
        name: '更新太郎',
        handle: '',
        company: '',
        position: '',
        description: '',
        productName: '',
        memo: '',
        githubId: '',
        tags: '',
      };

      mockPersonService.update.mockResolvedValue(mockPerson);
      mockPersonService.findMany.mockResolvedValue([mockPerson]);

      // Act: フックをレンダリング
      const { result } = renderHook(() => usePersonMutations(), {
        wrapper: TestProviders,
      });

      // Assert: 人物更新を実行
      await act(async () => {
        await result.current.updatePersonMutation.mutateAsync({
          personId: 'person-1',
          data: formData,
        });
      });

      await waitFor(() => {
        expect(mockPersonService.update).toHaveBeenCalledWith({
          id: 'person-1',
          name: '更新太郎',
          handle: null,
          company: null,
          position: null,
          description: null,
          productName: null,
          memo: null,
          githubId: null,
          tagIds: [],
        });
      });
    });
  });

  describe('refreshPeopleAtom', () => {
    it('Jotaiの人物リストを正常に更新する', async () => {
      // Arrange: テストデータを準備
      const mockPeople: PersonWithRelations[] = [
        {
          id: 'person-1',
          name: 'テスト太郎',
          handle: null,
          company: null,
          position: null,
          description: null,
          productName: null,
          memo: null,
          githubId: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          tags: [],
          events: [],
          relations: [],
        },
      ];

      mockPersonService.findMany.mockResolvedValue(mockPeople);

      // Act: フックをレンダリング
      const { result } = renderHook(() => usePersonMutations(), {
        wrapper: TestProviders,
      });

      // Assert: refreshPeopleAtomを実行
      await act(async () => {
        await result.current.refreshPeopleAtom();
      });

      await waitFor(() => {
        expect(mockPersonService.findMany).toHaveBeenCalled();
      });
    });
  });
});