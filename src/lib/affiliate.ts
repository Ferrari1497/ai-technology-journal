export interface AffiliateLink {
  toolId: string
  affiliateUrl: string
  commission: number // 成約単価（円）
  provider: string // ASP名
}

export const affiliateLinks: AffiliateLink[] = [
  {
    toolId: 'chatgpt-plus',
    affiliateUrl: 'https://openai.com/chatgpt?ref=affiliate123',
    commission: 5000,
    provider: 'Direct'
  },
  {
    toolId: 'claude-pro',
    affiliateUrl: 'https://claude.ai?ref=affiliate456',
    commission: 4500,
    provider: 'Direct'
  },
  {
    toolId: 'github-copilot',
    affiliateUrl: 'https://github.com/features/copilot?ref=affiliate789',
    commission: 3000,
    provider: 'GitHub Partners'
  }
]

export function getAffiliateUrl(toolId: string): string | null {
  const affiliate = affiliateLinks.find(link => link.toolId === toolId)
  return affiliate?.affiliateUrl || null
}

export function trackClick(toolId: string, url: string) {
  if (typeof window !== 'undefined') {
    // ローカル環境ではコンソールログ、本番環境では分析ツールに送信
    const clickData = {
      toolId,
      url,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 Affiliate Click Tracked:', clickData)
    } else {
      // 本番環境では Google Analytics や独自の分析システムに送信
      // gtag('event', 'affiliate_click', { tool_id: toolId })
    }
    
    // ローカルストレージに保存（統計用）
    const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]')
    clicks.push(clickData)
    localStorage.setItem('affiliate_clicks', JSON.stringify(clicks))
  }
}