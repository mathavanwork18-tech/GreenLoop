-- ==============================================================================
-- Green Loop: Initial Coimbatore Recycling Centers Schema & Seed
-- Target Table: public.recycling_centers
-- ==============================================================================

-- 1. Ensure table exists with all required columns
CREATE TABLE IF NOT EXISTS public.recycling_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Coimbatore',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  contact_phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Explicitly create Unique Index on name (Required for ON CONFLICT (name))
-- This fixes ERROR 42P10 when the table already existed without an explicit UNIQUE constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_recycling_centers_name 
  ON public.recycling_centers (name);

-- 3. Create index on coordinates for rapid geographical queries
CREATE INDEX IF NOT EXISTS idx_recycling_centers_coords 
  ON public.recycling_centers (latitude, longitude);

-- 4. Configure Row Level Security (RLS)
ALTER TABLE public.recycling_centers ENABLE ROW LEVEL SECURITY;

-- Allow public read access (SELECT only for regular users & app clients)
DROP POLICY IF EXISTS "Allow public read access to recycling centers" ON public.recycling_centers;
CREATE POLICY "Allow public read access to recycling centers"
  ON public.recycling_centers
  FOR SELECT
  TO public
  USING (true);

-- 5. Idempotent seed of the 10 Coimbatore recycling centers
-- With idx_recycling_centers_name in place, ON CONFLICT (name) will succeed seamlessly
INSERT INTO public.recycling_centers (name, address, city, latitude, longitude, contact_phone)
VALUES
  (
    'Dharani Recyclers',
    'Lala Mahal Road, PM Samy Colony, Rathinapuri, Gandhipuram',
    'Coimbatore',
    11.0253217,
    76.9655444,
    '+91 91714 50039'
  ),
  (
    'Techazar E-cyclers (Malumichampatti)',
    'Mother India Industrial Estate, Seerapalayam Link Rd, Malumichampatti',
    'Coimbatore',
    10.893136,
    76.98540659999999,
    '+91 98402 35929'
  ),
  (
    'Techazar E-cyclers (R.S. Puram)',
    '18, Sir Shanmugam Rd, near IT HUB, R.S. Puram',
    'Coimbatore',
    11.0111113,
    76.95266819999999,
    '+91 98402 35929'
  ),
  (
    'Green Era Recyclers',
    'Sai Keerthi Industrial Estate, Bodipalayam, Seerapalayam',
    'Coimbatore',
    10.885273699999999,
    76.9746545,
    '+91 93613 28436'
  ),
  (
    'Pickmyscraps',
    'Kurichi Round Rd, Sundarapuram, Kurichi',
    'Coimbatore',
    10.961452699999999,
    76.9727046,
    '+91 90429 47396'
  ),
  (
    'Cercle X',
    'Infinite Cercle Pvt Ltd, Eachanari',
    'Coimbatore',
    10.9282525,
    76.97171469999999,
    '+91 96404 96454'
  ),
  (
    'Nothing is Waste',
    '25, Sastha Nagar, Seeranaickenpalayam, Kuniyamuthur',
    'Coimbatore',
    10.9553932,
    76.9515631,
    '+91 77084 56778'
  ),
  (
    'Green India Recyclers',
    'Kovilpalayam Rd, Sulakkal Village, Kinathukadavu Taluk',
    'Coimbatore',
    10.747153599999999,
    76.9997082,
    '+91 90034 91034'
  ),
  (
    'EcoGenie',
    '317, Happy Homes, Green City, Kannampalayam',
    'Coimbatore',
    10.9969488,
    77.1154819,
    '+91 93447 61559'
  ),
  (
    'SMV Scrap Dealer',
    'Saravanampatti-Kalapatti Rd, Balaji Nagar, Villankurichi',
    'Coimbatore',
    11.0726179,
    77.0126264,
    '+91 98432 49492'
  )
ON CONFLICT (name) DO UPDATE SET
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  contact_phone = EXCLUDED.contact_phone;
