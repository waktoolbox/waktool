-- wc-demo: Set tournament start date to now
UPDATE tournaments
SET content = jsonb_set(content, '{startDate}', to_jsonb(to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')))
WHERE id = 'wc-demo';

