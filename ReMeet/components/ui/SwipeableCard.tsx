import React, { useRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useAtom } from 'jotai';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { openedMenuIdAtom } from '@/atoms/peopleAtoms';
import type { PersonWithRelations } from '@/database/sqlite-types';

/**
 * Swipeableカードコンポーネント
 * 左スワイプで削除・非表示メニューを表示
 */

interface SwipeableCardProps {
  person: PersonWithRelations;
  onPress: () => void;
  onDelete: () => void;
  onHide?: () => void;
}

export interface SwipeableCardRef {
  close: () => void;
}

export const SwipeableCard = React.forwardRef<SwipeableCardRef, SwipeableCardProps>(
  ({ person, onPress, onDelete, onHide }, ref) => {
    const swipeableRef = useRef<Swipeable>(null);
    const [openedMenuId, setOpenedMenuId] = useAtom(openedMenuIdAtom);

    // 外部から呼び出せるメソッドを定義
    useImperativeHandle(ref, () => ({
      close: () => {
        swipeableRef.current?.close();
      },
    }));

    // openedMenuIdの変更を監視して、他のカードが開かれた時にこのカードを閉じる
    useEffect(() => {
      if (openedMenuId !== person.id && openedMenuId !== null) {
        // 他のカードが開かれた場合、このカードのメニューを閉じる
        swipeableRef.current?.close();
      }
    }, [openedMenuId, person.id]);

    // 右側に表示されるアクションメニュー
    const renderRightActions = () => (
      <View style={styles.rightActions}>
        {onHide && (
          <TouchableOpacity
            style={[styles.actionButton, styles.hideButton]}
            onPress={() => {
              onHide();
              swipeableRef.current?.close();
            }}
            testID={`hide-button-${person.id}`}
          >
            <Text style={styles.actionButtonText}>非表示</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            onDelete();
            swipeableRef.current?.close();
          }}
          testID={`delete-button-${person.id}`}
        >
          <Text style={styles.actionButtonText}>削除</Text>
        </TouchableOpacity>
      </View>
    );

    const handleSwipeableOpen = () => {
      // 他のメニューが開いている場合は即座に閉じてから開く
      if (openedMenuId && openedMenuId !== person.id) {
        setOpenedMenuId(null);
      }
      setOpenedMenuId(person.id);
    };

    const handleSwipeableClose = () => {
      if (openedMenuId === person.id) {
        setOpenedMenuId(null);
      }
    };

    const handleCardPress = () => {
      // メニューが開いている場合は閉じる
      if (openedMenuId) {
        setOpenedMenuId(null);
        return;
      }
      // カードの通常の処理
      onPress();
    };

    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        onSwipeableOpen={handleSwipeableOpen}
        onSwipeableClose={handleSwipeableClose}
        testID={`swipeable-card-${person.id}`}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={handleCardPress}
          testID={`card-${person.id}`}
        >
          <ThemedView style={styles.cardContent}>
            {/* 名前 */}
            <View style={styles.nameContainer}>
              <ThemedText type="subtitle" style={styles.name}>
                {person.name}
              </ThemedText>
            </View>

            {/* タグ */}
            {person.tags && person.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {person.tags.map((tag) => (
                  <View key={tag.id} style={styles.tag}>
                    <ThemedText style={styles.tagText}>
                      {tag.name}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}

            {/* イベント */}
            {person.events && person.events.length > 0 && (
              <View style={styles.eventsContainer}>
                {person.events.map((event) => (
                  <View key={event.id} style={styles.eventCard}>
                    <ThemedText style={styles.eventName}>
                      📅 {event.name}
                    </ThemedText>
                    {event.location && (
                      <ThemedText style={styles.eventLocation}>
                        📍 {event.location}
                      </ThemedText>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ThemedView>
        </TouchableOpacity>
      </Swipeable>
    );
  }
);

SwipeableCard.displayName = 'SwipeableCard';

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  cardContent: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  nameContainer: {
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  eventsContainer: {
    // 最後の要素として扱う
  },
  eventCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    opacity: 0.7,
  },
  // 右スワイプアクション
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 12,
    marginLeft: 8,
  },
  hideButton: {
    backgroundColor: '#FF9500', // オレンジ系
  },
  deleteButton: {
    backgroundColor: '#FF3B30', // 赤系
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});