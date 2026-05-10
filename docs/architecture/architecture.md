# アーキテクチャおよび技術スタック

本ドキュメントは、プロジェクトのシステム構成、技術スタック、およびディレクトリ構成などを整理したものです。

## 1. 技術スタック

| レイヤー         | 技術                                                     |
| ---------------- | -------------------------------------------------------- |
| フロントエンド   | React 19, Vite, TypeScript, TailwindCSS 4                |
| 状態管理         | Zustand（認証ストア、チームストア）                      |
| HTTPクライアント | Axios → `http://localhost:3000/api`                      |
| バックエンド     | Java 21, Spring Boot 3.2.5, Gradle                       |
| 認証             | Spring Security + JWT (httpOnly Cookie, SameSite=Strict) |
| ORM              | Spring Data JPA (Hibernate)                              |
| DB               | PostgreSQL 15                                            |

## 2. アーキテクチャ概要

### フロントエンド — Feature-basedモジュラー構成

```text
frontend/src/features/<機能名>/ → components/, stores/, services/
frontend/src/components/         → ui/, layout/ (共通)
frontend/src/pages/              → ページコンポーネント
```

環境変数: `VITE_API_URL` でバックエンドURLを制御。

### バックエンド — Spring Boot レイヤード構成

```text
Controller → Service → Repository → Entity
com.prezen.{ controller, service, repository, entity, dto, config, security }
```

### プロファイル

- **dev**（デフォルト）: ポート3000、認証スキップ、`ddl-auto: update`
- **prod**: ポート8080、認証必須、`ddl-auto: validate`、HTTPS

## 3. 既知の注意事項

- CORS: dev環境ではポート5173→3000のプリフライトリクエストに注意
- JWT: SameSite=Strictはクロスオリジンリダイレクトでは機能しない
- PostgreSQL: `ddl-auto: update` はdev環境のみ
