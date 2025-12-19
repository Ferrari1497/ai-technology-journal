#!/bin/bash

set -e

echo "=== AWS環境トラブルシューティングツール ==="

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

# メニュー表示
show_menu() {
    echo ""
    echo "トラブルシューティングメニュー："
    echo "1. AWS接続テスト"
    echo "2. S3バケット状態確認"
    echo "3. CloudFront状態確認"
    echo "4. Lambda@Edge状態確認"
    echo "5. デプロイテスト"
    echo "6. キャッシュクリア"
    echo "7. ログ確認"
    echo "8. コスト確認"
    echo "9. 全体ヘルスチェック"
    echo "0. 終了"
    echo ""
}

# AWS接続テスト
test_aws_connection() {
    print_step "AWS接続テスト"
    
    if aws sts get-caller-identity &> /dev/null; then
        AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
        AWS_REGION=$(aws configure get region)
        print_success "AWS接続OK (Account: $AWS_ACCOUNT_ID, Region: $AWS_REGION)"
    else
        print_error "AWS接続に失敗しました"
        echo "解決方法: aws configure を実行してください"
    fi
}

# S3バケット状態確認
check_s3_buckets() {
    print_step "S3バケット状態確認"
    
    if [ -f "terraform-outputs.json" ]; then
        PROD_BUCKET=$(jq -r '.prod_bucket_name.value' terraform-outputs.json)
        STAGING_BUCKET=$(jq -r '.staging_bucket_name.value' terraform-outputs.json)
        
        echo "本番バケット: $PROD_BUCKET"
        if aws s3 ls "s3://$PROD_BUCKET" &> /dev/null; then
            print_success "本番バケットアクセスOK"
            aws s3 ls "s3://$PROD_BUCKET" --recursive --human-readable --summarize | tail -2
        else
            print_error "本番バケットアクセスに失敗"
        fi
        
        echo ""
        echo "ステージングバケット: $STAGING_BUCKET"
        if aws s3 ls "s3://$STAGING_BUCKET" &> /dev/null; then
            print_success "ステージングバケットアクセスOK"
            aws s3 ls "s3://$STAGING_BUCKET" --recursive --human-readable --summarize | tail -2
        else
            print_error "ステージングバケットアクセスに失敗"
        fi
    else
        print_error "terraform-outputs.jsonが見つかりません"
        echo "解決方法: terraform output -json > terraform-outputs.json を実行してください"
    fi
}

# CloudFront状態確認
check_cloudfront() {
    print_step "CloudFront状態確認"
    
    if [ -f "terraform-outputs.json" ]; then
        PROD_DIST_ID=$(jq -r '.prod_cloudfront_distribution_id.value' terraform-outputs.json)
        STAGING_DIST_ID=$(jq -r '.staging_cloudfront_distribution_id.value' terraform-outputs.json)
        
        echo "本番ディストリビューション: $PROD_DIST_ID"
        PROD_STATUS=$(aws cloudfront get-distribution --id "$PROD_DIST_ID" --query 'Distribution.Status' --output text)
        print_success "本番ディストリビューション状態: $PROD_STATUS"
        
        echo ""
        echo "ステージングディストリビューション: $STAGING_DIST_ID"
        STAGING_STATUS=$(aws cloudfront get-distribution --id "$STAGING_DIST_ID" --query 'Distribution.Status' --output text)
        print_success "ステージングディストリビューション状態: $STAGING_STATUS"
    else
        print_error "terraform-outputs.jsonが見つかりません"
    fi
}

# Lambda@Edge状態確認
check_lambda_edge() {
    print_step "Lambda@Edge状態確認"
    
    LAMBDA_FUNCTION="basic-auth-staging"
    
    if aws lambda get-function --function-name "$LAMBDA_FUNCTION" --region us-east-1 &> /dev/null; then
        LAMBDA_STATUS=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION" --region us-east-1 --query 'Configuration.State' --output text)
        print_success "Lambda@Edge状態: $LAMBDA_STATUS"
        
        # 最新バージョン確認
        LATEST_VERSION=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION" --region us-east-1 --query 'Configuration.Version' --output text)
        echo "最新バージョン: $LATEST_VERSION"
    else
        print_error "Lambda@Edge関数が見つかりません"
    fi
}

# デプロイテスト
test_deployment() {
    print_step "デプロイテスト"
    
    echo "ビルドテストを実行中..."
    if npm run build &> /dev/null; then
        print_success "ビルドテスト成功"
    else
        print_error "ビルドテストに失敗"
        return
    fi
    
    echo "エクスポートテストを実行中..."
    if npm run export &> /dev/null; then
        print_success "エクスポートテスト成功"
    else
        print_error "エクスポートテストに失敗"
        return
    fi
    
    echo ""
    read -p "ステージング環境にテストデプロイしますか？ (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if npm run deploy:staging; then
            print_success "ステージングデプロイ成功"
        else
            print_error "ステージングデプロイに失敗"
        fi
    fi
}

