import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching customers:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('Columns in customers table:', Object.keys(data[0]))
  } else {
    console.log('No customers found to check schema.')
    // Try to get column info from information_schema if possible (might not work with anon key)
    const { data: colData, error: colError } = await supabase
      .rpc('get_table_columns', { table_name: 'customers' })
    
    if (colError) {
      console.log('Could not use RPC to get columns, trying to insert dummy data might reveal missing columns.')
    } else {
      console.log('Column info:', colData)
    }
  }
}

checkSchema()
