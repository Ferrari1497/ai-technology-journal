import { useEffect } from 'react'

interface AdSenseProps {
  adSlot: string
  adFormat?: string
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
}

export default function AdSense({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style = { display: 'block' }
}: AdSenseProps) {
  const isProduction = process.env.NODE_ENV === 'production'
  const adSenseId = process.env.NEXT_PUBLIC_ADSENSE_ID

  useEffect(() => {
    if (isProduction && adSenseId && typeof window !== 'undefined') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (err) {
        console.error('AdSense error:', err)
      }
    }
  }, [isProduction, adSenseId])

  if (!isProduction || !adSenseId) {
    return (
      <div className="ad-placeholder" style={style}>
        <div className="ad-banner">
          AdSense広告枠 (本番環境でのみ表示)
        </div>
      </div>
    )
  }

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={adSenseId}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive}
    />
  )
}