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
    "outcome": "Customers can browse services and move into an online booking flow. The owner has reported reduced reception workload; no independently audited impact figure is published here.",
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
    "outcome": "An interactive race library with timeline controls, responsive visualizations and data-rich views—an example of taking a complex domain through to a usable browser product.",
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
    "eyebrow": "FULL-STACK APPLICATION / INDEPENDENT",
    "title": "AetherFlow",
    "classification": "Independent software project",
    "description": "A complete expense-analysis application where users can upload business records and explore categorized results.",
    "problem": "Expense records come in different formats, making it hard to review transactions, vendors and unusual activity in one place.",
    "work": "Built file-upload and parsing workflows, authentication, PostgreSQL-backed storage, categorized transactions, computed statistics, vendor analysis and interactive dashboard views.",
    "outcome": "A working application with file ingestion, filtering and export; arithmetic and anomaly calculations are deterministic while AI assists with categorization and explanation.",
    "contribution": "Designed and developed the frontend, backend workflows, storage and analysis experience.",
    "architecture": [
      "Next.js and TypeScript with Supabase authentication and PostgreSQL",
      "CSV/TXT/PDF ingestion and batched AI-assisted classification",
      "Deterministic analytical calculations, dashboard filtering and exports"
    ],
    "validation": [
      "README identifies the email-digest preference as a placeholder, not a completed feature.",
      "Core numerical computations are implemented in application logic, not delegated to AI."
    ],
    "stack": [
      "Next.js",
      "React",
      "TypeScript",
      "PostgreSQL",
      "Supabase",
      "OpenAI"
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
