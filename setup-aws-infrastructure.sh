#!/bin/bash

set -e

echo "=== AI Technology Journal AWS環境構築スクリプト ==="

# 色付きの出力用関数
print_step() {
    echo -e "\n\033[1;34m=== $1 ===\033[0m"
}

print_success() {
    echo -e "\033[1;32m✓ $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m✗ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠ $1\033[0m"
}

# 前提条件チェック
print_step "前提条件チェック"

if ! command -v aws &> /dev/null; then
    print_error "AWS CLIがインストールされていません"
    echo "インストール方法: brew install awscli"
    exit 1
fi

if ! command -v terraform &> /dev/null; then
    print_error "Terraformがインストールされていません"
    echo "インストール方法: brew install hashicorp/tap/terraform"
    exit 1
fi

print_success "必要なツールがインストールされています"

# AWS認証情報チェック
print_step "AWS認証情報チェック"

if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS認証情報が設定されていません"
    echo "設定方法: aws configure"
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
print_success "AWS認証情報が設定されています (Account: $AWS_ACCOUNT_ID, Region: $AWS_REGION)"

# バケット名の生成
TIMESTAMP=$(date +%s)
PROD_BUCKET="ai-tech-journal-prod-$TIMESTAMP"
STAGING_BUCKET="ai-tech-journal-staging-$TIMESTAMP"

print_step "Terraform変数ファイル作成"

# terraform.tfvarsファイルを作成
cat > terraform/terraform.tfvars << EOF
prod_bucket_name = "$PROD_BUCKET"
staging_bucket_name = "$STAGING_BUCKET"
basic_auth_password = "staging123"
aws_region = "$AWS_REGION"
EOF

print_success "terraform.tfvarsファイルを作成しました"

# Terraformの初期化
print_step "Terraformの初期化"

cd terraform
terraform init

print_success "Terraformの初期化が完了しました"

# 実行計画の確認
print_step "Terraform実行計画の確認"

terraform plan

echo ""
read -p "この計画でインフラを構築しますか？ (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "インフラ構築をキャンセルしました"
    exit 0
fi

# インフラの構築
print_step "インフラの構築"

terraform apply -auto-approve

print_success "インフラの構築が完了しました"

# 出力値の取得
print_step "構築結果の確認"

terraform output

# 出力値をJSONファイルに保存
terraform output -json > ../terraform-outputs.json

print_success "構築結果をterraform-outputs.jsonに保存しました"

# 環境変数ファイルの更新
print_step "環境変数ファイルの更新"

cd ..

PROD_CLOUDFRONT_DOMAIN=$(terraform -chdir=terraform output -raw prod_cloudfront_domain)
STAGING_CLOUDFRONT_DOMAIN=$(terraform -chdir=terraform output -raw staging_cloudfront_domain)
PROD_DISTRIBUTION_ID=$(terraform -chdir=terraform output -raw prod_cloudfront_distribution_id)
STAGING_DISTRIBUTION_ID=$(terraform -chdir=terraform output -raw staging_cloudfront_distribution_id)

# .env.productionの更新
cat > .env.production << EOF
NEXT_PUBLIC_SITE_URL=https://$PROD_CLOUDFRONT_DOMAIN
NEXT_PUBLIC_ENVIRONMENT=production
OPENAI_API_KEY=your_openai_api_key_here
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
S3_BUCKET_PROD=$PROD_BUCKET
CLOUDFRONT_DISTRIBUTION_ID_PROD=$PROD_DISTRIBUTION_ID
EMAIL_RECIPIENT=your_email@example.com
EOF

# .env.stagingの更新
cat > .env.staging << EOF
NEXT_PUBLIC_SITE_URL=https://$STAGING_CLOUDFRONT_DOMAIN
NEXT_PUBLIC_ENVIRONMENT=staging
OPENAI_API_KEY=your_openai_api_key_here
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
S3_BUCKET_STAGING=$STAGING_BUCKET
CLOUDFRONT_DISTRIBUTION_ID_STAGING=$STAGING_DISTRIBUTION_ID
EMAIL_RECIPIENT=your_email@example.com
EOF

print_success "環境変数ファイルを更新しました"

# GitHub Secrets設定用の情報を表示
print_step "GitHub Secrets設定情報"

echo ""
echo "以下の情報をGitHub Secretsに設定してください："
echo ""
echo "AWS_ACCESS_KEY_ID: [あなたのAWSアクセスキー]"
echo "AWS_SECRET_ACCESS_KEY: [あなたのAWSシークレットキー]"
echo "S3_BUCKET_PROD: $PROD_BUCKET"
echo "S3_BUCKET_STAGING: $STAGING_BUCKET"
echo "CLOUDFRONT_DISTRIBUTION_ID_PROD: $PROD_DISTRIBUTION_ID"
echo "CLOUDFRONT_DISTRIBUTION_ID_STAGING: $STAGING_DISTRIBUTION_ID"
echo "OPENAI_API_KEY: [あなたのOpenAI APIキー]"
echo "EMAIL_RECIPIENT: [レポート送信先メールアドレス]"
echo ""

# 次のステップを表示
print_step "次のステップ"

echo ""
echo "1. 環境変数ファイル(.env.production, .env.staging)のAPIキーを実際の値に更新"
echo "2. GitHub Secretsに上記の情報を設定"
echo "3. テストデプロイの実行: npm run deploy:staging"
echo "4. サイトアクセス確認:"
echo "   - 本番環境: https://$PROD_CLOUDFRONT_DOMAIN"
echo "   - ステージング環境: https://$STAGING_CLOUDFRONT_DOMAIN (admin/staging123)"
echo ""

print_success "AWS環境構築が完了しました！"