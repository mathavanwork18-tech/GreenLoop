import 'package:flutter/material.dart';
import '../../models/recycling_partner.dart';
import '../../theme/app_theme.dart';

class RecyclingScreen extends StatefulWidget {
  const RecyclingScreen({super.key});

  @override
  State<RecyclingScreen> createState() => _RecyclingScreenState();
}

class _RecyclingScreenState extends State<RecyclingScreen> {
  final _quantityController = TextEditingController(text: '3 items (~4.5 kg)');
  String _selectedMaterial = 'Lithium Batteries & Circuit Boards';
  final _pickupDateController = TextEditingController(text: 'Tomorrow, 10:00 AM - 1:00 PM');

  final List<String> _materialOptions = [
    'Lithium Batteries & Swollen Packs (Hazardous)',
    'Dead Circuit Boards & Motherboards',
    'Old CRT / Broken TV Displays',
    'Mixed Cables, Adapters & Small Appliances',
    'Bulk Corporate IT E-Waste',
  ];

  final List<RecyclingPartner> _partners = const [
    RecyclingPartner(
      id: 'rp1',
      name: 'EcoSafe Recyclers Tamil Nadu',
      location: 'Peelamedu, Coimbatore',
      distanceKm: 3.2,
      rating: 4.9,
      reviewsCount: 142,
      acceptedMaterials: ['Batteries', 'Motherboards', 'Displays', 'Copper/Gold Recovery'],
      contactPhone: '+91 422 258 9100',
      tnpcbRegNo: 'TNPCB/E-WASTE/CBE-0492',
    ),
    RecyclingPartner(
      id: 'rp2',
      name: 'GreenCycle Clean Tech Pvt Ltd',
      location: 'Guindy Industrial Estate, Chennai',
      distanceKm: 8.5,
      rating: 4.8,
      reviewsCount: 210,
      acceptedMaterials: ['Lithium-Ion', 'Solar Inverters', 'Server Boards', 'Telecom Gear'],
      contactPhone: '+91 44 2250 8899',
      tnpcbRegNo: 'TNPCB/E-WASTE/CHN-0118',
    ),
    RecyclingPartner(
      id: 'rp3',
      name: 'Kongu E-Waste Refiners',
      location: 'Salem Bypass, Erode',
      distanceKm: 45.0,
      rating: 4.7,
      reviewsCount: 88,
      acceptedMaterials: ['Industrial Boards', 'Transformers', 'Telecom Panels'],
      contactPhone: '+91 424 221 4400',
      tnpcbRegNo: 'TNPCB/E-WASTE/ERD-0074',
    ),
  ];

  void _requestPickup() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.recycling, color: AppTheme.primary, size: 28),
            SizedBox(width: 8),
            Text('Pickup Scheduled! 🚚'),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Your TNPCB-certified recycling pickup request #RC-9921 has been registered.', style: TextStyle(fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('A logistics executive with safe fireproof containers will arrive during your scheduled window. You will receive an Official Digital Destruction Certificate after recovery.'),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Done'),
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
        title: const Text('Certified E-Waste Recycling ♻️', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Safety Notification
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.accentAmber.withAlpha(isDark ? 40 : 20),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.accentAmber.withAlpha(100)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: AppTheme.accentAmber, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Battery Safety Alert', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.accentAmber)),
                        SizedBox(height: 2),
                        Text(
                          'Never dispose of swollen lithium batteries in domestic waste. Request free certified neutralization below.',
                          style: TextStyle(fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Doorstep Pickup Request Form
            Text('Request Doorstep E-Waste Pickup', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Select Material Type', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedMaterial,
                    isExpanded: true,
                    decoration: const InputDecoration(border: OutlineInputBorder()),
                    items: _materialOptions.map((m) => DropdownMenuItem(value: m, child: Text(m, style: const TextStyle(fontSize: 12)))).toList(),
                    onChanged: (val) => setState(() => _selectedMaterial = val!),
                  ),
                  const SizedBox(height: 14),
                  const Text('Estimated Quantity / Weight', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _quantityController,
                    decoration: const InputDecoration(border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 14),
                  const Text('Preferred Pickup Time Window', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _pickupDateController,
                    decoration: const InputDecoration(border: OutlineInputBorder(), prefixIcon: Icon(Icons.schedule)),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.local_shipping),
                      label: const Text('Schedule Doorstep Pickup (+150 Pts)', style: TextStyle(fontWeight: FontWeight.bold)),
                      onPressed: _requestPickup,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Verified TNPCB Partner Centers
            Text('TNPCB Authorized Recyclers', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ..._partners.map((p) {
              return Card(
                margin: const EdgeInsets.only(bottom: 14),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withAlpha(isDark ? 50 : 25),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.star, size: 12, color: AppTheme.accentAmber),
                                const SizedBox(width: 2),
                                Text('${p.rating}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 13, color: AppTheme.primary),
                          const SizedBox(width: 4),
                          Text('${p.location} • ${p.distanceKm} km away', style: theme.textTheme.bodySmall),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('Reg: ${p.tnpcbRegNo}', style: const TextStyle(fontSize: 10, color: Colors.grey, fontFamily: 'monospace')),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: p.acceptedMaterials.map((m) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isDark ? AppTheme.darkSurface2 : AppTheme.lightSurface2,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(m, style: const TextStyle(fontSize: 10)),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(p.contactPhone, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                          OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppTheme.primary,
                              side: const BorderSide(color: AppTheme.primary),
                              visualDensity: VisualDensity.compact,
                            ),
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Calling ${p.name} at ${p.contactPhone}...')),
                              );
                            },
                            child: const Text('Contact Center'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
