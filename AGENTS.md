# AGENTS.md — Waktool

## Overview

Waktool is a tournament management platform for the game **Wakfu**. It handles tournament creation, team registration, match scheduling, a real-time class draft system, and Discord-based authentication. Deployed on Fly.io (`waktool-prod`, region `cdg`).

## Architecture

- **`back/`** — Spring Boot 4 (Java 21) REST + WebSocket API, PostgreSQL via JPA/Hibernate, Flyway migrations
- **`front/`** — React 19 SPA (TypeScript, Vite, MUI, pnpm), communicates via REST and STOMP WebSocket
- **Monolith deployment**: single Docker image; backend serves frontend static files from `front/dist/`

### Backend layering (hexagonal-ish)

```
api/                → @RestController + @Controller (WebSocket), API DTOs (records in api/models/), MapStruct mappers (api/mappers/)
domain/             → Business logic: controllers/ (domain services), models/, repositories/ (interfaces only)
infra/              → Spring wiring: JPA entities + *RepositoryImpl in infra/db/, config in infra/configuration/, WebSocket in infra/socket/, cron in infra/cron/
utils/              → Cross-cutting: JwtHelper, Translator, TemplateMapper
```

**Key rule**: `domain/` must **never** import from `api/` or `infra/`. Repository interfaces live in `domain/repositories/`; implementations in `infra/db/`.

### Data flow for a typical feature (e.g. Account update)

1. `api/AccountController` receives HTTP request, auth via `@RequestAttribute Optional<String> discordId`
2. Calls `domain/repositories/AccountRepository` (interface) to load/save domain model
3. `infra/db/AccountEntityRepositoryImpl` implements it using `AccountSpringDataRepository` (Spring Data JPA)
4. `infra/mappers/AccountEntityMapper` converts JPA entity ↔ domain model; `api/mappers/AccountMapper` converts domain ↔ API DTO
5. API DTOs are **Java records** (`api/models/AccountResponse.java`)

### JSONB pattern (tournaments, drafts, matches, teams)

Most domain-rich tables store a single `content JSONB` column mapped to a domain model via `@Type(JsonBinaryType.class)` from hypersistence-utils. Example: `TournamentEntity.content` → `Tournament` (domain), `DraftEntity.content` → `DraftData`, `TeamEntity.content` → `Team`, `TournamentMatchEntity.content` → `TournamentMatch`. This means schema changes to these models don't require Flyway migrations — only scalar top-level columns do.

### Authentication

Discord OAuth2 (`OAuthController`) → JWT stored as `token` httpOnly cookie → `TokenInterceptor` decodes it and injects `discordId` as a request attribute → Controllers receive it via `@RequestAttribute Optional<String> discordId`.

### WebSocket / Draft system

- STOMP over WebSocket endpoint at `/socket`, broker prefix `/topic`, app prefix `/app`
- `api/DraftController` uses `@MessageMapping` (not `@RestController`) for real-time draft interactions
- `DraftManager` holds in-memory `Map<String, DraftController>` of active drafts with auto-cleanup every 60s
- Server-provided drafts (tournament matches) are persisted in DB; user-created drafts are ephemeral
- Draft IDs for tournament matches follow the pattern `{matchId}_{round}` (e.g. `abc123_1`)
- Frontend: `front/src/utils/socket.ts` manages STOMP client with `subscribe()`, `send()`, auto-reconnect

### Frontend patterns

- **State**: Zedux atoms in `front/src/atoms/` (simple `atom()` wrappers, no stores)
- **API calls**: `front/src/utils/fetch-utils.ts` — `gfetch` (GET), `pfetch` (POST), `putFetch` (PUT), `detch` (DELETE); all prepend `VITE_BACKEND_URL` and include `credentials: 'include'`
- **Service layer**: `front/src/services/` wraps fetch calls per domain (tournament.ts, account.ts)
- **Type definitions**: `front/src/chore/` holds TypeScript interfaces mirroring backend domain models
- **Routing**: react-router-dom v7 in `front/src/utils/router.tsx`
- **i18n**: i18next with JSON files in `front/public/locales/`

## Build & Run

```bash
# Backend (from back/)
mvn spring-boot:run        # starts on port 8000, auto-starts docker-compose (PostgreSQL on 15435)
mvn clean package           # build + tests

# Frontend (from front/)
pnpm install
pnpm dev                    # Vite dev server

# Tests — backend only, requires Docker running
cd back && mvn test
```

## Testing

- **Framework**: Cucumber BDD with [Tzatziki](https://github.com/Decathlon/tzatziki) + Testcontainers PostgreSQL
- **Feature files**: `back/src/test/resources/com/waktoolbox/waktool/**/*.feature`
- **Shared context**: `WaktoolApplicationSteps.java` — JWT generation, Clock mocking, Testcontainers init
- **Test runner**: `CucumberTest.java` — **do NOT delete**, it wires Cucumber into Maven test phase
- **DB assertions**: Tzatziki's table syntax maps directly to JPA entity fields:
  ```gherkin
  Given the accounts table will contain:
    | id | username | discriminator | email        | ankamaName | ankamaDiscriminator |
    | 1  | Alice    | 1234          | a@test.com   | Alice      | 5678                |
  ```
- **Auth in tests**: `Given token is a valid token for <discordId>` → use `Cookie: token={{token}}` in request headers
- **Clock control**: `Clock` is `@MockitoBean`; tests use Tzatziki's `Time.now()` which can be manipulated with `Given the current time is ...`
- **Cron testing**: `Given the match notificator runs` triggers `MatchNotificationTaskScheduler.run()` directly

## Conventions

- **Lombok** on all backend classes (`@RequiredArgsConstructor`, `@Getter`, `@Setter`, etc.)
- **Underscore-prefixed** private fields everywhere: `private final AccountRepository _accountRepository`
- **MapStruct** mappers extend `TemplateMapper<A, B>` (provides `to`/`from` + list variants). Two layers:
  - `api/mappers/` — domain ↔ API DTO
  - `infra/mappers/` — JPA entity ↔ domain model
- **API DTOs** are Java **records** in `api/models/` (e.g. `AccountResponse`, `SuccessResponse(boolean success)`)
- **Domain models** are Lombok `@Getter @Setter` classes implementing `Serializable` (for JSONB)
- **Flyway** migrations: `back/src/main/resources/db/migration/V0.N__description.sql`
- All REST endpoints under `/api/`; health check at `/health`
- Authorization pattern: controllers check `discordId.isEmpty()` + role-based checks via `_tournamentRepository.isAdmin/isReferee/isStreamer` before acting
- Tournament admin endpoints return `SuccessResponse(false)` on auth failure (no exceptions), while team/account endpoints use `ResponseStatusException`
- Frontend `chore/` directory holds TypeScript interfaces that mirror backend domain model shapes
