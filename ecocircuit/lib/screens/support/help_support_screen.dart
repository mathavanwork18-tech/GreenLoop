import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Help & Trust Safety Center 🛡️', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Trust & Battery Safety Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF065F46), Color(0xFF047857)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.shield, color: Colors.white, size: 24),
                      SizedBox(width: 8),
                      Text(
                        'Trust & Safety Principles',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    '1. Always wipe personal data and sign out of Google/Apple ID before selling.\n'
                    '2. Never puncture, crush, or throw swollen lithium batteries in trash bins.\n'
                    '3. Only deal with verified recyclers carrying valid TNPCB credentials.',
                    style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.5),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Expandable FAQ Cards
            Text('Frequently Asked Questions', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _FaqCard(
              question: 'How do I harvest or buy individual parts from a laptop?',
              answer: 'Open any device detail page and inspect the "Electronic Parts Breakdown" section. You can check individual working components (e.g. RAM stick, SSD, charger) and message the seller or add to cart.',
            ),
            _FaqCard(
              question: 'How are EcoPoints calculated and redeemed?',
              answer: 'You earn 150 EcoPoints for verified listings, 300 EcoPoints for educational tech donations, and 150 EcoPoints for certified doorstep recycling pickups. Points unlock higher tier badges and partner discount vouchers.',
            ),
            _FaqCard(
              question: 'What happens to damaged or unusable electronics?',
              answer: 'Items tagged "For Recycling" are collected by TNPCB-authorized refiners who safely neutralize lithium batteries and recover precious metals like copper, gold, and aluminum without toxic fumes.',
            ),
            _FaqCard(
              question: 'How does the Smart Compatibility Checker work?',
              answer: 'The compatibility engine matches hardware interfaces (e.g. DDR4 SO-DIMM RAM, SATA SSD, standard 19.5V barrel charger) with your target laptop or microcontroller model to prevent buying incompatible parts.',
            ),
            const SizedBox(height: 28),

            // Contact Support CTA
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Need Technical Help or Dispute Resolution?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 6),
                  Text('Our sustainability support desk is active Mon-Sat 9AM-7PM IST.', style: theme.textTheme.bodySmall),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.headset_mic),
                          label: const Text('Contact Desk'),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Support ticket created: #SUP-4102. An agent will reply shortly.')),
                            );
                          },
                        ),
                      ),
                    ],
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

class _FaqCard extends StatelessWidget {
  final String question;
  final String answer;

  const _FaqCard({required this.question, required this.answer});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ExpansionTile(
        title: Text(question, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Text(
              answer,
              style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant, fontSize: 12, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}
