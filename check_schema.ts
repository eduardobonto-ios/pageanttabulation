import { supabase } from './src/lib/supabase';

async function checkSchema() {
  const { data, error } = await supabase.from('candidates').select('*').limit(1);
  if (error) {
    console.error('Error fetching candidates:', error);
  } else {
    console.log('Candidate columns:', Object.keys(data[0] || {}));
  }
}

checkSchema();