# キャッシュクリア
clear_cache() {
    print_step "CloudFrontキャッシュクリア"
    
    if [ -f "terraform-outputs.json" ]; then
        PROD_DIST_ID=$(jq -r '.prod_cloudfront_distribution_id.value' terraform-outputs.json)
        STAGING_DIST_ID=$(jq -r '.staging_cloudfront_distribution_id.value' terraform-outputs.json)
        
        echo "1. 本番環境キャッシュクリア"
        echo "2. ステージング環境キャッシュクリア"
        echo "3. 両方"
        echo ""
        read -p "選択してください (1-3): " -n 1 -r
        echo ""
        
        case $REPLY in
            1)
                aws cloudfront create-invalidation --distribution-id "$PROD_DIST_ID" --paths "/*"
                print_success "本番環境キャッシュクリア開始"
                ;;
            2)
                aws cloudfront create-invalidation --distribution-id "$STAGING_DIST_ID" --paths "/*"
                print_success "ステージング環境キャッシュクリア開始"
                ;;
            3)
                aws cloudfront create-invalidation --distribution-id "$PROD_DIST_ID" --paths "/*"
                aws cloudfront create-invalidation --distribution-id "$STAGING_DIST_ID" --paths "/*"
                print_success "両環境キャッシュクリア開始"
                ;;
            *)
                print_warning "キャンセルしました"
                ;;
        esac
    else
        print_error "terraform-outputs.jsonが見つかりません"
    fi
}

# ログ確認
check_logs() {
    print_step "ログ確認"
    
    echo "1. Lambda@Edgeログ"
    echo "2. CloudFrontアクセスログ"
    echo "3. GitHub Actionsログ（ブラウザで開く）"
    echo ""
    read -p "選択してください (1-3): " -n 1 -r
    echo ""
    
    case $REPLY in
        1)
            echo "Lambda@Edgeログを確認中..."
            aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/us-east-1.basic-auth-staging" --region us-east-1
            ;;
        2)
            echo "CloudFrontアクセスログの設定を確認してください"
            echo "S3バケットにアクセスログが保存されている場合があります"
            ;;
        3)
            echo "GitHub Actionsログをブラウザで開いています..."
            open "https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
            ;;
        *)
            print_warning "キャンセルしました"
            ;;
    esac
}

# コスト確認
check_costs() {
    print_step "AWS利用コスト確認"
    
    CURRENT_MONTH=$(date +%Y-%m-01)
    NEXT_MONTH=$(date -d "$CURRENT_MONTH +1 month" +%Y-%m-01)
    
    echo "今月のコストを確認中..."
    aws ce get-cost-and-usage \
        --time-period Start="$CURRENT_MONTH",End="$NEXT_MONTH" \
        --granularity MONTHLY \
        --metrics BlendedCost \
        --group-by Type=DIMENSION,Key=SERVICE \
        --query 'ResultsByTime[0].Groups[?Metrics.BlendedCost.Amount>`0`].[Keys[0],Metrics.BlendedCost.Amount]' \
        --output table
}

# 全体ヘルスチェック
full_health_check() {
    print_step "全体ヘルスチェック"
    
    test_aws_connection
    check_s3_buckets
    check_cloudfront
    check_lambda_edge
    
    if [ -f "terraform-outputs.json" ]; then
        PROD_URL=$(jq -r '.prod_website_url.value' terraform-outputs.json)
        STAGING_URL=$(jq -r '.staging_website_url.value' terraform-outputs.json)
        
        echo ""
        echo "サイトアクセステスト:"
        echo "本番環境: $PROD_URL"
        echo "ステージング環境: $STAGING_URL"
        
        if curl -s -o /dev/null -w "%{http_code}" "$PROD_URL" | grep -q "200\|301\|302"; then
            print_success "本番環境アクセスOK"
        else
            print_error "本番環境アクセスに問題があります"
        fi
        
        if curl -s -o /dev/null -w "%{http_code}" -u admin:staging123 "$STAGING_URL" | grep -q "200\|301\|302"; then
            print_success "ステージング環境アクセスOK"
        else
            print_error "ステージング環境アクセスに問題があります"
        fi
    fi
    
    # プロジェクトのヘルスチェックも実行
    if [ -f "scripts/health-check.js" ]; then
        echo ""
        print_step "プロジェクトヘルスチェック実行"
        npm run health-check
    fi
}

# メイン処理
main() {
    while true; do
        show_menu
        read -p "選択してください (0-9): " -n 1 -r
        echo ""
        
        case $REPLY in
            1) test_aws_connection ;;
            2) check_s3_buckets ;;
            3) check_cloudfront ;;
            4) check_lambda_edge ;;
            5) test_deployment ;;
            6) clear_cache ;;
            7) check_logs ;;
            8) check_costs ;;
            9) full_health_check ;;
            0) 
                echo "トラブルシューティングツールを終了します"
                exit 0
                ;;
            *)
                print_warning "無効な選択です"
                ;;
        esac
        
        echo ""
        read -p "Enterキーを押して続行..."
    done
}

# jqがインストールされているかチェック
if ! command -v jq &> /dev/null; then
    print_warning "jqがインストールされていません。一部の機能が制限されます。"
    echo "インストール方法: brew install jq"
    echo ""
fi

main