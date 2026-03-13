import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../../core/firebase_availability.dart';

/// Serviço de autenticação (Google + Firebase Auth).
/// Quando o Firebase não está disponível (ex.: web sem config), não acessa APIs.
class AuthService {
  AuthService({
    FirebaseAuth? auth,
    GoogleSignIn? googleSignIn,
  })  : _auth = firebaseAvailable ? (auth ?? FirebaseAuth.instance) : null,
        _googleSignIn = firebaseAvailable ? (googleSignIn ?? GoogleSignIn()) : null;

  final FirebaseAuth? _auth;
  final GoogleSignIn? _googleSignIn;

  Future<User?> signInWithGoogle() async {
    if (_auth == null || _googleSignIn == null) return null;

    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) return null;

    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    final userCredential = await _auth.signInWithCredential(credential);
    return userCredential.user;
  }

  Future<void> signOut() async {
    if (_auth == null || _googleSignIn == null) return;
    await Future.wait([
      _auth.signOut(),
      _googleSignIn.signOut(),
    ]);
  }
}
