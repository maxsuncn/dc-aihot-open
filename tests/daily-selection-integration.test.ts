// DC selection keeps upstream fact identity while applying the industry's score and daily budget.
import './setup.ts';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { sql, closeDb } from '@aihot/backend/db';
import { upsertMaterial } from '@aihot/backend/content/materials';
import { publishArticle } from '@aihot/backend/publication/publish';
import { stopBoss } from '@aihot/backend/jobs/queue';
import { tag } from './setup.ts';

const source = `dc-cap-${tag()}`;
let sequence = 0;
before(async () => {
  await sql`INSERT INTO sources (id, name, kind, tier, participation_mode) VALUES (${source}, 'DC cap test', 'rss', 'T1', 'editorial')`;
});
after(async () => { await stopBoss(); await closeDb(); });

async function article(score: number, day: string, factId?: number) {
  const n = ++sequence;
  const { articleId } = await upsertMaterial({ sourceId: source, url: `https://example.com/${source}/${n}`, title: `数据中心项目${n}`, bodyText: '数据中心项目建设与供配电的正式公告。', bodyStatus: 'ok', via: 'fetch' });
  await sql`UPDATE articles SET discovered_at = ${new Date(`${day}T02:00:00Z`)}, grouping_status = 'complete', selection_adds_value = true WHERE id = ${articleId}`;
  await sql`INSERT INTO analyses (article_id, input_revision, origin, relevance, category, title_zh, summary_zh, reason_zh, score, selected)
    VALUES (${articleId}, 1, 'rule', 'pass', 'projects', ${`项目${n}`}, '数据中心建设公告。', '建设进展', ${score}, true)`;
  if (factId) await sql`INSERT INTO fact_articles (fact_id, article_id, role) VALUES (${factId}, ${articleId}, 'report')`;
  return articleId;
}
const publish = (id: string) => publishArticle(id, { releasedAt: new Date('2099-01-01T00:00:00Z') });

test('80-point qualification and completed grouping are both required', async () => {
  const below = await article(79, '2099-01-01');
  assert.equal((await publish(below))?.selected, false);
  const boundary = await article(80, '2099-01-01');
  assert.equal((await publish(boundary))?.selected, true);
  const pending = await article(99, '2099-01-01');
  await sql`UPDATE articles SET grouping_status = 'pending' WHERE id = ${pending}`;
  assert.equal((await publishArticle(pending))?.selected, false);
});

test('duplicate reports use one slot and concurrent stronger arrivals evict the lowest fact', async () => {
  const day = '2099-01-02';
  const [fact] = await sql<{ id: number }[]>`INSERT INTO facts (public_id, title) VALUES (${`fact-${source}`}, '同一建设项目') RETURNING id`;
  const duplicateA = await article(95, day, fact!.id);
  const duplicateB = await article(96, day, fact!.id);
  await publish(duplicateA); await publish(duplicateB);
  const ids = await Promise.all(Array.from({ length: 15 }, (_, i) => article(80 + i, day)));
  await Promise.all(ids.map(publish));
  const [counts] = await sql<{ reports: number; slots: number }[]>`
    SELECT count(*)::int AS reports, count(DISTINCT coalesce('fact:' || fact_id::text, 'article:' || article_id))::int AS slots
    FROM publications WHERE source_id = ${source} AND selected AND (discovered_at AT TIME ZONE 'Asia/Shanghai')::date = ${day}::date`;
  assert.equal(counts!.slots, 15);
  assert.equal(counts!.reports, 16, 'two reports of one fact occupy only one slot');
  const [lowest] = await sql<{ selected: boolean }[]>`SELECT selected FROM publications WHERE article_id = ${ids[0]!}`;
  assert.equal(lowest!.selected, false);
  const [seats] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM publications WHERE fact_id = ${fact!.id} AND selected AND seat`;
  assert.equal(seats!.n, 1, 'public feeds retain one upstream representative per fact');
  const [stale] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM selected_state s JOIN publications p ON p.article_id = s.article_id
    WHERE p.source_id = ${source} AND s.in_set AND (NOT p.selected OR NOT p.seat)`;
  assert.equal(stale!.n, 0, 'evictions also leave the public sync ledger');
});
