# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> A parent `E:\dow2\CLAUDE.md` also applies. It requires every response to begin with the word **"Sidi"** and enforces strict "never break existing code / no placeholders / minimal targeted changes" rules. Follow both.

## Stack

Laravel 12 (PHP 8.2) + Inertia.js 2 + React 19 SPA, Vite 7, Tailwind 3. MySQL in prod, SQLite `:memory:` for tests. Redis (predis) for cache/queue in prod. Arabic-first, RTL, bilingual (ar/en).

This is **Earth Innovators** — an educational platform connecting students, teachers, and schools around innovation projects, challenges, publications, badges, certificates, and paid memberships.

## Commands

```bash
composer dev          # runs server + queue listener + pail logs + vite concurrently (main dev command)
composer test         # clears config then runs php artisan test (PHPUnit)
php artisan test --filter PackageControllerTest   # single test class
php artisan test tests/Feature/BookingServiceTest.php   # single file
npm run dev           # vite only
npm run build         # vite build + writes public/build-version.json (used for app-update notifications)
npm run lint          # eslint resources/js
npm run lint:fix
npm run format        # prettier resources/js
npm run i18n:audit    # node scripts/i18n-audit.mjs — checks ar/en translation key parity
composer run pint     # (laravel/pint) PHP formatter, if invoked directly: ./vendor/bin/pint
```

Real-time (optional): `npm run echo-server` (laravel-echo-server) or `npm run dev:full` to run vite + echo + serve + queue together.

## Architecture

### Request flow
Routes (`routes/web.php` — ~1000 lines, the single source of truth for the app; `routes/auth.php` for auth, `routes/channels.php` for broadcast) → middleware → thin Controllers → **Services** (`app/Services/`) hold the business logic. Controllers should stay thin; put logic in a Service. Many Services extend `BaseService`.

### Roles & authorization
Role lives on `User.role`. Role checks are methods on `User` (`isTeacher()`, `isStudent()`, `isSchool()`, `isAdmin()`, `canAccessAdminPanel()`, `isSystemSupervisor()`, `isSchoolSupportCoordinator()`). Roles: `student`, `teacher`, `school` (aka `educational_institution`), `admin`, `system_supervisor`, `school_support_coordinator`.

Middleware aliases (registered in `bootstrap/app.php`, not a Kernel): `auth`, `admin`, `teacher`, `school`, `system_supervisor`, `school_support_coordinator`, `membership_active`, `redirect_student_explore`. Route groups are namespaced by role (`school.`, `teacher.`, `student.`, `admin.`) with matching controller subfolders under `app/Http/Controllers/{School,Teacher,Student,Admin}`.

`membership_active` (`EnsureMembershipActive`) gates most authenticated features behind an active/trial `UserPackage` subscription — be aware it wraps almost every dashboard route.

### Inertia bridge
`app/Http/Middleware/HandleInertiaRequests.php` defines shared props on **every** page: `auth.user` (minimal fields only — id/name/email/role/school_id/image), `flash`, `old`, `subscription` (trial/expiry banner data), `supportContact`, `site`, `appBuildId`. Keep this payload small — it ships on every request. Pages resolve from `resources/js/Pages/**/*.jsx` via `resolvePageComponent`.

### Frontend state
`resources/js/app.jsx` wraps the app in Redux (`store/store.js`), React Query (`lib/react-query`), and custom `ToastProvider` / `ConfirmProvider` contexts. There is also Zustand (`stores/`). Redux slices under `store/slices`. Use existing patterns — don't add a new state library.

### i18n (important, non-standard)
Translations are **client-side** in `resources/js/i18n/ar.js` and `en.js` (each 250–330 KB). `getTranslation(language, key, params)` resolves dot-keys and interpolates `{param}` placeholders; missing keys warn to console and collect on `window.__i18nMissing`. Default language is `ar` (RTL); stored in `localStorage` and mirrored to a `locale` cookie so server-rendered strings match. **When adding UI text, add the key to BOTH `ar.js` and `en.js`** and run `npm run i18n:audit`. Server-side Arabic strings appear directly in controllers/routes.

### Storage / media
User files are served through `StorageController` at `/media/{path}` and legacy `/storage/{path}` (see top of `routes/web.php`), NOT the default symlink. Build URLs with `App\Support\StorageUrl::url($path, $cacheBuster)`.

### AI & scoring engines
- `app/Services/AIEngine/` — content analysis, report generation, recommendations, smart search. LLM calls go through `GeminiClient` (Google Gemini API, config in `config/services.php` under `gemini`, key `GEMINI_API_KEY`). Heavy AI work is queued: `app/Jobs/GenerateAIReportJob`, `AnalyzeAchievementJob`, `RecalculateIndexesJob`.
- `app/Services/ScoringEngine/` — computes innovation indexes (Creativity, Skills, Leadership, FutureReadiness, IP, Intelligence, Projects) via per-index calculators orchestrated by `ScoringEngineService`.

### Payments & documents
Payments via **Ziina** (webhook `POST /webhook/ziina`, CSRF-exempt) and **Tamara** (`config/services.php`). Certificates & invoices are generated as PDFs with TCPDF + FPDI (`CertificateService`, `MembershipCertificateService`) — Tajawal Arabic font with fallback. Excel exports via maatwebsite/excel (`app/Exports/`). QR codes via simplesoftwareio/simple-qrcode.

## Conventions

- Business logic → Services, not Controllers. Validation → `app/Http/Requests/`. API-shaped responses → `app/Http/Resources/`.
- CSRF 419 and `PostTooLargeException` are handled globally in `bootstrap/app.php` (Inertia gets a 409 forced reload). Don't re-handle these per-controller.
- File uploads on updates use POST + `forceFormData` (PHP only populates `$_FILES` on POST) — see the `project-submissions` route comment; follow that pattern for multipart updates.
- Landing/home data is heavily `Cache::remember(..., 3600, ...)`; clear the relevant cache key when changing what those queries return.
- Tests run against SQLite `:memory:` with array cache/session and sync queue (`phpunit.xml`); a `TestServiceProvider` loads only in that testing+array-cache combination.
