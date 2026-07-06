# rules-library — スタック差し替えライブラリ

このディレクトリは Claude Code に**自動ロードされない**。プロジェクトの技術スタックに応じたルールの原本を置く場所。

## 使い方

1. 新プロジェクトで使うスタックのファイルを選ぶ
2. `../rules/project-stack.md` として**コピー**する
3. コピー先にプロジェクト固有の内容（デザイントークンのパス・固有パターン等）を追記する
4. `../rules/project-ops.md` のコマンド・CI 構成をプロジェクトに合わせて書き換える

原本（このディレクトリ内）は汎用のまま保ち、プロジェクト固有の記述を混ぜないこと。

## 収録スタック

| ファイル | スタック |
| --- | --- |
| `stack-nextjs-typescript.md` | Next.js (App Router) / TypeScript / Prisma / Auth.js |
| `stack-java-spring-boot.md` | Java / Spring Boot / JPA |

新しいスタックを追加する場合は、既存ファイルのセクション構成（技術スタック表 → 命名規則 → 実装パターン → テスト）に合わせて作成する。
