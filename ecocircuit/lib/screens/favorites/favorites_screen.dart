import 'package:flutter/material.dart';
import '../../data/app_state.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/product_card.dart';
import '../../widgets/responsive_layout.dart';
import '../product/product_detail_screen.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppState();

    return AnimatedBuilder(
      animation: appState,
      builder: (context, _) {
        final favorites = appState.favorites;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Saved & Wishlist ❤️', style: TextStyle(fontWeight: FontWeight.bold)),
            actions: [
              if (favorites.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.notifications_active_outlined),
                  tooltip: 'Price Drop Alerts Active',
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('🔔 Price Drop Alerts are active for all saved items.')),
                    );
                  },
                ),
            ],
          ),
          body: favorites.isEmpty
              ? EmptyStateWidget(
                  icon: Icons.favorite_border,
                  title: 'No Saved Products Yet',
                  description: 'Tap the heart icon on any electronic item, circuit board, or component to save it here and receive price drop alerts.',
                  buttonText: 'Discover Products',
                  onButtonPressed: () => Navigator.pop(context),
                )
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: ResponsiveLayout.getGridColumnCount(context),
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 14,
                    childAspectRatio: 0.68,
                  ),
                  itemCount: favorites.length,
                  itemBuilder: (context, index) {
                    final product = favorites[index];
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
        );
      },
    );
  }
}
