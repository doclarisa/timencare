# CLAUDE.md — Project Instructions

## Project Overview

**TimeNCare** is a React Native mobile app built with Expo SDK 54, Expo Router v6, and TypeScript. It targets Android, iOS, and Web.

## Tech Stack

- **Framework:** React Native 0.81 + Expo ~54
- **Routing:** Expo Router v6 (file-based routing in `app/`)
- **Language:** TypeScript (strict mode)
- **Styling:** React Native StyleSheet (no external CSS-in-JS library)
- **Animations:** React Native Reanimated v4
- **Navigation:** React Navigation v7 (bottom tabs)
- **Icons:** @expo/vector-icons

## Project Structure

```
app/           — File-based routes (Expo Router)
  (tabs)/      — Bottom tab navigator screens
components/    — Reusable UI components
  ui/          — Base UI primitives
constants/     — Theme and config values
hooks/         — Custom React hooks
assets/        — Images, fonts, static files
scripts/       — Dev/build scripts
```

## Path Aliases

Use `@/*` for imports from the project root (configured in `tsconfig.json`).
```ts
import { Colors } from '@/constants/theme';
```

## Commands

- `npm start` — Start Expo dev server
- `npm run android` — Run on Android
- `npm run ios` — Run on iOS
- `npm run web` — Run on web
- `npm run lint` — Run ESLint

## Coding Conventions

- Use **TypeScript** for all new files (`.ts` / `.tsx`)
- Use **functional components** with hooks — no class components
- Use `StyleSheet.create()` for styles, defined at the bottom of the file
- Keep components small and focused; extract reusable pieces into `components/`
- Use the `@/*` path alias for all imports — no relative `../../` paths
- Follow existing naming conventions: `kebab-case` for filenames, `PascalCase` for components
- Respect the existing theme system in `constants/theme.ts` and `hooks/use-color-scheme.ts`

## Important Rules

- Do NOT install new dependencies without asking first
- Do NOT modify `app.json` or `package.json` scripts without asking first
- Always check for existing components/utilities before creating new ones
- Prefer editing existing files over creating new ones
- Keep the app working on all platforms (Android, iOS, Web) unless told otherwise
