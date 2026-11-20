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
    sourceUrl: 'https://github.com/pvparekh/formula-vision-documentation',
    docsUrl: 'https://github.com/pvparekh/formula-vision-documentation/blob/main/Documentation%20%28FULL%29/ENGINEERING_OVERVIEW.md',
    classification: 'Independent public project',
    publicationApproved: true
  },
  {
    id: 'aetherflow',
    eyebrow: '02 / LLM PIPELINE + ANALYTICAL WORKFLOWS',
    title: 'AetherFlow',
    description:
      'An AI expense leak finder that turns uploaded statements into subscriptions, price increases, double charges and unusual spending, with every figure computed by code.',
    problem:
      'Leaks hide in long, messy statements, and language models are unreliable with numbers, so AI had to help without ever producing a figure.',
    work:
      'Built multi-format ingestion, rules-then-history-then-LLM categorisation with a failure ladder, a deterministic leak engine, a faithfulness check on generated text and an eval harness.',
    outcome:
      'Finds every planted leak in a 620-transaction demo year and scores 83.7% categorisation accuracy on a 233-row labelled set using a free local model.',
    contribution:
      'Designed and implemented the product end to end: model layer, pipeline, analysis, evals and interface.',
    architecture: [
      'CSV, TXT or PDF upload → parsing and merchant normalisation',
      'Rules → history vote → LLM in batches of 25 → categorised expenses',
      'Pure leak engine → subscriptions, price changes, duplicates, outliers',
      'LLM wording checked against computed facts → drafts and answers'
    ],
    validation: [
      'Every number shown is computed in code; model text is checked against it.',
      'Categorisation accuracy comes from a recorded eval run on a hand-labelled golden set.',
      'Service-role credentials are kept outside browser code.'
    ],
    stack: ['Next.js', 'TypeScript', 'Ollama / open LLMs', 'Evals', 'PostgreSQL', 'Supabase'],
    liveUrl: 'https://aetherflow-three.vercel.app',
    sourceUrl: 'https://github.com/pvparekh/aetherflow',
    classification: 'Independent public project',
    publicationApproved: true
  }
];
