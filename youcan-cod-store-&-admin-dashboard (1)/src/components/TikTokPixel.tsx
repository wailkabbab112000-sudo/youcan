import React, { useEffect } from 'react';

interface TikTokPixelProps {
  pixelId?: string;
}

declare global {
  interface Window {
    TiktokAnalyticsObject: string;
    ttq: any;
  }
}

export const TikTokPixel: React.FC<TikTokPixelProps> = ({ pixelId }) => {
  useEffect(() => {
    if (!pixelId) return;

    const ids = pixelId.split(',').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) return;

    // Standard TikTok Pixel injection
    if (!window.ttq) {
      (function (w: any, d: Document, t: string) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = [
          'page',
          'track',
          'identify',
          'instances',
          'debug',
          'on',
          'off',
          'once',
          'ready',
          'alias',
          'group',
          'enableCookie',
          'disableCookie',
          'holdConsent',
          'revokeConsent',
          'grantConsent',
        ];
        ttq.setAndDefer = function (t: any, e: any) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (var i = 0; i < ttq.methods.length; i++) {
          ttq.setAndDefer(ttq, ttq.methods[i]);
        }
        ttq.instance = function (t: any) {
          var e = (ttq._i = ttq._i || {});
          var n = e[t] || [];
          e[t] = n;
          return function () {
            n.push([t].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        var s = d.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + t;
        var e = d.getElementsByTagName('script')[0];
        e.parentNode?.insertBefore(s, e);
      })(window, document, ids[0]);
    }

    ids.forEach(id => {
      window.ttq?.load?.(id);
      window.ttq?.page?.();
    });
  }, [pixelId]);

  return null;
};

export const trackTikTokEvent = (event: string, params?: any) => {
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track(event, params);
  }
};
