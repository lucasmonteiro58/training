import 'package:flutter/material.dart';

/// Container de página com max-width 480px e padding igual ao web (page-container).
class PageContainer extends StatelessWidget {
  const PageContainer({
    super.key,
    required this.child,
    this.padding,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;

  static const double maxWidth = 480;
  static const EdgeInsets defaultPadding = EdgeInsets.symmetric(horizontal: 16);

  @override
  Widget build(BuildContext context) {
    final effectivePadding = padding ?? defaultPadding;
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: maxWidth),
        child: Padding(
          padding: effectivePadding,
          child: child,
        ),
      ),
    );
  }
}
