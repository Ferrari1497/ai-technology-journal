# Terraform Infrastructure Setup

## 前提条件

1. AWS CLIがインストール・設定済み
2. Terraformがインストール済み
3. 適切なIAM権限を持つAWSアカウント

## デプロイ手順

### 1. 初期化

```bash
cd terraform
terraform init
```

### 2. 変数設定

```bash
# variables.tfの値を確認・調整
# または terraform.tfvarsファイルを作成
```

### 3. プラン確認

```bash
terraform plan \
  -var="prod_bucket_name=ai-tech-journal-prod" \
  -var="staging_bucket_name=ai-tech-journal-staging"
```

### 4. インフラ構築

```bash
terraform apply \
  -var="prod_bucket_name=ai-tech-journal-prod" \
  -var="staging_bucket_name=ai-tech-journal-staging"
```

## 構築されるリソース

### 本番環境
- S3バケット（静的ホスティング）
- CloudFront配信
- OAI（Origin Access Identity）

### ステージング環境
- S3バケット（静的ホスティング）
- CloudFront配信（BASIC認証付き）
- Lambda@Edge（認証機能）
- IAMロール

## BASIC認証情報

**ステージング環境:**
- ユーザー名: `admin`
- パスワード: `staging123`

## 出力情報

デプロイ完了後、以下の情報が出力されます:

- 本番サイトURL
- ステージングサイトURL
- CloudFront Distribution ID（本番・ステージング）
- S3バケット名（本番・ステージング）

## GitHub Secretsに設定する値

```
S3_BUCKET_PROD=<prod_bucket_name>
S3_BUCKET_STAGING=<staging_bucket_name>
CLOUDFRONT_DISTRIBUTION_ID_PROD=<prod_distribution_id>
CLOUDFRONT_DISTRIBUTION_ID_STAGING=<staging_distribution_id>
```

## 削除

```bash
terraform destroy \
  -var="prod_bucket_name=ai-tech-journal-prod" \
  -var="staging_bucket_name=ai-tech-journal-staging"
```