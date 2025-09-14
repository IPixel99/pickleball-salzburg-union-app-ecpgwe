
-- Create event_participants table for event registrations
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, profile_id)
);

-- Enable RLS
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own registrations" 
ON event_participants FOR SELECT 
USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own registrations" 
ON event_participants FOR INSERT 
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own registrations" 
ON event_participants FOR UPDATE 
USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own registrations" 
ON event_participants FOR DELETE 
USING (profile_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_participants_profile_id ON event_participants(profile_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_participants_updated_at 
BEFORE UPDATE ON event_participants 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
