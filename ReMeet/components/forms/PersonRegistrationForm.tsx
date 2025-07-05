import React from 'react';
import { 
  View, 
  StyleSheet, 
  Button, 
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from './FormInput';
import { TagSelector } from './TagSelector';
import { 
  personRegistrationSchema, 
  PersonRegistrationFormData 
} from '@/types/forms';

export interface PersonRegistrationFormProps {
  /** フォーム送信時のコールバック */
  onSubmit: (data: PersonRegistrationFormData) => void;
  /** 送信中フラグ */
  isSubmitting?: boolean;
  /** 初期値（編集時など） */
  initialData?: Partial<PersonRegistrationFormData>;
  /** タグのサジェスト一覧 */
  tagSuggestions?: string[];
}

/**
 * 人物登録フォームコンポーネント
 * READMEのPersonスキーマに基づいた項目構成
 * react-hook-formとzodを使用したバリデーション機能付き
 */
export function PersonRegistrationForm({ 
  onSubmit, 
  isSubmitting = false,
  initialData,
  tagSuggestions = []
}: PersonRegistrationFormProps) {
  // タグの使用履歴を管理（実際のアプリでは永続化）
  const [tagUsageHistory, setTagUsageHistory] = React.useState<string[]>(tagSuggestions);
  
  // 初期タグを配列に変換
  const initialTags = initialData?.tags 
    ? initialData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];
    
  const [selectedTags, setSelectedTags] = React.useState<string[]>(initialTags);
  
  // タグ変更時の処理
  const handleTagsChange = (newTags: string[]) => {
    setSelectedTags(newTags);
    
    // 使用履歴を更新（使用順で並べ替え）
    const updatedHistory = [...tagUsageHistory];
    newTags.forEach(tag => {
      const existingIndex = updatedHistory.indexOf(tag);
      if (existingIndex !== -1) {
        // 既存のタグを先頭に移動
        updatedHistory.splice(existingIndex, 1);
      }
      updatedHistory.unshift(tag);
    });
    setTagUsageHistory(updatedHistory);
    
    // react-hook-formの値を更新
    setValue('tags', newTags.join(', '));
  };
  // react-hook-formの設定
  const { 
    control, 
    handleSubmit, 
    setValue,
    formState: { errors } 
  } = useForm<PersonRegistrationFormData>({
    resolver: zodResolver(personRegistrationSchema),
    defaultValues: {
      name: initialData?.name || '',
      handle: initialData?.handle || '',
      company: initialData?.company || '',
      position: initialData?.position || '',
      description: initialData?.description || '',
      product_name: initialData?.product_name || '',
      memo: initialData?.memo || '',
      github_id: initialData?.github_id || '',
      tags: initialData?.tags || '',
      nfc_id: initialData?.nfc_id || '',
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 名前入力フィールド（必須） */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="名前"
              placeholder="山田太郎"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              required
              autoCapitalize="words"
              testID="name-input"
            />
          )}
        />

        {/* ハンドル名入力フィールド */}
        <Controller
          control={control}
          name="handle"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="ハンドル名"
              placeholder="@yamada_taro"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.handle?.message}
              autoCapitalize="none"
              testID="handle-input"
            />
          )}
        />

        {/* 会社名入力フィールド */}
        <Controller
          control={control}
          name="company"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="会社名"
              placeholder="株式会社サンプル"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.company?.message}
              autoCapitalize="words"
              testID="company-input"
            />
          )}
        />

        {/* 役職入力フィールド */}
        <Controller
          control={control}
          name="position"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="役職"
              placeholder="エンジニア"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.position?.message}
              autoCapitalize="words"
              testID="position-input"
            />
          )}
        />

        {/* 自己紹介入力フィールド */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="自己紹介"
              placeholder="フロントエンドエンジニアとして働いています。React、TypeScriptが得意です。"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.description?.message}
              multiline
              numberOfLines={4}
              testID="description-input"
            />
          )}
        />

        {/* プロダクト名入力フィールド */}
        <Controller
          control={control}
          name="product_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="プロダクト名"
              placeholder="開発中のアプリ名など"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.product_name?.message}
              testID="product-name-input"
            />
          )}
        />

        {/* GitHub ID入力フィールド */}
        <Controller
          control={control}
          name="github_id"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="GitHub ID"
              placeholder="yamada-taro"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.github_id?.message}
              autoCapitalize="none"
              testID="github-id-input"
              required={false}
            />
          )}
        />

        {/* タグ選択フィールド */}
        <TagSelector
          label="タグ"
          selectedTags={selectedTags}
          availableTags={tagUsageHistory}
          onTagsChange={handleTagsChange}
          error={errors.tags?.message}
          testID="tags-selector"
        />

        {/* NFC ID入力フィールド */}
        <Controller
          control={control}
          name="nfc_id"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="NFC ID"
              placeholder="システムで自動設定されます"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.nfc_id?.message}
              autoCapitalize="none"
              testID="nfc-id-input"
            />
          )}
        />

        {/* メモ入力フィールド */}
        <Controller
          control={control}
          name="memo"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="メモ"
              placeholder="その他の情報、印象など"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.memo?.message}
              multiline
              numberOfLines={4}
              testID="memo-input"
            />
          )}
        />

        {/* 送信ボタン */}
        <View style={styles.buttonContainer}>
          <Button
            title="登録する"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            testID="submit-button"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  buttonContainer: {
    marginTop: 24,
  },
});