/** Public examples generalized from completed engineering employment work.
 * Not freelance client testimonials. No employer-identifying operational data. */
export type DeliveryExample = {
  id: string; number: string; category: string; title: string;
  lead: string; problem: string; delivered: string; result: string;
  tools: string[]; featured?: boolean;
};
export const deliveryExamples: DeliveryExample[] = [
  {
    "id": "email-to-data",
    "number": "01",
    "category": "WORKFLOW AUTOMATION",
    "title": "From emailed spreadsheets to a dependable data feed",
    "lead": "Recurring attachments no longer needed someone to prepare and move them by hand.",
    "problem": "Operational data arrived through inconsistent Excel attachments, with recurring collection, cleanup and upload steps.",
    "delivered": "Built a scheduled email-to-database process using existing workflow tooling, secure file transfer, Python and PostgreSQL. Added structure-aware extraction and duplicate protection.",
    "result": "Completed unattended, repeatable ingestion with consistent database outputs and safe reruns.",
    "tools": [
      "Email workflows",
      "Power Automate",
      "Python",
      "Airflow",
      "PostgreSQL"
    ],
    "featured": true
  },
  {
    "id": "report-automation",
    "number": "02",
    "category": "REPORTING AUTOMATION",
    "title": "Repeated report exports became a scheduled refresh",
    "lead": "A daily reporting routine was too slow and brittle to keep doing manually.",
    "problem": "A reporting interface struggled with large historical exports, forcing the same filtering and download steps to be repeated.",
    "delivered": "Automated smaller sequential exports, file checks, archival and a controlled database refresh.",
    "result": "Replaced a 1+ hour manual daily process with an unattended, validated refresh.",
    "tools": [
      "Selenium",
      "Python",
      "Airflow",
      "PostgreSQL"
    ]
  },
  {
    "id": "reporting-modernization",
    "number": "03",
    "category": "REPORTING MODERNIZATION",
    "title": "Complex reporting logic, rebuilt in SQL",
    "lead": "Critical calculations needed to be understood beyond the dashboard where they lived.",
    "problem": "Nested reporting measures, filters and transaction rules were difficult to trace and reproduce consistently.",
    "delivered": "Traced source fields and dependent calculations, documented their meaning, translated the behavior into SQL and reconciled results against existing reports.",
    "result": "Completed a validated reporting integration with maintainable SQL and clear business rules.",
    "tools": [
      "SQL",
      "Power BI / DAX",
      "Documentation",
      "Reconciliation"
    ]
  },
  {
    "id": "relational-sync",
    "number": "04",
    "category": "DATA INTEGRATION",
    "title": "Many database sources, one repeatable integration",
    "lead": "Growing reporting requirements called for a standard connection between systems.",
    "problem": "Maintaining a unique loader for each source made refreshes fragile, inconsistent and costly to extend.",
    "delivered": "Built a configurable SQL Server-to-PostgreSQL loading process with source-schema discovery, bulk staging and reconciliation.",
    "result": "Completed repeatable full refreshes with matching source and target counts and a reusable path for additional feeds.",
    "tools": [
      "SQL Server",
      "PostgreSQL",
      "Airflow",
      "Python"
    ]
  },
  {
    "id": "pipeline-templates",
    "number": "05",
    "category": "PIPELINE RELIABILITY",
    "title": "A reusable foundation for recurring data jobs",
    "lead": "Routine data transfers deserved one consistent engineering approach.",
    "problem": "Similar file-ingestion jobs used different patterns for input files, connections, failures and tracking.",
    "delivered": "Reviewed existing scheduled loads and built a configurable file-to-database template with standardized processing, archival, metadata and handoff documentation.",
    "result": "Delivered a reusable foundation for common integrations and clearer operating practices.",
    "tools": [
      "SFTP",
      "Airflow",
      "PostgreSQL",
      "Python"
    ]
  }
];
