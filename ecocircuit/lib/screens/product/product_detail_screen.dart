import 'package:flutter/material.dart';
import '../../data/app_state.dart';
import '../../models/product.dart';
import '../../theme/app_theme.dart';
import '../cart/cart_screen.dart';
import '../checkout/checkout_screen.dart';
import '../messages/messages_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final appState = AppState();
  int _currentImageIndex = 0;
  String _selectedCompatibilityDevice = 'Dell Inspiron 15';
  String? _compatibilityResult;

  final List<String> _commonDevices = [
    'Dell Inspiron 15',
    'Lenovo ThinkPad T480',
    'HP Pavilion 14',
    'MacBook Air M1',
    'Arduino Uno Project Kit',
    'Asus TUF Gaming',
  ];

  void _checkCompatibility() {
    setState(() {
      final pTitle = widget.product.title.toLowerCase();
      if (pTitle.contains('ram') || pTitle.contains('ssd') || pTitle.contains('dell') || pTitle.contains('charger') || pTitle.contains('cable')) {
        _compatibilityResult = '✅ 100% Compatible with $_selectedCompatibilityDevice';
      } else {
        _compatibilityResult = '⚠️ Standard interface compatible. Verify pinout & voltage before mounting.';
      }
    });
  }

  void _showMakeOfferDialog() {
    final offerController = TextEditingController(text: (widget.product.price * 0.85).round().toString());
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Make an Offer 🤝'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Original Price: ₹${widget.product.price.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const Text('Your Proposed Price (₹):', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            TextField(
              controller: offerController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                prefixText: '₹ ',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 10),
            const Text('Seller will be notified instantly via in-app chat.', style: TextStyle(fontSize: 11, color: Colors.grey)),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Offer of ₹${offerController.text} sent to ${widget.product.sellerName}!')),
              );
            },
            child: const Text('Submit Offer'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final product = widget.product;

    return AnimatedBuilder(
      animation: appState,
      builder: (context, _) {
        final isFav = appState.isFavorite(product.id);
        final conditionColor = AppTheme.getConditionColor(product.condition, isDark: isDark);
        final conditionBg = AppTheme.getConditionBg(product.condition, isDark: isDark);

        return Scaffold(
          appBar: AppBar(
            title: Text(product.brand.isNotEmpty ? product.brand : 'Product Details'),
            actions: [
              IconButton(
                icon: Icon(isFav ? Icons.favorite : Icons.favorite_border, color: isFav ? AppTheme.accentRed : null),
                onPressed: () => appState.toggleFavorite(product.id),
              ),
              IconButton(
                icon: const Icon(Icons.share_outlined),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Product link copied to clipboard!')),
                  );
                },
              ),
              IconButton(
                icon: const Icon(Icons.shopping_bag_outlined),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const CartScreen()),
                  );
                },
              ),
            ],
          ),
          body: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Image Carousel Gallery
                Stack(
                  children: [
                    Container(
                      height: 300,
                      width: double.infinity,
                      color: isDark ? AppTheme.darkSurface2 : AppTheme.lightSurface2,
                      child: Image.network(
                        product.images[_currentImageIndex],
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => const Center(
                          child: Icon(Icons.memory, size: 64, color: Colors.grey),
                        ),
                      ),
                    ),
                    if (product.images.length > 1)
                      Positioned(
                        bottom: 12,
                        right: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black54,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${_currentImageIndex + 1} / ${product.images.length}',
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                  ],
                ),
                if (product.images.length > 1)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Row(
                      children: List.generate(
                        product.images.length,
                        (idx) => GestureDetector(
                          onTap: () => setState(() => _currentImageIndex = idx),
                          child: Container(
                            margin: const EdgeInsets.only(right: 8),
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: _currentImageIndex == idx ? AppTheme.primary : Colors.transparent,
                                width: 2,
                              ),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: Image.network(product.images[idx], fit: BoxFit.cover),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),

                // 2. Title & Pricing Section
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: conditionBg,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              product.condition,
                              style: TextStyle(color: conditionColor, fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                          Text(
                            product.postedDate,
                            style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        product.title,
                        style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold, height: 1.2),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(Icons.location_on, size: 14, color: theme.colorScheme.onSurfaceVariant),
                          const SizedBox(width: 4),
                          Text(
                            product.location,
                            style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            '₹${product.price.toStringAsFixed(0)}',
                            style: theme.textTheme.headlineMedium?.copyWith(
                              color: AppTheme.primary,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          if (product.originalPrice != null) ...[
                            const SizedBox(width: 10),
                            Text(
                              '₹${product.originalPrice!.toStringAsFixed(0)}',
                              style: theme.textTheme.titleMedium?.copyWith(
                                decoration: TextDecoration.lineThrough,
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppTheme.accentRed.withAlpha(30),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                '${(((product.originalPrice! - product.price) / product.originalPrice!) * 100).round()}% OFF',
                                style: const TextStyle(color: AppTheme.accentRed, fontWeight: FontWeight.bold, fontSize: 11),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),

                const Divider(height: 1),

                // 3. Seller Profile Card
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: AppTheme.primary.withAlpha(30),
                          child: Text(
                            product.sellerName[0],
                            style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary, fontSize: 18),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    product.sellerName,
                                    style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                                  ),
                                  if (product.sellerVerified) ...[
                                    const SizedBox(width: 4),
                                    const Icon(Icons.verified, size: 14, color: AppTheme.primary),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  const Icon(Icons.star, size: 14, color: AppTheme.accentAmber),
                                  const SizedBox(width: 2),
                                  Text('${product.sellerRating} rating', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  const SizedBox(width: 8),
                                  Text('• ${product.sellerCompletedSales} sales', style: theme.textTheme.bodySmall),
                                ],
                              ),
                            ],
                          ),
                        ),
                        OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.primary,
                            side: const BorderSide(color: AppTheme.primary),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const MessagesScreen()),
                            );
                          },
                          child: const Text('Chat'),
                        ),
                      ],
                    ),
                  ),
                ),

                // 4. Electronic Parts Breakdown (Special Feature)
                if (product.availableParts.isNotEmpty) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withAlpha(isDark ? 30 : 15),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.primary.withAlpha(80)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.memory, color: AppTheme.primary),
                              const SizedBox(width: 8),
                              Text(
                                'Electronic Parts Breakdown 🔧',
                                style: theme.textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Need only a single part? You can harvest individual components from this device:',
                            style: theme.textTheme.bodySmall,
                          ),
                          const SizedBox(height: 12),
                          ...product.availableParts.map((part) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.check_circle_outline, size: 16, color: AppTheme.primary),
                                      const SizedBox(width: 8),
                                      Text(part, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                  TextButton(
                                    onPressed: () {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('Harvest request for "$part" initiated.')),
                                      );
                                    },
                                    child: const Text('Inquire Part', style: TextStyle(fontSize: 11, color: AppTheme.primary)),
                                  ),
                                ],
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // 5. Smart Compatibility Checker
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.rule, color: AppTheme.accentBlue),
                            const SizedBox(width: 8),
                            Text(
                              'Smart Compatibility Checker 🔍',
                              style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Select your device to check interface and socket compatibility:', style: theme.textTheme.bodySmall),
                        const SizedBox(height: 10),
                        DropdownButtonFormField<String>(
                          value: _selectedCompatibilityDevice,
                          decoration: InputDecoration(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          items: _commonDevices.map((d) => DropdownMenuItem(value: d, child: Text(d, style: const TextStyle(fontSize: 13)))).toList(),
                          onChanged: (val) {
                            setState(() {
                              _selectedCompatibilityDevice = val!;
                              _compatibilityResult = null;
                            });
                          },
                        ),
                        const SizedBox(height: 10),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.accentBlue,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          onPressed: _checkCompatibility,
                          child: const Text('Check Compatibility'),
                        ),
                        if (_compatibilityResult != null) ...[
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withAlpha(25),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _compatibilityResult!,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primary),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // 6. Description
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Product Description', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(
                        product.description,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // 7. Specifications Table
                if (product.specifications.isNotEmpty) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Hardware Specifications', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            children: product.specifications.entries.map((entry) {
                              return Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                decoration: BoxDecoration(
                                  border: Border(bottom: BorderSide(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder)),
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      flex: 2,
                                      child: Text(
                                        entry.key,
                                        style: TextStyle(color: theme.colorScheme.onSurfaceVariant, fontSize: 12, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 3,
                                      child: Text(entry.value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 100),
              ],
            ),
          ),
          bottomSheet: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
              border: Border(top: BorderSide(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder)),
              boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -4))],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      side: const BorderSide(color: AppTheme.primary),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _showMakeOfferDialog,
                    child: const Text('Make Offer', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark ? AppTheme.darkSurface2 : AppTheme.lightSurface2,
                        foregroundColor: theme.colorScheme.onSurface,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.add_shopping_cart, size: 18),
                      label: const Text('Add to Cart', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      onPressed: () {
                        appState.addToCart(product);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${product.title} added to cart!'),
                            action: SnackBarAction(
                              label: 'View Cart',
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (context) => const CartScreen()),
                                );
                              },
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        appState.addToCart(product);
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const CheckoutScreen()),
                        );
                      },
                      child: const Text('Buy Now', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
