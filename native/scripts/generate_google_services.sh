#!/usr/bin/env bash
# Gera android/app/google-services.json a partir das variáveis em .env
# Uso: na raiz do projeto native/, execute: ./scripts/generate_google_services.sh

set -e
cd "$(dirname "$0")/.."

ENV_FILE=".env"
OUTPUT_FILE="android/app/google-services.json"

if [ ! -f "$ENV_FILE" ]; then
  echo "Erro: arquivo $ENV_FILE não encontrado."
  echo "Copie .env.example para .env e preencha com os valores do Firebase Console:"
  echo "  cp .env.example .env"
  echo "  # Edite .env com seus valores"
  exit 1
fi

# Carrega variáveis (export para ficarem disponíveis no heredoc)
set -a
source "$ENV_FILE"
set +a

for var in FIREBASE_PROJECT_NUMBER FIREBASE_PROJECT_ID FIREBASE_STORAGE_BUCKET \
           FIREBASE_MOBILESDK_APP_ID FIREBASE_ANDROID_PACKAGE_NAME FIREBASE_OAUTH_CLIENT_ID FIREBASE_API_KEY; do
  if [ -z "${!var}" ]; then
    echo "Erro: variável $var não definida em .env"
    exit 1
  fi
done

mkdir -p "$(dirname "$OUTPUT_FILE")"

cat > "$OUTPUT_FILE" << EOF
{
  "project_info": {
    "project_number": "$FIREBASE_PROJECT_NUMBER",
    "project_id": "$FIREBASE_PROJECT_ID",
    "storage_bucket": "$FIREBASE_STORAGE_BUCKET"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "$FIREBASE_MOBILESDK_APP_ID",
        "android_client_info": {
          "package_name": "$FIREBASE_ANDROID_PACKAGE_NAME"
        }
      },
      "oauth_client": [
        {
          "client_id": "$FIREBASE_OAUTH_CLIENT_ID",
          "client_type": 3
        }
      ],
      "api_key": [
        {
          "current_key": "$FIREBASE_API_KEY"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": [
            {
              "client_id": "$FIREBASE_OAUTH_CLIENT_ID",
              "client_type": 3
            }
          ]
        }
      }
    }
  ],
  "configuration_version": "1"
}
EOF

echo ">>> $OUTPUT_FILE gerado a partir de .env"
