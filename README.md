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

## Local development

1. Copy `.env.example` to `.env` and add your Supabase URL and anon key.
2. Install and run:

```bash
npm install
npm run dev
```

3. Open http://localhost:5173

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In SQL Editor, run the contents of `supabase/schema.sql`.
3. In **Authentication → Providers**, enable **Google**. Add your Google OAuth client ID and secret (create a project in [Google Cloud Console](https://console.cloud.google.com/apis/credentials), configure the OAuth consent screen, and create OAuth 2.0 credentials; add `https://<project-ref>.supabase.co/auth/v1/callback` as an authorised redirect URI).
4. In **Authentication → URL Configuration**, set Site URL to your app URL (e.g. `https://your-site.netlify.app`) and add `http://localhost:5173` (and your production URL) to Redirect URLs for local and production sign-in.
5. Only **@puresurvey.co.za** Google accounts can use the app; others see a message to use their work email. You can change the domain in `src/supabase.js` (`ALLOWED_EMAIL_DOMAIN`).
6. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env` (and to Netlify env vars for production).

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
