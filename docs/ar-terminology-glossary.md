# Arabic (MSA) Terminology Glossary — Earth Innovators

**Status:** Official reference, established by the platform-wide Arabic linguistic
review (2026-09-15).
**Scope:** `resources/js/i18n/ar.js` (client-side UI strings) and any new
server-side Arabic strings. Applies to all new/edited UI copy going forward.
**Companion:** `resources/js/i18n/en.js` holds the English source of truth for
*keys*; this glossary governs the Arabic *wording* for each recurring concept.

> Register: Modern Standard Arabic (Fusha), RTL, minimal diacritics — only the
> diacritics required to disambiguate a word's grammatical case are used (see
> "Diacritic policy" below), matching the convention already established
> throughout the file.

---

## How to use this document

1. Before adding a new Arabic string, check if the concept already has an
   entry here. Reuse the canonical term.
2. If you need a new recurring concept (a new status, a new role, a new
   feature name), add it here in the same pull request that introduces it.
3. When two pages must express the same underlying concept, they must use
   the same Arabic word — different registers/synonyms fragment the UI and
   confuse bilingual users switching between pages.
4. Run `npm run i18n:audit` after any change to `ar.js`/`en.js` to confirm
   key parity is unaffected (this glossary governs wording, not keys).

---

## Diacritic policy

- Everyday words: no diacritics (tashkeel), matching normal Arabic web/UI writing.
- **Exception — manqūṣ (defective) nouns/participles used in the indefinite,
  standalone/predicate position** (i.e. not in an idafa/genitive construction):
  these MUST carry the tanwīn kasra mark and drop the trailing ي, e.g.:
  - `نامٍ` (developing) — not `نامي` / `نامن`
  - `جارٍ التحميل...` (loading...) — not `جاري التحميل...`
  - `تحدٍ جديد` (a new challenge) — not `تحدي جديد` / `تحدّي جديد`
  - `منتهٍ` (expired) — not `منتهي`
  - We use the tanwīn-kasra mark **alone**, without an additional shadda glyph,
    even for roots that carry a shadda in fully-vocalized dictionary spelling
    (e.g. `تحدٍ`, not `تحدٍّ`) — this matches the file's existing dominant
    convention and keeps diacritic usage minimal and consistent.
  - When the same word is used in a **definite** or **idafa** (genitive)
    construction, tanwīn does not apply and the full ي is correct, e.g.
    `تحدي التحويلات` (the conversions challenge), `التحدي` (the challenge).
- **Passive participles of defective verbs** (e.g. from ألغى) end in **alef
  maqṣūra (ى)**, not yā' (ي): `ملغى` (cancelled), not `ملغي`.

---

## Canonical terms by concept

