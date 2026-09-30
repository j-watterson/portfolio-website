import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function verifyWritingRoutes(baseUrl, articles) {
  const published = articles.filter(article => article.status === 'published' && !article.requiresVerification)
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished) || a.slug.localeCompare(b.slug));
  const get = async path => {
    const response = await fetch(new URL(path, baseUrl), { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, `${path} must return 200`);
    return response.text();
  };
  const [writing, sitemap, feed] = await Promise.all(['/writing', '/sitemap.xml', '/writing/feed.xml'].map(get));
  let previous = -1;
  for (const article of published.slice(0, 12)) {
    const position = writing.indexOf(`href="/writing/${article.slug}"`);
    assert.ok(position > previous, `Latest article missing or out of order: ${article.slug}`);
    previous = position;
  }
  for (const article of published) {
    assert.ok(sitemap.includes(`<loc>${article.canonicalUrl}</loc>`), `Sitemap missing ${article.slug}`);
    const page = await get(`/writing/${article.slug}`);
    assert.ok(page.includes(`href="${article.canonicalUrl}"`), `Article canonical missing: ${article.slug}`);
  }
  for (const article of published.slice(0, 30)) {
    assert.ok(feed.includes(`<link>${article.canonicalUrl}</link>`), `RSS missing ${article.slug}`);
  }
  console.log(`Verified ${published.length} article routes and sitemap entries, latest writing order, and RSS.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const baseUrl = process.argv.find(arg => arg.startsWith('--base-url='))?.slice(11);
  if (!baseUrl) throw new Error('Pass --base-url=http://127.0.0.1:8787 (or the deployed site).');
  const attempts = Number(process.argv.find(arg => arg.startsWith('--attempts='))?.slice(11) || 1);
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 40) throw new Error('Attempts must be 1–40.');
  const articles = JSON.parse(await readFile('content/articles.json', 'utf8'));
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try { await verifyWritingRoutes(baseUrl, articles); break; }
    catch (error) {
      if (attempt === attempts) throw error;
      console.log(`Deployment not ready (${attempt}/${attempts}): ${error.message}`);
      await delay(15000);
    }
  }
}
