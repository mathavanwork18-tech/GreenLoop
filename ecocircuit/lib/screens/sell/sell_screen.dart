import 'dart:math';
import 'package:flutter/material.dart';
import '../../data/app_state.dart';
import '../../data/dummy_data.dart';
import '../../models/product.dart';
import '../../theme/app_theme.dart';

class SellScreen extends StatefulWidget {
  final VoidCallback? onListingCreated;

  const SellScreen({super.key, this.onListingCreated});

  @override
  State<SellScreen> createState() => _SellScreenState();
}

class _SellScreenState extends State<SellScreen> {
  int _currentStep = 0;
  final appState = AppState();

  // Form Fields
  String _selectedCategory = 'Laptops';
  final _titleController = TextEditingController();
  final _brandController = TextEditingController();
  final _modelController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _originalPriceController = TextEditingController();
  String _selectedLocation = 'Coimbatore, Tamil Nadu';
  String _selectedCondition = 'Used - Good';

  // Smart Assessment Answers
  bool _powersOn = true;
  bool _displayWorking = true;
  bool _batteryFunctional = true;
  bool _majorComponentsFunctional = true;
  bool _hasPhysicalDamage = false;

  // Selected Harvestable Parts
  final Set<String> _selectedParts = {'RAM', 'SSD', 'Original Charger'};

  final List<String> _availablePartOptions = [
    'RAM Module',
    'SSD / Storage',
    'Display Panel',
    'Keyboard & Trackpad',
    'Internal Battery',
    'Original Charger',
    'Motherboard',
    'Wi-Fi & Bluetooth Card',
    'Cooling Fan & Heat Pipe',
  ];

  final List<String> _locations = [
    'Coimbatore, Tamil Nadu',
    'Chennai, Tamil Nadu',
    'Madurai, Tamil Nadu',
    'Trichy, Tamil Nadu',
    'Salem, Tamil Nadu',
    'Bengaluru, Karnataka',
  ];

  String _calculateConditionSuggestion() {
    if (!_powersOn && !_displayWorking) return 'For Parts / Recycling';
    if (_powersOn && _displayWorking && !_hasPhysicalDamage) return 'Used - Good';
    if (_powersOn && (!_displayWorking || !_batteryFunctional || _hasPhysicalDamage)) return 'Partially Working';
    return 'For Parts';
  }

  void _publishListing() {
    final randId = 'EC-2026-${Random().nextInt(90000) + 10000}';
    final newProduct = Product(
      id: randId,
      title: _titleController.text.trim().isNotEmpty
          ? _titleController.text.trim()
          : '$_selectedCategory - ${_brandController.text} ${_modelController.text}',
      category: _selectedCategory,
      brand: _brandController.text.isNotEmpty ? _brandController.text : 'Custom',
      model: _modelController.text.isNotEmpty ? _modelController.text : 'Generic',
      condition: _selectedCondition,
      price: double.tryParse(_priceController.text) ?? 1500,
      originalPrice: double.tryParse(_originalPriceController.text),
      location: _selectedLocation,
      description: _descriptionController.text.isNotEmpty
          ? _descriptionController.text
          : 'Posted via EcoCircuit E-Waste marketplace for reuse and part harvesting.',
      images: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
      ],
      availableParts: _selectedParts.toList(),
      sellerName: 'Mathavan Kumar (You)',
      sellerRating: 5.0,
      sellerCompletedSales: 1,
      sellerMemberSince: 'Sep 2026',
      sellerVerified: true,
      postedDate: 'Just now',
      status: 'Active',
    );

