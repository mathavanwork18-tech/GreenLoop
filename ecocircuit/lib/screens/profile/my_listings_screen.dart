import 'package:flutter/material.dart';
import '../../data/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/product_card.dart';
import '../product/product_detail_screen.dart';

class MyListingsScreen extends StatefulWidget {
  const MyListingsScreen({super.key});

  @override
  State<MyListingsScreen> createState() => _MyListingsScreenState();
}

class _MyListingsScreenState extends State<MyListingsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final appState = AppState();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: appState,
      builder: (context, _) {
        final allListings = appState.userListings;
        final activeListings = allListings.where((p) => p.status == 'Active').toList();
        final soldListings = allListings.where((p) => p.status == 'Sold').toList();
        final recycledListings = allListings.where((p) => p.status == 'Recycled').toList();

        return Scaffold(
          appBar: AppBar(
            title: const Text('My E-Waste Listings 📦', style: TextStyle(fontWeight: FontWeight.bold)),
            bottom: TabBar(
              controller: _tabController,
              indicatorColor: AppTheme.primary,
              labelColor: AppTheme.primary,
              tabs: [
                Tab(text: 'All (${allListings.length})'),
                Tab(text: 'Active (${activeListings.length})'),
                Tab(text: 'Sold (${soldListings.length})'),
                Tab(text: 'Recycled (${recycledListings.length})'),
              ],
            ),
          ),
          body: TabBarView(
            controller: _tabController,
            children: [
              _buildListingsList(allListings),
              _buildListingsList(activeListings),
              _buildListingsList(soldListings),
              _buildListingsList(recycledListings),
            ],
          ),
        );
      },
    );
  }

  Widget _buildListingsList(List<dynamic> listings) {
    if (listings.isEmpty) {
      return const EmptyStateWidget(
        icon: Icons.inventory_2_outlined,
        title: 'No Listings in this category',
        description: 'Post unwanted electronics, old circuit boards, or hardware parts to give them a second life.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: listings.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final product = listings[index];
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
    );
  }
}
