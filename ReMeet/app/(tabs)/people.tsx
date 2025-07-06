import React from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Alert, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { PersonService } from '@/database/sqlite-services';
import type { PersonWithRelations } from '@/database/sqlite-types';
import { peopleAtom, peopleLoadingAtom, peopleErrorAtom } from '@/atoms/peopleAtoms';

/**
 * ホーム画面（人物一覧表示）
 * 登録済みの人物データを一覧表示し、追加ボタンを上部に配置
 * TanStack Query + Jotai を使用してデータ管理とuseEffect禁止を実現
 */
export default function HomeScreen() {
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'tint');
  const buttonTextColor = useThemeColor({}, 'background'); // ボタンテキストは背景色の反対色
  const borderColor = useThemeColor({}, 'border'); // テーマに沿った境界線色
  
  // Jotai Atomsから状態を取得
  const [people, setPeople] = useAtom(peopleAtom);
  const [isLoading, setIsLoading] = useAtom(peopleLoadingAtom);
  const [error, setError] = useAtom(peopleErrorAtom);
  
  // TanStack Queryを使用して人物データを取得（最新バージョン対応）
  const { refetch, isRefetching } = useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      try {
        const peopleData = await PersonService.findMany();
        // 成功時にJotaiに保存
        setPeople(peopleData);
        setIsLoading(false);
        setError(null);
        return peopleData;
      } catch (err) {
        // エラー時にJotaiに保存
        setError(err as Error);
        setIsLoading(false);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
    enabled: false, // 手動実行のみ
  });

  // 画面フォーカス時にデータをフェッチしてJotaiに保存
  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      refetch();
    }, [refetch, setIsLoading])
  );

  /**
   * リフレッシュ処理
   * 手動でデータを再取得してJotaiに保存
   */
  const onRefresh = () => {
    setIsLoading(true);
    refetch();
  };

  /**
   * 人物登録画面への遷移
   */
  const handleAddPerson = () => {
    router.push('/person-register');
  };

  // エラー時の表示
  if (error) {
    console.error('人物データの読み込みに失敗しました:', error);
    Alert.alert(
      'エラー',
      '人物データの読み込みに失敗しました。',
      [{ text: 'OK' }]
    );
  }

  /**
   * 人物カードコンポーネント（簡潔版）
   * 名前、タグ、どこであったかのみ表示
   */
  const PersonCard = ({ person }: { person: PersonWithRelations }) => (
    <ThemedView style={styles.personCard}>
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
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">ReMeet</ThemedText>
          <ThemedText style={styles.subtitle}>
            出会った人を記録・管理
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
      {/* ヘッダーと追加ボタン */}
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <ThemedText type="title">ReMeet</ThemedText>
            <ThemedText style={styles.subtitle}>
              {people.length}人が登録されています
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
            onPress={handleAddPerson}
            testID="add-person-button"
          >
            <ThemedText style={[styles.addButtonText, { color: buttonTextColor }]}>+</ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      {/* 人物一覧 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        testID="home-scroll-view"
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
    // テーマに沿った境界線
    borderWidth: 2,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
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
});