# Jon Watterson — Data Engineering Portfolio

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
- Paginated technical writing, article pages, structured data, and RSS
- A 764-topic research library and ten-topic weekly OpenAI Batch workflow

## Development

```bash
nvm install
nvm use
npm install
npm run dev
```

If nvm is unavailable, `npm run dev:node22` downloads an isolated Node 22
runtime through `npx`. Equivalent wrappers are available as
`npm run check:node22` and `npm run build:node22`.

Production validation creates the Sites-compatible server artifact in `dist/`:

```bash
npm run build
```

## Content Workflow

Add a project to `lib/projects.ts`. The shared project grid and case-study route
will generate its listing and permanent page automatically.

For writing, see [the publishing guide](docs/article-publishing.md) for GitHub
setup, adding topics, review holds, and recovery. The [topic library report](docs/topic-library.md)
explains the tailored seed inventory. An exhausted queue stops making OpenAI
requests automatically; it never invents replacement topics.

## Hosting

The site is connected to OpenAI Sites through `.openai/hosting.json`. Treat its
`project_id` as opaque and never replace it with another site identifier.

For Cloudflare Workers Builds, use:

```text
Build command: npm run build
Deploy command: npx wrangler deploy --config dist/server/wrangler.json
Non-production command: npx wrangler versions upload --config dist/server/wrangler.json
Root directory: /
```

For a guided local-development and GitHub-to-Cloudflare workflow, open
[`docs/local-and-cloudflare-deployment-tutorial.ipynb`](docs/local-and-cloudflare-deployment-tutorial.ipynb).

Launch the notebook in the repository-local Python environment:

```bash
source .venv/bin/activate
jupyter lab
```

To recreate the ignored `.venv` on another computer:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-notebooks.txt
```
