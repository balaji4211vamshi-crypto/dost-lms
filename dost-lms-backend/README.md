# DOST Academy System — Backend (Phase 2)

Laravel 10 + MySQL API backend for the IFN735 Team 59 (AstraLink) LMS project,
built to match `02_Design_Document.docx` (schema, roles) and `01_User_Stories.docx`
(US1-US19). Serves the existing React frontend in `dost-lms-final/`.

## What's included

- **Auth**: Sanctum token auth — register/login/logout, profile, password change.
- **Courses**: CRUD (admin), browse/enrol (employee), materials upload (US9).
- **Enrolments & progress**: self-enrolment, progress %, auto-synced progress reports.
- **Assignments & quizzes** (US12-US14): one table, `type` discriminates; quizzes
  are auto-graded on submission, assignments are graded by an admin.
- **Certificates** (US15-US17): PDF generated with dompdf on issue, downloadable.
- **LMS integration** (US18/US19): mocked — see `app/Services/LmsIntegrationService.php`.
  No real DOST LMS exists for this project, so this simulates a sync and is easy
  to point at a real API later (`DOST_LMS_MOCK=false` in `.env`).
- **RBAC**: `role:admin` middleware gate on every admin-only route in `routes/api.php`.
- **Seed data**: `admin@dost.gov.au` / `password` and `j.employee@dost.gov.au` / `password`,
  plus 9 more random employees, 6 courses, materials, assignments/quizzes, submissions,
  certificates — all via `php artisan migrate --seed`.

## One-time setup

**Easiest: double-click `setup-and-run.command`** in Finder (in this same folder).
It installs dependencies, creates the database, runs migrations + seed data, and
starts the server — you'll just need to click "Open" if macOS warns about an
unidentified developer the first time.

If you'd rather do it by hand in Terminal:

```bash
# 1. Install PHP + Composer if you don't have them yet
brew install php composer

# 2. From this folder:
composer install
php artisan storage:link
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS dost_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed
php artisan serve
```

The API will be available at **http://localhost:8000/api**. `.env` is already
configured for the MySQL instance installed on this Mac (root / the password you
set during the MySQL installer, database `dost_academy`) — edit `DB_PASSWORD` in
`.env` if that doesn't match.

## Notes on how this was built

Composer and Packagist are blocked from the sandboxed environment this was
authored in, so `vendor/` was never generated or executed there — every file
here was hand-written to match real Laravel 10 conventions and checked with
`php -l` (syntax only). Running `composer install` on your own Mac, with your
Mac's normal internet access, resolves and installs the actual framework —
that step could not be done for you in advance. If `composer install` reports
any version conflict, run `composer install --ignore-platform-reqs` and let me
know so it can be tightened up.

## API summary

| Method | Path | Who | Purpose |
|---|---|---|---|
| POST | /api/register | anyone | Sign up (always creates an employee) |
| POST | /api/login | anyone | Get a bearer token |
| POST | /api/logout | auth | Revoke current token |
| GET/PUT | /api/me | auth | View/update own profile |
| GET | /api/courses | auth | Browse courses |
| POST/PUT/DELETE | /api/courses(/{id}) | admin | Manage courses |
| POST | /api/courses/{id}/materials | admin | Upload course material |
| POST | /api/courses/{id}/enrol | auth | Enrol in a course |
| PUT | /api/enrolments/{id}/progress | auth | Update own progress |
| GET | /api/courses/{id}/assignments | auth | List assignments/quizzes |
| POST | /api/assignments/{id}/submissions | auth | Submit assignment or quiz |
| PUT | /api/submissions/{id}/grade | admin | Grade a (non-quiz) submission |
| GET | /api/certificates | auth | List own (or, with `?all=1`, all) certificates |
| POST | /api/courses/{id}/certificates/issue | admin | Issue a certificate |
| GET | /api/progress-reports | auth | Progress reporting view |
| GET/POST/PUT/DELETE | /api/users(/{id}) | admin | User management |
| GET | /api/lms/status | admin | Mock LMS connectivity status |
| POST | /api/lms/courses/{id}/sync | admin | Mock-sync a course's completions |

Bearer token goes in `Authorization: Bearer <token>` on every authenticated request.
