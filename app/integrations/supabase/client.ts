import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://asugynuigbnrsynczdhe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdWd5bnVpZ2JucnN5bmN6ZGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDQ4NzMsImV4cCI6MjA2MjcyMDg3M30.eQ1HGBxrbdaDOS2ry-YVgyh2kJ54gOZKHSjXz4xXxf8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
