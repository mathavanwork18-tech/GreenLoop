import { aiTools, DEFAULT_COORDS } from './aiTools'
import type {
  AIIntent,
  AIMessage,
  AIConversationState
} from '../../types/ai.types'
import type { User } from '../../types/user.types'

export interface ProcessQueryOptions {
  query: string
  user: User | null
  currentPath: string
  conversationState: AIConversationState
  userCoords?: { lat: number; lng: number }
}

export class GreenAiEngine {
  /**
   * Classifies user intent based on query, state, and route context.
   */
  public static detectIntent(query: string, state: AIConversationState): AIIntent {
    const q = query.toLowerCase().trim()

    // 1. Swollen / Hazardous battery check (Safety First)
    if (
      q.includes('swollen') ||
      q.includes('bulging') ||
      q.includes('leaking') ||
      q.includes('punctured') ||
      q.includes('overheating battery') ||
      (q.includes('battery') && (q.includes('danger') || q.includes('hazard') || q.includes('safe') || q.includes('smoke')))
    ) {
      return 'BATTERY_SAFETY'
    }

    // 2. Destructive Actions / Delete
    if (
      q.includes('delete') ||
      q.includes('remove my post') ||
      q.includes('delete my listing') ||
      q.includes('take down my') ||
      q.includes('cancel my listing')
    ) {
      return 'DELETE_POST'
    }

    // 3. Edit post
    if (
      q.includes('edit my post') ||
      q.includes('update price') ||
      q.includes('change listing') ||
      q.includes('modify post')
    ) {
      return 'EDIT_POST'
    }

    // 4. Navigation requests
    if (
      q === 'open map' ||
      q === 'go to map' ||
      q === 'show map' ||
      q === 'open activity' ||
      q === 'go to activity' ||
      q === 'show my activity' ||
      q === 'open account' ||
      q === 'go to account' ||
      q === 'show my profile' ||
      q === 'post an item' ||
      q === 'post item' ||
      q === 'go home'
    ) {
      return 'APP_NAVIGATION'
    }

    // 5. User Posts
    if (
      q.includes('show my posts') ||
      q.includes('my listings') ||
      q.includes('view my posts') ||
      q.includes('what did i post')
    ) {
      return 'ACCOUNT_HELP'
    }

    // 6. Price / Valuation Estimates
    if (
      q.includes('how much is') ||
      q.includes('worth') ||
      q.includes('price of') ||
      q.includes('what is the value') ||
      q.includes('resale value') ||
      q.includes('scrap value') ||
      q.includes('valuation')
    ) {
      return 'PRICE_ESTIMATE'
    }

    // 7. Parts specific search
    if (
      q.includes('part') ||
      q.includes('ram') ||
      q.includes('ssd') ||
      q.includes('hdd') ||
      q.includes('charger') ||
      q.includes('motherboard') ||
      q.includes('circuit board') ||
      q.includes('screen replacement') ||
      q.includes('psu') ||
      q.includes('power supply') ||
      q.includes('gpu') ||
      q.includes('ddr4') ||
      q.includes('ddr5')
    ) {
      return 'SEARCH_PART'
    }

    // 8. Nearby search
    if (
      q.includes('near me') ||
      q.includes('nearby') ||
      q.includes('around me') ||
      q.includes('within') ||
      q.includes('closest') ||
      q.includes('what\'s near me') ||
      q.includes('whats near me')
    ) {
      if (q.includes('recycl') || q.includes('center') || q.includes('hub') || q.includes('dropoff') || q.includes('drop off')) {
        return 'FIND_NEARBY'
      }
      return 'FIND_NEARBY'
    }

    // 9. Post / Sell request
    if (
      q.includes('i want to sell') ||
      q.includes('how to post') ||
      q.includes('sell my') ||
      q.includes('donate my') ||
      q.includes('list my') ||
      q.includes('post electronic') ||
      q.includes('upload item')
    ) {
      return 'POST_ITEM'
    }

    // 10. Recycling & Disposal guidance
    if (
      q.includes('how should i dispose') ||
      q.includes('how to dispose') ||
      q.includes('how to recycle') ||
      q.includes('where to throw') ||
      q.includes('wipe laptop') ||
      q.includes('wipe phone') ||
      q.includes('factory reset') ||
      q.includes('data safety') ||
      q.includes('data sanitiz')
    ) {
      return 'DISPOSAL_GUIDANCE'
    }

    // 11. Repair guidance
    if (
      q.includes('repair') ||
      q.includes('water damage') ||
      q.includes('screen cracked') ||
      q.includes('fix') ||
      q.includes('service')
    ) {
      return 'REPAIR_GUIDANCE'
    }

    // 12. Reuse guidance
    if (q.includes('reuse') || q.includes('repurpose') || q.includes('second life')) {
      return 'REUSE_GUIDANCE'
    }

    // 13. Activity & Coins
    if (
      q.includes('green coin') ||
      q.includes('coins') ||
      q.includes('rewards') ||
      q.includes('earn coin') ||
      q.includes('missions') ||
      q.includes('leaderboard') ||
      q.includes('streak')
    ) {
      return 'ACTIVITY_HELP'
    }

    // 14. Standard product search
    if (
      q.includes('search') ||
      q.includes('find') ||
      q.includes('laptop') ||
      q.includes('phone') ||
      q.includes('mobile') ||
      q.includes('monitor') ||
      q.includes('under ₹') ||
      q.includes('under rs') ||
      q.includes('below ₹') ||
      q.includes('items under') ||
      q.includes('show me items') ||
      q.includes('available items')
    ) {
      return 'SEARCH_ITEM'
    }

    // 15. General E-Waste questions
    if (
      q.includes('e-waste') ||
      q.includes('ewaste') ||
      q.includes('circular economy') ||
      q.includes('tnpcb') ||
      q.includes('certificate') ||
      q.includes('zero landfill') ||
      q.includes('pollution')
    ) {
      return 'GENERAL_EWASTE_QUESTION'
    }

    // 16. Contextual refinement (e.g. user typed "10 km" or "25 km" following a previous search)
    if (state.lastIntent && (q.includes('km') || q.includes('radius') || q.includes('only parts') || q.includes('show all'))) {
      return state.lastIntent
    }

    // 17. Unsupported
    return 'UNSUPPORTED_REQUEST'
  }

