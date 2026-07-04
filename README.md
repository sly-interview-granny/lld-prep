# LLD Prep

A static, locally runnable interview prep site for Low-Level Design (LLD) fundamentals — OOP concepts, class relationships, SOLID principles, and design patterns.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build
```

Static files are output to `dist/`. Preview the production build:

```bash
npm run preview
```

Deploy `dist/` to GitHub Pages, Netlify, or serve locally with `npx serve dist`.

## Routes

| Route | Content |
|-------|---------|
| `/` | Dashboard with section cards and pattern counts |
| `/oop` | Four OOP pillars |
| `/relationships` | IS-A, USES-A, HAS-A, PART-OF |
| `/solid` | All five SOLID principles |
| `/patterns` | Searchable list of 29 design patterns |
| `/patterns/:slug` | Individual pattern detail (scaffold) |

## Adding Content

All content lives in `src/content/` as TypeScript modules — edit notes without touching layout code.

- **OOP / Relationships / SOLID:** Update the arrays in `oop.ts`, `relationships.ts`, or `solid.ts`.
- **Design patterns:** Edit entries in `patterns.ts`. Each pattern supports optional fields:

```ts
{
  slug: 'observer',
  name: 'Observer',
  category: 'Behavioural',
  intent: 'Define a one-to-many dependency...',
  whenToUse: 'When changes to one object need to notify others...',
  example: 'Event listeners in a UI framework',
  code: '// your snippet here',
}
```

Empty fields render as dashed "Add notes" placeholders on the detail page.

## Stack

- Vite + React + TypeScript
- React Router
- Single global stylesheet (no UI library)
