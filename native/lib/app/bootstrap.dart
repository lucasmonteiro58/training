import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/firebase_availability.dart';
import '../firebase_options.dart';
import 'app.dart';

Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Na web, nao inicializar Firebase para evitar FirebaseException no interop JS.
  // Com flutterfire configure + config web, pode remover esta condicao.
  if (!kIsWeb) {
    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
    } catch (error, stackTrace) {
      setFirebaseUnavailable();
      debugPrint(
        'Falha ao inicializar Firebase. Rodando sem backend. '
        'Erro: ${error.toString()}\n$stackTrace',
      );
    }
  } else {
    setFirebaseUnavailable();
  }

  runApp(
    const ProviderScope(
      child: TrainingApp(),
    ),
  );
}


