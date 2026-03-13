import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

/// Notifier de estado de autenticação (Firebase Auth).
/// Usado pelo GoRouter como refreshListenable para redirecionar login/shell.
class AuthNotifier extends ChangeNotifier {
  AuthNotifier() {
    _subscription = FirebaseAuth.instance.authStateChanges().listen((user) {
      _user = user;
      notifyListeners();
    });
  }

  late final StreamSubscription<User?> _subscription;
  User? _user;

  User? get currentUser => _user;

  bool get isLoggedIn => _user != null;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
