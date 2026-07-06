# スタックルール: Java / Spring Boot

> [INFO] 汎用スタックルールの原本。使用時は `rules/project-stack.md` へコピーし、プロジェクト固有情報（Java バージョン・ビルドツール・DB 等）を追記する。

## 技術スタック（標準構成）

| 分類 | 採用技術 |
| --- | --- |
| フレームワーク | Spring Boot（Web MVC） |
| ORM | Spring Data JPA（Hibernate） |
| バリデーション | Bean Validation（`jakarta.validation`） |
| DB マイグレーション | Flyway または Liquibase |
| テスト | JUnit 5 + Mockito + Spring Boot Test / Testcontainers |
| ビルド | Gradle または Maven |

## レイヤードアーキテクチャ（厳守）

```text
Controller → Service → Repository → Entity
```

- **Controller**: リクエスト受付・バリデーション・レスポンス変換のみ。ビジネスロジックを書かない
- **Service**: ビジネスロジックとトランザクション境界。`@Transactional` はここに付ける
- **Repository**: データアクセスのみ。Spring Data JPA のインターフェースを基本とする
- 下位レイヤーから上位レイヤーへの参照禁止（Repository が Service を呼ばない）

## DTO と Entity の分離

- Controller の入出力には必ず DTO（record 推奨）を使用し、Entity を直接返さない
- 理由: Entity の公開は意図しない項目漏洩・遅延ロード例外・API とスキーマの密結合を招く
- 変換ロジックは DTO 側の static factory または専用 Mapper に置く

## バリデーション

- リクエスト DTO に Bean Validation アノテーション（`@NotNull`, `@Size` 等）を付け、Controller で `@Valid` を必ず指定する
- ビジネスルール上の検証（重複チェック等）は Service 層で行い、専用の業務例外を投げる

## 例外設計

- 業務例外はカスタム例外クラス（`BusinessException` 系）として定義する
- 例外→HTTP レスポンス変換は `@RestControllerAdvice` + `@ExceptionHandler` で一元化する
- スタックトレース・内部実装の詳細をレスポンスに含めない
- 空 catch 禁止。捕捉したら回復・変換・ログのいずれかを必ず行う

## トランザクション

- `@Transactional` は Service の public メソッドに付与する（self-invocation では効かないことに注意）
- 読み取り専用は `@Transactional(readOnly = true)` を明示する
- トランザクション内で外部 API 呼び出しを行わない

## JPA の注意点

- N+1 対策: `fetch join` / `@EntityGraph` を使用し、ループ内クエリを作らない
- 双方向関連は必要な場合のみ。`toString` / `equals` の無限ループに注意
- 一覧取得は `Pageable` によるページネーションを必須とする

## 命名規則

- クラス: `PascalCase` / メソッド・変数: `camelCase` / 定数: `UPPER_SNAKE_CASE`
- DB テーブル・カラム: `snake_case`
- Lombok を使う場合は `@Data` を Entity に付けない（`equals`/`hashCode` 事故防止）。`@Getter` 等を個別に付与する

## テスト

- Service のユニットテストは Mockito でリポジトリをモックする
- Repository・統合テストは Testcontainers で実 DB に近い環境を使う
- Controller は `@WebMvcTest` + MockMvc でリクエスト/レスポンス契約を検証する
