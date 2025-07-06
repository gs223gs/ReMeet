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
import { TagInputWithSuggestions } from './TagInputWithSuggestions';
import { 
  personRegistrationSchema, 
  PersonRegistrationFormData 
} from '@/types/forms';

export interface PersonFormProps {
  /** フォーム送信時のコールバック */
  onSubmit: (data: PersonRegistrationFormData) => void;
  /** 送信中フラグ */
  isSubmitting?: boolean;
  /** 初期値（編集時など） */
  initialData?: Partial<PersonRegistrationFormData>;
  /** 既存タグ一覧 */
  availableTags?: string[];
  /** 新規タグ登録時のコールバック */
  onNewTagsAdded?: (newTags: string[]) => void;
  /** 編集モードかどうか */
  isEditMode?: boolean;
}

/**
 * 人物フォームコンポーネント
 * 登録・編集で共通利用される純粋なフォームコンポーネント
 * READMEのPersonスキーマに基づいた項目構成
 * react-hook-formとzodを使用したバリデーション機能付き
 */
export function PersonForm({ 
  onSubmit, 
  isSubmitting = false,
  initialData,
  availableTags = [],
  onNewTagsAdded,
  isEditMode = false
}: PersonFormProps) {
  
  // フォーム送信時に新規タグを登録
  const handleFormSubmit = (data: PersonRegistrationFormData) => {
    // 入力されたタグから新規タグを抽出
    if (data.tags && onNewTagsAdded) {
      const inputTags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      const newTags = inputTags.filter(tag => !availableTags.includes(tag));
      
      if (newTags.length > 0) {
        onNewTagsAdded(newTags);
      }
    }
    
    onSubmit(data);
  };

  // react-hook-formの設定
  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<PersonRegistrationFormData>({
    resolver: zodResolver(personRegistrationSchema),
    defaultValues: {
      name: initialData?.name || '',
      handle: initialData?.handle || '',
      company: initialData?.company || '',
      position: initialData?.position || '',
      description: initialData?.description || '',
      productName: initialData?.productName || '',
      memo: initialData?.memo || '',
      githubId: initialData?.githubId || '',
      tags: initialData?.tags || '',
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
          name="productName"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="プロダクト名"
              placeholder="開発中のアプリ名など"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.productName?.message}
              testID="product-name-input"
            />
          )}
        />

        {/* GitHub ID入力フィールド */}
        <Controller
          control={control}
          name="githubId"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="GitHub ID"
              placeholder="yamada-taro"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.githubId?.message}
              autoCapitalize="none"
              testID="github-id-input"
              required={false}
            />
          )}
        />

        {/* タグ入力フィールド */}
        <Controller
          control={control}
          name="tags"
          render={({ field: { onChange, onBlur, value } }) => {
            // 文字列を配列に変換
            const tagsArray = value 
              ? value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
              : [];
            
            // 配列を文字列に変換
            const handleTagsChange = (tags: string[]) => {
              onChange(tags.join(', '));
            };

            return (
              <TagInputWithSuggestions
                label="タグ"
                value={tagsArray}
                onChangeText={handleTagsChange}
                onBlur={onBlur}
                availableTags={availableTags}
                error={errors.tags?.message}
                placeholder="タグを入力してEnterキーを押してください"
                testID="tags-input"
              />
            );
          }}
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
            title={isEditMode ? "更新する" : "登録する"}
            onPress={handleSubmit(handleFormSubmit)}
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