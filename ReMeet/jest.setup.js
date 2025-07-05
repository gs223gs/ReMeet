/**
 * Jest セットアップファイル
 * テスト実行前に必要な設定を行う
 */

// PrismaクライアントのpolyfillとしてsetImmediateを追加
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));