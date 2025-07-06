import { PersonService } from '../../../database/sqlite-services/PersonService';
import { TagService } from '../../../database/sqlite-services/TagService';
import type { UpdatePersonData } from '../../../database/sqlite-services/PersonService';
import type { PersonWithRelations } from '../../../database/sqlite-types';

describe('PersonService', () => {
  // テスト用のモックデータ
  const mockTestPersons: PersonWithRelations[] = [
    {
      id: 'test-person-1',
      name: 'テスト太郎',
      handle: '@test_taro',
      company: 'テスト会社',
      position: 'エンジニア',
      description: 'テスト用の人物です',
      productName: 'テストプロダクト',
      memo: 'テスト用メモ',
      githubId: 'test-taro',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      tags: [
        { id: 'tag-1', name: 'React' },
        { id: 'tag-2', name: 'TypeScript' },
      ],
      events: [],
      relations: [],
    },
    {
      id: 'test-person-2',
      name: 'テスト花子',
      handle: '@test_hanako',
      company: 'テスト株式会社',
      position: 'デザイナー',
      description: 'UI/UXデザイナー',
      productName: 'デザインツール',
      memo: 'デザイン関連のテストユーザー',
      githubId: null,
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
      tags: [
        { id: 'tag-3', name: 'UI/UX' },
        { id: 'tag-4', name: 'Figma' },
      ],
      events: [],
      relations: [],
    },
  ];

  // 各テストの前にモックデータをセットアップ
  beforeEach(() => {
    PersonService.clearMockData();
    PersonService.addMockData([...mockTestPersons]);
  });

  // 各テストの後にモックデータをクリア
  afterEach(() => {
    PersonService.clearMockData();
  });

  describe('update', () => {
    it('存在する人物の基本情報を更新できる', async () => {
      // Arrange（準備）
      const updateData: UpdatePersonData = {
        id: 'test-person-1',
        name: '更新された太郎',
        handle: '@updated_taro',
        company: '更新された会社',
        position: '更新されたポジション',
        description: '更新された説明',
        productName: '更新されたプロダクト',
        memo: '更新されたメモ',
        githubId: 'updated-taro',
        tagIds: ['tag-1'], // React のみ
      };

      // Act（実行）
      const updatedPerson = await PersonService.update(updateData);

      // Assert（検証）
      expect(updatedPerson).toBeDefined();
      expect(updatedPerson.id).toBe('test-person-1');
      expect(updatedPerson.name).toBe('更新された太郎');
      expect(updatedPerson.handle).toBe('@updated_taro');
      expect(updatedPerson.company).toBe('更新された会社');
      expect(updatedPerson.position).toBe('更新されたポジション');
      expect(updatedPerson.description).toBe('更新された説明');
      expect(updatedPerson.productName).toBe('更新されたプロダクト');
      expect(updatedPerson.memo).toBe('更新されたメモ');
      expect(updatedPerson.githubId).toBe('updated-taro');
      expect(updatedPerson.updatedAt).toBeInstanceOf(Date);
      expect(updatedPerson.updatedAt.getTime()).toBeGreaterThan(
        new Date('2025-01-01').getTime()
      );
    });

    it('タグを適切に更新できる', async () => {
      // Arrange（準備）
      const updateData: UpdatePersonData = {
        id: 'test-person-1',
        name: 'テスト太郎',
        tagIds: ['tag-3', 'tag-4'], // UI/UX, Figma に変更
      };

      // Act（実行）
      const updatedPerson = await PersonService.update(updateData);

      // Assert（検証）
      expect(updatedPerson.tags).toHaveLength(2);
      expect(updatedPerson.tags.map(tag => tag.id)).toEqual(['tag-3', 'tag-4']);
      expect(updatedPerson.tags.map(tag => tag.name)).toEqual(['UI/UX', 'Figma']);
    });

    it('タグを空にできる', async () => {
      // Arrange（準備）
      const updateData: UpdatePersonData = {
        id: 'test-person-1',
        name: 'テスト太郎',
        tagIds: [], // タグを空にする
      };

      // Act（実行）
      const updatedPerson = await PersonService.update(updateData);

      // Assert（検証）
      expect(updatedPerson.tags).toHaveLength(0);
    });

    it('tagIdsが未指定の場合、タグは空になる', async () => {
      // Arrange（準備）
      const updateData: UpdatePersonData = {
        id: 'test-person-1',
        name: 'テスト太郎',
        // tagIdsを指定しない
      };

      // Act（実行）
      const updatedPerson = await PersonService.update(updateData);

      // Assert（検証）
      expect(updatedPerson.tags).toHaveLength(0);
    });

    it('存在しないタグIDを指定した場合、そのタグは無視される', async () => {
      // Arrange（準備）
      const updateData: UpdatePersonData = {
        id: 'test-person-1',
        name: 'テスト太郎',
        tagIds: ['tag-1', 'tag-999', 'tag-2'], // tag-999は存在しない
      };

      // Act（実行）
      const updatedPerson = await PersonService.update(updateData);

      // Assert（検証）
      expect(updatedPerson.tags).toHaveLength(2);
      expect(updatedPerson.tags.map(tag => tag.id)).toEqual(['tag-1', 'tag-2']);
    });

    it('null値のフィールドを適切に処理できる', async () => {
      // Arrange（準備）
      const updateData: UpdatePersonData = {
        id: 'test-person-1',
        name: 'テスト太郎',
        handle: null,
        company: null,
        position: null,
        description: null,
        productName: null,
        memo: null,
        githubId: null,
      };

      // Act（実行）
      const updatedPerson = await PersonService.update(updateData);

      // Assert（検証）
      expect(updatedPerson.name).toBe('テスト太郎');
      expect(updatedPerson.handle).toBeNull();
      expect(updatedPerson.company).toBeNull();
      expect(updatedPerson.position).toBeNull();
      expect(updatedPerson.description).toBeNull();
      expect(updatedPerson.productName).toBeNull();
      expect(updatedPerson.memo).toBeNull();
      expect(updatedPerson.githubId).toBeNull();
    });

    it('名前の前後の空白が自動的にトリムされる', async () => {
      // Arrange（準備）
      const updateData: UpdatePersonData = {
        id: 'test-person-1',
        name: '  更新された太郎  ',
      };

      // Act（実行）
      const updatedPerson = await PersonService.update(updateData);

      // Assert（検証）
      expect(updatedPerson.name).toBe('更新された太郎');
    });

    it('既存のeventsとrelationsが保持される', async () => {
      // Arrange（準備）
      // まず既存のイベントとリレーションを持つ人物を作成
      const personWithData: PersonWithRelations = {
        ...mockTestPersons[0],
        events: [
          { id: 'event-1', name: 'テストイベント', date: new Date('2025-01-01'), location: 'テスト会場' },
        ],
        relations: [
          { id: 'relation-1', sourceId: 'test-person-1', targetId: 'test-person-2', relationType: 'colleague', createdAt: new Date('2025-01-01') },
        ],
      };
      
      PersonService.clearMockData();
      PersonService.addMockData([personWithData]);

      const updateData: UpdatePersonData = {
        id: 'test-person-1',
        name: '更新された太郎',
      };

      // Act（実行）
      const updatedPerson = await PersonService.update(updateData);

      // Assert（検証）
      expect(updatedPerson.events).toHaveLength(1);
      expect(updatedPerson.events[0].name).toBe('テストイベント');
      expect(updatedPerson.relations).toHaveLength(1);
      expect(updatedPerson.relations[0].relationType).toBe('colleague');
    });

    it('存在しない人物IDの場合、エラーが発生する', async () => {
      // Arrange（準備）
      const updateData: UpdatePersonData = {
        id: 'non-existent-person',
        name: 'テスト太郎',
      };

      // Act & Assert（実行と検証）
      await expect(PersonService.update(updateData)).rejects.toThrow(
        '指定された人物が見つかりません'
      );
    });

    it('空の名前の場合、エラーが発生する', async () => {
      // Arrange（準備）
      const updateData: UpdatePersonData = {
        id: 'test-person-1',
        name: '',
      };

      // Act & Assert（実行と検証）
      await expect(PersonService.update(updateData)).rejects.toThrow(
        '名前は必須項目です'
      );
    });

    it('空白のみの名前の場合、エラーが発生する', async () => {
      // Arrange（準備）
      const updateData: UpdatePersonData = {
        id: 'test-person-1',
        name: '   ',
      };

      // Act & Assert（実行と検証）
      await expect(PersonService.update(updateData)).rejects.toThrow(
        '名前は必須項目です'
      );
    });

    it('更新後のデータが実際に保存される', async () => {
      // Arrange（準備）
      const updateData: UpdatePersonData = {
        id: 'test-person-1',
        name: '更新された太郎',
        company: '更新された会社',
      };

      // Act（実行）
      await PersonService.update(updateData);

      // Assert（検証）
      const retrievedPerson = await PersonService.findById('test-person-1');
      expect(retrievedPerson).toBeDefined();
      expect(retrievedPerson?.name).toBe('更新された太郎');
      expect(retrievedPerson?.company).toBe('更新された会社');
    });

    it('複数のタグを同時に更新できる', async () => {
      // Arrange（準備）
      const updateData: UpdatePersonData = {
        id: 'test-person-1',
        name: 'テスト太郎',
        tagIds: ['tag-1', 'tag-2', 'tag-3', 'tag-4'], // 4つのタグを設定
      };

      // Act（実行）
      const updatedPerson = await PersonService.update(updateData);

      // Assert（検証）
      expect(updatedPerson.tags).toHaveLength(4);
      expect(updatedPerson.tags.map(tag => tag.id)).toEqual(['tag-1', 'tag-2', 'tag-3', 'tag-4']);
      expect(updatedPerson.tags.map(tag => tag.name)).toEqual(['React', 'TypeScript', 'UI/UX', 'Figma']);
    });
  });
});