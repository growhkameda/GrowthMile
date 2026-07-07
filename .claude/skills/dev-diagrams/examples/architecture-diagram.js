const pptxgen = require("pptxgenjs")
const React = require("react")
const ReactDOMServer = require("react-dom/server")
const sharp = require("sharp")
const {
  FaUsers,
  FaShieldAlt,
  FaLayerGroup,
  FaMousePointer,
  FaLock,
  FaPlug,
  FaDatabase,
  FaKey,
} = require("react-icons/fa")

// tech-dark tokens (slide-design-themes 準拠)
const BG = "0F172A",
  ZONE = "13203A",
  CARD = "1E293B"
const TXT = "F1F5F9",
  MUT = "94A3B8",
  TEAL = "2DD4BF",
  DARK = "0F172A",
  LINE = "334155"
const JP = "Yu Gothic",
  MONO = "Courier New"

async function iconPng(Icon, color) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Icon, { color, size: "256" }))
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  return "image/png;base64," + buf.toString("base64")
}

async function main() {
  const pres = new pptxgen()
  pres.layout = "LAYOUT_16x9"
  pres.author = "momo + Claude"
  pres.title = "GROWTH MILE アプリケーションアーキテクチャ概要"

  const ic = {}
  const defs = {
    users: [FaUsers, "#" + DARK],
    shield: [FaShieldAlt, "#" + DARK],
    layer: [FaLayerGroup, "#" + DARK],
    mouse: [FaMousePointer, "#" + DARK],
    lock: [FaLock, "#" + DARK],
    plug: [FaPlug, "#" + DARK],
    db: [FaDatabase, "#" + DARK],
    key: [FaKey, "#" + DARK],
  }
  for (const [k, [I, c]] of Object.entries(defs)) ic[k] = await iconPng(I, c)

  const s = pres.addSlide()
  s.background = { color: BG }

  s.addText("ARCHITECTURE / APPLICATION LAYER", {
    x: 0.5,
    y: 0.22,
    w: 9,
    h: 0.24,
    fontFace: MONO,
    fontSize: 10,
    color: TEAL,
    charSpacing: 3,
    margin: 0,
  })
  s.addText("アプリケーションアーキテクチャ概要 ─ GROWTH MILE", {
    x: 0.5,
    y: 0.46,
    w: 9,
    h: 0.44,
    fontFace: JP,
    fontSize: 20,
    bold: true,
    color: TXT,
    margin: 0,
  })

  // ---- helpers ----
  // 横型ノード: アイコン + 1行タイトル（折返し禁止のため fontSize 9.5 固定）+ サブ行
  function nodeBox(x, y, w, h, iconKey, title, subLines, opts = {}) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w,
      h,
      fill: { color: opts.fill || CARD },
      rectRadius: 0.05,
      line: {
        color: opts.border || LINE,
        width: opts.borderW || 1,
        dashType: opts.dash ? "dash" : "solid",
      },
    })
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.13,
      y: y + 0.11,
      w: 0.32,
      h: 0.32,
      fill: { color: opts.iconBg || TEAL },
    })
    s.addImage({ data: ic[iconKey], x: x + 0.21, y: y + 0.19, w: 0.16, h: 0.16 })
    s.addText(title, {
      x: x + 0.5,
      y: y + 0.1,
      w: w - 0.55,
      h: 0.32,
      fontFace: JP,
      fontSize: opts.tSize || 9.5,
      bold: true,
      color: TXT,
      valign: "middle",
      margin: 0,
    })
    if (subLines && subLines.length) {
      s.addText(
        subLines.map((t, i) => ({ text: t, options: { breakLine: i < subLines.length - 1 } })),
        {
          x: x + 0.15,
          y: y + 0.48,
          w: w - 0.3,
          h: h - 0.56,
          fontFace: JP,
          fontSize: 8,
          color: MUT,
          margin: 0,
          lineSpacingMultiple: 1.2,
        }
      )
    }
  }
  // 縦積みノード（狭い箱用）: アイコン上・タイトル中央・サブ中央
  function stackBox(x, y, w, h, iconKey, title, subLines, opts = {}) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w,
      h,
      fill: { color: opts.fill || CARD },
      rectRadius: 0.05,
      line: { color: opts.border || LINE, width: 1, dashType: opts.dash ? "dash" : "solid" },
    })
    s.addShape(pres.shapes.OVAL, {
      x: x + w / 2 - 0.17,
      y: y + 0.12,
      w: 0.34,
      h: 0.34,
      fill: { color: opts.iconBg || TEAL },
    })
    s.addImage({ data: ic[iconKey], x: x + w / 2 - 0.085, y: y + 0.205, w: 0.17, h: 0.17 })
    s.addText(title, {
      x: x + 0.05,
      y: y + 0.5,
      w: w - 0.1,
      h: 0.26,
      fontFace: JP,
      fontSize: 9.5,
      bold: true,
      color: TXT,
      align: "center",
      margin: 0,
    })
    if (subLines && subLines.length) {
      s.addText(
        subLines.map((t, i) => ({ text: t, options: { breakLine: i < subLines.length - 1 } })),
        {
          x: x + 0.05,
          y: y + 0.78,
          w: w - 0.1,
          h: h - 0.86,
          fontFace: JP,
          fontSize: 7.5,
          color: MUT,
          align: "center",
          margin: 0,
          lineSpacingMultiple: 1.2,
        }
      )
    }
  }
  function arrow(x1, y1, x2, y2, opts = {}) {
    s.addShape(pres.shapes.LINE, {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      w: Math.abs(x2 - x1),
      h: Math.abs(y2 - y1),
      flipH: x2 < x1,
      flipV: y2 < y1,
      line: {
        color: opts.color || TEAL,
        width: opts.w || 1.5,
        dashType: opts.dash ? "dash" : "solid",
        endArrowType: "triangle",
      },
    })
  }
  function label(x, y, w, text, align = "left", size = 7.5) {
    s.addText(text, {
      x,
      y,
      w,
      h: 0.22,
      fontFace: JP,
      fontSize: size,
      color: "7DD3C8",
      align,
      margin: 0,
    })
  }

  // ---- actor ----
  s.addShape(pres.shapes.OVAL, { x: 0.55, y: 1.95, w: 0.6, h: 0.6, fill: { color: TEAL } })
  s.addImage({ data: ic.users, x: 0.7, y: 2.1, w: 0.3, h: 0.3 })
  s.addText("ユーザー", {
    x: 0.3,
    y: 2.6,
    w: 1.1,
    h: 0.25,
    fontFace: JP,
    fontSize: 10,
    bold: true,
    color: TXT,
    align: "center",
    margin: 0,
  })
  s.addText("Web ブラウザ", {
    x: 0.3,
    y: 2.84,
    w: 1.1,
    h: 0.22,
    fontFace: JP,
    fontSize: 8,
    color: MUT,
    align: "center",
    margin: 0,
  })

  // ---- Next.js container ----
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 1.75,
    y: 1.15,
    w: 6.1,
    h: 4.2,
    fill: { color: ZONE },
    rectRadius: 0.06,
    line: { color: TEAL, width: 1.25 },
  })
  s.addText(
    [
      { text: "Next.js 16 ", options: { fontFace: MONO, fontSize: 12, bold: true, color: TEAL } },
      {
        text: " App Router ─ src/ モノリス構成",
        options: { fontFace: JP, fontSize: 10, bold: true, color: TXT },
      },
    ],
    { x: 1.95, y: 1.26, w: 4.5, h: 0.3, margin: 0 }
  )
  s.addText("TypeScript / Turbopack", {
    x: 6.15,
    y: 1.3,
    w: 1.55,
    h: 0.24,
    fontFace: MONO,
    fontSize: 8,
    color: MUT,
    align: "right",
    margin: 0,
  })

  // row1: middleware -> app router -> db.ts
  nodeBox(
    1.95,
    1.75,
    1.5,
    1.1,
    "shield",
    "Middleware",
    ["src/proxy.ts", "認証ルートの一括保護", "Edge Runtime"],
    { tSize: 9 }
  )
  nodeBox(3.6, 1.75, 2.3, 1.1, "layer", "App Router", [
    "Pages＝Server Components 基本",
    "API Routes / Server Actions",
    "全入力を Zod で検証（信頼境界）",
  ])
  nodeBox(6.1, 1.75, 1.55, 1.1, "plug", "lib/db.ts", [
    "Prisma 7 シングルトン",
    "adapter-pg で PG へ接続",
  ])

  // row2: client components / auth
  nodeBox(3.6, 3.3, 2.3, 1.05, "mouse", "Client Components", [
    '"use client" は必要最小限',
    "features/ 単位で UI+ロジック配置",
    "Zustand＝UI状態・useOptimistic",
  ])
  nodeBox(6.1, 3.3, 1.55, 1.05, "lock", "Auth.js v5", ["auth() / useSession()", "PrismaAdapter"])

  // middleware 補足（矢印の代わりに参照注記）
  s.addText("auth.config.ts を参照\n（Edge 互換の軽量設定）", {
    x: 1.95,
    y: 3.0,
    w: 1.7,
    h: 0.5,
    fontFace: JP,
    fontSize: 7.5,
    color: "94A3B8",
    margin: 0,
    lineSpacingMultiple: 1.2,
  })

  // env chip
  nodeBox(
    1.95,
    4.55,
    4.05,
    0.62,
    "key",
    "src/env.ts ─ t3-env + Zod で環境変数を起動時に型検証",
    null,
    { dash: true, iconBg: "475569", tSize: 9 }
  )

  // ---- infra zone (undecided) ----
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 8.1,
    y: 1.15,
    w: 1.58,
    h: 4.2,
    fill: { color: BG },
    rectRadius: 0.06,
    line: { color: "64748B", width: 1, dashType: "dash" },
  })
  s.addText("INFRA ─ 未定", {
    x: 8.2,
    y: 1.26,
    w: 1.4,
    h: 0.24,
    fontFace: MONO,
    fontSize: 8.5,
    bold: true,
    color: "94A3B8",
    margin: 0,
  })
  stackBox(8.25, 1.72, 1.28, 1.35, "db", "PostgreSQL 16", ["ローカル: Docker", "本番: 選定中"], {
    iconBg: "475569",
  })
  s.addText("ホスティング・CDN 等は\nインフラ選定後に\n別図で定義する", {
    x: 8.25,
    y: 3.35,
    w: 1.3,
    h: 0.9,
    fontFace: JP,
    fontSize: 7.5,
    color: "64748B",
    margin: 0,
    lineSpacingMultiple: 1.25,
  })

  // ---- arrows ----
  const rowY = 2.3
  arrow(1.2, rowY, 1.92, rowY) // user -> middleware
  label(1.05, 2.03, 0.9, "HTTPS", "center")
  arrow(3.47, rowY, 3.58, rowY) // middleware -> app
  arrow(5.92, rowY, 6.07, rowY) // app -> db.ts
  arrow(7.65, rowY, 8.22, rowY) // db.ts -> postgres
  label(7.55, 2.03, 0.8, "SQL", "center")
  // client -> app (Server Actions)
  arrow(4.4, 3.28, 4.4, 2.88)
  label(2.6, 2.98, 1.7, "Server Actions 呼び出し", "right")
  // app -> auth (session)
  arrow(5.65, 2.88, 6.25, 3.28, { w: 1.25 })
  s.addText("auth()", {
    x: 5.3,
    y: 3.05,
    w: 0.55,
    h: 0.2,
    fontFace: MONO,
    fontSize: 7.5,
    color: "7DD3C8",
    align: "right",
    margin: 0,
  })
  // auth -> db.ts (adapter)
  arrow(6.9, 3.28, 6.9, 2.88)
  label(6.98, 3.0, 0.75, "Adapter")

  // ---- footer ----
  s.addText(
    "凡例:  実線＝リクエスト / データフロー   点線枠＝未確定領域   ／   本図はアプリケーション層のみを対象とする（インフラ層は選定後に追記）",
    { x: 0.5, y: 5.38, w: 9.0, h: 0.22, fontFace: JP, fontSize: 8, color: "64748B", margin: 0 }
  )

  await pres.writeFile({ fileName: "app-architecture-overview.pptx" })
  console.log("done")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
