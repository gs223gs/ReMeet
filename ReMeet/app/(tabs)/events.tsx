import React, { useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { EventService } from '@/database/sqlite-services';
import type { Event } from '@/database/sqlite-types';

export default function EventsScreen() {
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'tint');
  const buttonTextColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  // イベント一覧を取得
  const { data: events = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      return await EventService.findAll();
    },
  });

  // イベント登録画面への遷移
  const handleAddEvent = () => {
    router.push('/event-register');
  };

  // リフレッシュ処理
  const onRefresh = () => {
    refetch();
  };

  // イベントカードのレンダリング
  const renderEventCard = useCallback(({ item }: { item: Event }) => {
    return (
      <ThemedView style={styles.eventCard}>
        <ThemedText type="defaultSemiBold" style={styles.eventName}>
          {item.name}
        </ThemedText>
        {item.date && (
          <ThemedText style={styles.eventDate}>
            📅 {item.date.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short'
            })}
          </ThemedText>
        )}
        {item.location && (
          <ThemedText style={styles.eventLocation}>
            📍 {item.location}
          </ThemedText>
        )}
      </ThemedView>
    );
  }, []);

  // keyExtractor
  const keyExtractor = useCallback((item: Event) => item.id, []);

  // アイテム区切り
  const ItemSeparatorComponent = useCallback(() => <View style={styles.separator} />, []);

  // 空の状態表示コンポーネント
  const EmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>
        まだイベントが登録されていません
      </ThemedText>
      <ThemedText style={styles.emptySubtext}>
        「+」ボタンから新しいイベントを追加してください
      </ThemedText>
    </ThemedView>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <ThemedText type="title">イベント</ThemedText>
              <ThemedText style={styles.subtitle}>
                読み込み中...
              </ThemedText>
            </View>
          </View>
        </ThemedView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>
            読み込み中...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <ThemedText type="title">イベント</ThemedText>
              <ThemedText style={styles.subtitle}>
                エラーが発生しました
              </ThemedText>
            </View>
          </View>
        </ThemedView>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            イベントの読み込みに失敗しました
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* ヘッダーと追加ボタン */}
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <ThemedText type="title">イベント</ThemedText>
            <ThemedText style={styles.subtitle}>
              {events.length}件のイベントが登録されています
            </ThemedText>
          </View>
          <Pressable
            style={[
              styles.addButton, 
              { 
                backgroundColor: primaryColor,
                borderColor: borderColor
              }
            ]}
            onPress={handleAddEvent}
            testID="add-event-button"
          >
            <ThemedText style={[styles.addButtonText, { color: buttonTextColor }]}>+</ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      {/* イベントリスト */}
      <View style={styles.listContainer}>
        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.contentContainer}
          ItemSeparatorComponent={ItemSeparatorComponent}
          ListEmptyComponent={EmptyComponent}
          refreshing={isRefetching}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={true}
          testID="events-flatlist"
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.6,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
  },
  listContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  separator: {
    height: 8,
  },
  eventCard: {
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
    marginBottom: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ff6b6b',
  },
});