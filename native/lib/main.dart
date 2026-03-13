import 'dart:async';

import 'package:flutter/material.dart';

// Na web usa bootstrap sem Firebase para evitar carregar firebase_core e FirebaseException no JS.
import 'app/bootstrap.dart' if (dart.library.html) 'app/bootstrap_web.dart';

void main() {
  // Na web, evita que exceções (ex.: FirebaseException) sejam passadas ao JS ao exibir erro.
  ErrorWidget.builder = (FlutterErrorDetails details) {
    final message = details.exception.toString();
    return Material(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            message,
            style: const TextStyle(color: Color(0xFFEF4444), fontSize: 14),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  };

  runZonedGuarded(
    () {
      bootstrap();
    },
    (error, stackTrace) {
      // Usar apenas toString() evita passar exceção (ex.: FirebaseException) ao JS na web.
      final msg = error.toString();
      debugPrint('Erro nao tratado: $msg');
      debugPrint(stackTrace.toString());
    },
  );
}

