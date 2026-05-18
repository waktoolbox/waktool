-- =============================================================================
-- wc-demo: Full reset — delete tournament-specific data and re-seed
-- Safe for production: only touches rows belonging to 'wc-demo'
-- =============================================================================

-- Clean up match reports linked to wc-demo matches
DELETE FROM match_reports WHERE tournament_id = 'wc-demo';

-- Clean up drafts linked to wc-demo matches
DELETE FROM drafts_data WHERE id IN (
    SELECT content->>'id' || '_' || r.round_num
    FROM matches, generate_series(1, 10) AS r(round_num)
    WHERE tournament_id = 'wc-demo'
);

-- Clean up matches
DELETE FROM matches WHERE tournament_id = 'wc-demo';

-- Clean up tournament phase data
DELETE FROM tournaments_data WHERE tournament_id = 'wc-demo';

-- Clean up applications
DELETE FROM applications WHERE tournament_id = 'wc-demo';

-- Clean up teams
DELETE FROM teams WHERE content->>'tournament' = 'wc-demo';

-- Clean up demo player accounts
DELETE FROM accounts WHERE id LIKE 'wc-demo-player-%';

-- =============================================================================
-- Re-create 64 demo player accounts
-- IDs use 'wc-demo-player-XX' format (cannot collide with Discord numeric IDs)
-- =============================================================================
INSERT INTO accounts (id, username, discriminator, email, ankama_name, ankama_discriminator)
SELECT
    'wc-demo-player-' || LPAD(s::TEXT, 2, '0'),
    'WCDemo' || LPAD(s::TEXT, 2, '0'),
    'D' || LPAD(s::TEXT, 3, '0'),
    'wc-demo-player-' || LPAD(s::TEXT, 2, '0') || '@demo.waktool.internal',
    'DemoPlayer' || LPAD(s::TEXT, 2, '0'),
    'D' || LPAD(s::TEXT, 3, '0')
FROM generate_series(1, 64) AS s
ON CONFLICT (id) DO UPDATE
    SET username = EXCLUDED.username,
        discriminator = EXCLUDED.discriminator,
        email = EXCLUDED.email,
        ankama_name = EXCLUDED.ankama_name,
        ankama_discriminator = EXCLUDED.ankama_discriminator;

-- =============================================================================
-- Re-create 64 teams
-- =============================================================================
INSERT INTO teams (id, content, created_at)
SELECT
    'wc-demo-team-' || LPAD(s::TEXT, 2, '0'),
    jsonb_build_object(
        'id', 'wc-demo-team-' || LPAD(s::TEXT, 2, '0'),
        'tournament', 'wc-demo',
        'name', 'Demo Team ' || LPAD(s::TEXT, 2, '0'),
        'server', CASE
            WHEN s % 3 = 1 THEN 'Pandora'
            WHEN s % 3 = 2 THEN 'Rubilax'
            ELSE 'Ogrest' END,
        'leader', 'wc-demo-player-' || LPAD(s::TEXT, 2, '0'),
        'players', jsonb_build_array('wc-demo-player-' || LPAD(s::TEXT, 2, '0')),
        'validatedPlayers', jsonb_build_array('wc-demo-player-' || LPAD(s::TEXT, 2, '0')),
        'breeds', CASE
            WHEN s <= 8  THEN '[1,3,5,7,9,11,13]'::jsonb
            WHEN s <= 16 THEN '[2,4,6,8,10,12,14]'::jsonb
            WHEN s <= 24 THEN '[1,2,3,4,5,6,7]'::jsonb
            WHEN s <= 32 THEN '[8,9,10,11,12,13,14]'::jsonb
            WHEN s <= 40 THEN '[1,4,7,10,13,16,19]'::jsonb
            WHEN s <= 48 THEN '[2,5,8,11,14,15,18]'::jsonb
            WHEN s <= 56 THEN '[3,6,9,12,15,18,19]'::jsonb
            ELSE              '[1,5,9,13,16,18,19]'::jsonb END,
        'bannedBreeds', CASE
            WHEN s <= 8  THEN '[2]'::jsonb
            WHEN s <= 16 THEN '[1]'::jsonb
            WHEN s <= 24 THEN '[8]'::jsonb
            WHEN s <= 32 THEN '[3]'::jsonb
            WHEN s <= 40 THEN '[5]'::jsonb
            WHEN s <= 48 THEN '[6]'::jsonb
            WHEN s <= 56 THEN '[4]'::jsonb
            ELSE              '[10]'::jsonb END,
        'catchPhrase', 'Go Demo Team ' || LPAD(s::TEXT, 2, '0') || '!',
        'displayOnTeamList', true
    ),
    NOW() - (INTERVAL '1 minute' * (64 - s))
