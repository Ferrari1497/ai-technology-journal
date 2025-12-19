# 検証環境のみ構築 - クイックスタートガイド

## 🧪 検証環境のみ構築（本番環境は別日）

### ステップ1: 必要ツールのインストール
```bash
./setup-aws-tools.sh
```

### ステップ2: AWS CLIの設定
```bash
aws configure
```

**入力項目**:
- AWS Access Key ID: [IAMユーザーのアクセスキー]
- AWS Secret Access Key: [IAMユーザーのシークレットキー]  
- Default region name: `ap-northeast-1`
- Default output format: `json`

### ステップ3: 検証環境の構築
```bash
./setup-staging-only.sh
```

**このスクリプトが実行する内容**:
- 検証環境専用のS3バケット作成
- 静的ウェブサイトホスティング設定
- パブリックアクセス設定
- .env.stagingファイル生成

### ステップ4: 環境変数の設定
```bash
nano .env.staging
```

以下の値を実際の値に変更：
- `OPENAI_API_KEY=your_openai_api_key_here`
- `AWS_ACCESS_KEY_ID=your_aws_access_key_here`
- `AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here`
- `EMAIL_RECIPIENT=your_email@example.com`

### ステップ5: テストデプロイ
```bash
npm run deploy:staging
```

## 📊 構築される内容

✅ **検証環境のみ**:
- S3バケット（ステージング）
- 静的ウェブサイトホスティング
- パブリックアクセス設定

❌ **構築されない**:
- 本番環境のS3バケット
- CloudFront
- Lambda@Edge

## 💰 料金目安

検証環境のみの月額料金：
- S3ストレージ: ~$1-5
- S3リクエスト: ~$0.1-1
- データ転送: ~$0.1-2

**合計: 月額 $1-8程度**

## 🔧 GitHub Secrets設定

構築完了後、以下をGitHub Secretsに設定：

```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_STAGING=ai-tech-journal-staging-[timestamp]
OPENAI_API_KEY=your_openai_api_key
```

## 🗑️ 環境削除

検証完了後、料金節約のため削除：

```bash
./destroy-aws-infrastructure.sh
```

## ✅ 完了確認

構築完了後、以下が利用可能：
- 検証環境URL: `http://[バケット名].s3-website-ap-northeast-1.amazonaws.com`
- 自動デプロイ: GitHub Actionsでstagingブランチ
- 記事生成テスト: Daily Article Generation

## 🚀 本番環境構築

検証環境での動作確認後、別日に本番環境を構築：

```bash
./setup-aws-infrastructure.sh  # 本番+検証両方
```