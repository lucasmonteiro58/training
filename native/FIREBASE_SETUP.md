# Configuração do Firebase no app Flutter

O app usa Firebase (Auth + Firestore). O projeto já está preparado: plugins Android (Google Services) e bootstrap. Falta só gerar os arquivos do **seu** projeto Firebase.

## Configuração Android via .env (recomendado — evita expor secrets no repo)

O `google-services.json` **não** é commitado. As credenciais ficam em variáveis de ambiente:

1. **Copie o exemplo e preencha** (no diretório `native/`):
   ```bash
   cd native
   cp .env.example .env
   ```
   Edite `.env` com os valores do [Firebase Console](https://console.firebase.google.com/) → seu projeto → Configurações do projeto (ícone de engrenagem) → Geral → Seus apps → Android.

2. **Gere o arquivo** `android/app/google-services.json`:
   ```bash
   chmod +x scripts/generate_google_services.sh
   ./scripts/generate_google_services.sh
   ```

3. O arquivo gerado é local e está no `.gitignore`; o repositório continua sem expor API keys nem IDs.

**Se você já tem um `google-services.json`:** use os campos dele para preencher o `.env` (project_number, project_id, mobilesdk_app_id, current_key, etc.) e depois rode o script para recriar o JSON. Para parar de versionar o arquivo no Git: `git rm --cached android/app/google-services.json` (dentro de `native/`).

## Adicionar o Firebase agora (resumo)

1. **Login no Firebase**
   ```bash
   firebase login
   ```

2. **Gerar configuração** (no diretório `native/`)
   ```bash
   cd native
   dart pub global activate flutterfire_cli
   dart pub global run flutterfire_cli:flutterfire configure
   ```
   Ou use o script:
   ```bash
   chmod +x scripts/setup_firebase.sh
   ./scripts/setup_firebase.sh
   ```

3. O comando vai criar/atualizar:
   - `lib/firebase_options.dart` (substitui o placeholder)
   - `android/app/google-services.json` (ou use o fluxo via `.env` acima)
   - `ios/Runner/GoogleService-Info.plist` (se escolher iOS)

Depois disso o app sobe com Firebase inicializado.

---

## Detalhes (opcional)

### 1. Pré-requisitos

- Conta no [Firebase Console](https://console.firebase.google.com/)
- Flutter instalado

### 2. Instalar o Flutter Fire CLI

```bash
dart pub global activate flutterfire_cli
```

Certifique-se de que o diretório de ativação do Dart está no seu `PATH` (o próprio comando costuma mostrar o caminho).

## 3. Fazer login no Firebase

```bash
firebase login
```

## 4. Vincular o projeto ao Firebase

No diretório do app Flutter (`native/`):

```bash
cd native
flutterfire configure
```

O comando vai:

- Listar seus projetos Firebase (ou criar um novo)
- Criar/atualizar o arquivo `lib/firebase_options.dart` com as opções para **Android**, **iOS** e **Web**
- Gerar/atualizar no projeto:
  - **Android:** `android/app/google-services.json`
  - **iOS:** `ios/Runner/GoogleService-Info.plist`
  - **Web:** opções no próprio `firebase_options.dart`

Depois disso, o `bootstrap` do app já conseguirá chamar `Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform)` sem erro.

## 5. Android: Google Sign-In

Para **Login com Google** no Android:

1. No [Firebase Console](https://console.firebase.google.com/) → seu projeto → **Authentication** → **Sign-in method** → ative **Google**.
2. No [Google Cloud Console](https://console.cloud.google.com/) (projeto vinculado ao Firebase):
   - **APIs & Services** → **Credentials**
   - Crie um **OAuth 2.0 Client ID** do tipo **Android**
   - Use o **package name** do app: `com.trainingapp.training_native` (ou o que estiver em `android/app/build.gradle`)
   - Use o **SHA-1** do seu keystore:

     ```bash
     cd native/android
     ./gradlew signingReport
     ```

     Use o SHA-1 da variante **debug** (ou **release**, se for publicar).

3. Coloque o **Client ID** Android nas credenciais OAuth; o Firebase usa isso para o Google Sign-In.

## 6. iOS: Google Sign-In

1. No Firebase Console → **Authentication** → **Google** (já ativado no passo 5).
2. No [Google Cloud Console](https://console.cloud.google.com/) → **Credentials**:
   - Crie um **OAuth 2.0 Client ID** do tipo **iOS**
   - Use o **Bundle ID** do app (ex.: `com.trainingapp.trainingNative`) — o mesmo de `ios/Runner/Info.plist` / Xcode
3. Baixe o `GoogleService-Info.plist` (se o `flutterfire configure` não tiver preenchido) e coloque em `ios/Runner/`.
4. No Xcode, abra `ios/Runner.xcworkspace` e em **Signing & Capabilities** confira que o **Bundle Identifier** é o mesmo usado no OAuth.

## 7. Web: Firebase e Google Sign-In

O `flutterfire configure` já gera as opções para Web. Para **Google Sign-In na web**:

1. No Google Cloud Console → **Credentials** → crie um **OAuth 2.0 Client ID** do tipo **Web application**.
2. Em **Authorized JavaScript origins** adicione, por exemplo:
   - `http://localhost:XXXX` (porta que o `flutter run -d chrome` usar)
   - Sua URL de produção quando tiver
3. O Firebase Auth com Google na web usa esse client ID automaticamente quando configurado no projeto.

## 8. Conferir no app

Depois de rodar `flutterfire configure`:

```bash
cd native
flutter run -d chrome   # ou -d android / -d ios
```

O app deve inicializar o Firebase sem o `UnimplementedError`. O login com Google só funcionará depois de implementar a chamada no código e de configurar OAuth (passos 5, 6 e 7) conforme a plataforma que você estiver usando.

## Resumo mínimo (só para o app subir com Firebase)

1. `dart pub global activate flutterfire_cli`
2. `firebase login`
3. `cd native && flutterfire configure`

Isso já substitui o `firebase_options.dart` placeholder e gera os arquivos de configuração por plataforma. Login com Google exige os passos adicionais de OAuth (Android/iOS/Web) acima.
