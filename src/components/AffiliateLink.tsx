import { getAffiliateUrl, trackClick } from '../lib/affiliate'

interface AffiliateLinkProps {
  toolId: string
  originalUrl: string
  children: React.ReactNode
  className?: string
  target?: string
  rel?: string
}

export default function AffiliateLink({ 
  toolId, 
  originalUrl, 
  children, 
  className = '',
  target = '_blank',
  rel = 'noopener noreferrer'
}: AffiliateLinkProps) {
  const affiliateUrl = getAffiliateUrl(toolId)
  const finalUrl = affiliateUrl || originalUrl

  const handleClick = () => {
    trackClick(toolId, finalUrl)
  }

  return (
    <a
      href={finalUrl}
      className={className}
      target={target}
      rel={rel}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}