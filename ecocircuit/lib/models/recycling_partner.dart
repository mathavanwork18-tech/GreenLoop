class RecyclingPartner {
  final String id;
  final String name;
  final String location;
  final double distanceKm;
  final double rating;
  final int reviewsCount;
  final List<String> acceptedMaterials;
  final String contactPhone;
  final bool offersPickup;
  final bool isVerified;
  final String tnpcbRegNo;

  const RecyclingPartner({
    required this.id,
    required this.name,
    required this.location,
    required this.distanceKm,
    required this.rating,
    required this.reviewsCount,
    required this.acceptedMaterials,
    required this.contactPhone,
    this.offersPickup = true,
    this.isVerified = true,
    required this.tnpcbRegNo,
  });
}
