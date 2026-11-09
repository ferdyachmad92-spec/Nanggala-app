import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qgznduleuqzfvaiwchbn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnem5kdWxldXF6ZnZhaXdjaGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MjMzODUsImV4cCI6MjEwMTA5OTM4NX0.xdNTwoOx59ojvvIhUXmfZ360uw_kFPwWcbBSr5TfPz0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);