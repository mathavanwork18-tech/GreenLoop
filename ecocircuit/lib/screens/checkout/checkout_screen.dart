import 'package:flutter/material.dart';
import '../../data/app_state.dart';
import '../../models/order.dart';
import '../../theme/app_theme.dart';
import '../orders/orders_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final appState = AppState();
  String _deliveryOption = 'Standard';
  String _paymentMethod = 'UPI';

  final _nameController = TextEditingController(text: 'Mathavan Kumar');
  final _phoneController = TextEditingController(text: '+91 98765 43210');
  final _addressController = TextEditingController(text: '42/B, Green Avenue, RS Puram');
  final _cityController = TextEditingController(text: 'Coimbatore');
  final _pincodeController = TextEditingController(text: '641002');

  void _placeOrder() {
    final order = appState.checkout(
      DeliveryAddress(
        fullName: _nameController.text,
        phone: _phoneController.text,
        addressLine: _addressController.text,
        city: _cityController.text,
        pincode: _pincodeController.text,
      ),
    );

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: AppTheme.primary, size: 28),
            SizedBox(width: 8),
            Text('Order Confirmed! 📦'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Order ID: ${order.id}', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Your reusable electronics order has been placed. You earned +150 EcoPoints for choosing circular reuse!'),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
            onPressed: () {
              Navigator.pop(context); // Dialog
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const OrdersScreen()),
              );
            },
            child: const Text('Track Order Status'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout & Delivery'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Delivery Address
            Text('Delivery Address', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: Column(
                children: [
                  TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _phoneController,
                    decoration: const InputDecoration(labelText: 'Phone Number', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _addressController,
                    decoration: const InputDecoration(labelText: 'Address Line', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _cityController,
                          decoration: const InputDecoration(labelText: 'City', border: OutlineInputBorder()),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _pincodeController,
                          decoration: const InputDecoration(labelText: 'Pincode', border: OutlineInputBorder()),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 2. Delivery Options
            Text('Delivery Speed', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            RadioGroup<String>(
              groupValue: _deliveryOption,
              onChanged: (val) => setState(() => _deliveryOption = val ?? 'Standard'),
              child: const Column(
                children: [
                  RadioListTile<String>(
                    title: Text('Standard Delivery (2-3 Days)'),
                    subtitle: Text('₹49 - Carbon-neutral eco delivery'),
                    value: 'Standard',
                  ),
                  RadioListTile<String>(
                    title: Text('Express Delivery (Next Day)'),
                    subtitle: Text('₹99 - Fast local courier'),
                    value: 'Express',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 3. Payment Method
            Text('Payment Method (Demo)', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: RadioGroup<String>(
                groupValue: _paymentMethod,
                onChanged: (val) {
                  if (val != null) {
                    setState(() => _paymentMethod = val);
                  }
                },
                child: const Column(
                  children: [
                    RadioListTile<String>(
                      title: Text('UPI (GPay / PhonePe / Paytm)'),
                      value: 'UPI',
                      activeColor: AppTheme.primary,
                    ),
                    RadioListTile<String>(
                      title: Text('Debit / Credit Card'),
                      value: 'Card',
                      activeColor: AppTheme.primary,
                    ),
                    RadioListTile<String>(
                      title: Text('Cash on Delivery (Verified)'),
                      value: 'COD',
                      activeColor: AppTheme.primary,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Order Placement Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: _placeOrder,
                child: const Text('Place Order & Earn EcoPoints', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
