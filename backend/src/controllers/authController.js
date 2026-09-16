// In-memory user store
const mockUsers = [
  {
    id: 'u-101',
    name: 'Mathavan Raman',
    email: 'mathavan@ecocircuit.org',
    phone: '9876543210',
    role: 'GENERAL_USER',
    city: 'Chennai',
    area: 'Guindy',
    eco_points: 340,
    greenCoins: 340,
    level: 'Eco Champion',
    isProfileComplete: true,
    impact_stats: { kgDiverted: 24.5, co2AvoidedKg: 44, itemsRecycled: 4, itemsSold: 3 },
  },
  {
    id: 'u-102',
    name: 'CircuitFix Repair Hub',
    email: 'contact@circuitfix.com',
    phone: '9444284711',
    role: 'LOCAL_SHOP',
    city: 'Chennai',
    area: 'Ritchie Street',
    eco_points: 1250,
    greenCoins: 1250,
    level: 'Sustainability Hero',
    isProfileComplete: true,
    roleProfile: {
      shopName: 'CircuitFix Repair Hub',
      ownerName: 'Rajesh Kumar',
      category: 'Electronics Repair',
      shopAddress: '44 Ritchie Street, Mount Road, Chennai',
    },
    impact_stats: { kgDiverted: 140, co2AvoidedKg: 252, itemsRecycled: 18, itemsSold: 42 },
  },
];

// DEAD-CODED / REMOVED: Mock in-memory OTP store has been decommissioned.
// Green Loop now uses real Supabase Auth (supabase.auth.signInWithOtp / supabase.auth.verifyOtp) as the single source of truth.

function cleanPhoneNumber(phone) {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  // If starts with 91 and has 12 digits, extract last 10
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits.slice(-10);
}

const DUMMY_OTP = '123456';

/**
 * Send OTP (Development & Testing fallback)
 */
export async function sendOtp(req, res) {
  const { phone } = req.body || {};
  const cleanPhone = cleanPhoneNumber(phone);
  return res.json({
    success: true,
    message: `OTP sent successfully to ${cleanPhone || 'phone'}`,
    devOtp: DUMMY_OTP,
  });
}

/**
 * Verify OTP (Development & Testing fallback)
 * Accepts DUMMY_OTP = '123456'
 */
export async function verifyOtp(req, res) {
  const { otp, phone } = req.body || {};
  const cleanOtp = (otp || '').toString().trim();

  if (cleanOtp === DUMMY_OTP) {
    const cleanPhone = cleanPhoneNumber(phone);
    const existingUser = mockUsers.find((u) => cleanPhoneNumber(u.phone) === cleanPhone);

    return res.json({
      success: true,
      message: 'OTP verified',
      isExistingUser: Boolean(existingUser),
      isProfileComplete: Boolean(existingUser?.isProfileComplete),
      user: existingUser || null,
      role: existingUser?.role || 'GENERAL_USER',
    });
  }

  return res.status(400).json({
    success: false,
    message: 'Invalid OTP',
  });
}

/**
 * Complete Profile / Final Registration
 */
export async function completeProfile(req, res) {
  try {
    const { phone, role, profileData } = req.body;
    const cleanPhone = cleanPhoneNumber(phone);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required.' });
    }

    const assignedRole = role === 'LOCAL_SHOP' ? 'LOCAL_SHOP' : 'GENERAL_USER';

    let userIndex = mockUsers.findIndex((u) => cleanPhoneNumber(u.phone) === cleanPhone);

    const baseProfile = {
      id: userIndex !== -1 ? mockUsers[userIndex].id : `u-${Date.now()}`,
      phone: cleanPhone,
      role: assignedRole,
      name: profileData?.name || (assignedRole === 'LOCAL_SHOP' ? profileData?.shopName : 'Green Loop User'),
      email: profileData?.email || '',
      city: profileData?.city || 'Chennai',
      area: profileData?.area || 'Guindy',
      greenCoins: userIndex !== -1 ? mockUsers[userIndex].greenCoins : 100, // 100 Welcome bonus!
      eco_points: userIndex !== -1 ? mockUsers[userIndex].eco_points : 100,
      level: 'Eco Beginner',
      avatar: profileData?.avatar || null,
      isVerified: true,
      isProfileComplete: true,
      preferences: {
        language: profileData?.language || 'EN',
        notifications: { email: true, sms: true },
      },
      roleProfile: assignedRole === 'LOCAL_SHOP' ? {
        shopName: profileData?.shopName || '',
        ownerName: profileData?.ownerName || '',
        category: profileData?.category || 'General Electronics',
        shopAddress: profileData?.shopAddress || '',
      } : {
        landmark: profileData?.landmark || '',
        coordinates: profileData?.coordinates || null,
      },
      joinedAt: new Date().toISOString(),
    };

    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...baseProfile };
    } else {
      mockUsers.push(baseProfile);
    }

    res.status(201).json({
      success: true,
      message: 'Account setup complete! Welcome to Green Loop.',
      user: baseProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Legacy Email/Password Register (Preserved for compatibility)
 */
export async function register(req, res) {
  try {
    const { name, email, phone, role, city } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and Email are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = cleanPhoneNumber(phone);

    const existing = mockUsers.find((u) => u.email === cleanEmail || (cleanPhone && cleanPhoneNumber(u.phone) === cleanPhone));
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name,
      email: cleanEmail,
      phone: cleanPhone || '9876543210',
      role: role || 'GENERAL_USER',
      city: city || 'Chennai',
      greenCoins: 100,
      eco_points: 100,
      level: 'Eco Beginner',
      isProfileComplete: true,
      impact_stats: { kgDiverted: 0, co2AvoidedKg: 0, itemsRecycled: 0, itemsSold: 0 },
    };
    mockUsers.push(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully with 100 Green Coins welcome bonus!',
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Legacy Email/Password Login (Preserved for compatibility)
 */
export async function login(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = mockUsers.find((u) => u.email === cleanEmail);

    if (!user) {
      user = {
        id: `u-${Date.now()}`,
        name: cleanEmail.split('@')[0] || 'Eco Champion',
        email: cleanEmail,
        phone: '9876543210',
        role: 'GENERAL_USER',
        city: 'Chennai',
        greenCoins: 100,
        eco_points: 100,
        level: 'Eco Beginner',
        isProfileComplete: true,
        impact_stats: { kgDiverted: 0, co2AvoidedKg: 0, itemsRecycled: 0, itemsSold: 0 },
      };
      mockUsers.push(user);
    }

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
