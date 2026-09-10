import 'package:flutter/material.dart';
import '../../data/app_state.dart';
import '../../data/dummy_data.dart';
import '../../theme/app_theme.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/filter_bottom_sheet.dart';
import '../../widgets/product_card.dart';
import '../../widgets/responsive_layout.dart';
import '../product/product_detail_screen.dart';
import '../search/search_screen.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  final appState = AppState();
  bool _isGridView = true;
  bool _isMapView = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedBuilder(
      animation: appState,
      builder: (context, _) {
        final products = appState.filteredProducts;
        final selectedCat = appState.selectedCategory;
        final selectedCond = appState.selectedCondition;
        final selectedLoc = appState.selectedLocation;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Marketplace & Parts', style: TextStyle(fontWeight: FontWeight.bold)),
            actions: [
              IconButton(
                icon: const Icon(Icons.search),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const SearchScreen()),
                  );
                },
              ),
              IconButton(
                icon: Icon(_isMapView ? Icons.grid_view : (_isGridView ? Icons.view_list : Icons.grid_view)),
                tooltip: _isMapView ? 'Grid View' : (_isGridView ? 'List View' : 'Grid View'),
                onPressed: () {
                  setState(() {
                    if (_isMapView) {
                      _isMapView = false;
                      _isGridView = true;
                    } else {
                      _isGridView = !_isGridView;
                    }
                  });
                },
              ),
              IconButton(
                icon: Icon(Icons.map_outlined, color: _isMapView ? AppTheme.primary : null),
                tooltip: 'Map View',
                onPressed: () {
                  setState(() => _isMapView = !_isMapView);
                },
              ),
              IconButton(
                icon: const Icon(Icons.tune),
                onPressed: () {
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
            ],
          ),
          body: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Category chips filter row
              SizedBox(
                height: 48,
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  scrollDirection: Axis.horizontal,
                  children: [
                    FilterChip(
                      label: const Text('All Products'),
                      selected: selectedCat == null,
                      selectedColor: AppTheme.primary,
                      labelStyle: TextStyle(
                        color: selectedCat == null ? Colors.white : theme.colorScheme.onSurface,
                        fontWeight: selectedCat == null ? FontWeight.bold : FontWeight.normal,
                        fontSize: 12,
                      ),
                      onSelected: (val) => appState.setCategoryFilter(null),
                    ),
                    const SizedBox(width: 8),
                    ...DummyData.categories.map((c) {
                      final isSelected = selectedCat == c.name;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          avatar: Icon(c.icon, size: 14, color: isSelected ? Colors.white : AppTheme.primary),
                          label: Text(c.name),
                          selected: isSelected,
                          selectedColor: AppTheme.primary,
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            fontSize: 12,
                          ),
                          onSelected: (val) {
                            appState.setCategoryFilter(val ? c.name : null);
                          },
                        ),
                      );
                    }),
                  ],
                ),
              ),

              // Active filter tags (if any)
              if (selectedCond != null || selectedLoc != null || appState.searchQuery.isNotEmpty) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  child: Row(
                    children: [
                      Text('Active Filters: ', style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: [
                              if (selectedCond != null)
                                Padding(
                                  padding: const EdgeInsets.only(right: 6),
                                  child: Chip(
                                    label: Text(selectedCond, style: const TextStyle(fontSize: 11)),
                                    deleteIcon: const Icon(Icons.close, size: 14),
                                    onDeleted: () => appState.setConditionFilter(null),
                                    visualDensity: VisualDensity.compact,
                                  ),
                                ),
                              if (selectedLoc != null)
                                Padding(
                                  padding: const EdgeInsets.only(right: 6),
                                  child: Chip(
                                    label: Text(selectedLoc, style: const TextStyle(fontSize: 11)),
                                    deleteIcon: const Icon(Icons.close, size: 14),
                                    onDeleted: () => appState.setLocationFilter(null),
                                    visualDensity: VisualDensity.compact,
                                  ),
                                ),
                              if (appState.searchQuery.isNotEmpty)
                                Chip(
                                  label: Text('"${appState.searchQuery}"', style: const TextStyle(fontSize: 11)),
                                  deleteIcon: const Icon(Icons.close, size: 14),
                                  onDeleted: () => appState.setSearchQuery(''),
                                  visualDensity: VisualDensity.compact,
                                ),
                            ],
                          ),
                        ),
                      ),
                      TextButton(
                        onPressed: () => appState.resetFilters(),
                        child: const Text('Clear', style: TextStyle(color: AppTheme.accentRed, fontSize: 12)),
                      ),
                    ],
                  ),
                ),
              ],

              // Results Count & Sort indicator
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${products.length} Products Available',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Row(
                      children: [
                        Text('Sort: ', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                        Text(
                          appState.sortBy,
                          style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Main Products Display / Map View
              Expanded(
                child: _isMapView
                    ? _buildMapView(context, products)
                    : products.isEmpty
                        ? EmptyStateWidget(
                            icon: Icons.inventory_2_outlined,
                            title: 'No Electronics Found',
                            description: 'No listings match your current filters. Try selecting "All Categories" or clearing the price slider.',
                            buttonText: 'Reset Filters',
                            onButtonPressed: () => appState.resetFilters(),
                          )
                        : _isGridView
                            ? GridView.builder(
                                padding: const EdgeInsets.all(16),
                                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: ResponsiveLayout.getGridColumnCount(context),
                                  crossAxisSpacing: 14,
                                  mainAxisSpacing: 14,
                                  childAspectRatio: 0.68,
                                ),
                                itemCount: products.length,
                                itemBuilder: (context, index) {
                                  final product = products[index];
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
                              )
                            : ListView.separated(
                                padding: const EdgeInsets.all(16),
                                itemCount: products.length,
                                separatorBuilder: (context, index) => const SizedBox(height: 12),
                                itemBuilder: (context, index) {
                                  final product = products[index];
                                  return ProductCard(
                                    product: product,
                                    isHorizontal: true,
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
          ),
        );
      },
    );
  }

  Widget _buildMapView(BuildContext context, List<dynamic> products) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      color: isDark ? const Color(0xFF0D1D16) : const Color(0xFFE2E8F0),
      child: Stack(
        children: [
          // Map Background Grid Simulator
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.map, size: 80, color: AppTheme.primary.withAlpha(100)),
                const SizedBox(height: 12),
                Text(
                  'Tamil Nadu Circular Electronics Map',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  'Showing ${products.length} electronics pins across Chennai, Coimbatore & Madurai',
                  style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                ),
              ],
            ),
          ),
          // Interactive Map Pins
          Positioned(
            top: 60,
            left: 50,
            child: _MapPinBadge('Dell Inspiron', '₹8,500', 'Chennai'),
          ),
          Positioned(
            top: 140,
            right: 60,
            child: _MapPinBadge('Arduino Uno R3', '₹450', 'Coimbatore'),
          ),
          Positioned(
            bottom: 180,
            left: 90,
            child: _MapPinBadge('8GB DDR4 RAM', '₹1,090', 'RS Puram'),
          ),
          Positioned(
            bottom: 120,
            right: 40,
            child: _MapPinBadge('EcoSafe Recyclers', '♻️ Dropoff', 'Gandhipuram'),
          ),
        ],
      ),
    );
  }
}

class _MapPinBadge extends StatelessWidget {
  final String title;
  final String price;
  final String location;

  const _MapPinBadge(this.title, this.price, this.location);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.primary,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 8, offset: Offset(0, 3))],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.location_on, color: Colors.white, size: 14),
          const SizedBox(width: 4),
          Text('$title • $price', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
        ],
      ),
    );
  }
}
