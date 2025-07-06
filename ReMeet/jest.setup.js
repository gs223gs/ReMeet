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
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  })),
}));

// expo-router のモック
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  Stack: {
    Screen: 'Stack.Screen',
  },
  useLocalSearchParams: () => ({}),
}));

// IconSymbol のモック
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

// SwipeablePersonCard のモック
jest.mock('@/components/ui/SwipeablePersonCard', () => {
  const React = require('react');
  const { TouchableOpacity, View, Text } = require('react-native');
  
  // forwardRefで定義されたコンポーネントのモック
  const SwipeablePersonCard = React.forwardRef(({ person, onPress, onDelete, onSwipeOpen, onSwipeClose, ...props }, ref) => {
    // 元のPersonCardと同様の構造を再現
    return React.createElement(
      View,
      { ...props, testID: `swipeable-person-card-${person.id}`, ref },
      React.createElement(
        TouchableOpacity,
        { 
          onPress,
          testID: `person-card-${person.id}`
        },
        // 名前
        React.createElement(Text, {}, person.name),
        
        // タグ
        ...(person.tags && person.tags.length > 0 ? person.tags.map(tag => 
          React.createElement(Text, { key: tag.id }, tag.name)
        ) : []),
        
        // イベント
        ...(person.events && person.events.length > 0 ? person.events.map(event => [
          React.createElement(Text, { key: `${event.id}-name` }, `📅 ${event.name}`),
          ...(event.location ? [React.createElement(Text, { key: `${event.id}-location` }, `📍 ${event.location}`)] : [])
        ]).flat() : [])
      )
    );
  });
  
  SwipeablePersonCard.displayName = 'SwipeablePersonCard';
  
  return { SwipeablePersonCard };
});

// SwipeableCard のモック
jest.mock('@/components/ui/SwipeableCard', () => {
  const React = require('react');
  const { TouchableOpacity, View, Text } = require('react-native');
  
  const SwipeableCard = React.forwardRef(({ person, onPress, onDelete, onHide, ...props }, ref) => {
    React.useImperativeHandle(ref, () => ({
      close: jest.fn(),
    }));
    
    return React.createElement(
      View,
      { ...props, testID: `swipeable-card-${person.id}` },
      React.createElement(
        TouchableOpacity,
        { 
          onPress,
          testID: `card-${person.id}`
        },
        React.createElement(Text, {}, person.name),
        ...(person.tags && person.tags.length > 0 ? person.tags.map(tag => 
          React.createElement(Text, { key: tag.id }, tag.name)
        ) : []),
        ...(person.events && person.events.length > 0 ? person.events.map(event => [
          React.createElement(Text, { key: `${event.id}-name` }, `📅 ${event.name}`),
          ...(event.location ? [React.createElement(Text, { key: `${event.id}-location` }, `📍 ${event.location}`)] : [])
        ]).flat() : [])
      ),
      // アクションボタン
      React.createElement(
        TouchableOpacity,
        { 
          onPress: onDelete,
          testID: `delete-button-${person.id}`
        },
        React.createElement(Text, {}, '削除')
      ),
      ...(onHide ? [React.createElement(
        TouchableOpacity,
        { 
          onPress: onHide,
          testID: `hide-button-${person.id}`
        },
        React.createElement(Text, {}, '非表示')
      )] : [])
    );
  });
  
  SwipeableCard.displayName = 'SwipeableCard';
  
  return { SwipeableCard };
});

// SwipeableCardList のモック
jest.mock('@/components/ui/SwipeableCardList', () => {
  const React = require('react');
  const { FlatList } = require('react-native');
  
  const SwipeableCardList = ({ data, onCardPress, onDeleteCard, onHideCard, ListEmptyComponent, ...props }) => {
    return React.createElement(FlatList, {
      ...props,
      data,
      testID: 'swipeable-card-list',
      renderItem: ({ item }) => React.createElement(
        require('@/components/ui/SwipeableCard').SwipeableCard,
        {
          person: item,
          onPress: () => onCardPress(item),
          onDelete: () => onDeleteCard(item),
          onHide: onHideCard ? () => onHideCard(item) : undefined,
        }
      ),
      ListEmptyComponent,
    });
  };
  
  return { SwipeableCardList };
});

// useSwipeDelete のモック
jest.mock('@/hooks/useSwipeDelete', () => ({
  useSwipeDelete: () => ({
    handleSwipeDelete: jest.fn(),
    isDeleting: false,
  }),
}));

// React Native Gesture Handler のモック
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  // GestureHandlerRootViewのモック
  const GestureHandlerRootView = ({ children, ...props }) => 
    React.createElement(View, props, children);
    
  // Swipeableのモック
  const Swipeable = ({ children, ...props }) => 
    React.createElement(View, props, children);
  
  return {
    Swipeable,
    GestureHandlerRootView,
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
    FlatList: require('react-native').FlatList,
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