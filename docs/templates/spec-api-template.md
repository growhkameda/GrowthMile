---
title: "API仕様書"
project: "プロジェクト名"
version: "1.0"
date: "YYYY-MM-DD"
author: "作成者"
---

# API仕様書

## 更新履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|-----------|---------|--------|
| YYYY-MM-DD | 1.0 | 初版作成 | - |

## 1. 共通仕様

| 項目 | 内容 |
|------|------|
| ベースURL | `https://example.com/api` |
| 認証方式 | JWT / Cookie / Bearer Token |
| レスポンス形式 | `application/json` |
| 文字エンコーディング | UTF-8 |

### 1.1 認証方式

認証方式の詳細を記述する。

### 1.2 エラーレスポンス共通形式

| HTTPステータス | 用途 |
|---------------|------|
| `400 Bad Request` | リクエスト不正 |
| `401 Unauthorized` | 未認証 |
| `403 Forbidden` | 権限不足 |
| `404 Not Found` | リソース未存在 |
| `500 Internal Server Error` | サーバーエラー |

```json
{
  "error": "エラーコード",
  "message": "エラーの詳細メッセージ"
}
```

## 2. エンドポイント一覧

| # | メソッド | パス | 概要 | 認証 |
|---|---------|------|------|------|
| 1 | POST | `/auth/login` | ログイン | 不要 |
| 2 | POST | `/auth/logout` | ログアウト | 不要 |
| 3 | GET | `/auth/me` | 現在のユーザー情報 | 必須 |

## 3. エンドポイント詳細

### 3.1 `POST /auth/login`

| 項目 | 内容 |
|------|------|
| 概要 | メールアドレス + パスワードでログイン認証を行う |
| 認証 | 不要 |
| レート制限 | 5回/分（ブルートフォース対策） |

#### リクエストボディ

| パラメータ | 型 | 必須 | 説明 | 制約 |
|-----------|------|------|------|------|
| `email` | string | [OK] | メールアドレス | RFC 5322準拠 |
| `password` | string | [OK] | パスワード | 8文字以上 |

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### レスポンス

**成功: `200 OK`**

| フィールド | 型 | 説明 |
|-----------|------|------|
| `user.id` | string (UUID) | ユーザーID |
| `user.email` | string | メールアドレス |
| `user.username` | string | 表示名 |

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "山田太郎"
  }
}
```

**エラー: `401 Unauthorized`**

```json
{
  "error": "Invalid credentials",
  "message": "メールアドレスまたはパスワードが正しくありません"
}
```

#### 副作用・備考

- 成功時、`Set-Cookie` ヘッダーでJWTトークンを発行
- ログイン試行回数が上限を超えた場合、一定時間ロックされる
