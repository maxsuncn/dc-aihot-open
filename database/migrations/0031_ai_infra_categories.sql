-- Consolidate DC SIGNAL's seven stored categories into the five categories in the AI Infra pack.
-- Keep industry/research split readable from the material itself, so player actions are separated
-- from sector-level market research while the old category slugs remain accepted as API filters.
CREATE FUNCTION pg_temp.aiinfra_category(old_category text, title text, summary text, tags text[])
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE old_category
    WHEN 'power-cooling' THEN 'technology'
    WHEN 'operations' THEN 'technology'
    WHEN 'practice' THEN 'technology'
    WHEN 'industry' THEN CASE
      WHEN concat_ws(' ', title, summary, array_to_string(tags, ' ')) ~* '(市场规模|市场需求|市场预测|市场报告|行业报告|行业调查|供需|产业趋势|数据中心行业|IDC市场|容量预测|同比增长|复合增长率|market size|market demand|market forecast|market report|supply and demand|industry outlook|cagr)'
        THEN 'market'
      ELSE 'players'
    END
    WHEN 'research' THEN CASE
      WHEN concat_ws(' ', title, summary, array_to_string(tags, ' ')) ~* '(液冷|制冷|冷却|热管理|供电|供配电|变配电|电力|储能|UPS|BESS|HVDC|800V|机架功率|能效|PUE|WUE|运维|可靠性|冷却液|cooling|power|energy storage|rack power|reliability|efficiency)'
        THEN 'technology'
      ELSE 'market'
    END
    WHEN 'technology' THEN 'technology'
    WHEN 'projects' THEN 'projects'
    WHEN 'players' THEN 'players'
    WHEN 'market' THEN 'market'
    WHEN 'policy' THEN 'policy'
    ELSE 'market'
  END
$$;

CREATE FUNCTION pg_temp.aiinfra_category_tags(old_tags text[], category text)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ARRAY[CASE category
    WHEN 'technology' THEN '技术'
    WHEN 'projects' THEN '项目'
    WHEN 'players' THEN '玩家'
    WHEN 'market' THEN '市场'
    WHEN 'policy' THEN '政策'
    ELSE category
  END] || COALESCE(
    ARRAY(
      SELECT t
      FROM unnest(COALESCE(old_tags, ARRAY[]::text[])) WITH ORDINALITY AS tag(t, n)
      WHERE n > 1 AND t NOT IN ('技术', '项目', '玩家', '市场', '政策')
      ORDER BY n
    ),
    ARRAY[]::text[]
  )
$$;

WITH mapped AS (
  SELECT p.article_id,
         pg_temp.aiinfra_category(p.category, p.title, p.summary, p.tags) AS category
  FROM publications p
  WHERE p.category IS NOT NULL
)
UPDATE publications p
SET category = m.category,
    tags = pg_temp.aiinfra_category_tags(p.tags, m.category),
    revision = p.revision + 1
FROM mapped m
WHERE p.article_id = m.article_id
  AND (p.category IS DISTINCT FROM m.category
       OR p.tags IS DISTINCT FROM pg_temp.aiinfra_category_tags(p.tags, m.category));

UPDATE analyses an
SET category = pg_temp.aiinfra_category(
      an.category,
      COALESCE(an.title_zh, a.title),
      COALESCE(an.summary_zh, a.excerpt),
      an.tags
    ),
    tags = pg_temp.aiinfra_category_tags(
      an.tags,
      pg_temp.aiinfra_category(an.category, COALESCE(an.title_zh, a.title), COALESCE(an.summary_zh, a.excerpt), an.tags)
    )
FROM articles a
WHERE a.id = an.article_id
  AND an.category IS NOT NULL;

WITH mapped AS (
  SELECT eo.article_id,
         pg_temp.aiinfra_category(
           eo.fields->>'category', a.title, COALESCE(a.excerpt, ''),
           CASE WHEN jsonb_typeof(eo.fields->'tags') = 'array'
             THEN ARRAY(SELECT jsonb_array_elements_text(eo.fields->'tags'))
             ELSE ARRAY[]::text[] END
         ) AS category,
         pg_temp.aiinfra_category_tags(
           CASE WHEN jsonb_typeof(eo.fields->'tags') = 'array'
             THEN ARRAY(SELECT jsonb_array_elements_text(eo.fields->'tags'))
             ELSE ARRAY[]::text[] END,
           pg_temp.aiinfra_category(
             eo.fields->>'category', a.title, COALESCE(a.excerpt, ''),
             CASE WHEN jsonb_typeof(eo.fields->'tags') = 'array'
               THEN ARRAY(SELECT jsonb_array_elements_text(eo.fields->'tags'))
               ELSE ARRAY[]::text[] END
           )
         ) AS tags
  FROM editorial_overrides eo
  JOIN articles a ON a.id = eo.article_id
  WHERE jsonb_typeof(eo.fields->'category') = 'string'
)
UPDATE editorial_overrides eo
SET fields = jsonb_set(jsonb_set(eo.fields, '{category}', to_jsonb(m.category), true), '{tags}', to_jsonb(m.tags), true),
    updated_at = now()
FROM mapped m
WHERE eo.article_id = m.article_id;
