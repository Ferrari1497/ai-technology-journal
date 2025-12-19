# 検証環境構築ガイド

## 🔐 BASIC認証付き検証環境の構築

### 1. AWS環境構築

```bash
# Terraformディレクトリに移動
cd terraform

# 初期化
terraform init

# プラン確認
terraform plan -var="prod_bucket_name=ai-tech-journal-prod" -var="staging_bucket_name=ai-tech-journal-staging"

# インフラ構築
terraform apply
```

### 2. GitHub Secrets設定

以下のシークレットをGitHubリポジトリに設定：

```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_STAGING=ai-tech-journal-staging
S3_BUCKET_PROD=ai-tech-journal-prod
CLOUDFRONT_DISTRIBUTION_ID_STAGING=your_staging_distribution_id
CLOUDFRONT_DISTRIBUTION_ID_PROD=your_prod_distribution_id
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=your_secure_password
```

### 3. 検証環境用記事生成

```bash
# 既存のサンプル記事をクリア
npm run staging:clear

# 検証用記事を生成（各種3記事ずつ）
npm run staging:setup

# または個別に生成
npm run staging:daily 3   # 日次記事を3記事
npm run staging:news 3    # AIニュース記事を3記事
npm run staging:tools 3   # ツール記事を3記事
```

### 4. BASIC認証設定

```bash
# BASIC認証設定を更新
npm run staging:auth

# Terraformで認証機能をデプロイ
cd terraform
terraform apply
```

### 5. 検証環境デプロイ

```bash
# stagingブランチにプッシュして自動デプロイ
git checkout -b staging
git add .
git commit -m "Setup staging environment"
git push origin staging

# または手動デプロイ
npm run deploy:staging
```

## 🌐 アクセス情報

### 検証環境URL
- **URL**: https://staging.ai-tech-journal.com
- **ユーザー名**: admin
- **パスワード**: staging123 (変更推奨)

### 本番環境URL
- **URL**: https://ai-tech-journal.com
- **認証**: なし（一般公開）

## 🔧 検証環境の特徴

### セキュリティ
- ✅ BASIC認証による制限アクセス
- ✅ robots.txtで検索エンジンをブロック
- ✅ 本番環境とは完全分離

### コンテンツ
- ✅ サンプル記事は非表示
- ✅ 本番同様の記事生成プロセス
- ✅ 3言語対応（日本語、英語、タイ語）

### 機能
- ✅ 全機能が本番環境と同等
- ✅ SEO・サイトマップ機能
- ✅ PDCA最適化システム

## 📋 検証項目チェックリスト

### 基本機能
- [ ] ホームページの表示
- [ ] 記事一覧の表示
- [ ] 個別記事の表示
- [ ] 多言語切り替え
- [ ] レスポンシブデザイン

### 記事生成機能
- [ ] 日次記事の生成
- [ ] AIニュース記事の生成
- [ ] ツール記事の生成
- [ ] 多言語対応の確認

### SEO機能
- [ ] サイトマップの生成
- [ ] robots.txtの設定
- [ ] メタデータの設定
- [ ] 構造化データの確認

### 自動化機能
- [ ] GitHub Actionsの動作
- [ ] 自動デプロイの確認
- [ ] PDCA最適化の動作

## 🚨 注意事項

1. **認証情報の管理**
   - パスワードは定期的に変更
   - GitHub Secretsで安全に管理

2. **検索エンジン対策**
   - robots.txtで検索エンジンをブロック
   - noindexメタタグの設定

3. **データの分離**
   - 本番環境とは完全に分離
   - テストデータのみ使用

## 🔄 更新手順

### 記事の更新
```bash
# 記事をクリアして再生成
npm run staging:clear
npm run staging:all 3
```

### 設定の更新
```bash
# 認証設定の更新
npm run staging:auth

# Terraformで反映
cd terraform
terraform apply
```