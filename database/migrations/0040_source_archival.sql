-- Removing a subscription should stop future collection without deleting its articles.
ALTER TABLE sources ADD COLUMN deleted_at timestamptz;

DROP INDEX sources_due_idx;
CREATE INDEX sources_due_idx ON sources (next_fetch_at) WHERE enabled AND deleted_at IS NULL;
