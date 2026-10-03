// Current industry integration coverage replaces the optional AI example-topic regressions.
import './setup.ts';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { sql, closeDb } from '@aihot/backend/db';
import { upsertMaterial } from '@aihot/backend/content/materials';
import { publishArticle } from '@aihot/backend/publication/publish';
import { stopBoss } from '@aihot/backend/jobs/queue';
import { findTopic, TOPICS, loadTopicPage } from '@aihot/backend/publication/topics';
import { selectTopicChronicle, type ChronicleReport } from '@aihot/backend/publication/topic-chronicle';
import { parseChronicle } from '@aihot/backend/publication/chronicles';
import { tag } from './setup.ts';

const source = `dc-topics-${tag()}`;
const now = new Date('2099-03-03T00:00:00Z');
let n = 0;
before(async () => { await sql`INSERT INTO sources (id,name,kind,tier,participation_mode) VALUES (${source},'DC topics','rss','T1','editorial')`; });
after(async () => { await stopBoss(); await closeDb(); });
const report = (title: string, extra: Partial<ChronicleReport> = {}): ChronicleReport => ({
  id: `unit-${++n}`, title, originalTitle: null, category: 'projects', tags: ['项目','entity:vertiv'], score: 90,
  topicSlugs: TOPICS.map(t => t.slug), timelineAt: new Date('2099-02-02T00:00:00Z'), publishedAt: new Date('2099-02-02T00:00:00Z'),
  factPublishedAt: null, firstParty: true, owner: 'vertiv', factId: null, factSubject: 'Vertiv', factAction: '投产', factOccurredAt: null,
  storyPublicId: null, sourceCount: 1, scope: 'single', ...extra,
});
const events = (slug: string, reports: ChronicleReport[]) => selectTopicChronicle(findTopic(slug)!, reports, { now }).flatMap(m => m.events);

test('DC company chronicle keeps its own projects and excludes another company', () => {
  const own = report('Vertiv 数据中心项目投产');
  const other = report('NVIDIA 项目投产', { factSubject: 'NVIDIA', tags: ['项目','entity:nvidia'] });
  assert.deepEqual(events('vertiv', [own,other]).map(e => e.title), [own.title]);
});
test('score thresholds and commentary remain outside the DC milestone band', () => {
  assert.equal(events('vertiv', [report('Vertiv 项目投产', { score: 79 }), report('Vertiv 项目观点', { factAction: 'opinion' })]).length, 0);
});
test('one fact keeps its earliest date and strongest representative across months', () => {
  const first = report('Vertiv 项目开工', { factId: 88, score: 82, publishedAt: new Date('2099-01-31T10:00:00Z') });
  const next = report('Vertiv 项目投产', { factId: 88, score: 99, publishedAt: new Date('2099-02-02T10:00:00Z') });
  const picked = events('vertiv', [first,next]);
  assert.equal(picked.length, 1); assert.equal(picked[0]!.title, next.title); assert.ok(picked[0]!.at.startsWith('2099-01-31'));
});
test('field milestones require a named field; report genres use the DC kind', () => {
  assert.equal(events('power-and-cooling', [report('Vertiv 液冷系统更新', { category: 'technology' })]).length, 1);
  assert.equal(events('power-and-cooling', [report('Vertiv 新项目投产')]).length, 0);
  assert.equal(events('research-reports', [report('数据中心市场白皮书发布', { category: 'whitepaper' })]).length, 1);
});
test('curated DC history validates its topic and infrastructure milestone kinds', () => {
  assert.doesNotThrow(() => parseChronicle({ topic: 'vertiv', through: '2099-01', events: [{ date: '2099-01-01', kind: 'project', title: '项目投产' }] }, 'vertiv'));
  assert.throws(() => parseChronicle({ topic: 'vertiv', through: '2099-01', events: [{ date: '2099-01-01', kind: 'model', title: '错误类型' }] }, 'vertiv'));
});
async function article(title: string, subjects: string[], tags: string[]) {
  const { articleId } = await upsertMaterial({ sourceId: source, url: `https://example.com/${source}/${++n}`, title, bodyText: '设施建设的正式公告。', bodyStatus: 'ok', via: 'fetch', publishedAt: new Date('2099-02-02T00:00:00Z') });
  await sql`UPDATE articles SET discovered_at='2099-02-02', timeline_at='2099-02-02' WHERE id=${articleId}`;
  await sql`INSERT INTO analyses (article_id,input_revision,origin,relevance,category,title_zh,summary_zh,score,selected,subjects,tags)
    VALUES (${articleId},1,'rule','pass','projects',${title},'设施建设的正式公告。',90,true,${subjects},${tags})`;
  await publishArticle(articleId, { releasedAt: new Date('2099-02-02T00:00:00Z') }); return articleId;
}
test('company subjects and field tags reach real DC pages; cached withdrawal stays hidden', async () => {
  const own = await article('Vertiv 数据中心液冷项目投产', ['vertiv'], ['项目','液冷/CDU']);
  const mention = await article('NVIDIA 项目合作涉及其他供应商', ['nvidia'], ['项目','液冷/CDU']);
  const company = await loadTopicPage('vertiv',1,now);
  assert.ok(company!.items.some(i => i.id === own)); assert.ok(!company!.items.some(i => i.id === mention));
  const field = await loadTopicPage('power-and-cooling',1,now); assert.ok(field!.items.some(i => i.id === own));
  await sql`UPDATE publications SET visibility='withdrawn' WHERE article_id=${own}`;
  assert.ok(!(await loadTopicPage('vertiv',1,now))!.items.some(i => i.id === own));
});
test('every current DC topic opens, while unknown topics and invalid pages stay absent', async () => {
  for (const t of TOPICS) assert.ok(await loadTopicPage(t.slug,1,now), t.slug);
  assert.equal(await loadTopicPage('missing',1,now),null); assert.equal(await loadTopicPage('vertiv',0,now),null);
});
