"use client";

export default function ResumeContent() {
  return (
    <section className="resume-page shell">
      <div className="resume-toolbar"><div><p className="eyebrow">Resume</p><h1>Jonathon Watterson</h1></div><button className="button primary" onClick={() => window.print()}>Print / Save PDF</button></div>
      <div className="resume-sheet">
        <header><div><h2>Jonathon Watterson</h2><p>Data Engineer</p></div><div className="resume-contact"><a href="mailto:jwatterson99@proton.me">jwatterson99@proton.me</a><a href="https://www.linkedin.com/in/jw-data/">linkedin.com/in/jw-data</a><a href="https://github.com/j-watterson">github.com/j-watterson</a></div></header>
        <section><h3>Profile</h3><p>Data engineer focused on reliable pipelines, cloud data systems, and analytics infrastructure. Builds production-minded systems with explicit contracts, idempotent processing, governed models, automated tests, orchestration, and operational documentation.</p></section>
        <section><h3>Selected platform work</h3>
          <div className="resume-entry"><div><strong>Retail Analytics Platform</strong><span>Python · SQL · Docker</span></div><p>Built a transactional retail ETL with schema validation, rejected-row quarantine, checksum deduplication, dimensional modeling, audit history, and automated tests.</p></div>
          <div className="resume-entry"><div><strong>Customer Analytics Warehouse</strong><span>BigQuery · dbt · SQL</span></div><p>Designed a layered cloud warehouse with conformed dimensions, an incremental partitioned order fact, customer and finance marts, data tests, snapshots, and a governed metric catalog.</p></div>
          <div className="resume-entry"><div><strong>Workflow Automation Platform</strong><span>Airflow · Python · dbt</span></div><p>Orchestrated daily warehouse refreshes with manifest and freshness gates, parallel BI workloads, retries, timeouts, concurrency controls, structured failure context, and backfill procedures.</p></div>
        </section>
        <section><h3>Technical skills</h3><div className="resume-skills"><p><strong>Languages</strong>Python, SQL</p><p><strong>Data platform</strong>BigQuery, dbt, Airflow, SQLite</p><p><strong>Engineering</strong>Docker, GitHub Actions, automated testing, CI/CD</p><p><strong>Practices</strong>Dimensional modeling, data quality, idempotency, observability, runbooks</p></div></section>
        <section><h3>Education</h3><p><strong>M.S., Data Science</strong><br /><strong>B.S., Chemical Engineering</strong></p></section>
      </div>
    </section>
  );
}
