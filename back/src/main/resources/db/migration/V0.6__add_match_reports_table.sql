CREATE TABLE IF NOT EXISTS match_reports
(
    match_id                    VARCHAR(50) NOT NULL,
    round                       INT         NOT NULL,
    tournament_id               VARCHAR(50) NOT NULL,
    team_a_reported_winner      VARCHAR(50),
    team_a_reporter_id          VARCHAR(50),
    team_a_screenshot           TEXT,
    team_a_dispute_explanation  TEXT,
    team_b_reported_winner      VARCHAR(50),
    team_b_reporter_id          VARCHAR(50),
    team_b_screenshot           TEXT,
    team_b_dispute_explanation  TEXT,
    disputed                    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at                  TIMESTAMP   NOT NULL DEFAULT NOW(),
    PRIMARY KEY (match_id, round)
);

