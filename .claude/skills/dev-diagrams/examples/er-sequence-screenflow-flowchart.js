const pptxgen = require("pptxgenjs")

// tech-dark tokens (slide-design-themes 準拠)
const BG = "0F172A",
  ZONE = "13203A",
  CARD = "1E293B",
  CARD2 = "24334D"
const TXT = "F1F5F9",
  MUT = "94A3B8",
  TEAL = "2DD4BF",
  AMBER = "FBBF24",
  LINE = "334155"
const JP = "Yu Gothic",
  MONO = "Courier New"

const pres = new pptxgen()
pres.layout = "LAYOUT_16x9"
pres.author = "momo + Claude"
pres.title = "GROWTH MILE 開発ダイアグラム・カタログ（モック）"

function baseSlide(kicker, title, note) {
  const s = pres.addSlide()
  s.background = { color: BG }
  s.addText(kicker, {
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
  s.addText(title, {
    x: 0.5,
    y: 0.46,
    w: 7.4,
    h: 0.42,
    fontFace: JP,
    fontSize: 19,
    bold: true,
    color: TXT,
    margin: 0,
  })
  if (note)
    s.addText(note, {
      x: 7.0,
      y: 0.56,
      w: 2.5,
      h: 0.3,
      fontFace: JP,
      fontSize: 8.5,
      color: MUT,
      align: "right",
      margin: 0,
    })
  return s
}
function arrow(s, x1, y1, x2, y2, opts = {}) {
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
      endArrowType: opts.noHead ? "none" : "triangle",
    },
  })
}
function lbl(s, x, y, w, text, opts = {}) {
  s.addText(text, {
    x,
    y,
    w,
    h: opts.h || 0.22,
    fontFace: opts.mono ? MONO : JP,
    fontSize: opts.size || 7.5,
    color: opts.color || "7DD3C8",
    align: opts.align || "left",
    bold: !!opts.bold,
    margin: 0,
  })
}

