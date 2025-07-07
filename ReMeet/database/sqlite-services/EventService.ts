/**
 * イベント管理サービス（モック実装）
 * 新しいDB仕様に基づいた実装
 * 実際のSQLiteデータベースの代わりにメモリ内ストレージを使用
 */
import type { Event, PersonEvent } from '../sqlite-types';

/**
 * イベント登録用のデータ型
 */
export interface CreateEventData {
  name: string;
  date?: Date | null;
  location?: string | null;
}

/**
 * イベント更新用のデータ型
 */
export interface UpdateEventData {
  id: string;
  name: string;
  date?: Date | null;
  location?: string | null;
}

/**
 * イベント検索用のフィルター
 */
export interface EventSearchFilter {
  name?: string;
  location?: string;
}

// メモリ内ストレージ（実際の実装ではSQLiteを使用）
let mockEvents: Event[] = [
  {
    id: 'event-1',
    name: 'React Conference 2024',
    date: new Date('2024-12-01'),
    location: '東京国際フォーラム',
  },
  {
    id: 'event-2',
    name: 'Design Thinking Workshop',
    date: new Date('2024-11-15'),
    location: 'WeWork渋谷',
  },
  {
    id: 'event-3',
    name: 'AI/ML勉強会',
    date: new Date('2024-12-20'),
    location: 'オンライン',
  },
];

// 人物とイベントの関連データ（PersonEventの模擬）
let mockPersonEvents: PersonEvent[] = [
  { personId: 'person-1', eventId: 'event-1' },
  { personId: 'person-2', eventId: 'event-2' },
  { personId: 'person-3', eventId: 'event-3' },
];

let idCounter = 4;

/**
 * IDを生成する
 */
function generateId(): string {
  return `event-${idCounter++}`;
}

/**
 * イベントを登録する
 * @param data 登録するイベントのデータ
 * @returns 登録されたイベントデータ
 */
export async function create(data: CreateEventData): Promise<Event> {
  if (!data.name || data.name.trim() === '') {
    throw new Error('イベント名は必須項目です');
  }

  const trimmedName = data.name.trim();

  // 既存のイベント名と重複チェック（同じ名前・日付のイベントは作成不可）
  const existingEvent = mockEvents.find(event => 
    event.name.toLowerCase() === trimmedName.toLowerCase() &&
    event.date?.getTime() === data.date?.getTime()
  );
  
  if (existingEvent) {
    throw new Error(`同じ名前・日付のイベント「${trimmedName}」は既に存在します`);
  }

  const newEvent: Event = {
    id: generateId(),
    name: trimmedName,
    date: data.date || null,
    location: data.location?.trim() || null,
  };

  mockEvents.push(newEvent);
  return newEvent;
}

/**
 * イベントをIDで取得する
 * @param id イベントのID
 * @returns イベントデータ
 */
export async function findById(id: string): Promise<Event | null> {
  const event = mockEvents.find(e => e.id === id);
  return event || null;
}

/**
 * イベント一覧を取得する
 * @param filter 検索フィルター
 * @returns イベントデータの配列
 */
