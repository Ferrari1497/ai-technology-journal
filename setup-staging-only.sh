#!/bin/bash

echo "🧪 検証環境のみ構築スクリプト"
echo "=================================================="

# 現在のディレクトリを確認
if [ ! -f "terraform/main.tf" ]; then
    echo "❌ terraformディレクトリが見つかりません"
    exit 1
fi

# AWS CLIの確認
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLIがインストールされていません"
    echo "   ./setup-aws-tools.sh を実行してください"
    exit 1
fi

# AWS認証の確認
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS認証が設定されていません"
    echo "   aws configure を実行してください"
    exit 1
fi

# Terraformの確認
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraformがインストールされていません"
    echo "   ./setup-aws-tools.sh を実行してください"
    exit 1
fi

echo "✅ 必要なツールが揃っています"
echo ""

# タイムスタンプ生成
TIMESTAMP=$(date +%s)
STAGING_BUCKET="ai-tech-journal-staging-${TIMESTAMP}"

echo "🏗️  検証環境の構築を開始します..."
echo "   ステージングバケット: ${STAGING_BUCKET}"
echo ""

# Terraform変数ファイル作成（検証環境のみ）
cat > terraform/terraform.tfvars << EOF
staging_bucket_name = "${STAGING_BUCKET}"
prod_bucket_name = "ai-tech-journal-prod-disabled"
EOF

echo "✅ Terraform変数ファイルを作成しました"

# terraformディレクトリに移動
cd terraform

# Terraform初期化
echo "🔧 Terraformを初期化中..."
terraform init

if [ $? -ne 0 ]; then
    echo "❌ Terraform初期化に失敗しました"
    exit 1
fi

# 検証環境のみのTerraform設定を作成
cat > staging-only.tf << 'EOF'
# 検証環境のみの設定
resource "aws_s3_bucket" "staging_only" {
  bucket = var.staging_bucket_name
}

resource "aws_s3_bucket_website_configuration" "staging_only_website" {
  bucket = aws_s3_bucket.staging_only.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_public_access_block" "staging_only_pab" {
  bucket = aws_s3_bucket.staging_only.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "staging_only_policy" {
  bucket = aws_s3_bucket.staging_only.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.staging_only.arn}/*"
      },
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.staging_only_pab]
}

output "staging_only_bucket_name" {
  value = aws_s3_bucket.staging_only.id
}

output "staging_only_website_url" {
  value = aws_s3_bucket_website_configuration.staging_only_website.website_endpoint
}
EOF

echo "✅ 検証環境専用設定を作成しました"

# 実行計画の表示
echo "📋 実行計画を表示します..."
terraform plan -target=aws_s3_bucket.staging_only -target=aws_s3_bucket_website_configuration.staging_only_website -target=aws_s3_bucket_public_access_block.staging_only_pab -target=aws_s3_bucket_policy.staging_only_policy

echo ""
read -p "❓ 検証環境を構築しますか？ (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ 構築をキャンセルしました"
    exit 0
fi

# インフラ構築（検証環境のみ）
echo "🚀 検証環境を構築中..."
terraform apply -target=aws_s3_bucket.staging_only -target=aws_s3_bucket_website_configuration.staging_only_website -target=aws_s3_bucket_public_access_block.staging_only_pab -target=aws_s3_bucket_policy.staging_only_policy -auto-approve

if [ $? -eq 0 ]; then
    echo "✅ 検証環境の構築が完了しました！"
    
    # 出力値を取得
    STAGING_URL=$(terraform output -raw staging_only_website_url)
    
    echo ""
    echo "🌐 検証環境情報:"
    echo "   URL: http://${STAGING_URL}"
    echo "   バケット名: ${STAGING_BUCKET}"
    
    # 元のディレクトリに戻る
    cd ..
    
    # 環境変数ファイルを更新（検証環境のみ）
    cat > .env.staging << EOF
NEXT_PUBLIC_SITE_URL=http://${STAGING_URL}
NEXT_PUBLIC_ENVIRONMENT=staging
OPENAI_API_KEY=your_openai_api_key_here
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
S3_BUCKET_STAGING=${STAGING_BUCKET}
EMAIL_RECIPIENT=your_email@example.com
EOF
    
    echo "✅ .env.stagingファイルを更新しました"
    echo ""
    echo "📝 次のステップ:"
    echo "   1. .env.stagingファイルの編集（APIキー等の設定）"
    echo "   2. GitHub Secretsの設定:"
    echo "      - S3_BUCKET_STAGING=${STAGING_BUCKET}"
    echo "   3. テストデプロイ: npm run deploy:staging"
    
else
    echo "❌ 検証環境の構築に失敗しました"
    exit 1
fi

echo ""
echo "=================================================="
echo "検証環境構築完了"