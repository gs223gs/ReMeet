import React from 'react';
import { 
  TextInput, 
  StyleSheet, 
  View, 
  Text, 
  TextInputProps 
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface FormInputProps extends TextInputProps {
  /** フィールドのラベル */
  label: string;
  /** エラーメッセージ */
  error?: string;
  /** 必須フィールドかどうか */
  required?: boolean;
}

/**
 * フォーム用の入力コンポーネント
 * ラベル、入力フィールド、エラーメッセージを表示
 */
export function FormInput({
  label,
  error,
  required = false,
  style,
  ...textInputProps
}: FormInputProps) {
  // テーマカラーを取得
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const errorColor = '#ff3b30'; // iOS標準の赤色
  const borderColor = error ? errorColor : '#c7c7cc'; // iOS標準のグレー

  return (
    <View style={styles.container}>
      {/* ラベル表示 */}
      <Text style={[styles.label, { color: textColor }]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      {/* 入力フィールド */}
      <TextInput
        style={[
          styles.input,
          {
            color: textColor,
            backgroundColor,
            borderColor,
          },
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor="#8e8e93"
        {...textInputProps}
      />
      
      {/* エラーメッセージ表示 */}
      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: '#ff3b30',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});