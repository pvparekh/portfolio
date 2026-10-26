# Portfolio Website

My personal portfolio, a single-page site showcasing my projects, experience, and skills. Built with React 19, TypeScript, Vite, Tailwind CSS, and Framer Motion.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for dev server and bundling
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations and scroll effects
- **lucide-react** for icons
- **three.js** + **React Three Fiber** for the optional spatial background (lazy-loaded, desktop only for now; see `docs/spatial-universe/`)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

The site will be available at the URL Vite prints (default `http://localhost:5173`).

## Scripts

| Command           | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload     |
| `npm run build`   | Type-check and build for production           |
| `npm run preview` | Preview the production build locally          |
| `npm run test:unit` | Unit tests for the spatial scroll and tier logic |
| `npm run check:spatial` | Browser checks for the spatial layer (needs a build) |

## Project Structure

```
src/
  App.tsx        Main page, including all section data and components
  ...
public/           Static assets (logos, images)
```

## Spatial layer

The WebGL background is a progressive enhancement: all content is normal HTML, and the canvas only loads on capable desktops after first paint. Turn it off with `VITE_SPATIAL=off` at build time, or per visit with `?spatial=off` (`css`, `lite`, `full` force a tier). Visitors can pause it from the navigation bar, and `prefers-reduced-motion` switches it to still frames.

## Deployment

The production build is generated into `dist/` via `npm run build` and can be deployed to any static host (e.g. Vercel).
