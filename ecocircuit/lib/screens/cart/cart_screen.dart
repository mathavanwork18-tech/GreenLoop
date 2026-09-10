import 'package:flutter/material.dart';
import '../../data/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/empty_state_widget.dart';
import '../checkout/checkout_screen.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final appState = AppState();

    return AnimatedBuilder(
      animation: appState,
      builder: (context, _) {
        final cart = appState.cart;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Shopping Cart'),
            actions: [
              if (cart.isNotEmpty)
                TextButton(
                  onPressed: () => appState.clearCart(),
                  child: const Text('Clear', style: TextStyle(color: AppTheme.accentRed)),
                ),
            ],
          ),
          body: cart.isEmpty
              ? EmptyStateWidget(
                  icon: Icons.shopping_bag_outlined,
                  title: 'Your Cart is Empty',
                  description: 'Explore reused electronics, hardware boards, and spare components in the marketplace.',
                  buttonText: 'Explore Marketplace',
                  onButtonPressed: () => Navigator.pop(context),
                )
              : Column(
                  children: [
                    Expanded(
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: cart.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final item = cart[index];
                          return Card(
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Image.network(
                                      item.product.images.first,
                                      width: 80,
                                      height: 80,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) => const Icon(Icons.memory, size: 40),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item.product.title,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Seller: ${item.product.sellerName}',
                                          style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          '₹${item.product.price.toStringAsFixed(0)}',
                                          style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.remove_circle_outline, size: 20),
                                        onPressed: () => appState.updateCartQuantity(item.product.id, item.quantity - 1),
                                      ),
                                      Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                      IconButton(
                                        icon: const Icon(Icons.add_circle_outline, size: 20),
                                        onPressed: () => appState.updateCartQuantity(item.product.id, item.quantity + 1),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    // Price Summary Bottom Box
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                        border: Border(top: BorderSide(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder)),
                        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -4))],
                      ),
                      child: SafeArea(
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Subtotal:'),
                                Text('₹${appState.cartSubtotal.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Standard Delivery:'),
                                Text('₹${appState.deliveryFee.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const Divider(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Total Amount:', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                                Text(
                                  '₹${appState.cartTotal.toStringAsFixed(0)}',
                                  style: theme.textTheme.titleLarge?.copyWith(color: AppTheme.primary, fontWeight: FontWeight.w900),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              height: 50,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.primary,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (context) => const CheckoutScreen()),
                                  );
                                },
                                child: const Text('Proceed to Checkout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
        );
      },
    );
  }
}
