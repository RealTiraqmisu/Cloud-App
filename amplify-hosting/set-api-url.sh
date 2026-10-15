#!/usr/bin/env bash
# ดึง ApiBaseUrl จาก SAM stack → ตั้งเป็น VITE_API_URL ใน Amplify branch → สั่ง build ใหม่
# ใช้: ./amplify-hosting/set-api-url.sh <amplify-app-id> [branch=main] [sam-stack=food-ordering]
set -euo pipefail

APP_ID="${1:?usage: $0 <amplify-app-id> [branch] [sam-stack]}"
BRANCH="${2:-main}"
STACK="${3:-food-ordering}"
REGION="${AWS_REGION:-us-east-1}"

API_URL=$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" --output text)
API_URL="${API_URL%/}"
if [ -z "$API_URL" ] || [ "$API_URL" = "None" ]; then
  echo "ไม่พบ output ApiBaseUrl ใน stack $STACK" >&2; exit 1
fi
echo "VITE_API_URL = $API_URL"

# ตั้งที่ระดับ branch (ไม่ไปทับ AMPLIFY_MONOREPO_APP_ROOT ที่อยู่ระดับ app)
aws amplify update-branch --region "$REGION" --app-id "$APP_ID" --branch-name "$BRANCH" \
  --environment-variables "VITE_API_URL=$API_URL" >/dev/null

aws amplify start-job --region "$REGION" --app-id "$APP_ID" --branch-name "$BRANCH" \
  --job-type RELEASE --query 'jobSummary.[jobId,status]' --output text

DOMAIN=$(aws amplify get-app --region "$REGION" --app-id "$APP_ID" --query 'app.defaultDomain' --output text)
echo "กำลัง build ใหม่... เสร็จแล้วเปิด https://$BRANCH.$DOMAIN"
