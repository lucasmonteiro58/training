#!/usr/bin/env bash
# Gera firebase_options.dart e arquivos nativos (google-services.json, GoogleService-Info.plist).
# Requer: firebase login e projeto Firebase criado.
set -e
cd "$(dirname "$0")/.."

echo ">>> Verificando Flutter Fire CLI..."
if ! dart pub global list | grep -q flutterfire_cli; then
  echo "Instalando flutterfire_cli..."
  dart pub global activate flutterfire_cli
fi

echo ">>> Executando flutterfire configure (vai pedir projeto e plataformas)..."
dart pub global run flutterfire_cli:flutterfire configure

echo ">>> Firebase configurado. Rode: flutter run -d chrome (ou android/ios)"