// ============================================================
// S1: ER 図
// ============================================================
{
  const s = baseSlide(
    "DIAGRAM 1 / ENTITY-RELATIONSHIP",
    "ER 図 ─ 認証系テーブル（現行スキーマ）",
    "prisma/schema.prisma 準拠"
  )

  function entity(x, y, w, name, note, rows, dash) {
    const rowH = 0.235,
      headH = 0.34
    const h = headH + rows.length * rowH + 0.08
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w,
      h,
      fill: { color: CARD },
      rectRadius: 0.04,
      line: { color: dash ? "64748B" : TEAL, width: 1, dashType: dash ? "dash" : "solid" },
    })
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.02,
      y: y + 0.02,
      w: w - 0.04,
      h: headH - 0.02,
      fill: { color: CARD2 },
      line: { color: CARD2, width: 0 },
    })
    s.addText(name, {
      x: x + 0.12,
      y: y + 0.03,
      w: w - 0.24,
      h: 0.28,
      fontFace: MONO,
      fontSize: 10,
      bold: true,
      color: dash ? MUT : TEAL,
      valign: "middle",
      margin: 0,
    })
    if (note)
      s.addText(note, {
        x: x + 0.12,
        y: y + 0.03,
        w: w - 0.2,
        h: 0.28,
        fontFace: JP,
        fontSize: 7,
        color: MUT,
        align: "right",
        valign: "middle",
        margin: 0,
      })
    rows.forEach(([tag, col, type], i) => {
      const ry = y + headH + i * rowH
      if (tag)
        s.addText(tag, {
          x: x + 0.1,
          y: ry,
          w: 0.32,
          h: rowH,
          fontFace: MONO,
          fontSize: 7,
          bold: true,
          color: tag === "PK" ? AMBER : tag === "FK" ? TEAL : MUT,
          valign: "middle",
          margin: 0,
        })
      s.addText(col, {
        x: x + 0.44,
        y: ry,
        w: type ? w - 1.1 : w - 0.55,
        h: rowH,
        fontFace: MONO,
        fontSize: 8,
        color: TXT,
        valign: "middle",
        margin: 0,
      })
      if (type)
        s.addText(type, {
          x: x + w - 0.75,
          y: ry,
          w: 0.68,
          h: rowH,
          fontFace: MONO,
          fontSize: 7,
          color: MUT,
          align: "right",
          valign: "middle",
          margin: 0,
        })
    })
    return h
  }

  entity(0.6, 1.45, 2.25, "User", "アカウント", [
    ["PK", "id", "cuid"],
    ["UQ", "email", "str"],
    ["", "name", "str?"],
    ["", "image", "str?"],
    ["", "createdAt", "dt"],
    ["", "updatedAt", "dt"],
  ])
  entity(3.55, 1.25, 2.35, "Account", "IdP 連携", [
    ["PK", "id", "cuid"],
    ["FK", "userId", "str"],
    ["", "provider", "str"],
    ["", "providerAccountId", "str"],
    ["UQ", "(provider, pAccId)", ""],
  ])
  entity(3.55, 3.35, 2.35, "Session", "DB セッション", [
    ["PK", "id", "cuid"],
    ["UQ", "sessionToken", "str"],
    ["FK", "userId", "str"],
    ["", "expires", "dt"],
  ])
  entity(6.55, 1.25, 2.35, "VerificationToken", "一時トークン", [
    ["", "identifier", "str"],
    ["UQ", "token", "str"],
    ["", "expires", "dt"],
    ["UQ", "(identifier, token)", ""],
  ])
  lbl(s, 6.55, 2.75, 2.35, "※ リレーションなし（マジックリンク等の保管領域）", {
    color: "64748B",
    size: 7,
  })

  // planned zone
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.35,
    y: 3.2,
    w: 3.15,
    h: 2.0,
    fill: { color: BG },
    rectRadius: 0.05,
    line: { color: "64748B", width: 1, dashType: "dash" },
  })
  lbl(s, 6.5, 3.28, 2.8, "アプリ機能テーブル ─ 設計中", { color: "94A3B8", size: 8, bold: true })
  entity(
    6.5,
    3.56,
    1.4,
    "Post",
    "",
    [
      ["PK", "id", ""],
      ["FK", "userId", ""],
      ["", "content", ""],
    ],
    true
  )
  entity(
    8.0,
    3.56,
    1.4,
    "Like",
    "",
    [
      ["PK", "id", ""],
      ["FK", "userId", ""],
      ["FK", "postId", ""],
    ],
    true
  )

  // relations
  arrow(s, 2.85, 2.0, 3.53, 1.75, { noHead: true })
  lbl(s, 2.88, 1.72, 0.3, "1", { mono: true })
  lbl(s, 3.28, 1.5, 0.3, "n", { mono: true })
  arrow(s, 2.85, 2.6, 3.53, 3.7, { noHead: true })
  lbl(s, 2.88, 2.62, 0.3, "1", { mono: true })
  lbl(s, 3.3, 3.44, 0.3, "n", { mono: true })
  lbl(s, 6.5, 4.82, 2.95, "リレーション（予定）: User 1─n Post ／ Post 1─n Like", {
    color: "94A3B8",
    size: 7,
  })
  lbl(
    s,
    0.6,
    5.32,
    8.9,
    "凡例:  PK＝主キー   FK＝外部キー   UQ＝一意制約   実線＝リレーション   点線＝設計中",
    { color: "64748B", size: 8 }
  )
}