    appState.addProduct(newProduct);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: AppTheme.primary, size: 28),
            SizedBox(width: 8),
            Text('Listing Published! 🎉'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Your product has been assigned Unique Product ID: $randId', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.primary.withAlpha(20),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Row(
                children: [
                  Icon(Icons.qr_code_2, size: 36, color: AppTheme.primary),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text('Digital QR Code generated for traceability & chain-of-custody recycling.', style: TextStyle(fontSize: 11)),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
            onPressed: () {
              Navigator.pop(context);
              widget.onListingCreated?.call();
            },
            child: const Text('View in My Listings'),
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
        title: const Text('Post E-Waste / Part', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 5) {
            setState(() => _currentStep += 1);
          } else {
            _publishListing();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep -= 1);
          }
        },
        controlsBuilder: (context, details) {
          return Padding(
            padding: const EdgeInsets.only(top: 20),
            child: Row(
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: details.onStepContinue,
                  child: Text(_currentStep == 5 ? 'Publish Listing' : 'Next Step', style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
                if (_currentStep > 0) ...[
                  const SizedBox(width: 12),
                  OutlinedButton(
                    onPressed: details.onStepCancel,
                    child: const Text('Back'),
                  ),
                ],
              ],
            ),
          );
        },
        steps: [
          // Step 1: Category & Basic Info
          Step(
            title: const Text('Category & Device'),
            isActive: _currentStep >= 0,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Select Category', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  initialValue: _selectedCategory,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  items: DummyData.categories.map((c) => DropdownMenuItem(value: c.name, child: Text(c.name))).toList(),
                  onChanged: (val) => setState(() => _selectedCategory = val ?? 'Laptops'),
                ),
                const SizedBox(height: 14),
                const Text('Product Title', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                TextField(
                  controller: _titleController,
                  decoration: InputDecoration(
                    hintText: 'e.g. Dell Inspiron Core i5 for parts / repair',
                    filled: true,
                    fillColor: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Brand', style: TextStyle(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _brandController,
                            decoration: InputDecoration(
                              hintText: 'e.g. Dell / Arduino',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Model Number', style: TextStyle(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _modelController,
                            decoration: InputDecoration(
                              hintText: 'e.g. Inspiron 3567',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Step 2: Smart Condition Assessment
          Step(
            title: const Text('Smart Condition Check'),
            isActive: _currentStep >= 1,
            content: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Answer diagnostic questions to determine condition:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    title: const Text('Does the device power ON?'),
                    value: _powersOn,
                    activeThumbColor: AppTheme.primary,
                    onChanged: (val) => setState(() => _powersOn = val),
                  ),
                  SwitchListTile(
                    title: const Text('Is the display / screen functional?'),
                    value: _displayWorking,
                    activeThumbColor: AppTheme.primary,
                    onChanged: (val) => setState(() => _displayWorking = val),
                  ),
                  SwitchListTile(
                    title: const Text('Is the battery holding charge?'),
                    value: _batteryFunctional,
                    activeThumbColor: AppTheme.primary,
                    onChanged: (val) => setState(() => _batteryFunctional = val),
                  ),
                  SwitchListTile(
                    title: const Text('Are internal components (RAM/Board) working?'),
                    value: _majorComponentsFunctional,
                    activeThumbColor: AppTheme.primary,
                    onChanged: (val) => setState(() => _majorComponentsFunctional = val),
                  ),
                  SwitchListTile(
                    title: const Text('Is there severe physical damage / crack?'),
                    value: _hasPhysicalDamage,
                    activeThumbColor: AppTheme.accentRed,
                    onChanged: (val) => setState(() => _hasPhysicalDamage = val),
                  ),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('AI Condition Suggestion:', style: TextStyle(fontWeight: FontWeight.bold)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withAlpha(30),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(_calculateConditionSuggestion(), style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Step 3: Harvestable Electronic Parts Tagging
          Step(
            title: const Text('Harvestable Parts Breakdown'),
            isActive: _currentStep >= 2,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Check the working components that buyers can harvest:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _availablePartOptions.map((part) {
                    final isChecked = _selectedParts.contains(part);
                    return FilterChip(
                      label: Text(part),
                      selected: isChecked,
                      selectedColor: AppTheme.primary,
                      labelStyle: TextStyle(color: isChecked ? Colors.white : theme.colorScheme.onSurface, fontSize: 12),
                      onSelected: (val) {
                        setState(() {
                          if (val) {
                            _selectedParts.add(part);
                          } else {
                            _selectedParts.remove(part);
                          }
                        });
                      },
                    );
                  }).toList(),
                ),
              ],
            ),
          ),

          // Step 4: Photos Simulator
          Step(
            title: const Text('Photos & Visuals'),
            isActive: _currentStep >= 3,
            content: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.primary, style: BorderStyle.solid),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Column(
                children: [
                  Icon(Icons.add_a_photo_outlined, size: 40, color: AppTheme.primary),
                  SizedBox(height: 8),
                  Text('1 Image Captured & Compressed (420 KB)', style: TextStyle(fontWeight: FontWeight.bold)),
                  Text('Front and ports visible. Compliant with safe listing standards.', style: TextStyle(fontSize: 11, color: Colors.grey)),
                ],
              ),
            ),
          ),

          // Step 5: Price & Location
          Step(
            title: const Text('Price & Location'),
            isActive: _currentStep >= 4,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Listing Price (₹)', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                TextField(
                  controller: _priceController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    hintText: 'e.g. 2500',
                    prefixText: '₹ ',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 14),
                const Text('Original Retail Price (Optional)', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                TextField(
                  controller: _originalPriceController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    hintText: 'e.g. 35000',
                    prefixText: '₹ ',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 14),
                const Text('Pickup City / Location', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  initialValue: _selectedLocation,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  items: _locations.map((l) => DropdownMenuItem(value: l, child: Text(l))).toList(),
                  onChanged: (val) => setState(() => _selectedLocation = val ?? 'Coimbatore, Tamil Nadu'),
                ),
              ],
            ),
          ),

          // Step 6: Review & Final Confirmation
          Step(
            title: const Text('Review & Publish'),
            isActive: _currentStep >= 5,
            content: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.primary),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Summary Preview:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 8),
                  Text('• Category: $_selectedCategory'),
                  Text('• Title: ${_titleController.text.isNotEmpty ? _titleController.text : "E-Waste Listing"}'),
                  Text('• Asking Price: ₹${_priceController.text.isNotEmpty ? _priceController.text : "1500"}'),
                  Text('• Location: $_selectedLocation'),
                  Text('• Harvestable Parts: ${_selectedParts.length} tagged'),
                  const SizedBox(height: 10),
                  const Text('🌿 Eco Impact: Listing this item will divert ~1.8 kg toxic e-waste from landfill.', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 11)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
