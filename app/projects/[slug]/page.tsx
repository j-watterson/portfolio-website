import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectFlow from "@/components/ProjectFlow";
import { getProject, projects } from "@/lib/projects";

export function generateStaticParams() { return projects.map((project) => ({ slug: project.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const index = projects.findIndex((item) => item.slug === project.slug);
  const next = projects[(index + 1) % projects.length];
  return (
    <>
      <section className="project-hero">
        <div className="shell">
          <div className="breadcrumbs"><Link href="/projects">Projects</Link><span>/</span><span>{project.number}</span></div>
          <div className="project-title-grid">
            <div>
              <p className="eyebrow">{project.category} · {project.status}</p>
              <h1>{project.title}</h1>
              <p className="project-deck">{project.eyebrow}. {project.summary}</p>
              <div className="button-row">
                <a className="button primary" href={project.github} target="_blank" rel="noreferrer">View GitHub <span>↗</span></a>
                <a className="button secondary" href="#architecture">Explore architecture</a>
              </div>
            </div>
            <div className="project-meta-card">
              <div><span>Role fit</span><strong>{project.roles.join(" · ")}</strong></div>
              <div><span>Core stack</span><strong>{project.technologies.slice(0, 3).join(" · ")}</strong></div>
              <div><span>Platform stage</span><strong>{project.number} of {String(projects.length).padStart(2, "0")}</strong></div>
            </div>
          </div>
          <div className="metric-grid">{project.metrics.map((metric) => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}</div>
        </div>
      </section>

      <article className="case-study shell">
        <section className="case-two-col">
          <div><p className="eyebrow">The problem</p><h2>Why this system exists</h2><p>{project.problem}</p></div>
          <div><p className="eyebrow">The solution</p><h2>What was built</h2><p>{project.solution}</p></div>
        </section>

        <section id="architecture" className="case-section">
          <div className="case-heading"><span className="mono">01</span><div><p className="eyebrow">Architecture</p><h2>How data moves</h2></div></div>
          <ProjectFlow steps={project.flow} />
          <p className="architecture-note">Each boundary has one responsibility: receive, validate, transform, persist, or serve. That separation makes failures easier to locate and changes safer to review.</p>
        </section>

        <section className="case-section">
          <div className="case-heading"><span className="mono">02</span><div><p className="eyebrow">Key features</p><h2>Production signals</h2></div></div>
          <div className="feature-grid">{project.features.map((feature) => <div key={feature.title}><span aria-hidden="true">✓</span><h3>{feature.title}</h3><p>{feature.text}</p></div>)}</div>
        </section>

        <section className="case-section">
          <div className="case-heading"><span className="mono">03</span><div><p className="eyebrow">Engineering decisions</p><h2>Choices and tradeoffs</h2></div></div>
          <div className="decision-table">
            {project.decisions.map((decision) => (
              <div className="decision-row" key={decision.choice}>
                <strong>{decision.choice}</strong><p>{decision.why}</p><p><span>Tradeoff</span>{decision.tradeoff}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="case-two-col results-section">
          <div>
            <p className="eyebrow">Verified results</p><h2>Evidence, not estimates</h2>
            <ul className="check-list">{project.results.map((result) => <li key={result}>{result}</li>)}</ul>
          </div>
          <div>
            <p className="eyebrow">Technical challenges</p><h2>What required judgment</h2>
            <div className="challenge-list">{project.challenges.map((challenge) => <div key={challenge.title}><strong>{challenge.title}</strong><p>{challenge.text}</p></div>)}</div>
          </div>
        </section>

        <section className="case-section production-section">
          <div className="case-heading"><span className="mono">04</span><div><p className="eyebrow">Production improvements</p><h2>The enterprise path</h2></div></div>
          <ol>{project.production.map((item, i) => <li key={item}><span className="mono">{String(i + 1).padStart(2, "0")}</span>{item}</li>)}</ol>
        </section>

        <section className="interview-panel">
          <p className="eyebrow">Interview brief</p><h2>The 60-second version</h2>
          <div className="interview-grid">
            <div><span>Why it matters</span><p>{project.interview.matters}</p></div>
            <div><span>Strongest decision</span><p>{project.interview.decision}</p></div>
            <div><span>Main challenge</span><p>{project.interview.challenge}</p></div>
            <div><span>Production next step</span><p>{project.interview.next}</p></div>
          </div>
        </section>
      </article>

      <section className="next-project"><div className="shell"><p className="eyebrow">Continue the platform</p><Link href={`/projects/${next.slug}`}><span>Next case study</span><strong>{next.title}</strong><i>→</i></Link></div></section>
    </>
  );
}

