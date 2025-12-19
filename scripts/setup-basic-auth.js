const fs = require('fs')
const path = require('path')

function setupBasicAuth() {
  console.log('🔐 検証環境用BASIC認証設定...')
  
  // 環境変数の確認
  const username = process.env.BASIC_AUTH_USER || 'admin'
  const password = process.env.BASIC_AUTH_PASS || 'staging123'
  
  console.log(`認証情報:`)
  console.log(`ユーザー名: ${username}`)
  console.log(`パスワード: ${password}`)
  
  // Lambda@Edge関数の更新
  const lambdaCode = `
exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;
    
    const authUser = '${username}';
    const authPass = '${password}';
    const authString = 'Basic ' + Buffer.from(authUser + ':' + authPass).toString('base64');
    
    if (typeof headers.authorization == 'undefined' || headers.authorization[0].value != authString) {
        const response = {
            status: '401',
            statusDescription: 'Unauthorized',
            body: 'Unauthorized - Staging Environment',
            headers: {
                'www-authenticate': [{key: 'WWW-Authenticate', value: 'Basic realm="Staging Environment"'}],
                'content-type': [{key: 'Content-Type', value: 'text/plain'}]
            }
        };
        return response;
    }
    
    return request;
};
  `.trim()
  
  // Lambda関数ファイルを更新
  const lambdaPath = path.join(process.cwd(), 'terraform', 'lambda-basic-auth.js')
  fs.writeFileSync(lambdaPath, lambdaCode)
  
  console.log('✅ Lambda@Edge関数を更新しました')
  console.log('📋 次のステップ:')
  console.log('1. cd terraform')
  console.log('2. terraform plan')
  console.log('3. terraform apply')
  console.log('')
  console.log('🌐 検証環境アクセス情報:')
  console.log(`URL: https://staging.ai-tech-journal.com`)
  console.log(`ユーザー名: ${username}`)
  console.log(`パスワード: ${password}`)
}

// 実行
if (require.main === module) {
  setupBasicAuth()
}

module.exports = { setupBasicAuth }