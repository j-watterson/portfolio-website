import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { submitBatch, finalizeBatch } from '../scripts/article-batch-pipeline.mjs';
import { readTopicCsv, writeCsv, slugify } from '../scripts/lib/topic-csv.mjs';
const repo=fileURLToPath(new URL('../',import.meta.url));
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const save=(path,value)=>writeFile(path,JSON.stringify(value,null,2)+'\n');
const run=(root,script,...args)=>execFileSync(process.execPath,[`scripts/${script}.mjs`,...args],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});
async function setup(t,count=2,tool=false) {
 const root=await mkdtemp(join(tmpdir(),'portfolio-integration-'));t.after(()=>rm(root,{recursive:true,force:true}));
 for(const folder of ['scripts','content','schemas','prompts']) await cp(join(repo,folder),join(root,folder),{recursive:true});
 const csv=readTopicCsv(await readFile(join(root,'scripts/topic-concepts.csv'),'utf8'));
 const research=await json(join(root,'scripts/topic-research.json'));
 const rows=csv.rows.filter(row=>research[slugify(row[0])].content_type===(tool?'tool-specific':'durable')).slice(0,count);
 await writeFile(join(root,'scripts/topic-concepts.csv'),writeCsv([csv.headers,...rows]));
 return {root,rows};
}
async function submit(root,count=2,now='2026-09-23') {
 return submitBatch({root,count,now:new Date(now),client:{uploadBatchFile:async()=>({id:'file-test'}),createBatch:async()=>({id:'batch-test',status:'validating'})}});
}
function article(topic) {
 return {slug:topic.slug,title:topic.title,description:'An explicit hypothetical example for a technical reader.',primaryKeyword:topic.primaryKeyword,relatedKeywords:topic.relatedKeywords,category:topic.category,level:'Intermediate',readTime:'8 min',datePublished:'2026-01-01',dateModified:'2026-01-01',canonicalUrl:`https://jwatterson.com/writing/${topic.slug}`,status:'published',sourceHash:topic.sourceHash,lead:'Consider this hypothetical dataset; this is not a claim of production experience.',sections:['problem','example','tradeoffs'].map(id=>({id,heading:id,paragraphs:['A hypothetical example explains the invariant and its limitations.'],bullets:[],codeExamples:[{language:'sql',code:"SELECT '<script>alert(1)</script>' AS literal;"}]})),takeaways:['Define the invariant.','Work through the example.','Check the limitations.'],sources:[{title:topic.editorialBrief.sources[0].title,url:topic.editorialBrief.sources[0].url}],requiresVerification:false,verificationNotes:[]};
}
const line=a=>JSON.stringify({custom_id:`article-${a.slug}`,response:{status_code:200,body:{output_text:JSON.stringify(a)}}});
const clientFor=articles=>({getBatch:async()=>({status:'completed',output_file_id:'output'}),downloadFile:async()=>articles.map(line).reverse().join('\n')});

test('real preparation, mocked Batch, publication, metadata preservation and repeat finalization',async t=>{
 const {root,rows}=await setup(t);await submit(root);
 const topics=await json(join(root,'generated/weekly/topic-map.json'));
 const requests=(await readFile(join(root,'generated/batches/article-generation.jsonl'),'utf8')).trim().split('\n').map(JSON.parse);
 assert.equal(requests.length,2);assert.match(requests[0].body.input[0].content,/Do not invent facts about Jon/);
 assert.match(requests[0].body.input[1].content,/portfolio_context/);assert.match(requests[0].body.input[1].content,/exclusions/);
 assert.deepEqual(await json(join(root,'generated/weekly/topics-batch-test.json')),topics);
 const old={...article(topics[0]),slug:'existing-article',title:'Existing article',canonicalUrl:'https://jwatterson.com/writing/existing-article'};
 await save(join(root,'content/articles.json'),[old]);
 const result=await finalizeBatch({root,client:clientFor(topics.map(article))});assert.equal(result.state.publishedCount,2);
 const published=await json(join(root,'content/articles.json'));assert.deepEqual(published[0],old);assert.deepEqual(published.slice(1).map(a=>a.slug),topics.map(t=>t.slug));
 assert.equal(published[1].datePublished,new Date().toISOString().slice(0,10));
 const updated=readTopicCsv(await readFile(join(root,'scripts/topic-concepts.csv'),'utf8')).rows;
 updated.forEach((row,i)=>{assert.deepEqual(row.slice(3),rows[i].slice(3));assert.equal(row[2],'published');assert.equal(row[1],published[i+1].canonicalUrl);});
 assert.equal((await finalizeBatch({root,client:{getBatch(){throw Error('No API allowed');}}})).outcome,'noop');
});

