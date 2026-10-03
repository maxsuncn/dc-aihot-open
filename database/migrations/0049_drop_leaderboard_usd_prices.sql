-- DC fork: retain legacy tables and columns for backward-compatible upgrades.
-- The current application no longer uses this state. Keep the upstream migration
-- filename so future merges do not accidentally reintroduce destructive cleanup.
SELECT 1;
