# Cryptic Movie Quiz

A quiz app for cryptic film titles. Sign in with your **puresurvey.co.za** Google account, answer the clues, save or give up, then see your score and rank on the leaderboard.

## Stack

- **Frontend**: Vite + React
- **Database & Auth**: Supabase (PostgreSQL, Google sign-in restricted to @puresurvey.co.za)
- **Hosting**: Netlify

## Excel quiz data

Place `cryptic_film_titles.xlsx` in the project root. The build script expects one sheet with at least two columns:

- **Clue** (or "Question", "Cryptic"): the cryptic clue text
- **Answer** (or "Film", "Movie", "Title"): the correct film title

Column names are matched case-insensitively. The script outputs `public/quiz.json` used by the app.

Generate or update the quiz JSON:

```bash
npm run quiz:build
```

This runs automatically before `npm run build`.

## Answer matching

Answers are matched case-insensitively and allow punctuation/spacing variants, so these are treated as equivalent:

- `Spider-Man`
- `spider man`
- `spiderman`

Common title alternatives are also handled:

- leading articles are optional (`The Matrix` == `Matrix`)
- `&` and `and` are treated the same
- apostrophes/punctuation are ignored (`Schindler's List` == `Schindlers List`)

## Local development

1. Copy `.env.example` to `.env` and add your Supabase URL and anon key.
2. Set `VITE_AUTH_REDIRECT_URL` to your local URL while developing (e.g. `http://localhost:5173/`) so OAuth returns to localhost instead of the live site.
3. Install and run:

```bash
npm install
npm run dev
```

4. Open http://localhost:5173

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In SQL Editor, run the contents of `supabase/schema.sql`.
3. In **Authentication → Providers**, enable **Google**. Add your Google OAuth client ID and secret (create a project in [Google Cloud Console](https://console.cloud.google.com/apis/credentials), configure the OAuth consent screen, and create OAuth 2.0 credentials; add `https://<project-ref>.supabase.co/auth/v1/callback` as an authorised redirect URI).
4. In **Authentication → URL Configuration**, set Site URL to your app URL (e.g. `https://your-site.netlify.app`) and add `http://localhost:5173` (and your production URL) to Redirect URLs for local and production sign-in.
5. Only **@puresurvey.co.za** Google accounts can use the app; others see a message to use their work email. You can change the domain in `src/supabase.js` (`ALLOWED_EMAIL_DOMAIN`).
6. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env` (and to Netlify env vars for production).
7. Optional: set `VITE_AUTH_REDIRECT_URL` per environment:
   - Local: `http://localhost:5173/`
   - Production: `https://your-site.netlify.app/`
   If omitted, the app uses the current browser URL (`window.location.origin + window.location.pathname`).

### Fixing "Access blocked: This app's request is invalid"

This usually means a **redirect URI mismatch** in Google Cloud or an OAuth consent issue.

**1. Authorized redirect URI (must match exactly)**  
In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → your project → **APIs & Services** → **Credentials** → open your **OAuth 2.0 Client ID** (Web application).

- Under **Authorized redirect URIs** add your **Supabase** callback URL, not your app URL:
  - `https://<project-ref>.supabase.co/auth/v1/callback`
- Get `<project-ref>` from your Supabase URL in `.env`: if `VITE_SUPABASE_URL=https://abc123xyz.supabase.co`, use `https://abc123xyz.supabase.co/auth/v1/callback`.
- No trailing slash. Add one entry per environment if you use different Supabase projects.

**2. Authorized JavaScript origins**  
In the same OAuth client:

- Add your app origins, e.g. `http://localhost:5173` and `https://your-site.netlify.app` (no trailing slash).

**3. Supabase URL configuration**  
In Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL**: your main app URL (e.g. `https://your-site.netlify.app` or `http://localhost:5173` for local).
- **Redirect URLs**: add the exact URLs where users should land after sign-in (e.g. `http://localhost:5173/`, `https://your-site.netlify.app/`). Supabase allows these when redirecting back from Google.

**4. OAuth consent screen (Testing mode)**  
If your app is in **Testing** mode (Google Cloud Console → **APIs & Services** → **OAuth consent screen**), only **Test users** can sign in. Add the @puresurvey.co.za addresses (or your Google account) as test users, or publish the app when ready.

## GitHub

From the project root:

```bash
git init
git add .
git commit -m "Initial commit: Cryptic Movie Quiz"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Netlify

1. Connect the GitHub repo in Netlify (Site configuration → Build & deploy).
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Site settings → Environment variables.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build quiz JSON + production bundle |
| `npm run quiz:build` | Regenerate `public/quiz.json` from Excel only |
| `npm run preview` | Preview production build locally |
