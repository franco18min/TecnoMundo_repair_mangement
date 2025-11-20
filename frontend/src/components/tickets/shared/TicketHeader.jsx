import React from 'react'
import { getLogoDataUrlCached } from '../../../utils/branding'

export function TicketHeader({ ticketStyle = {}, branch, order }) {
  const headerStyle = {
    fontFamily: ticketStyle.headerFontFamily || 'monospace',
    fontSize: ticketStyle.headerFontSize || '14px',
    textAlign: ticketStyle.headerAlignment || 'center',
  }

  const companyNameStyle = {
    ...headerStyle,
    fontSize: ticketStyle.companyNameFontSize || '24px',
    fontWeight: 'bold',
    letterSpacing: '0.1em',
    marginBottom: '2px',
  }

  const contactInfoStyle = {
    ...headerStyle,
    fontSize: ticketStyle.contactInfoFontSize || '12px',
  }

  return (
    <header className="mb-2" style={headerStyle}>
      {ticketStyle.showLogo ? (
        <HeaderLogo ticketStyle={ticketStyle} />
      ) : (
        ticketStyle.showCompanyName !== false && (
          <div style={companyNameStyle}>{branch?.company_name || 'TECNO MUNDO'}</div>
        )
      )}

      {ticketStyle.showContactInfo !== false && (
        <div className="mt-2 space-y-1" style={contactInfoStyle}>
          {ticketStyle.showAddress !== false && branch?.address && (
            <HeaderLine style={contactInfoStyle}>{branch.address}</HeaderLine>
          )}
          {ticketStyle.showPhone !== false && branch?.phone && (
            <HeaderLine style={contactInfoStyle}>{branch.phone}</HeaderLine>
          )}
          {ticketStyle.showEmail !== false && branch?.email && (
            <HeaderLine style={contactInfoStyle}>{branch.email}</HeaderLine>
          )}
        </div>
      )}

      {ticketStyle.showBranchName !== false && branch?.branch_name && (
        <div className="mt-2 flex items-center justify-center gap-1 font-medium" style={contactInfoStyle}>
          <span>{branch.branch_name}</span>
        </div>
      )}
    </header>
  )
}

function HeaderLine({ children, style }) {
  return <p className="text-center text-sm" style={style}>{children}</p>
}

function HeaderLogo({ ticketStyle }) {
  const [src, setSrc] = React.useState('')
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      const h = Number(ticketStyle.logoHeightPx || 28)
      const dataUrl = await getLogoDataUrlCached(h)
      if (mounted) setSrc(dataUrl)
    })()
    return () => { mounted = false }
  }, [ticketStyle.logoHeightPx])

  if (!src) return null
  const mb = typeof ticketStyle.logoMarginBottomPx === 'number' ? ticketStyle.logoMarginBottomPx : 2
  const pos = ticketStyle.logoPosition || 'top'

  if (pos === 'top') {
    return (
      <div className="flex justify-center" style={{ marginBottom: mb }}>
        <img src={src} alt="Logo" style={{ height: ticketStyle.logoHeightPx || 28 }} />
      </div>
    )
  }
  if (pos === 'left' || pos === 'right') {
    return (
      <div className={`flex items-center justify-center gap-2 ${pos === 'right' ? 'flex-row-reverse' : ''}`} style={{ marginBottom: mb }}>
        <img src={src} alt="Logo" style={{ height: ticketStyle.logoHeightPx || 28 }} />
      </div>
    )
  }
  return null
}