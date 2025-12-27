const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Brak zmiennych środowiskowych NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  try {
    console.log('📖 Wczytuję plik migracji...')
    const migrationPath = path.join(__dirname, '../supabase/migrations/add_pages_table.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('🚀 Wykonuję migrację...')
    
    // Split SQL into statements and execute them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`   Wykonuję statement ${i + 1}/${statements.length}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql_string: statement })
      
      if (error) {
        // Try alternative method - direct query
        const { error: error2 } = await supabase.from('_migrations').insert({ name: 'add_pages_table' })
        
        console.error(`❌ Błąd w statement ${i + 1}:`, error.message)
        console.log('\n📋 Skopiuj poniższy SQL i wykonaj go ręcznie w Supabase Dashboard (SQL Editor):')
        console.log('\n' + '='.repeat(80))
        console.log(sql)
        console.log('='.repeat(80) + '\n')
        process.exit(1)
      }
    }
    
    console.log('✅ Migracja zakończona pomyślnie!')
    console.log('\n📝 Utworzona tabela: public.pages')
    console.log('📝 Zaktualizowana tabela: public.schemas (dodano page_id)')
    console.log('📝 Zmigrowane istniejące dane do nowej struktury')
    
  } catch (error) {
    console.error('❌ Błąd podczas migracji:', error.message)
    console.log('\n📋 INSTRUKCJA RĘCZNA:')
    console.log('1. Otwórz Supabase Dashboard')
    console.log('2. Przejdź do SQL Editor')
    console.log('3. Skopiuj zawartość pliku: supabase/migrations/add_pages_table.sql')
    console.log('4. Wklej i wykonaj w SQL Editor')
    process.exit(1)
  }
}

runMigration()
