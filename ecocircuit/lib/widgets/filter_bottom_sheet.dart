import 'package:flutter/material.dart';
import '../data/app_state.dart';
import '../data/dummy_data.dart';
import '../theme/app_theme.dart';

class FilterBottomSheet extends StatefulWidget {
  const FilterBottomSheet({super.key});

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  final appState = AppState();

  late String? _category;
  late String? _condition;
  late String? _location;
  late RangeValues _priceRange;
  late String _sortBy;

  final List<String> _conditions = [
    'All Conditions',
    'New',
    'Like New',
    'Used - Good',
    'Used - Fair',
    'Working',
    'Partially Working',
    'For Parts',
    'For Recycling',
  ];

  final List<String> _locations = [
    'All Locations',
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Trichy',
    'Salem',
    'Bengaluru',
  ];

  final List<String> _sortOptions = [
    'Relevance',
    'Price Low → High',
    'Price High → Low',
    'Newest',
    'Nearest',
    'Highest Rated',
  ];

  @override
  void initState() {
    super.initState();
    _category = appState.selectedCategory;
    _condition = appState.selectedCondition;
    _location = appState.selectedLocation;
    _priceRange = appState.priceRange;
    _sortBy = appState.sortBy;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Filters & Sorting',
                  style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _category = null;
                      _condition = null;
                      _location = null;
                      _priceRange = const RangeValues(0, 40000);
                      _sortBy = 'Relevance';
                    });
                  },
                  child: const Text('Reset All', style: TextStyle(color: AppTheme.accentRed)),
                ),
              ],
            ),
            const Divider(),
            const SizedBox(height: 12),

            // Sort By
            Text('Sort By', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _sortOptions.map((opt) {
                final isSelected = _sortBy == opt;
                return ChoiceChip(
                  label: Text(opt),
                  selected: isSelected,
                  selectedColor: AppTheme.primary,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 12,
                  ),
                  onSelected: (selected) {
                    if (selected) setState(() => _sortBy = opt);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // Category Filter
            Text('Category', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ChoiceChip(
                  label: const Text('All Categories'),
                  selected: _category == null,
                  selectedColor: AppTheme.primary,
                  labelStyle: TextStyle(
                    color: _category == null ? Colors.white : theme.colorScheme.onSurface,
                    fontSize: 12,
                  ),
                  onSelected: (selected) {
                    if (selected) setState(() => _category = null);
                  },
                ),
                ...DummyData.categories.map((c) {
                  final isSelected = _category == c.name;
                  return ChoiceChip(
                    label: Text(c.name),
                    selected: isSelected,
                    selectedColor: AppTheme.primary,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                      fontSize: 12,
                    ),
                    onSelected: (selected) {
                      setState(() => _category = selected ? c.name : null);
                    },
                  );
                }),
              ],
            ),
            const SizedBox(height: 16),

            // Price Range Slider
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Price Range', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
                Text(
                  '₹${_priceRange.start.round()} - ₹${_priceRange.end.round()}',
                  style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            RangeSlider(
              values: _priceRange,
              min: 0,
              max: 40000,
              divisions: 80,
              activeColor: AppTheme.primary,
              labels: RangeLabels(
                '₹${_priceRange.start.round()}',
                '₹${_priceRange.end.round()}',
              ),
              onChanged: (values) {
                setState(() => _priceRange = values);
              },
            ),
            const SizedBox(height: 12),

            // Condition Filter
            Text('Condition', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _conditions.map((cond) {
                final isSelected = (_condition == null && cond == 'All Conditions') || _condition == cond;
                return ChoiceChip(
                  label: Text(cond),
                  selected: isSelected,
                  selectedColor: AppTheme.primary,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                    fontSize: 12,
                  ),
                  onSelected: (selected) {
                    setState(() {
                      _condition = (cond == 'All Conditions') ? null : (selected ? cond : null);
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // Location Filter
            Text('Location', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _locations.map((loc) {
                final isSelected = (_location == null && loc == 'All Locations') || _location == loc;
                return ChoiceChip(
                  label: Text(loc),
                  selected: isSelected,
                  selectedColor: AppTheme.primary,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                    fontSize: 12,
                  ),
                  onSelected: (selected) {
                    setState(() {
                      _location = (loc == 'All Locations') ? null : (selected ? loc : null);
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // Apply CTA Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  appState.setCategoryFilter(_category);
                  appState.setConditionFilter(_condition);
                  appState.setLocationFilter(_location);
                  appState.setPriceRange(_priceRange);
                  appState.setSortBy(_sortBy);
                  Navigator.pop(context);
                },
                child: const Text('Apply Filters', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
