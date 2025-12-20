#!/usr/bin/env node

const { execSync } = require('child_process')

console.log('🔧 Fixing S3 static website hosting configuration...')

const bucketName = 'ai-tech-journal-staging-1766124861'

try {
  console.log('📝 Setting website configuration...')
  
  // ウェブサイト設定を適用
  const websiteConfig = {
    "IndexDocument": {
      "Suffix": "index.html"
    },
    "ErrorDocument": {
      "Key": "404.html"
    }
  }
  
  // 一時ファイルに設定を保存
  require('fs').writeFileSync('/tmp/website-config.json', JSON.stringify(websiteConfig, null, 2))
  
  // ウェブサイト設定を適用
  execSync(`aws s3api put-bucket-website --bucket ${bucketName} --website-configuration file:///tmp/website-config.json`, { stdio: 'inherit' })
  
  console.log('🌐 Setting bucket policy for public read access...')
  
  // パブリック読み取りポリシー
  const bucketPolicy = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": `arn:aws:s3:::${bucketName}/*`
      }
    ]
  }
  
  // 一時ファイルにポリシーを保存
  require('fs').writeFileSync('/tmp/bucket-policy.json', JSON.stringify(bucketPolicy, null, 2))
  
  // バケットポリシーを適用
  execSync(`aws s3api put-bucket-policy --bucket ${bucketName} --policy file:///tmp/bucket-policy.json`, { stdio: 'inherit' })
  
  console.log('🔓 Disabling block public access...')
  
  // パブリックアクセスブロックを無効化
  execSync(`aws s3api put-public-access-block --bucket ${bucketName} --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"`, { stdio: 'inherit' })
  
  console.log('📄 Setting correct content types...')
  
  // HTMLファイルのContent-Typeを修正
  try {
    execSync(`aws s3 cp s3://${bucketName}/ s3://${bucketName}/ --recursive --metadata-directive REPLACE --content-type "text/html" --exclude "*" --include "*.html"`, { stdio: 'inherit' })
  } catch (error) {
    console.log('⚠️ Content-Type setting failed (files may not exist yet)')
  }
  
  // 一時ファイルを削除
  require('fs').unlinkSync('/tmp/website-config.json')
  require('fs').unlinkSync('/tmp/bucket-policy.json')
  
  console.log('\n✅ S3 static website hosting configuration completed!')
  console.log(`🌐 Website URL: http://${bucketName}.s3-website-ap-northeast-1.amazonaws.com`)
  console.log('💡 Please wait a few minutes for changes to take effect')
  
} catch (error) {
  console.error('❌ Configuration failed:', error.message)
  console.log('💡 Make sure AWS CLI is configured with proper permissions')
  process.exit(1)
}