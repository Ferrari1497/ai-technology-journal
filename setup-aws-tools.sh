#!/bin/bash

echo "=== AWS環境構築ツールのインストール ==="

# Homebrewがインストールされているか確認
if ! command -v brew &> /dev/null; then
    echo "Homebrewをインストールしています..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# AWS CLIのインストール
echo "AWS CLIをインストールしています..."
brew install awscli

# Terraformのインストール
echo "Terraformをインストールしています..."
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# インストール確認
echo "=== インストール確認 ==="
aws --version
terraform version

echo "=== 次のステップ ==="
echo "1. AWS CLIの設定: aws configure"
echo "2. Terraformでインフラ構築: cd terraform && terraform init"