// ============================================================
// S2: シーケンス図
// ============================================================
{
  const s = baseSlide(
    "DIAGRAM 2 / SEQUENCE",
    "シーケンス図 ─ 投稿作成（Server Action）",
    "POST /app/posts/new"
  )
  const lanes = [
    ["ユーザー", 0.95],
    ["Client Component", 2.55],
    ["Server Action", 4.25],
    ["Auth.js v5", 5.85],
    ["lib/db.ts (Prisma)", 7.45],
    ["PostgreSQL", 9.05],
  ]
  lanes.forEach(([name, cx]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: cx - 0.72,
      y: 1.2,
      w: 1.44,
      h: 0.42,
      fill: { color: CARD },
      rectRadius: 0.05,
      line: { color: LINE, width: 1 },
    })
    s.addText(name, {
      x: cx - 0.72,
      y: 1.2,
      w: 1.44,
      h: 0.42,
      fontFace: JP,
      fontSize: 8.5,
      bold: true,
      color: TXT,
      align: "center",
      valign: "middle",
      margin: 0,
    })
    s.addShape(pres.shapes.LINE, {
      x: cx,
      y: 1.62,
      w: 0,
      h: 3.55,
      line: { color: "3B4A63", width: 0.75, dashType: "dash" },
    })
  })
  const msgs = [
    [0.95, 2.55, 1.95, "投稿を送信", false],
    [2.55, 4.25, 2.35, "Server Action 呼び出し（formData）", false],
    [4.25, 5.85, 3.15, "auth() ─ セッション検証", false],
    [5.85, 4.25, 3.45, "session / null", true],
    [4.25, 7.45, 3.8, "post.create()", false],
    [7.45, 9.05, 4.1, "INSERT", false],
    [9.05, 7.45, 4.35, "row", true],
    [7.45, 4.25, 4.6, "Post", true],
    [4.25, 2.55, 4.9, "revalidatePath → 再描画", true],
  ]
  msgs.forEach(([x1, x2, y, text, ret]) => {
    arrow(s, x1, y, x2, y, { dash: ret, color: ret ? "7DD3C8" : TEAL, w: ret ? 1 : 1.5 })
    lbl(s, Math.min(x1, x2) + 0.1, y - 0.24, Math.abs(x2 - x1) - 0.2, text, {
      align: "center",
      size: 7.5,
    })
  })
  // self note: Zod validation
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 3.62,
    y: 2.44,
    w: 1.26,
    h: 0.4,
    fill: { color: "0D3B36" },
    rectRadius: 0.05,
    line: { color: TEAL, width: 0.75 },
  })
  s.addText("Zod safeParse\n失敗時は 400 で即返却", {
    x: 3.62,
    y: 2.44,
    w: 1.26,
    h: 0.4,
    fontFace: JP,
    fontSize: 6.5,
    color: TXT,
    align: "center",
    valign: "middle",
    margin: 0,
  })
  // optimistic note
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 1.82,
    y: 2.44,
    w: 1.46,
    h: 0.4,
    fill: { color: CARD2 },
    rectRadius: 0.05,
    line: { color: LINE, width: 0.75 },
  })
  s.addText("useOptimistic で\nUI を即時反映", {
    x: 1.82,
    y: 2.44,
    w: 1.46,
    h: 0.4,
    fontFace: JP,
    fontSize: 6.5,
    color: MUT,
    align: "center",
    valign: "middle",
    margin: 0,
  })
  lbl(
    s,
    0.6,
    5.32,
    8.9,
    "凡例:  実線＝呼び出し   点線＝応答   ／   認証 null の場合はここで 401 を返し以降は実行しない",
    { color: "64748B", size: 8 }
  )
}

