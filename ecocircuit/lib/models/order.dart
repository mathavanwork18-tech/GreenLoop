import 'product.dart';

class CartItem {
  final Product product;
  int quantity;

  CartItem({
    required this.product,
    this.quantity = 1,
  });

  double get totalPrice => product.price * quantity;
}

class DeliveryAddress {
  final String fullName;
  final String phone;
  final String addressLine;
  final String city;
  final String pincode;

  const DeliveryAddress({
    required this.fullName,
    required this.phone,
    required this.addressLine,
    required this.city,
    required this.pincode,
  });
}

class UserOrder {
  final String id;
  final List<CartItem> items;
  final DateTime orderDate;
  final double subtotal;
  final double deliveryCharge;
  final double totalAmount;
  final String status; // 'Order Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'
  final DeliveryAddress deliveryAddress;
  final String paymentMethod;

  const UserOrder({
    required this.id,
    required this.items,
    required this.orderDate,
    required this.subtotal,
    this.deliveryCharge = 49.0,
    required this.totalAmount,
    this.status = 'Order Placed',
    required this.deliveryAddress,
    this.paymentMethod = 'Cash on Delivery (Eco-Verified)',
  });
}
