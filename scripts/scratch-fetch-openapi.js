// Node 24 native fetch

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'

async function checkOpenApi() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_KEY}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  })

  if (!res.ok) {
    console.log('Failed to fetch OpenAPI:', res.status, res.statusText)
    return
  }

  const spec = await res.json()
  console.log('API Title:', spec.info?.title)
  console.log('Definitions/Tables in OpenAPI spec:')
  for (const [name, def] of Object.entries(spec.definitions || {})) {
    const props = Object.keys(def.properties || {})
    const required = def.required || []
    console.log(`\nTable [${name}]:`)
    console.log(`  Properties: ${props.join(', ')}`)
    if (required.length) console.log(`  Required: ${required.join(', ')}`)
  }
}

checkOpenApi().catch(console.error)
