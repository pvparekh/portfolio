# 08 — Protected experience copy baseline (user-authorized 2026-10-09 update)

Source: pvparekh/portfolio/src/App.tsx at `feat/solutions-client-acquisition`, commit `01e6f9510952776fcf1a39266270b686a5c224a4`, blob SHA `4f455e3278c53d4911c9b805826e212bd13f221b`.

This file preserves the exact `const EXPERIENCE` source block captured on 2026-10-09. The fenced block below is the protected baseline, including every employer, link, role title, period, location and literal professional bullet. An automated comparison must extract the same block from future source and compare exact characters (or use an approved structured equivalence if the data model is moved). No bullets may be rewritten without explicit authorization.

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
        role: 'Junior Data Engineer',
        period: 'Sept 2026 – Present',
        current: true,
        bullets: [
          'Build and maintain production ETL/ELT pipelines, data integrations, and analytics infrastructure using Python, SQL, Apache Airflow, PostgreSQL, and Snowflake.',
          'Developed and productionized an end-to-end pipeline for NESNA, replacing a 1+ hour manual daily process with an unattended rolling 36-month Tableau-to-PostgreSQL refresh.',
        ],
      },
      {
        role: 'Data Analytics Intern',
        period: 'June 2026 – Sept 2026',
        current: false,
        bullets: [
          'Reverse-engineered and translated complex, nested Power BI DAX logic into validated SQL for NetSuite accounting integration, decomposing 15+ production reports and 100+ measures; reproduced filter-context, cancellation, reinstatement, and transaction-reconstruction logic and validated outputs against production Power BI results.',
          'Designed and deployed a fully automated email-to-database ingestion pipeline using Power Automate, Azure SFTP, Airflow, Python, and PostgreSQL, replacing a manual reporting workflow with hourly, idempotent processing; built ~600 lines of dynamic Excel extraction, standardization, region mapping, and duplicate-prevention logic.',
          'Automated manual Tableau reporting workflows using Selenium, enabling reports to be programmatically downloaded and routed into downstream data-processing/database workflows; also developed additional process automations using Power Automate.',
          'Audited four production Apache Airflow DAGs and developed a 400+ line config-driven reusable SFTP-to-PostgreSQL ETL framework, standardizing loading, metadata, archiving, connection handling, and pipeline structure while improving maintainability, observability, and retry safety.',
        ],
      },
    ],
  },
  {
    company: 'Perfect Threading Salon',
    companyUrl: 'https://perfect-threading.vercel.app' as string | null,
    logo: '/perfect-threading-logo.svg' as string | null,
    logoBg: null as string | null,
    logoScale: null as number | null,
    companyPeriod: 'May 2025 – June 2025',
    location: 'Contract' as string | null,
    roles: [
      {
        role: 'Web Developer',
        period: 'May 2025 – June 2025',
        current: false,
        bullets: [
          'Partnered with salon ownership to modernize its booking experience, building and deploying a full-stack website using Next.js 14.',
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
- Shortened the Junior Data Engineer NESNA pipeline bullet to the user-provided one-sentence version.
- Removed the user-specified Snowflake / broader modernization bullet from the Data Analytics Intern role.
- Split the Perfect Threading Salon booking-system bullet into two factual accomplishments: booking platform delivery and Calendly integration/workload reduction. The ~30% figure was already user-provided in the original and is not independently verified.
- All other protected professional experience entries remain unchanged.


## User-approved refinement on 2026-10-09
Salon bullet copy was expanded to highlight collaboration with ownership on the Next.js 14 website and Calendly integration reducing workload and call volume by ~30%. The call-volume claim is user-reported, not independently verified. No other employer experience data changed.
