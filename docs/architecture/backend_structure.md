<!-- markdownlint-disable -->

# PreZen バックエンド構造ガイド

**最終更新**: 2026-01-21

初学者向けに、Spring Boot のディレクトリ構造と各フォルダの役割をまとめたガイドです。

---

## 📋 目次

1. [構造の概要](#構造の概要)
2. [各パッケージの役割](#各パッケージの役割)
3. [リクエストの流れ](#リクエストの流れ)
4. [新機能追加時の手順](#新機能追加時の手順)

---

## 構造の概要

```
backend/
├── build.gradle                   # Gradle設定
├── settings.gradle                # プロジェクト名
├── gradlew / gradlew.bat          # Gradle Wrapper
├── src/main/java/com/prezen/
│   ├── PreZenApplication.java     # エントリーポイント
│   ├── config/                    # 設定クラス
│   ├── controller/                # REST API
│   ├── service/                   # ビジネスロジック
│   ├── repository/                # データアクセス
│   ├── entity/                    # JPAエンティティ
│   ├── dto/                       # データ転送オブジェクト
│   ├── security/                  # JWT・認証関連
│   └── exception/                 # 例外処理
└── src/main/resources/
    └── application.yml            # 設定ファイル
```

---

## 各パッケージの役割

### config/ - 設定クラス

Spring の設定を管理するクラスを置く場所。

| ファイル               | 役割                   |
| ---------------------- | ---------------------- |
| `SecurityConfig.java`  | Spring Security の設定 |
| `WebSocketConfig.java` | WebSocket の設定       |
| `CorsConfig.java`      | CORS の設定            |

---

### controller/ - REST API

HTTP リクエストを受け取り、レスポンスを返すクラス。

| アノテーション    | 説明            |
| ----------------- | --------------- |
| `@RestController` | REST API を提供 |
| `@RequestMapping` | URL パスを指定  |
| `@GetMapping`     | GET リクエスト  |
| `@PostMapping`    | POST リクエスト |

**例:**

```java
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @GetMapping
    public List<TicketDto> getAll() { ... }

    @PostMapping
    public TicketDto create(@RequestBody TicketRequest request) { ... }
}
```

---

### service/ - ビジネスロジック

ビジネスルールを実装するクラス。Controller から呼ばれる。

| アノテーション   | 説明                 |
| ---------------- | -------------------- |
| `@Service`       | サービスクラス       |
| `@Transactional` | トランザクション管理 |

**例:**

```java
@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketDto create(TicketRequest request) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        return ticketRepository.save(ticket);
    }
}
```

---

### repository/ - データアクセス

DB とのやり取りを行うインターフェース。Spring Data JPA が自動実装。

| アノテーション  | 説明                    |
| --------------- | ----------------------- |
| `JpaRepository` | CRUD メソッドを自動提供 |
| `@Query`        | カスタムクエリ          |

**例:**

```java
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    List<Ticket> findByTeamId(UUID teamId);

    @Query("SELECT t FROM Ticket t WHERE t.assignee.id = :userId")
    List<Ticket> findAssignedToUser(@Param("userId") UUID userId);
}
```

---

### entity/ - JPA エンティティ

DB テーブルに対応するクラス。

| アノテーション | 説明               |
| -------------- | ------------------ |
| `@Entity`      | エンティティクラス |
| `@Table`       | テーブル名指定     |
| `@Id`          | 主キー             |
| `@ManyToOne`   | 多対一リレーション |

**例:**

```java
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;
}
```

---

### dto/ - データ転送オブジェクト

API のリクエスト/レスポンス用のクラス。

| 種類        | 用途             |
| ----------- | ---------------- |
| `*Request`  | リクエストボディ |
| `*Response` | レスポンスボディ |
| `*Dto`      | 汎用             |

**例:**

```java
public class TicketRequest {
    private String title;
    private String description;
    private UUID assigneeId;
}
```

---

### security/ - JWT・認証関連

JWT トークンの生成・検証を行うクラス。

| ファイル                       | 役割                         |
| ------------------------------ | ---------------------------- |
| `JwtTokenProvider.java`        | JWT 生成・検証               |
| `JwtAuthenticationFilter.java` | リクエストごとの認証チェック |

---

### exception/ - 例外処理

カスタム例外とグローバルエラーハンドラー。

| ファイル                         | 役割                       |
| -------------------------------- | -------------------------- |
| `GlobalExceptionHandler.java`    | 例外を統一形式でレスポンス |
| `ResourceNotFoundException.java` | 404 エラー                 |

---

## リクエストの流れ

```
クライアント
    ↓ HTTP Request
JwtAuthenticationFilter (認証チェック)
    ↓
Controller (リクエスト受付)
    ↓
Service (ビジネスロジック)
    ↓
Repository (DB操作)
    ↓
Entity (データ)
    ↓
Controller (レスポンス返却)
    ↓ HTTP Response
クライアント
```

---

## 新機能追加時の手順

### 例: 「通知機能」を追加する場合

**Step 1: エンティティ作成**

```
entity/Notification.java
```

**Step 2: リポジトリ作成**

```
repository/NotificationRepository.java
```

**Step 3: サービス作成**

```
service/NotificationService.java
```

**Step 4: コントローラー作成**

```
controller/NotificationController.java
```

**Step 5: DTO 作成**

```
dto/NotificationDto.java
dto/NotificationRequest.java
```

---

## 参考: Express との対応

| Spring Boot       | Express       | 役割             |
| ----------------- | ------------- | ---------------- |
| `@RestController` | Router        | ルーティング     |
| `@Service`        | Service       | ビジネスロジック |
| `JpaRepository`   | Prisma Client | DB 操作          |
| `@Entity`         | Prisma Model  | データモデル     |
| `application.yml` | .env          | 設定             |
