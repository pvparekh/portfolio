# 08 — Protected experience copy baseline

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
          'Building and maintaining production data pipelines and platform workflows across Python, SQL, PostgreSQL, Snowflake, and Apache Airflow.',
        ],
      },
      {
        role: 'Data Analytics Intern',
        period: 'June 2026 – Sept 2026',
        current: false,
        bullets: [
          'Engineered and maintained production ETL/ELT pipelines across SFTP, PostgreSQL, SQL Server, and Apache Airflow for recurring ingestion, validation, transformation, and reporting workflows.',
          'Designed and deployed an automated email-to-database ingestion pipeline using Power Automate, Azure SFTP, Airflow, Python, and PostgreSQL, replacing a manual workflow with hourly, idempotent processing.',
          'Reverse-engineered complex Power BI DAX into validated SQL for a NetSuite accounting integration, decomposing 15+ production reports and 100+ measures.',
          'Audited four production Airflow DAGs and developed a 400+ line config-driven SFTP-to-PostgreSQL framework that standardized loading, metadata, archiving, connection handling, and retries.',
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
          'Built and deployed a full-stack booking platform with Next.js 14 and Calendly API integration, reducing receptionist workload by ~30%.',
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
