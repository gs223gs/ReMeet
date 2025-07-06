/**
 * Jest セットアップファイル
 * テスト実行前に必要なモックとポリフィルを設定
 */

// AsyncStorage のモック
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// React Navigation のモック
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn(),
}));

// Expo のモック
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 80,
}));

// IconSymbol のモック
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

// SwipeablePersonCard のモック
jest.mock('@/components/ui/SwipeablePersonCard', () => ({
  SwipeablePersonCard: ({ person, onPress, onDelete, ...props }) => {
    const React = require('react');
    const { TouchableOpacity, View, Text } = require('react-native');
    return React.createElement(
      View,
      { ...props, testID: `swipeable-person-card-${person.id}` },
      React.createElement(
        TouchableOpacity,
        { 
          onPress,
          testID: `person-card-${person.id}`
        },
        React.createElement(Text, {}, person.name)
      )
    );
  },
}));

// useSwipeDelete のモック
jest.mock('@/hooks/useSwipeDelete', () => ({
  useSwipeDelete: () => ({
    handleSwipeDelete: jest.fn(),
    isDeleting: false,
  }),
}));

// React Native Gesture Handler のモック
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    GestureHandlerRootView: View,
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: require('react-native/Libraries/Lists/FlatList'),
    gestureHandlerRootHOC: jest.fn(component => component),
    Directions: {},
  };
});

// console warnings を抑制
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('punycode')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});