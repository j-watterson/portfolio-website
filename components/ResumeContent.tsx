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
    title: "Analytics Engineer / Clinical Data Analyst",
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
    title: "Retail Analytics Platform",
    stack: "Python · SQL · SQLite · Docker · GitHub Actions",
    bullets: [
      "Engineered a configuration-driven Python ETL pipeline that ingests retail order data, validates schema and business rules, quarantines invalid records, and loads a dimensional SQL warehouse.",
      "Designed a star-schema data model with fact and dimension tables while implementing idempotent processing, transactional loading, audit logging, and natural-key upserts for reliable reprocessing.",
      "Automated testing, containerization, and CI/CD with Docker and GitHub Actions, including unit tests, structured logging, and operational recovery procedures.",
    ],
  },
  {
    title: "Customer Analytics Warehouse",
    stack: "BigQuery · dbt · SQL · Docker",
    bullets: [
      "Architected a layered analytics warehouse in BigQuery using dbt, transforming raw operational data into staging, intermediate, dimensional, and reporting models following modern ELT practices.",
      "Built incremental MERGE models, partitioned and clustered warehouse tables, and implemented reusable SQL transformations, source freshness checks, and automated data quality testing.",
      "Modeled conformed dimensions, Customer 360 views, and business-ready data marts while documenting lineage, governance, and metric definitions for downstream analytics.",
    ],
  },
  {
    title: "Workflow Automation Platform",
    stack: "Apache Airflow · Python · BigQuery · dbt · PostgreSQL",
    bullets: [
      "Developed Apache Airflow DAGs to orchestrate end-to-end warehouse workflows, including source validation, dbt transformations, quality testing, and automated reporting refreshes.",
      "Implemented production reliability features including retries, exponential backoff, execution timeouts, concurrency controls, structured logging, and controlled historical backfills.",
      "Containerized the orchestration environment with Docker and PostgreSQL metadata while integrating GitHub Actions for automated validation and deployment workflows.",
    ],
  },
];

export default function ResumeContent() {
  return (
    <section className="resume-page shell">
      <div className="resume-toolbar">
        <div>
          <p className="eyebrow">Resume</p>
          <h1>Jon Watterson</h1>
        </div>
        <button className="button primary" onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </div>

      <article className="resume-sheet">
        <header>
          <div>
            <h2>Jon Watterson</h2>
            <p>Data Engineer</p>
          </div>
          <div className="resume-contact">
            <a href="mailto:jwatterson99@proton.me">jwatterson99@proton.me</a>
            <a href="https://www.linkedin.com/in/jw-data/">linkedin.com/in/jw-data</a>
            <a href="https://github.com/j-watterson">Jon Watterson on GitHub</a>
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
          <h3>Open Source Engineering Projects</h3>
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
