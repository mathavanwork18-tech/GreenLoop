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
  async getCategories(): Promise<WasteCategory[]> {
    return FALLBACK_CATEGORIES
  }
}
