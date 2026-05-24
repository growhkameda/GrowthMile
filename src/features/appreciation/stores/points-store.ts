import { create } from "zustand"

interface PointsState {
  userPoints: number
  /** 投稿完了などでポイントを加算する（モック段階ではクライアントのみ） */
  addPoints: (amount: number) => void
  /**
   * ガチャ等でポイントを消費する。
   * @returns 残高不足時は false（残高は変更しない）
   */
  spendPoints: (amount: number) => boolean
}

/**
 * ユーザーの所持ポイントを管理する Zustand ストア。
 *
 * モック段階の UI 専用状態。AGENTS.md に従いサーバー状態は保持しない。
 * API 連携時は Server Action + useOptimistic へ置換予定。
 */
export const usePointsStore = create<PointsState>((set, get) => ({
  userPoints: 2450,
  addPoints: (amount) => {
    set((state) => ({ userPoints: state.userPoints + amount }))
  },
  spendPoints: (amount) => {
    const { userPoints } = get()
    if (userPoints < amount) {
      return false
    }
    set({ userPoints: userPoints - amount })
    return true
  },
}))
