#!/usr/bin/env bash
# 안전한 셸 옵션
set -euo pipefail

# === 환경 설정 ===
EC2_USER="ubuntu"
EC2_HOST="3.34.58.125"
EC2_KEY_PATH_RAW="/d/snaptale_key.pem"    # Windows에서도 동작하도록 아래에서 cygpath 처리
REMOTE_DIR="/home/$EC2_USER/snaptale"
ENV_FILE_PATH="/home/$EC2_USER/.snaptale.env"  # 원격 서버의 env 파일 경로
PROFILE="prod"                                # 실행 프로필 (Spring)

# --- 키 경로 (Windows Git Bash 호환) ---
if command -v cygpath >/dev/null 2>&1; then
  EC2_KEY_PATH="$(cygpath -u "$EC2_KEY_PATH_RAW")"
else
  EC2_KEY_PATH="$EC2_KEY_PATH_RAW"
fi
chmod 600 "$EC2_KEY_PATH" || true

# --- 1) 로컬 빌드 ---
echo "1) 로컬에서 Gradle 빌드..."
cd "$(dirname "$0")"
./gradlew clean build -x test

JAR_LOCAL="$(ls -t build/libs/*-SNAPSHOT.jar | grep -v 'plain' | head -n 1 || true)"
if [ -z "${JAR_LOCAL:-}" ] || [ ! -f "$JAR_LOCAL" ]; then
  echo "ERROR: 빌드 산출물 JAR을 찾을 수 없습니다."
  exit 1
fi
JAR_BASENAME="$(basename "$JAR_LOCAL")"
echo "   -> 빌드 성공: $JAR_LOCAL"

# --- 2) 업로드 ---
echo "2) 원격 서버 준비 및 JAR 업로드..."
ssh -o StrictHostKeyChecking=no -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" "mkdir -p '$REMOTE_DIR'"
scp -o StrictHostKeyChecking=no -i "$EC2_KEY_PATH" "$JAR_LOCAL" "$EC2_USER@$EC2_HOST:$REMOTE_DIR/"

# --- 3) 원격 실행 (절대경로 + 헬스체크) ---
echo "3) 원격 서버에서 기존 프로세스 종료 및 새 애플리케이션 기동..."

ssh -o StrictHostKeyChecking=no -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" \
  "ENV_FILE_PATH='$ENV_FILE_PATH' PROFILE='$PROFILE' JAR_BASENAME='$JAR_BASENAME' REMOTE_DIR='$REMOTE_DIR' bash -s" << 'EOF'
set -euo pipefail
die() { echo "ERROR: $*" >&2; exit 1; }

[ -f "$ENV_FILE_PATH" ] || die "환경변수 파일이 존재하지 않습니다: $ENV_FILE_PATH"

# 1) 환경변수 로드
set -a
. "$ENV_FILE_PATH"
set +a

# 2) JAR 절대경로 확인
JAR_PATH="$REMOTE_DIR/$JAR_BASENAME"
[ -f "$JAR_PATH" ] || die "JAR가 없습니다: $JAR_PATH"
[ -r "$JAR_PATH" ] || die "JAR 읽기 권한이 없습니다: $JAR_PATH"

# 3) 기존 프로세스 종료 (절대경로 기준)
pkill -f "$JAR_PATH" || true
sleep 1

mkdir -p "$REMOTE_DIR/logs"
cd "$REMOTE_DIR"

# 4) 실행 (절대경로로 명시)
nohup env \
  SNAPTALE_DB_URL="${SNAPTALE_DB_URL:-}" \
  SNAPTALE_DB_USERNAME="${SNAPTALE_DB_USERNAME:-}" \
  SNAPTALE_DB_PASSWORD="${SNAPTALE_DB_PASSWORD:-}" \
  SERVER_PORT="${SERVER_PORT:-8080}" \
  SPRING_PROFILES_ACTIVE="${PROFILE}" \
  JWT_SECRET="${JWT_SECRET:-}" \
  JAVA_OPTS="${JAVA_OPTS:-}" \
  sh -c 'exec java ${JAVA_OPTS} -jar "'"$JAR_PATH"'"' \
  > "$REMOTE_DIR/logs/app.out.log" 2>&1 &


echo "   -> 애플리케이션이 시작됨 (포트: ${SERVER_PORT:-8080}, JAR: $JAR_PATH)."
EOF
