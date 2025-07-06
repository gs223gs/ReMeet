/**
 * 人物データ用のJotai Atoms
 * TanStack Queryで取得したデータをJotaiで状態管理
 */
import { atom } from 'jotai';
import type { PersonWithRelations } from '@/database/sqlite-types';

/**
 * 人物一覧のAtom
 * ホーム画面で表示する人物データを保持
 */
export const peopleAtom = atom<PersonWithRelations[]>([]);

/**
 * 人物データの読み込み状態Atom
 * ローディング状態を管理
 */
export const peopleLoadingAtom = atom<boolean>(false);

/**
 * 人物データのエラー状態Atom
 * エラー情報を管理
 */
export const peopleErrorAtom = atom<Error | null>(null);

/**
 * 現在開いているメニューのカードIDを管理するAtom
 * 同時に開けるメニューは1つだけ
 */
export const openedMenuIdAtom = atom<string | null>(null);