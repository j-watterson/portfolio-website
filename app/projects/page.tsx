import type { Metadata } from "next";
import PipelineDiagram from "@/components/PipelineDiagram";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Data engineering case studies spanning ETL, BigQuery, dbt, and Airflow.",
};

const roadmap = [
  ["04", "Data Quality Platform", "Great Expectations", "Planned"],
  ["05", "Real-Time Order Analytics", "Kafka", "Planned"],
  ["06", "Lakehouse Architecture", "Spark · Iceberg", "Planned"],
  ["07", "Customer Churn Platform", "scikit-learn", "Planned"],
];

export default function ProjectsPage() {
  return (
    <>
      <section className="page-hero shell">
        <p className="eyebrow">Portfolio systems</p>
        <h1>One platform, built in deliberate stages.</h1>
        <p className="page-lead">Every case study solves a real business problem for Northwind Outfitters and adds another production capability to the same data platform.</p>
        <PipelineDiagram compact />
      </section>
      <section className="section shell">
        <div className="filter-row" aria-label="Project summary">
          <span className="filter active">All systems <b>{projects.length}</b></span>
          <span className="filter">Data Engineering</span>
          <span className="filter">Analytics Engineering</span>
          <span className="filter">Platform</span>
        </div>
        <div className="project-grid">{projects.map((project) => <ProjectCard key={project.slug} project={project} />)}</div>
      </section>
      <section className="section roadmap-section">
        <div className="shell">
          <div className="section-heading"><p className="eyebrow">Platform roadmap</p><h2>What comes next</h2><p>The next repositories extend reliability, latency, architecture, and data-product capabilities.</p></div>
          <div className="roadmap-list">
            {roadmap.map(([number, title, tech, status]) => (
              <div className="roadmap-item" key={number}><span className="mono">{number}</span><strong>{title}</strong><span>{tech}</span><small>{status}</small></div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

