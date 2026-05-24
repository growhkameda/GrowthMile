import { create } from "zustand"

interface AppHeaderState {
  /** 新規投稿画面で選択中カテゴリの獲得ポイント。他画面では undefined */
  pointGain?: number
  setPointGain: (amount?: number) => void
}

/**
 * 共通ヘッダーの表示状態。
 *
 * 投稿画面のカテゴリ選択は NewPostPage 内に閉じているため、
 * ヘッダーへ獲得ポイントを伝える専用ストアとして分離している。
 */
export const useAppHeaderStore = create<AppHeaderState>((set) => ({
  pointGain: undefined,
  setPointGain: (amount) => set({ pointGain: amount }),
}))
