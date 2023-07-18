ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS locale varchar(10) NULL;