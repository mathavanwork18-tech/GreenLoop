import 'package:flutter/material.dart';
import 'data/app_state.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'theme/app_theme.dart';

class EcoCircuitApp extends StatelessWidget {
  const EcoCircuitApp({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppState();

    return AnimatedBuilder(
      animation: appState,
      builder: (context, _) {
        return MaterialApp(
          title: 'EcoCircuit — Reuse Electronics. Reduce E-Waste.',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: appState.themeMode,
          home: const OnboardingScreen(),
        );
      },
    );
  }
}
