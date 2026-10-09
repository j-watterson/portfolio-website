import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import test from 'node:test';
import { verifyGoogleTag, verifyWritingRoutes } from '../scripts/verify-writing-routes.mjs';

const googleTag = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-FS1JDGT6BS"></script>
<script>window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-FS1JDGT6BS');</script>`;
const html = (body, tag = googleTag) => `<html><head>${tag}</head><body>${body}</body></html>`;

async function fixture(t, broken) {
  const articles = Array.from({ length: 14 }, (_, i) => ({
    slug: `article-${i}`, status: 'published', requiresVerification: false,
    datePublished: `2026-09-${String(i + 1).padStart(2, '0')}`,
    canonicalUrl: `https://jwatterson.com/writing/article-${i}`
  }));
  articles.push({ slug: 'held', status: 'review', requiresVerification: true });
  const published = articles.slice(0, 14).reverse();
  const pages = {
    '/': '<h1>Home</h1>',
    '/about': '<h1>About</h1>',
    '/writing': published.slice(0, 12).map(a => `<a href="/writing/${a.slug}">Article</a>`).join(''),
    '/sitemap.xml': '<loc>https://jwatterson.com/</loc><loc>https://jwatterson.com/about</loc>' + published.map(a => `<loc>${a.canonicalUrl}</loc>`).join(''),
    '/writing/feed.xml': published.map(a => `<link>${a.canonicalUrl}</link>`).join(''),
    ...Object.fromEntries(published.map(a => [`/writing/${a.slug}`, `<link rel="canonical" href="${a.canonicalUrl}">`]))
  };
  if (broken) pages[broken] = '';
  for (const path of Object.keys(pages)) {
    if (!path.endsWith('.xml')) pages[path] = html(pages[path]);
  }
  const server = createServer((req, res) => {
    res.writeHead(req.url in pages ? 200 : 404);
    res.end(pages[req.url] ?? 'Not found');
  }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  return { url: `http://127.0.0.1:${server.address().port}`, articles };
}

test('Google tag checks reject missing, duplicate, misplaced, or incorrectly configured tags', () => {
  verifyGoogleTag(html('Page'), '/');
  for (const page of [
    html('Page', ''),
    html('Page', googleTag + googleTag),
    html(googleTag, ''),
    html('Page', googleTag.replace("gtag('config', 'G-FS1JDGT6BS')", "gtag('config', 'G-OTHER')")),
    html('Page', googleTag.replace(' async', '')),
    html('Page', googleTag.replace('function gtag(){dataLayer.push(arguments);}', ''))
  ]) assert.throws(() => verifyGoogleTag(page, '/'));
});

test('route checks cover all sitemap articles and only the latest page of published writing', async t => {
  const { url, articles } = await fixture(t);
  await verifyWritingRoutes(url, articles);
});
for (const [route, message] of [['/writing', /Latest article missing/], ['/sitemap.xml', /Sitemap missing/], ['/writing/article-13', /Article canonical missing/], ['/writing/feed.xml', /RSS missing/]]) {
  test(`route checks reject missing content at ${route}`, async t => {
    const { url, articles } = await fixture(t, route);
    await assert.rejects(verifyWritingRoutes(url, articles), message);
  });
}
