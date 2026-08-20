import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About", description: "Jon Watterson's data engineering approach, skills, and background." };

const stack = [
  ["Languages", "Python · SQL"],
  ["Modeling", "dbt · Dimensional modeling · Incremental processing"],
  ["Warehouses", "BigQuery · SQLite"],
  ["Orchestration", "Apache Airflow"],
  ["Engineering", "Docker · GitHub Actions · Automated testing"],
  ["Practices", "Data quality · Idempotency · Observability · Runbooks"],
];

export default function AboutPage() {
  return (
    <>
      <section className="page-hero shell about-hero">
        <p className="eyebrow">About</p><h1>I build systems people can trust—and explain why they work.</h1>
        <p className="page-lead">My focus is data engineering: turning operational inputs into reliable, governed analytics through clear architecture, tested transformations, and disciplined operations.</p>
      </section>
      <section className="section shell about-grid">
        <div>
          <p className="eyebrow">Professional focus</p><h2>From raw data to reliable decisions</h2>
          <p>I approach data work as systems engineering. A useful pipeline needs more than a successful query: it needs explicit contracts, replay safety, observability, ownership, and a recovery path.</p>
          <p>The Northwind Outfitters portfolio demonstrates that thinking as one platform evolves through ingestion, cloud modeling, and workflow automation.</p>
          <div className="button-row"><Link className="button primary" href="/projects">View projects <span>→</span></Link><Link className="button secondary" href="/resume">Resume</Link></div>
        </div>
        <div className="quote-card"><span aria-hidden="true">“</span><blockquote>Prefer maintainable systems over clever solutions. Make the correct path easy—and the failure path visible.</blockquote><small>Engineering principle</small></div>
      </section>
      <section className="section capability-section"><div className="shell">
        <div className="section-heading"><p className="eyebrow">Technical toolkit</p><h2>Tools selected for the system</h2><p>Technology is useful when it strengthens reliability, clarity, or scale.</p></div>
        <div className="stack-grid">{stack.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      </div></section>
      <section className="section shell">
        <div className="section-heading"><p className="eyebrow">Operating principles</p><h2>How I make engineering decisions</h2></div>
        <div className="principle-cards">
          {[
            ["01", "Design for repeatability", "A pipeline should produce the same result when safely replayed."],
            ["02", "Make failures observable", "Logs and alerts should explain what failed, why, and what to do next."],
            ["03", "Automate recurring work", "Human attention belongs on decisions, not dependable repetition."],
            ["04", "Treat quality as architecture", "Validation belongs at system boundaries and before consumption."],
            ["05", "Document the tradeoff", "Good engineering makes constraints and alternatives visible."],
          ].map(([n, title, text]) => <div key={n}><span className="mono">{n}</span><h3>{title}</h3><p>{text}</p></div>)}
        </div>
      </section>
    </>
  );
}
