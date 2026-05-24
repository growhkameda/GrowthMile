import { Crown, Gift, PartyPopper, Star, Ticket, Utensils } from "lucide-react"

import type { GachaOption, GachaPrize, PostItem, ThanksItem } from "@/features/appreciation/types"

/**
 * デザインモック用の静的データ。
 *
 * API 実装後は Server Component / Route Handler から取得したデータに差し替える。
 * 本ファイルを削除せず、フェッチ層のモック差し替えポイントとして残す。
 */

/** タイムライン「サンクス」タブ用の固定データ */
export const thanksItems: ThanksItem[] = [
  {
    id: 1,
    type: "thanks",
    author: "佐藤 花子",
    authorDept: "開発部",
    authorAvatar: "佐藤",
    recipient: "鈴木 一郎",
    title: "プロジェクト完遂ありがとう！",
    content: "先週のリリース、本当にお疲れ様でした。深夜まで対応してくれて感謝しています。",
    points: 50,
    likes: 24,
    comments: 8,
    timestamp: "2時間前",
    hasImage: true,
  },
  {
    id: 5,
    type: "thanks",
    author: "田中 太郎",
    authorDept: "営業部",
    authorAvatar: "田中",
    recipient: "高橋 美咲",
    title: "新人研修のサポートありがとう！",
    content: "新人メンバーへの丁寧な指導、本当に助かりました。おかげで早くチームに馴染めました。",
    points: 50,
    likes: 18,
    comments: 5,
    timestamp: "5時間前",
    hasImage: false,
  },
  {
    id: 6,
    type: "thanks",
    author: "伊藤 翔太",
    authorDept: "マーケティング部",
    authorAvatar: "伊藤",
    recipient: "山田 健太",
    title: "資料作成のヘルプ感謝！",
    content: "急なお願いにも関わらず、素敵なスライドを作ってくれてありがとう！",
    points: 50,
    likes: 31,
    comments: 4,
    timestamp: "昨日",
    hasImage: true,
  },
]

/** タイムライン「投稿」タブ用の固定データ（お店・イベント・勉強法） */
export const postItems: PostItem[] = [
  {
    id: 2,
    type: "shop",
    tag: "お店",
    author: "山田 健太",
    authorDept: "総務部",
    authorAvatar: "山田",
    title: "おすすめランチスポット発見！",
    content:
      "会社近くにオープンした新しいイタリアンがとても美味しかったです。パスタランチが900円でコスパ最高！",
    points: 30,
    likes: 45,
    comments: 12,
    location: "渋谷区神南1-2-3",
    url: "https://example.com/restaurant",
    timestamp: "4時間前",
    hasImage: true,
  },
  {
    id: 3,
    type: "event",
    tag: "イベント",
    author: "高橋 美咲",
    authorDept: "人事部",
    authorAvatar: "高橋",
    title: "社内勉強会開催のお知らせ",
    content: "来週金曜日にAI活用に関する社内勉強会を開催します。興味のある方はぜひご参加ください！",
    points: 40,
    likes: 67,
    comments: 23,
    timestamp: "昨日",
    hasImage: false,
  },
  {
    id: 4,
    type: "study",
    tag: "勉強法",
    author: "伊藤 翔太",
    authorDept: "マーケティング部",
    authorAvatar: "伊藤",
    title: "英語学習のおすすめアプリ",
    content:
      "最近始めた英語学習アプリが効果的だったのでシェアします。毎日15分で着実にスコアアップ！",
    points: 35,
    likes: 32,
    comments: 15,
    url: "https://example.com/app",
    timestamp: "2日前",
    hasImage: true,
  },
  {
    id: 7,
    type: "shop",
    tag: "お店",
    author: "佐藤 花子",
    authorDept: "開発部",
    authorAvatar: "佐藤",
    title: "カフェで作業するなら！",
    content: "電源もWi-Fiも完備のカフェ見つけました。静かで集中できます。",
    points: 30,
    likes: 28,
    comments: 8,
    location: "渋谷区道玄坂1-1-1",
    timestamp: "3日前",
    hasImage: true,
  },
]

/** ガチャ画面の種別選択肢（コスト・排出レアリティ帯） */
export const gachaOptions: GachaOption[] = [
  {
    id: "normal",
    name: "ノーマル",
    cost: 100,
    description: "お手軽挑戦",
    rarity: "N~R",
  },
  {
    id: "premium",
    name: "プレミアム",
    cost: 300,
    description: "レアチャンス",
    rarity: "R~SR",
  },
  {
    id: "special",
    name: "スペシャル",
    cost: 500,
    description: "豪華景品",
    rarity: "SR~SSR",
  },
]

/** ガチャの景品マスタ（抽選プール） */
export const gachaPrizes: GachaPrize[] = [
  {
    id: 1,
    name: "社長とランチ",
    rarity: "SSR",
    icon: Utensils,
    description: "社長と特別ランチ！",
  },
  {
    id: 2,
    name: "特別休暇券",
    rarity: "SSR",
    icon: Ticket,
    description: "1日の特別休暇",
  },
  {
    id: 3,
    name: "高級レストラン",
    rarity: "SR",
    icon: Crown,
    description: "ペアディナー券",
  },
  {
    id: 4,
    name: "体験ギフト",
    rarity: "SR",
    icon: Star,
    description: "選べる体験",
  },
  {
    id: 5,
    name: "コンビニ券",
    rarity: "R",
    icon: Gift,
    description: "1000円分",
  },
  {
    id: 6,
    name: "ドリンク券",
    rarity: "N",
    icon: PartyPopper,
    description: "カフェ1杯",
  },
]

/** ガチャ画面下部に表示する当選履歴（ソーシャルプルーフ用） */
export const recentWinners = [
  {
    name: "佐藤 花子",
    prize: "高級レストラン",
    time: "1時間前",
    rarity: "SR",
  },
  {
    name: "鈴木 一郎",
    prize: "コンビニ券",
    time: "3時間前",
    rarity: "R",
  },
  {
    name: "高橋 美咲",
    prize: "社長とランチ",
    time: "昨日",
    rarity: "SSR",
  },
]

/**
 * ログインユーザーの仮プロフィール。
 * NextAuth セッション実装後は `session.user` から取得する。
 */
export const mockCurrentUser = {
  name: "田中 太郎",
  avatarFallback: "田中",
  avatarUrl: "/placeholder-user.jpg",
}
