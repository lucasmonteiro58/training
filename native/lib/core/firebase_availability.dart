/// Indica se o Firebase foi inicializado com sucesso.
/// Quando falso (ex.: web com placeholder), nenhum código Firebase deve ser executado
/// para evitar FirebaseException chegando ao JS e causando TypeError.
bool get firebaseAvailable => _firebaseAvailable;
bool _firebaseAvailable = true;

void setFirebaseUnavailable() {
  _firebaseAvailable = false;
}
