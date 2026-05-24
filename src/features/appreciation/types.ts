/**
 * 社員感謝アプリ（appreciation）のドメイン型・定数・表示用ヘルパー。
 *
 * API 連携前のモック段階ではここを型の単一情報源とし、
 * 将来 Prisma 生成型へ段階的に置き換える想定。
 */
import type { LucideIcon } from "lucide-react"
import { BookOpen, Calendar, Heart, Store } from "lucide-react"

/** 投稿カテゴリの識別子。thanks はサンクスカード専用。 */
export type PostCategoryId = "thanks" | "shop" | "event" | "study"

/** タイムライン上の投稿種別（サンクス含む） */
export type TimelinePostType = PostCategoryId

/** サンクスカードのモックデータ型 */
export interface ThanksItem {
  id: number
  type: "thanks"
  author: string
  authorDept: string
  authorAvatar: string
  recipient: string
  title: string
  content: string
  points: number
  likes: number
  comments: number
  timestamp: string
  hasImage: boolean
}

/** 一般投稿のモックデータ型 */
export interface PostItem {
  id: number
  type: Exclude<PostCategoryId, "thanks">
  tag: string
  author: string
  authorDept: string
  authorAvatar: string
  title: string
  content: string
  points: number
  likes: number
  comments: number
  location?: string
  url?: string
  timestamp: string
  hasImage: boolean
}

/** 投稿カテゴリ定義（新規投稿フォーム用） */
export interface PostCategory {
  id: PostCategoryId
  label: string
  icon: LucideIcon
  description: string
  points: number
  color: string
}

/** ガチャ種別 */
export interface GachaOption {
  id: string
  name: string
  cost: number
  description: string
  rarity: string
}

/** ガチャ景品のレアリティ */
export type GachaRarity = "SSR" | "SR" | "R" | "N"

/** ガチャ景品 */
export interface GachaPrize {
  id: number
  name: string
  rarity: GachaRarity
  icon: LucideIcon
  description: string
}

/** タグフィルタ定義 */
export interface TagFilter {
  id: string
  label: string
  icon: LucideIcon | null
}

/** 新規投稿フォームで選択可能なカテゴリ一覧（ポイント付与ルール含む） */
export const postCategories: PostCategory[] = [
  {
    id: "thanks",
    label: "サンクスカード",
    icon: Heart,
    description: "感謝を伝えよう",
    points: 50,
    color: "text-primary",
  },
  {
    id: "shop",
    label: "お店紹介",
    icon: Store,
    description: "おすすめのお店",
    points: 30,
    color: "text-accent-foreground",
  },
  {
    id: "event",
    label: "イベント",
    icon: Calendar,
    description: "イベント情報",
    points: 40,
    color: "text-gacha",
  },
  {
    id: "study",
    label: "勉強法",
    icon: BookOpen,
    description: "学びをシェア",
    points: 35,
    color: "text-chart-3",
  },
]

/** タイムライン「投稿」タブのタグフィルタ選択肢 */
export const tagFilters: TagFilter[] = [
  { id: "all", label: "すべて", icon: null },
  { id: "shop", label: "お店", icon: Store },
  { id: "event", label: "イベント", icon: Calendar },
  { id: "study", label: "勉強法", icon: BookOpen },
]

/**
 * 投稿カテゴリに対応する Tailwind バッジ用クラスを返す。
 * デザインシステムのセマンティックカラー（primary / gacha 等）と揃えている。
 */
export function getCategoryStyle(type: TimelinePostType): string {
  switch (type) {
    case "thanks":
      return "bg-primary/10 text-primary border-primary/20"
    case "shop":
      return "bg-accent/10 text-accent-foreground border-accent/20"
    case "event":
      return "bg-gacha/10 text-gacha border-gacha/20"
    case "study":
      return "bg-chart-3/10 text-chart-3 border-chart-3/20"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

/**
 * 投稿カテゴリの日本語表示ラベルを返す。
 * API レスポンスの type フィールドを UI 表示用に変換する際に使用。
 */
export function getCategoryLabel(type: TimelinePostType): string {
  switch (type) {
    case "thanks":
      return "サンクス"
    case "shop":
      return "お店"
    case "event":
      return "イベント"
    case "study":
      return "勉強法"
    default:
      return "その他"
  }
}

/**
 * ガチャ景品のレアリティに応じたグラデーション背景クラスを返す。
 * SSR / SR など視覚的な差別化を UI 側で統一するためのヘルパー。
 */
export function getRarityStyle(rarity: GachaRarity | string): string {
  switch (rarity) {
    case "SSR":
      return "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
    case "SR":
      return "bg-gradient-to-br from-purple-400 to-pink-500 text-white"
    case "R":
      return "bg-gradient-to-br from-blue-400 to-cyan-500 text-white"
    default:
      return "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
  }
}

/** ガチャ景品カードの枠線色。レアリティごとに色分けする。 */
export function getRarityBorder(rarity: GachaRarity | string): string {
  switch (rarity) {
    case "SSR":
      return "border-yellow-400/50"
    case "SR":
      return "border-purple-400/50"
    case "R":
      return "border-blue-400/50"
    default:
      return "border-gray-400/50"
  }
}
