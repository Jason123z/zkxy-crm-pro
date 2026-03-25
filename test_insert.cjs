const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const testCustomer = {
    name: 'Test Customer',
    level: 'A',
    industry: '高校',
    size: '100-500人',
    address: 'Test Address',
    status: '初步拜访',
    product: 'Test Product',
    description: 'Test Description',
    concerns: 'Test Concerns',
    solution: 'Test Solution',
    competitors: 'Test Competitors'
  };

  console.log('Attempting to insert test customer...');
  const { data, error } = await supabase
    .from('customers')
    .insert(testCustomer)
    .select()
    .single();

  if (error) {
    console.error('Insert failed:', error);
    if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('CONFIRMED: Missing columns in database.');
    }
  } else {
    console.log('Insert successful:', data);
  }
}

testInsert();
