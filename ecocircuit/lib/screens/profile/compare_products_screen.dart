import 'package:flutter/material.dart';
import '../../data/dummy_data.dart';
import '../../models/product.dart';
import '../../theme/app_theme.dart';

class CompareProductsScreen extends StatefulWidget {
  const CompareProductsScreen({super.key});

  @override
  State<CompareProductsScreen> createState() => _CompareProductsScreenState();
}

class _CompareProductsScreenState extends State<CompareProductsScreen> {
  late Product _p1;
  late Product _p2;

  @override
  void initState() {
    super.initState();
    _p1 = DummyData.initialProducts[0]; // Dell Laptop
    _p2 = DummyData.initialProducts[3]; // HP EliteBook or laptop
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final all = DummyData.initialProducts;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Compare Hardware Specs ⚖️', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Selectors
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: _p1.id,
                    isExpanded: true,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    items: all.map((p) => DropdownMenuItem(value: p.id, child: Text(p.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12)))).toList(),
                    onChanged: (id) {
                      setState(() => _p1 = all.firstWhere((p) => p.id == id));
                    },
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8),
                  child: Text('VS', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary)),
                ),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: _p2.id,
                    isExpanded: true,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    items: all.map((p) => DropdownMenuItem(value: p.id, child: Text(p.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12)))).toList(),
                    onChanged: (id) {
                      setState(() => _p2 = all.firstWhere((p) => p.id == id));
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Comparison Table
            Container(
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: Column(
                children: [
                  _CompRow('Price', '₹${_p1.price.toStringAsFixed(0)}', '₹${_p2.price.toStringAsFixed(0)}', isHighlight: true),
                  _CompRow('Condition', _p1.condition, _p2.condition),
                  _CompRow('Category', _p1.category, _p2.category),
                  _CompRow('Location', _p1.location, _p2.location),
                  _CompRow('Seller Rating', '${_p1.sellerRating} ⭐', '${_p2.sellerRating} ⭐'),
                  _CompRow('Harvestable Parts', '${_p1.availableParts.length} tagged', '${_p2.availableParts.length} tagged'),
                  _CompRow('Seller Name', _p1.sellerName, _p2.sellerName),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _CompRow(String label, String val1, String val2, {bool isHighlight = false}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder)),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
          ),
          Expanded(
            flex: 3,
            child: Text(
              val1,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isHighlight ? AppTheme.primary : null),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              val2,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isHighlight ? AppTheme.primary : null),
            ),
          ),
        ],
      ),
    );
  }
}
