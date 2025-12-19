#!/bin/bash

# デプロイスクリプト
set -e

# 引数チェック
if [ $# -eq 0 ]; then
    echo "Usage: $0 [staging|production]"
    exit 1
fi

ENVIRONMENT=$1

# 環境設定
case $ENVIRONMENT in
    "staging")
        export NEXT_PUBLIC_SITE_URL="https://staging.ai-tech-journal.com"
        export NEXT_PUBLIC_ENVIRONMENT="staging"
        S3_BUCKET=${S3_BUCKET_STAGING}
        CLOUDFRONT_ID=${CLOUDFRONT_DISTRIBUTION_ID_STAGING}
        ;;
    "production")
        export NEXT_PUBLIC_SITE_URL="https://ai-tech-journal.com"
        export NEXT_PUBLIC_ENVIRONMENT="production"
        S3_BUCKET=${S3_BUCKET_PROD}
        CLOUDFRONT_ID=${CLOUDFRONT_DISTRIBUTION_ID_PROD}
        ;;
    *)
        echo "Invalid environment: $ENVIRONMENT"
        echo "Use 'staging' or 'production'"
        exit 1
        ;;
esac

echo "🚀 Deploying to $ENVIRONMENT environment..."
echo "Site URL: $NEXT_PUBLIC_SITE_URL"

# デプロイ前チェック
echo "🔍 Pre-deploy checks..."
node scripts/pre-deploy.js

# 依存関係インストール
echo "📦 Installing dependencies..."
npm ci

# ビルド
echo "🔨 Building application..."
npm run build

# エクスポート
echo "📤 Exporting static files..."
npm run export

# S3にアップロード
echo "☁️ Uploading to S3..."
aws s3 sync out/ s3://$S3_BUCKET --delete

# CloudFrontキャッシュ無効化
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

# デプロイ後検証
echo "🔍 Post-deploy verification..."
sleep 30
node scripts/post-deploy.js $ENVIRONMENT

echo "✅ Deployment completed and verified successfully!"
echo "🌐 Site is available at: $NEXT_PUBLIC_SITE_URL"