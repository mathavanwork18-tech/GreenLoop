import 'package:flutter/material.dart';
import '../models/order.dart';
import '../models/product.dart';
import '../models/user.dart';
import 'dummy_data.dart';

class AppState extends ChangeNotifier {
  static final AppState _instance = AppState._internal();
  factory AppState() => _instance;

  AppState._internal() {
    _products = List.from(DummyData.initialProducts);
    _userListings = _products.where((p) => p.sellerName.contains('Mathavan') || p.id == 'p1' || p.id == 'p2').toList();
    _favoriteIds = {'p1', 'p2', 'p4', 'p9'};
    
    // Sample existing orders for demonstration
    _orders = [
      UserOrder(
        id: 'ECO-ORD-8821',
        items: [
          CartItem(product: _products[2], quantity: 1), // Kingston RAM
          CartItem(product: _products[18], quantity: 1), // HDMI-VGA cable
        ],
        orderDate: DateTime.now().subtract(const Duration(days: 2)),
        subtotal: 1090.0,
        deliveryCharge: 49.0,
        totalAmount: 1139.0,
        status: 'Delivered',
        deliveryAddress: const DeliveryAddress(
          fullName: 'Mathavan Kumar',
          phone: '+91 98765 43210',
          addressLine: '42/B, Green Avenue, RS Puram',
          city: 'Coimbatore',
          pincode: '641002',
        ),
      ),
      UserOrder(
        id: 'ECO-ORD-9104',
        items: [
          CartItem(product: _products[1], quantity: 2), // Arduino Uno
        ],
        orderDate: DateTime.now().subtract(const Duration(hours: 8)),
        subtotal: 900.0,
        deliveryCharge: 49.0,
        totalAmount: 949.0,
        status: 'Shipped',
        deliveryAddress: const DeliveryAddress(
          fullName: 'Mathavan Kumar',
          phone: '+91 98765 43210',
          addressLine: '42/B, Green Avenue, RS Puram',
          city: 'Coimbatore',
          pincode: '641002',
        ),
      ),
    ];
  }

  AppUser _user = DummyData.currentUser;
  AppUser get user => _user;

  List<Product> _products = [];
  List<Product> get products => _products;

  List<Product> _userListings = [];
  List<Product> get userListings => _userListings;

  final List<CartItem> _cart = [];
  List<CartItem> get cart => List.unmodifiable(_cart);

  Set<String> _favoriteIds = {};
  Set<String> get favoriteIds => Set.unmodifiable(_favoriteIds);

  List<UserOrder> _orders = [];
  List<UserOrder> get orders => List.unmodifiable(_orders);

  ThemeMode _themeMode = ThemeMode.system;
  ThemeMode get themeMode => _themeMode;

  void setThemeMode(ThemeMode mode) {
    _themeMode = mode;
    notifyListeners();
  }

  // Filter & Search states
  String _searchQuery = '';
  String get searchQuery => _searchQuery;

  String? _selectedCategory;
  String? get selectedCategory => _selectedCategory;

  String? _selectedCondition;
  String? get selectedCondition => _selectedCondition;

  String? _selectedLocation;
  String? get selectedLocation => _selectedLocation;

  RangeValues _priceRange = const RangeValues(0, 40000);
  RangeValues get priceRange => _priceRange;

  String _sortBy = 'Relevance';
  String get sortBy => _sortBy;

  // Cart Calculations
  double get cartSubtotal => _cart.fold(0, (sum, item) => sum + item.totalPrice);
  double get deliveryFee => _cart.isEmpty ? 0 : 49.0;
  double get cartTotal => _cart.isEmpty ? 0 : cartSubtotal + deliveryFee;
  int get cartCount => _cart.fold(0, (count, item) => count + item.quantity);

  // Favorites
  List<Product> get favoriteProducts => _products.where((p) => _favoriteIds.contains(p.id)).toList();
  List<Product> get favorites => favoriteProducts;

  bool isFavorite(String productId) => _favoriteIds.contains(productId);

  void toggleFavorite(String productId) {
    if (_favoriteIds.contains(productId)) {
      _favoriteIds.remove(productId);
    } else {
      _favoriteIds.add(productId);
    }
    notifyListeners();
  }

  // Cart Actions
  void addToCart(Product product, {int quantity = 1}) {
    final index = _cart.indexWhere((item) => item.product.id == product.id);
    if (index >= 0) {
      _cart[index].quantity += quantity;
    } else {
      _cart.add(CartItem(product: product, quantity: quantity));
    }
    notifyListeners();
  }

  void removeFromCart(String productId) {
    _cart.removeWhere((item) => item.product.id == productId);
    notifyListeners();
  }

