import React from 'react';
import { StyleSheet, Button, ScrollView, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme, ColorSchemeType } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const textColor = useThemeColor({}, 'text');
  const buttonBackgroundColor = useThemeColor({}, 'buttonBackground');
  const buttonTextColor = useThemeColor({}, 'buttonText');
  const borderColor = useThemeColor({}, 'border');
  
  const themes: { value: ColorSchemeType; label: string }[] = [
    { value: 'light', label: 'ライト' },
    { value: 'dark', label: 'ダーク' },
    { value: 'github', label: 'GitHub' },
  ];
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* ヘッダー */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>ReMeet</ThemedText>
          <ThemedText style={styles.subtitle}>
            出会った人の情報を記録・管理するアプリ
          </ThemedText>
        </ThemedView>
        
        {/* テーマ選択 */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            テーマ選択
          </ThemedText>
          
          <View style={styles.themeSelector}>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.value}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: colorScheme === theme.value ? buttonBackgroundColor : 'transparent',
                    borderColor: borderColor,
                    borderWidth: 1,
                  }
                ]}
                onPress={() => toggleColorScheme(theme.value)}
              >
                <ThemedText 
                  style={[
                    styles.themeButtonText,
                    { color: colorScheme === theme.value ? buttonTextColor : textColor }
                  ]}
                >
                  {theme.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* メイン機能 */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            メイン機能
          </ThemedText>
          
          <ThemedView style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              人物登録
            </ThemedText>
            <ThemedText style={styles.cardDescription}>
              出会った人の情報を登録・管理できます
            </ThemedText>
            <Button
              title="人物登録画面へ"
              onPress={() => router.push('/person-register')}
            />
          </ThemedView>
        </ThemedView>

        {/* 開発者向け機能 */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            開発者向け機能
          </ThemedText>
          
          <ThemedView style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              ユーザー登録（テスト用）
            </ThemedText>
            <ThemedText style={styles.cardDescription}>
              フォームバリデーションのテスト用画面
            </ThemedText>
            <Button
              title="ユーザー登録画面へ"
              onPress={() => router.push('/register')}
            />
          </ThemedView>
        </ThemedView>

        {/* 今後の予定 */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            今後の実装予定
          </ThemedText>
          
          <ThemedView style={styles.featureList}>
            <ThemedText style={styles.featureItem}>
              • NFC カード連携機能
            </ThemedText>
            <ThemedText style={styles.featureItem}>
              • 人物検索・フィルタリング
            </ThemedText>
            <ThemedText style={styles.featureItem}>
              • タグ管理機能
            </ThemedText>
            <ThemedText style={styles.featureItem}>
              • GitHub連携・ステータス表示
            </ThemedText>
            <ThemedText style={styles.featureItem}>
              • 関係グラフ表示（Skia Canvas）
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
  themeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  featureList: {
    paddingLeft: 8,
  },
  featureItem: {
    marginBottom: 8,
    lineHeight: 20,
    opacity: 0.8,
  },
});