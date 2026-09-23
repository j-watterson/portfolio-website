# Initial portfolio topic library

Prepared September 23, 2026. The initial queue has **764 distinct canonical topics**, tailored from Coldstart's existing research to practicing/aspiring data engineers. This is approximately 76 weeks of ten submissions, with a final partial week, before review holds or failed requests affect timing.

## Selection and provenance

Coldstart's 1,105-topic snapshot contributed 767 practitioner topics. This library excludes its 338 leader/founder topics and reserves three overlapping concepts for the existing portfolio notes:

| Excluded seed | Preserved note |
|---|---|
| Idempotent data transformations | Idempotency is a product feature |
| Lookback windows in incremental transformations | Late data without full rebuilds |
| Data dependencies versus task dependencies | Scheduling is not orchestration |

The portfolio initially had these three planned notes and no published article bodies. Their original descriptions/project associations remain. Home, about, resume, project case studies, hosting identities, and deployment configuration are preserved.

Briefs reuse **174 inspected source pages** across **40 subject clusters**, including PostgreSQL, Kimball, dbt, Airflow, Google SRE, and platform documentation. Inspection timestamps and content fingerprints are inherited from the September 22 Coldstart research snapshot, not represented as newly conducted research. Source records, retained distinctions, and original Coldstart coverage comparisons remain available for audit. `scripts/research/library-summary.json` records the snapshot hash, counts, and exclusion decisions. `scripts/import-coldstart-topics.py` makes the initial selection reproducible and refuses to reset an existing queue.

Each brief adds a personal-blog boundary: teach the technical problem with an original hypothetical example; never invent Jon's employment, customer outcomes, experiments, or first-person production experience. Shared seeds are not authorization to republish or lightly rewrite Coldstart articles. New articles need different explanations/examples; a topic inventory cannot guarantee the eventual prose is original or establish expertise by itself.

## Coverage

| Category | Topics |
|---|---:|
| Data Modeling | 211 |
| Dashboard Trust | 59 |
| Modern Data Stack | 219 |
| Automation | 215 |
| Migration | 20 |
| AI-Ready Data | 40 |
| **Total** | **764** |

All 764 initial topics target practitioners, ordered into learning sequences with prerequisites before dependent topics. There are **543 durable concepts (71.1%)** and **221 tool-specific topics (28.9%)**. The technical focus produces a different mix from Coldstart's broader brand library; no keyword variants were manufactured to restore its 80/20 allocation.

Review cadences: `never` 155, `annual` 388, `quarterly` 213, `monthly` 8. These are maintenance labels, not scheduled automatic rewrites. Tool-specific drafts are always held for human verification, so ten submissions do not necessarily yield ten publications that week.

## Duplicate controls and practical limits

Canonical slugs and normalized secondary keywords are unique across the initial queue. Three reserved intents are explicitly removed; aliases do not become separate articles. Carried-over briefs describe outcomes, exclusions, nearest Coldstart coverage, and reviewed distinctions. The validator checks each CSV/brief pair, category, ordering, prerequisites, metadata, and source provenance. The publisher checks returned topic identity and refuses to overwrite an existing or reserved article.

These checks catch structural duplication, not every semantic overlap or unsupported factual claim. When adding a topic, compare its actual intended explanation, example, and outcome with full published content and review drafts; merge overlapping reader needs. When reviewing generated articles, verify source support and evidence. No search volumes or keyword difficulty figures are claimed.

See [article-publishing.md](article-publishing.md) for adding topics, GitHub setup, empty-queue behavior, and review/recovery procedures.
