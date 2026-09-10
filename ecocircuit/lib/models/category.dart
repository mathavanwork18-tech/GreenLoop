import 'package:flutter/material.dart';

class CategoryItem {
  final String id;
  final String name;
  final IconData icon;
  final bool isComponent;
  final int itemCount;

  const CategoryItem({
    required this.id,
    required this.name,
    required this.icon,
    this.isComponent = false,
    this.itemCount = 0,
  });
}