export async function findMany(filter?: EventSearchFilter): Promise<Event[]> {
  let filteredEvents = [...mockEvents];

  if (filter?.name) {
    filteredEvents = filteredEvents.filter(event =>
      event.name.toLowerCase().includes(filter.name!.toLowerCase())
    );
  }

  if (filter?.location) {
    filteredEvents = filteredEvents.filter(event =>
      event.location?.toLowerCase().includes(filter.location!.toLowerCase())
    );
  }

  // 日付の降順でソート（最新のイベントが上）
  return filteredEvents.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * 全てのイベントを取得する
 * @returns 全てのイベントデータの配列
 */
export async function findAll(): Promise<Event[]> {
  return findMany();
}

/**
 * イベントの総数を取得する
 * @returns イベントの総数
 */
export async function count(): Promise<number> {
  return mockEvents.length;
}

/**
 * イベントを更新する
 * @param data 更新するイベントのデータ
 * @returns 更新されたイベントデータ
 */
export async function update(data: UpdateEventData): Promise<Event> {
  const eventIndex = mockEvents.findIndex(e => e.id === data.id);
  if (eventIndex === -1) {
    throw new Error('指定されたイベントが見つかりません');
  }

  if (!data.name || data.name.trim() === '') {
    throw new Error('イベント名は必須項目です');
  }

  const updatedEvent: Event = {
    id: data.id,
    name: data.name.trim(),
    date: data.date || null,
    location: data.location?.trim() || null,
  };

  mockEvents[eventIndex] = updatedEvent;
  return updatedEvent;
}

/**
 * イベントに参加している人物がいるかチェックする
 * @param eventId イベントのID
 * @returns 参加者がいる場合true
 */
export async function hasParticipants(eventId: string): Promise<boolean> {
  return mockPersonEvents.some(pe => pe.eventId === eventId);
}

/**
 * イベントの参加者数を取得する
 * @param eventId イベントのID
 * @returns 参加者数
 */
export async function getParticipantCount(eventId: string): Promise<number> {
  return mockPersonEvents.filter(pe => pe.eventId === eventId).length;
}

/**
 * イベントを削除する
 * 参加者がいる場合は削除不可
 * @param id 削除するイベントのID
 */
export async function deleteById(id: string): Promise<void> {
  // 参加者がいるかチェック
  const participantExists = await hasParticipants(id);
  if (participantExists) {
    const count = await getParticipantCount(id);
    throw new Error(`このイベントには${count}人の参加者がいるため削除できません`);
  }

  const index = mockEvents.findIndex(e => e.id === id);
  if (index !== -1) {
    mockEvents.splice(index, 1);
  }
}

/**
 * 人物とイベントを関連付ける
 * @param personId 人物のID
 * @param eventId イベントのID
 */
export async function addPersonToEvent(personId: string, eventId: string): Promise<void> {
  // 既に関連付けられているかチェック
  const existingRelation = mockPersonEvents.find(
    pe => pe.personId === personId && pe.eventId === eventId
  );
  
  if (!existingRelation) {
    mockPersonEvents.push({ personId, eventId });
  }
}

/**
 * 人物とイベントの関連付けを削除する
 * @param personId 人物のID
 * @param eventId イベントのID
 */
export async function removePersonFromEvent(personId: string, eventId: string): Promise<void> {
  const index = mockPersonEvents.findIndex(
    pe => pe.personId === personId && pe.eventId === eventId
  );
  
  if (index !== -1) {
    mockPersonEvents.splice(index, 1);
  }
}

/**
 * 人物の参加イベント一覧を取得する
 * @param personId 人物のID
 * @returns イベントデータの配列
 */
export async function findEventsByPersonId(personId: string): Promise<Event[]> {
  const eventIds = mockPersonEvents
    .filter(pe => pe.personId === personId)
    .map(pe => pe.eventId);
  
  const events = await Promise.all(
    eventIds.map(eventId => findById(eventId))
  );
  
  return events.filter((event): event is Event => event !== null);
}

/**
 * モックデータをクリアする（テスト用）
 */
export function clearMockData(): void {
  mockEvents = [];
  mockPersonEvents = [];
  idCounter = 1;
}

/**
 * モックデータを追加する（テスト用）
 */
export function addMockData(events: Event[], personEvents: PersonEvent[] = []): void {
  mockEvents.push(...events);
  mockPersonEvents.push(...personEvents);
}

/**
 * モックデータをリセットする（テスト用）
 */
export function resetMockData(): void {
  mockEvents = [
    {
      id: 'event-1',
      name: 'React Conference 2024',
      date: new Date('2024-12-01'),
      location: '東京国際フォーラム',
    },
    {
      id: 'event-2',
      name: 'Design Thinking Workshop',
      date: new Date('2024-11-15'),
      location: 'WeWork渋谷',
    },
    {
      id: 'event-3',
      name: 'AI/ML勉強会',
      date: new Date('2024-12-20'),
      location: 'オンライン',
    },
  ];
  
  mockPersonEvents = [
    { personId: 'person-1', eventId: 'event-1' },
    { personId: 'person-2', eventId: 'event-2' },
    { personId: 'person-3', eventId: 'event-3' },
  ];
  
  idCounter = 4;
}

/**
 * EventServiceのエクスポート（互換性のため）
 */
export const EventService = {
  create,
  findById,
  findMany,
  findAll,
  count,
  update,
  delete: deleteById,
  hasParticipants,
  getParticipantCount,
  addPersonToEvent,
  removePersonFromEvent,
  findEventsByPersonId,
  clearMockData,
  addMockData,
  resetMockData,
};