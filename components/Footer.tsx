import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="footer-title">Jon Watterson</p>
          <p>Building reliable data systems that make decisions easier.</p>
        </div>
        <div className="footer-links">
          <Link href="/projects">Projects</Link>
          <Link href="/about">About</Link>
          <Link href="/resume">Resume</Link>
          <a href="https://github.com/j-watterson" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/jw-data/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Jon Watterson</span>
        <span className="mono">Designed for clarity · Built for speed</span>
      </div>
    </footer>
  );
}
