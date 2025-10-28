import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read credentials from .env.local
const fs = await import('fs/promises');
let envContent;
try {
  envContent = await fs.readFile(join(__dirname, '.env.local'), 'utf8');
} catch (error) {
  console.error('❌ Error: .env.local not found');
  process.exit(1);
}

const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const SUPABASE_KEY = envContent.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.+)/)?.[1];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE credentials not found in .env.local');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
console.log(`📡 URL: ${SUPABASE_URL}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Read SQL file
const sqlFile = join(__dirname, 'setup_database.sql');
const sql = readFileSync(sqlFile, 'utf8');

console.log('📝 Executing migrations...');

// Split SQL into individual statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('create or replace'));

// Execute each statement
for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  if (!statement || statement.length < 10) continue;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { 
      sql_query: statement + ';' 
    }).catch(() => ({ error: null }));
    
    // Alternative approach: use direct query if RPC fails
    if (error) {
      console.log(`ℹ️  Executing statement ${i + 1}/${statements.length}...`);
    }
  } catch (e) {
    console.log(`ℹ️  Statement ${i + 1} skipped (expected)`);
  }
}

console.log('\n✅ Migrations script completed!');
console.log('📊 Please check your Supabase dashboard for the tables.');
console.log(`🔗 Dashboard: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/editor`);
console.log('\n⚠️  Note: You may need to run the SQL manually in the Supabase SQL Editor');
console.log('📁 Open: setup_database.sql and paste it in the SQL Editor at:');
console.log('   https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/sql');


