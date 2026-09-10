class Product {
  final String id;
  final String title;
  final String category;
  final String brand;
  final String model;
  final String condition;
  final double price;
  final double? originalPrice;
  final int quantity;
  final String location;
  final String description;
  final List<String> images;
  final List<String> availableParts;
  final List<String> availableFor;
  final Map<String, String> specifications;
  final String sellerName;
  final double sellerRating;
  final int sellerCompletedSales;
  final String sellerMemberSince;
  final bool sellerVerified;
  final bool isFavorite;
  final bool isFeatured;
  final String postedDate;
  final int viewsCount;
  final String status; // 'Active', 'Sold', 'Pending', 'Recycled'

  const Product({
    required this.id,
    required this.title,
    required this.category,
    required this.brand,
    required this.model,
    required this.condition,
    required this.price,
    this.originalPrice,
    this.quantity = 1,
    required this.location,
    required this.description,
    required this.images,
    this.availableParts = const [],
    this.availableFor = const ['Complete Product'],
    this.specifications = const {},
    required this.sellerName,
    this.sellerRating = 4.7,
    this.sellerCompletedSales = 18,
    this.sellerMemberSince = 'Jan 2024',
    this.sellerVerified = true,
    this.isFavorite = false,
    this.isFeatured = false,
    this.postedDate = 'Just now',
    this.viewsCount = 42,
    this.status = 'Active',
  });

  Product copyWith({
    String? id,
    String? title,
    String? category,
    String? brand,
    String? model,
    String? condition,
    double? price,
    double? originalPrice,
    int? quantity,
    String? location,
    String? description,
    List<String>? images,
    List<String>? availableParts,
    List<String>? availableFor,
    Map<String, String>? specifications,
    String? sellerName,
    double? sellerRating,
    int? sellerCompletedSales,
    String? sellerMemberSince,
    bool? sellerVerified,
    bool? isFavorite,
    bool? isFeatured,
    String? postedDate,
    int? viewsCount,
    String? status,
  }) {
    return Product(
      id: id ?? this.id,
      title: title ?? this.title,
      category: category ?? this.category,
      brand: brand ?? this.brand,
      model: model ?? this.model,
      condition: condition ?? this.condition,
      price: price ?? this.price,
      originalPrice: originalPrice ?? this.originalPrice,
      quantity: quantity ?? this.quantity,
      location: location ?? this.location,
      description: description ?? this.description,
      images: images ?? this.images,
      availableParts: availableParts ?? this.availableParts,
      availableFor: availableFor ?? this.availableFor,
      specifications: specifications ?? this.specifications,
      sellerName: sellerName ?? this.sellerName,
      sellerRating: sellerRating ?? this.sellerRating,
      sellerCompletedSales: sellerCompletedSales ?? this.sellerCompletedSales,
      sellerMemberSince: sellerMemberSince ?? this.sellerMemberSince,
      sellerVerified: sellerVerified ?? this.sellerVerified,
      isFavorite: isFavorite ?? this.isFavorite,
      isFeatured: isFeatured ?? this.isFeatured,
      postedDate: postedDate ?? this.postedDate,
      viewsCount: viewsCount ?? this.viewsCount,
      status: status ?? this.status,
    );
  }
}
