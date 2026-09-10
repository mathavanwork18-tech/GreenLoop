// Mock users for profile & impact calculation
const mockUsers = [
  {
    id: 'u-101',
    name: 'Mathavan Raman',
    email: 'mathavan@ecocircuit.org',
    role: 'individual',
    city: 'Chennai',
    eco_points: 340,
    level: 'Eco Champion',
  },
  {
    id: 'u-102',
    name: 'CircuitFix Repair Hub',
    email: 'contact@circuitfix.com',
    role: 'shop',
    city: 'Chennai',
    eco_points: 1250,
    level: 'Sustainability Hero',
  },
];

/**
 * Get user profile by ID
 */
export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;

    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get sustainability impact overview & community totals
 */
export async function getImpactStats(req, res) {
  try {
    const totalKg = 1420;
    const co2AvoidedKg = Math.round(totalKg * 1.8);
    const treesEquivalent = Math.round(co2AvoidedKg / 21);

    res.json({
      success: true,
      data: {
        totalKgDiverted: totalKg,
        co2AvoidedKg,
        treesSavedEquivalent: treesEquivalent,
        activeListingsCount: 18,
        recycledItemsCount: 42,
        communityMembers: 520,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
