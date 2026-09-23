import type { Metadata } from "next";
import Link from "next/link";
import { articles, displayDate, plannedNotes } from "@/lib/writing";

const PAGE_SIZE = 12;
const pageNumber = (value?: string) => {
  const requested = Number(value || 1);
  return Number.isInteger(requested) && requested > 0 ? Math.min(requested, Math.max(1, Math.ceil(articles.length / PAGE_SIZE))) : 1;
};
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  return { title: page > 1 ? `Writing — Page ${page}` : "Writing", description: "Technical notes on reliable data engineering: SQL, modeling, pipelines, and operational tradeoffs.", alternates: { canonical: page > 1 ? `/writing?page=${page}` : "/writing", types: { "application/rss+xml": "/writing/feed.xml" } } };
}
export default async function WritingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNumber((await searchParams).page);
  const pages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const visible = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <section className="page-hero shell"><p className="eyebrow">Writing</p><h1>Notes on building data systems that hold up.</h1><p className="page-lead">Practical explanations of data modeling, reliable pipelines, and the engineering decisions behind useful analytics.</p><a className="text-link" href="/writing/feed.xml">Subscribe via RSS <span aria-hidden="true">→</span></a></section>
      {visible.length > 0 && <>
        <section className="section shell writing-grid" aria-label="Published articles">
          {visible.map(article => <article key={article.slug}><span className="mono">{article.category}</span><h2><Link href={`/writing/${article.slug}`}>{article.title}</Link></h2><p>{article.description}</p><small><time dateTime={article.datePublished}>{displayDate(article.datePublished)}</time> · {article.readTime}</small><Link className="text-link writing-read" href={`/writing/${article.slug}`}>Read article <span aria-hidden="true">→</span></Link></article>)}
        </section>
        {pages > 1 && <nav className="shell writing-pagination" aria-label="Article pages">{page > 1 && <Link href={page === 2 ? "/writing" : `/writing?page=${page - 1}`}>← Newer articles</Link>}<span>Page {page} of {pages}</span>{page < pages && <Link href={`/writing?page=${page + 1}`}>Older articles →</Link>}</nav>}
      </>}
      <section className="section shell writing-planned" aria-labelledby="planned-heading">
        <p className="eyebrow">In progress</p><h2 id="planned-heading">From the portfolio projects</h2>
        <div className="writing-grid">{plannedNotes.map((note,index) => <article key={note.slug}><span className="mono">NOTE / {String(index+1).padStart(2,"0")}</span><h3>{note.title}</h3><p>{note.description}</p><small>Related: {note.project}</small><div className="coming-soon">Article in progress</div></article>)}</div>
      </section>
      <section className="small-cta shell"><p>Prefer implementation details?</p><Link className="text-link" href="/projects">Explore the case studies <span>→</span></Link></section>
    </>
  );
}
