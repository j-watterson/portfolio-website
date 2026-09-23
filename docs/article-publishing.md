# Publishing articles on jwatterson.com

The repository contains 764 researched technical topics, an independent OpenAI Batch pipeline, and article pages under `/writing/{slug}`. Existing project pages and the three in-progress writing notes remain in place. No articles were generated or deployed during setup.

## Enable it in GitHub

1. Commit and push these changes to `j-watterson/portfolio-website` on `main`. Run **Actions → Validate portfolio and articles** and confirm it passes.
2. Open **Settings → Secrets and variables → Actions → Secrets → New repository secret**. Add `OPENAI_API_KEY` using a current OpenAI project key with access to the chosen model and sufficient billing/quota. Never put the key in a tracked file. Coldstart's GitHub repository secrets are not automatically available here; you may use the same valid project key, or a separate key for easier accounting.
3. In **Settings → Actions → General**, enable Actions and allow the official actions used by the workflows. The submit/finalize workflows request `contents: write`. Repository/organization policy must permit it. If **Settings → Rules → Rulesets** or branch protection requires pull requests for every change, arrange an allowed automation identity/bypass with the repository owner, or adapt publishing to pull requests. The provided workflows push directly to `main`; do not disable protections blindly.
4. Connect deployment using **one** of the options below. Publishing commits alone do not prove the live site was deployed.
5. Open **Actions → Submit weekly writing batch → Run workflow**, choose `main`, and use count `1` for a paid smoke run or `10` for the full batch. The first manual run counts toward that week's allowance. **Finalize writing batch** checks hourly; you can also run it manually. Check its logs and then the live `/writing` page.

The default model matches Coldstart: `gpt-5.5`. To choose another model available to your OpenAI project that supports Responses, Structured Outputs, and Batch, set the repository **variable** `OPENAI_MODEL`. A secret is not needed for the model name.

### Deployment option A: existing Cloudflare Git integration

If the production Worker is already connected to this repository, confirm Workers Builds watches `main` with these settings:

```text
Root directory: /
Build command: npm run build
Deploy command: npx wrangler deploy --config dist/server/wrangler.json
```

Use a supported Node version (22.12 or later; workflows use 24). Verify that a publishing bot commit triggers a production build. Keep `DEPLOY_TO_CLOUDFLARE` unset when using this route.

### Deployment option B: deploy directly from GitHub Actions

Under **Settings → Secrets and variables → Actions**, add:

| Kind | Name | Value |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | Token authorized to deploy this Worker in its account |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | The account containing the existing portfolio Worker |
| Variable | `DEPLOY_TO_CLOUDFLARE` | `true` |

The existing Worker name in `wrangler.jsonc` and `.openai/hosting.json` identity are preserved. Check the Worker owns the production `jwatterson.com` domain. Run **Actions → Deploy portfolio to Cloudflare → Run workflow** once to verify credentials and deployment. That workflow also deploys relevant human pushes to `main`. Batch finalization builds and deploys directly after publishing because commits made with `GITHUB_TOKEN` do not start ordinary `push` workflows. If deployment fails after the content commit succeeds, fix deployment and rerun **Deploy portfolio to Cloudflare**; do not submit another batch.

