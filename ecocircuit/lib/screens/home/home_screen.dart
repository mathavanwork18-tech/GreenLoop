import 'package:flutter/material.dart';
import '../../data/app_state.dart';
import '../../data/dummy_data.dart';
import '../../theme/app_theme.dart';
import '../../widgets/category_card.dart';
import '../../widgets/custom_search_bar.dart';
import '../../widgets/eco_impact_card.dart';
import '../../widgets/filter_bottom_sheet.dart';
import '../../widgets/product_card.dart';
import '../../widgets/responsive_layout.dart';
import '../../widgets/app_footer.dart';
import '../product/product_detail_screen.dart';
import '../search/search_screen.dart';
import '../donations/donations_screen.dart';
import '../recycling/recycling_screen.dart';

class HomeScreen extends StatelessWidget {
  final Function(int) onNavigateTab;

  const HomeScreen({super.key, required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final appState = AppState();

    return AnimatedBuilder(
      animation: appState,
      builder: (context, _) {
        final products = appState.products;
        final featuredProducts = products.where((p) => p.isFeatured).toList();
        final nearbyProducts = products.where((p) => p.location.contains('Coimbatore') || p.location.contains('Chennai')).take(6).toList();
        final componentProducts = products.where((p) => p.category == 'Components' || p.category == 'Circuit Boards' || p.availableParts.isNotEmpty).take(6).toList();

        return Scaffold(
          body: SafeArea(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Header
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppTheme.primary,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.recycling, color: Colors.white, size: 24),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Hello, Mathavan 👋',
                                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                Row(
                                  children: [
                                    const Icon(Icons.location_on, size: 12, color: AppTheme.primary),
                                    const SizedBox(width: 2),
                                    Text(
                                      'RS Puram, Coimbatore',
                                      style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            // EcoPoints Pill
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: isDark ? AppTheme.darkSurface2 : AppTheme.lightSurface2,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: AppTheme.primary.withAlpha(60)),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.stars, color: AppTheme.accentAmber, size: 16),
                                  SizedBox(width: 4),
                                  Text(
                                    '1,250 Pts',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primary),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            // Notifications
                            IconButton(
                              icon: const Icon(Icons.notifications_outlined),
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('No new notifications right now.')),
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // 2. Search Bar
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    child: CustomSearchBar(
                      readOnly: true,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const SearchScreen()),
                        );
                      },
                      onFilterTap: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          shape: const RoundedRectangleBorder(
                            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                          ),
                          builder: (context) => const FilterBottomSheet(),
                        );
                      },
                    ),
                  ),

