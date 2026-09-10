import 'package:flutter/material.dart';
import '../../data/app_state.dart';
import '../../theme/app_theme.dart';
import '../orders/orders_screen.dart';
import '../favorites/favorites_screen.dart';
import '../messages/messages_screen.dart';
import '../donations/donations_screen.dart';
import '../recycling/recycling_screen.dart';
import '../eco_impact/eco_impact_screen.dart';
import '../settings/settings_screen.dart';
import '../support/help_support_screen.dart';
import 'my_listings_screen.dart';
import 'compare_products_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final appState = AppState();

    return AnimatedBuilder(
      animation: appState,
      builder: (context, _) {
        final user = appState.user;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Account & Eco Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
            actions: [
              IconButton(
                icon: const Icon(Icons.settings_outlined),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const SettingsScreen()),
                  );
                },
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                // User Profile Summary Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 32,
                            backgroundColor: AppTheme.primary,
                            child: Text(
                              user.name[0],
                              style: const TextStyle(fontSize: 26, color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      user.name,
                                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.verified, size: 16, color: AppTheme.primary),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(user.email, style: theme.textTheme.bodySmall),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.location_on, size: 12, color: AppTheme.primary),
                                    const SizedBox(width: 2),
                                    Text(user.location, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _ProfileStat('1,250', 'EcoPoints', AppTheme.primary),
                          _ProfileStat('${user.completedSales}', 'Sales', AppTheme.accentAmber),
                          _ProfileStat('${user.recycledDevices}', 'Recycled', AppTheme.accentBlue),
                          _ProfileStat('4.9 ⭐', 'Rating', const Color(0xFF10B981)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Navigation Menu Items
                _MenuItem(
                  icon: Icons.inventory_2_outlined,
                  title: 'My E-Waste Listings',
                  subtitle: '${appState.userListings.length} Active / Pending',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const MyListingsScreen()),
                    );
                  },
                ),
                _MenuItem(
                  icon: Icons.local_shipping_outlined,
                  title: 'My Orders & Deliveries',
                  subtitle: '${appState.orders.length} Orders in Timeline',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const OrdersScreen()),
                    );
                  },
                ),
                _MenuItem(
                  icon: Icons.favorite_border,
                  title: 'Wishlist & Price Alerts',
                  subtitle: '${appState.favoriteIds.length} Saved items',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const FavoritesScreen()),
                    );
                  },
                ),
                _MenuItem(
                  icon: Icons.chat_outlined,
                  title: 'Messages & Counter Offers',
                  subtitle: 'Inquiries & Negotiated Prices',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const MessagesScreen()),
                    );
                  },
                ),
                _MenuItem(
                  icon: Icons.volunteer_activism_outlined,
                  title: 'Donation Pledges',
                  subtitle: 'Tech for Underprivileged Students',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const DonationsScreen()),
                    );
                  },
                ),
                _MenuItem(
                  icon: Icons.recycling,
                  title: 'Doorstep Recycling Requests',
                  subtitle: 'TNPCB Certified Neutralization',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const RecyclingScreen()),
                    );
                  },
                ),
                _MenuItem(
                  icon: Icons.eco_outlined,
                  title: 'Sustainability & Eco Impact',
                  subtitle: '18.5 kg Diverted • Rank: Eco Champion',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const EcoImpactScreen()),
                    );
                  },
                ),
                _MenuItem(
                  icon: Icons.compare_arrows,
                  title: 'Compare Hardware Specs',
                  subtitle: 'Side-by-side device matrix',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const CompareProductsScreen()),
                    );
                  },
                ),
                _MenuItem(
                  icon: Icons.help_outline,
                  title: 'Help & Trust Safety Center',
                  subtitle: 'Battery disposal guides & FAQs',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const HelpSupportScreen()),
                    );
                  },
                ),
                _MenuItem(
                  icon: Icons.settings_outlined,
                  title: 'Settings & Appearance',
                  subtitle: 'Dark / Light mode, Notifications',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const SettingsScreen()),
                    );
                  },
                ),
                const SizedBox(height: 24),

                // Logout Button
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.accentRed,
                      side: const BorderSide(color: AppTheme.accentRed),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.logout, size: 18),
                    label: const Text('Sign Out of EcoCircuit'),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Logged out of demo session.')),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _ProfileStat extends StatelessWidget {
  final String value;
  final String label;
  final Color color;

  const _ProfileStat(this.value, this.label, this.color);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.primary.withAlpha(isDark ? 40 : 25),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppTheme.primary, size: 20),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: theme.textTheme.bodySmall?.copyWith(fontSize: 11)),
        trailing: const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
        onTap: onTap,
      ),
    );
  }
}
