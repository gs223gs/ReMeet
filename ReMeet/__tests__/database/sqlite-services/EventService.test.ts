import { 
  EventService, 
  create, 
  findById, 
  findMany, 
  findAll,
  update,
  deleteById,
  hasParticipants,
  getParticipantCount,
  addPersonToEvent,
  removePersonFromEvent,
  findEventsByPersonId,
  clearMockData,
  resetMockData
} from '@/database/sqlite-services/EventService';
import type { Event } from '@/database/sqlite-types';

// テスト用のモックデータ
const mockEventData: Omit<Event, 'id'> = {
  name: 'テストイベント',
  date: new Date('2024-12-01'),
  location: 'テスト会場',
};

describe('EventService', () => {
  beforeEach(() => {
    clearMockData();
    resetMockData();
  });

  describe('create', () => {
    it('新しいイベントを作成できる', async () => {
      const event = await create(mockEventData);
      
      expect(event).toMatchObject({
        id: expect.any(String),
        name: mockEventData.name,
        date: mockEventData.date,
        location: mockEventData.location,
      });
    });

    it('イベント名が空の場合エラーを投げる', async () => {
      await expect(create({ ...mockEventData, name: '' })).rejects.toThrow(
        'イベント名は必須項目です'
      );
    });

    it('イベント名がホワイトスペースのみの場合エラーを投げる', async () => {
      await expect(create({ ...mockEventData, name: '   ' })).rejects.toThrow(
        'イベント名は必須項目です'
      );
    });

    it('同じ名前・日付のイベントは作成できない', async () => {
      await create(mockEventData);
      
      await expect(create(mockEventData)).rejects.toThrow(
        '同じ名前・日付のイベント「テストイベント」は既に存在します'
      );
    });
  });

  describe('findById', () => {
    it('IDでイベントを取得できる', async () => {
      const createdEvent = await create(mockEventData);
      const foundEvent = await findById(createdEvent.id);
      
      expect(foundEvent).toEqual(createdEvent);
    });

    it('存在しないIDの場合nullを返す', async () => {
      const event = await findById('non-existent-id');
      
      expect(event).toBeNull();
    });
  });

  describe('findMany', () => {
    it('フィルターなしで全イベントを取得できる', async () => {
      const events = await findMany();
      
      expect(events).toHaveLength(3); // 初期データ3件
    });

    it('名前でフィルタリングできる', async () => {
      const events = await findMany({ name: 'React' });
      
      expect(events).toHaveLength(1);
      expect(events[0].name).toBe('React Conference 2024');
    });

    it('場所でフィルタリングできる', async () => {
      const events = await findMany({ location: 'オンライン' });
      
      expect(events).toHaveLength(1);
      expect(events[0].location).toBe('オンライン');
    });

    it('日付の降順でソートされる', async () => {
      const events = await findMany();
      
      const dates = events.map(e => e.date?.getTime() || 0);
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });
  });

  describe('update', () => {
    it('イベントを更新できる', async () => {
      const createdEvent = await create(mockEventData);
      const updatedData = {
        id: createdEvent.id,
        name: '更新されたイベント',
        date: new Date('2024-12-15'),
        location: '更新された会場',
      };
      
      const updatedEvent = await update(updatedData);
      
      expect(updatedEvent).toEqual(updatedData);
    });

    it('存在しないイベントの更新はエラーを投げる', async () => {
      await expect(update({
        id: 'non-existent-id',
        name: 'テスト',
        date: null,
        location: null,
      })).rejects.toThrow('指定されたイベントが見つかりません');
    });

    it('イベント名が空の場合エラーを投げる', async () => {
      const createdEvent = await create(mockEventData);
      
      await expect(update({
        id: createdEvent.id,
        name: '',
        date: null,
        location: null,
      })).rejects.toThrow('イベント名は必須項目です');
    });
  });

  describe('deleteById', () => {
    it('参加者がいないイベントは削除できる', async () => {
      clearMockData();
      const event = await create(mockEventData);
      
      await deleteById(event.id);
      
      const foundEvent = await findById(event.id);
      expect(foundEvent).toBeNull();
    });

    it('参加者がいるイベントは削除できない', async () => {
      // 初期データのevent-1には参加者がいる
      await expect(deleteById('event-1')).rejects.toThrow(
        'このイベントには1人の参加者がいるため削除できません'
      );
    });
  });

  describe('hasParticipants', () => {
    it('参加者がいる場合trueを返す', async () => {
      const result = await hasParticipants('event-1');
      expect(result).toBe(true);
    });

    it('参加者がいない場合falseを返す', async () => {
      clearMockData();
      const event = await create(mockEventData);
      
      const result = await hasParticipants(event.id);
      expect(result).toBe(false);
    });
  });

  describe('getParticipantCount', () => {
    it('参加者数を正しく返す', async () => {
      const count = await getParticipantCount('event-1');
      expect(count).toBe(1);
    });

    it('参加者がいない場合0を返す', async () => {
      clearMockData();
      const event = await create(mockEventData);
      
      const count = await getParticipantCount(event.id);
      expect(count).toBe(0);
    });
  });

  describe('addPersonToEvent', () => {
    it('人物をイベントに追加できる', async () => {
      clearMockData();
      const event = await create(mockEventData);
      
      await addPersonToEvent('person-1', event.id);
      
      const hasParticipant = await hasParticipants(event.id);
      expect(hasParticipant).toBe(true);
    });

    it('既に関連付けられている場合は重複しない', async () => {
      clearMockData();
      const event = await create(mockEventData);
      
      await addPersonToEvent('person-1', event.id);
      await addPersonToEvent('person-1', event.id);
      
      const count = await getParticipantCount(event.id);
      expect(count).toBe(1);
    });
  });

  describe('removePersonFromEvent', () => {
    it('人物とイベントの関連を削除できる', async () => {
      await removePersonFromEvent('person-1', 'event-1');
      
      const hasParticipant = await hasParticipants('event-1');
      expect(hasParticipant).toBe(false);
    });
  });

  describe('findEventsByPersonId', () => {
    it('人物が参加しているイベント一覧を取得できる', async () => {
      const events = await findEventsByPersonId('person-1');
      
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('event-1');
    });

    it('参加イベントがない場合空配列を返す', async () => {
      const events = await findEventsByPersonId('person-999');
      
      expect(events).toEqual([]);
    });
  });

  describe('EventService export', () => {
    it('EventServiceオブジェクトが正しくエクスポートされている', () => {
      expect(EventService).toBeDefined();
      expect(EventService.create).toBe(create);
      expect(EventService.findById).toBe(findById);
      expect(EventService.findMany).toBe(findMany);
      expect(EventService.findAll).toBe(findAll);
      expect(EventService.update).toBe(update);
      expect(EventService.delete).toBe(deleteById);
      expect(EventService.hasParticipants).toBe(hasParticipants);
      expect(EventService.getParticipantCount).toBe(getParticipantCount);
    });
  });
});