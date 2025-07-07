import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Pressable, FlatList, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SwipeableCard, SwipeableCardRef } from '@/components/ui/SwipeableCard';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSwipeDelete } from '@/hooks/useSwipeDelete';
import { PersonService } from '@/database/sqlite-services';
import { peopleAtom, peopleLoadingAtom, peopleErrorAtom, openedMenuIdAtom } from '@/atoms/peopleAtoms';
import type { PersonWithRelations } from '@/database/sqlite-types';

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
  const { handleSwipeDelete } = useSwipeDelete();
  
  // Jotai Atomsから状態を取得
  const [people, setPeople] = useAtom(peopleAtom);
  const [isLoading, setIsLoading] = useAtom(peopleLoadingAtom);
  const [error, setError] = useAtom(peopleErrorAtom);
  const [openedMenuId, setOpenedMenuId] = useAtom(openedMenuIdAtom);
  
  // カードのrefを管理するMap
  const cardRefs = useRef<Map<string, SwipeableCardRef>>(new Map());
  
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

  /**
   * 人物詳細画面への遷移
   */
  const handlePersonDetail = useCallback((person: PersonWithRelations) => {
    router.push(`/person-detail?id=${person.id}`);
  }, [router]);

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
        onPress={() => handlePersonDetail(item)}
        onDelete={() => handleSwipeDelete(item)}
      />
    );
  }, [handlePersonDetail, handleSwipeDelete]);

  // keyExtractor
  const keyExtractor = useCallback((item: PersonWithRelations) => item.id, []);

  // アイテム区切り
  const ItemSeparatorComponent = useCallback(() => <View style={styles.separator} />, []);

  /**
   * 空の状態表示コンポーネント
   */
  const EmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>
        まだ人物が登録されていません
      </ThemedText>
      <ThemedText style={styles.emptySubtext}>
        「人物登録」から新しい人物を追加してください
      </ThemedText>
    </ThemedView>
  );

  // エラー時の表示（一度だけ実行）
  React.useEffect(() => {
    if (error) {
      console.error('人物データの読み込みに失敗しました:', error);
      Alert.alert(
        'エラー',
        '人物データの読み込みに失敗しました。',
        [{ text: 'OK', onPress: () => setError(null) }]
      );
    }
  }, [error, setError]);


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
    <GestureHandlerRootView style={styles.container}>
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

        {/* カードリスト */}
        <TouchableWithoutFeedback onPress={handleBackgroundPress}>
          <View style={styles.listContainer}>
            <FlatList
              data={people}
              renderItem={renderCard}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.contentContainer}
              ItemSeparatorComponent={ItemSeparatorComponent}
              ListEmptyComponent={EmptyComponent}
              refreshing={isRefetching}
              onRefresh={onRefresh}
              onScrollBeginDrag={handleScrollBeginDrag}
              showsVerticalScrollIndicator={true}
              testID="people-flatlist"
            />
          </View>
        </TouchableWithoutFeedback>
      </ThemedView>
    </GestureHandlerRootView>
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
});