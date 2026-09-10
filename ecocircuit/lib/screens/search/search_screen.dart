import 'package:flutter/material.dart';
import '../../data/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/custom_search_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/filter_bottom_sheet.dart';
import '../../widgets/product_card.dart';
import '../../widgets/responsive_layout.dart';
import '../product/product_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  final String? initialQuery;

  const SearchScreen({super.key, this.initialQuery});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();
  final appState = AppState();
  String _currentQuery = '';

  final List<String> _recentSearches = [
    '8GB DDR4 RAM',
    'Arduino Uno',
    'Dell charger 65W',
    'Raspberry Pi 4',
    'Lithium 18650 battery',
  ];

  final List<String> _popularTags = [
    'RAM',
    'SSD',
    'Display',
    'Motherboard',
    'Sensors',
    'Arduino',
    'Charger',
    'Power Supply',
    'IC 555',
    'Recycling Dropoff',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialQuery != null) {
      _searchController.text = widget.initialQuery!;
      _currentQuery = widget.initialQuery!;
      appState.setSearchQuery(widget.initialQuery!);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsets.only(right: 16),
          child: CustomSearchBar(
            controller: _searchController,
            hintText: 'Search RAM, Arduino, SSD, Laptops...',
            onChanged: (val) {
              setState(() => _currentQuery = val);
              appState.setSearchQuery(val);
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
      ),
      body: AnimatedBuilder(
        animation: appState,
        builder: (context, _) {
          final results = appState.filteredProducts;

          if (_currentQuery.isEmpty) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Recent Searches
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Recent Searches', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      const Icon(Icons.history, size: 18, color: AppTheme.primary),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _recentSearches.map((tag) {
                      return ActionChip(
                        avatar: const Icon(Icons.history, size: 14),
                        label: Text(tag),
                        onPressed: () {
                          _searchController.text = tag;
                          setState(() => _currentQuery = tag);
                          appState.setSearchQuery(tag);
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 28),

                  // Popular Searches
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Trending Components & Parts 🔥', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      const Icon(Icons.trending_up, size: 18, color: AppTheme.accentAmber),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _popularTags.map((tag) {
                      return ActionChip(
                        avatar: const Icon(Icons.memory, size: 14, color: AppTheme.primary),
                        label: Text(tag),
                        backgroundColor: isDark ? AppTheme.darkSurface2 : AppTheme.lightSurface2,
                        onPressed: () {
                          _searchController.text = tag;
                          setState(() => _currentQuery = tag);
                          appState.setSearchQuery(tag);
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 32),

                  // Quick Component Category Discovery
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withAlpha(isDark ? 40 : 20),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.primary.withAlpha(60)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.tips_and_updates_outlined, color: AppTheme.primary, size: 28),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Hardware Part Harvesting Tip',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Looking for a replacement screen or battery? You can filter devices tagged "For Parts" to buy individual components at 70% lower cost.',
                                style: theme.textTheme.bodySmall?.copyWith(fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }

          if (results.isEmpty) {
            return EmptyStateWidget(
              icon: Icons.search_off,
              title: 'No Matching Hardware Found',
              description: 'Try searching with broader terms (e.g. "RAM", "Battery", "Laptop") or adjust your active filters.',
              buttonText: 'Reset Filters',
              onButtonPressed: () {
                appState.resetFilters();
                _searchController.clear();
                setState(() => _currentQuery = '');
              },
            );
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${results.length} results found for "$_currentQuery"',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    InkWell(
                      onTap: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          builder: (context) => const FilterBottomSheet(),
                        );
                      },
                      child: const Row(
                        children: [
                          Icon(Icons.tune, size: 16, color: AppTheme.primary),
                          SizedBox(width: 4),
                          Text('Filters', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(20),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: ResponsiveLayout.getGridColumnCount(context),
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 14,
                    childAspectRatio: 0.68,
                  ),
                  itemCount: results.length,
                  itemBuilder: (context, index) {
                    final product = results[index];
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
            ],
          );
        },
      ),
    );
  }
}
