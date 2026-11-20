# 08 — Protected experience copy baseline (updated 2026-11-14)

Original snapshot source: pvparekh/portfolio/src/App.tsx at `feat/solutions-client-acquisition`, commit `01e6f9510952776fcf1a39266270b686a5c224a4`, blob SHA `4f455e3278c53d4911c9b805826e212bd13f221b`. The active baseline below was synchronized with the user-edited `main` experience section on 2026-10-11; the Data Engineer I bullets were replaced at the user's request on 2026-11-14.

This file preserves the current user-approved exact `const EXPERIENCE` source block, with its first protected snapshot captured on 2026-10-09. The fenced block below is the protected baseline, including every employer, link, role title, period, location and literal professional bullet. An automated comparison must extract the same block from future source and compare exact characters (or use an approved structured equivalence if the data model is moved). No bullets may be rewritten without explicit authorization.

```tsx
const EXPERIENCE = [
  {
    company: 'DOWC',
    companyUrl: 'https://dowc.com',
    logo: '/dowc-logo.png' as string | null,
    logoBg: null as string | null,
    logoScale: null as number | null,
    companyPeriod: 'June 2026 – Present',
    location: 'Parsippany, NJ' as string | null,
    roles: [
      {
        role: 'Data Engineer I',
        period: 'Sept 2026 – Present',
        current: true,
        bullets: [
          'Built and own the production Airflow pipeline behind the company’s largest client, replacing a manual script-based batch process and cutting load time by over 60%, with zero failed loads since launch. A control table drives dynamic task mapping across 66 SQL Server sources (250M+ rows): each enabled table is bulk-COPY loaded into PostgreSQL staging, row-count validated, then published through a transactional truncate-and-load.',
          'Extended the above pipeline to Snowflake, staging all 66 sources as Parquet with SQL Server to Snowflake type mapping, then moved heavy analytical workloads onto it, cutting query runtimes from 20+ minutes in PostgreSQL to under 1 minute.',
          'Engineered and productionized an end-to-end pipeline for a major OEM client, replacing a 1+ hour manual daily process with an unattended rolling 36-month Tableau-to-PostgreSQL refresh (~1.8 GB / ~1.65M rows per day) using Apache Airflow, Selenium, SFTP, automated archival, source validation, and transactional full-refresh loading.',
          'Build and maintain production ETL/ELT pipelines, data integrations, and analytics infrastructure using Python, SQL, Apache Airflow, PostgreSQL, SQL Server, and Snowflake.',
        ],
      },
      {
        role: 'Data Analytics Intern',
        period: 'June 2026 – Sept 2026',
        current: false,
        bullets: [
          'Reverse-engineered and translated complex, nested Power BI DAX logic into validated SQL for NetSuite accounting integration, decomposing 15+ production reports and 100+ measures; reproduced filter-context, cancellation, reinstatement, and transaction-reconstruction logic and validated outputs against production Power BI results.',
          'Designed and deployed a fully automated email-to-database ingestion pipeline using Power Automate, Azure SFTP, Airflow, Python, and PostgreSQL, replacing a manual reporting workflow with hourly, idempotent processing; built ~600 lines of dynamic Excel extraction, standardization, region mapping, and duplicate-prevention logic.',
          'Audited four production Apache Airflow DAGs and developed a 400+ line config-driven reusable SFTP-to-PostgreSQL ETL framework, standardizing loading, metadata, archiving, connection handling, and pipeline structure while improving maintainability, observability, and retry safety.',
        ],
      },
    ],
  },
  {
    company: 'Perfect Threading Salon',
    companyUrl: 'https://perfect-threading.vercel.app' as string | null,
    logo: '/perfect-threading-mark.png' as string | null,
    logoBg: '#FBF8F3' as string | null,
    logoScale: 1.65 as number | null,
    companyPeriod: 'May 2025 – June 2025',
    location: 'Contract' as string | null,
    roles: [
      {
        role: 'Software Engineer',
        period: 'May 2025 – June 2025',
        current: false,
        bullets: [
          'Partnered with salon ownership to modernize its booking experience, building and deploying a full-stack website using Next.js 14. URL: https://perfect-threading.vercel.app',
          'Integrated the Calendly API into the booking workflow, reducing receptionist workload and call volume by ~30%.',
        ],
      },
    ],
  },
  {
    company: 'Marketeq Digital',
    companyUrl: 'https://marketeqdigital.com/' as string | null,
    logo: '/marketeq-logo.svg' as string | null,
    logoBg: '#FFFFFF' as string | null,
    logoScale: 1.1 as number | null,
    companyPeriod: 'Sept 2024 – Feb 2025',
    location: 'Remote' as string | null,
    roles: [
      {
        role: 'Technical Business Analyst Intern',
        period: 'Sept 2024 – Feb 2025',
        current: false,
        bullets: [
          'Bridged engineering and business stakeholders, translating wireframes into technical requirements, user stories, and acceptance criteria that supported modular feature rollouts across 3 product teams.',
          'Integrated internal systems with Strapi CMS, MongoDB, and Customer.io by mapping data flows and researching API-based user-data synchronization, enabling personalized newsletter delivery for 150+ users.',
        ],
      },
    ],
  },
];
```

**Baseline check:** current App.tsx starts at `const EXPERIENCE = [` and ends immediately before `const SKILLS = [`. No content edits were made during this research commit.


## Explicitly approved revision, 2026-10-09
The user directly requested replacement of **only** the Junior Data Engineer and Data Analytics Intern bullet arrays with the supplied copy. All other employer details and source strings remain unchanged. The exact original snapshot is archived as `08-original-experience-snapshot.md`. This file is the **current approved content baseline** enforced by the build guard. These production figures are user-reported and should not be represented as independently verified or employer-approved for external sharing.


## Approved copy adjustments, 2026-10-09 (follow-up)
- Shortened the Junior Data Engineer OEM pipeline bullet to the user-provided one-sentence version.
- Removed the user-specified Snowflake / broader modernization bullet from the Data Analytics Intern role.
- Split the Perfect Threading Salon booking-system bullet into two factual accomplishments: booking platform delivery and Calendly integration/workload reduction. The ~30% figure was already user-provided in the original and is not independently verified.
- All other protected professional experience entries remain unchanged.


## User-approved refinement on 2026-10-09
Salon bullet copy was expanded to highlight collaboration with ownership on the Next.js 14 website and Calendly integration reducing workload and call volume by ~30%. The call-volume claim is user-reported, not independently verified. No other employer experience data changed.


## User-approved copy revision, 2026-10-11
Synchronized the protected baseline with the latest main-branch DOWC experience bullets, including the 66-source SQL Server pipeline, the updated OEM pipeline bullet, the Snowflake analytical performance bullet, and the removal of the redundant Tableau-internship bullet. The Snowflake possessive is an escaped TypeScript apostrophe (`Snowflake\'s`), rendered as `Snowflake's`. Other employers and roles were not modified. This update retains the build guard and reflects user-reported technical outcomes, not independent verification.


## Approved logo-only adjustment, 2026-10-11
Perfect Threading Salon now uses the exact user-supplied 123×120 PNG mark, centered with its original warm neutral background and presentation scaling. No employer, role, date, description, technical accomplishment, or other professional wording was changed.
