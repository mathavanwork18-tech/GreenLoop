import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()
dotenv.config({ path: 'backend/.env' })
dotenv.config({ path: 'frontend/.env' })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://pzjczufhflhjcoorvubr.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY

const INITIAL_RECYCLING_CENTERS = [
  {
    name: 'Dharani Recyclers',
    address: 'Lala Mahal Road, PM Samy Colony, Rathinapuri, Gandhipuram',
    city: 'Coimbatore',
    latitude: 11.0253217,
    longitude: 76.9655444,
    contact_phone: '+91 91714 50039'
  },
  {
    name: 'Techazar E-cyclers (Malumichampatti)',
    address: 'Mother India Industrial Estate, Seerapalayam Link Rd, Malumichampatti',
    city: 'Coimbatore',
    latitude: 10.893136,
    longitude: 76.98540659999999,
    contact_phone: '+91 98402 35929'
  },
  {
    name: 'Techazar E-cyclers (R.S. Puram)',
    address: '18, Sir Shanmugam Rd, near IT HUB, R.S. Puram',
    city: 'Coimbatore',
    latitude: 11.0111113,
    longitude: 76.95266819999999,
    contact_phone: '+91 98402 35929'
  },
  {
    name: 'Green Era Recyclers',
    address: 'Sai Keerthi Industrial Estate, Bodipalayam, Seerapalayam',
    city: 'Coimbatore',
    latitude: 10.885273699999999,
    longitude: 76.9746545,
    contact_phone: '+91 93613 28436'
  },
  {
    name: 'Pickmyscraps',
    address: 'Kurichi Round Rd, Sundarapuram, Kurichi',
    city: 'Coimbatore',
    latitude: 10.961452699999999,
    longitude: 76.9727046,
    contact_phone: '+91 90429 47396'
  },
  {
    name: 'Cercle X',
    address: 'Infinite Cercle Pvt Ltd, Eachanari',
    city: 'Coimbatore',
    latitude: 10.9282525,
    longitude: 76.97171469999999,
    contact_phone: '+91 96404 96454'
  },
  {
    name: 'Nothing is Waste',
    address: '25, Sastha Nagar, Seeranaickenpalayam, Kuniyamuthur',
    city: 'Coimbatore',
    latitude: 10.9553932,
    longitude: 76.9515631,
    contact_phone: '+91 77084 56778'
  },
  {
    name: 'Green India Recyclers',
    address: 'Kovilpalayam Rd, Sulakkal Village, Kinathukadavu Taluk',
    city: 'Coimbatore',
    latitude: 10.747153599999999,
    longitude: 76.9997082,
    contact_phone: '+91 90034 91034'
  },
  {
    name: 'EcoGenie',
    address: '317, Happy Homes, Green City, Kannampalayam',
    city: 'Coimbatore',
    latitude: 10.9969488,
    longitude: 77.1154819,
    contact_phone: '+91 93447 61559'
  },
  {
    name: 'SMV Scrap Dealer',
    address: 'Saravanampatti-Kalapatti Rd, Balaji Nagar, Villankurichi',
    city: 'Coimbatore',
    latitude: 11.0726179,
    longitude: 77.0126264,
    contact_phone: '+91 98432 49492'
  }
]

async function seed() {
  if (!SERVICE_ROLE_KEY) {
    console.log('No SUPABASE_SERVICE_ROLE_KEY detected in environment.');
    console.log('To populate the database directly, run the SQL script in:');
    console.log('  supabase/seed_recycling_centers.sql');
    console.log('inside your Supabase Dashboard SQL Editor at:');
    console.log('  https://supabase.com/dashboard/project/pzjczufhflhjcoorvubr/sql/new\n');
    return
  }

  console.log(`Connecting to Supabase at ${SUPABASE_URL} using service role key...`)
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  for (const center of INITIAL_RECYCLING_CENTERS) {
    const { data: existing } = await supabase
      .from('recycling_centers')
      .select('id')
      .eq('name', center.name)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('recycling_centers')
        .update(center)
        .eq('id', existing.id)

      if (error) console.error(`Error updating "${center.name}":`, error.message)
      else console.log(`Updated "${center.name}" (${center.city})`)
    } else {
      const { error } = await supabase
        .from('recycling_centers')
        .insert([center])

      if (error) console.error(`Error inserting "${center.name}":`, error.message)
      else console.log(`Inserted "${center.name}" (${center.city})`)
    }
  }

  const { count } = await supabase
    .from('recycling_centers')
    .select('*', { count: 'exact', head: true })

  console.log(`\nSeed completed! Total recycling centers in database: ${count}`)
}

seed().catch(console.error)