| # | Concept | Canonical Arabic | Notes |
|---|---|---|---|
| 1 | Project | مشروع / مشاريع | |
| 2 | Challenge (indefinite) | تحدٍ | See diacritic policy above |
| 3 | Challenge (definite/plural) | التحدي / التحديات | |
| 4 | Badge | شارة / شارات | |
| 5 | Certificate | شهادة / شهادات | |
| 6 | Achievement | إنجاز / إنجازات | |
| 7 | Innovation index / metric | مؤشر / مؤشرات | |
| 8 | Membership (the tier/status) | عضوية | Distinct from "subscription" — see #9 |
| 9 | Subscription (the record of subscribing / "My Subscriptions") | اشتراك / اشتراكاتي | A membership is *held*; a subscription is the *act/record* of holding one. Both terms are legitimate and intentionally distinct — do not merge. |
| 10 | Package / plan (what's purchased) | باقة / باقات | |
| 11 | Subscription duration (adjectival, next to a price) | شهري / ربع سنوي / سنوي | Not `شهر`/`سنة` (nominal) — keep adjectival across all packages pages |
| 12 | Teacher | معلم | Never `مدرّس` |
| 13 | Student | طالب | |
| 14 | School (general UI) | مدرسة | |
| 15 | Educational institution (formal role-naming only) | مؤسسة تعليمية | Use only when explicitly naming the `educational_institution` role formally (matches the dual `school`/`educational_institution` role in the data model); use `مدرسة` everywhere else |
| 16 | Admin / administrator (the person) | مدير / مدراء | Not `أدمن`/`الأدمن` (non-MSA loanword) |
| 17 | Admin panel / department | الإدارة | e.g. "لوحة الإدارة" |
| 18 | Role (access role) | الدور | Not "نوع الصلاحية" |
| 19 | Permission | الصلاحية / الصلاحيات | Reserved strictly for permissions, not roles |
| 20 | Submission (the turned-in work, as a noun) | تسليم / تسليمات | Dominant term across the platform |
| 21 | "To submit" (the verb / an act of submitting a form/request) | تقديم | Correct for e.g. "تقديم طلب" (submitting an application/request) — a different, legitimate MSA collocation from #20; do not conflate |
| 22 | Booking (a tutoring/session booking) | حجز / الحجوزات | Prefer over `طلب` when referring specifically to the booking record (e.g. "booking number" = `رقم الحجز`) |
| 23 | Request (generic, non-booking) | طلب / طلبات | |
| 24 | Publication / magazine article | منشور / منشورات (formal) — مقال / مقالات (product-facing nav & teacher/school authoring UI) | The platform uses both: `منشور` for the underlying content-management object and admin tooling, `مقال`/`مقالات` as the friendlier label in navigation and the teacher/school authoring experience. This is an intentional dual register — **do not merge** without a product decision; if asked to unify, default to `منشور` for anything admin/CRUD-facing and `مقال` for student/teacher-facing navigation labels. |
| 25 | AI Agent (a named AI persona behind a specific score/report) | وكيل ذكاء اصطناعي | e.g. `aiAgents.*` — distinct from #26 |
| 26 | AI Assistant (interactive chat helper widget) | مساعد ذكي | e.g. `studentAssistant.*`, admin chat — distinct from #25 |
| 27 | Filter (UI control) | فلترة | Common, accepted technical loanword; used consistently platform-wide — kept as-is rather than forcing the more formal `تصفية` |
| 28 | Points (gamification currency) | نقطة / نقاط | |
| 29 | Status: content approved/certified (project, badge, certificate, publication) | معتمد / معتمدة | |
| 30 | Status: submission accepted (a challenge/project submission was accepted) | مقبول | Distinct from #29 — a submission is *accepted*, a piece of content is *certified* |
| 31 | Status: request approved (teacher application, data request, AI appeal) | موافق عليه | Distinct from #29/#30 — a *request* is *approved/granted* |
| 32 | Status: pending review | قيد المراجعة | |
| 33 | Status: cancelled | ملغى | Not `ملغي` — see diacritic policy |
| 34 | Status: expired | منتهٍ | Not `منتهي` — see diacritic policy |
| 35 | "In progress..." (loading/saving/processing labels) | جارٍ + [definite gerund] | e.g. `جارٍ الحفظ...`, `جارٍ التحميل...` — see diacritic policy |
| 36 | Delete-confirmation warning (standard phrase) | "هذا الإجراء لا يمكن التراجع عنه." | Use this exact phrase/word order everywhere a destructive action needs a one-line warning |

---

## Deliberately distinct concepts (not inconsistencies — do not merge)

These pairs look similar but were confirmed during the review to represent
genuinely different product concepts. Keep them separate:

- **عضوية (membership)** vs **اشتراك (subscription)** — see #8/#9 above.
- **مقبول (submission accepted)** vs **معتمد (content certified)** vs
  **موافق عليه (request approved)** — see #29–#31 above.
- **وكيل ذكاء اصطناعي (AI agent)** vs **مساعد ذكي (AI assistant)** — see
  #25/#26 above.
- **مدرسة (school)** vs **مؤسسة تعليمية (educational institution)** — the
  platform's data model genuinely has both a `school` and an
  `educational_institution` role; keep `مدرسة` as the everyday UI word and
  reserve `مؤسسة تعليمية` for formal role-naming contexts.

---

## Known backlog (flagged, not yet unified — needs a product decision)

- **منشور/منشورات vs مقال/مقالات** (#24 above) — both terms are used
  extensively (60+ vs 30+ occurrences respectively) and may reflect an
  intentional split between the admin CRUD feature and the student/teacher-
  facing "articles" navigation label. Recommend a product/content review
  before any mass rewrite, given the scale (~90 lines) and semantic
  ambiguity — this was deliberately **not** rewritten during this review to
  avoid an unreviewed large-scale change.
- **Quotation marks around dynamic names** in confirmation dialogs are mixed
  between straight quotes (`"…"`) and Arabic guillemets (`«…»`). Recommend
  standardizing on guillemets (`«…»`) — not yet applied platform-wide.

---

## Non-linguistic issues found during the review (for engineering follow-up)

- `sections.testimonials` is defined twice within the same object in
  `ar.js` (and mirrored in `en.js`) — the second definition silently
  overwrites the first at parse time. Not a translation error; a code
  cleanup item.
- `teacherDashboardProfilePage.neighborhoodLabels` lists city names
  (الرياض/جدة/الدمام...) under a key named for neighborhoods — likely a
  content/data-shape issue rather than a translation error.

---

## Review record

A full-file linguistic pass was conducted on 2026-09-15 covering all 7,748
lines of `resources/js/i18n/ar.js`, followed by full-file pattern sweeps for
every systematic error class found (rather than relying solely on the
initial sampled review). Total corrections applied: **189** line-level
fixes, covering:

- Manqūṣ-noun tanwīn errors (matching the `نامٍ` pattern), found and fixed
  platform-wide: `جاري` → `جارٍ` ("in progress" labels, 65 occurrences),
  `منتهي` → `منتهٍ` (expired, 9 occurrences), plus the `تحدٍّ`/`تحدّي`
  challenge-type label cluster (14 occurrences)
- Alef maqṣūra / yā' spelling errors: `ملغي` → `ملغى` (cancelled, 10
  occurrences)
- A missing-shadda bug where "submitted" (`مُسلم`) accidentally read as
  "Muslim" — fixed in all 4 occurrences (`مُسلَّم`)
- Hamza errors, extra/missing alef typos, a stray Cyrillic character, and a
  month name mistranslated as "maybe"
- Gender/number/case agreement errors
- Preposition and idafa-construction errors
- Terminology normalization for "submission" (`تقديم` → `تسليم`, ~25
  occurrences in project/challenge submission contexts only — request/
  application contexts correctly kept `تقديم`), the `أدمن` loanword,
  role/permission wording, one booking-number field, subscription duration
  adjectival form, and the `تحدٍّ`/`تحدّي` diacritic inconsistency across
  challenge-type labels.

No translation keys were added, removed, or renamed; `en.js` was not
modified. `npm run i18n:audit` confirms ar/en key parity is unaffected
(5,828 keys on each side, zero missing-in-ar/missing-in-en, zero duplicate
top-level keys).
