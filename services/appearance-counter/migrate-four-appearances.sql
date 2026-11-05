-- Only for an existing deployment created with the original two-choice schema.
ALTER TABLE appearance_choices RENAME TO appearance_choices_old;
CREATE TABLE appearance_choices (
  voter TEXT PRIMARY KEY NOT NULL,
  choice TEXT NOT NULL CHECK (choice IN ('enchanted','chrisglass','material','materialglass')),
  updated_at INTEGER NOT NULL
);
INSERT INTO appearance_choices SELECT voter,choice,updated_at FROM appearance_choices_old;
DROP TABLE appearance_choices_old;
CREATE INDEX choices_by_appearance ON appearance_choices(choice);
