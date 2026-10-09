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
      'A historical Formula 1 replay product built on a reproducible data pipeline, not a permanently running replay server.',
    problem:
      'High-frequency race data is large, irregular and not naturally shaped for interactive browser playback. Correct race order also cannot be inferred safely from position samples alone.',
    work:
      'Built a typed Parquet source-of-truth layer, separate browser delivery artifacts, timing-authoritative race intelligence, validation gates, immutable Cloudflare R2 releases and a React replay client with selective chunk loading.',
    outcome:
      'A publicly inspectable product where validated historical races can be added through the publication pipeline without rewriting the frontend. Invalid builds are quarantined rather than promoted.',
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
      'A benchmarked JSON chunk-delivery contract avoids an unnecessary browser codec.'
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
      'An independent product demonstrating ingestion, repeatable analysis, user-facing results and separation of statistical computation from AI-generated narrative.',
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
