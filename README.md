# RealStore — 3D Virtual Supermarket

First-person 3D grocery shopping prototype built with **Next.js**, **Tailwind CSS**, and **React Three Fiber**.

## Controls

| Action | Input |
|--------|--------|
| Walk | `↑` `↓` |
| Turn | `←` `→` |
| Look | Mouse (free look) or right-drag |
| Select product | Aim crosshair + click |
| Cart / checkout | Header cart button |

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run test:smoke  # requires dev server + Playwright Chromium
```

## Deploy on Vercel

This is a standard Next.js App Router app — no special adapter required.

1. Import the GitHub repo in [Vercel](https://vercel.com/new)
2. Framework preset: **Next.js** (auto-detected)
3. Build command: `npm run build`
4. Output: default (no static export)
5. Deploy

Or with the Vercel CLI:

```bash
npx vercel
```

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- `@react-three/fiber` + `@react-three/drei` + `three`
- Zustand cart state · Lucide icons