  void updateCartQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    final index = _cart.indexWhere((item) => item.product.id == productId);
    if (index >= 0) {
      _cart[index].quantity = quantity;
      notifyListeners();
    }
  }

  void clearCart() {
    _cart.clear();
    notifyListeners();
  }

  // Listings Management
  void addProductListing(Product product) {
    _products.insert(0, product);
    _userListings.insert(0, product);
    // Award 50 Green points for contributing
    _user = _user.copyWith(
      greenPoints: _user.greenPoints + 50,
      recycledDevices: _user.recycledDevices + 1,
    );
    notifyListeners();
  }

  void addProduct(Product product) => addProductListing(product);

  void updateProductListing(Product updated) {
    final idx = _products.indexWhere((p) => p.id == updated.id);
    if (idx >= 0) _products[idx] = updated;
    final uIdx = _userListings.indexWhere((p) => p.id == updated.id);
    if (uIdx >= 0) _userListings[uIdx] = updated;
    notifyListeners();
  }

  void deleteProductListing(String productId) {
    _products.removeWhere((p) => p.id == productId);
    _userListings.removeWhere((p) => p.id == productId);
    _favoriteIds.remove(productId);
    _cart.removeWhere((item) => item.product.id == productId);
    notifyListeners();
  }

  // Order Placement
  UserOrder placeOrder({
    required DeliveryAddress address,
    String paymentMethod = 'Cash on Delivery (Eco-Verified)',
  }) {
    final newOrder = UserOrder(
      id: 'ECO-ORD-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      items: List.from(_cart),
      orderDate: DateTime.now(),
      subtotal: cartSubtotal,
      deliveryCharge: deliveryFee,
      totalAmount: cartTotal,
      status: 'Order Placed',
      deliveryAddress: address,
      paymentMethod: paymentMethod,
    );

    _orders.insert(0, newOrder);
    _cart.clear();
    _user = _user.copyWith(greenPoints: _user.greenPoints + 25);
    notifyListeners();
    return newOrder;
  }

  UserOrder checkout(DeliveryAddress address, {String paymentMethod = 'Cash on Delivery (Eco-Verified)'}) {
    return placeOrder(address: address, paymentMethod: paymentMethod);
  }

  // Filter setters
  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setCategoryFilter(String? category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setConditionFilter(String? condition) {
    _selectedCondition = condition;
    notifyListeners();
  }

  void setLocationFilter(String? location) {
    _selectedLocation = location;
    notifyListeners();
  }

  void setPriceRangeFilter(RangeValues range) {
    _priceRange = range;
    notifyListeners();
  }

  void setPriceRange(RangeValues range) => setPriceRangeFilter(range);

  void setSortBy(String sort) {
    _sortBy = sort;
    notifyListeners();
  }

  void resetFilters() {
    _searchQuery = '';
    _selectedCategory = null;
    _selectedCondition = null;
    _selectedLocation = null;
    _priceRange = const RangeValues(0, 40000);
    _sortBy = 'Relevance';
    notifyListeners();
  }

  // Filtered Products computation
  List<Product> get filteredProducts {
    List<Product> list = _products.where((p) {
      // Search query
      if (_searchQuery.trim().isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final matchTitle = p.title.toLowerCase().contains(query);
        final matchCategory = p.category.toLowerCase().contains(query);
        final matchBrand = p.brand.toLowerCase().contains(query);
        final matchParts = p.availableParts.any((part) => part.toLowerCase().contains(query));
        if (!matchTitle && !matchCategory && !matchBrand && !matchParts) {
          return false;
        }
      }

      // Category
      if (_selectedCategory != null && _selectedCategory!.isNotEmpty) {
        if (p.category.toLowerCase() != _selectedCategory!.toLowerCase()) {
          return false;
        }
      }

      // Condition
      if (_selectedCondition != null && _selectedCondition!.isNotEmpty) {
        if (p.condition.toLowerCase() != _selectedCondition!.toLowerCase()) {
          return false;
        }
      }

      // Location
      if (_selectedLocation != null && _selectedLocation!.isNotEmpty) {
        if (!p.location.toLowerCase().contains(_selectedLocation!.toLowerCase())) {
          return false;
        }
      }

      // Price Range
      if (p.price < _priceRange.start || p.price > _priceRange.end) {
        return false;
      }

      return true;
    }).toList();

    // Sorting
    switch (_sortBy) {
      case 'Price: Low to High':
        list.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'Price: High to Low':
        list.sort((a, b) => b.price.compareTo(a.price));
        break;
      case 'Newest':
        list.sort((a, b) => b.postedDate.compareTo(a.postedDate));
        break;
      case 'Nearest':
        list.sort((a, b) => a.location.compareTo(b.location));
        break;
      default:
        // Relevance: featured first
        list.sort((a, b) => (b.isFeatured ? 1 : 0).compareTo(a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }
}
