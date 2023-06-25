ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS global_name varchar(50) NULL;