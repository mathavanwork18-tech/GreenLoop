class AppUser {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String location;
  final String? avatarUrl;
  final double rating;
  final int completedSales;
  final int recycledDevices;
  final String memberSince;
  final bool isVerified;
  final int greenPoints;

  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.location,
    this.avatarUrl,
    this.rating = 4.8,
    this.completedSales = 14,
    this.recycledDevices = 8,
    this.memberSince = 'Jan 2024',
    this.isVerified = true,
    this.greenPoints = 850,
  });

  AppUser copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? location,
    String? avatarUrl,
    double? rating,
    int? completedSales,
    int? recycledDevices,
    String? memberSince,
    bool? isVerified,
    int? greenPoints,
  }) {
    return AppUser(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      location: location ?? this.location,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      rating: rating ?? this.rating,
      completedSales: completedSales ?? this.completedSales,
      recycledDevices: recycledDevices ?? this.recycledDevices,
      memberSince: memberSince ?? this.memberSince,
      isVerified: isVerified ?? this.isVerified,
      greenPoints: greenPoints ?? this.greenPoints,
    );
  }
}
