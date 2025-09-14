
# Database Setup for Event Registrations

## Required Tables

The app requires the following tables to be created in your Supabase database:

### 1. event_participants table

This table stores user registrations for events. Run the SQL from `sql/create_event_participants.sql` in your Supabase SQL editor.

The table structure:
- `id`: UUID primary key
- `event_id`: References events table
- `profile_id`: References auth.users (the user who registered)
- `status`: PENDING, ACCEPTED, or DECLINED
- `created_at`: Timestamp when registration was created
- `updated_at`: Timestamp when registration was last updated

### 2. Row Level Security (RLS)

The table includes RLS policies that ensure:
- Users can only see their own registrations
- Users can only create registrations for themselves
- Users can update/delete their own registrations

### 3. Testing

Use the Event Registrations Test component in Settings to verify:
1. The table exists and is accessible
2. RLS policies are working correctly
3. Data can be inserted and retrieved

## Features Implemented

1. **Home Screen Quick Access**: Shows max 3 upcoming event registrations
2. **Dedicated Registrations Page**: Full list of all user registrations with refresh
3. **Navigation Update**: "Meine Anmeldungen" replaces "Turniere" in quick access
4. **Automatic Refresh**: Both home and registrations pages auto-refresh every 30 seconds
5. **Pull-to-Refresh**: Manual refresh capability on both screens

## Usage

1. Run the SQL from `sql/create_event_participants.sql`
2. Test the functionality using the test component in Settings
3. Register for events through the Events page
4. View registrations on the home screen (quick access) or dedicated page
