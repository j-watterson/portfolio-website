import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, displayDate, getArticle, safeJsonLd, SITE_URL } from "@/lib/writing";

export function generateStaticParams() { return articles.map(article => ({ slug: article.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return { title: "Article not found", robots: { index: false, follow: false } };
  return { title: article.title, description: article.description, alternates: { canonical: article.canonicalUrl }, openGraph: { type: "article", title: article.title, description: article.description, url: article.canonicalUrl, publishedTime: article.datePublished, modifiedTime: article.dateModified, authors: ["Jon Watterson"] } };
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const related = articles.filter(other => other.slug !== article.slug && other.category === article.category).slice(0,3);
  const structuredData = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.title, description: article.description, url: article.canonicalUrl, mainEntityOfPage: article.canonicalUrl, datePublished: article.datePublished, dateModified: article.dateModified, author: { "@type": "Person", name: "Jon Watterson", url: SITE_URL }, publisher: { "@type": "Person", name: "Jon Watterson", url: SITE_URL } };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
    <header className="page-hero shell writing-hero"><div className="breadcrumbs"><Link href="/writing">Writing</Link><span>/</span><span>{article.category}</span></div><p className="eyebrow">{article.category} · {article.level}</p><h1>{article.title}</h1><p className="page-lead">{article.description}</p><p className="writing-meta">Jon Watterson · <time dateTime={article.datePublished}>{displayDate(article.datePublished)}</time> · {article.readTime}{article.dateModified !== article.datePublished && <> · Updated <time dateTime={article.dateModified}>{displayDate(article.dateModified)}</time></>}</p></header>
    <div className="shell writing-layout">
      <nav className="writing-toc" aria-label="On this page"><strong>On this page</strong><ul>{article.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.heading}</a></li>)}<li><a href="#takeaways">Takeaways</a></li><li><a href="#sources">Sources</a></li></ul></nav>
      <article className="writing-body"><p className="writing-lead">{article.lead}</p>
        {article.sections.map(section => <section id={section.id} key={section.id}><h2>{section.heading}</h2>{section.paragraphs.map((text,i) => <p key={i}>{text}</p>)}{section.bullets.length > 0 && <ul>{section.bullets.map((text,i) => <li key={i}>{text}</li>)}</ul>}{section.codeExamples.map((example,i) => <figure className="writing-code" key={i}><figcaption>{example.language}</figcaption><pre><code>{example.code}</code></pre></figure>)}</section>)}
        <section id="takeaways"><h2>Takeaways</h2><ul>{article.takeaways.map((text,i) => <li key={i}>{text}</li>)}</ul></section>
        <section id="sources"><h2>Sources</h2><ul>{article.sources.map((source,i) => <li key={i}><a href={source.url} rel="noreferrer">{source.title}</a></li>)}</ul></section>
      </article>
    </div>
    <section className="section shell writing-related"><h2>Keep reading</h2>{related.length > 0 && <ul>{related.map(other => <li key={other.slug}><Link href={`/writing/${other.slug}`}>{other.title}</Link></li>)}</ul>}<Link className="text-link" href="/writing">All articles <span aria-hidden="true">→</span></Link></section>
  </>;
}
