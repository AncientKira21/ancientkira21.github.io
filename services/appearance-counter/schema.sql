CREATE TABLE IF NOT EXISTS appearance_choices (
  voter TEXT PRIMARY KEY NOT NULL,
  choice TEXT NOT NULL CHECK (choice IN ('enchanted', 'chrisglass', 'material', 'materialglass')),
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS choices_by_appearance ON appearance_choices(choice);
