import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { editArticle } from '../scripts/lib/automatic-editor.mjs';
const json = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const [articles, schema, categories] = await Promise.all(['../content/articles.json', '../schemas/article.schema.json', '../content/categories.json'].map(json));
const article = articles[0];
const topic = Object.fromEntries(['slug', 'primaryKeyword', 'sourceHash', 'category'].map(key => [key, article[key]]));
function response(value=article) {
 return { id:'resp-test',status:'completed',output:[
  {type:'web_search_call',status:'completed',action:{type:'search',sources:article.sources}},
  {type:'message',content:[{type:'output_text',text:JSON.stringify(value)}]}
 ]};
}
async function run(value) {
 return editArticle({article,topic,schema,categories,model:'gpt-5.5',client:{createResponse:async request=>{
  assert.equal(request.model,'gpt-5.5');assert.equal(request.tool_choice,'required');assert.equal(request.tools[0].type,'web_search');
  return value;
 }}});
}
test('automatic editor requires real search evidence and preserves article identity', async()=>{
 const result=await run(response());assert.equal(result.article.slug,article.slug);assert.equal(result.evidence.responseId,'resp-test');
});
test('automatic editor rejects incomplete, unsearched, unverified, fabricated-source and mismatched results', async()=>{
 const incomplete=response();incomplete.status='incomplete';
 const noSearch=response();noSearch.output.shift();
 for(const value of [incomplete,noSearch,response({...article,slug:'changed'}),response({...article,status:'review',requiresVerification:true,verificationNotes:['Unresolved claim']}),response({...article,sources:[{title:'Invented',url:'https://example.com/invented'}]})]) await assert.rejects(run(value));
});