// ============================================================
// S3: 画面遷移図
// ============================================================
{
  const s = baseSlide(
    "DIAGRAM 3 / SCREEN FLOW",
    "画面遷移図 ─ 主要フロー",
    "src/app/ ルーティング準拠"
  )

  function screen(x, y, name, url, desc, dash) {
    const w = 2.0,
      h = 1.35
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w,
      h,
      fill: { color: CARD },
      rectRadius: 0.05,
      line: { color: dash ? "64748B" : TEAL, width: 1, dashType: dash ? "dash" : "solid" },
    })
    // ブラウザ風タイトルバー
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.02,
      y: y + 0.02,
      w: w - 0.04,
      h: 0.26,
      fill: { color: CARD2 },
      line: { color: CARD2, width: 0 },
    })
    ;[0, 1, 2].forEach((i) =>
      s.addShape(pres.shapes.OVAL, {
        x: x + 0.1 + i * 0.13,
        y: y + 0.1,
        w: 0.08,
        h: 0.08,
        fill: { color: i === 0 ? "F87171" : i === 1 ? AMBER : TEAL },
      })
    )
    s.addText(url, {
      x: x + 0.5,
      y: y + 0.02,
      w: w - 0.6,
      h: 0.26,
      fontFace: MONO,
      fontSize: 7,
      color: MUT,
      valign: "middle",
      align: "right",
      margin: 0,
    })
    s.addText(name, {
      x: x + 0.12,
      y: y + 0.36,
      w: w - 0.24,
      h: 0.3,
      fontFace: JP,
      fontSize: 11,
      bold: true,
      color: TXT,
      margin: 0,
    })
    s.addText(desc, {
      x: x + 0.12,
      y: y + 0.68,
      w: w - 0.24,
      h: 0.6,
      fontFace: JP,
      fontSize: 7.5,
      color: MUT,
      margin: 0,
      lineSpacingMultiple: 1.2,
    })
  }

  screen(0.6, 2.2, "ログイン", "/", "Auth.js v5 による認証。認証済みならタイムラインへ")
  screen(
    3.6,
    2.2,
    "タイムライン",
    "/app/timeline",
    "投稿一覧を表示。いいね は useOptimistic で即時反映"
  )
  screen(
    6.9,
    1.15,
    "新規投稿",
    "/app/posts/new",
    "Server Action で作成し、完了後にタイムラインへ戻る"
  )
  screen(6.9, 3.55, "ガチャ", "/app/gacha", "成長要素の抽選画面。結果はタイムラインに反映予定")

  arrow(s, 2.6, 2.85, 3.58, 2.85)
  lbl(s, 2.5, 2.6, 1.2, "認証成功", { align: "center" })
  arrow(s, 5.6, 2.6, 6.88, 1.85)
  lbl(s, 5.7, 1.98, 1.2, "投稿作成", {})
  arrow(s, 6.88, 2.1, 5.6, 2.85, { dash: true, color: "7DD3C8", w: 1 })
  lbl(s, 5.62, 2.98, 1.4, "完了後 redirect", { size: 7 })
  arrow(s, 5.6, 3.2, 6.88, 4.1)
  lbl(s, 5.75, 3.85, 1.1, "ガチャへ", {})
  arrow(s, 6.88, 4.35, 5.6, 3.5, { dash: true, color: "7DD3C8", w: 1 })

  // middleware guard note
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6,
    y: 4.1,
    w: 3.4,
    h: 0.85,
    fill: { color: "3B2F13" },
    rectRadius: 0.05,
    line: { color: AMBER, width: 1 },
  })
  s.addText(
    [
      {
        text: "ガード（Middleware）",
        options: { bold: true, color: AMBER, breakLine: true, fontSize: 8.5 },
      },
      {
        text: "/app/** は未認証アクセスを / へ redirect（src/proxy.ts で一括制御）",
        options: { color: MUT, fontSize: 8 },
      },
    ],
    { x: 0.78, y: 4.22, w: 3.05, h: 0.65, fontFace: JP, margin: 0, lineSpacingMultiple: 1.2 }
  )
  lbl(s, 0.6, 5.32, 8.9, "凡例:  実線＝ユーザー操作による遷移   点線＝システムによる redirect", {
    color: "64748B",
    size: 8,
  })
}