  /**
   * Core orchestrator that executes tools and grounds the response strictly in real application data.
   */
  public static async processMessage(options: ProcessQueryOptions): Promise<{
    message: AIMessage
    updatedState: AIConversationState
  }> {
    const { query, user, conversationState, userCoords } = options
    const q = query.trim()
    const coords = userCoords || (user?.city === 'Coimbatore' ? DEFAULT_COORDS : DEFAULT_COORDS)

    // Detect Intent
    const intent = this.detectIntent(q, conversationState)

    // Parse radius from query or conversation state
    let radiusKm = conversationState.radiusKm || 10
    const radiusMatch = q.match(/(\d+)\s*(?:km|kms|kilometer|kilometres)/i)
    if (radiusMatch) {
      const parsed = parseInt(radiusMatch[1], 10)
      if ([1, 5, 10, 25, 50].includes(parsed)) {
        radiusKm = parsed
      } else if (parsed > 0 && parsed <= 100) {
        radiusKm = parsed
      }
    }

    // Parse price limits
    let maxPrice: number | undefined
    const priceMatch = q.match(/(?:under|below|less than|max)\s*(?:₹|rs\.?|inr)?\s*(\d+[\d,]*)/i) ||
                       q.match(/(?:₹|rs\.?|inr)\s*(\d+[\d,]*)/i)
    if (priceMatch) {
      maxPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10)
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const updatedState: AIConversationState = {
      ...conversationState,
      radiusKm,
      lastIntent: intent,
      lastQuery: q
    }

    // -------------------------------------------------------------
    // INTENT 1: BATTERY SAFETY
    // -------------------------------------------------------------
    if (intent === 'BATTERY_SAFETY') {
      const text = `⚠️ **Battery Safety Protocol (High Priority)**\n\nFor swollen, leaking, damaged, or overheating lithium-ion batteries:\n\n1. **Do NOT puncture, crush, or apply pressure** to the battery.\n2. **Do NOT connect to a charger** or expose to heat/direct sunlight.\n3. **Store in a fire-safe non-metallic container** (or sand bucket) at room temperature.\n4. **Do NOT throw into regular household waste** — this causes landfill fires.\n5. Take it immediately to an authorized, certified TNPCB e-waste collection center.\n\n*Verified battery recycling earns you **+150 Green Coins** and an official TNPCB digital certificate.*`

      const centersResult = await aiTools.getNearbyCenters({
        userCoords: coords,
        radiusKm: 25,
        typeFilter: 'recycler',
        serviceQuery: 'battery'
      })

      return {
        message: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text,
          timestamp,
          intent,
          partnerCards: centersResult.partners.slice(0, 2),
          actionChips: [
            { label: '📍 Find Recyclers on Map', actionType: 'navigate', payload: '/map' },
            { label: '📦 Schedule Doorstep Pickup', actionType: 'navigate', payload: '/post' }
          ]
        },
        updatedState
      }
    }

