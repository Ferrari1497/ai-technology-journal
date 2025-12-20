#!/bin/bash

echo "🔧 Fixing S3 staging website configuration..."

BUCKET_NAME="ai-tech-journal-staging-1766124861"

# 1. パブリックアクセスブロックを無効化
echo "🔓 Disabling public access block..."
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# 2. バケットポリシーを設定
echo "📝 Setting bucket policy..."
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json

# 3. ウェブサイト設定を適用
echo "🌐 Setting website configuration..."
cat > /tmp/website-config.json << EOF
{
  "IndexDocument": {
    "Suffix": "index.html"
  },
  "ErrorDocument": {
    "Key": "404.html"
  }
}
EOF

aws s3api put-bucket-website --bucket $BUCKET_NAME --website-configuration file:///tmp/website-config.json

# 4. 既存ファイルのContent-Typeを修正
echo "📄 Fixing content types..."
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ --recursive --metadata-directive REPLACE --content-type "text/html" --exclude "*" --include "*.html" || echo "No HTML files found"

# 5. 一時ファイルを削除
rm -f /tmp/bucket-policy.json /tmp/website-config.json

echo "✅ S3 website configuration completed!"
echo "🌐 Website URL: http://$BUCKET_NAME.s3-website-ap-northeast-1.amazonaws.com"
echo "⏰ Please wait 2-3 minutes for changes to propagate"