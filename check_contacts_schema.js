import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uzlcidyvuifxbgzzkcwj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bGNpZHl2dWlmeGJnenprY3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjc0NDQsImV4cCI6MjA4ODg0MzQ0NH0.v44eWAWu1s53w7HEy_0DPPCtB1bHW3iiSYRemHWxiRU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  try {
    const { data: contacts, error } = await supabase.from('contacts').select('*').limit(1);
    
    if (error) {
      console.error('Error fetching contacts:', error.message);
    } else if (contacts && contacts.length > 0) {
      console.log('Columns in contacts table:', Object.keys(contacts[0]));
      if (Object.keys(contacts[0]).includes('decision_role')) {
          console.log('decision_role column EXISTS in the database.');
      } else {
          console.log('decision_role column MISSING in the database.');
      }
    } else {
      console.log('No data in contacts table to check columns.');
    }

    // Explicitly try to select decision_role
    const { data: drData, error: drError } = await supabase.from('contacts').select('decision_role').limit(1);
    if (drError) {
      console.error('Error selecting decision_role explicitly:', drError.message);
      if (drError.message.includes('column "decision_role" does not exist') || drError.message.includes('Could not find')) {
          console.log('CONFIRMED: The database does NOT have the decision_role column OR it is hidden from the API.');
      }
    } else {
      console.log('Successfully selected decision_role column explicitly.');
    }

  } catch (err) {
    console.error('General error:', err);
  }
}

checkColumns();