// ============================================================
// S4: フローチャート
// ============================================================
{
  const s = baseSlide(
    "DIAGRAM 4 / FLOWCHART",
    "フローチャート ─ いいね処理（楽観的更新）",
    "Server Action + useOptimistic"
  )

  function proc(x, y, w, h, text, opts = {}) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w,
      h,
      fill: { color: opts.fill || CARD },
      rectRadius: 0.05,
      line: { color: opts.border || LINE, width: 1 },
    })
    s.addText(text, {
      x: x + 0.05,
      y,
      w: w - 0.1,
      h,
      fontFace: JP,
      fontSize: opts.size || 8.5,
      bold: !!opts.bold,
      color: opts.color || TXT,
      align: "center",
      valign: "middle",
      margin: 0,
      lineSpacingMultiple: 1.1,
    })
  }
  function term(x, y, w, text) {
    s.addShape(pres.shapes.OVAL, {
      x,
      y,
      w,
      h: 0.42,
      fill: { color: "0D3B36" },
      line: { color: TEAL, width: 1 },
    })
    s.addText(text, {
      x,
      y,
      w,
      h: 0.42,
      fontFace: JP,
      fontSize: 8.5,
      bold: true,
      color: TEAL,
      align: "center",
      valign: "middle",
      margin: 0,
    })
  }
  function decision(x, y, w, h, text) {
    s.addShape(pres.shapes.DIAMOND, {
      x,
      y,
      w,
      h,
      fill: { color: CARD2 },
      line: { color: AMBER, width: 1 },
    })
    s.addText(text, {
      x: x - 0.1,
      y,
      w: w + 0.2,
      h,
      fontFace: JP,
      fontSize: 8,
      bold: true,
      color: TXT,
      align: "center",
      valign: "middle",
      margin: 0,
    })
  }

  const cy = 2.25 // メインフローの中心線
  term(0.45, cy - 0.21, 0.9, "クリック")
  proc(1.6, cy - 0.35, 1.55, 0.7, "useOptimistic で\nUI を即時反映")
  proc(3.4, cy - 0.35, 1.5, 0.7, "Server Action\ntoggleLike() 実行")
  decision(5.15, cy - 0.4, 1.2, 0.8, "認証\nOK?")
  decision(6.6, cy - 0.4, 1.2, 0.8, "Zod 検証\nOK?")
  proc(8.05, cy - 0.35, 1.4, 0.7, "Prisma upsert\n→ revalidatePath", { size: 8 })
  term(8.3, 3.15, 0.9, "完了")
  proc(4.3, 3.55, 2.6, 0.7, "エラー応答（401 / 400）\nuseOptimistic をロールバック", {
    border: "F87171",
  })
  term(2.5, 3.69, 0.9, "終了")

  // メインフロー（OK は右へ）
  arrow(s, 1.35, cy, 1.58, cy)
  arrow(s, 3.15, cy, 3.38, cy)
  arrow(s, 4.9, cy, 5.13, cy)
  arrow(s, 6.35, cy, 6.58, cy)
  lbl(s, 6.36, cy - 0.28, 0.35, "OK", { mono: true, size: 7 })
  arrow(s, 7.8, cy, 8.03, cy)
  lbl(s, 7.81, cy - 0.28, 0.35, "OK", { mono: true, size: 7 })
  arrow(s, 8.75, cy + 0.35, 8.75, 3.13)
  // NG は下へ（直交ルート）
  arrow(s, 5.75, cy + 0.4, 5.75, 3.53, { color: "F87171", w: 1.25 })
  lbl(s, 5.84, 2.95, 0.4, "NG", { mono: true, size: 7, color: "F87171" })
  arrow(s, 7.2, cy + 0.4, 7.2, 3.9, { color: "F87171", w: 1.25, noHead: true })
  arrow(s, 7.2, 3.9, 6.92, 3.9, { color: "F87171", w: 1.25 })
  lbl(s, 7.29, 2.95, 0.4, "NG", { mono: true, size: 7, color: "F87171" })
  // ロールバック → 終了
  arrow(s, 4.28, 3.9, 3.42, 3.9)
  lbl(
    s,
    0.6,
    5.32,
    8.9,
    "凡例:  角丸＝処理   ひし形＝分岐   楕円＝開始 / 終了   赤線＝異常系（UI ロールバック）",
    { color: "64748B", size: 8 }
  )
}

pres.writeFile({ fileName: "diagram-catalog-mock.pptx" }).then(() => console.log("done"))
