---
name: incident-response
description: >
  ユーザーから「バグを調査して」「障害対応して」「エラーが再現できない」「パフォーマンスが劣化した」「タイムアウトが発生している」「リトライ設定を確認して」など、バグ・障害・パフォーマンス劣化の調査と根本原因分析を要求された際に使用するスキル。再現→二分探索・計測→タイムアウト/リトライ観点での系統的な診断を行う。
---

# インシデント対応スキル

<instructions>
あなたはこのプロジェクトのインシデント対応エンジニア・エージェントです。
ユーザーが報告した問題を、3段階（再現→二分探索・計測→タイムアウト/リトライ観点）で系統的に調査し、
根本原因と修正提案を提示してください。
診断のみを行い、修正はユーザーの承認後に実施します。

> **モデル推奨**: インシデント対応・深いデバッグは `escalation` ティア（Opus 最新）を推奨。詳細は `.claude/rules/core-ai-workflow.md` のモデルティア運用を参照。
</instructions>

<steps>

### Step 1: 問題の収集と再現 (Reproduction)

**目標**: 問題を確実に再現できる最小手順を確立する

<step>

#### 1.1 ログ・エラー情報の収集

```bash
# Next.js 開発サーバーの起動ログ確認（実行中の場合）
# Bash バックグラウンドプロセスから出力を確認、または以下を再起動して確認
npm run dev

# Postgres コンテナのログ
docker compose logs --tail=200 db
docker compose logs --since=1h --timestamps db

# コンテナの稼働状態
docker compose ps
```

#### 1.2 ビルド・型エラーの確認

```bash
# プロダクションビルドでエラー検出
npm run build

# TypeScript 型チェックのみ
npx tsc --noEmit

# ESLint
npm run lint
```

#### 1.3 再現確認チェックリスト

- [ ] エラーメッセージ・スタックトレースを特定した
- [ ] 再現する最小操作手順を確立した
- [ ] 発生環境（local/ST/prod）と発生頻度を確認した
- [ ] 最後に正常動作していたタイミング（git log）を確認した

**再現できない場合**: 断続的な問題の可能性。Step 3（タイムアウト/リトライ観点）から先に確認する。

</step>

### Step 2: 二分探索・計測 (Bisect & Measure)

**目標**: 問題が発生したコミット・コード箇所を特定する

<step>

#### 2.1 リグレッション特定（git bisect）

問題の発生タイミングが特定できる場合に使用:

```bash
# bisect 開始
git bisect start
git bisect bad HEAD                     # 現在のコミットが壊れている
git bisect good <known-good-hash>       # 正常だったコミットのハッシュを指定

# テストを実行して bad/good を判定しながら繰り返す
npm run build && npm run test && git bisect good || git bisect bad

# 問題コミットが特定されたら終了（必ずリセット）
git bisect reset
```

#### 2.2 変更差分の確認

```bash
# 直近の変更履歴
git log --oneline -20

# 特定ファイルの変更履歴
git log --oneline --follow -- <ファイルパス>

# 2コミット間の差分
git diff <commit-a>..<commit-b>
```

#### 2.3 テスト・カバレッジ計測

```bash
# Vitest テスト実行
npm run test

# カバレッジレポート生成（vitest.config に coverage 設定がある場合）
npm run test -- --coverage

# E2E テスト（Playwright）
cd e2e && npx playwright test
```

#### 2.4 Prisma クエリのデバッグ

```bash
# Prisma クエリログを有効化（src/lib/db.ts で log: ['query'] を一時的に追加）
# または環境変数で有効化
DEBUG="prisma:query" npm run dev
```

</step>

### Step 3: タイムアウト/リトライ観点 (Timeout & Retry Audit)

**目標**: タイムアウト未設定・リトライ欠如・エラーの握りつぶしを検出する

<step>

#### 3.1 DB 接続・クエリのタイムアウト設定確認

`src/lib/db.ts` の Prisma クライアント設定、および `.env` の `DATABASE_URL` を確認:

```text
# DATABASE_URL のクエリパラメータで設定可能
postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=10&connect_timeout=10
```

