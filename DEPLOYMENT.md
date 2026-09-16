# Deploying DOST Academy System (free tier)

Frontend on **Vercel**, backend + database on **Render** (Postgres, since
Render's free MySQL doesn't exist — this project's migrations already run
fine on Postgres, verified before this guide was written).

## 0. What's already done

- `dost-lms-backend/Dockerfile` + `start.sh` — builds and runs the Laravel
  API on Render (installs deps, runs migrations, serves on Render's `$PORT`).
- `dost-lms-backend/render.yaml` — a Render "Blueprint" that provisions the
  web service *and* the Postgres database together, with the DB connection
  env vars wired automatically.
- `dost-lms-backend/config/database.php` — has a `pgsql` connection ready
  to go (`DB_CONNECTION=pgsql`).
- `dost-lms-final/vercel.json` — SPA routing so `/login`, `/reset-password`
  etc. don't 404 on refresh.
- A local git repo, already committed, at the root of this folder.

## 1. Push this repo to GitHub

You'll need a GitHub account (free). Create a new **empty** repository
(no README/license) at github.com, then run in Terminal, inside this folder:

    git remote add origin <the repo URL GitHub gives you>
    git branch -M main
    git push -u origin main

## 2. Deploy the backend on Render

1. Sign up at render.com (free, "Continue with GitHub" is easiest).
2. New -> Blueprint -> pick this repo. Render reads `render.yaml` and
   proposes the API service + Postgres database together.
3. It'll ask you to fill in a couple of values it can't guess:
   - `APP_KEY` — a random encryption key. I generated you a fresh one below.
   - `FRONTEND_URL` — leave blank for now, you'll fill this in after step 3
     once you know your Vercel URL.
   - `PASSWORD_RESET_OVERRIDE_EMAIL` — your email, if you want every
     password-reset email routed to your inbox, same as locally.
4. Deploy. First build takes a few minutes (installing PHP deps + your
   Postgres DB). Render gives you a URL like
   `https://dost-lms-backend-xxxx.onrender.com`.

## 3. Deploy the frontend on Vercel

1. Sign up at vercel.com (free, GitHub login works here too).
2. New Project -> import the same repo -> set **Root Directory** to
   `dost-lms-final`.
3. Add one environment variable before deploying:
   - `REACT_APP_API_URL` = `https://<your-render-url>/api`
4. Deploy. You'll get a URL like `https://dost-lms-final.vercel.app`.

## 4. Wire the two together

Back in Render, set the `FRONTEND_URL` env var to your Vercel URL (no
trailing slash), then trigger a redeploy — this is what makes Render's CORS
config (`config/cors.php`) accept requests from your live frontend, exactly
like it already accepts `localhost:3000` locally.

## 5. Living with the free tier

- Render's free web service sleeps after 15 minutes idle; the first
  request after that takes ~30–60s to wake it back up.
- Render's free Postgres database is deleted 30 days after creation. When
  that happens, re-run the Blueprint (or just create a fresh free DB and
  point the same env vars at it) — migrations will recreate the schema,
  but you'll lose any data, so it's not a place to store anything you care
  about keeping.
