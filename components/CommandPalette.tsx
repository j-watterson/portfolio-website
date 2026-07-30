"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { projects } from "@/lib/projects";

type Props = { open: boolean; onClose: () => void };

const staticItems = [
  { label: "Home", hint: "Overview", href: "/" },
  { label: "Projects", hint: "Case studies", href: "/projects" },
  { label: "About", hint: "Background & principles", href: "/about" },
  { label: "Resume", hint: "Experience & skills", href: "/resume" },
  { label: "Writing", hint: "Technical notes", href: "/writing" },
];

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const allItems = [
    ...staticItems,
    ...projects.map((project) => ({
      label: project.title,
      hint: project.category,
      href: `/projects/${project.slug}`,
    })),
  ];
  const items = allItems.filter((item) =>
    `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;
  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="palette-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Quick navigation" onMouseDown={(e) => e.stopPropagation()}>
        <div className="palette-search">
          <span aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && items[0]) go(items[0].href);
            }}
            placeholder="Jump to a page or project…"
            aria-label="Search navigation"
          />
          <kbd>esc</kbd>
        </div>
        <div className="palette-results">
          {items.map((item) => (
            <button key={item.href} onClick={() => go(item.href)}>
              <span>{item.label}</span><small>{item.hint}</small>
            </button>
          ))}
          {!items.length && <p className="empty-state">No matching page.</p>}
        </div>
      </div>
    </div>
  );
}