See [Cloudflare's GitHub Actions deployment guidance](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/) and [GitHub's workflow trigger behavior](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

## Schedule and stopping behavior

- Submission: Monday at **16:17 UTC** (9:17 a.m. Pacific daylight time / 8:17 a.m. Pacific standard time). GitHub schedules can be delayed.
- Finalization: hourly at minute 47. Batch processing is asynchronous, with a requested 24-hour completion window; see [OpenAI's Batch guide](https://developers.openai.com/api/docs/guides/batch).
- Limit: at most **10 submitted topics per Monday–Sunday UTC week**, including manual runs. Failed or held requests still consume that allowance. This is a target of ten articles, not a guarantee that ten pass publication each week.
- The next available CSV rows are selected in order. A nonempty publication URL, a published article/reserved note with the same slug, or status `review`, `published`, `skip`, or `failed` prevents selection. Eligible statuses are `not written`, `ready`, and `pending`.
- With fewer than ten eligible topics, it submits only the remainder. With none, it logs that the queue is exhausted and makes **no OpenAI calls**. It never invents topics, recycles published rows, or expands the list. The scheduled checks continue as harmless no-ops. Any already-active batch can still finish.
- To pause completely, disable both batch workflows in Actions. Cadence labels in the CSV describe editorial review intervals; they do not schedule rewrites.

Tool-specific articles and model-flagged uncertain articles are held for human review. They are not exposed on the site. Durable articles passing validation may publish automatically. Structural checks do not establish factual accuracy: review sources, examples, and the public output, particularly during initial runs. Generated prose must not invent Jon's experience or claim tests that were never run.

## Files and local checks

| File | Purpose |
|---|---|
| `scripts/topic-concepts.csv` | Ordered queue and publication tracking |
| `scripts/topic-research.json` | Article boundaries and evidence requirements, keyed by slug |
| `scripts/research/source-manifest.json` | Source inspection provenance |
| `content/articles.json` | Validated published articles only |
| `content/planned-notes.json` | The three preserved in-progress notes |
| `prompts/article-system-prompt.md` | Personal-blog style and evidence rules |
| `generated/article-batch-state.json` | Active batch and weekly allowance; created on first submission |
| `generated/weekly/topics-BATCH_ID.json` | Immutable submitted brief snapshot for that batch |
| `generated/weekly/batch-BATCH_ID.json` | Returned articles, including review holds |

Use Node 22.12+ (or `nvm use`) and run:

```bash
npm ci
npm run validate:topics
npm run test:articles
npm run typecheck
npm run build
```

Offline preparation, without an API key or charges:

```bash
npm run generate:topics -- --count=10
npm run prepare:batch
```

Inspect `generated/weekly/topic-map.json` and ignored `generated/batches/article-generation.jsonl`. Preparation does not update publication status. Avoid changing generated state locally while GitHub owns an active batch. Local API use, if needed, reads the ignored `.env.local` (see `.env.example`); no credentials are included in this repository.

## Add topics later

Start from a clean, current checkout. Because automation commits to `main`, run `git pull --no-rebase` before editing; resolve any conflicts rather than force-pushing over batch state.

1. Define a genuinely separate reader question and useful outcome. Inspect authoritative sources and compare the full existing articles, held drafts, planned notes, and neighboring briefs. Synonyms belong in `secondary_keywords`, not additional rows.
2. Append a CSV row using exactly these columns. Quote fields containing commas. Keep `url` blank until publication; it is **not** a research-source field.

   ```csv
   topic,url,status,audience,update_frequency
   Your distinct technical topic,,not written,practitioners,annual
   ```

   Allowed audiences: `practitioners`, `leaders`, `founders`, in that block order. All initial portfolio topics target practitioners. Cadences: `monthly`, `quarterly`, `semiannual`, `annual`, `never`.
3. Add a matching object to `scripts/topic-research.json`. Copy the shape of a nearby brief, then rewrite its substance; do not retain unrelated sources, inherited Coldstart comparisons, or duplicate aliases. The key is `slugify(topic)` from `scripts/lib/topic-csv.mjs`. Required content includes `topic`, `audience`, `update_frequency`, `content_type` (`durable` or `tool-specific`), `category`, `cluster`, `primary_question`, nonempty `scope`, `exclusions`, `original_contribution`, `evidence_requirements`, `portfolio_context`, `cross_brand_boundary`, and arrays `secondary_keywords`, `prerequisites`, `sources`. Keep useful `track` and distinctness notes. Set `publication_order` to the row's position starting at 1.
4. Sources need `source_id`, `url`, `title`, and the actual ISO `accessed_at` timestamp. Every source must have a matching entry in `scripts/research/source-manifest.json`, using the same final HTTPS URL and timestamp plus the real `sha256` of the inspected source content. Follow the existing record shape (`requested_url`, `url`, `title`, `accessed_at`, `word_count`, `sha256`). Retain an existing inspection date if reusing its record; do not invent a fresh inspection. For a new inspection, hash the saved content, for example `sha256sum /tmp/inspected-source.html`.
5. Put prerequisites before their dependent topic. If inserting or reordering, update `publication_order` for affected briefs. Use one of the six category titles in `content/categories.json`. Keep the article's outcome distinct from adjacent topics and the reserved notes.
6. Run the checks above and offline preparation, review the diff, then commit and push the CSV, briefs, and any new source records. The next weekly run will pick eligible rows automatically. Update the descriptive library report/counts when the inventory changes.

Do not clear existing statuses, publication URLs, articles, or batch state when adding topics. The one-time `scripts/import-coldstart-topics.py` refuses to overwrite an existing library; it is provenance tooling, not the maintenance workflow. Runtime does not require Coldstart's directory or credentials files.

## Review held articles

Find the relevant batch ID in state/history and open both archived JSON files. Verify the sources and every claim, execute version-specific examples where required, and edit the draft so it makes only supportable statements. Keep the submitted `slug`, `primaryKeyword`, `category`, and `sourceHash`. The flag below is an explicit editorial approval of all eligible articles in the supplied file, so use a file containing only the drafts you have reviewed if approving a subset.

```bash
npm run publish:reviewed -- --articles=generated/weekly/batch-BATCH_ID.json --topics=generated/weekly/topics-BATCH_ID.json --approve-review
node scripts/update-topic-concepts-from-articles.mjs
npm run validate:topics
npm run typecheck
npm run build
```

Commit `content/articles.json`, `scripts/topic-concepts.csv`, and edited review files, then push. The publisher never overwrites an existing article. An approved draft gets the actual UTC publication date. Do not rename a published topic or change its URL merely to trigger regeneration. Manual approval releases already-submitted articles and does not consume a new API request; it can make a particular week's publication total exceed ten when releasing older holds.

## Failure recovery

An active batch blocks another submission. Pending batches only need time. Successful responses in a partially failed Batch can publish; failures are recorded in state. Unreturned/failed API requests retain their original eligible CSV status for a later week. To stop retrying a topic, change its status to `skip` (or `failed`). Validation failures roll back article/CSV changes and keep the active state available for investigation.

If a push fails after OpenAI accepted a batch, download the workflow's **writing-submission-recovery** artifact and recover its state plus weekly files into the latest branch before retrying. Likewise, **writing-finalization-recovery** preserves publication files on finalization failure. Check the OpenAI Batch dashboard and recorded ID first: deleting state or blindly rerunning a lost submission can create duplicate paid batches. Workflows never force-push. Do not publish locally and in Actions concurrently.
