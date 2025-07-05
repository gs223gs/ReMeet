const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// WASM ファイルのサポートを追加
config.resolver.assetExts.push('wasm');

// expo-sqlite の Web 版で必要なファイル拡張子を追加
config.resolver.sourceExts.push('sql');

module.exports = config;