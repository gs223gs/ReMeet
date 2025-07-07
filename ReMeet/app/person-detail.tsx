import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { PersonService } from "@/database/sqlite-services";
import type { PersonWithRelations } from "@/database/sqlite-types";
import { usePersonMutations } from "@/hooks/usePersonMutations";

/**
 * 人物詳細画面
 * 選択された人物の詳細情報を表示
 * TanStack Queryを使用してデータ管理とuseEffect禁止を実現
 */
export default function PersonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const borderColor = useThemeColor({}, "border");
  const { deletePersonMutation } = usePersonMutations();

  // TanStack Queryを使用して人物データを取得
  const {
    data: person,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["person", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("人物IDが指定されていません");
      }
      const personData = await PersonService.findById(id);
      if (!personData) {
        throw new Error("指定された人物が見つかりません");
      }
      return personData;
    },
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
    enabled: !!id, // idが存在する場合のみクエリを実行
  });


  // IDが指定されていない場合のエラー
  if (!id) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            人物IDが指定されていません
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // エラー時の表示
  if (error) {
    console.error("人物詳細データの読み込みに失敗しました:", error);
    Alert.alert("エラー", "人物詳細データの読み込みに失敗しました。", [
      { text: "OK" },
    ]);
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            データの読み込みに失敗しました
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // ローディング時の表示
  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>読み込み中...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // 人物データが存在しない場合
  if (!person) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            指定された人物が見つかりません
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // 削除確認アラートとハンドラー
  const handleDeletePress = () => {
    Alert.alert(
      "削除確認",
      "本当にこの人物を削除しますか？",
      [
        {
          text: "キャンセル",
          style: "cancel",
        },
        {
          text: "削除する",
          style: "destructive",
          onPress: () => {
            deletePersonMutation.mutate(id, {
              onSuccess: () => {
                router.back();
              },
            });
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: person.name,
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                testID="back-button"
              >
                <ThemedText style={styles.backButtonText}>＜</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.tabsText}>(tabs)</ThemedText>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/person-edit?id=${id}`)}
              testID="edit-button"
            >
              <ThemedText style={styles.editButtonText}>編集</ThemedText>
            </TouchableOpacity>
          ),
        }}
      />
      <ThemedView style={styles.container}>
        {/* 人物詳細情報 */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          testID="person-detail-scroll-view"
        >
          <PersonDetailCard person={person} borderColor={borderColor} />
          
          {/* 削除ボタン */}
          <View style={styles.deleteButtonContainer}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeletePress}
              disabled={deletePersonMutation.isPending}
              testID="delete-person-button"
            >
              <ThemedText style={styles.deleteButtonText}>
                {deletePersonMutation.isPending ? "削除中..." : "人物を削除"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

/**
 * 人物詳細カードコンポーネント
 * 人物の全詳細情報を表示
 */
const PersonDetailCard = ({
  person,
  borderColor,
}: {
  person: PersonWithRelations;
  borderColor: string;
}) => (
  <ThemedView style={[styles.detailCard, { borderColor }]}>
    {/* ハンドル */}
    {person.handle && (
      <View style={styles.handleSection}>
        <ThemedText style={styles.handle}>{person.handle}</ThemedText>
      </View>
    )}

    {/* 会社・役職 */}
    {(person.company || person.position) && (
      <View style={styles.workSection}>
        <ThemedText style={styles.sectionTitle}>勤務先</ThemedText>
        {person.company && (
          <ThemedText style={styles.company}>🏢 {person.company}</ThemedText>
        )}
        {person.position && (
          <ThemedText style={styles.position}>💼 {person.position}</ThemedText>
        )}
      </View>
    )}

    {/* 説明 */}
    {person.description && (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>説明</ThemedText>
        <ThemedText style={styles.description}>{person.description}</ThemedText>
      </View>
    )}

    {/* プロダクト・GitHub */}
    {(person.productName || person.githubId) && (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>関連情報</ThemedText>
        {person.productName && (
          <ThemedText style={styles.productName}>
            📱 {person.productName}
          </ThemedText>
        )}
        {person.githubId && (
          <ThemedText style={styles.githubId}>💻 {person.githubId}</ThemedText>
        )}
      </View>
    )}

    {/* タグ */}
    {person.tags && person.tags.length > 0 && (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>タグ</ThemedText>
        <View style={styles.tagsContainer}>
          {person.tags.map((tag) => (
            <View key={tag.id} style={styles.tag}>
              <ThemedText style={styles.tagText}>{tag.name}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    )}

    {/* 出会った場所・イベント */}
    {person.events && person.events.length > 0 && (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          出会った場所・イベント
        </ThemedText>
        <View style={styles.eventsContainer}>
          {person.events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <ThemedText style={styles.eventName}>📅 {event.name}</ThemedText>
              {event.date && (
                <ThemedText style={styles.eventDate}>
                  📆 {new Date(event.date).toLocaleDateString("ja-JP")}
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
      </View>
    )}

    {/* メモ */}
    {person.memo && (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>メモ</ThemedText>
        <ThemedText style={styles.memo}>💭 {person.memo}</ThemedText>
      </View>
    )}

    {/* 登録日 */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>登録情報</ThemedText>
      <ThemedText style={styles.date}>
        登録日: {new Date(person.createdAt).toLocaleDateString("ja-JP")}
      </ThemedText>
      <ThemedText style={styles.date}>
        更新日: {new Date(person.updatedAt).toLocaleDateString("ja-JP")}
      </ThemedText>
    </View>
  </ThemedView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  tabsText: {
    fontSize: 16,
    color: '#007AFF',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.7,
  },
  detailCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  handleSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  handle: {
    fontSize: 16,
    opacity: 0.6,
  },
  section: {
    marginBottom: 20,
  },
  workSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    opacity: 0.8,
  },
  company: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  position: {
    fontSize: 16,
    opacity: 0.7,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  productName: {
    fontSize: 16,
    marginBottom: 4,
    opacity: 0.8,
  },
  githubId: {
    fontSize: 16,
    opacity: 0.8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  eventsContainer: {
    gap: 8,
  },
  eventCard: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 12,
    borderRadius: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4CAF50",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    opacity: 0.7,
  },
  memo: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
    fontStyle: "italic",
  },
  date: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 2,
  },
  deleteButtonContainer: {
    marginTop: 32,
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
