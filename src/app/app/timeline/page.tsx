import { TimelinePage } from "@/features/appreciation/components/timeline-page"

/**
 * `/app/timeline` ルート。
 * 画面本体は {@link TimelinePage} に委譲する Server Component エントリ。
 */
export default function TimelineRoute() {
  return <TimelinePage />
}
