export type SoftwareProject = {
  id: string; eyebrow: string; title: string; classification: string;
  description: string; problem: string; work: string; outcome: string;
  contribution: string; architecture: string[]; validation: string[];
  stack: string[]; liveUrl?: string; sourceUrl: string; sourceLabel: string; docsUrl?: string;
};
/** Only public URLs and documented work. Project classifications must remain visible. */
export const softwareProjects: SoftwareProject[] = [
  {
    "id": "salon",
    "eyebrow": "BUSINESS WEBSITE / CLIENT DELIVERY",
    "title": "Perfect Threading Salon",
    "classification": "Client website · contract work",
    "description": "A service-focused website for a real salon, with clearer service information and an integrated way for customers to book.",
    "problem": "The business needed a more useful customer-facing destination and a booking flow that reduced reliance on telephone scheduling.",
    "work": "Worked with salon ownership to build and deploy a responsive Next.js website with service information and Calendly booking integration.",
    "outcome": "Customers can explore services and access appointment booking through the website, giving the business a clearer customer-facing experience.",
    "contribution": "Built and delivered the site and booking integration in collaboration with ownership.",
    "architecture": [
      "Next.js and TypeScript website with mobile-responsive layouts",
      "Service content and navigation for customer decision-making",
      "Calendly booking integration and deployment"
    ],
    "validation": [
      "Repository documents the booking integration and responsive UI.",
      "Delivery is recorded in the professional portfolio; business outcomes are owner-reported."
    ],
    "stack": [
      "Next.js",
      "TypeScript",
      "React",
      "Calendly",
      "Vercel"
    ],
    "liveUrl": "https://perfect-threading.vercel.app",
    "sourceUrl": "https://github.com/pvparekh/Perfect-Threading",
    "sourceLabel": "Public repository"
  },
  {
    "id": "formula",
    "eyebrow": "INTERACTIVE PRODUCT / INDEPENDENT",
    "title": "Formula Vision",
    "classification": "Independent software product",
    "description": "An interactive Formula 1 race-exploration product with coordinated views, historical playback, and detailed race context.",
    "problem": "Presenting dense, time-dependent race information as something people can explore instead of decipher.",
    "work": "Independently built the React and TypeScript experience, playback controls, MAP and CHASE visualizations, client-side timing, selective loading, and the supporting publication architecture.",
    "outcome": "An interactive race library with timeline controls, responsive visualizations and data-rich views. It demonstrates how a complex domain can become a usable browser product.",
    "contribution": "Designed and implemented the product interface, replay architecture, spatial presentation, and supporting data publication system.",
    "architecture": [
      "React/TypeScript interface with a browser-owned replay clock",
      "Selective loading and interpolated presentation for interactive playback",
      "Validated artifacts published to static cloud object storage"
    ],
    "validation": [
      "Current engineering documentation distinguishes historical static-first replay from the earlier server-streaming design.",
      "Public documentation covers immutable releases, checks, and verification; internal source repository remains private."
    ],
    "stack": [
      "React",
      "TypeScript",
      "Vite",
      "Framer Motion",
      "Cloudflare R2"
    ],
    "liveUrl": "https://formulavision.vercel.app",
    "sourceUrl": "https://github.com/pvparekh/formula-vision-documentation",
    "sourceLabel": "Public engineering documentation",
    "docsUrl": "https://github.com/pvparekh/formula-vision-documentation/blob/main/Documentation%20%28FULL%29/ENGINEERING_OVERVIEW.md"
  },
  {
    "id": "aetherflow",
    "eyebrow": "AI APPLICATION / INDEPENDENT",
    "title": "AetherFlow",
    "classification": "Independent software project",
    "description": "An AI expense leak finder: upload card or bank statements and see forgotten subscriptions, price increases, double charges and unusual spending, with drafts to cancel or negotiate.",
    "problem": "Leaks hide in long statements, and language models are unreliable with numbers. The product needed AI where it helps without letting it invent a single figure.",
    "work": "Built a provider-neutral LLM layer (local Ollama or any OpenAI-compatible endpoint), rules-then-history-then-model categorisation with a failure ladder, a deterministic leak engine, a faithfulness check on generated text, natural-language questions compiled to validated queries, and an eval harness.",
    "outcome": "Finds every planted leak in a 620-transaction demo year ($194.32 a year) and runs fully in the browser. Categorisation scores 83.7% accuracy on a 233-row hand-labelled golden set with a free local 9B model; 667 automated tests.",
    "contribution": "Designed and built the product end to end: model layer, pipeline, analysis engine, evals and interface.",
    "architecture": [
      "Next.js and TypeScript with Supabase Postgres and row-level security",
      "One JSON-schema model client: categorise, extract PDF rows, word drafts, translate questions",
      "Pure leak engine (recurring, price changes, duplicates, robust outlier scores) and .ics calendar"
    ],
    "validation": [
      "Every number shown is computed by code; model wording is checked against those numbers and replaced by a template on mismatch.",
      "Accuracy and latency come from a recorded eval run, published on the project's How it works page."
    ],
    "stack": [
      "Next.js",
      "TypeScript",
      "Ollama / open LLMs",
      "Evals",
      "PostgreSQL",
      "Supabase"
    ],
    "liveUrl": "https://aetherflow-three.vercel.app",
    "sourceUrl": "https://github.com/pvparekh/aetherflow",
    "sourceLabel": "Public repository"
  },
  {
    "id": "review-bot",
    "eyebrow": "BACKEND INTEGRATION / INDEPENDENT",
    "title": "GitHub Review Bot",
    "classification": "Independent developer tool",
    "description": "A GitHub-connected backend that processes pull-request changes and produces AI-assisted code-review feedback.",
    "problem": "Reviewing code changes is a repeated event-driven workflow that benefits from useful, structured feedback in the same place developers already work.",
    "work": "Created a FastAPI service for verified GitHub webhooks, GitHub App authentication, diff parsing, AI-based review and API-posted comments.",
    "outcome": "Demonstrates building secure event-driven integrations that connect an external platform, application logic and model-generated structured responses.",
    "contribution": "Built the webhook service, API integration, diff position mapping and review pipeline.",
    "architecture": [
      "FastAPI webhook with HMAC signature verification and GitHub App authentication",
      "Background processing and two-stage model interaction",
      "Inline pull-request review comments and summary via GitHub API"
    ],
    "validation": [
      "Repository documents a Railway deployment configuration; current hosted service availability was not independently verified.",
      "Processing times in the historical README are not advertised as guaranteed."
    ],
    "stack": [
      "Python",
      "FastAPI",
      "GitHub API",
      "Webhooks",
      "Claude"
    ],
    "sourceUrl": "https://github.com/pvparekh/github-review-bot",
    "sourceLabel": "Public repository"
  },
  {
    "id": "biaslens",
    "eyebrow": "INTERACTIVE EXPLORATION / ACADEMIC",
    "title": "BiasLens",
    "classification": "Rutgers academic project",
    "description": "An R Shiny application for exploring patterns in gendered language across Wikipedia biography abstracts.",
    "problem": "A complex research dataset needed accessible charts, filters and searchable views for exploration.",
    "work": "Developed an interactive Shiny application with Plotly graphics, filtering, searchable statistical tables and data exports.",
    "outcome": "An exploratory tool that presents detailed analysis through approachable interactive controls.",
    "contribution": "Created the application interface and exploratory workflow for a Rutgers computational social science course.",
    "architecture": [
      "R Shiny interface with dynamic filtering and interactive visualizations",
      "Statistics tables, raw-data previews and CSV exports"
    ],
    "validation": [
      "Presented as academic work, not a commissioned business deployment.",
      "Methodology and limitations are described in the public repository."
    ],
    "stack": [
      "R",
      "Shiny",
      "Plotly",
      "DT"
    ],
    "liveUrl": "https://pvparekh22.shinyapps.io/BiasLens-SOC360-CSS/",
    "sourceUrl": "https://github.com/pvparekh/BiasLens",
    "sourceLabel": "Public repository"
  }
];
