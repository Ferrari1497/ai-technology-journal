#!/bin/bash

# 生成されたファイルの確認スクリプト
echo "🔍 生成されたファイルの確認を開始します..."
echo "=================================================="

# 必要なファイルのリスト
declare -a required_files=(
    ".env.production"
    ".env.staging"
    "terraform/terraform.tfvars"
    "terraform/outputs.tf"
)

# オプションファイルのリスト
declare -a optional_files=(
    ".env.local"
    "terraform/.terraform/terraform.tfstate"
    "terraform/terraform.tfstate"
)

echo "📋 必須ファイルの確認:"
echo "----------------------"

all_required_exist=true

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - 存在"
        # ファイルサイズも表示
        size=$(wc -c < "$file" 2>/dev/null || echo "0")
        echo "   サイズ: ${size} bytes"
    else
        echo "❌ $file - 不足"
        all_required_exist=false
    fi
done

echo ""
echo "📋 オプションファイルの確認:"
echo "----------------------------"

for file in "${optional_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - 存在"
        size=$(wc -c < "$file" 2>/dev/null || echo "0")
        echo "   サイズ: ${size} bytes"
    else
        echo "ℹ️  $file - 未作成（オプション）"
    fi
done

echo ""
echo "🔧 環境変数ファイルの内容確認:"
echo "------------------------------"

# .env.productionの確認
if [ -f ".env.production" ]; then
    echo "📄 .env.production:"
    echo "   設定項目数: $(grep -c "=" .env.production 2>/dev/null || echo "0")"
    echo "   未設定項目:"
    grep "your_.*_here\|example\.com" .env.production 2>/dev/null | sed 's/^/   - /' || echo "   なし"
fi

# .env.stagingの確認
if [ -f ".env.staging" ]; then
    echo "📄 .env.staging:"
    echo "   設定項目数: $(grep -c "=" .env.staging 2>/dev/null || echo "0")"
    echo "   未設定項目:"
    grep "your_.*_here\|example\.com" .env.staging 2>/dev/null | sed 's/^/   - /' || echo "   なし"
fi

echo ""
echo "🏗️  Terraformファイルの確認:"
echo "----------------------------"

if [ -f "terraform/terraform.tfvars" ]; then
    echo "✅ terraform.tfvars - 存在"
    echo "   設定項目数: $(grep -c "=" terraform/terraform.tfvars 2>/dev/null || echo "0")"
else
    echo "❌ terraform.tfvars - 不足"
fi

if [ -d "terraform/.terraform" ]; then
    echo "✅ Terraform初期化済み"
else
    echo "❌ Terraform未初期化"
fi

if [ -f "terraform/terraform.tfstate" ]; then
    echo "✅ Terraformステート存在"
    # リソース数を確認
    resource_count=$(grep -c '"type":' terraform/terraform.tfstate 2>/dev/null || echo "0")
    echo "   作成済みリソース数: $resource_count"
else
    echo "ℹ️  Terraformステート未作成（まだapplyしていない）"
fi

echo ""
echo "📊 総合結果:"
echo "============"

if [ "$all_required_exist" = true ]; then
    echo "✅ 必須ファイルは全て存在しています"
    
    # 未設定項目のチェック
    unset_count=0
    if [ -f ".env.production" ]; then
        unset_count=$((unset_count + $(grep -c "your_.*_here\|example\.com" .env.production 2>/dev/null || echo "0")))
    fi
    if [ -f ".env.staging" ]; then
        unset_count=$((unset_count + $(grep -c "your_.*_here\|example\.com" .env.staging 2>/dev/null || echo "0")))
    fi
    
    if [ $unset_count -eq 0 ]; then
        echo "✅ 環境変数の設定も完了しています"
        echo ""
        echo "🎉 セットアップ完了！次のステップに進めます："
        echo "   1. GitHub Secretsの設定"
        echo "   2. テストデプロイの実行: npm run deploy:staging"
    else
        echo "⚠️  環境変数に未設定項目があります（$unset_count 個）"
        echo ""
        echo "📝 次のステップ："
        echo "   1. .env.production と .env.staging の編集"
        echo "   2. GitHub Secretsの設定"
        echo "   3. テストデプロイの実行"
    fi
else
    echo "❌ 必須ファイルが不足しています"
    echo ""
    echo "🔧 対処方法："
    echo "   1. ./setup-aws-infrastructure.sh を再実行"
    echo "   2. エラーメッセージを確認して問題を解決"
fi

echo ""
echo "=================================================="
echo "ファイル確認完了"