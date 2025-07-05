import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* ヘッダー */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>探索</ThemedText>
          <ThemedText style={styles.subtitle}>
            登録した人物の検索・管理
          </ThemedText>
        </ThemedView>

        {/* 検索機能（未実装） */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            人物検索
          </ThemedText>
          
          <ThemedView style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              🔍 検索機能は今後実装予定です
            </ThemedText>
            <ThemedText style={styles.featureDescription}>
              名前、会社、タグから高速検索できるようになります
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* タグ管理（未実装） */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            タグ管理
          </ThemedText>
          
          <ThemedView style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              🏷️ タグ管理機能は今後実装予定です
            </ThemedText>
            <ThemedText style={styles.featureDescription}>
              人物をタグで分類・整理できるようになります
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* フィルタリング（未実装） */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            フィルタリング
          </ThemedText>
          
          <ThemedView style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              📊 フィルタリング機能は今後実装予定です
            </ThemedText>
            <ThemedText style={styles.featureDescription}>
              AND/ORフィルタで条件を組み合わせて検索できます
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* 技術仕様 */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            技術仕様（予定）
          </ThemedText>
          
          <ThemedView style={styles.specList}>
            <ThemedText style={styles.specItem}>
              • 全文検索：200ms以内でのリアルタイム検索
            </ThemedText>
            <ThemedText style={styles.specItem}>
              • 仮想リスト：大量データでも高速表示
            </ThemedText>
            <ThemedText style={styles.specItem}>
              • タグチップUI：直感的なタグ操作
            </ThemedText>
            <ThemedText style={styles.specItem}>
              • ソート機能：名前、会社、登録日順
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  placeholder: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  specList: {
    paddingLeft: 8,
  },
  specItem: {
    marginBottom: 8,
    lineHeight: 20,
    opacity: 0.8,
  },
});