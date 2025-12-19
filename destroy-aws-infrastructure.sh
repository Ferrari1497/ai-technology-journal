#!/bin/bash

echo "🛑 AWS環境の削除を開始します..."
echo "=================================================="

# 現在のディレクトリを確認
if [ ! -f "terraform/main.tf" ]; then
    echo "❌ terraformディレクトリが見つかりません"
    echo "   このスクリプトはプロジェクトのルートディレクトリで実行してください"
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

echo "⚠️  以下のAWSリソースが削除されます："
echo "   - S3バケット（本番・ステージング）"
echo "   - S3バケット内の全ファイル"
echo "   - バケットポリシー"
echo "   - ウェブサイト設定"
echo ""

# 現在のリソースを表示
if [ -f "terraform/terraform.tfstate" ]; then
    echo "📋 現在のリソース："
    echo "   - 本番バケット: $(grep -A 5 '"prod_bucket_name"' terraform/terraform.tfstate | grep '"value"' | cut -d'"' -f4 2>/dev/null || echo '不明')"
    echo "   - ステージングバケット: $(grep -A 5 '"staging_bucket_name"' terraform/terraform.tfstate | grep '"value"' | cut -d'"' -f4 2>/dev/null || echo '不明')"
    echo ""
fi

# 確認プロンプト
read -p "❓ 本当にAWS環境を削除しますか？ (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ 削除をキャンセルしました"
    exit 0
fi

echo ""
echo "🗑️  AWS環境の削除を開始します..."

# terraformディレクトリに移動
cd terraform

# S3バケットの内容を削除（Terraformで削除する前に必要）
echo "📦 S3バケットの内容を削除中..."

# バケット名を取得
PROD_BUCKET=$(terraform output -raw prod_bucket_name 2>/dev/null)
STAGING_BUCKET=$(terraform output -raw staging_bucket_name 2>/dev/null)

# 本番バケットの内容を削除
if [ -n "$PROD_BUCKET" ] && [ "$PROD_BUCKET" != "" ]; then
    echo "   本番バケット ($PROD_BUCKET) の内容を削除中..."
    aws s3 rm s3://$PROD_BUCKET --recursive 2>/dev/null || echo "   バケットが空または存在しません"
fi

# ステージングバケットの内容を削除
if [ -n "$STAGING_BUCKET" ] && [ "$STAGING_BUCKET" != "" ]; then
    echo "   ステージングバケット ($STAGING_BUCKET) の内容を削除中..."
    aws s3 rm s3://$STAGING_BUCKET --recursive 2>/dev/null || echo "   バケットが空または存在しません"
fi

echo "✅ S3バケットの内容削除完了"
echo ""

# Terraformでインフラを削除
echo "🏗️  Terraformでインフラを削除中..."
terraform destroy -auto-approve

if [ $? -eq 0 ]; then
    echo "✅ AWS環境の削除が完了しました！"
    echo ""
    echo "💰 料金節約効果："
    echo "   - S3ストレージ料金: $0/月"
    echo "   - S3リクエスト料金: $0/月"
    echo "   - データ転送料金: $0/月"
    echo ""
    echo "🔄 環境を再構築する場合："
    echo "   ./setup-aws-infrastructure.sh を実行してください"
else
    echo "❌ AWS環境の削除中にエラーが発生しました"
    echo ""
    echo "🔧 手動での対処が必要な場合："
    echo "   1. AWSコンソールでS3バケットを確認"
    echo "   2. 残っているリソースを手動削除"
    echo "   3. terraform destroy を再実行"
    exit 1
fi

# 元のディレクトリに戻る
cd ..

echo ""
echo "=================================================="
echo "AWS環境削除完了"