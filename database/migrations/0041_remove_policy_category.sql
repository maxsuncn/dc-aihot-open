-- The public taxonomy no longer has a standalone policy category. Preserve each item's
-- descriptive topic tags and move policy records to the category matching their impact.
CREATE FUNCTION pg_temp.aiinfra_policy_category(title text, summary text, tags text[])
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN concat_ws(' ', title, summary, array_to_string(tags, ' ')) ~* '(项目|园区|选址|审批|核准|开工|建设|扩建|投产|交付|机房|基地|project|site|campus|construction|commission|approval)'
      THEN 'projects'
    WHEN concat_ws(' ', title, summary, array_to_string(tags, ' ')) ~* '(供电|电力|并网|能耗|能效|冷却|制冷|液冷|储能|绿电|运维|消防|可靠性|安全|标准|规范|PUE|WUE|UPS|HVDC|800V|power|cooling|energy|reliability|standard)'
      THEN 'technology'
    ELSE 'market'
  END
$$;

CREATE FUNCTION pg_temp.aiinfra_policy_category_tag(category text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE category WHEN 'projects' THEN '项目' WHEN 'technology' THEN '技术' ELSE '市场' END
$$;

CREATE FUNCTION pg_temp.aiinfra_remap_policy_tags(tags text[], category text)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ARRAY[pg_temp.aiinfra_policy_category_tag(category)] || COALESCE(
    ARRAY(
      SELECT t
      FROM unnest(COALESCE(tags, ARRAY[]::text[])) WITH ORDINALITY AS tag(t, n)
      WHERE t NOT IN ('技术', '项目', '玩家', '市场', '政策', '白皮书')
      ORDER BY n
    ), ARRAY[]::text[]
  )
$$;

WITH mapped AS (
  SELECT article_id,
         pg_temp.aiinfra_policy_category(title, summary, tags) AS category
  FROM publications
  WHERE category = 'policy'
)
UPDATE publications p
SET category = m.category,
    tags = pg_temp.aiinfra_remap_policy_tags(p.tags, m.category),
    revision = p.revision + 1,
    updated_at = now()
FROM mapped m
WHERE p.article_id = m.article_id;

UPDATE analyses an
SET category = pg_temp.aiinfra_policy_category(COALESCE(an.title_zh, a.title), COALESCE(an.summary_zh, a.excerpt), an.tags),
    tags = pg_temp.aiinfra_remap_policy_tags(
      an.tags,
      pg_temp.aiinfra_policy_category(COALESCE(an.title_zh, a.title), COALESCE(an.summary_zh, a.excerpt), an.tags)
    )
FROM articles a
WHERE a.id = an.article_id
  AND an.category = 'policy';

WITH mapped AS (
  SELECT eo.article_id,
         pg_temp.aiinfra_policy_category(a.title, COALESCE(a.excerpt, ''),
           CASE WHEN jsonb_typeof(eo.fields->'tags') = 'array'
             THEN ARRAY(SELECT jsonb_array_elements_text(eo.fields->'tags'))
             ELSE ARRAY[]::text[] END) AS category,
         CASE WHEN jsonb_typeof(eo.fields->'tags') = 'array'
           THEN ARRAY(SELECT jsonb_array_elements_text(eo.fields->'tags'))
           ELSE ARRAY[]::text[] END AS tags
  FROM editorial_overrides eo
  JOIN articles a ON a.id = eo.article_id
  WHERE eo.fields->>'category' = 'policy'
)
UPDATE editorial_overrides eo
SET fields = jsonb_set(
      jsonb_set(eo.fields, '{category}', to_jsonb(m.category), true),
      '{tags}', to_jsonb(pg_temp.aiinfra_remap_policy_tags(m.tags, m.category)), true),
    updated_at = now()
FROM mapped m
WHERE eo.article_id = m.article_id;
