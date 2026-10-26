import React, { useEffect } from 'react';

interface GoogleAdsPixelProps {
  pixelId?: string; // e.g. AW-123456789
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const GoogleAdsPixel: React.FC<GoogleAdsPixelProps> = ({ pixelId }) => {
  useEffect(() => {
    if (!pixelId) return;

    const ids = pixelId.split(',').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) return;

    // Inject Google Tag script if not present
    const primaryId = ids[0];
    if (!document.getElementById('google-ads-tag')) {
      const script = document.createElement('script');
      script.id = 'google-ads-tag';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${primaryId}`;
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${primaryId}');
      `;
      document.head.appendChild(inlineScript);
    }

    // Config secondary IDs if any
    if (window.gtag) {
      ids.forEach(id => {
        window.gtag('config', id);
      });
    }
  }, [pixelId]);

  return null;
};

export const trackGoogleAdsConversion = (value: number, currency: string = 'MAD', transactionId?: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      'send_to': window.dataLayer, // or standard conversion
      'value': value,
      'currency': currency,
      'transaction_id': transactionId || ''
    });
  }
};
