# AWS環境構築 - クイックスタートガイド

## 🚀 実行手順（順番通りに実行）

### ステップ1: 必要ツールのインストール
```bash
./setup-aws-tools.sh
```

**注意**: Homebrewのインストールで管理者パスワードが求められる場合があります。

### ステップ2: AWS CLIの設定
```bash
aws configure
```

**入力が必要な項目**:
- AWS Access Key ID: [IAMユーザーのアクセスキー]
- AWS Secret Access Key: [IAMユーザーのシークレットキー]  
- Default region name: `ap-northeast-1`
- Default output format: `json`

**⚠️ 事前準備が必要**: AWSアカウントとIAMユーザーの作成

### ステップ3: AWS環境の自動構築
```bash
./setup-aws-infrastructure.sh
```

**このスクリプトが自動実行する内容**:
- Terraform変数ファイル作成
- Terraformの初期化
- インフラ構築の実行計画表示
- ユーザー確認後にインフラ構築
- 環境変数ファイルの更新

### ステップ4: 生成されたファイルの確認
```bash
./check-generated-files.sh
```

**確認される内容**:
- 必須ファイルの存在確認
- 環境変数の設定状況
- Terraformの状態確認
- 次のステップの案内

## 📋 事前に準備が必要なもの

### 1. AWSアカウント
- AWSアカウントを作成
- 請求情報の設定

### 2. IAMユーザーの作成
AWSコンソールで以下の権限を持つIAMユーザーを作成：
- `AmazonS3FullAccess`
- `CloudFrontFullAccess` 
- `AWSLambda_FullAccess`
- `IAMFullAccess`

### 3. OpenAI APIキー
- OpenAIアカウント作成
- APIキーの取得

## ⏱️ 実行時間の目安

- ステップ1: 5-10分（初回のみ）
- ステップ2: 1分
- ステップ3: 10-15分
- ステップ4: 1分

## 🔧 実行後の手動設定

### 1. APIキーの設定
```bash
# .env.productionと.env.stagingファイルを編集
nano .env.production
nano .env.staging
```

以下の値を実際の値に変更：
- `OPENAI_API_KEY=your_openai_api_key_here`
- `AWS_ACCESS_KEY_ID=your_aws_access_key_here`
- `AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here`
- `EMAIL_RECIPIENT=your_email@example.com`

### 2. GitHub Secretsの設定
スクリプト実行後に表示される情報をGitHub Secretsに設定

### 3. テストデプロイ
```bash
npm run deploy:staging
```

## 🚨 よくある問題と解決方法

### Homebrewのインストールでエラー
```bash
# 手動でHomebrewをインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### AWS認証エラー
```bash
# 認証情報を再設定
aws configure
```

### Terraformエラー
```bash
# 初期化をやり直し
cd terraform
rm -rf .terraform
terraform init
```

### S3バケット名の重複エラー
```bash
# スクリプトを再実行（自動的に新しいタイムスタンプが使用される）
./setup-aws-infrastructure.sh
```

## 🔍 トラブルシューティング

問題が発生した場合：
```bash
./aws-troubleshoot.sh
```

## ✅ 完了確認

全て完了すると以下が利用可能になります：
- 本番環境URL: `https://[CloudFrontドメイン]`
- ステージング環境URL: `https://[CloudFrontドメイン]` (admin/staging123)
- 自動デプロイ: GitHub Actionsでmainブランチとstagingブランチ