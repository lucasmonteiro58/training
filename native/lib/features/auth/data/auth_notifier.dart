import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import '../../../core/firebase_availability.dart';

/// Notifier de estado de autenticação (Firebase Auth).
/// Usado pelo GoRouter como refreshListenable para redirecionar login/shell.
/// Quando o Firebase não está disponível (ex.: web sem config), não subscreve ao stream.
class AuthNotifier extends ChangeNotifier {
  AuthNotifier() {
    if (!firebaseAvailable) {
      _subscription = null;
      return;
    }
    _subscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        _user = user;
        notifyListeners();
      },
      onError: (Object error, StackTrace? stackTrace) {
        if (kDebugMode) {
          debugPrint('Auth stream error: ${error.toString()}');
          if (stackTrace != null) debugPrint(stackTrace.toString());
        }
        _user = null;
        notifyListeners();
      },
    );
  }

  StreamSubscription<User?>? _subscription;
  User? _user;

  User? get currentUser => _user;

  bool get isLoggedIn => _user != null;

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
