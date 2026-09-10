import 'package:flutter/material.dart';

class ResponsiveLayout extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  const ResponsiveLayout({
    super.key,
    required this.mobile,
    this.tablet,
    this.desktop,
  });

  static bool isMobile(BuildContext context) => MediaQuery.of(context).size.width < 650;
  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= 650 && MediaQuery.of(context).size.width < 1100;
  static bool isDesktop(BuildContext context) => MediaQuery.of(context).size.width >= 1100;

  static int getGridColumnCount(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width >= 1400) return 5;
    if (width >= 1100) return 4;
    if (width >= 750) return 3;
    if (width >= 500) return 2;
    return 2;
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    if (size.width >= 1100 && desktop != null) {
      return desktop!;
    }
    if (size.width >= 650 && tablet != null) {
      return tablet!;
    }
    return mobile;
  }
}