test('tool-specific results are held, archived, skipped subsequently and explicitly approvable',async t=>{
 const {root}=await setup(t,1,true);await submit(root,1);
 const [topic]=await json(join(root,'generated/weekly/topic-map.json'));
 const result=await finalizeBatch({root,client:clientFor([article(topic)])});assert.equal(result.state.publishedCount,0);
 assert.deepEqual(await json(join(root,'content/articles.json')),[]);
 assert.equal((await json(join(root,'generated/weekly/batch-batch-test.json')))[0].status,'review');
 let row=readTopicCsv(await readFile(join(root,'scripts/topic-concepts.csv'),'utf8')).rows[0];assert.equal(row[1],'');assert.equal(row[2],'review');
 run(root,'generate-topics');assert.deepEqual(await json(join(root,'generated/weekly/topic-map.json')),[]);
 run(root,'publish-reviewed-articles','--articles=generated/weekly/batch-batch-test.json','--topics=generated/weekly/topics-batch-test.json','--approve-review');
 run(root,'update-topic-concepts-from-articles');run(root,'validate-writing');
 row=readTopicCsv(await readFile(join(root,'scripts/topic-concepts.csv'),'utf8')).rows[0];assert.equal(row[2],'published');
 assert.equal((await json(join(root,'content/articles.json'))).length,1);
});

test('bad topic provenance rejects the entire result before publication, leaving the active batch recoverable',async t=>{
 const {root}=await setup(t);await submit(root);
 const topics=await json(join(root,'generated/weekly/topic-map.json'));const values=topics.map(article);values[1].sourceHash='wrong-hash';
 const before=await readFile(join(root,'scripts/topic-concepts.csv'),'utf8');
 await assert.rejects(finalizeBatch({root,client:clientFor(values)}),/exited with status/);
 assert.deepEqual(await json(join(root,'content/articles.json')),[]);assert.equal(await readFile(join(root,'scripts/topic-concepts.csv'),'utf8'),before);
 assert.equal((await json(join(root,'generated/article-batch-state.json'))).phase,'active');
});

test('invalid source URLs and reserved section anchors cannot enter published content',async t=>{
 const {root}=await setup(t,1);await submit(root,1);const [topic]=await json(join(root,'generated/weekly/topic-map.json'));
 for(const mutate of [a=>a.sources[0].url='javascript:alert(1)',a=>a.sections[0].id='sources']) {
  const value=article(topic);mutate(value);await save(join(root,'generated/weekly/generated-articles.json'),[value]);
  assert.throws(()=>run(root,'publish-reviewed-articles'));assert.deepEqual(await json(join(root,'content/articles.json')),[]);
 }
});

test('empty or exhausted queues make no API calls and do not invent topics',async t=>{
 const {root}=await setup(t,4);const path=join(root,'scripts/topic-concepts.csv');const csv=readTopicCsv(await readFile(path,'utf8'));
 csv.rows.forEach((r,i)=>{r[2]=['published','review','skip','failed'][i];if(i===0)r[1]=`https://jwatterson.com/writing/${slugify(r[0])}`;});
 const noApi=new Proxy({},{get(){throw Error('No API allowed');}});
 for(const rows of [csv.rows,[]]) {
  await writeFile(path,writeCsv([csv.headers,...rows]));const state=await submitBatch({root,client:noApi});assert.equal(state.phase,'idle');
  assert.deepEqual(await json(join(root,'generated/weekly/topic-map.json')),[]);assert.equal(await readFile(join(root,'generated/batches/article-generation.jsonl'),'utf8'),'');
 }
 assert.equal((await finalizeBatch({root,client:noApi})).outcome,'noop');
});

test('missing briefs stop preparation before the API is accessed',async t=>{
 const {root}=await setup(t,1);await save(join(root,'scripts/topic-research.json'),{});
 await assert.rejects(submitBatch({root,client:new Proxy({},{get(){throw Error('No API allowed');}})}),/exited with status/);
});

test('weekly allowance covers manual runs, caps at ten and resets on Monday UTC',async t=>{
 const {root}=await setup(t,20);await submit(root,7);
 const statePath=join(root,'generated/article-batch-state.json');let state=await json(statePath);state.phase='finalized';await save(statePath,state);
 state=await submit(root,10);assert.equal(state.topicCount,3);assert.equal(state.submittedThisWeek,10);
 state.phase='finalized';await save(statePath,state);
 await submitBatch({root,now:new Date('2026-09-27T23:59:59Z'),runCommand(){throw Error('No work expected');}});
 state=await submit(root,10,'2026-09-28T00:00:00Z');assert.equal(state.topicCount,10);assert.equal(state.submittedThisWeek,10);assert.equal(state.submissionWeek,'2026-09-28');
});

test('a downstream validation failure rolls back publication and CSV without losing active state',async t=>{
 const {root}=await setup(t,1);await submit(root,1);
 const topics=await json(join(root,'generated/weekly/topic-map.json'));
 const before=await readFile(join(root,'scripts/topic-concepts.csv'),'utf8');
 await assert.rejects(finalizeBatch({root,client:clientFor(topics.map(article)),runCommand:async(cwd,script,args)=>{
  if(script.endsWith('validate-writing.mjs')) throw Error('Injected downstream validation failure');
  execFileSync(process.execPath,[script,...args],{cwd,stdio:'pipe'});
 }}),/Injected downstream/);
 assert.deepEqual(await json(join(root,'content/articles.json')),[]);
 assert.equal(await readFile(join(root,'scripts/topic-concepts.csv'),'utf8'),before);
 assert.equal((await json(join(root,'generated/article-batch-state.json'))).phase,'active');
});
