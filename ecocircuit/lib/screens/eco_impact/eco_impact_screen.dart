import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class EcoImpactScreen extends StatelessWidget {
  const EcoImpactScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sustainability & Eco Impact 🌿', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Eco Hero Level Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isDark
                      ? [AppTheme.forestDark, const Color(0xFF04261B)]
                      : [AppTheme.primary, const Color(0xFF047857)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  const Icon(Icons.shield_outlined, color: Colors.white, size: 48),
                  const SizedBox(height: 12),
                  const Text(
                    'Level 3: Eco Champion 🌿',
                    style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '1,250 EcoPoints • Top 5% Recycler in Coimbatore',
                    style: TextStyle(color: Colors.white.withAlpha(200), fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  LinearProgressIndicator(
                    value: 0.62,
                    backgroundColor: Colors.white24,
                    valueColor: const AlwaysStoppedAnimation(Colors.white),
                    borderRadius: BorderRadius.circular(4),
                    minHeight: 8,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('1,250 Pts', style: TextStyle(color: Colors.white.withAlpha(180), fontSize: 10)),
                      Text('Next: Sustainability Hero (2,000 Pts)', style: TextStyle(color: Colors.white.withAlpha(180), fontSize: 10)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 4 Key Impact Metrics
            Text('Your Cumulative Impact', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.35,
              children: const [
                _MetricCard(title: 'Electronics Reused', value: '12 Items', subtitle: 'Laptops, Mobiles, RAM', icon: Icons.repeat, color: AppTheme.primary),
                _MetricCard(title: 'Parts Salvaged', value: '28 Parts', subtitle: 'Displays, ICs, Cables', icon: Icons.memory, color: AppTheme.accentAmber),
                _MetricCard(title: 'E-Waste Diverted', value: '18.5 kg', subtitle: 'Kept away from landfills', icon: Icons.delete_sweep, color: AppTheme.accentBlue),
                _MetricCard(title: 'CO₂ Footprint Saved', value: '42.0 kg', subtitle: 'Equivalent to 3 trees planted', icon: Icons.forest, color: Color(0xFF10B981)),
              ],
            ),
            const SizedBox(height: 28),

            // Material Recovery Breakdown
            Text('Raw Materials Recovered', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: const Column(
                children: [
                  _MaterialProgressRow('Copper & Precious Metals', '420 grams', 0.85, Color(0xFFB45309)),
                  SizedBox(height: 12),
                  _MaterialProgressRow('Aluminum Alloys', '2.8 kg', 0.65, Color(0xFF64748B)),
                  SizedBox(height: 12),
                  _MaterialProgressRow('Lithium & Battery Salts Neutralized', '1.1 kg', 0.90, AppTheme.accentRed),
                  SizedBox(height: 12),
                  _MaterialProgressRow('Silicon Semiconductor Grade', '140 grams', 0.40, AppTheme.accentBlue),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: theme.textTheme.bodySmall?.copyWith(fontSize: 11)),
              Icon(icon, size: 18, color: color),
            ],
          ),
          Text(value, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: color)),
          Text(subtitle, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        ],
      ),
    );
  }
}

class _MaterialProgressRow extends StatelessWidget {
  final String name;
  final String quantity;
  final double fraction;
  final Color color;

  const _MaterialProgressRow(this.name, this.quantity, this.fraction, this.color);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
            Text(quantity, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: color)),
          ],
        ),
        const SizedBox(height: 6),
        LinearProgressIndicator(
          value: fraction,
          backgroundColor: color.withAlpha(30),
          valueColor: AlwaysStoppedAnimation(color),
          borderRadius: BorderRadius.circular(4),
          minHeight: 6,
        ),
      ],
    );
  }
}
