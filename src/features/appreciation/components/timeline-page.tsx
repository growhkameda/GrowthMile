"use client"

import { useState } from "react"
import {
  BookOpen,
  Coins,
  ExternalLink,
  Heart,
  ImageIcon,
  MapPin,
  MessageCircle,
  Search,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { postItems, thanksItems } from "@/features/appreciation/data/mock-data"
import {
  getCategoryLabel,
  getCategoryStyle,
  tagFilters,
  type PostItem,
  type ThanksItem,
} from "@/features/appreciation/types"

/**
 * タイムライン画面。
 *
 * サンクスカードと一般投稿をタブで切り替え、クライアント側フィルタで検索する。
 * データソースは {@link thanksItems} / {@link postItems}（モック）。
 */
export function TimelinePage() {
  // いいね状態はモック段階ではローカルのみ。API 化後は useOptimistic + Server Action へ移行
  const [likedItems, setLikedItems] = useState<number[]>([])
  const [activeTagFilter, setActiveTagFilter] = useState("all")
  const [thanksSearchQuery, setThanksSearchQuery] = useState("")
  const [postsSearchQuery, setPostsSearchQuery] = useState("")

  /** いいねのトグル。リロードでリセットされるモック動作 */
  const toggleLike = (id: number) => {
    setLikedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const filteredThanks = thanksItems.filter((item) => {
    if (!thanksSearchQuery) return true
    const query = thanksSearchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.author.toLowerCase().includes(query) ||
      item.recipient.toLowerCase().includes(query)
    )
  })

  const filteredPosts = postItems.filter((item) => {
    const matchesTag = activeTagFilter === "all" || item.type === activeTagFilter
    if (!postsSearchQuery) return matchesTag
    const query = postsSearchQuery.toLowerCase()
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.author.toLowerCase().includes(query) ||
      (item.location?.toLowerCase().includes(query) ?? false)
    return matchesTag && matchesSearch
  })

  return (
    <div className="px-4 py-4">
      <Tabs defaultValue="thanks" className="w-full">
        <TabsList className="bg-secondary/50 mb-4 grid w-full grid-cols-2 p-1">
          <TabsTrigger value="thanks" className="text-sm">
            <Heart className="mr-1 h-4 w-4" />
            サンクス
          </TabsTrigger>
          <TabsTrigger value="posts" className="text-sm">
            <BookOpen className="mr-1 h-4 w-4" />
            投稿
          </TabsTrigger>
        </TabsList>

        <TabsContent value="thanks" className="mt-0">
          <div className="relative mb-4">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="サンクスを検索..."
              value={thanksSearchQuery}
              onChange={(e) => setThanksSearchQuery(e.target.value)}
              className="bg-secondary/50 h-10 border-0 pl-9"
            />
          </div>

          <div className="space-y-3">
            {filteredThanks.map((item) => (
              <ThanksCard
                key={item.id}
                item={item}
                isLiked={likedItems.includes(item.id)}
                onLike={() => toggleLike(item.id)}
              />
            ))}
            {filteredThanks.length === 0 && (
              <div className="text-muted-foreground py-8 text-center">
                <Heart className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>該当するサンクスがありません</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="posts" className="mt-0">
          <div className="relative mb-3">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="投稿を検索..."
              value={postsSearchQuery}
              onChange={(e) => setPostsSearchQuery(e.target.value)}
              className="bg-secondary/50 h-10 border-0 pl-9"
            />
          </div>

          <div className="scrollbar-hide mb-3 flex gap-2 overflow-x-auto pb-3">
            {tagFilters.map((tag) => {
              const Icon = tag.icon
              const isActive = activeTagFilter === tag.id
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setActiveTagFilter(tag.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {tag.label}
                </button>
              )
            })}
          </div>

          <div className="space-y-3">
            {filteredPosts.map((item) => (
              <PostCard
                key={item.id}
                item={item}
                isLiked={likedItems.includes(item.id)}
                onLike={() => toggleLike(item.id)}
              />
            ))}
            {filteredPosts.length === 0 && (
              <div className="text-muted-foreground py-8 text-center">
                <BookOpen className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>このタグの投稿はまだありません</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ThanksCardProps {
  item: ThanksItem
  isLiked: boolean
  onLike: () => void
}

/** サンクスカード1件分の表示。宛先ユーザーへの感謝であることを視覚的に強調 */
function ThanksCard({ item, isLiked, onLike }: ThanksCardProps) {
  return (
    <Card className="border-primary/20 bg-primary/5 overflow-hidden">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/20 text-primary">
              {item.authorAvatar}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-foreground text-sm font-medium">{item.author}</span>
              <span className="text-primary text-sm">→</span>
              <span className="text-primary text-sm font-medium">{item.recipient}</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span>{item.authorDept}</span>
              <span>•</span>
              <span>{item.timestamp}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 shrink-0 text-xs"
          >
            <Heart className="mr-1 h-3 w-3" />
            サンクス
          </Badge>
        </div>

        <h4 className="text-foreground mb-1 text-sm font-bold">{item.title}</h4>
        <p className="text-muted-foreground mb-3 text-sm leading-relaxed">{item.content}</p>

        {item.hasImage && (
          <div className="bg-secondary/50 mb-3 flex h-32 items-center justify-center rounded-lg">
            <ImageIcon className="text-muted-foreground/50 h-8 w-8" />
          </div>
        )}

        <div className="border-border flex items-center justify-between border-t pt-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onLike}
              className="text-muted-foreground hover:text-primary flex items-center gap-1.5 text-sm transition-colors"
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
              <span>{isLiked ? item.likes + 1 : item.likes}</span>
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{item.comments}</span>
            </button>
          </div>
          <div className="text-accent-foreground bg-accent/20 flex items-center gap-1 rounded-full px-2 py-1 text-xs">
            <Coins className="h-3 w-3" />
            <span className="font-medium">{item.points} pt</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface PostCardProps {
  item: PostItem
  isLiked: boolean
  onLike: () => void
}

/** お店・イベント・勉強法など一般投稿1件分の表示 */
function PostCard({ item, isLiked, onLike }: PostCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {item.authorAvatar}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <span className="text-foreground text-sm font-medium">{item.author}</span>
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span>{item.authorDept}</span>
              <span>•</span>
              <span>{item.timestamp}</span>
            </div>
          </div>
          <Badge variant="outline" className={`${getCategoryStyle(item.type)} shrink-0 text-xs`}>
            {getCategoryLabel(item.type)}
          </Badge>
        </div>

        <h4 className="text-foreground mb-1 text-sm font-bold">{item.title}</h4>
        <p className="text-muted-foreground mb-3 text-sm leading-relaxed">{item.content}</p>

        {item.hasImage && (
          <div className="bg-secondary/50 mb-3 flex h-32 items-center justify-center rounded-lg">
            <ImageIcon className="text-muted-foreground/50 h-8 w-8" />
          </div>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          {item.location && (
            <div className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="max-w-[150px] truncate">{item.location}</span>
            </div>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              <span>リンク</span>
            </a>
          )}
        </div>

        <div className="border-border flex items-center justify-between border-t pt-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onLike}
              className="text-muted-foreground hover:text-primary flex items-center gap-1.5 text-sm transition-colors"
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
              <span>{isLiked ? item.likes + 1 : item.likes}</span>
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{item.comments}</span>
            </button>
          </div>
          <div className="text-accent-foreground bg-accent/20 flex items-center gap-1 rounded-full px-2 py-1 text-xs">
            <Coins className="h-3 w-3" />
            <span className="font-medium">{item.points} pt</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
