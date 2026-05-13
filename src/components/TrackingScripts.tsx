'use client';

import { useEffect } from 'react';

interface TrackingScriptsProps {
  ga4MeasurementId?: string;
  metaPixelId?: string;
  paddleVendorId?: string;
  gtmContainerId?: string;
  paddleEnvironment?: 'sandbox' | 'production';
}

export function TrackingScripts({
  ga4MeasurementId,
  metaPixelId,
  paddleVendorId,
  gtmContainerId,
  paddleEnvironment = 'production',
}: TrackingScriptsProps) {
  useEffect(() => {
    // Only load in production or if env vars are set
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!isProduction && !ga4MeasurementId && !metaPixelId) {
      console.log('[Tracking] Skipping script loading in development (no env vars set)');
      return;
    }

    // Load scripts in order
    loadGAScript(ga4MeasurementId);
    loadGTMScript(gtmContainerId);
    loadMetaPixelScript(metaPixelId);
    loadPaddleScript(paddleVendorId, paddleEnvironment);
  }, [ga4MeasurementId, metaPixelId, paddleVendorId, gtmContainerId, paddleEnvironment]);

  return null;
}

/**
 * Load Google Analytics 4 script
 */
function loadGAScript(measurementId?: string) {
  if (!measurementId) return;

  // Check if already loaded
  if (typeof window === 'undefined' || (window as Window & { gtag?: unknown }).gtag) return;

  // Add gtag script
  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(gtagScript);

  // Initialize gtag
  const inlineScript = document.createElement('script');
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  `;
  document.head.appendChild(inlineScript);

  console.log(`[Tracking] GA4 loaded with Measurement ID: ${measurementId}`);
}

/**
 * Load Google Tag Manager script
 */
function loadGTMScript(containerId?: string) {
  if (!containerId) return;

  if (typeof window === 'undefined' || (window as Window & { google_tag_manager?: unknown }).google_tag_manager) return;

  // Add GTM script
  const gtmScript = document.createElement('script');
  gtmScript.async = true;
  gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  gtmScript.setAttribute('data-cookie-consent', 'marketing');
  document.head.appendChild(gtmScript);

  // Add noscript iframe
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.insertBefore(noscript, document.body.firstChild);

  console.log(`[Tracking] GTM loaded with Container ID: ${containerId}`);
}

/**
 * Load Meta Pixel (Facebook) script
 */
function loadMetaPixelScript(pixelId?: string) {
  if (!pixelId) return;

  if (typeof window === 'undefined') return;

  // Set up fbq queue
  const _fbq = (window as Window & { fbq?: (action: string, event: string, params?: Record<string, unknown>) => void }).fbq;
  if (!_fbq) {
    (window as Window & { fbq?: unknown }).fbq = function() {
      if ((window as Window & { fbq?: { q?: unknown[] } }).fbq?.q) {
        ((window as Window & { fbq?: { q?: unknown[] } }).fbq!.q as unknown[]).push(arguments);
      }
    };
    ((window as Window & { fbq?: { q?: unknown[] } }).fbq as { q: unknown[] }) = { q: [] } as { q: unknown[] };
  }

  // Add Meta Pixel script
  const metaScript = document.createElement('script');
  metaScript.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(metaScript);

  // Add noscript pixel
  const noscriptPixel = document.createElement('noscript');
  noscriptPixel.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
  document.body.appendChild(noscriptPixel);

  console.log(`[Tracking] Meta Pixel loaded with ID: ${pixelId}`);
}

/**
 * Load Paddle.js script
 */
function loadPaddleScript(vendorId?: string, environment: 'sandbox' | 'production' = 'production') {
  if (!vendorId) return;

  if (typeof window === 'undefined' || (window as Window & { Paddle?: unknown }).Paddle) return;

  // Determine script URL based on environment
  const scriptUrl = environment === 'sandbox'
    ? 'https://cdn.paddle.com/paddle/v2/sandbox/paddle.js'
    : 'https://cdn.paddle.com/paddle/v2/paddle.js';

  // Add Paddle script
  const paddleScript = document.createElement('script');
  paddleScript.src = scriptUrl;
  paddleScript.async = true;
  paddleScript.setAttribute('data-vendor-id', vendorId);
  paddleScript.setAttribute('data-paddle-environment', environment);
  document.head.appendChild(paddleScript);

  // Initialize Paddle after script loads
  paddleScript.onload = () => {
    if ((window as Window & { Paddle?: unknown }).Paddle) {
      (window as Window & { Paddle?: { Environment: { set: (env: string) => void }; Initialize: (config: { token: string }) => void } }).Paddle!.Environment.set(environment === 'sandbox' ? 'sandbox' : 'production');
      (window as Window & { Paddle?: { Initialize: (config: { token: string }) => void } }).Paddle!.Initialize({ token: vendorId });
      console.log(`[Tracking] Paddle initialized with Vendor ID: ${vendorId}, Environment: ${environment}`);
    }
  };

  console.log(`[Tracking] Paddle script loaded from: ${scriptUrl}`);
}

/**
 * Hook to initialize tracking on page load
 */
export function usePageTracking() {
  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined') {
      const _gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
      if (_gtag) {
        _gtag('event', 'page_view', {
          page_location: window.location.href,
          page_path: window.location.pathname,
        });
      }

      const _fbq = (window as Window & { fbq?: (action: string, event: string) => void }).fbq;
      if (_fbq) {
        _fbq('track', 'PageView');
      }
    }
  }, []);
}
