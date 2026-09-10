import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class DonationsScreen extends StatefulWidget {
  const DonationsScreen({super.key});

  @override
  State<DonationsScreen> createState() => _DonationsScreenState();
}

class _DonationsScreenState extends State<DonationsScreen> {
  final _deviceController = TextEditingController();
  final _notesController = TextEditingController();
  String _targetBeneficiary = 'Government School Students (TN)';

  final List<String> _beneficiaries = [
    'Government School Students (TN)',
    'Rural Community Digital Labs',
    'Robotics & STEM Clubs',
    'Local NGO Learning Hubs',
  ];

  final List<Map<String, dynamic>> _activeDrives = [
    {
      'title': '50 Laptops for Coimbatore STEM Lab',
      'organization': 'Tamil Nadu Digital Education Trust',
      'needed': 50,
      'collected': 34,
      'location': 'Coimbatore',
    },
    {
      'title': 'Old Working Android Phones for Online Learning',
      'organization': 'Palam Children Foundation',
      'needed': 30,
      'collected': 22,
      'location': 'Chennai',
    },
  ];

  void _submitDonation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.volunteer_activism, color: AppTheme.accentBlue, size: 28),
            SizedBox(width: 8),
            Text('Donation Pledged! 🤝'),
          ],
        ),
        content: const Text(
          'Thank you for contributing to circular electronics! A volunteer from the selected educational trust will contact you for pickup. You earned +300 EcoPoints!',
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Return to Home'),
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
        title: const Text('Donate Electronics 🤝', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Empower Students with Reused Tech 💻',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Donate working or repairable laptops, tablets, and phones to underprivileged students and rural learning centers.',
                    style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Active Community Drives
            Text('Active Educational Drives', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ..._activeDrives.map((drive) {
              final progress = drive['collected'] / drive['needed'];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(drive['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 4),
                      Text('By: ${drive['organization']} (${drive['location']})', style: theme.textTheme.bodySmall),
                      const SizedBox(height: 10),
                      LinearProgressIndicator(
                        value: progress,
                        backgroundColor: isDark ? AppTheme.darkSurface2 : AppTheme.lightSurface2,
                        valueColor: const AlwaysStoppedAnimation(AppTheme.primary),
                        borderRadius: BorderRadius.circular(4),
                        minHeight: 8,
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${drive['collected']} of ${drive['needed']} collected', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          Text('${(progress * 100).round()}% Completed', style: const TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),

            const SizedBox(height: 24),

            // Direct Donation Form
            Text('Pledge a Device', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
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
                  const Text('Device Details', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _deviceController,
                    decoration: const InputDecoration(
                      hintText: 'e.g. Working Lenovo Thinkpad / Samsung Tablet',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text('Select Beneficiary Program', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: _targetBeneficiary,
                    decoration: const InputDecoration(border: OutlineInputBorder()),
                    items: _beneficiaries.map((b) => DropdownMenuItem(value: b, child: Text(b, style: const TextStyle(fontSize: 13)))).toList(),
                    onChanged: (val) => setState(() => _targetBeneficiary = val!),
                  ),
                  const SizedBox(height: 14),
                  const Text('Notes / Condition of Charger', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _notesController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      hintText: 'Includes working charger and clean OS install.',
                      border: OutlineInputBorder(),
                    ),
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
                      icon: const Icon(Icons.volunteer_activism),
                      label: const Text('Pledge Device Donation', style: TextStyle(fontWeight: FontWeight.bold)),
                      onPressed: _submitDonation,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
