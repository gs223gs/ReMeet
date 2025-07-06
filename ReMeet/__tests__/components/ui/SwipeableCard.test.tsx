import React from 'react';
import { fireEvent, act } from '@testing-library/react-native';
import { SwipeableCard } from '@/components/ui/SwipeableCard';
import { render } from '@/test-utils/test-utils';
import type { PersonWithRelations } from '@/database/sqlite-types';
import { useSetAtom } from 'jotai';
import { openedMenuIdAtom } from '@/atoms/peopleAtoms';

/**
 * SwipeableCardコンポーネントのテスト
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

describe('SwipeableCard', () => {
  const mockOnPress = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnHide = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本表示', () => {
    it('人物の基本情報が正しく表示される', () => {
      const { getByText } = render(
        <SwipeableCard
          person={mockPerson}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('テスト太郎')).toBeTruthy();
      expect(getByText('React')).toBeTruthy();
      expect(getByText('TypeScript')).toBeTruthy();
      expect(getByText('📅 React Conference 2024')).toBeTruthy();
      expect(getByText('📍 東京国際フォーラム')).toBeTruthy();
    });

    it('タグがない場合でも正しく表示される', () => {
      const personWithoutTags = { ...mockPerson, tags: [] };
      
      const { getByText, queryByText } = render(
        <SwipeableCard
          person={personWithoutTags}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('テスト太郎')).toBeTruthy();
      expect(queryByText('React')).toBeNull();
      expect(queryByText('TypeScript')).toBeNull();
    });

    it('イベントがない場合でも正しく表示される', () => {
      const personWithoutEvents = { ...mockPerson, events: [] };
      
      const { getByText, queryByText } = render(
        <SwipeableCard
          person={personWithoutEvents}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('テスト太郎')).toBeTruthy();
      expect(queryByText('📅 React Conference 2024')).toBeNull();
    });
  });

  describe('ユーザーインタラクション', () => {
    it('カードタップ時にonPressが呼ばれる', () => {
      const { getByTestId } = render(
        <SwipeableCard
          person={mockPerson}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      const card = getByTestId(`card-${mockPerson.id}`);
      fireEvent.press(card);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('適切なtestIDが設定されている', () => {
      const { getByTestId } = render(
        <SwipeableCard
          person={mockPerson}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      expect(getByTestId(`swipeable-card-${mockPerson.id}`)).toBeTruthy();
      expect(getByTestId(`card-${mockPerson.id}`)).toBeTruthy();
      expect(getByTestId(`delete-button-${mockPerson.id}`)).toBeTruthy();
    });

    it('onHideが提供された場合は非表示ボタンが表示される', () => {
      const { getByTestId } = render(
        <SwipeableCard
          person={mockPerson}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
          onHide={mockOnHide}
        />
      );

      expect(getByTestId(`hide-button-${mockPerson.id}`)).toBeTruthy();
    });

    it('onHideが提供されない場合は非表示ボタンが表示されない', () => {
      const { queryByTestId } = render(
        <SwipeableCard
          person={mockPerson}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      expect(queryByTestId(`hide-button-${mockPerson.id}`)).toBeNull();
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
        <SwipeableCard
          person={minimalPerson}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('最小データ')).toBeTruthy();
    });
  });

  describe('Jotaiの状態管理', () => {
    it('削除ボタンが押されたときにonDeleteが呼ばれる', () => {
      const { getByTestId } = render(
        <SwipeableCard
          person={mockPerson}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = getByTestId(`delete-button-${mockPerson.id}`);
      fireEvent.press(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('非表示ボタンが押されたときにonHideが呼ばれる', () => {
      const { getByTestId } = render(
        <SwipeableCard
          person={mockPerson}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
          onHide={mockOnHide}
        />
      );

      const hideButton = getByTestId(`hide-button-${mockPerson.id}`);
      fireEvent.press(hideButton);

      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
  });
});