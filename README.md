# Ariya.

**Watch. Listen. Africa.** — a cross-platform entertainment app bringing African music, films, podcasts and short-form video into one subscription. Built for Nigeria, made for the world.

> Status: MVP in active development. Catalogue items are demo placeholders until licensed content is added.

## Features

- **Listen mode** — audio player with mini/full player, seek bar, queue, auto-advance and lyrics
- **Watch mode** — films and series with background playback and picture-in-picture
- **Shorts** — full-screen vertical video feed
- **Library & downloads** — saved items, playlists and offline downloads list
- **Accounts** — email auth, editable profile and avatar upload, streaming/download quality, language and notification preferences
- **Subscriptions** — Paystack checkout (Naira) with plan display on Profile
- **Web + mobile** — one codebase for iOS, Android and web

## Tech stack

| Layer | Tools |
|---|---|
| App | React Native, Expo SDK 57, TypeScript |
| Navigation & state | React Navigation, Zustand, TanStack Query |
| Media | expo-audio, expo-video |
| Backend | Supabase — Postgres, row-level security, SQL migrations, Storage |
| Payments | Paystack |
| Deploy | Netlify (web, CI from GitHub), EAS Build (Android/iOS) |

## Project structure

```
src/
  components/   UI building blocks (player, rows, landing, profile)
  screens/      Home, Search, Library, Downloads, Profile, Player, Shorts, auth
  navigation/   Root stack + tab navigator
  hooks/        Data hooks (TanStack Query)
  services/     Supabase data access
  store/        Zustand stores (auth, player, downloads, mode)
  theme/        Colours and typography
supabase/
  migrations/   Schema, RLS policies, storage buckets
  seed.sql      Demo catalogue
```

## Getting started

```bash
npm install
cp .env.example .env   # add your Supabase URL + anon key and Paystack public key
npx expo start         # press w for web, a for Android
```

Apply the SQL files in `supabase/migrations/` (in order) to your Supabase project, then run `supabase/seed.sql` for demo content.

## Security notes

- Row-level security on every table; users can only read and write their own data
- Only public keys (Supabase anon, Paystack public) ship in the client — no service-role or secret keys
- `.env` is git-ignored

## Licence

MIT — see [LICENSE](LICENSE).