                  // 3. Hero Banner
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: isDark
                              ? [const Color(0xFF0F3827), const Color(0xFF062417)]
                              : [AppTheme.primary, const Color(0xFF059669)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary.withAlpha(isDark ? 30 : 60),
                            blurRadius: 16,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withAlpha(40),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              '⚡ Circular Electronics Marketplace',
                              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'Turn Old Electronics\nInto New Possibilities.',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              height: 1.2,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Sell, reuse, repair and recycle electronics responsibly. Harvest parts instead of landfill disposal.',
                            style: TextStyle(color: Colors.white.withAlpha(220), fontSize: 13, height: 1.4),
                          ),
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white,
                                  foregroundColor: AppTheme.forestDark,
                                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                onPressed: () => onNavigateTab(1), // Marketplace
                                child: const Text('Explore Products', style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                              const SizedBox(width: 12),
                              OutlinedButton(
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.white,
                                  side: const BorderSide(color: Colors.white, width: 1.5),
                                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                onPressed: () => onNavigateTab(2), // Post E-Waste
                                child: const Text('Post E-Waste', style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // 4. Quick Actions
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _QuickActionItem(
                          icon: Icons.add_circle,
                          label: 'Sell E-Waste',
                          color: AppTheme.primary,
                          onTap: () => onNavigateTab(2),
                        ),
                        _QuickActionItem(
                          icon: Icons.memory,
                          label: 'Find Parts',
                          color: AppTheme.accentAmber,
                          onTap: () {
                            appState.setCategoryFilter('Components');
                            onNavigateTab(1);
                          },
                        ),
                        _QuickActionItem(
                          icon: Icons.volunteer_activism,
                          label: 'Donate',
                          color: AppTheme.accentBlue,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const DonationsScreen()),
                            );
                          },
                        ),
                        _QuickActionItem(
                          icon: Icons.recycling,
                          label: 'Recycle',
                          color: const Color(0xFF10B981),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const RecyclingScreen()),
                            );
                          },
                        ),
                        _QuickActionItem(
                          icon: Icons.swap_horiz,
                          label: 'Exchange',
                          color: AppTheme.accentPurple,
                          onTap: () => onNavigateTab(1),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // 5. Categories Carousel
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Explore Categories', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                        TextButton(
                          onPressed: () => onNavigateTab(1),
                          child: const Text('View All', style: TextStyle(color: AppTheme.primary)),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 104,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      scrollDirection: Axis.horizontal,
                      itemCount: DummyData.categories.length,
                      separatorBuilder: (context, index) => const SizedBox(width: 12),
                      itemBuilder: (context, index) {
                        final cat = DummyData.categories[index];
                        return CategoryCard(
                          category: cat,
                          isSelected: appState.selectedCategory == cat.name,
                          onTap: () {
                            appState.setCategoryFilter(cat.name);
                            onNavigateTab(1);
                          },
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 6. Sustainability / Eco Impact Card
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    child: EcoImpactSummaryCard(
                      onTap: () => onNavigateTab(4), // Profile / Impact
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 7. Nearby Electronics & Parts
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.near_me, size: 18, color: AppTheme.primary),
                            const SizedBox(width: 6),
                            Text('Nearby in Tamil Nadu', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                          ],
                        ),
                        TextButton(
                          onPressed: () => onNavigateTab(1),
                          child: const Text('See More', style: TextStyle(color: AppTheme.primary)),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 275,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      scrollDirection: Axis.horizontal,
                      itemCount: nearbyProducts.length,
                      separatorBuilder: (context, index) => const SizedBox(width: 14),
                      itemBuilder: (context, index) {
                        final product = nearbyProducts[index];
                        return SizedBox(
                          width: 200,
                          child: ProductCard(
                            product: product,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => ProductDetailScreen(product: product)),
                              );
                            },
                          ),
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 20),

                  // 8. Electronic Components & Spare Parts
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.memory, size: 18, color: AppTheme.accentAmber),
                            const SizedBox(width: 6),
                            Text('Harvestable Parts & ICs', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                          ],
                        ),
                        TextButton(
                          onPressed: () {
                            appState.setCategoryFilter('Components');
                            onNavigateTab(1);
                          },
                          child: const Text('All Parts', style: TextStyle(color: AppTheme.primary)),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 275,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      scrollDirection: Axis.horizontal,
                      itemCount: componentProducts.length,
                      separatorBuilder: (context, index) => const SizedBox(width: 14),
                      itemBuilder: (context, index) {
                        final product = componentProducts[index];
                        return SizedBox(
                          width: 200,
                          child: ProductCard(
                            product: product,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => ProductDetailScreen(product: product)),
                              );
                            },
                          ),
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 24),

                  // 9. Featured & Verified Listings Grid
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Featured Verified Products', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                        TextButton(
                          onPressed: () => onNavigateTab(1),
                          child: const Text('View Grid', style: TextStyle(color: AppTheme.primary)),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: ResponsiveLayout.getGridColumnCount(context),
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                        childAspectRatio: 0.68,
                      ),
                      itemCount: featuredProducts.take(4).length,
                      itemBuilder: (context, index) {
                        final product = featuredProducts[index];
                        return ProductCard(
                          product: product,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => ProductDetailScreen(product: product)),
                            );
                          },
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 32),

                  // 10. How EcoCircuit Works
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'How EcoCircuit Works 🔄',
                            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Four simple steps to transform e-waste into circular value.',
                            style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                          ),
                          const SizedBox(height: 20),
                          const _HowItWorksStep(
                            step: '01',
                            title: 'Post E-Waste / Parts',
                            description: 'List unwanted devices, salvageable components, or dead hardware with smart condition assessment.',
                            icon: Icons.post_add,
                          ),
                          const SizedBox(height: 16),
                          const _HowItWorksStep(
                            step: '02',
                            title: 'Discover & Negotiate',
                            description: 'Find compatible spare parts, buy reused gadgets, or chat with verified local sellers.',
                            icon: Icons.search,
                          ),
                          const SizedBox(height: 16),
                          const _HowItWorksStep(
                            step: '03',
                            title: 'Reuse & Repair',
                            description: 'Harvest working ICs, displays, and RAM rather than discarding functioning electronics.',
                            icon: Icons.build_circle,
                          ),
                          const SizedBox(height: 16),
                          const _HowItWorksStep(
                            step: '04',
                            title: 'Certified Recycling & Points',
                            description: 'Send hazardous batteries and dead boards to TNPCB recyclers and earn EcoPoints rewards.',
                            icon: Icons.eco,
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // 11. Footer
                  AppFooter(onNavigate: onNavigateTab),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _QuickActionItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionItem({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withAlpha(isDark ? 40 : 25),
                shape: BoxShape.circle,
                border: Border.all(color: color.withAlpha(60)),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HowItWorksStep extends StatelessWidget {
  final String step;
  final String title;
  final String description;
  final IconData icon;

  const _HowItWorksStep({
    required this.step,
    required this.title,
    required this.description,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppTheme.primary.withAlpha(30),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            step,
            style: const TextStyle(
              color: AppTheme.primary,
              fontWeight: FontWeight.w900,
              fontSize: 14,
            ),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
