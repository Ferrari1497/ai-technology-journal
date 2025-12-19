/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  

  
  // 静的エクスポートではheadersとredirectsは使用不可
  
  // 環境別のwebpack設定
  webpack: (config, { dev, isServer }) => {
    // 開発環境でのみ有効な設定
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    return config
  },
}

module.exports = nextConfig