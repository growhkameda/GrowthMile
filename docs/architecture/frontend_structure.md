<!-- markdownlint-disable -->

# PreZen プロジェクト構造ガイド

**最終更新**: 2026-01-14

初学者向けに、フロントエンドのディレクトリ構造と各フォルダの役割をまとめたガイドです。

---

## 📋 目次

1. [構造の概要](#構造の概要)
2. [Feature-based 構造とは](#feature-based構造とは)
3. [ディレクトリ役割一覧](#ディレクトリ役割一覧)
4. [ファイルを置く場所の判断フロー](#ファイルを置く場所の判断フロー)
5. [新機能追加時の手順](#新機能追加時の手順)

---

## 構造の概要

```
frontend/src/
├── features/          # 機能別モジュール（認証、チケット、ログなど）
├── components/        # 共通コンポーネント（ボタン、レイアウトなど）
├── pages/             # ページ（URLと対応）
├── hooks/             # 共通カスタムフック
├── services/          # API通信の共通設定
├── stores/            # 共通ストア（基本は空）
├── types/             # TypeScript型定義
├── utils/             # ヘルパー関数
├── assets/            # 画像・フォント
├── App.tsx            # ルーティング設定
└── main.tsx           # エントリーポイント
```

---

## Feature-based 構造とは

**「機能ごとにファイルをまとめる」** 設計パターンです。

### メリット

- 機能追加・修正時に 1 つのフォルダで完結
- チーム開発でコンフリクトが起きにくい
- 機能削除時はフォルダごと削除するだけ

### 例: チケット機能を修正する場合

```
features/tickets/
├── components/    ← UIを修正
├── stores/        ← 状態を修正
├── services/      ← API通信を修正
└── index.ts
```

**1 つのフォルダ内で作業が完結！**

---

## ディレクトリ役割一覧

### features/{機能名}/ - 機能別モジュール

特定の機能に関連するファイルをすべてまとめる場所。

| サブディレクトリ | 役割                   | 置くファイル例                                       |
| ---------------- | ---------------------- | ---------------------------------------------------- |
| `components/`    | その機能専用の UI 部品 | `LoginForm.tsx`, `TicketCard.tsx`                    |
| `stores/`        | 状態管理（Zustand）    | `authStore.ts`, `ticketStore.ts`                     |
| `services/`      | API 通信処理           | `authService.ts`, `ticketService.ts`                 |
| `index.ts`       | エクスポート用         | `export { LoginForm } from './components/LoginForm'` |

**現在の features:**

- `auth/` - 認証機能（ログイン、ログアウト、ユーザー情報）

**今後追加予定:**

- `tickets/` - チケット管理
- `teams/` - チーム管理
- `dashboard/` - ダッシュボード
- `logs/` - システムログ
- `comments/` - コメント機能

---

### components/ - 共通コンポーネント

複数の機能で再利用する UI 部品を置く場所。

| サブディレクトリ | 役割               | 置くファイル例                                     |
| ---------------- | ------------------ | -------------------------------------------------- |
| `layout/`        | ページ全体の枠組み | `Header.tsx`, `Footer.tsx`, `Layout.tsx`           |
| `ui/`            | 汎用的な UI 部品   | `Button.tsx`, `Toast.tsx`, `Badge.tsx`, `Logo.tsx` |

**判断基準**: 2 つ以上の機能で使うものはここに置く

---

### pages/ - ページ

URL と 1 対 1 で対応するページコンポーネント。

| ファイル               | URL            | 役割           |
| ---------------------- | -------------- | -------------- |
| `LoginPage.tsx`        | `/login`       | ログイン画面   |
| `DashboardPage.tsx`    | `/dashboard`   | ダッシュボード |
| `TicketListPage.tsx`   | `/tickets`     | チケット一覧   |
| `TicketDetailPage.tsx` | `/tickets/:id` | チケット詳細   |
| `NotFoundPage.tsx`     | `*`            | 404 エラー     |

**役割**: features のコンポーネントを組み合わせて画面を構成

---

### その他のディレクトリ

| ディレクトリ | 役割                       | 置くファイル例                  |
| ------------ | -------------------------- | ------------------------------- |
| `hooks/`     | 複数機能で使う共通ロジック | `useToast.ts`, `useDebounce.ts` |
| `services/`  | API 通信の共通設定         | `api.ts`（Axios 設定）          |
| `types/`     | TypeScript 型定義          | `ticket.ts`, `auth.ts`          |
| `utils/`     | 汎用ヘルパー関数           | `formatDate.ts`, `truncate.ts`  |
| `assets/`    | 画像・フォント             | `logo.png`                      |

---

## ファイルを置く場所の判断フロー

```
新しいファイルを作成する
        ↓
この機能だけで使う？
   ├─ Yes → features/{機能名}/{種類}/
   │         └ 例: features/tickets/components/TicketCard.tsx
   │
   └─ No（複数の機能で使う）
         ↓
      UIコンポーネント？
         ├─ Yes → components/ui/ または components/layout/
         │         └ 例: components/ui/Button.tsx
         │
         └─ No
               ↓
            型定義？ → types/
            ロジック？ → hooks/ または utils/
            API設定？ → services/
```

---

## 新機能追加時の手順

### 例: 「通知機能」を追加する場合

**Step 1: features にフォルダ作成**

```
src/features/notifications/
├── components/
├── stores/
├── services/
└── index.ts
```

**Step 2: 必要なファイルを作成**

```
src/features/notifications/
├── components/
│   ├── NotificationList.tsx
│   └── NotificationItem.tsx
├── stores/
│   └── notificationStore.ts
├── services/
│   └── notificationService.ts
└── index.ts
```

**Step 3: ページを作成（必要なら）**

```
src/pages/NotificationsPage.tsx
```

**Step 4: App.tsx にルーティング追加**

```tsx
<Route path="/notifications" element={<NotificationsPage />} />
```

---

## 参考: SpringBoot との対応

| React         | SpringBoot        | 役割             |
| ------------- | ----------------- | ---------------- |
| `components/` | Controller + View | ユーザーとの接点 |
| `hooks/`      | Service           | ビジネスロジック |
| `stores/`     | Entity + Session  | 状態保持         |
| `services/`   | Repository        | 外部通信         |
| `types/`      | DTO               | データ型定義     |

---

## よくある質問

### Q: stores は features の中に置くべき？共通の stores/に置くべき？

**A: 基本は features の中**

- その機能専用のストア → `features/{機能名}/stores/`
- 複数機能で共有するストア → `stores/`（ほぼ使わない）

### Q: feature 間で共有したいコンポーネントはどこに置く？

**A: components/ui/に置く**

2 つ以上の feature で使うなら、共通コンポーネントとして扱う

### Q: 新しい feature を作る基準は？

**A: 独立した機能かどうか**

- 独自のページを持つ → 新しい feature
- 他の機能の一部 → 既存の feature 内に作成
