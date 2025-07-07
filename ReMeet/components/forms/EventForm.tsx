import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Button, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ThemedText } from '@/components/ThemedText';
import { FormInput } from './FormInput';
import { 
  eventRegistrationSchema, 
  EventRegistrationFormData 
} from '@/types/eventForms';

export interface EventFormProps {
  /** フォーム送信時のコールバック */
  onSubmit: (data: EventRegistrationFormData) => void;
  /** 送信中フラグ */
  isSubmitting?: boolean;
  /** 初期値（編集時など） */
  initialData?: Partial<EventRegistrationFormData>;
  /** 編集モードかどうか */
  isEditMode?: boolean;
}

/**
 * イベントフォームコンポーネント
 * 登録・編集で共通利用される純粋なフォームコンポーネント
 * イベントスキーマに基づいた項目構成
 * react-hook-formとzodを使用したバリデーション機能付き
 */
export function EventForm({ 
  onSubmit, 
  isSubmitting = false,
  initialData,
  isEditMode = false
}: EventFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // react-hook-formの設定
  const { 
    control, 
    handleSubmit, 
    setValue,
    watch,
    formState: { errors } 
  } = useForm<EventRegistrationFormData>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      name: initialData?.name || '',
      date: initialData?.date || null,
      location: initialData?.location || '',
    },
  });

  const selectedDate = watch('date');

  // 日付選択時の処理
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setValue('date', selectedDate);
    }
  };

  // 日付クリア処理
  const clearDate = () => {
    setValue('date', null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* イベント名入力フィールド（必須） */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="イベント名"
              placeholder="React Conference 2024"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              required
              autoCapitalize="words"
              testID="event-name-input"
            />
          )}
        />

        {/* 開催日選択フィールド */}
        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>開催日</ThemedText>
          
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              testID="date-picker-button"
            >
              <ThemedText style={styles.dateButtonText}>
                {selectedDate 
                  ? selectedDate.toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    })
                  : '日付を選択してください'
                }
              </ThemedText>
            </TouchableOpacity>
            
            {selectedDate && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearDate}
                testID="clear-date-button"
              >
                <ThemedText style={styles.clearButtonText}>クリア</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {errors.date && (
            <ThemedText style={styles.errorText}>
              {errors.date.message}
            </ThemedText>
          )}
        </View>

        {/* 日付選択ピッカー */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()} // 過去の日付のみ選択可能
            testID="date-time-picker"
          />
        )}

        {/* 開催場所入力フィールド */}
        <Controller
          control={control}
          name="location"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="開催場所"
              placeholder="東京国際フォーラム"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.location?.message}
              autoCapitalize="words"
              testID="event-location-input"
            />
          )}
        />

        {/* 送信ボタン */}
        <View style={styles.buttonContainer}>
          <Button
            title={isEditMode ? "更新する" : "登録する"}
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
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 24,
  },
});