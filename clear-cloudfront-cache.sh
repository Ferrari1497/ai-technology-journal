#!/bin/bash

echo "🔄 CloudFrontキャッシュの無効化を開始します..."

# 環境変数の読み込み
if [ ! -f ".env.staging" ]; then
    echo "❌ .env.stagingファイルが見つかりません"
    exit 1
fi

# CloudFront Distribution IDを取得
DISTRIBUTION_ID=$(grep CLOUDFRONT_DISTRIBUTION_ID .env.staging | cut -d'=' -f2 2>/dev/null)

if [ -z "$DISTRIBUTION_ID" ]; then
    echo "⚠️  .env.stagingにCLOUDFRONT_DISTRIBUTION_IDが設定されていません"
    echo "Terraformの出力から取得します..."
    
    if [ -f "terraform/terraform.tfstate" ]; then
        DISTRIBUTION_ID=$(grep -A 5 '"cloudfront_distribution_id"' terraform/terraform.tfstate | grep '"value"' | cut -d'"' -f4)
        
        if [ -n "$DISTRIBUTION_ID" ]; then
            echo "✅ Distribution ID取得: $DISTRIBUTION_ID"
            # .env.stagingに追加
            echo "CLOUDFRONT_DISTRIBUTION_ID_STAGING=$DISTRIBUTION_ID" >> .env.staging
        else
            echo "❌ Terraformステートからも取得できませんでした"
            exit 1
        fi
    else
        echo "❌ terraform.tfstateファイルが見つかりません"
        exit 1
    fi
fi

echo "🌐 CloudFront Distribution ID: $DISTRIBUTION_ID"

# AWS CLIの確認
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLIがインストールされていません"
    echo "以下のコマンドでインストールしてください："
    echo "brew install awscli"
    exit 1
fi

# AWS認証の確認
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS認証が設定されていません"
    echo "以下のコマンドで設定してください："
    echo "aws configure"
    exit 1
fi

echo "🗑️  全てのキャッシュを無効化します..."

# CloudFrontキャッシュの無効化
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✅ キャッシュ無効化を開始しました"
    echo "   Invalidation ID: $INVALIDATION_ID"
    echo ""
    echo "⏳ 無効化の進行状況を確認中..."
    
    # 無効化の完了を待機（最大10分）
    aws cloudfront wait invalidation-completed \
        --distribution-id "$DISTRIBUTION_ID" \
        --id "$INVALIDATION_ID" \
        --cli-read-timeout 600 \
        --cli-connect-timeout 60
    
    if [ $? -eq 0 ]; then
        echo "✅ キャッシュ無効化が完了しました！"
        echo ""
        echo "🌐 ステージング環境を確認してください："
        echo "   $(grep NEXT_PUBLIC_SITE_URL .env.staging | cut -d'=' -f2)"
        echo ""
        echo "💡 ブラウザでハードリフレッシュ（Cmd+Shift+R）も実行してください"
    else
        echo "⚠️  無効化の完了確認でタイムアウトしました"
        echo "   手動で確認してください："
        echo "   aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID --id $INVALIDATION_ID"
    fi
else
    echo "❌ キャッシュ無効化に失敗しました"
    echo "   Distribution IDを確認してください: $DISTRIBUTION_ID"
    exit 1
fi

echo ""
echo "=================================================="
echo "CloudFrontキャッシュ無効化完了"