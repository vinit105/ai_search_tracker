import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local
config({ path: '.env.local' })

// Create supabase client with loaded env vars
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function run() {
  console.log('Seeding demo data...')

  // Create or get demo user via Supabase Admin (service role)
  const email = 'demo@example.com'
  const password = 'password123'

  let userId: string

  // Try to create user
  const { data, error: userErr } = await supabaseServer.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (userErr && userErr.message?.includes('already been registered')) {
    // User exists, get by email
    console.log('User already exists, fetching...')
    const { data: users } = await supabaseServer.auth.admin.listUsers()
    const existingUser = users.users.find(u => u.email === email)
    if (!existingUser) {
      console.error('Could not find existing user')
      return
    }
    userId = existingUser.id
    console.log('Using existing user:', email)
  } else if (userErr) {
    console.error('Error creating user:', userErr)
    return
  } else {
    userId = data.user!.id
    console.log('Created new user:', email)
  }

  // Define 5 sample projects
  const projects = [
    {
      user_id: userId,
      domain: 'techstartup.io',
      brand: 'TechStartup',
      competitors: ['competitor1.com', 'rival-tech.io'],
      keywords: []
    },
    {
      user_id: userId,
      domain: 'aimarketing.com',
      brand: 'AI Marketing Pro',
      competitors: ['marketingai.com', 'smartmarket.io'],
      keywords: []
    },
    {
      user_id: userId,
      domain: 'ecommerce-solutions.net',
      brand: 'eCommerce Solutions',
      competitors: ['shopify.com', 'bigcommerce.com'],
      keywords: []
    },
    {
      user_id: userId,
      domain: 'healthtech.ai',
      brand: 'HealthTech AI',
      competitors: ['medtech.com', 'healthai.io'],
      keywords: []
    },
    {
      user_id: userId,
      domain: 'fintech-platform.com',
      brand: 'FinTech Platform',
      competitors: ['stripe.com', 'square.com'],
      keywords: []
    }
  ]

  // Insert all projects
  const { data: projectsData, error: projErr } = await supabaseServer.from('projects').insert(projects).select()
  if (projErr) {
    console.error('Error inserting projects:', projErr)
    return
  }

  console.log(`Inserted ${projectsData.length} projects`)

  // Generate checks for each project
  for (const projData of projectsData) {
    console.log(`\nGenerating checks for project: ${projData.domain}`)
    
    // Generate 10-20 keywords
    const keywordCount = 12
    const keywords = Array.from({ length: keywordCount }).map((_, i) => `keyword ${i + 1}`)

    // Update project with keywords
    await supabaseServer.from('projects').update({ keywords }).eq('id', projData.id)

    // Generate 14 days of checks for each keyword and engine
    const engines = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity']
    const days = 14
    const inserts: any[] = []

    for (let d = 0; d < days; d++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - d - 1))
      for (const k of keywords) {
        for (const e of engines) {
          const presence = Math.random() < 0.6
          const position = presence ? Math.floor(Math.random() * 10) + 1 : null
          const citations_count = presence ? Math.floor(Math.random() * 5) : 0
          const answer_snippet = presence ? `Sample snippet for ${k} on ${e}` : null
          const observed_urls = presence ? [`https://${projData.domain}`, `https://example.com/${k.replace(/\s+/g, '-')}`] : []

          inserts.push({
            project_id: projData.id,
            engine: e,
            keyword: k,
            position,
            presence,
            answer_snippet,
            citations_count,
            observed_urls,
            timestamp: date.toISOString()
          })
        }
      }
    }

    console.log(`  Inserting ${inserts.length} checks...`)
    const { error: checksErr } = await supabaseServer.from('checks').insert(inserts)
    if (checksErr) {
      console.error('  Error inserting checks:', checksErr)
      return
    }
    console.log(`  ✓ Inserted ${inserts.length} checks for ${projData.domain}`)
  }

  console.log('\n✅ Seed script completed: created demo user, 5 projects, and checks for each!')
}

run().catch((err) => console.error(err))
