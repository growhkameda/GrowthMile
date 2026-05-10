// 全体共通のAPIレスポンス型テンプレート
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
