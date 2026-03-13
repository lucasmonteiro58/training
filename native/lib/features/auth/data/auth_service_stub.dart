/// Stub de AuthService para web: nao usa Firebase, evita carregar firebase_auth e FirebaseException no JS.
class AuthService {
  Future<dynamic> signInWithGoogle() async => null;
  Future<void> signOut() async {}
}
