import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AppFooter extends StatelessWidget {
  final Function(int)? onNavigate;

  const AppFooter({super.key, this.onNavigate});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      color: isDark ? const Color(0xFF07110C) : const Color(0xFF0F172A),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.recycling, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'EcoCircuit',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    'Reuse Electronics. Reduce E-Waste.',
                    style: TextStyle(
                      color: Colors.white.withAlpha(180),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            'India’s premier circular economy marketplace connecting consumers, repair technicians, and TNPCB-authorized recyclers to give electronic products and harvestable components a second life.',
            style: TextStyle(
              color: Colors.white.withAlpha(180),
              fontSize: 13,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),
          const Divider(color: Colors.white24),
          const SizedBox(height: 16),
          Wrap(
            spacing: 24,
            runSpacing: 12,
            children: [
              _FooterLink('Marketplace', () => onNavigate?.call(1)),
              _FooterLink('Sell / Post', () => onNavigate?.call(2)),
              _FooterLink('Donations', () {}),
              _FooterLink('Certified Recycling', () {}),
              _FooterLink('Privacy Policy', () {}),
              _FooterLink('Terms of Service', () {}),
              _FooterLink('Support', () {}),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '© 2026 EcoCircuit. All rights reserved.',
                style: TextStyle(color: Colors.white.withAlpha(140), fontSize: 11),
              ),
              Row(
                children: [
                  const Icon(Icons.shield_outlined, color: AppTheme.primary, size: 14),
                  const SizedBox(width: 4),
                  Text(
                    'TNPCB Guidelines Compliant',
                    style: TextStyle(color: Colors.white.withAlpha(180), fontSize: 11),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _FooterLink extends StatelessWidget {
  final String title;
  final VoidCallback onTap;

  const _FooterLink(this.title, this.onTap);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Text(
        title,
        style: const TextStyle(
          color: Colors.white70,
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
