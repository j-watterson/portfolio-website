import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Writing", description: "Technical notes on reliable data engineering." };
const notes = [
  ["Idempotency is a product feature", "How checksums, natural keys, and transactional boundaries make batch systems safer to operate.", "Retail Analytics Platform"],
  ["Late data without full rebuilds", "A practical look at incremental merge windows and the reconciliation responsibility they create.", "Customer Analytics Warehouse"],
  ["Scheduling is not orchestration", "Why production workflows need contracts, timeouts, concurrency controls, and recovery—not only cron.", "Workflow Automation Platform"],
];

export default function WritingPage() {
  return (
    <>
      <section className="page-hero shell"><p className="eyebrow">Writing</p><h1>Notes on building data systems that hold up.</h1><p className="page-lead">Short, practical explanations drawn from the engineering decisions behind the Northwind platform.</p></section>
      <section className="section shell writing-grid">
        {notes.map(([title, text, project], index) => <article key={title}><span className="mono">NOTE / {String(index + 1).padStart(2, "0")}</span><h2>{title}</h2><p>{text}</p><small>Related: {project}</small><div className="coming-soon">Article in progress</div></article>)}
      </section>
      <section className="small-cta shell"><p>Prefer implementation details?</p><Link className="text-link" href="/projects">Explore the case studies <span>→</span></Link></section>
    </>
  );
}

