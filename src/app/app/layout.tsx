"use client"

import { AppHeader } from "@/components/appreciation/app-header"

/**
 * `/app/*` ルート群の共通レイアウト。
 *
 * AppHeader をここに置くことで各 page.tsx を薄く保ち、
 * ナビ・ポイント表示の重複を防ぐ。
 */
export default function AppreciationLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
