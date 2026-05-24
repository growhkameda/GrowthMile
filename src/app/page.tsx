import { redirect } from "next/navigation"

/** トップページからタイムラインへリダイレクト */
export default function Home() {
  redirect("/app/timeline")
}
