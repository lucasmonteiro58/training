import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/firebase_availability.dart';
import 'app.dart';

/// Bootstrap para web: nao importa Firebase, evita FirebaseException no interop JS.
Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();
  setFirebaseUnavailable();

  runApp(
    const ProviderScope(
      child: TrainingApp(),
    ),
  );
}
