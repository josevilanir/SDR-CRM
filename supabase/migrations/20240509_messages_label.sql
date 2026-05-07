-- Add label column to messages table to store variation type (Direta, Consultiva, Provocativa)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS label text;
