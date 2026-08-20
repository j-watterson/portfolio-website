"use client";

const skills = [
  ["Languages", "Python, SQL, R"],
  [
    "Data Engineering",
    "ETL/ELT, data pipelines, workflow automation, data integration, data transformation, data modeling, data warehousing, data validation, data quality",
  ],
  ["Cloud Platforms", "Google Cloud Platform (GCP), Amazon Web Services (AWS)"],
  ["Databases & Data Warehouses", "BigQuery, PostgreSQL, MySQL"],
  ["Transformation & Orchestration", "dbt, Apache Airflow, Snakemake, Boto3"],
  ["Development & DevOps", "Git, GitHub, Docker, Linux, CI/CD, testing"],
  ["Analytics & Visualization", "Tableau, Looker Studio (Google Data Studio), Power BI"],
  ["Professional Skills", "Technical documentation, requirements gathering, stakeholder management"],
];

const experience = [
  {
    title: "Data Analytics Engineer / Clinical Data Analyst",
    company: "Ambry Genetics",
    dates: "Jan. 2025 – Present",
    bullets: [
      "Designed and implemented a production ETL pipeline using Python and SQL to process clinical genomics data from six on-premises MySQL databases, automating a projected six-month manual workflow into a reusable process completed in two weeks.",
      "Engineered deterministic data transformations, automated validation, and idempotent reruns to improve pipeline reliability while reducing discrepancies with legacy processes to 0.125%.",
      "Collaborated on deployment of the pipeline using AWS Batch, Docker, Amazon S3, and Terraform.",
      "Leveraged Google Cloud Platform (GCP) and BigQuery to build scalable data warehouse solutions for large clinical datasets, enabling non-technical stakeholders to analyze data through familiar Google Sheets workflows while overcoming Excel data limitations.",
      "Automated recurring clinical data extraction using Python, SQL, and Snakemake, reducing execution time by approximately three hours per run while improving pipeline reliability, accuracy, and reusability.",
      "Led the data cleanup effort for a functional domain within a larger Silver Layer data initiative by performing data discovery, data modeling, source system analysis, and data validation to improve downstream data quality.",
      "Consistently exceeded quarterly expectations for ad hoc data requests, delivering validated datasets through Git-based development workflows while working in a Linux-based AWS development environment.",
      "Developed Tableau dashboards and reporting solutions on top of large clinical datasets, enabling data-driven decision-making and providing ongoing support for stakeholder data analysis and issue resolution.",
    ],
  },
  {
    title: "Data Engineer",
    company: "Money Crashers, LLC",
    dates: "Aug. 2019 – Sep. 2023",
    bullets: [
      "Designed, built, and maintained automated ETL pipelines using Python, SQL, and BigQuery to ingest, transform, and consolidate marketing, financial, and website performance data into a centralized analytics warehouse.",
      "Built and optimized a cloud-based BigQuery data warehouse, integrating data from multiple sources to provide reliable datasets for reporting, business intelligence, and self-service analytics.",
      "Automated recurring data collection, transformation, and validation workflows, eliminating manual reporting processes while improving data accuracy, consistency, and refresh times.",
      "Developed scalable SQL data models and curated analytics tables that powered executive dashboards and KPI reporting in Looker Studio, enabling data-driven business decisions.",
      "Performed data quality validation, anomaly detection, and reconciliation across multiple datasets to improve reporting reliability and stakeholder confidence.",
    ],
  },
  {
    title: "Process Engineer – Data Automation",
    company: "Sun West Mortgage Company, LLC",
    dates: "July 2017 – Aug. 2019",
    bullets: [
      "Developed complex SQL queries and automated reporting workflows to retrieve, transform, validate, and analyze large mortgage datasets.",
      "Designed VBA-based workflow automation and rule-based validation processes, reducing manual effort by up to 50% while improving data accuracy and process reliability.",
      "Built reusable data cleansing and normalization workflows and partnered with business stakeholders to automate financial processes and improve downstream reporting.",
    ],
  },
];

