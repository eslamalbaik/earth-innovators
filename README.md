# Earth Innovators

Educational platform connecting **students, teachers, and schools** around innovation
projects, challenges, publications, badges, certificates, and paid memberships.
Arabic-first (RTL), fully bilingual (ar / en).

## Stack

- **Backend:** Laravel 12, PHP 8.2
- **Frontend:** React 19 + Inertia.js 2 (SPA), Vite 7, Tailwind 3
- **Data:** MySQL (prod), SQLite `:memory:` (tests), Redis (cache / queue in prod)
- **Payments:** Ziina, Tamara
- **AI & scoring:** DeepSeek API (content analysis, reports, recommendations) +
  in-house scoring engine (innovation indexes)
- **Documents:** TCPDF + FPDI (certificates, invoices), maatwebsite/excel (exports),
  simple-qrcode (QR)

## Requirements

- PHP 8.2+ (extensions: `mbstring`, `pdo_sqlite`/`pdo_mysql`, `gd`, `zip`, `bcmath`)
- Composer 2
- Node.js 22+ / npm
- MySQL 8 and Redis for a production-like environment (optional locally — SQLite works)

## Getting started

```bash
composer setup      # install deps, create .env, generate key, migrate, build assets
```

Then edit `.env` (see **Configuration** below) and start the dev environment:

```bash
composer dev        # server + queue listener + pail logs + vite, all concurrently
```

If you prefer to run pieces individually:

```bash
php artisan serve
php artisan queue:listen
npm run dev
```

## Configuration

Copy `.env.example` to `.env` and fill in the relevant keys. Notable groups:

| Group        | Keys |
|--------------|------|
| App / URLs   | `APP_URL`, `APP_PRIMARY_URL`, `APP_SECONDARY_HOSTS`, `APP_REDIRECT_TO_PRIMARY` |
| Database     | `DB_CONNECTION` (`sqlite` locally, `mysql` in prod) + `DB_*` |
| Cache/Queue  | `CACHE_STORE`, `QUEUE_CONNECTION`, `REDIS_*` |
| Payments     | `ZIINA_*`, `TAMARA_*` |
| AI           | `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL` |
| Media        | `UNSPLASH_ACCESS_KEY` / `UNSPLASH_SECRET_KEY` |
| Support info | `VITE_SUPPORT_*`, `SUPPORT_*` |

## Common commands

```bash
composer dev                       # main dev command (server + queue + logs + vite)
composer test                      # clears config, then runs the PHPUnit suite
php artisan test --filter Name     # run a single test class/method
npm run dev                        # vite only
npm run build                      # production assets + build-version.json
npm run i18n:audit                 # check ar/en translation key parity
./vendor/bin/pint                  # PHP code style (Laravel Pint)
```

## Architecture (short)

- **Routes** live in `routes/web.php` (main), `routes/auth.php`, `routes/channels.php`.
- **Controllers stay thin** — business logic lives in **Services** (`app/Services/`),
  most extending `BaseService`.
- **Roles** are on `User.role` (`student`, `teacher`, `school`, `admin`,
  `system_supervisor`, `school_support_coordinator`), checked via methods like
  `isTeacher()` / `canAccessAdminPanel()`. Middleware aliases are registered in
  `bootstrap/app.php`.
- **Inertia** shared props are defined in `app/Http/Middleware/HandleInertiaRequests.php`;
  pages resolve from `resources/js/Pages/**/*.jsx`.
- **i18n is client-side** in `resources/js/i18n/{ar,en}.js`. When adding UI text, add the
  key to **both** files and run `npm run i18n:audit`.
- **Media** is served through `StorageController` at `/media/{path}`; build URLs with
  `App\Support\StorageUrl::url($path)`.
- **AI / scoring** engines live under `app/Services/AIEngine/` and
  `app/Services/ScoringEngine/`; heavy work is queued (`app/Jobs/`).

See [`CLAUDE.md`](CLAUDE.md) for the full architecture and conventions guide.

## Testing

Tests run against SQLite `:memory:` with array cache/session and a synchronous queue
(pinned in `phpunit.xml`) — no external services required.

```bash
composer test
```

CI (GitHub Actions, `.github/workflows/ci.yml`) runs the PHP test suite, the i18n parity
audit, and a production asset build on every push and pull request to `main`.
