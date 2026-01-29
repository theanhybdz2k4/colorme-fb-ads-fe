
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lncgmaxtqjfbcypncfoe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuY2dtYXh0cWpmYmN5cG5jZm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNDc0MTMsImV4cCI6MjA4MjkyMzQxM30.7eEK0WF_K9msIcdIVgUpwNfLdjzRqvgSMf0ow17KkMk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
