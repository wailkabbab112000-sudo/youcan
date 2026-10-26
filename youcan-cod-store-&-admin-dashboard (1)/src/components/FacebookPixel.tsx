import React, { useEffect } from 'react';

interface FacebookPixelProps {
  pixelId?: string;
}

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const FacebookPixel: React.FC<FacebookPixelProps> = ({ pixelId }) => {
  useEffect(() => {
    if (!pixelId) return;

    const ids = pixelId.split(',').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) return;

    // Standard Facebook Pixel injection
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0] as any;
      s.parentNode.insertBefore(t, s);
    })(window as any, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    ids.forEach(id => {
      window.fbq('init', id);
    });
    window.fbq('track', 'PageView');
  }, [pixelId]);

  return null;
};

// Helper function to track events
export const trackPixelEvent = (event: string, params?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, params);
  }
};
