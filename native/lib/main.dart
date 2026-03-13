import 'dart:async';

import 'package:flutter/material.dart';

import 'app/bootstrap.dart';

void main() {
  runZonedGuarded(
    () {
      bootstrap();
    },
    (error, stackTrace) {
      // TODO: enviar logs de erro para observabilidade quando configurado.
      debugPrint('Erro nao tratado: $error');
    },
  );
}

