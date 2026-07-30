import Link from "next/link";
import type { Project } from "@/lib/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <div className="card-topline">
        <span className="project-number mono">{project.number}</span>
        <span className="status"><i />{project.status}</span>
      </div>
      <p className="eyebrow">{project.category}</p>
      <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
      <p className="card-summary">{project.summary}</p>
      <div className="tech-list" aria-label="Technologies">
        {project.technologies.slice(0, 5).map((technology) => <span key={technology}>{technology}</span>)}
      </div>
      <div className="card-footer">
        <span>{project.roles.join(" · ")}</span>
        <Link className="arrow-link" href={`/projects/${project.slug}`} aria-label={`View ${project.title} case study`}>
          View project <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}