FROM generate_series(1, 64) AS s
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

-- =============================================================================
-- Re-create / update the tournament definition
-- =============================================================================
INSERT INTO tournaments (id, content, featured, discord_guild_id)
VALUES (
    'wc-demo',
    '{
      "id": "wc-demo",
      "name": "WAKFU Champions – Ignemikhal''s Fury (Demo)",
      "logo": "https://www.waktool.com/images/wc/2026.jpg",
      "discordLink": "https://discord.gg/RamVFndNTG",
      "server": "Beta",
      "level": "230",
      "startDate": "2026-05-20T14:00:00Z",
      "endDate": "2026-06-21T20:00:00Z",
      "mustRegisterTeamComposition": true,
      "requiredBreeds": 7,
      "requiredBannedBreeds": 1,
      "hideClassStats": true,
      "maxTeamPlayers": 5,
      "teamSize": "5",
      "teamNumber": "64",
      "draftAvailableMinutesBeforeMatch": 60,
      "description": "Tournament demo for WAKFU Champions – Ignemikhal''s Fury. Use the Demo admin tab to control state.",
      "rules": "Demo rules",
      "rewards": "Demo rewards",
      "maps": [968, 969, 970, 971, 972, 973, 974, 975, 976, 1479, 1482, 1485],
      "admins": ["166226448598695936", "144187368952299529", "234710417123835905", "1034079924492972032", "295506634208313345", "1000840852052131891"],
      "referees": [],
      "streamers": [],
      "demo": {
        "tournament-start": "TOURNAMENT_START",
        "reset": "RESET",
        "teamAWin": "TEAM_A_WIN",
        "teamBWin": "TEAM_B_WIN",
        "randomTeamWin": "RANDOM_TEAM_WIN"
      },
      "phases": [
        {
          "phase": 1,
          "phaseType": 4,
          "autoRefereeing": true,
          "mustUseDifferentMapsPerRound": true,
          "matchStartDeadlineAfterMatchMinutes": 15,
          "roundModel": [
            {"round": 1, "bo": 1, "date": "2026-05-30T16:00:00Z"},
            {"round": 2, "bo": 1, "date": "2026-05-30T19:00:00Z"},
            {"round": 3, "bo": 1, "date": "2026-05-31T16:00:00Z"}
          ]
        },
        {
          "phase": 2,
          "phaseType": 5,
          "autoRefereeing": true,
          "mustUseDifferentMapsPerRound": true,
          "poolSize": 32,
          "draftAvailableBeforeMatchMinutes": 60,
          "draftJoinDeadlineAfterOpenMinutes": 15,
          "matchStartDeadlineAfterMatchMinutes": 15,
          "draftTurnDurationSeconds": 45,
          "draftModel": "WAKFU_CHAMPIONS",
          "roundModel": [
            {"round": 1, "bo": 1, "date": "2026-06-06T17:00:00Z"},
            {"round": 2, "bo": 1, "date": "2026-06-07T17:00:00Z"},
            {"round": 3, "bo": 3, "date": "2026-06-13T17:00:00Z"},
            {"round": 4, "bo": 3, "date": "2026-06-14T17:00:00Z"},
            {"round": 5, "bo": 5, "date": "2026-06-21T15:00:00Z"},
            {"round": 6, "bo": 3, "date": "2026-06-20T17:00:00Z"}
          ]
        }
      ]
    }',
    false,
    1487802843648888932
)
ON CONFLICT (id) DO UPDATE
    SET content = EXCLUDED.content,
        featured = EXCLUDED.featured,
        discord_guild_id = EXCLUDED.discord_guild_id;