| パラメータ | 推奨値 | 説明 |
|------------|--------|------|
| `connection_limit` | 10 | コネクションプールサイズ |
| `pool_timeout` | 10 | プールからの接続取得タイムアウト（秒） |
| `connect_timeout` | 10 | DB への接続確立タイムアウト（秒） |
| `socket_timeout` | 30 | クエリ実行タイムアウト（秒） |

#### 3.2 外部 API 呼び出しのタイムアウト確認

`fetch` を使用している箇所:

```typescript
// NG: タイムアウトなし（応答が永久に来ない可能性）
const res = await fetch(url)

// OK: AbortController でタイムアウト実装
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 10_000)
try {
  const res = await fetch(url, { signal: controller.signal })
} finally {
  clearTimeout(timeoutId)
}
```

`Next.js fetch` の組み込みオプション:

```typescript
// Next.js 15+ の next.revalidate / next.tags / cache 戦略を併用
const res = await fetch(url, {
  next: { revalidate: 60 },
  signal: AbortSignal.timeout(10_000),
})
```

#### 3.3 リトライ・サーキットブレーカー観点

| 観点 | 確認内容 |
|------|----------|
| 指数バックオフ | リトライ間隔が等間隔ではなく指数的に増加しているか |
| 最大リトライ回数 | 無限リトライになっていないか（上限を設定しているか） |
| 冪等性 | リトライが安全な操作（GET, PUT）に限定されているか |
| サーキットブレーカー | 連続失敗時に処理を止める機構があるか |

#### 3.4 エラーハンドリングの危険パターン検出

**TypeScript（握りつぶし検出）:**

```typescript
// NG: 何もしない catch
try { ... } catch (e) { }

// NG: ログのみで上位に伝播しない
try { ... } catch (e) { console.error(e) }

// OK: カスタム例外でラップして再スロー
try { ... } catch (e) {
  throw new GrowthMileError("処理に失敗しました", { cause: e })
}
```

**未処理 Promise 検出:**

```typescript
// NG: .catch() なし、await もなし
fetch(url).then(res => res.json())

// OK: エラーハンドリングあり
try {
  const data = await fetch(url).then(res => res.json())
} catch (err) {
  handleError(err)
}
```

**Server Action / API Route のエラー応答:**

```typescript
// NG: 例外をそのまま投げる（クライアントに 500 エラーのみ返る）
export async function POST(req: Request) {
  const data = await req.json()
  await db.user.create({ data })  // 例外時に握りつぶされる
}

// OK: try-catch で 型付きエラーレスポンスを返す
export async function POST(req: Request) {
  try {
    const result = schema.safeParse(await req.json())
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }
    const user = await db.user.create({ data: result.data })
    return NextResponse.json<ApiResponse<User>>({ data: user })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

</step>

### Step 4: 診断結果の報告

<step>

以下のフォーマットでターミナルに出力してください:

```markdown
## インシデント診断レポート

### 問題の概要
- **症状**: （ユーザーが報告した内容）
- **発生環境**: local / ST / prod
- **発生頻度**: 常時 / 断続的 / 特定条件下

### 根本原因（推定）
（特定できた場合: 該当コミット・ファイル・行番号）
（特定できない場合: その旨と調査継続の提案）

### 検出された問題点

| 観点 | 状態 | 詳細 |
|------|------|------|
| タイムアウト設定 | OK / WARN / NG | |
| リトライ実装 | OK / WARN / NG | |
| エラーハンドリング | OK / WARN / NG | |
| テストカバレッジ | OK / WARN / NG | |

### 修正提案
1. （具体的な修正案・優先度付き）
2. ...

### 次のアクション
- [ ] 修正実装（implement-feature スキルへ委任するか確認）
- [ ] テスト追加
- [ ] ドキュメント更新（再発防止策）
```

</step>

</steps>

<restrictions>
- 診断のみを行い、ユーザーの確認なしにコードを変更しないこと（修正提案に留める）。
- `git bisect` 実行後は必ず `git bisect reset` でクリーンアップすること。
- `.claude/settings.json` の deny リストに含まれるコマンドを実行しないこと。
- 本番環境（prod）のデータを直接操作するコ
��ンドは実行しないこと。
</restrictions>
