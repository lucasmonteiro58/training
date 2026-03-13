import 'package:flutter/foundation.dart';

/// Stub de AuthNotifier para web: nao usa Firebase, evita carregar firebase_auth e FirebaseException no JS.
class AuthNotifier extends ChangeNotifier {
  dynamic get currentUser => null;
  bool get isLoggedIn => false;
}
