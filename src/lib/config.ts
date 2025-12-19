// 環境別設定管理
export const config = {
  // 環境判定
  isDevelopment: process.env.NODE_ENV === 'development',
  isStaging: process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging',
  isProduction: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
  
  // サイト設定
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  
  // AWS設定
  aws: {
    region: process.env.AWS_REGION || 'ap-northeast-1',
    s3Bucket: process.env.S3_BUCKET || 'ai-tech-journal-dev',
    cloudFrontDistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID || '',
  },
  
  // OpenAI設定
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    enabled: process.env.ARTICLE_GENERATION_ENABLED === 'true',
  },
  
  // メール設定
  email: {
    recipient: process.env.EMAIL_RECIPIENT || '',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  
  // Google Analytics
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || '',
  },
  
  // 機能フラグ
  features: {
    articleGeneration: process.env.ARTICLE_GENERATION_ENABLED === 'true',
    autoPublish: process.env.AUTO_PUBLISH_ENABLED === 'true',
    basicAuth: process.env.BASIC_AUTH_ENABLED === 'true',
    securityHeaders: process.env.SECURITY_HEADERS_ENABLED === 'true',
    rateLimiting: process.env.RATE_LIMITING_ENABLED === 'true',
  },
  
  // Basic認証設定
  basicAuth: {
    user: process.env.BASIC_AUTH_USER || 'admin',
    pass: process.env.BASIC_AUTH_PASS || '',
  },
}

// 環境別のロギング設定
export const logger = {
  level: config.isProduction ? 'error' : 'debug',
  enabled: !config.isProduction,
  
  debug: (message: string, ...args: any[]) => {
    if (logger.enabled && logger.level === 'debug') {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (logger.enabled) {
      console.info(`[INFO] ${message}`, ...args)
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args)
  },
}

// 環境別のデバッグ情報表示
if (config.isDevelopment) {
  logger.debug('Environment Configuration:', {
    environment: config.environment,
    siteUrl: config.siteUrl,
    features: config.features,
  })
}