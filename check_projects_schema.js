import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uzlcidyvuifxbgzzkcwj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bGNpZHl2dWlmeGJnenprY3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjc0NDQsImV4cCI6MjA4ODg0MzQ0NH0.v44eWAWu1s53w7HEy_0DPPCtB1bHW3iiSYRemHWxiRU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  try {
    const { data: projects, error } = await supabase.from('projects').select('*').limit(1);
    
    if (error) {
      console.error('Error fetching projects:', error.message);
    } else if (projects && projects.length > 0) {
      console.log('Columns in projects table:', Object.keys(projects[0]));
    } else {
      console.log('No data in projects table to check columns.');
    }

    // Explicitly try to select concerns and solution
    const { error: colError } = await supabase.from('projects').select('concerns, solution').limit(1);
    if (colError) {
      console.error('Error selecting new columns explicitly:', colError.message);
    } else {
      console.log('Successfully selected concerns and solution columns explicitly.');
    }

  } catch (err) {
    console.error('General error:', err);
  }
}

checkColumns();
