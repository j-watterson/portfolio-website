"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CommandPalette from "./CommandPalette";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/writing", label: "Writing" },
  { href: "/resume", label: "Resume" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") || "system";
    setTheme(stored);
    applyTheme(stored);
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function applyTheme(value: string) {
    const dark =
      value === "dark" ||
      (value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }

  function cycleTheme() {
    const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  return (
    <>
      <header className="site-header">
        <a className="skip-link" href="#main">Skip to content</a>
        <div className="nav-shell">
          <Link className="brand" href="/" aria-label="Jon Watterson home">
            <span className="brand-mark" aria-hidden="true">JW</span>
            <span>Jon Watterson</span>
          </Link>
          <button
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="sr-only">Toggle navigation</span>
            <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
          </button>
          <nav id="primary-nav" className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Primary">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <a href="https://github.com/j-watterson" target="_blank" rel="noreferrer">GitHub ↗</a>
          </nav>
          <div className="nav-actions">
            <button className="icon-button command-button" onClick={() => setPaletteOpen(true)} aria-label="Open command palette">
              <span aria-hidden="true">⌘</span><span>K</span>
            </button>
            <button className="icon-button" onClick={cycleTheme} aria-label={`Theme: ${theme}. Change theme.`}>
              <span aria-hidden="true">{theme === "dark" ? "◐" : theme === "light" ? "☀" : "◑"}</span>
            </button>
          </div>
        </div>
      </header>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
