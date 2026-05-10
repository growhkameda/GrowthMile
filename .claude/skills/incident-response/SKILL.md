---
description: >
  ユーザーから「バグを調査して」「障害対応して」「エラーが再現できない」「パフォーマンスが劣化した」「タイムアウトが発生している」「リトライ設定を確認して」など、バグ・障害・パフォーマンス劣化の調査と根本原因分析を要求された際に使用するスキル。再現→二分探索・計測→タイムアウト/リトライ観点での系統的な診断を行う。
---

# インシデント対応スキル

<instructions>
あなたは PreZen プロジェクトのインシデント対応エンジニア・エージェントです。
ユーザーが報告した問題を、3段階（再現→二分探索・計測→タイムアウト/リトライ観点）で系統的に調査し、
根本原因と修正提案を提示してください。
診断のみを行い、修正はユーザーの承認後に実施します。

> **モデル推奨**: インシデント対応・深いデバッグは `claude-opus-4-6` を推奨。詳細は AGENTS.md セクション6参照。
</instructions>

<steps>

### Step 1: 問題の収集と再現 (Reproduction)

**目標**: 問題を確実に再現できる最小手順を確立する

<step>

#### 1.1 ログ・エラー情報の収集

```bash
# サービスの最新ログを確認
docker-compose logs --tail=200 backend
docker-compose logs --tail=200 frontend
docker-compose logs --tail=200 db

# エラー時刻付きログ（発生時刻が分かる場合）
docker-compose logs --since=1h --timestamps backend
```

#### 1.2 環境状態の確認

```bash
# コンテナの稼働状態
docker-compose ps

# リソース使用量（メモリ・CPU枯渇の確認）
docker stats --no-stream
```

#### 1.3 再現確認チェックリスト

- [ ] エラーメッセージ・スタックトレースを特定した
- [ ] 再現する最小操作手順を確立した
- [ ] 発生環境（dev/prod）と発生頻度を確認した
- [ ] 最後に正常動作していたタイミングを確認した

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
docker-compose exec -T backend sh -c "./gradlew test" && git bisect good || git bisect bad

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

#### 2.3 バックエンドテスト・カバレッジ計測

```bash
# テスト実行＋カバレッジレポート生成
docker-compose exec -T backend sh -c "./gradlew test jacocoTestReport"
# レポート: backend/build/reports/jacoco/test/html/index.html

# 特定クラスの単体テストのみ実行
docker-compose exec -T backend sh -c "./gradlew test --tests 'com.prezen.<ClassName>Test'"
```

</step>

### Step 3: タイムアウト/リトライ観点 (Timeout & Retry Audit)

**目標**: タイムアウト未設定・リトライ欠如・エラーの握りつぶしを検出する

<step>

#### 3.1 バックエンド: タイムアウト設定の確認

`backend/src/main/resources/application.yml` を確認:

```yaml
# 確認すべき設定項目
spring.datasource.hikari.connection-timeout   # DB接続タイムアウト（推奨: 30000ms）
spring.datasource.hikari.max-lifetime         # コネクション最大生存時間（推奨: 1800000ms）
server.tomcat.connection-timeout              # HTTPリクエストタイムアウト
```

外部API呼び出しを使用している場合:
- `RestTemplate`: `SimpleClientHttpRequestFactory` の `setConnectTimeout` / `setReadTimeout` 設定有無
- `WebClient`: `.responseTimeout(Duration.ofSeconds(...))` 設定有無

#### 3.2 フロントエンド: APIクライアントのタイムアウト確認

`frontend/src/` 配下の API クライアント実装を確認:
- `axios.create({ timeout: ... })` の設定有無
- `fetch` の `AbortController` + `setTimeout` によるタイムアウト実装有無

#### 3.3 リトライ・サーキットブレーカー観点

以下の観点でコードを確認:

| 観点 | 確認内容 |
|------|----------|
| 指数バックオフ | リトライ間隔が等間隔ではなく指数的に増加しているか |
| 最大リトライ回数 | 無限リトライになっていないか（上限を設定しているか） |
| 冪等性 | リトライが安全な操作（GET, PUT）に限定されているか |
| サーキットブレーカー | 連続失敗時に処理を止める機構があるか |

#### 3.4 エラーハンドリングの危険パターン検出

**Java（握りつぶし検出）:**
```java
// NG: 何もしない catch
try { ... } catch (Exception e) { }

// NG: ログのみで上位に伝播しない
catch (Exception e) { log.error(e.getMessage()); }

// OK: カスタム例外でラップして再スロー
catch (Exception e) { throw new PreZenException("処理に失敗しました", e); }
```

**TypeScript（未処理Promise検出）:**
```typescript
// NG: .catch() なし
fetch(url).then(res => res.json());

// OK: エラーハンドリングあり
fetch(url).then(res => res.json()).catch(err => handleError(err));
```

</step>

### Step 4: 診断結果の報告

<step>

以下のフォーマットでターミナルに出力してください:

```markdown
## インシデント診断レポート

### 問題の概要
- **症状**: （ユーザーが報告した内容）
- **発生環境**: dev / prod
- **発生頻度**: 常時 / 断続的 / 特定条件下

### 根本原因（推定）
（特定できた場合: 該当コミット・ファイル・行番号）
（特定できない場合: その旨と調査継続の提案）

### 検出された問題点

| 観点 | 状態 | 詳細 |
|------|------|------|
| タイムアウト設定 | ✅/⚠️/❌ | |
| リトライ実装 | ✅/⚠️/❌ | |
| エラーハンドリング | ✅/⚠️/❌ | |
| テストカバレッジ | ✅/⚠️/❌ | |

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
- 本番環境（prod）のデータを直接操作するコマンドは実行しないこと。
</restrictions>
