import { NewPostPage } from "@/features/appreciation/components/new-post-page"

/**
 * `/app/posts/new` ルート。
 * フォームロジックは Client Component の {@link NewPostPage} に集約。
 */
export default function NewPostRoute() {
  return <NewPostPage />
}
