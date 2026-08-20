export type Project = {
  number: string;
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  problem: string;
  solution: string;
  category: string;
  roles: string[];
  technologies: string[];
  status: "Complete" | "Active" | "Planned";
  github: string;
  featured: boolean;
  metrics: { value: string; label: string }[];
  flow: string[];
  features: { title: string; text: string }[];
  decisions: { choice: string; why: string; tradeoff: string }[];
  results: string[];
  challenges: { title: string; text: string }[];
  production: string[];
  interview: {
    matters: string;
    decision: string;
    challenge: string;
    next: string;
  };
};

export const projects: Project[] = [
  {
    number: "01",
    slug: "retail-analytics-platform",
    title: "Retail Analytics Platform",
    eyebrow: "From manual reporting to reliable batch analytics",
    summary:
      "A production-minded Python ETL that validates retail orders, quarantines failures, and loads a dimensional analytics warehouse.",
    problem:
      "Northwind Outfitters relied on manually assembled sales reports. Inconsistent transformations, silent data errors, and repeated processing made operational metrics slow and difficult to trust.",
    solution:
      "A configured CSV pipeline extracts orders, validates schema and business rules, isolates invalid records, calculates revenue, and transactionally loads customer, product, and order models into SQLite. Versioned SQL views make daily sales, category performance, and customer value immediately queryable.",
    category: "Data Engineering",
    roles: ["Data Engineer"],
    technologies: ["Python", "SQL", "SQLite", "Docker", "GitHub Actions"],
    status: "Complete",
    github: "https://github.com/j-watterson/retail-analytics-platform",
    featured: true,
    metrics: [
      { value: "12", label: "Demo orders" },
      { value: "5/5", label: "Automated tests" },
      { value: "0", label: "FK violations" },
      { value: "SHA-256", label: "Replay control" },
    ],
    flow: ["CSV source", "Contract validation", "Transform", "SQLite warehouse", "Analytics views"],
    features: [
      { title: "Safe replay", text: "Source checksums and natural-key upserts make unchanged reruns predictable." },
      { title: "Visible failures", text: "Invalid rows are quarantined with precise rejection reasons instead of disappearing." },
      { title: "Atomic loading", text: "Dimension and fact updates complete transactionally with foreign keys enforced." },
      { title: "Operational evidence", text: "Every run records timing, status, checksum, and row-level outcomes." },
    ],
    decisions: [
      { choice: "SQLite warehouse", why: "It makes the complete system portable and reviewable without cloud credentials.", tradeoff: "It is not intended for high-concurrency or distributed workloads." },
      { choice: "Dimensional model", why: "Facts and dimensions produce stable analytical joins and familiar BI semantics.", tradeoff: "Some descriptive data is intentionally duplicated for usability." },
      { choice: "Row quarantine", why: "Valid business data can load while malformed records remain visible for correction.", tradeoff: "Teams need an explicit workflow for resolving rejected records." },
    ],
    results: [
      "Loaded all 12 valid demonstration orders with database integrity checks passing.",
      "Produced $1,038.98 of reconciled completed-order revenue across three categories.",
      "A second unchanged run safely skipped processing, demonstrating source-level idempotency.",
    ],
    challenges: [
      { title: "Strict without brittle", text: "The pipeline distinguishes row-level quality failures from batch-level source-contract failures." },
      { title: "Portable production signals", text: "Reliability controls are demonstrated using only the Python standard library and SQLite." },
    ],
    production: [
      "Land partitioned source files in object storage.",
      "Move the warehouse to BigQuery and transformations to dbt.",
      "Add centralized monitoring, alert delivery, and service-level objectives.",
    ],
    interview: {
      matters: "It demonstrates the full batch lifecycle—not just transformation code, but contracts, replay safety, testing, auditability, and recovery.",
      decision: "Checksum deduplication plus upserts provide two complementary levels of idempotency.",
      challenge: "Loading valid records while making partial quality failures impossible to ignore.",
      next: "Replace local storage with cloud landing zones and a governed analytical warehouse.",
    },
  },
  {
    number: "02",
    slug: "customer-analytics-warehouse",
    title: "Customer Analytics Warehouse",
    eyebrow: "One governed source for customer and sales reporting",
    summary:
      "A centralized BigQuery warehouse managed with dbt, from typed source models to incremental facts and BI-ready marts.",
    problem:
      "Finance, marketing, and merchandising lacked shared definitions for revenue, margin, and customer value. Operational tables were not designed for analytical workloads or governed BI.",
    solution:
      "A layered dbt project standardizes landed commerce data, enriches unit economics, builds conformed customer, product, and calendar dimensions, and incrementally merges the order fact. Customer 360 and daily sales marts provide clear grains and tested metrics.",
    category: "Analytics Engineering",
    roles: ["Data Engineer", "Analytics Engineer"],
    technologies: ["BigQuery", "dbt", "SQL", "Docker", "GitHub Actions"],
    status: "Complete",
    github: "https://github.com/j-watterson/customer-analytics-warehouse",
    featured: true,
    metrics: [
      { value: "10", label: "Warehouse models" },
      { value: "3", label: "Source domains" },
      { value: "2", label: "BI marts" },
      { value: "3-day", label: "Late-data window" },
    ],
    flow: ["BigQuery raw", "Staging views", "Business transforms", "Core star schema", "BI marts"],
    features: [
      { title: "Incremental fact", text: "BigQuery merge processing uses a bounded lookback for late-arriving corrections." },
      { title: "Conformed dimensions", text: "Customer, product, and calendar models give BI teams shared analytical axes." },
      { title: "Layered quality", text: "Freshness, uniqueness, relationships, ranges, business rules, and unit tests protect models." },
      { title: "Governed metrics", text: "Revenue, profit, margin, and customer segment definitions live in version-controlled SQL." },
    ],
    decisions: [
      { choice: "BigQuery", why: "Serverless analytical compute, partition pruning, and low infrastructure overhead.", tradeoff: "Cost control requires deliberate model selection and scan awareness." },
      { choice: "Incremental merge", why: "It avoids scanning full order history and still corrects recent late data.", tradeoff: "The lookback window needs reconciliation and occasional full refreshes." },
      { choice: "Layered dbt models", why: "Source cleanup, reusable logic, atomic entities, and consumption models have clear responsibilities.", tradeoff: "The larger graph requires disciplined naming and documentation." },
    ],
    results: [
      "A real dbt parse validated the complete model and test graph on the pinned BigQuery adapter.",
      "Seeded source totals reconcile exactly with the upstream retail pipeline.",
      "Core tables use partitioning and clustering aligned to common BI access patterns.",
    ],
    challenges: [
      { title: "Late-arriving data", text: "A configurable ingestion lookback balances correction coverage with predictable compute cost." },
      { title: "Shared definitions", text: "Metrics are defined once at explicit grains instead of being recreated in dashboards." },
    ],
    production: [
      "Replace demo seeds with object-storage and BigQuery landing jobs.",
      "Publish governed metrics through a semantic layer.",
      "Add slim CI, data observability, and field-level privacy controls.",
    ],
    interview: {
      matters: "It shows how centralized storage becomes a governed analytics product through contracts, lineage, tests, and shared definitions.",
      decision: "Partitioned incremental merge keeps fact processing bounded while handling recent corrections.",
      challenge: "Creating shared dimensions and metrics without coupling every consumer to raw source structures.",
      next: "Add orchestration, observability, semantic metrics, and infrastructure as code.",
    },
  },
  {
    number: "03",
    slug: "workflow-automation-platform",
    title: "Workflow Automation Platform",
    eyebrow: "Reliable daily refreshes without manual intervention",
    summary:
      "An Airflow orchestration layer that validates upstream delivery, sequences dbt builds, parallelizes BI marts, and enforces quality gates.",
    problem:
      "Reliable warehouse models still depended on engineers running commands manually. Missed schedules, stale inputs, and unclear recovery paths could leave business dashboards silently outdated.",
    solution:
      "A daily Airflow DAG verifies the raw-data manifest and source freshness, builds staging and core warehouse layers in dependency order, runs finance and marketing marts in parallel, and blocks success until final dbt tests pass.",
    category: "Platform Engineering",
    roles: ["Data Engineer", "Platform Engineer"],
    technologies: ["Apache Airflow", "Python", "dbt", "PostgreSQL", "Docker Compose"],
    status: "Complete",
    github: "https://github.com/j-watterson/workflow-automation-platform",
    featured: true,
    metrics: [
      { value: "9", label: "DAG tasks" },
      { value: "7/7", label: "Behavior tests" },
      { value: "13", label: "Workflow controls" },
      { value: "1", label: "Max active run" },
    ],
    flow: ["Raw manifest", "Freshness gate", "Staging", "Core warehouse", "Parallel marts", "Quality gate"],
    features: [
      { title: "Explicit intervals", text: "A timezone-aware cron data-interval timetable keeps daily semantics stable." },
      { title: "Bounded failure", text: "Exponential retries, task timeouts, and a DAG timeout prevent uncontrolled runs." },
      { title: "Safe concurrency", text: "One active DAG protects merges while independent BI marts execute in parallel." },
      { title: "Actionable alerts", text: "Structured callbacks include DAG, task, attempt, exception, and log context." },
    ],
    decisions: [
      { choice: "Explicit timetable", why: "Daily data interval meaning stays stable across scheduler configuration changes.", tradeoff: "It is slightly more verbose than a cron string." },
      { choice: "Manifest plus freshness", why: "Business completeness and physical warehouse recency are validated independently.", tradeoff: "The upstream producer must honor a manifest contract." },
      { choice: "LocalExecutor", why: "It keeps the portfolio environment understandable and reproducible.", tradeoff: "Production scale requires managed Airflow or elastic workers." },
    ],
    results: [
      "The production DAG imports under Airflow 3.3 with all nine expected tasks.",
      "Finance and marketing branches run concurrently after shared core dependencies.",
      "Behavioral, structural, Python, and Compose validation all pass.",
    ],
    challenges: [
      { title: "Partial success", text: "The DAG prevents a table that merely exists—but is stale or incomplete—from reaching BI." },
      { title: "Backfill safety", text: "Concurrency and a documented Airflow 3 procedure protect incremental merges during history repair." },
    ],
    production: [
      "Deploy on managed Airflow or Kubernetes with remote logs.",
      "Use workload identity and a cloud secret backend.",
      "Forward alerts to incident tooling and publish OpenLineage events.",
    ],
    interview: {
      matters: "It demonstrates that orchestration includes contracts, recovery, concurrency, observability, and quality—not only scheduling.",
      decision: "A final dbt test gate means downstream BI readiness is the definition of workflow success.",
      challenge: "Coordinating parallelism without allowing overlapping incremental warehouse writes.",
      next: "Add managed infrastructure, remote logs, pools, alert delivery, and lineage.",
    },
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

