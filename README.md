# Portfolio Website

My personal portfolio, a single-page site showcasing my projects, experience, and skills. Built with React 19, TypeScript, Vite, Tailwind CSS, and Framer Motion.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for dev server and bundling
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations and scroll effects
- **lucide-react** for icons
- **three.js** + **React Three Fiber** for the spatial journey (lazy-loaded progressive enhancement; see `docs/spatial-universe/`)

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
| `npm run test:unit` | Unit tests for the journey timeline and capability logic |
| `npm run check:journey` | Browser checks for the spatial journey: content parity, navigation, fallbacks (needs a build) |
| `npm run check:experience` | Verifies the protected experience copy is unchanged |

## Project Structure

```
src/
  App.tsx        Main page, including all section data and components
  ...
public/           Static assets (logos, images)
```

## Spatial journey

On capable desktops each page is a 3D world you travel through (phones and tablets get the standard layout for now): every section is a destination, and scrolling flies the camera between them. All content is still real HTML (selectable, focusable, indexable), placed in the world and read at exact 1:1 scale.

- Visitors with `prefers-reduced-motion`, or without a capable GPU, get the standard layout.
- URLs accept `?layout=classic` or `?layout=spatial` to override. A visible "Standard layout" switch exists behind `SHOW_LAYOUT_SWITCH` in `src/journey/core/mode.ts` (currently off).
- Ambient motion can be paused from the navigation bar.
- If WebGL fails or is lost, the content stays usable.

Implementation notes and measurements: [`docs/spatial-universe/12-v2-implementation.md`](docs/spatial-universe/12-v2-implementation.md).

## Deployment

The production build is generated into `dist/` via `npm run build` and can be deployed to any static host (e.g. Vercel).
