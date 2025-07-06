import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Alert, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SwipeablePersonCard } from '@/components/ui/SwipeablePersonCard';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSwipeDelete } from '@/hooks/useSwipeDelete';
import { PersonService } from '@/database/sqlite-services';
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
  const { handleSwipeDelete } = useSwipeDelete();
  
  // 開いているスワイプカードのIDを管理
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);
  // 各カードのrefを保持するMap
  const swipeableRefs = useRef<Map<string, any>>(new Map());
  // 現在開いているSwipeableのrefを管理
  const prevOpenedRow = useRef<any>(null);
  
  // 新しいスワイプが開くときに前のものを閉じる関数
  const closeRow = (currentRef: any) => {
    if (prevOpenedRow.current && prevOpenedRow.current !== currentRef) {
      prevOpenedRow.current.close();
    }
    prevOpenedRow.current = currentRef;
  };
  
  // 即座に閉じる関数（アニメーションなし）
  const instantCloseRow = () => {
    if (prevOpenedRow.current && prevOpenedRow.current.instantClose) {
      prevOpenedRow.current.instantClose();
      prevOpenedRow.current = null;
      setOpenSwipeId(null);
    }
  };
  
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

  /**
   * 人物詳細画面への遷移
   */
  const handlePersonDetail = (personId: string) => {
    router.push(`/person-detail?id=${personId}`);
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

      {/* 人物一覧 */}
      <PanGestureHandler
        onGestureEvent={(event) => {
          // スクロール中に削除ボタンを即座に閉じる
          if (prevOpenedRow.current) {
            const { velocityY, translationY } = event.nativeEvent;
            // 縦方向のスクロールを検出（わずかな動きでも反応）
            if (Math.abs(translationY) > 5 || Math.abs(velocityY) > 50) {
              instantCloseRow();
            }
          }
        }}
        onHandlerStateChange={(event) => {
          // 上下スワイプで削除ボタンを即座に閉じる
          if (event.nativeEvent.state === State.ACTIVE && prevOpenedRow.current) {
            const { velocityY, translationY } = event.nativeEvent;
            // 上下方向のジェスチャーを検出（より感度を上げる）
            if (Math.abs(velocityY) > 30 || Math.abs(translationY) > 3) {
              instantCloseRow();
            }
          }
        }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
          }
          onTouchStart={() => {
            // スクロールビューの背景がタップされたら即座にスワイプを閉じる
            instantCloseRow();
          }}
          onScroll={() => {
            // スクロール中に削除ボタンを即座に閉じる
            if (prevOpenedRow.current) {
              instantCloseRow();
            }
          }}
          scrollEventThrottle={16}
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
            <SwipeablePersonCard
              key={person.id}
              person={person}
              onPress={() => handlePersonDetail(person.id)}
              onDelete={() => handleSwipeDelete(person)}
              onSwipeOpen={(ref) => {
                closeRow(ref);
                setOpenSwipeId(person.id);
              }}
              onSwipeClose={() => {
                if (openSwipeId === person.id) {
                  setOpenSwipeId(null);
                  prevOpenedRow.current = null;
                }
              }}
              ref={(ref) => {
                if (ref) {
                  swipeableRefs.current.set(person.id, ref);
                } else {
                  swipeableRefs.current.delete(person.id);
                }
              }}
            />
          ))
        )}
        </ScrollView>
      </PanGestureHandler>
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
});