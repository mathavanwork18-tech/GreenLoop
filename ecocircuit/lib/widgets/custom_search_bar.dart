import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class CustomSearchBar extends StatelessWidget {
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onFilterTap;
  final bool readOnly;
  final VoidCallback? onTap;
  final String hintText;

  const CustomSearchBar({
    super.key,
    this.controller,
    this.onChanged,
    this.onSubmitted,
    this.onFilterTap,
    this.readOnly = false,
    this.onTap,
    this.hintText = 'Search electronics, parts, components...',
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 30 : 10),
            blurRadius: 10,
            offset: const Offset(0, 3),
          )
        ],
      ),
      child: TextField(
        controller: controller,
        readOnly: readOnly,
        onTap: onTap,
        onChanged: onChanged,
        onSubmitted: onSubmitted,
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: theme.textTheme.bodyMedium?.copyWith(
            color: isDark ? AppTheme.darkTextSecondary : AppTheme.lightTextSecondary,
          ),
          prefixIcon: const Icon(Icons.search, color: AppTheme.primary),
          suffixIcon: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (controller != null && controller!.text.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.close, size: 18),
                  onPressed: () {
                    controller!.clear();
                    onChanged?.call('');
                  },
                ),
              if (onFilterTap != null) ...[
                Container(
                  height: 24,
                  width: 1,
                  color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
                ),
                IconButton(
                  icon: const Icon(Icons.tune, color: AppTheme.primary),
                  onPressed: onFilterTap,
                  tooltip: 'Filter Options',
                ),
              ],
            ],
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }
}
