import Link from "next/link";
export default function NotFound() {
  return <section className="not-found shell"><p className="eyebrow">404 / Not found</p><h1>This path isn&apos;t in the pipeline.</h1><p>The requested page may have moved or has not been built yet.</p><Link className="button primary" href="/">Return home</Link></section>;
}

