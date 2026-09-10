import 'package:flutter/material.dart';
import '../../data/app_state.dart';
import '../../models/order.dart';
import '../../theme/app_theme.dart';
import '../../widgets/empty_state_widget.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppState();

    return AnimatedBuilder(
      animation: appState,
      builder: (context, _) {
        final orders = appState.orders;

        return Scaffold(
          appBar: AppBar(
            title: const Text('My Orders & Tracking'),
          ),
          body: orders.isEmpty
              ? EmptyStateWidget(
                  icon: Icons.local_shipping_outlined,
                  title: 'No Orders Yet',
                  description: 'When you purchase reusable electronics or components, your orders and tracking status will appear here.',
                  buttonText: 'Explore Marketplace',
                  onButtonPressed: () => Navigator.pop(context),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: orders.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final order = orders[index];
                    return _OrderCard(order: order);
                  },
                ),
        );
      },
    );
  }
}

class _OrderCard extends StatelessWidget {
  final UserOrder order;

  const _OrderCard({required this.order});

  int _getStatusStep(String status) {
    switch (status.toLowerCase()) {
      case 'placed':
        return 0;
      case 'confirmed':
        return 1;
      case 'packed':
        return 2;
      case 'shipped':
        return 3;
      case 'out for delivery':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 3;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final currentStep = _getStatusStep(order.status);

    final steps = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out', 'Delivered'];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  order.id,
                  style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold, color: AppTheme.primary),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withAlpha(isDark ? 50 : 25),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    order.status,
                    style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Visual Tracking Progress Bar
            Row(
              children: List.generate(steps.length, (idx) {
                final isDone = idx <= currentStep;
                return Expanded(
                  child: Row(
                    children: [
                      Container(
                        width: 16,
                        height: 16,
                        decoration: BoxDecoration(
                          color: isDone ? AppTheme.primary : (isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                          shape: BoxShape.circle,
                        ),
                        child: isDone ? const Icon(Icons.check, size: 10, color: Colors.white) : null,
                      ),
                      if (idx < steps.length - 1)
                        Expanded(
                          child: Container(
                            height: 3,
                            color: idx < currentStep ? AppTheme.primary : (isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                          ),
                        ),
                    ],
                  ),
                );
              }),
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: steps.map((s) => Text(s, style: const TextStyle(fontSize: 10, color: Colors.grey))).toList(),
            ),
            const Divider(height: 24),

            // Order Items
            ...order.items.map((item) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: Image.network(
                        item.product.images.first,
                        width: 44,
                        height: 44,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => const Icon(Icons.memory, size: 24),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.product.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          Text('Qty: ${item.quantity} • ₹${item.product.price.toStringAsFixed(0)}', style: theme.textTheme.bodySmall),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),

            const Divider(height: 20),

            // Delivery Details & Total
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Delivery to: ${order.deliveryAddress.city}', style: theme.textTheme.bodySmall),
                    Text('${order.deliveryAddress.fullName} (${order.deliveryAddress.pincode})', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                  ],
                ),
                Text(
                  '₹${order.totalAmount.toStringAsFixed(0)}',
                  style: theme.textTheme.titleMedium?.copyWith(color: AppTheme.primary, fontWeight: FontWeight.w900),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
