// CloudFront Lambda@Edge function for Basic Authentication
exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;
    
    // Basic認証の設定
    const authUser = 'admin';
    const authPass = 'staging2025!';
    
    // Authorization ヘッダーをチェック
    const authString = 'Basic ' + Buffer.from(authUser + ':' + authPass).toString('base64');
    
    if (typeof headers.authorization == 'undefined' || headers.authorization[0].value != authString) {
        const body = 'Unauthorized';
        const response = {
            status: '401',
            statusDescription: 'Unauthorized',
            body: body,
            headers: {
                'www-authenticate': [{key: 'WWW-Authenticate', value:'Basic'}]
            },
        };
        callback(null, response);
    }
    
    callback(null, request);
};