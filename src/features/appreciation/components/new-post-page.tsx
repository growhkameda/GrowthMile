"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Gift, Link2, Send, Sparkles, Upload, User, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useAppHeaderStore } from "@/features/appreciation/stores/app-header-store"
import { usePointsStore } from "@/features/appreciation/stores/points-store"
import { postCategories, type PostCategoryId } from "@/features/appreciation/types"

/**
 * 新規投稿画面。
 *
 * カテゴリに応じたポイント付与 UI を提供する。送信処理はモック（setTimeout）で、
 * 成功後に {@link usePointsStore} へポイント加算してタイムラインへ遷移する。
 */
export function NewPostPage() {
  const router = useRouter()
  const addPoints = usePointsStore((state) => state.addPoints)
  const setPointGain = useAppHeaderStore((state) => state.setPointGain)

  const [selectedCategory, setSelectedCategory] = useState<PostCategoryId>("thanks")
  const [recipient, setRecipient] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [url, setUrl] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const currentCategory = postCategories.find((c) => c.id === selectedCategory)

  // カテゴリ変更時にヘッダーへ獲得ポイントを反映。画面離脱時はバッジを消す
  useEffect(() => {
    setPointGain(currentCategory?.points)
    return () => setPointGain(undefined)
  }, [currentCategory?.points, setPointGain])

  /** 画像アップロードのモック。実装時は Server Action + ストレージ連携に置換 */
  const handleImageUpload = () => {
    const newImage = `image-${uploadedImages.length + 1}`
    setUploadedImages((prev) => [...prev, newImage])
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  /**
   * 投稿送信のモック処理。
   * ネットワーク遅延と成功フィードバックを setTimeout で擬似再現している。
   */
  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)
      addPoints(currentCategory?.points ?? 30)

      setTimeout(() => {
        setShowSuccess(false)
        router.push("/app/timeline")
      }, 2000)
    }, 1500)
  }

  const isFormValid =
    title.trim() !== "" &&
    content.trim() !== "" &&
    (selectedCategory !== "thanks" || recipient.trim() !== "")

  if (showSuccess) {
    return (
      <div className="bg-background flex min-h-[60vh] items-center justify-center px-4">
        <div className="animate-in fade-in zoom-in text-center duration-500">
          <div className="bg-primary/20 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <Sparkles className="text-primary h-10 w-10" />
          </div>
          <h2 className="text-foreground mb-2 text-xl font-bold">投稿完了！</h2>
          <p className="text-muted-foreground mb-4">ありがとうございます</p>
          <div className="bg-accent/20 inline-flex items-center gap-2 rounded-full px-4 py-2">
            <Gift className="text-accent-foreground h-4 w-4" />
            <span className="text-accent-foreground font-bold">
              +{currentCategory?.points} pt 獲得！
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="text-primary h-4 w-4" />
            カテゴリ選択
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <RadioGroup
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as PostCategoryId)}
            className="grid grid-cols-2 gap-2"
          >
            {postCategories.map((category) => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.id
              return (
                <Label
                  key={category.id}
                  htmlFor={category.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={category.id} id={category.id} className="sr-only" />
                  <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : category.color}`} />
                  <div className="min-w-0 flex-1">
                    <span className="text-foreground block truncate text-sm font-medium">
                      {category.label}
                    </span>
                    <span className="text-muted-foreground text-xs">+{category.points} pt</span>
                  </div>
                </Label>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {selectedCategory === "thanks" && (
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="text-primary h-4 w-4" />
              宛先
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="relative">
              <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="感謝を届けたい人の名前..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">投稿内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3 pt-0">
          <div>
            <Label
              htmlFor="title"
              className="text-muted-foreground mb-1.5 block text-xs font-medium"
            >
              タイトル
            </Label>
            <Input
              id="title"
              placeholder="タイトルを入力..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10"
            />
          </div>
          <div>
            <Label
              htmlFor="content"
              className="text-muted-foreground mb-1.5 block text-xs font-medium"
            >
              本文
            </Label>
            <Textarea
              id="content"
              placeholder="内容を入力..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Upload className="text-primary h-4 w-4" />
            写真
            <span className="text-muted-foreground text-xs font-normal">（任意）</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-wrap gap-2">
            {uploadedImages.map((image, index) => (
              <div
                key={image}
                className="bg-secondary relative flex h-16 w-16 items-center justify-center rounded-lg"
              >
                <span className="text-muted-foreground text-xs">{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-destructive text-destructive-foreground absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleImageUpload}
              className="border-border text-muted-foreground hover:border-primary hover:text-primary flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
            >
              <Upload className="h-5 w-5" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Link2 className="text-primary h-4 w-4" />
            URL
            <span className="text-muted-foreground text-xs font-normal">（任意）</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="relative">
            <Link2 className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 pb-4">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 w-full text-base shadow-lg"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              投稿中...
            </div>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              投稿する（{currentCategory?.points} pt 獲得！）
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
