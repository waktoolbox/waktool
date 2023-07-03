ALTER TABLE tournaments
    ADD COLUMN IF NOT EXISTS discord_guild_id varchar(50) NULL;