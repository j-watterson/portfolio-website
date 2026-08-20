# Jonathon Watterson — Data Engineering Portfolio

A recruiter-focused portfolio presenting the Northwind Outfitters data platform
as three connected engineering case studies:

1. Retail Analytics Platform
2. Customer Analytics Warehouse
3. Workflow Automation Platform

## Features

- Structured project metadata powering listings and case studies
- Responsive Next.js pages packaged with vinext for production hosting
- Light, dark, and system theme modes
- Keyboard-accessible navigation and command palette
- Mobile-friendly platform and project architecture diagrams
- Print-friendly HTML resume
- Project metadata, Open Graph metadata, sitemap, and robots directives
- Reduced-motion support and visible focus states

## Development

```bash
npm install
npm run dev
```

Production validation creates the Sites-compatible server artifact in `dist/`:

```bash
npm run build
```

## Content Workflow

Add a project to `lib/projects.ts`. The shared project grid and case-study route
will generate its listing and permanent page automatically.

## Hosting

The site is connected to OpenAI Sites through `.openai/hosting.json`. Treat its
`project_id` as opaque and never replace it with another site identifier.
