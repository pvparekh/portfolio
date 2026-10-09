export type PublicCaseStudy = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  problem: string;
  work: string;
  outcome: string;
  contribution: string;
  architecture: string[];
  validation: string[];
  stack: string[];
  liveUrl?: string;
  sourceUrl: string;
  docsUrl?: string;
  classification: 'Independent public project';
  publicationApproved: true;
};

export const caseStudies: PublicCaseStudy[] = [
  {
    id: 'formula-vision',
    eyebrow: '01 / DATA PLATFORM + PRODUCT ENGINEERING',
    title: 'Formula Vision',
    description:
      'A historical Formula 1 replay platform powered by reproducible data engineering and efficient, on-demand browser delivery.',
    problem:
      'High-frequency race data is large, irregular and not naturally shaped for interactive browser playback. Correct race order also cannot be inferred safely from position samples alone.',
    work:
      'Built a typed Parquet source-of-truth layer, separate browser delivery artifacts, timing-authoritative race intelligence, validation gates, immutable Cloudflare R2 releases and a React replay client with selective chunk loading.',
    outcome:
      'A growing race library powered by a repeatable publication workflow. Validated races become available without frontend changes, with quality gates protecting each release.',
    contribution:
      'Independently designed and built the extraction, data contracts, publication process, client replay architecture and user experience.',
    architecture: [
      'FastF1 acquisition → normalized and versioned Parquet with lineage',
      'Data quality gates → race intelligence + browser-specific artifact build',
      'Content-addressed objects → verification → atomic catalog promotion',
      'Cloudflare R2 static delivery → React client-side replay and lazy telemetry'
    ],
    validation: [
      'Source timing defines order and gaps; position telemetry supplies spatial presentation.',
      'Manifest hashes and object read-back validation guard publication.',
      'Difficult race conditions are handled through explicit validation and quarantine.',
      'Benchmarked JSON delivery avoided an extra browser codec.'
    ],
    stack: ['Python', 'Parquet', 'Data validation', 'Cloudflare R2', 'React', 'TypeScript'],
    liveUrl: 'https://formulavision.vercel.app',
    sourceUrl: 'https://github.com/pvparekh/F1-Viewer',
    docsUrl: 'https://github.com/pvparekh/F1-Viewer/blob/main/docs/v2/ENGINEERING_OVERVIEW.md',
    classification: 'Independent public project',
    publicationApproved: true
  },
  {
    id: 'aetherflow',
    eyebrow: '02 / FILE INGESTION + ANALYTICAL WORKFLOWS',
    title: 'AetherFlow',
    description:
      'An expense-data application that turns uploaded business files into categorized transactions and explainable analytical views.',
    problem:
      'Messy, differently formatted expense exports make it difficult to see spend patterns and recurring vendor activity consistently.',
    work:
      'Built a multi-format file ingestion workflow, batch categorization, deterministic statistical calculations and vendor analysis with a PostgreSQL-backed application.',
    outcome:
      'A working expense intelligence application that combines repeatable data ingestion, computed analytics, and a clear interface for exploring the results.',
    contribution:
      'Designed and implemented the application, data flow and analysis features.',
    architecture: [
      'CSV, TXT or PDF upload → format-aware parsing',
      'Batched categorization → normalized expense records',
      'Deterministic statistics and vendor analysis → stored results',
      'React dashboard → filters, history and exports'
    ],
    validation: [
      'Core arithmetic is implemented in code rather than delegated to an AI model.',
      'Vendor summaries are recalculated when the underlying uploads change.',
      'Service-role credentials are kept outside browser code.'
    ],
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Supabase', 'OpenAI'],
    liveUrl: 'https://aetherflow-three.vercel.app',
    sourceUrl: 'https://github.com/pvparekh/aetherflow',
    classification: 'Independent public project',
    publicationApproved: true
  }
];
