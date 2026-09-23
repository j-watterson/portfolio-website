"""One-time seed import. Normal publishing never needs the Coldstart checkout."""
import argparse,collections,csv,hashlib,json
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path,required=True);args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
if (root/'scripts/topic-concepts.csv').exists():raise SystemExit('Queue already exists; add researched topics using docs/article-publishing.md. This importer never resets publication history.')
source=args.source/'scripts/topic-research.json';original=json.loads(source.read_text());manifest=json.loads((args.source/'scripts/research/source-manifest.json').read_text())
reserved={
 'idempotent-data-transformations':'Reserved for existing note: Idempotency is a product feature.',
 'lookback-windows-in-incremental-transformations':'Reserved for existing note: Late data without full rebuilds.',
 'data-dependencies-versus-task-dependencies':'Reserved for existing note: Scheduling is not orchestration.'}
selected={s:b for s,b in original.items() if b['audience']=='practitioners' and s not in reserved}
research={};seen=set();sources=set();snapshot_hash=hashlib.sha256(source.read_bytes()).hexdigest()
for index,(slug,brief) in enumerate(selected.items(),1):
 b=dict(brief)
 b['prerequisites']=[s for s in b['prerequisites'] if s in seen]
 b['coldstart_coverage']=b.pop('existing_coverage')
 b['portfolio_context']='Technical education for practicing and aspiring data engineers. Use small, explicitly hypothetical retail-order or customer-event fixtures where useful. Do not claim Jon implemented or tested anything without supplied evidence.'
 b['cross_brand_boundary']='Coldstart and this portfolio share seed concepts, not article prose. Create a fresh example, explanation, and diagnostic outcome. Do not copy or lightly rewrite Coldstart articles.'
 b['exclusions']=[e.replace('/articles/','/writing/').replace('nearest existing articles listed in existing_coverage','Coldstart coverage listed in coldstart_coverage') for e in b['exclusions'] if not any(s in e for s in reserved)]
 b['exclusions'] += ['Do not replace or retell the three existing in-progress portfolio notes.','Do not invent employment history, client stories, measurements, expert review, or first-person hands-on experience.']
 b['publication_order']=index
 b['seed_origin']={'brand':'Coldstart','slug':slug,'snapshot_sha256':snapshot_hash,'adapted_on':'2026-09-23'}
 research[slug]=b;seen.add(slug);sources.update(s['source_id'] for s in b['sources'])
with (root/'scripts/topic-concepts.csv').open('w',newline='') as f:
 writer=csv.writer(f);writer.writerow(['topic','url','status','audience','update_frequency']);writer.writerows([b['topic'],'','not written',b['audience'],b['update_frequency']] for b in research.values())
(root/'scripts/topic-research.json').write_text(json.dumps(research,indent=2,ensure_ascii=False)+'\n')
(root/'scripts/research/source-manifest.json').write_text(json.dumps({k:manifest[k] for k in sorted(sources)},indent=2)+'\n')
report={'accepted':len(research),'source':'Coldstart research snapshot, accessed 2026-09-22; adapted 2026-09-23, not represented as newly inspected source pages.','snapshot_sha256':snapshot_hash,'excluded_existing_notes':reserved,'excluded_other_audiences':sum(b['audience']!='practitioners' for b in original.values()),'unique_source_pages':len({s['url'] for b in research.values() for s in b['sources']}),'counts':{key:dict(collections.Counter(b[key] for b in research.values())) for key in ['category','content_type','update_frequency']},'clusters':len(set(b['cluster'] for b in research.values()))}
(root/'scripts/research/library-summary.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
