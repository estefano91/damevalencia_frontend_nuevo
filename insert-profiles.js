import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read credentials from .env.local
const envContent = readFileSync(join(__dirname, '.env.local'), 'utf8');
const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const SUPABASE_KEY = envContent.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.+)/)?.[1];

console.log('🔗 Connecting to Supabase...');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Profile data
const profiles = [
  // 5 Players
  { id: '11111111-1111-1111-1111-111111111111', user_type: 'player', full_name: 'Cristian Messi', bio: 'Mediocampista creativo. Busco oportunidades.', location: 'Buenos Aires, Argentina', sport: 'Fútbol', aura_score: 850, verified: true },
  { id: '11111111-1111-1111-1111-111111111112', user_type: 'player', full_name: 'Sofia Hernández', bio: 'Tenis profesional. Ganadora de torneos.', location: 'Madrid, España', sport: 'Tenis', aura_score: 920, verified: true },
  { id: '11111111-1111-1111-1111-111111111113', user_type: 'player', full_name: 'Diego Torres', bio: 'Basquetbolista. Especializado en tiros libres.', location: 'Barcelona, España', sport: 'Basquetbol', aura_score: 780, verified: false },
  { id: '11111111-1111-1111-1111-111111111114', user_type: 'player', full_name: 'Isabella Garcia', bio: 'Nadadora olímpica. Medallista en 200m.', location: 'Valencia, España', sport: 'Natación', aura_score: 950, verified: true },
  { id: '11111111-1111-1111-1111-111111111115', user_type: 'player', full_name: 'Lucas Martinez', bio: 'Ciclista profesional del equipo nacional.', location: 'Sevilla, España', sport: 'Ciclismo', aura_score: 620, verified: false },
  
  // 4 Coaches
  { id: '22222222-2222-2222-2222-222222222221', user_type: 'coach', full_name: 'Carlos Ruiz', bio: 'Entrenador con 15 años de experiencia.', location: 'Madrid, España', sport: 'Fútbol', aura_score: 980, verified: true },
  { id: '22222222-2222-2222-2222-222222222222', user_type: 'coach', full_name: 'Patricia Sánchez', bio: 'Entrenadora personal. Nutrición deportiva.', location: 'Barcelona, España', sport: 'Fitness', aura_score: 920, verified: true },
  { id: '22222222-2222-2222-2222-222222222223', user_type: 'coach', full_name: 'Miguel Ortega', bio: 'Entrenador de tenis ATP.', location: 'Mallorca, España', sport: 'Tenis', aura_score: 890, verified: true },
  { id: '22222222-2222-2222-2222-222222222224', user_type: 'coach', full_name: 'Elena Fernández', bio: 'Entrenadora de natación olímpica.', location: 'Valencia, España', sport: 'Natación', aura_score: 995, verified: true },
  
  // 4 Clubs
  { id: '33333333-3333-3333-3333-333333333331', user_type: 'club', full_name: 'FC Barcelona Juvenil', bio: 'Club con tradición de 50 años.', location: 'Barcelona, España', sport: 'Fútbol', aura_score: 990, verified: true },
  { id: '33333333-3333-3333-3333-333333333332', user_type: 'club', full_name: 'Madrid Tennis Academy', bio: 'Academia de tenis de élite.', location: 'Madrid, España', sport: 'Tenis', aura_score: 950, verified: true },
  { id: '33333333-3333-3333-3333-333333333333', user_type: 'club', full_name: 'Valencia Swim Club', bio: 'Club con instalaciones olímpicas.', location: 'Valencia, España', sport: 'Natación', aura_score: 975, verified: true },
  { id: '33333333-3333-3333-3333-333333333334', user_type: 'club', full_name: 'Sevilla Basketball Academy', bio: 'Academia de baloncesto profesional.', location: 'Sevilla, España', sport: 'Basquetbol', aura_score: 940, verified: true },
  
  // 3 Agents
  { id: '44444444-4444-4444-4444-444444444441', user_type: 'agent', full_name: 'Juan Pérez', bio: 'Agente con 50+ contratos.', location: 'Madrid, España', sport: 'Fútbol', aura_score: 970, verified: true },
  { id: '44444444-4444-4444-4444-444444444442', user_type: 'agent', full_name: 'María López', bio: 'Agente con conexiones internacionales.', location: 'Barcelona, España', sport: 'Multi-deporte', aura_score: 960, verified: true },
  { id: '44444444-4444-4444-4444-444444444443', user_type: 'agent', full_name: 'Roberto Silva', bio: 'Agente especialista en tenis ATP.', location: 'Mallorca, España', sport: 'Tenis', aura_score: 945, verified: true },
  
  // 2 Sponsors
  { id: '55555555-5555-5555-5555-555555555551', user_type: 'sponsor', full_name: 'Sports Brand Global', bio: 'Material deportivo. 500+ patrocinados.', location: 'Madrid, España', sport: 'Multi-deporte', aura_score: 995, verified: true },
  { id: '55555555-5555-5555-5555-555555555552', user_type: 'sponsor', full_name: 'Energy Drink Pro', bio: 'Bebida energética. Patrocinador oficial.', location: 'Barcelona, España', sport: 'Multi-deporte', aura_score: 975, verified: true },
  
  // 2 Investors
  { id: '66666666-6666-6666-6666-666666666661', user_type: 'investor', full_name: 'Sports Ventures Capital', bio: 'Fondo de inversión en startups deportivas.', location: 'Madrid, España', sport: 'Multi-deporte', aura_score: 985, verified: true },
  { id: '66666666-6666-6666-6666-666666666662', user_type: 'investor', full_name: 'Athletic Investment Group', bio: 'Inversores en infraestructura deportiva.', location: 'Valencia, España', sport: 'Multi-deporte', aura_score: 970, verified: true }
];

console.log(`📊 Inserting ${profiles.length} profiles...\n`);

let inserted = 0;
let skipped = 0;

for (const profile of profiles) {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert(profile);
    
    if (error) {
      console.log(`⚠️  Skipped: ${profile.full_name} (${profile.user_type}) - ${error.message}`);
      skipped++;
    } else {
      console.log(`✅ Inserted: ${profile.full_name} (${profile.user_type})`);
      inserted++;
    }
  } catch (err) {
    console.log(`❌ Error with ${profile.full_name}:`, err.message);
    skipped++;
  }
}

console.log(`\n✅ Summary:`);
console.log(`   Inserted: ${inserted}`);
console.log(`   Skipped: ${skipped}`);
console.log(`   Total: ${profiles.length}`);

if (inserted > 0) {
  console.log(`\n🎉 Successfully inserted ${inserted} profiles!`);
  console.log(`🔗 Check your database: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/editor`);
}


