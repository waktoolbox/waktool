CREATE TABLE IF NOT EXISTS applications
(
    id            VARCHAR(50) PRIMARY KEY,
    tournament_id VARCHAR(50) NOT NULL,
    user_id       VARCHAR(50) NOT NULL,
    team_id       VARCHAR(50) NOT NULL
);