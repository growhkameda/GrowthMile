# pending-setup.md — 未確定・未接続の設定一覧

> このファイルはインフラ・CI/CD 設定のうち、**接続先やアカウントが未確定のため後回しにしている項目**を管理するためのメモです。
> 実装フェーズの環境確定のタイミングに応じて順次対応し、完了したらチェックを入れてください。

---

## 1. GitHub Actions Secrets / Variables（要手動登録）

GitHub リポジトリの **Settings → Secrets and variables → Actions** に、必要に応じて **Secrets**（機密）または **Variables**（非機密）として登録します。
値が未設定の場合、対応ジョブが実行時に失敗します。

| 名前 | 用途 | 対応ジョブ | 優先度 |
|------|------|-----------|--------|
| `CI_DB_USER` | E2E 用 DB ユーザー名 | `e2e-playwright` | 高（E2E 追加後） |
| `CI_DB_PASSWORD` | E2E 用 DB パスワード | `e2e-playwright` | 高 |
| `CI_DB_NAME` | E2E 用 DB 名 | `e2e-playwright` | 高 |
| `CI_NEXTAUTH_SECRET` | NextAuth 署名鍵（32 文字以上） | `e2e-playwright` | 高 |

**gitleaks-action（組織リポジトリの場合）**: [gitleaks-action v2](https://github.com/gitleaks/gitleaks-action) は組織アカウントでは `GITLEAKS_LICENSE` が必要な場合があります。個人アカウントのリポジトリでは通常不要です。

**DAST**: 本リポジトリでは DAST（動的アプリケーションセキュリティテスト）の自動スキャンは未設定です。必要なら別ワークフロー（例：OWASP ZAP）で追加してください。

---

## 2. デプロイスクリプト（スタブのまま）

以下のジョブはインフラ未確定のため **echo のスタブ**です（`.github/workflows/ci.yml`）。
デプロイ先が確定したら実コマンドに置換します。

### `deploy-staging`

```yaml
# 現状（スタブ）
- run: echo "Staging deployment completed…"

# 置換例（AWS ECS）
# - aws ecs update-service --cluster growth-mile-staging --service growth-mile-app --force-new-deployment
```

### `deploy-production`

`workflow_dispatch` のみで起動。GitHub Environment の **Required reviewers** で承認ゲートをかける運用を推奨します。

---

## 3. インフラ構成未確定（`docs/architecture/spec-infrastructure.md`）

本番・ステージングのインフラが未確定です。確定するまで §1・§2 の本番向け値はブロックされがちです。

| コンポーネント | 候補 | 決定事項 |
|--------------|------|----------|
| アプリケーション実行 | Vercel / AWS ECS / Cloud Run | **未決定** |
| データベース | Supabase / AWS RDS / マネージド PostgreSQL | **未決定** |
| CDN / リバースプロキシ | Cloudflare / CloudFront / ALB | **未決定** |
| SSL | Let's Encrypt / Cloudflare / AWS ACM | **未決定** |

インフラ確定後は `spec-infrastructure.md` を更新し、§1・§2 を順次対応してください。

---

## 4. E2E テスト環境の整備

ワークフロー `e2e-playwright` は **`e2e/package.json` が存在する場合のみ**実行されます。
追加後は Secrets（§1）を設定してください。

- `e2e/` の初期化（`npm create playwright@latest` 等）
- `e2e/playwright.config.ts` の `baseURL` を `http://localhost:3000` に合わせる
- `e2e/package-lock.json` を git にコミット（workspace 外のため個別管理）

### `e2e-playwright` ジョブの安定化（要対応）

`.github/workflows/ci.yml` の `e2e-playwright` ジョブで **`services.db` に health check が未設定**です。
PostgreSQL が起動完了する前に `prisma migrate deploy` が走ると失敗するリスクがあるため、
E2E 着手時に下記の `options` を追加してください（Claude Code 担当）。

```yaml
services:
  db:
    image: postgres:15-alpine
    env:
      POSTGRES_USER: ${{ secrets.CI_DB_USER }}
      POSTGRES_PASSWORD: ${{ secrets.CI_DB_PASSWORD }}
      POSTGRES_DB: ${{ secrets.CI_DB_NAME }}
    options: >-
      --health-cmd "pg_isready -U $POSTGRES_USER -d $POSTGRES_DB"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

---

## 5. リポジトリ衛生（要ターミナル実行）

Cursor では実施しない、ローカルでのクリーンアップ作業です。Claude Code か手元で実行してください。

### 5.1 `tmpapp/` ディレクトリの削除

`tmpapp/` に別アプリのコピー（`node_modules` ・ `.next` ・ `.git` を含む 1 万ファイル超）が残存しています。
Git に取り込まれていなければ単純削除で問題ありません。

```bash
rm -rf tmpapp
git status
```

### 5.2 `.env` の追跡解除確認

ルート直下の `.env` が誤って追跡されていないか確認します（`.gitignore` の `.env*` は新規追跡のみを防ぐため、過去に `git add` 済みであれば残ります）。

```bash
git ls-files --error-unmatch .env 2>/dev/null && git rm --cached .env || echo ".env は追跡されていません（OK）"
```

### 5.3 `.gitignore` の補強

create-next-app 初期状態のままなので、エビデンス・ログ・E2E 生成物の除外を追記します。

```gitignore
# evidence・ローカルログ
docs/evidence/
.claude/logs/

# e2e（ワークスペース外、独自 lock を持つ）
e2e/node_modules/
e2e/test-results/
e2e/playwright-report/
```

### 5.4 README 既存文との整合確認

`README.md` を `src/app` 構成・日本語版へ刷新済み。`app/page.tsx` 等の旧パス記述が残っていないか CI で検出する場合は別途 lint 設定を追加してください。

---

## 対応優先度マップ

```text
リポジトリ衛生（§5：tmpapp 削除・.env 追跡解除・.gitignore 補強）
  → リポジトリの汚れと事故リスクを取り除く
E2E 環境整備（§4：health check 含む）
  → E2E テストが書けるようになる
GitHub Secrets 登録（§1）
  → E2E ジョブが安定してパスする
インフラ確定（§3）
  → デプロイ先が決まる
デプロイスクリプト実装（§2）
```
