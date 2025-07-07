import React from 'react';
import { StyleSheet, Button, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EventService } from '@/database/sqlite-services';

export default function EventsScreen() {
  const router = useRouter();

  // イベント一覧を取得
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        return await EventService.findAll();
      } catch (error) {
        console.error('Failed to load events:', error);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">イベント</ThemedText>
        </ThemedView>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>読み込み中...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">イベント</ThemedText>
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
      {/* ヘッダー */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">イベント</ThemedText>
        <ThemedText style={styles.subtitle}>
          参加したイベントの管理
        </ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 新規登録ボタン */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              新しいイベントを登録
            </ThemedText>
            <ThemedText style={styles.cardDescription}>
              参加したイベントの情報を登録してください
            </ThemedText>
            <Button
              title="イベント登録"
              onPress={() => router.push('/event-register')}
              testID="register-event-button"
            />
          </ThemedView>
        </ThemedView>

        {/* イベント一覧 */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            登録済みイベント ({events.length}件)
          </ThemedText>
          
          {events.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                まだイベントが登録されていません
              </ThemedText>
              <ThemedText style={styles.emptySubText}>
                上の「イベント登録」ボタンから最初のイベントを登録してみましょう
              </ThemedText>
            </ThemedView>
          ) : (
            events.map((event) => (
              <ThemedView key={event.id} style={styles.eventCard}>
                <ThemedText type="defaultSemiBold" style={styles.eventName}>
                  {event.name}
                </ThemedText>
                {event.date && (
                  <ThemedText style={styles.eventDate}>
                    📅 {event.date.toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </ThemedText>
                )}
                {event.location && (
                  <ThemedText style={styles.eventLocation}>
                    📍 {event.location}
                  </ThemedText>
                )}
              </ThemedView>
            ))
          )}
        </ThemedView>
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
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 16,
    marginTop: 8,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardDescription: {
    marginBottom: 12,
    opacity: 0.7,
    lineHeight: 20,
  },
  eventCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  eventName: {
    fontSize: 16,
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
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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