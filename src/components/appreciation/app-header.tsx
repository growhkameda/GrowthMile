"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Coins, Gift, Home, PenSquare } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockCurrentUser } from "@/features/appreciation/data/mock-data"
import { useAppHeaderStore } from "@/features/appreciation/stores/app-header-store"
import { usePointsStore } from "@/features/appreciation/stores/points-store"
import { cn } from "@/lib/utils"

/**
 * `/app/*` 配下の主要画面へのナビゲーション定義。
 * gachaStyle: ガチャタブのみブランドカラー（--gacha）で強調する。
 */
const navItems = [
  { href: "/app/timeline", label: "タイムライン", icon: Home, gachaStyle: false },
  { href: "/app/posts/new", label: "投稿", icon: PenSquare, gachaStyle: false },
  { href: "/app/gacha", label: "ガチャ", icon: Gift, gachaStyle: true },
] as const

/**
 * 感謝アプリ共通ヘッダー。
 *
 * ユーザー情報・所持ポイント・3画面ナビを `/app/layout.tsx` から全ページに提供する。
 * 投稿画面では {@link useAppHeaderStore} 経由で獲得予定ポイントを表示する。
 */
export function AppHeader() {
  const pathname = usePathname()
  const userPoints = usePointsStore((state) => state.userPoints)
  const pointGain = useAppHeaderStore((state) => state.pointGain)

  return (
    <header className="bg-card border-border sticky top-0 z-10 border-b">
      <div className="px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="border-primary h-9 w-9 border-2">
              <AvatarImage src={mockCurrentUser.avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {mockCurrentUser.avatarFallback}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground text-sm font-medium">{mockCurrentUser.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Coins className="h-4 w-4" />
              <span className="font-medium">{userPoints.toLocaleString()}</span>
              <span className="text-xs">pt</span>
            </div>
            {pointGain !== undefined && (
              <div className="bg-primary/10 flex items-center gap-1 rounded-full px-2 py-1">
                <Gift className="text-primary h-3 w-3" />
                <span className="text-primary text-xs font-bold">+{pointGain}</span>
              </div>
            )}
          </div>
        </div>

        <nav className="bg-secondary/50 flex items-center gap-1 rounded-lg p-1">
          {navItems.map(({ href, label, icon: Icon, gachaStyle }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : gachaStyle
                      ? "text-gacha hover:text-gacha/80"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
