import { supabase } from '../../utils/supabase'

export interface WasteCategory {
  id: number
  name: string
  description: string
}

const FALLBACK_CATEGORIES: WasteCategory[] = [
  { id: 1, name: 'Mobile Phones & Devices', description: 'Smartphones, feature phones, chargers, and accessories' },
  { id: 2, name: 'Laptops & Computers', description: 'Laptops, motherboards, RAM, hard drives, and power units' },
  { id: 3, name: 'Tablets & E-Readers', description: 'iPads, Android tablets, and e-readers' },
  { id: 4, name: 'Batteries & Power Units', description: 'Lithium-ion batteries, UPS, and battery banks' },
  { id: 5, name: 'Accessories & Cables', description: 'Headphones, USB cables, adapters, and chargers' },
  { id: 6, name: 'Home & Office Electronics', description: 'Printers, routers, monitors, and TV circuit boards' },
]

export const wasteCategoriesApi = {
  /**
   * Fetches all official waste categories from Supabase `public.waste_categories`.
   * Falls back to standard predefined categories if database is temporarily offline.
   */
  async getCategories(): Promise<WasteCategory[]> {
    try {
      const { data, error } = await supabase
        .from('waste_categories')
        .select('id, name, description')
        .order('id', { ascending: true })

      if (!error && data && data.length > 0) {
        return data as WasteCategory[]
      }
    } catch (e: any) {
      console.warn('[Green Loop] Fetching waste_categories note:', e?.message)
    }

    return FALLBACK_CATEGORIES
  }
}
