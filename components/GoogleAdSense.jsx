'use client';

import Script from 'next/script';

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

// Google AdSense Auto Ads Component
export default function GoogleAdSense() {
  // Don't render anything if AdSense ID is not configured
  if (!ADSENSE_PUBLISHER_ID) {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      strategy="lazyOnload"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
      crossOrigin="anonymous"
      onError={(e) => {
        console.error('AdSense script failed to load:', e);
      }}
    />
  );
}

// Manual Ad Unit Component (if you want to place specific ad units)
export function AdUnit({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = ''
}) {
  if (!ADSENSE_PUBLISHER_ID) {
    return null;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
      <Script id={`adsense-${adSlot}`} strategy="lazyOnload">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
