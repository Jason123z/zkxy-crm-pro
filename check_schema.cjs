const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL or SUPABASE_KEY missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking schema for table: customers');
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching customers:', error);
    process.exit(1);
  }

  if (data && data.length > 0) {
    console.log('Columns in customers table:', Object.keys(data[0]));
  } else {
    console.log('No customers found to check schema. Table might be empty.');
  }
}

checkSchema();
