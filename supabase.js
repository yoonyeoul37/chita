import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hpayjkljfexgovjwfifr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYXlqa2xqZmV4Z292andmaWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDUxNzgsImV4cCI6MjA5NjcyMTE3OH0.L7pB0Hne-XHvWVj4R_XWWLfSqzkWC2-x3zXJG1lrLiY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);