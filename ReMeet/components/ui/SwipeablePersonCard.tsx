import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import type { PersonWithRelations } from '@/database/sqlite-types';

/**
 * スワイプ可能な人物カードコンポーネント
 * 左スワイプで削除ボタンを表示する
 */

interface SwipeablePersonCardProps {
  person: PersonWithRelations;
  onPress: () => void;
  onDelete: () => void;
  onSwipeOpen?: (ref: any) => void;
  onSwipeClose?: () => void;
}

// forwardRefを使用して外部からrefを受け取れるようにする
export const SwipeablePersonCard = React.forwardRef<
  Swipeable,
  SwipeablePersonCardProps
>(({ person, onPress, onDelete, onSwipeOpen, onSwipeClose }, ref) => {
  // 内部refと外部refを統合
  const internalRef = useRef<Swipeable>(null);
  /**
   * 右側に表示される削除アクション
   * 画像の通り赤いボタンで「削除」テキストを表示
   */
  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
        testID={`delete-button-${person.id}`}
      >
        <Text style={styles.deleteButtonText}>削除</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable
      ref={typeof ref === 'object' ? ref : internalRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      onSwipeableOpen={() => {
        const currentRef = typeof ref === 'object' && ref?.current ? ref.current : internalRef.current;
        onSwipeOpen?.(currentRef);
      }}
      onSwipeableClose={onSwipeClose}
      testID={`swipeable-person-card-${person.id}`}
    >
      <TouchableOpacity
        style={styles.personCard}
        onPress={() => {
          // スワイプが開いている場合は閉じる
          if (typeof ref === 'object' && ref?.current) {
            ref.current.close();
          } else {
            internalRef.current?.close();
          }
          // 元のonPressを実行
          onPress();
        }}
        testID={`person-card-${person.id}`}
      >
        <ThemedView style={styles.personCardContent}>
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

          {/* 出会った場所・イベント */}
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
});

// displayNameを設定
SwipeablePersonCard.displayName = 'SwipeablePersonCard';

const styles = StyleSheet.create({
  personCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  personCardContent: {
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
    // marginBottomを削除して最後の要素として扱う
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
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30', // iOS系の赤色
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 12,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});