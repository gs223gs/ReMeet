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
import { 
  userRegistrationSchema, 
  UserRegistrationFormData 
} from '@/types/forms';

export interface UserRegistrationFormProps {
  /** フォーム送信時のコールバック */
  onSubmit: (data: UserRegistrationFormData) => void;
  /** 送信中フラグ */
  isSubmitting?: boolean;
}

/**
 * ユーザー登録フォームコンポーネント
 * react-hook-formとzodを使用したバリデーション機能付き
 */
export function UserRegistrationForm({ 
  onSubmit, 
  isSubmitting = false 
}: UserRegistrationFormProps) {
  // react-hook-formの設定
  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<UserRegistrationFormData>({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
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
        {/* 名前入力フィールド */}
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

        {/* メールアドレス入力フィールド */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="メールアドレス"
              placeholder="example@email.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              required
              keyboardType="email-address"
              autoCapitalize="none"
              testID="email-input"
            />
          )}
        />

        {/* パスワード入力フィールド */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="パスワード"
              placeholder="8文字以上の英数字"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              required
              secureTextEntry
              autoCapitalize="none"
              testID="password-input"
            />
          )}
        />

        {/* パスワード確認入力フィールド */}
        <Controller
          control={control}
          name="passwordConfirmation"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="パスワード（確認）"
              placeholder="パスワードを再入力"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.passwordConfirmation?.message}
              required
              secureTextEntry
              autoCapitalize="none"
              testID="password-confirmation-input"
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