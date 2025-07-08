import React, { useRef, useCallback } from 'react';
import { FlatList, TouchableWithoutFeedback, View, StyleSheet } from 'react-native';
import { useAtom } from 'jotai';
import { SwipeableCard, SwipeableCardRef } from './SwipeableCard';
import { openedMenuIdAtom } from '@/atoms/peopleAtoms';
import type { PersonWithRelations } from '@/database/sqlite-types';

/**
 * FlatListベースのSwipeableカードリスト
 * Jotaiで統一された状態管理を行う
 */

interface SwipeableCardListProps {
  data: PersonWithRelations[];
  onCardPress: (person: PersonWithRelations) => void;
  onDeleteCard: (person: PersonWithRelations) => void;
  onHideCard?: (person: PersonWithRelations) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
}

export const SwipeableCardList: React.FC<SwipeableCardListProps> = ({
  data,
  onCardPress,
  onDeleteCard,
  onHideCard,
  refreshing = false,
  onRefresh,
  ListEmptyComponent,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const cardRefs = useRef<Map<string, SwipeableCardRef>>(new Map());
  const [openedMenuId, setOpenedMenuId] = useAtom(openedMenuIdAtom);

  // 開いているメニューを閉じる関数
  const closeOpenedMenu = useCallback(() => {
    if (openedMenuId) {
      const cardRef = cardRefs.current.get(openedMenuId);
      if (cardRef) {
        cardRef.close();
      }
      setOpenedMenuId(null);
    }
  }, [openedMenuId, setOpenedMenuId]);

  // スクロール開始時にメニューを閉じる
  const handleScrollBeginDrag = useCallback(() => {
    closeOpenedMenu();
  }, [closeOpenedMenu]);

  // 空白部分タップ時にメニューを閉じる
  const handleBackgroundPress = useCallback(() => {
    closeOpenedMenu();
  }, [closeOpenedMenu]);

  // カードのレンダリング
  const renderCard = useCallback(({ item }: { item: PersonWithRelations }) => {
    return (
      <SwipeableCard
        ref={(ref) => {
          if (ref) {
            cardRefs.current.set(item.id, ref);
          } else {
            cardRefs.current.delete(item.id);
          }
        }}
        person={item}
        onPress={() => onCardPress(item)}
        onDelete={() => onDeleteCard(item)}
        onHide={onHideCard ? () => onHideCard(item) : undefined}
      />
    );
  }, [onCardPress, onDeleteCard, onHideCard]);

  // keyExtractor
  const keyExtractor = useCallback((item: PersonWithRelations) => item.id, []);

  // アイテム区切り
  const ItemSeparatorComponent = useCallback(() => <View style={styles.separator} />, []);

  return (
    <TouchableWithoutFeedback onPress={handleBackgroundPress}>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={data}
          renderItem={renderCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.contentContainer}
          ItemSeparatorComponent={ItemSeparatorComponent}
          ListEmptyComponent={ListEmptyComponent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onScrollBeginDrag={handleScrollBeginDrag}
          showsVerticalScrollIndicator={true}
          testID="swipeable-card-list"
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  separator: {
    height: 8,
  },
});