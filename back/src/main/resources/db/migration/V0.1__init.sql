CREATE TABLE IF NOT EXISTS accounts
(
    id            VARCHAR(50) PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL,
    discriminator VARCHAR(4)   NOT NULL,
    email         VARCHAR(255) NOT NULL
);

ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS ankama_name varchar(50);
ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS ankama_discriminator varchar(5);
ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS twitch_url varchar(50);

CREATE TABLE IF NOT EXISTS tournaments
(
    id      VARCHAR(50) PRIMARY KEY,
    content JSONB
);

ALTER TABLE tournaments
    ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS teams
(
    id         VARCHAR(50) PRIMARY KEY,
    content    JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now
        (
        )
);

CREATE TABLE IF NOT EXISTS tournaments_data
(
    tournament_id VARCHAR(50) NOT NULL,
    phase         INT         NOT NULL,
    content       JSONB,
    PRIMARY KEY
        (
         tournament_id,
         phase
            )
);

CREATE TABLE IF NOT EXISTS matches
(
    id            VARCHAR(50) PRIMARY KEY,
    tournament_id VARCHAR(50),
    phase         int,
    content       JSONB
);

CREATE TABLE IF NOT EXISTS drafts_data
(
    id      VARCHAR(50) NOT NULL PRIMARY KEY,
    content JSONB
);