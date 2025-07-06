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
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // ボタンのカラー
    buttonBackground: '#000000',
    buttonText: '#ffffff',
    // その他のUIカラー
    border: '#e1e4e8',
    secondary: '#6a737d',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // ボタンのカラー
    buttonBackground: '#ffffff',
    buttonText: '#000000',
    // その他のUIカラー
    border: '#30363d',
    secondary: '#8b949e',
  },
  github: {
    text: '#24292e',
    background: '#ffffff',
    tint: tintColorGitHub,
    icon: '#586069',
    tabIconDefault: '#586069',
    tabIconSelected: tintColorGitHub,
    // ボタンのカラー（GitHubの緑色ボタン）
    buttonBackground: '#2ea44f',
    buttonText: '#ffffff',
    // その他のUIカラー（GitHubの配色）
    border: '#e1e4e8',
    secondary: '#586069',
    // GitHub特有のカラー
    primaryBlue: '#0366d6',
    successGreen: '#28a745',
    warningYellow: '#ffd33d',
    dangerRed: '#d73a49',
    infoGray: '#6a737d',
  },
};
