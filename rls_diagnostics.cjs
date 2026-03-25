const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log('--- Session Diagnosis ---');
  
  // 1. Get current session (if any, though in Node it's usually empty unless we sign in)
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('Current Auth User:', user ? user.id : 'NONE (Running as Anon)');

  // 2. Fetch the problematic customer (requires identifying the ID)
  // Since I don't know the ID, I'll fetch ALL customers visible to this key
  const { data: customers, error: fetchError } = await supabase
    .from('customers')
    .select('id, name, user_id');

  if (fetchError) {
    console.error('Error fetching customers:', fetchError);
  } else {
    console.log(`Visible Customers (${customers.length}):`);
    customers.forEach(c => {
      console.log(`- ID: ${c.id}, Name: ${c.name}, Owner (user_id): ${c.user_id}`);
    });
  }
}

diagnose();
