import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PersonService } from '@/database/sqlite-services';
import type { PersonWithRelations } from '@/database/sqlite-types';

/**
 * 人物一覧表示画面
 * 登録済みの人物データを一覧表示し、検索・フィルタリング機能を提供
 */
export default function PeopleScreen() {
  const [people, setPeople] = useState<PersonWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * 人物データを読み込む
   * データベースから全ての人物データを取得
   */
  const loadPeople = useCallback(async () => {
    try {
      setIsLoading(true);
      const peopleData = await PersonService.findMany();
      setPeople(peopleData);
    } catch (error) {
      console.error('人物データの読み込みに失敗しました:', error);
      Alert.alert(
        'エラー',
        '人物データの読み込みに失敗しました。',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 画面フォーカス時に人物データを読み込み
   * useEffectの使用を避けるためuseFocusEffectを使用
   */
  useFocusEffect(
    useCallback(() => {
      loadPeople();
    }, [loadPeople])
  );

  /**
   * リフレッシュ処理
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadPeople();
    setRefreshing(false);
  };

  /**
   * 人物カードコンポーネント
   * 各人物の情報を表示するカード
   */
  const PersonCard = ({ person }: { person: PersonWithRelations }) => (
    <ThemedView style={styles.personCard}>
      {/* 名前とハンドル */}
      <View style={styles.nameContainer}>
        <ThemedText type="subtitle" style={styles.name}>
          {person.name}
        </ThemedText>
        {person.handle && (
          <ThemedText style={styles.handle}>
            {person.handle}
          </ThemedText>
        )}
      </View>

      {/* 会社・役職 */}
      {(person.company || person.position) && (
        <View style={styles.workContainer}>
          {person.company && (
            <ThemedText style={styles.company}>
              {person.company}
            </ThemedText>
          )}
          {person.position && (
            <ThemedText style={styles.position}>
              {person.position}
            </ThemedText>
          )}
        </View>
      )}

      {/* プロダクト名 */}
      {person.productName && (
        <ThemedText style={styles.productName}>
          📱 {person.productName}
        </ThemedText>
      )}

      {/* GitHub ID */}
      {person.githubId && (
        <ThemedText style={styles.githubId}>
          💻 {person.githubId}
        </ThemedText>
      )}

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
              {event.date && (
                <ThemedText style={styles.eventDate}>
                  {new Date(event.date).toLocaleDateString('ja-JP')}
                </ThemedText>
              )}
              {event.location && (
                <ThemedText style={styles.eventLocation}>
                  📍 {event.location}
                </ThemedText>
              )}
            </View>
          ))}
        </View>
      )}

      {/* メモ（その人の特徴） */}
      {person.memo && (
        <ThemedText style={styles.memo} numberOfLines={2}>
          💭 {person.memo}
        </ThemedText>
      )}

      {/* 登録日 */}
      <ThemedText style={styles.date}>
        登録日: {new Date(person.createdAt).toLocaleDateString('ja-JP')}
      </ThemedText>
    </ThemedView>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">人物一覧</ThemedText>
          <ThemedText style={styles.subtitle}>
            登録済みの人物情報
          </ThemedText>
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

  return (
    <ThemedView style={styles.container}>
      {/* ヘッダー */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">人物一覧</ThemedText>
        <ThemedText style={styles.subtitle}>
          {people.length}人が登録されています
        </ThemedText>
      </ThemedView>

      {/* 人物一覧 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {people.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              まだ人物が登録されていません
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              「人物登録」から新しい人物を追加してください
            </ThemedText>
          </ThemedView>
        ) : (
          people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))
        )}
      </ScrollView>
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
  subtitle: {
    marginTop: 8,
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
  personCard: {
    marginBottom: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  handle: {
    opacity: 0.6,
    fontSize: 14,
  },
  workContainer: {
    marginBottom: 8,
  },
  company: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  position: {
    opacity: 0.7,
    fontSize: 14,
  },
  productName: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  githubId: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
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
  memo: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  date: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'right',
  },
  eventsContainer: {
    marginBottom: 8,
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
  eventDate: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    opacity: 0.7,
  },
});