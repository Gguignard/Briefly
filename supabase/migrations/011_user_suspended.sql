-- Story 9.4: Add suspended flag for manual user management
ALTER TABLE users ADD COLUMN suspended BOOLEAN NOT NULL DEFAULT false;
