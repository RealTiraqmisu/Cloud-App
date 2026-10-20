# ดึง ApiBaseUrl จาก SAM stack → ตั้งเป็น VITE_API_URL ใน Amplify branch → สั่ง build ใหม่
# ใช้ (PowerShell): .\amplify-hosting\set-api-url.ps1 -AppId <amplify-app-id> [-Branch main] [-Stack food-ordering]
param(
  [Parameter(Mandatory = $true)][string]$AppId,
  [string]$Branch = "main",
  [string]$Stack = "food-ordering",
  [string]$Region = "us-east-1"
)
$ErrorActionPreference = "Stop"

$ApiUrl = aws cloudformation describe-stacks --region $Region --stack-name $Stack `
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" --output text
$ApiUrl = "$ApiUrl".Trim().TrimEnd('/')
if (-not $ApiUrl -or $ApiUrl -eq "None") { throw "ไม่พบ output ApiBaseUrl ใน stack $Stack" }
Write-Host "VITE_API_URL = $ApiUrl"

# ตั้งที่ระดับ branch (ไม่ไปทับ AMPLIFY_MONOREPO_APP_ROOT ที่อยู่ระดับ app)
aws amplify update-branch --region $Region --app-id $AppId --branch-name $Branch `
  --environment-variables "VITE_API_URL=$ApiUrl" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "update-branch ไม่สำเร็จ" }

aws amplify start-job --region $Region --app-id $AppId --branch-name $Branch `
  --job-type RELEASE --query "jobSummary.[jobId,status]" --output text

$Domain = aws amplify get-app --region $Region --app-id $AppId --query "app.defaultDomain" --output text
Write-Host "กำลัง build ใหม่... เสร็จแล้วเปิด https://$Branch.$Domain"
