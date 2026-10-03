-- Add a dedicated category for retrievable industry reports, research reports and white papers.
-- Use the existing publication metadata to reclassify previously published report documents.
CREATE FUNCTION pg_temp.aiinfra_is_whitepaper(title text, summary text, item_type text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(item_type = 'research_report', false)
    OR COALESCE(title, '') ~* '(白皮书|研究报告|行业报告|研报|行业调研报告|行业发展报告|市场研究报告|数据中心.{0,12}(报告|研究)|white[ -]?paper|research report|industry report)'
$$;

CREATE FUNCTION pg_temp.aiinfra_whitepaper_tags(old_tags text[])
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ARRAY['白皮书'] || COALESCE(
    ARRAY(
      SELECT t
      FROM unnest(COALESCE(old_tags, ARRAY[]::text[])) WITH ORDINALITY AS tag(t, n)
      WHERE t NOT IN ('技术', '项目', '玩家', '市场', '政策', '白皮书')
      ORDER BY n
    ),
    ARRAY[]::text[]
  )
$$;

UPDATE publications p
SET category = 'whitepaper',
    tags = pg_temp.aiinfra_whitepaper_tags(p.tags),
    revision = p.revision + 1,
    updated_at = now()
WHERE (pg_temp.aiinfra_is_whitepaper(p.title, p.summary, NULL)
       OR EXISTS (SELECT 1 FROM analyses an WHERE an.article_id = p.article_id AND an.output->>'itemType' = 'research_report'))
  AND p.eligible
  AND p.visibility = 'public'
  AND (p.category IS DISTINCT FROM 'whitepaper'
       OR p.tags IS DISTINCT FROM pg_temp.aiinfra_whitepaper_tags(p.tags));

UPDATE analyses an
SET category = 'whitepaper',
    tags = pg_temp.aiinfra_whitepaper_tags(an.tags)
FROM articles a
WHERE a.id = an.article_id
  AND EXISTS (SELECT 1 FROM publications p WHERE p.article_id = an.article_id AND p.eligible AND p.visibility = 'public')
  AND (pg_temp.aiinfra_is_whitepaper(COALESCE(an.title_zh, a.title), NULL, an.output->>'itemType')
       OR an.output->>'itemType' = 'research_report')
  AND (an.category IS DISTINCT FROM 'whitepaper'
       OR an.tags IS DISTINCT FROM pg_temp.aiinfra_whitepaper_tags(an.tags));

UPDATE editorial_overrides eo
SET fields = jsonb_set(
      CASE WHEN jsonb_typeof(eo.fields->'tags') = 'array'
        THEN jsonb_set(eo.fields, '{tags}', to_jsonb(pg_temp.aiinfra_whitepaper_tags(ARRAY(SELECT jsonb_array_elements_text(eo.fields->'tags')))), true)
        ELSE eo.fields
      END,
      '{category}', to_jsonb('whitepaper'::text), true
    ),
    updated_at = now()
FROM publications p
WHERE eo.article_id = p.article_id
  AND p.eligible
  AND p.visibility = 'public'
  AND (pg_temp.aiinfra_is_whitepaper(p.title, p.summary, NULL)
       OR EXISTS (SELECT 1 FROM analyses an WHERE an.article_id = p.article_id AND an.output->>'itemType' = 'research_report'))
  AND jsonb_typeof(eo.fields->'category') = 'string'
  AND (eo.fields->>'category' IS DISTINCT FROM 'whitepaper'
       OR (jsonb_typeof(eo.fields->'tags') = 'array'
           AND ARRAY(SELECT jsonb_array_elements_text(eo.fields->'tags')) IS DISTINCT FROM pg_temp.aiinfra_whitepaper_tags(ARRAY(SELECT jsonb_array_elements_text(eo.fields->'tags')))));