    // -------------------------------------------------------------
    // INTENT 2: DELETE POST (Destructive action with confirmation)
    // -------------------------------------------------------------
    if (intent === 'DELETE_POST') {
      const userPosts = await aiTools.getUserPosts(user?.name || 'Mathavan')

      if (userPosts.length === 0) {
        return {
          message: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: `I couldn't find any active listings published under your account (**${user?.name || 'Mathavan'}**) to delete.`,
            timestamp,
            intent,
            actionChips: [
              { label: '📦 Post a New Item', actionType: 'navigate', payload: '/post' },
              { label: '🔍 Browse Marketplace', actionType: 'navigate', payload: '/' }
            ]
          },
          updatedState
        }
      }

      // Check if user specified a specific item title in their query
      const targetPost = userPosts.find(p => q.toLowerCase().includes(p.title.toLowerCase())) || userPosts[0]

      return {
        message: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Are you sure you want to delete **"${targetPost.title}"**? This action cannot be undone.`,
          timestamp,
          intent,
          deleteConfirmation: {
            postId: targetPost.id,
            postTitle: targetPost.title
          },
          actionChips: [
            { label: 'Cancel', actionType: 'cancel_delete' },
            { label: 'Delete Listing', actionType: 'confirm_delete', payload: targetPost.id }
          ]
        },
        updatedState: {
          ...updatedState,
          pendingDeletePostId: targetPost.id
        }
      }
    }

    // -------------------------------------------------------------
    // INTENT 3: APP NAVIGATION
    // -------------------------------------------------------------
    if (intent === 'APP_NAVIGATION') {
      const qLower = q.toLowerCase()
      let destination = '/'
      let destinationLabel = 'Home Feed'

      if (qLower.includes('map')) {
        destination = '/map'
        destinationLabel = 'E-Waste & Recycling Map'
      } else if (qLower.includes('activity')) {
        destination = '/activity'
        destinationLabel = 'Eco Wallet & Activity'
      } else if (qLower.includes('account') || qLower.includes('profile')) {
        destination = '/account'
        destinationLabel = 'Account Settings'
      } else if (qLower.includes('post')) {
        destination = '/post'
        destinationLabel = 'Post an Item'
      }

      return {
        message: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Navigating you directly to **${destinationLabel}**.`,
          timestamp,
          intent,
          actionChips: [
            { label: `Open ${destinationLabel}`, actionType: 'navigate', payload: destination }
          ]
        },
        updatedState
      }
    }

    // -------------------------------------------------------------
    // INTENT 4: SEARCH PART
    // -------------------------------------------------------------
    if (intent === 'SEARCH_PART') {
      // Extract specific search keyword (e.g. ram, ssd, charger, laptop parts)
      let cleanQuery = q.replace(/find|search|show|parts|part|within|\d+\s*km/gi, '').trim()
      if (!cleanQuery) cleanQuery = 'RAM'

      const searchResult = await aiTools.searchMarketplace({
        query: cleanQuery === 'RAM' || cleanQuery === 'SSD' || cleanQuery === 'charger' ? cleanQuery : undefined,
        onlyParts: true,
        maxPrice,
        userCoords: coords,
        radiusKm
      })

      if (searchResult.count > 0) {
        const text = `I found **${searchResult.count}** electronic-part listing${searchResult.count > 1 ? 's' : ''} within **${radiusKm} km** of your location.`
        return {
          message: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text,
            timestamp,
            intent,
            productCards: searchResult.items,
            radiusUsed: radiusKm,
            actionChips: [
              { label: '📏 Expand to 25 km', actionType: 'set_radius', payload: 25 },
              { label: '📦 Post Parts for Sale', actionType: 'navigate', payload: '/post' }
            ]
          },
          updatedState
        }
      } else {
        const text = `I couldn't find a matching electronic-part listing within **${radiusKm} km** of your location.`
        return {
          message: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text,
            timestamp,
            intent,
            radiusUsed: radiusKm,
            actionChips: [
              { label: '📏 Expand to 25 km', actionType: 'set_radius', payload: 25 },
              { label: '📏 Expand to 50 km', actionType: 'set_radius', payload: 50 },
              { label: '🔍 Browse All Categories', actionType: 'navigate', payload: '/' }
            ]
          },
          updatedState
        }
      }
    }

    // -------------------------------------------------------------
    // INTENT 5: SEARCH ITEM (with price & location filters)
    // -------------------------------------------------------------
    if (intent === 'SEARCH_ITEM') {
      let cleanQuery = q.replace(/find|search|show|items|item|under|below|less than|₹|rs\.?|inr|\d+[\d,]*|within|\d+\s*km/gi, '').trim()

      const searchResult = await aiTools.searchMarketplace({
        query: cleanQuery || undefined,
        maxPrice,
        userCoords: coords,
        radiusKm
      })

      if (searchResult.count > 0) {
        const priceLabel = maxPrice ? ` under ₹${maxPrice.toLocaleString('en-IN')}` : ''
        const text = `I found **${searchResult.count}** listing${searchResult.count > 1 ? 's' : ''}${priceLabel} within **${radiusKm} km** of your location.`
        return {
          message: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text,
            timestamp,
            intent,
            productCards: searchResult.items,
            radiusUsed: radiusKm,
            actionChips: [
              { label: '📏 Expand to 25 km', actionType: 'set_radius', payload: 25 },
              { label: '⚡ Filter Only Parts', actionType: 'query', payload: 'Find only parts near me' },
              { label: '📦 Post Item', actionType: 'navigate', payload: '/post' }
            ]
          },
          updatedState
        }
      } else {
        const priceLabel = maxPrice ? ` under ₹${maxPrice.toLocaleString('en-IN')}` : ''
        const text = `I couldn't find a matching listing${priceLabel} within **${radiusKm} km**.`
        return {
          message: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text,
            timestamp,
            intent,
            radiusUsed: radiusKm,
            actionChips: [
              { label: '📏 Try 25 km Radius', actionType: 'set_radius', payload: 25 },
              { label: '🔍 View All Listings', actionType: 'navigate', payload: '/' },
              { label: '📦 Post Wanted Device', actionType: 'navigate', payload: '/post' }
            ]
          },
          updatedState
        }
      }
    }

    // -------------------------------------------------------------
    // INTENT 6: FIND NEARBY (Recycling centers & drop-off hubs)
    // -------------------------------------------------------------
    if (intent === 'FIND_NEARBY') {
      const isRecyclerQuery = q.includes('recycl') || q.includes('center') || q.includes('hub') || q.includes('drop')
      const centersResult = await aiTools.getNearbyCenters({
        userCoords: coords,
        radiusKm,
        typeFilter: isRecyclerQuery ? 'recycler' : 'all'
      })

      const productResult = await aiTools.searchMarketplace({
        userCoords: coords,
        radiusKm
      })

      if (centersResult.count > 0 || productResult.count > 0) {
        const text = `I found **${centersResult.count} verified facility/shop${centersResult.count > 1 ? 's' : ''}** and **${productResult.count} marketplace listing${productResult.count > 1 ? 's' : ''}** within **${radiusKm} km**.`
        return {
          message: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text,
            timestamp,
            intent,
            partnerCards: centersResult.partners.slice(0, 3),
            productCards: productResult.items.slice(0, 2),
            radiusUsed: radiusKm,
            actionChips: [
              { label: '🗺️ Open Interactive Map', actionType: 'navigate', payload: '/map' },
              { label: '📏 Change to 25 km', actionType: 'set_radius', payload: 25 }
            ]
          },
          updatedState
        }
      } else {
        return {
          message: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: `I couldn't find any verified partners or listings within **${radiusKm} km** of your location.`,
            timestamp,
            intent,
            actionChips: [
              { label: '📏 Expand to 25 km', actionType: 'set_radius', payload: 25 },
              { label: '🗺️ Open Map Page', actionType: 'navigate', payload: '/map' }
            ]
          },
          updatedState
        }
      }
    }

    // -------------------------------------------------------------
    // INTENT 7: PRICE ESTIMATION (Grounded only in real data)
    // -------------------------------------------------------------
    if (intent === 'PRICE_ESTIMATE') {
      const estimate = await aiTools.estimatePrice(q)

      if (estimate.foundMatches) {
        const text = `💰 **Fair Price Estimate**:\n\n${estimate.disclaimer}\n\n• **Lowest listed:** ₹${estimate.minPrice?.toLocaleString('en-IN')}\n• **Highest listed:** ₹${estimate.maxPrice?.toLocaleString('en-IN')}\n• **Marketplace Average:** ₹${estimate.avgPrice?.toLocaleString('en-IN')}`
        return {
          message: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text,
            timestamp,
            intent,
            actionChips: [
              { label: '📦 Post at this Price', actionType: 'navigate', payload: '/post' },
              { label: '🔍 View Matching Listings', actionType: 'query', payload: 'Find laptop listings' }
            ]
          },
          updatedState
        }
      } else {
        return {
          message: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: `I couldn't verify that from Green Loop's current data. There are currently no active listings for that exact model to provide a grounded price calculation.`,
            timestamp,
            intent,
            actionChips: [
              { label: '📦 Create Custom Listing', actionType: 'navigate', payload: '/post' },
              { label: '🔍 Browse All Listings', actionType: 'navigate', payload: '/' }
            ]
          },
          updatedState
        }
      }
    }

    // -------------------------------------------------------------
    // INTENT 8: POST / SELL GUIDANCE
    // -------------------------------------------------------------
    if (intent === 'POST_ITEM') {
      const text = `To list your electronic item on Green Loop:\n\n1. **Take 1–3 clear photos** (front, ports, labels).\n2. **Select category** (Mobile, Laptop, Electronic Parts, etc.).\n3. **Assess condition** (Flawless, Good, Fair, Broken / For Parts).\n4. **Set purpose** (Sell, Donate, Recycle, or Repair).\n5. **Set price** or mark as Free for certified e-waste pickup.\n6. **Confirm location** for nearby buyers and recyclers.`
      return {
        message: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text,
          timestamp,
          intent,
          actionChips: [
            { label: '📦 Open Post Item', actionType: 'navigate', payload: '/post' }
          ]
        },
        updatedState
      }
    }

    // -------------------------------------------------------------
    // INTENT 9: DISPOSAL & RECYCLING GUIDANCE
    // -------------------------------------------------------------
    if (intent === 'DISPOSAL_GUIDANCE' || intent === 'RECYCLING_GUIDANCE') {
      const text = `📋 **Safe Device Disposal & Data Sanitization Checklist**:\n\n1. **Backup Data**: Save contacts, photos, and files to cloud or external drive.\n2. **Sign Out of Accounts**: Remove Apple ID, Google Account, Microsoft, Steam.\n3. **Factory Reset**: Perform a secure factory wipe with device encryption enabled.\n4. **Remove Hardware**: Eject SIM tray and microSD memory cards.\n5. **Circular First**: Check if minor repairs can extend device life before scrapping.\n6. **Zero Landfill**: Drop off at a verified TNPCB recycler to avoid heavy metal pollution.`

      return {
        message: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text,
          timestamp,
          intent,
          actionChips: [
            { label: '📍 Find Nearest Recycler', actionType: 'navigate', payload: '/map' },
            { label: '📦 Schedule Doorstep Pickup', actionType: 'navigate', payload: '/post' }
          ]
        },
        updatedState
      }
    }

    // -------------------------------------------------------------
    // INTENT 10: REPAIR GUIDANCE
    // -------------------------------------------------------------
    if (intent === 'REPAIR_GUIDANCE') {
      const text = `🔧 **Electronics Repair & Recovery Guide**:\n\n• **Cracked Screen**: Display replacements typically take 45–60 mins at verified local repair shops.\n• **Water Damage**: Disconnect battery immediately. Do NOT turn on or use rice; take for ultrasonic PCB cleaning.\n• **Slow Performance**: Upgrading to an SSD or adding 8GB/16GB DDR4 RAM can extend laptop lifespan by 3+ years.\n\n*Repairing hardware saves up to 75% compared to buying new and earns **+100 Green Coins**.*`

      const repairShops = await aiTools.getNearbyCenters({
        userCoords: coords,
        radiusKm: 15,
        typeFilter: 'repair'
      })

      return {
        message: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text,
          timestamp,
          intent,
          partnerCards: repairShops.partners.slice(0, 2),
          actionChips: [
            { label: '🗺️ View Repair Shops on Map', actionType: 'navigate', payload: '/map' },
            { label: '⚡ Find Spare Parts', actionType: 'query', payload: 'Find laptop parts near me' }
          ]
        },
        updatedState
      }
    }

    // -------------------------------------------------------------
    // INTENT 11: REUSE GUIDANCE
    // -------------------------------------------------------------
    if (intent === 'REUSE_GUIDANCE') {
      const text = `♻️ **Circular Electronics Reuse Ideas**:\n\n• **Old Smartphone**: Use as a dedicated home security camera, smart dashcam, or offline music player.\n• **Old Laptop**: Convert into a lightweight home media server, Linux learning station, or donate to a local student.\n• **Old Monitors**: Dual-monitor productivity setup or display for Raspberry Pi projects.\n• **Harvestable Spare Parts**: RAM sticks, SATA/NVMe SSDs, chargers, and cooling fans can be reused in other systems.`

      return {
        message: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text,
          timestamp,
          intent,
          actionChips: [
            { label: '📦 Donate to Students', actionType: 'navigate', payload: '/post' },
            { label: '⚡ Browse Harvested Parts', actionType: 'query', payload: 'Find laptop parts' }
          ]
        },
        updatedState
      }
    }

    // -------------------------------------------------------------
    // INTENT 12: ACTIVITY & GREEN COINS
    // -------------------------------------------------------------
    if (intent === 'ACTIVITY_HELP') {
      const coinBalance = user?.greenCoins ?? 1250
      const text = `🪙 **Your Green Loop Impact & Rewards**:\n\n• **Current Balance**: **${coinBalance.toLocaleString('en-IN')} Green Coins**\n• **Eco Streak**: ${user?.streak ?? 7} Days Active\n• **Level**: ${user?.level ?? 'Eco Explorer'}\n\n**Ways to earn more Green Coins**:\n• AI scan & post an item: **+10 Coins**\n• Verified recycling drop-off: **+150 Coins**\n• Device donation/repair: **+100 Coins**\n• Daily Eco Missions: **+45 Coins / day**`

      return {
        message: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text,
          timestamp,
          intent,
          actionChips: [
            { label: '🪙 View Rewards & Wallet', actionType: 'navigate', payload: '/activity' },
            { label: '📜 View TNPCB Certificates', actionType: 'navigate', payload: '/account' }
          ]
        },
        updatedState
      }
    }

    // -------------------------------------------------------------
    // INTENT 13: ACCOUNT & USER POSTS HELP
    // -------------------------------------------------------------
    if (intent === 'ACCOUNT_HELP') {
      const userPosts = await aiTools.getUserPosts(user?.name || 'Mathavan')
      const text = `You currently have **${userPosts.length} active listing${userPosts.length === 1 ? '' : 's'}** on Green Loop.`

      return {
        message: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text,
          timestamp,
          intent,
          productCards: userPosts,
          actionChips: [
            { label: '📦 Post New Item', actionType: 'navigate', payload: '/post' },
            { label: '👤 Account Settings', actionType: 'navigate', payload: '/account' }
          ]
        },
        updatedState
      }
    }

    // -------------------------------------------------------------
    // INTENT 14: GENERAL E-WASTE & CERTIFICATES
    // -------------------------------------------------------------
    if (intent === 'GENERAL_EWASTE_QUESTION') {
      const text = `🌱 **Green Loop Circular Mission**:\n\nGreen Loop is an authorized circular e-waste platform in Tamil Nadu adhering to Central Pollution Control Board (CPCB) and TNPCB e-waste management guidelines.\n\n• **Zero Landfill Target**: Preventing toxic lead, mercury, and cadmium from contaminating soil & groundwater.\n• **Traceable Recycling**: All drop-offs generate an official digital Certificate of Safe Destruction with verifiable serial numbers.`

      return {
        message: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text,
          timestamp,
          intent,
          actionChips: [
            { label: '📍 Find TNPCB Recyclers', actionType: 'navigate', payload: '/map' },
            { label: '📦 Post for Recycling', actionType: 'navigate', payload: '/post' }
          ]
        },
        updatedState
      }
    }

    // -------------------------------------------------------------
    // INTENT 15: UNSUPPORTED / OUT OF SCOPE (No hallucination)
    // -------------------------------------------------------------
    return {
      message: {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `I couldn't verify that from Green Loop's current data.\n\nAs Green Loop's E-Waste & Marketplace Assistant, I can help you find nearby items, spare parts, verified TNPCB recyclers, battery safety instructions, and fair price estimates.`,
        timestamp,
        intent: 'UNSUPPORTED_REQUEST',
        actionChips: [
          { label: '📍 Find E-Waste Near Me', actionType: 'query', payload: 'Find e-waste near me' },
          { label: '⚡ Find Laptop Parts', actionType: 'query', payload: 'Find laptop parts within 10 km' },
          { label: '🔋 Battery Safety Guide', actionType: 'query', payload: 'How do I recycle a swollen battery?' },
          { label: '📦 Post an Item', actionType: 'navigate', payload: '/post' }
        ]
      },
      updatedState
    }
  }
}
