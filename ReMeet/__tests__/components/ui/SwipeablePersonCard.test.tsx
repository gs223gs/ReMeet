import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { SwipeablePersonCard } from '@/components/ui/SwipeablePersonCard';
import { render } from '@/test-utils/test-utils';
import type { PersonWithRelations } from '@/database/sqlite-types';

/**
 * SwipeablePersonCardコンポーネントのテスト
 */

// テスト用のモックデータ
const mockPerson: PersonWithRelations = {
  id: 'test-person-1',
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
  tags: [
    { id: 'tag-1', name: 'React' },
    { id: 'tag-2', name: 'TypeScript' },
  ],
  events: [
    { 
      id: 'event-1', 
      name: 'React Conference 2024', 
      date: new Date('2024-12-01'), 
      location: '東京国際フォーラム' 
    },
  ],
  relations: [],
};

describe('SwipeablePersonCard', () => {
  const mockOnPress = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本表示', () => {
    it('人物の基本情報が正しく表示される', () => {
      const { getByText } = render(
        <SwipeablePersonCard
          person={mockPerson}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      // 名前が表示されている
      expect(getByText('テスト太郎')).toBeTruthy();
      
      // タグが表示されている
      expect(getByText('React')).toBeTruthy();
      expect(getByText('TypeScript')).toBeTruthy();
      
      // イベントが表示されている
      expect(getByText('📅 React Conference 2024')).toBeTruthy();
      expect(getByText('📍 東京国際フォーラム')).toBeTruthy();
    });

    it('タグがない場合でも正しく表示される', () => {
      const personWithoutTags = { ...mockPerson, tags: [] };
      
      const { getByText, queryByText } = render(
        <SwipeablePersonCard
          person={personWithoutTags}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      // 名前は表示される
      expect(getByText('テスト太郎')).toBeTruthy();
      
      // タグは表示されない
      expect(queryByText('React')).toBeNull();
      expect(queryByText('TypeScript')).toBeNull();
    });

    it('イベントがない場合でも正しく表示される', () => {
      const personWithoutEvents = { ...mockPerson, events: [] };
      
      const { getByText, queryByText } = render(
        <SwipeablePersonCard
          person={personWithoutEvents}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      // 名前は表示される
      expect(getByText('テスト太郎')).toBeTruthy();
      
      // イベントは表示されない
      expect(queryByText('📅 React Conference 2024')).toBeNull();
    });
  });

  describe('ユーザーインタラクション', () => {
    it('カードタップ時にonPressが呼ばれる', () => {
      const { getByTestId } = render(
        <SwipeablePersonCard
          person={mockPerson}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      const personCard = getByTestId(`person-card-${mockPerson.id}`);
      fireEvent.press(personCard);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('適切なtestIDが設定されている', () => {
      const { getByTestId } = render(
        <SwipeablePersonCard
          person={mockPerson}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      // SwipeableコンポーネントのtestID
      expect(getByTestId(`swipeable-person-card-${mockPerson.id}`)).toBeTruthy();
      
      // PersonCardのtestID
      expect(getByTestId(`person-card-${mockPerson.id}`)).toBeTruthy();
    });
  });

  describe('最小限のデータでの表示', () => {
    it('名前のみの人物データでも正しく表示される', () => {
      const minimalPerson: PersonWithRelations = {
        id: 'minimal-person',
        name: '最小データ',
        handle: null,
        company: null,
        position: null,
        description: null,
        productName: null,
        memo: null,
        githubId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        events: [],
        relations: [],
      };

      const { getByText } = render(
        <SwipeablePersonCard
          person={minimalPerson}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      // 名前のみ表示される
      expect(getByText('最小データ')).toBeTruthy();
    });
  });
});