# Portfolio Website

My personal portfolio, a single-page site showcasing my projects, experience, and skills. Built with React 19, TypeScript, Vite, Tailwind CSS, and Framer Motion.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for dev server and bundling
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations and scroll effects
- **lucide-react** for icons

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

## Project Structure

```
src/
  App.tsx        Main page, including all section data and components
  ...
public/           Static assets (logos, images)
```

## Deployment

The production build is generated into `dist/` via `npm run build` and can be deployed to any static host (e.g. Vercel).
