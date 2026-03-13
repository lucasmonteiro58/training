import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../firebase_options.dart';
import 'app.dart';

Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Enquanto o Firebase nao estiver configurado com `flutterfire configure`,
  // permitimos que o app suba mesmo sem backend para testar UI/navegacao.
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (error, stackTrace) {
    debugPrint(
      'Falha ao inicializar Firebase (usando placeholder de firebase_options). '
      'Rodando app somente localmente. Erro: $error\n$stackTrace',
    );
  }

  runApp(
    const ProviderScope(
      child: TrainingApp(),
    ),
  );
}


