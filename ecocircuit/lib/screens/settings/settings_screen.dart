import 'package:flutter/material.dart';
import '../../data/app_state.dart';
import '../../theme/app_theme.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final appState = AppState();

  bool _notifyOrders = true;
  bool _notifyMessages = true;
  bool _notifyPriceDrops = true;
  bool _notifyRecycling = true;
  bool _publicProfile = true;
  bool _preciseLocation = true;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AnimatedBuilder(
      animation: appState,
      builder: (context, _) {
        final currentThemeMode = appState.themeMode;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Settings & Preferences ⚙️', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Appearance / Theme System
                Text('Appearance & Theme', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                  ),
                  child: Column(
                    children: [
                      RadioListTile<ThemeMode>(
                        title: const Row(
                          children: [
                            Text('☀️ Light Mode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            SizedBox(width: 8),
                            Text('Clean emerald palette', style: TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                        value: ThemeMode.light,
                        groupValue: currentThemeMode,
                        onChanged: (val) {
                          if (val != null) {
                            appState.setThemeMode(val);
                          }
                        },
                        activeColor: AppTheme.primary,
                      ),
                      RadioListTile<ThemeMode>(
                        title: const Row(
                          children: [
                            Text('🌙 Dark Mode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            SizedBox(width: 8),
                            Text('Deep charcoal forest', style: TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                        value: ThemeMode.dark,
                        groupValue: currentThemeMode,
                        onChanged: (val) {
                          if (val != null) {
                            appState.setThemeMode(val);
                          }
                        },
                        activeColor: AppTheme.primary,
                      ),
                      RadioListTile<ThemeMode>(
                        title: const Row(
                          children: [
                            Text('⚙️ System Default', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            SizedBox(width: 8),
                            Text('Follow OS mode', style: TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                        value: ThemeMode.system,
                        groupValue: currentThemeMode,
                        onChanged: (val) {
                          if (val != null) {
                            appState.setThemeMode(val);
                          }
                        },
                        activeColor: AppTheme.primary,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // 2. Notifications
                Text('Notification Preferences', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                  ),
                  child: Column(
                    children: [
                      SwitchListTile(
                        title: const Text('Order & Delivery Tracking Alerts'),
                        value: _notifyOrders,
                        activeColor: AppTheme.primary,
                        onChanged: (val) => setState(() => _notifyOrders = val),
                      ),
                      SwitchListTile(
                        title: const Text('New Chat Messages & Counter Offers'),
                        value: _notifyMessages,
                        activeColor: AppTheme.primary,
                        onChanged: (val) => setState(() => _notifyMessages = val),
                      ),
                      SwitchListTile(
                        title: const Text('Wishlist Price Drop Notifications'),
                        value: _notifyPriceDrops,
                        activeColor: AppTheme.primary,
                        onChanged: (val) => setState(() => _notifyPriceDrops = val),
                      ),
                      SwitchListTile(
                        title: const Text('Scheduled Recycling Pickup Reminders'),
                        value: _notifyRecycling,
                        activeColor: AppTheme.primary,
                        onChanged: (val) => setState(() => _notifyRecycling = val),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // 3. Privacy & Location
                Text('Privacy & Trust Controls', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                  ),
                  child: Column(
                    children: [
                      SwitchListTile(
                        title: const Text('Show Verified Seller Badge on Profile'),
                        value: _publicProfile,
                        activeColor: AppTheme.primary,
                        onChanged: (val) => setState(() => _publicProfile = val),
                      ),
                      SwitchListTile(
                        title: const Text('Share Approximate City Radius with Buyers'),
                        value: _preciseLocation,
                        activeColor: AppTheme.primary,
                        onChanged: (val) => setState(() => _preciseLocation = val),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // App Version info
                Center(
                  child: Column(
                    children: [
                      Text('EcoCircuit Version 2.0.0 (Release Build)', style: theme.textTheme.bodySmall),
                      const SizedBox(height: 2),
                      Text('TNPCB Hazardous E-Waste Compliance Certified', style: TextStyle(fontSize: 10, color: Colors.grey.withAlpha(180))),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
              ],
            ),
          ),
        );
      },
    );
  }
}
