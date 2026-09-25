import type { Post } from '../types/post.types'
import type { CanonicalLanguage } from '../i18n/languages'

const ALL_LANGS: CanonicalLanguage[] = ['en', 'ta', 'hi', 'ml', 'kn', 'te']

/**
 * Builds a fast lookup set of terms for categories across all 6 languages.
 */
const CATEGORY_MULTILINGUAL_SYNONYMS: Record<string, string[]> = {
  smartphone: [
    'mobile', 'phone', 'smartphone', 'smartphones',
    'மொபைல்', 'போன்', 'ஸ்மார்ட்போன்',
    'मोबाइल', 'फ़ोन', 'स्मार्टफोन',
    'മൊബൈൽ', 'ഫോൺ', 'സ്മാർട്ട്ഫോൺ',
    'ಮೊಬೈಲ್', 'ಫೋನ್', 'ಸ್ಮಾರ್ಟ್ಫೋನ್',
    'మొబైల్', 'ఫోన్', 'స్మార్ట్‌ఫోన్'
  ],
  laptop: [
    'laptop', 'laptops', 'notebook',
    'லேப்டாப்', 'மடிக்கணினி',
    'लैपटॉप',
    'ലാപ്‌ടോപ്പ്',
    'ಲ್ಯಾಪ್‌ಟಾಪ್',
    'ల్యాప్‌టాప్'
  ],
  tablet: [
    'tablet', 'tablets', 'ipad',
    'டேப்லெட்',
    'टैबलेट',
    'ടാബ്‌ലെറ്റ്',
    'ಟ್ಯಾಬ್ಲೆಟ್',
    'టాబ్లెట్'
  ],
  desktop: [
    'desktop', 'pc', 'computer',
    'டெஸ்க்டாப்', 'கணினி',
    'डेस्कटॉप', 'कंप्यूटर',
    'ഡെസ്ക്ടോപ്പ്', 'കമ്പ്യൂട്ടർ',
    'ಡೆಸ್ಕ್‌ಟಾಪ್', 'ಕಂಪ್ಯೂಟರ್',
    'డెస్క్‌టాప్', 'కంప్యూటర్'
  ],
  battery: [
    'battery', 'power bank', 'cells',
    'பேட்டரி', 'பவர் பேங்க்',
    'बैटरी', 'पावर बैंक',
    'ബാറ്ററി', 'പവർ ബാങ്ക്',
    'ಬ್ಯಾಟರಿ', 'ಪವರ್ ಬ್ಯಾಂಕ್',
    'బ్యాటరీ', 'పవర్ బ్యాంక్'
  ],
  audio: [
    'audio', 'headphones', 'earphones', 'earbuds',
    'ஹெட்போன்', 'ஆடியோ',
    'हेडफ़ोन', 'ऑडियो',
    'ഹെഡ്‌ഫോൺ', 'ഓഡിയോ',
    'ಹೆಡ್‌ಫೋನ್', 'ಆಡಿಯೋ',
    'హెడ్‌ఫోన్లు', 'ఆడియో'
  ],
  scrap: [
    'scrap', 'circuit', 'motherboard', 'pcb',
    'மின்னணு பலகை', 'ஸ்கிராப்',
    'सर्किट बोर्ड', 'स्क्रैप',
    'സർക്യൂട്ട് ബോർഡ്', 'സ്ക്രാപ്പ്',
    'ಸರ್ಕ್ಯೂಟ್ ಬೋರ್ಡ್', 'ಸ್ಕ್ರ್ಯಾಪ್',
    'సర్క్యూట్ బోర్డ్', 'స్క్రాప్'
  ],
  cables: [
    'cables', 'cable', 'adapters', 'charger',
    'கேபிள்', 'அடாப்டர்', 'சார்ஜர்',
    'केबल', 'एडेप्टर', 'चार्जर',
    'കേബിൾ', 'അഡാപ്റ്റർ', 'ചാർജർ',
    'ಕೇಬಲ್', 'ಅಡಾಪ್ಟರ್', 'ಚಾರ್ಜರ್',
    'కేబుల్', 'అడాప్టర్', 'ఛార్జర్'
  ],
  appliance: [
    'appliance', 'appliances', 'tv', 'washing machine',
    'டிவி', 'வீட்டு உபயோகப் பொருட்கள்',
    'टीवी', 'घरेलू उपकरण',
    'ടിവി', 'വീട്ടുപകരണങ്ങൾ',
    'ಟಿವಿ', 'ಗೃಹೋಪಯೋಗಿ ವಸ್ತುಗಳು',
    'టీవీ', 'గృహోపకరణాలు'
  ],
  other: [
    'other', 'electronics',
    'பிற மின்னணு',
    'अन्य इलेक्ट्रॉनिक्स',
    'മറ്റ് ഇലക്ട്രോണിക്സ്',
    'ಇತರ ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್',
    'ఇతర ఎలక్ట్రానిక్స్'
  ]
}

/**
 * Checks whether a post matches the given search query across all 6 supported languages.
 */
export function matchesMultilingualSearch(
  post: Partial<Post>,
  query: string,
  _viewerLang?: string
): boolean {
  const q = (query || '').trim().toLowerCase()
  if (!q) return true

  // 1. Direct field matches
  const directFields = [
    post.title,
    post.original_title,
    post.description,
    post.original_description,
    post.category,
    post.brand,
    post.model,
    post.location,
    post.locationName,
  ]

  for (const field of directFields) {
    if (field && typeof field === 'string' && field.toLowerCase().includes(q)) {
      return true
    }
  }

  // 2. Multilingual Category Synonyms match
  const rawCat = (post.category || '').toLowerCase()
  for (const [catKey, synonyms] of Object.entries(CATEGORY_MULTILINGUAL_SYNONYMS)) {
    const isCatMatch = rawCat.includes(catKey) || synonyms.some(s => rawCat.includes(s.toLowerCase()))
    if (isCatMatch) {
      if (synonyms.some(s => s.toLowerCase().includes(q) || q.includes(s.toLowerCase()))) {
        return true
      }
    }
  }

  // 3. Check translation cache from localStorage
  if (typeof window !== 'undefined') {
    try {
      const rawCache = localStorage.getItem('gl_translation_cache')
      if (rawCache) {
        const cache = JSON.parse(rawCache)
        for (const lang of ALL_LANGS) {
          const key = `post_${post.id}_${lang}`
          const entry = cache[key]
          if (entry) {
            if (
              (entry.title && entry.title.toLowerCase().includes(q)) ||
              (entry.description && entry.description.toLowerCase().includes(q))
            ) {
              return true
            }
          }
        }
      }
    } catch {}
  }

  return false
}
