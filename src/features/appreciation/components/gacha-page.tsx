"use client"

import { useState } from "react"
import { Coins, Gift, ImageIcon, PartyPopper, Sparkles, Star, Trophy, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { gachaOptions, gachaPrizes, recentWinners } from "@/features/appreciation/data/mock-data"
import { usePointsStore } from "@/features/appreciation/stores/points-store"
import {
  getRarityBorder,
  getRarityStyle,
  type GachaOption,
  type GachaPrize,
} from "@/features/appreciation/types"

/**
 * ガチャ画面。
 *
 * ポイント消費 → 抽選アニメーション → 結果モーダルの流れをモックで再現する。
 * 確率・在庫管理は未実装（Math.random による均等抽選）。
 */
export function GachaPage() {
  const userPoints = usePointsStore((state) => state.userPoints)
  const spendPoints = usePointsStore((state) => state.spendPoints)

  const [selectedGacha, setSelectedGacha] = useState<GachaOption>(gachaOptions[0])
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<GachaPrize | null>(null)
  const [showResult, setShowResult] = useState(false)

  /**
   * ガチャ抽選のモック。
   * spendPoints が false の場合は残高不足のため早期 return する。
   */
  const handleGacha = () => {
    if (!spendPoints(selectedGacha.cost)) {
      return
    }

    setIsSpinning(true)
    setShowResult(false)

    setTimeout(() => {
      setIsSpinning(false)
      const randomIndex = Math.floor(Math.random() * gachaPrizes.length)
      setResult(gachaPrizes[randomIndex] ?? null)
      setShowResult(true)
    }, 2500)
  }

  /** 結果モーダルを閉じ、次の抽選に備えて state をリセット */
  const closeResult = () => {
    setShowResult(false)
    setResult(null)
  }

  const canAfford = userPoints >= selectedGacha.cost

  return (
    <>
      <div className="space-y-4 p-4">
        <Card className="border-accent/30 bg-accent/5 border-2">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground mb-1 text-xs">現在の所持ポイント</p>
            <div className="flex items-center justify-center gap-2">
              <Coins className="text-accent-foreground h-6 w-6" />
              <span className="text-accent-foreground text-4xl font-bold">
                {userPoints.toLocaleString()}
              </span>
              <span className="text-muted-foreground text-sm">pt</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="from-gacha/10 to-gacha/5 border-gacha/20 relative mb-4 flex h-40 items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-b">
              {isSpinning ? (
                <div className="text-center">
                  <div className="border-gacha mx-auto mb-2 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" />
                  <p className="text-gacha animate-pulse text-sm font-bold">抽選中...</p>
                  <div className="mt-2 flex justify-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="bg-gacha h-2 w-2 animate-bounce rounded-full"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-gacha/20 relative mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full">
                    <Gift className="text-gacha h-10 w-10" />
                    <div className="border-gacha/30 absolute inset-0 animate-ping rounded-full border-2" />
                  </div>
                  <p className="text-muted-foreground text-xs">ガチャを回してみよう！</p>
                </div>
              )}

              <Star className="absolute top-2 left-3 h-4 w-4 animate-pulse text-yellow-400" />
              <Sparkles className="text-gacha/50 absolute top-4 right-4 h-4 w-4" />
              <Zap className="text-accent absolute bottom-3 left-4 h-3 w-3" />
            </div>

            <div className="mb-4 flex gap-2">
              {gachaOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedGacha(option)}
                  className={`flex-1 rounded-lg border p-3 text-center transition-all ${
                    selectedGacha.id === option.id
                      ? "border-gacha bg-gacha/10"
                      : "border-border hover:border-gacha/50"
                  }`}
                >
                  <p className="text-foreground text-sm font-medium">{option.name}</p>
                  <p className="text-gacha text-lg font-bold">{option.cost} pt</p>
                  <p className="text-muted-foreground text-xs">{option.rarity}</p>
                </button>
              ))}
            </div>

            <Button
              onClick={handleGacha}
              disabled={!canAfford || isSpinning}
              className="bg-gacha hover:bg-gacha/90 text-gacha-foreground h-12 w-full text-base shadow-lg disabled:opacity-50"
            >
              {isSpinning ? (
                "抽選中..."
              ) : (
                <>
                  <Gift className="mr-2 h-5 w-5" />
                  {selectedGacha.cost} pt でガチャを引く！
                </>
              )}
            </Button>
            {!canAfford && (
              <p className="text-destructive mt-2 text-center text-xs">ポイントが足りません</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="text-primary h-4 w-4" />
              景品一覧
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-2 gap-2">
              {gachaPrizes.map((prize) => {
                const Icon = prize.icon
                return (
                  <div
                    key={prize.id}
                    className={`relative overflow-hidden rounded-lg border ${getRarityBorder(prize.rarity)}`}
                  >
                    <div className="bg-secondary/50 flex h-16 items-center justify-center">
                      <ImageIcon className="text-muted-foreground/50 h-6 w-6" />
                    </div>

                    <div
                      className={`absolute top-1 left-1 rounded px-1.5 py-0.5 text-xs font-bold ${getRarityStyle(prize.rarity)}`}
                    >
                      {prize.rarity}
                    </div>

                    <div className="p-2">
                      <div className="mb-0.5 flex items-center gap-1">
                        <Icon className="text-primary h-3 w-3" />
                        <span className="text-foreground truncate text-xs font-medium">
                          {prize.name}
                        </span>
                      </div>
                      <p className="text-muted-foreground truncate text-xs">{prize.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <PartyPopper className="text-gacha h-4 w-4" />
              最近の当選者
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {recentWinners.map((winner) => (
                <div
                  key={`${winner.name}-${winner.time}`}
                  className="bg-secondary/30 flex items-center gap-2 rounded-lg p-2"
                >
                  <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <span className="text-primary text-xs font-medium">
                      {winner.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">{winner.name}</p>
                    <p className="text-muted-foreground text-xs">{winner.time}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-bold ${getRarityStyle(winner.rarity)}`}
                    >
                      {winner.rarity}
                    </span>
                    <span className="text-foreground max-w-[60px] truncate text-xs">
                      {winner.prize}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {showResult && result && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card animate-in zoom-in-95 fade-in w-full max-w-sm rounded-2xl border p-6 text-center shadow-2xl duration-300">
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${getRarityStyle(result.rarity)}`}
            >
              <result.icon className="h-10 w-10" />
            </div>
            <div
              className={`mb-3 inline-block rounded-full px-3 py-0.5 text-sm font-bold ${getRarityStyle(result.rarity)}`}
            >
              {result.rarity}
            </div>
            <h2 className="text-foreground mb-1 text-xl font-bold">おめでとう！</h2>
            <p className="text-primary mb-1 text-2xl font-bold">{result.name}</p>
            <p className="text-muted-foreground mb-6 text-sm">{result.description}</p>
            <Button
              onClick={closeResult}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-full"
            >
              閉じる
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
