/**
 * AsyncStorage のモック実装
 * テスト用のインメモリストレージを提供
 */

const mockStorage = {};

const AsyncStorage = {
  getItem: jest.fn((key) => {
    return new Promise((resolve) => {
      resolve(mockStorage[key] || null);
    });
  }),
  setItem: jest.fn((key, value) => {
    return new Promise((resolve) => {
      mockStorage[key] = value;
      resolve();
    });
  }),
  removeItem: jest.fn((key) => {
    return new Promise((resolve) => {
      delete mockStorage[key];
      resolve();
    });
  }),
  clear: jest.fn(() => {
    return new Promise((resolve) => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      resolve();
    });
  }),
  getAllKeys: jest.fn(() => {
    return new Promise((resolve) => {
      resolve(Object.keys(mockStorage));
    });
  }),
  multiGet: jest.fn((keys) => {
    return new Promise((resolve) => {
      const result = keys.map(key => [key, mockStorage[key] || null]);
      resolve(result);
    });
  }),
  multiSet: jest.fn((keyValuePairs) => {
    return new Promise((resolve) => {
      keyValuePairs.forEach(([key, value]) => {
        mockStorage[key] = value;
      });
      resolve();
    });
  }),
  multiRemove: jest.fn((keys) => {
    return new Promise((resolve) => {
      keys.forEach(key => delete mockStorage[key]);
      resolve();
    });
  }),
};

export default AsyncStorage;