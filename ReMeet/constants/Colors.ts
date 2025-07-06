/**
 * アプリケーションで使用するカラーテーマの定義
 * - light: ライトテーマ（白背景・黒文字）
 * - dark: ダークテーマ（既存）
 * - github: GitHubカラーテーマ
 */

const tintColorLight = '#000000';
const tintColorDark = '#fff';
const tintColorGitHub = '#24292e';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#8e8e93',
    tabIconSelected: '#007AFF',
    // ボタンのカラー
    buttonBackground: '#000000',
    buttonText: '#ffffff',
    // その他のUIカラー
    border: '#e1e4e8',
    secondary: '#6a737d',
    // タブバー専用
    tabBarBackground: '#f8f9fa',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#8e8e93',
    tabIconSelected: '#0A84FF',
    // ボタンのカラー
    buttonBackground: '#ffffff',
    buttonText: '#000000',
    // その他のUIカラー
    border: '#30363d',
    secondary: '#8b949e',
    // タブバー専用
    tabBarBackground: '#1c1c1e',
  },
  github: {
    text: '#24292e',
    background: '#ffffff',
    tint: tintColorGitHub,
    icon: '#586069',
    tabIconDefault: '#8e8e93',
    tabIconSelected: '#0366d6',
    // ボタンのカラー（GitHubの緑色ボタン）
    buttonBackground: '#2ea44f',
    buttonText: '#ffffff',
    // その他のUIカラー（GitHubの配色）
    border: '#e1e4e8',
    secondary: '#586069',
    // タブバー専用
    tabBarBackground: '#f6f8fa',
    // GitHub特有のカラー
    primaryBlue: '#0366d6',
    successGreen: '#28a745',
    warningYellow: '#ffd33d',
    dangerRed: '#d73a49',
    infoGray: '#6a737d',
  },
};
