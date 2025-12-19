# AWS環境構築 詳細手順書

## 1. 前提条件の準備

### 1.1 必要ツールのインストール

```bash
# インストールスクリプトを実行
./setup-aws-tools.sh
```

### 1.2 AWSアカウントの準備

1. AWSアカウントを作成（未作成の場合）
2. IAMユーザーを作成し、以下の権限を付与：
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - `AWSLambda_FullAccess`
   - `IAMFullAccess`

### 1.3 AWS CLIの設定

```bash
# AWS CLIの設定
aws configure

# 入力項目：
# AWS Access Key ID: [IAMユーザーのアクセスキー]
# AWS Secret Access Key: [IAMユーザーのシークレットキー]
# Default region name: ap-northeast-1
# Default output format: json
```

## 2. Terraformでのインフラ構築

### 2.1 Terraformの初期化

```bash
cd terraform
terraform init
```

### 2.2 変数ファイルの作成

```bash
# terraform.tfvarsファイルを作成
cat > terraform.tfvars << EOF
prod_bucket_name = "ai-tech-journal-prod-$(date +%s)"
staging_bucket_name = "ai-tech-journal-staging-$(date +%s)"
basic_auth_password = "staging123"
EOF
```

### 2.3 インフラの計画確認

```bash
# 実行計画を確認
terraform plan
```

### 2.4 インフラの構築

```bash
# インフラを構築
terraform apply

# 確認メッセージで 'yes' を入力
```

### 2.5 出力値の確認

```bash
# 構築されたリソースの情報を確認
terraform output
```

## 3. GitHub Secretsの設定

### 3.1 必要なSecrets

Terraformの出力値を使用して、以下のSecretsをGitHubリポジトリに設定：

```bash
# Terraform出力から値を取得
terraform output -json > terraform-outputs.json
```

### 3.2 GitHub Secretsに設定する値

| Secret名 | 値の取得方法 |
|----------|-------------|
| `AWS_ACCESS_KEY_ID` | IAMユーザーのアクセスキー |
| `AWS_SECRET_ACCESS_KEY` | IAMユーザーのシークレットキー |
| `S3_BUCKET_PROD` | `terraform output prod_bucket_name` |
| `S3_BUCKET_STAGING` | `terraform output staging_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID_PROD` | `terraform output prod_cloudfront_distribution_id` |
| `CLOUDFRONT_DISTRIBUTION_ID_STAGING` | `terraform output staging_cloudfront_distribution_id` |
| `OPENAI_API_KEY` | OpenAIのAPIキー |
| `EMAIL_RECIPIENT` | レポート送信先メールアドレス |

### 3.3 GitHub Secretsの設定手順

1. GitHubリポジトリページを開く
2. Settings → Secrets and variables → Actions
3. "New repository secret"をクリック
4. 上記の表に従ってSecretsを追加

## 4. 環境変数ファイルの更新

### 4.1 本番環境設定

```bash
# .env.productionを更新
cat > .env.production << EOF
NEXT_PUBLIC_SITE_URL=https://$(terraform output -raw prod_cloudfront_domain)
NEXT_PUBLIC_ENVIRONMENT=production
OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_PROD=$(terraform output -raw prod_bucket_name)
CLOUDFRONT_DISTRIBUTION_ID_PROD=$(terraform output -raw prod_cloudfront_distribution_id)
EMAIL_RECIPIENT=your_email@example.com
EOF
```

### 4.2 ステージング環境設定

```bash
# .env.stagingを更新
cat > .env.staging << EOF
NEXT_PUBLIC_SITE_URL=https://$(terraform output -raw staging_cloudfront_domain)
NEXT_PUBLIC_ENVIRONMENT=staging
OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_STAGING=$(terraform output -raw staging_bucket_name)
CLOUDFRONT_DISTRIBUTION_ID_STAGING=$(terraform output -raw staging_cloudfront_distribution_id)
EMAIL_RECIPIENT=your_email@example.com
EOF
```

## 5. デプロイテスト

### 5.1 手動デプロイテスト

```bash
# ビルドテスト
npm run build
npm run export

# ステージング環境へのデプロイテスト
npm run deploy:staging

# 本番環境へのデプロイテスト
npm run deploy:production
```

### 5.2 自動デプロイテスト

```bash
# stagingブランチを作成してプッシュ
git checkout -b staging
git push origin staging

# mainブランチにマージしてプッシュ
git checkout main
git merge staging
git push origin main
```

## 6. 動作確認

### 6.1 サイトアクセス確認

```bash
# 本番環境URL
echo "本番環境: https://$(terraform output -raw prod_cloudfront_domain)"

# ステージング環境URL（Basic認証: admin/staging123）
echo "ステージング環境: https://$(terraform output -raw staging_cloudfront_domain)"
```

### 6.2 ヘルスチェック実行

```bash
# ヘルスチェックを実行
npm run health-check
```

## 7. 監視・メンテナンス

### 7.1 CloudWatchでの監視

- CloudFrontのメトリクス確認
- S3のアクセスログ確認
- Lambda@Edgeのログ確認

### 7.2 定期メンテナンス

```bash
# 月次コスト確認
aws ce get-cost-and-usage --time-period Start=2025-12-01,End=2025-12-31 --granularity MONTHLY --metrics BlendedCost

# リソース使用状況確認
aws s3 ls s3://$(terraform output -raw prod_bucket_name) --recursive --human-readable --summarize
```

## 8. トラブルシューティング

### 8.1 よくある問題

#### S3バケット名の重複
```bash
# 新しいバケット名で再実行
terraform apply -var="prod_bucket_name=ai-tech-journal-prod-$(date +%s)"
```

#### CloudFrontのキャッシュ問題
```bash
# キャッシュを手動で無効化
aws cloudfront create-invalidation --distribution-id $(terraform output -raw prod_cloudfront_distribution_id) --paths "/*"
```

#### Lambda@Edgeのデプロイエラー
```bash
# Lambda関数を再デプロイ
terraform taint aws_lambda_function.basic_auth
terraform apply
```

### 8.2 ログの確認方法

```bash
# CloudFrontのログ確認
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/us-east-1.basic-auth-staging"

# S3のアクセスログ確認（設定されている場合）
aws s3 ls s3://your-access-logs-bucket/
```

## 9. セキュリティ設定

### 9.1 IAMポリシーの最小権限化

```bash
# 本番運用用の最小権限IAMポリシーを作成
aws iam create-policy --policy-name AITechJournalMinimal --policy-document file://minimal-policy.json
```

### 9.2 S3バケットポリシーの確認

```bash
# バケットポリシーを確認
aws s3api get-bucket-policy --bucket $(terraform output -raw prod_bucket_name)
```

## 10. コスト最適化

### 10.1 S3ライフサイクル設定

```bash
# 古いファイルの自動削除設定
aws s3api put-bucket-lifecycle-configuration --bucket $(terraform output -raw prod_bucket_name) --lifecycle-configuration file://lifecycle.json
```

### 10.2 CloudFrontキャッシュ最適化

- TTL設定の調整
- 圧縮設定の有効化
- 不要なヘッダーの除去

---

## 完了チェックリスト

- [ ] AWS CLIの設定完了
- [ ] Terraformでのインフラ構築完了
- [ ] GitHub Secretsの設定完了
- [ ] 環境変数ファイルの更新完了
- [ ] 手動デプロイテスト成功
- [ ] 自動デプロイテスト成功
- [ ] 本番・ステージング環境のアクセス確認
- [ ] ヘルスチェック成功
- [ ] 監視設定完了

この手順書に従って進めることで、AI Technology JournalのAWS環境を完全に構築できます。