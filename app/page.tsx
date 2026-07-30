import Link from "next/link";
import PipelineDiagram from "@/components/PipelineDiagram";
import ProjectCard from "@/components/ProjectCard";
import SectionHeading from "@/components/SectionHeading";
import { projects } from "@/lib/projects";

const capabilities = [
  { icon: "↳", title: "Data pipelines", text: "Idempotent ingestion, validation, incremental loading, and failure recovery." },
  { icon: "◇", title: "Analytics engineering", text: "Governed facts, dimensions, metrics, tests, and BI-ready marts." },
  { icon: "⌁", title: "Workflow automation", text: "Scheduled dependencies, retries, concurrency, observability, and backfills." },
  { icon: "□", title: "Delivery discipline", text: "Containers, CI, configuration, tests, documentation, and runbooks." },
];

export default function Home() {
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="availability"><i /> Open to data engineering opportunities</p>
          <h1>Reliable data systems.<br /><em>Clearly engineered.</em></h1>
          <p className="hero-lead">
            I&apos;m Jonathon, a data engineer focused on building production-minded
            pipelines, cloud warehouses, and analytics infrastructure with Python,
            SQL, BigQuery, dbt, and Airflow.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/projects">Explore the platform <span>→</span></Link>
            <Link className="button secondary" href="/resume">View resume</Link>
          </div>
          <div className="hero-proof">
            <div><strong>3</strong><span>Connected systems</span></div>
            <div><strong>24</strong><span>Automated checks</span></div>
            <div><strong>1</strong><span>Platform narrative</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="terminal-bar"><span /><span /><span /><small className="mono">northwind / platform.status</small></div>
          <div className="terminal-content">
            <div className="terminal-line"><span className="mono muted">$</span> platform inspect --production</div>
            <div className="terminal-status"><span>INGESTION</span><strong>healthy</strong></div>
            <div className="terminal-status"><span>WAREHOUSE</span><strong>tested</strong></div>
            <div className="terminal-status"><span>ORCHESTRATION</span><strong>scheduled</strong></div>
            <div className="terminal-rule" />
            <div className="terminal-metric"><span>Latest quality gate</span><strong>PASS</strong></div>
            <div className="terminal-line success"><span>✓</span> BI datasets ready for consumption</div>
          </div>
          <div className="grid-decoration" aria-hidden="true" />
        </div>
      </section>

      <section className="platform-band">
        <div className="shell">
          <div className="band-heading">
            <div><p className="eyebrow">One company. One evolving platform.</p><h2>Northwind Outfitters</h2></div>
            <p>Each repository solves the next realistic problem for a fictional ecommerce data team.</p>
          </div>
          <PipelineDiagram />
        </div>
      </section>

      <section className="section shell">
        <SectionHeading eyebrow="Featured case studies" title="Systems that build on each other" text="A guided tour from local batch ingestion to a governed, automated analytics platform." />
        <div className="project-grid">{projects.map((project) => <ProjectCard project={project} key={project.slug} />)}</div>
        <div className="section-action"><Link className="text-link" href="/projects">View the complete platform roadmap <span>→</span></Link></div>
      </section>

      <section className="section capability-section">
        <div className="shell">
          <SectionHeading eyebrow="Core capabilities" title="Engineering beyond the happy path" text="The portfolio emphasizes how data systems behave when inputs change, jobs fail, and teams need trustworthy answers." />
          <div className="capability-grid">
            {capabilities.map((item) => (
              <article key={item.title} className="capability-card">
                <span className="capability-icon" aria-hidden="true">{item.icon}</span>
                <h3>{item.title}</h3><p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell principles">
        <div>
          <p className="eyebrow">How I work</p>
          <h2>Clarity is a production feature.</h2>
          <p>Reliable systems are easier to trust, operate, and explain. These principles shape every project.</p>
          <Link className="text-link" href="/about">More about my approach <span>→</span></Link>
        </div>
        <ol className="principle-list">
          <li><span className="mono">01</span><div><strong>Design for repeatability.</strong><p>Every run should be safe, predictable, and auditable.</p></div></li>
          <li><span className="mono">02</span><div><strong>Make failures observable.</strong><p>Errors need context, ownership, and a recovery path.</p></div></li>
          <li><span className="mono">03</span><div><strong>Prefer maintainable systems.</strong><p>Clear contracts beat clever transformations.</p></div></li>
          <li><span className="mono">04</span><div><strong>Treat quality as architecture.</strong><p>Validation belongs inside the platform, not after it.</p></div></li>
        </ol>
      </section>

      <section className="contact-band">
        <div className="shell contact-inner">
          <div><p className="eyebrow">Let&apos;s connect</p><h2>Looking for a data engineer who thinks in systems?</h2></div>
          <div className="button-row">
            <a className="button light" href="mailto:jwatterson99@proton.me">Start a conversation <span>↗</span></a>
            <a className="button ghost-light" href="https://www.linkedin.com/in/jw-data/" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </section>
    </>
  );
}