const projects = [
  {
    title: "Content Opportunity Intelligence Pipeline",
    stack: "Python · SQL · PostgreSQL · Airflow · dbt · Docker · GitHub Actions",
    bullets: [
      "Built a containerized batch data platform that ingests discussion and content metadata, validates typed contracts, and publishes ranked opportunities through raw, staging, and analytics warehouse layers.",
      "Orchestrated retryable ingestion, transformation, quality, ranking, and export stages with Airflow; implemented natural-key upserts and run-level audit metadata for safe reprocessing.",
      "Developed dbt models and automated uniqueness, relationship, range, accepted-value, and freshness checks to prevent invalid records from reaching analytics consumers.",
      "Designed deterministic lexical retrieval with an optional semantic-review path, preserving a credential-free mode while supporting checkpointed embeddings and structured model decisions.",
      "Automated linting, regression tests, offline integration tests, dbt builds, and container builds with GitHub Actions.",
    ],
  },
  {
    title: "Investing.University Content Data Pipeline",
    stack: "JavaScript · Node.js · Eleventy · Nunjucks · CSV · JSON/JSONL · JSON Schema · OpenAI Batch API · Jupyter · npm · Git",
    bullets: [
      "Built a staged Node.js data pipeline that moves content records from CSV intake through normalized JSON checkpoints, schema-constrained generation, editorial review, validated publication datasets, and static serving.",
      "Implemented deterministic record normalization, duplicate suppression, slug-based idempotency, taxonomy synchronization, and referential-integrity checks across article and graph datasets.",
      "Added a fail-fast validation stage that blocks builds when identifiers, canonical URLs, required metadata, taxonomy references, or graph relationships violate publishing rules.",
    ],
  },
];

export default function ResumeContent() {
  return (
    <section className="resume-page shell">
      <div className="resume-toolbar">
        <div>
          <p className="eyebrow">Resume</p>
          <h1>Jonathon Watterson</h1>
        </div>
        <button className="button primary" onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </div>

      <article className="resume-sheet">
        <header>
          <div>
            <h2>Jonathon Watterson</h2>
            <p>Data Engineer</p>
          </div>
          <div className="resume-contact">
            <a href="mailto:jwatterson99@proton.me">jwatterson99@proton.me</a>
            <a href="https://www.linkedin.com/in/jw-data/">linkedin.com/in/jw-data</a>
            <a href="https://github.com/j-watterson">github.com/j-watterson</a>
          </div>
        </header>

        <section>
          <h3>Summary</h3>
          <p>
            Data engineer with 7+ years of experience designing and building automated ETL pipelines,
            cloud-based data warehouses, and scalable data platforms using Python, SQL, BigQuery, AWS,
            and Google Cloud Platform (GCP). Experienced in transforming complex manual processes into
            reliable, reusable data workflows that improve data quality, reduce operational effort, and
            enable self-service analytics. Most recently designed and built an end-to-end clinical data
            pipeline that reduced a projected six-month manual effort to two weeks while improving
            reliability and scalability.
          </p>
        </section>

        <section>
          <h3>Technical Skills</h3>
          <div className="resume-skills resume-skills-full">
            {skills.map(([label, value]) => (
              <p key={label}>
                <strong>{label}</strong>
                {value}
              </p>
            ))}
          </div>
        </section>

        <section>
          <h3>Work Experience</h3>
          {experience.map((role) => (
            <div className="resume-entry resume-role" key={`${role.company}-${role.title}`}>
              <div>
                <strong>
                  {role.title} <span className="resume-company">— {role.company}</span>
                </strong>
                <span>{role.dates}</span>
              </div>
              <ul>
                {role.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h3>Projects</h3>
          {projects.map((project) => (
            <div className="resume-entry resume-project" key={project.title}>
              <div>
                <strong>{project.title}</strong>
              </div>
              <p className="resume-stack">{project.stack}</p>
              <ul>
                {project.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h3>Education</h3>
          <div className="resume-entry resume-education">
            <div>
              <strong>M.S. Data Science — University of Colorado Boulder</strong>
              <span>2026 · GPA: 3.9</span>
            </div>
          </div>
          <div className="resume-entry resume-education">
            <div>
              <strong>B.S. Chemical Engineering — University of Nevada, Reno</strong>
              <span>2016</span>
            </div>
          </div>
        </section>
      </article>
    </section>
  );
}
