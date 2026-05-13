'use client';

import { useEffect, useState } from 'react';

interface TrackingStatus {
  ga4: {
    configured: boolean;
    measurementId: string | null;
    status: 'active' | 'inactive' | 'not_configured';
  };
  metaPixel: {
    configured: boolean;
    pixelId: string | null;
    status: 'active' | 'inactive' | 'not_configured';
  };
  paddle: {
    configured: boolean;
    vendorId: string | null;
    environment: 'sandbox' | 'production' | 'not_configured';
  };
  gtm: {
    configured: boolean;
    containerId: string | null;
    status: 'active' | 'inactive' | 'not_configured';
  };
}

interface TrackingEvent {
  name: string;
  platform: 'GA4' | 'Meta Pixel' | 'Paddle' | 'GTM';
  description: string;
  fired: boolean;
  lastFired: string | null;
}

export default function TrackingSettingsPage() {
  const [status, setStatus] = useState<TrackingStatus | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkTrackingStatus();
    loadTrackedEvents();
  }, []);

  const checkTrackingStatus = () => {
    const ga4Id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const paddleId = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;
    const gtmId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID;
    const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT;

    setStatus({
      ga4: {
        configured: !!ga4Id,
        measurementId: ga4Id || null,
        status: ga4Id ? 'active' : 'not_configured',
      },
      metaPixel: {
        configured: !!metaId,
        pixelId: metaId || null,
        status: metaId ? 'active' : 'not_configured',
      },
      paddle: {
        configured: !!paddleId,
        vendorId: paddleId || null,
        environment: paddleId ? (paddleEnv as 'sandbox' | 'production') : 'not_configured',
      },
      gtm: {
        configured: !!gtmId,
        containerId: gtmId || null,
        status: gtmId ? 'active' : 'not_configured',
      },
    });

    setChecking(false);
  };

  const loadTrackedEvents = () => {
    // Sample events that are tracked in the app
    const trackedEvents: TrackingEvent[] = [
      // GA4 Events
      {
        name: 'page_view',
        platform: 'GA4',
        description: 'User views a page',
        fired: false,
        lastFired: null,
      },
      {
        name: 'view_item',
        platform: 'GA4',
        description: 'User views a product',
        fired: false,
        lastFired: null,
      },
      {
        name: 'add_to_cart',
        platform: 'GA4',
        description: 'User adds item to cart',
        fired: false,
        lastFired: null,
      },
      {
        name: 'begin_checkout',
        platform: 'GA4',
        description: 'User starts checkout',
        fired: false,
        lastFired: null,
      },
      {
        name: 'purchase',
        platform: 'GA4',
        description: 'User completes purchase',
        fired: false,
        lastFired: null,
      },
      {
        name: 'sign_up',
        platform: 'GA4',
        description: 'User signs up',
        fired: false,
        lastFired: null,
      },
      // Meta Pixel Events
      {
        name: 'PageView',
        platform: 'Meta Pixel',
        description: 'Page view event',
        fired: false,
        lastFired: null,
      },
      {
        name: 'ViewContent',
        platform: 'Meta Pixel',
        description: 'Product content viewed',
        fired: false,
        lastFired: null,
      },
      {
        name: 'AddToCart',
        platform: 'Meta Pixel',
        description: 'Item added to cart',
        fired: false,
        lastFired: null,
      },
      {
        name: 'InitiateCheckout',
        platform: 'Meta Pixel',
        description: 'Checkout initiated',
        fired: false,
        lastFired: null,
      },
      {
        name: 'Purchase',
        platform: 'Meta Pixel',
        description: 'Purchase completed',
        fired: false,
        lastFired: null,
      },
      {
        name: 'CompleteRegistration',
        platform: 'Meta Pixel',
        description: 'Registration completed',
        fired: false,
        lastFired: null,
      },
      // Paddle Events
      {
        name: 'checkout.opened',
        platform: 'Paddle',
        description: 'Paddle checkout opened',
        fired: false,
        lastFired: null,
      },
      {
        name: 'checkout.closed',
        platform: 'Paddle',
        description: 'Paddle checkout closed',
        fired: false,
        lastFired: null,
      },
      {
        name: 'subscription.created',
        platform: 'Paddle',
        description: 'Subscription created',
        fired: false,
        lastFired: null,
      },
    ];

    setEvents(trackedEvents);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#22c55e';
      case 'inactive':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active':
        return 'rgba(34, 197, 94, 0.1)';
      case 'inactive':
        return 'rgba(245, 158, 11, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
    }
  };

  if (checking) {
    return <div style={{ padding: '32px', color: '#898989' }}>Loading tracking status...</div>;
  }

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#fafafa', margin: '0 0 8px' }}>
          Tracking Settings
        </h1>
        <p style={{ color: '#898989', margin: 0 }}>
          Configure and monitor your analytics and tracking integrations
        </p>
      </div>

      {/* Google Analytics 4 */}
      <div style={{ background: '#1e1e1e', border: '1px solid #2e2e2e', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#F9AB00', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              📊
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fafafa', margin: 0 }}>Google Analytics 4</h2>
              <p style={{ fontSize: '13px', color: '#898989', margin: '4px 0 0' }}>Website analytics and conversion tracking</p>
            </div>
          </div>
          <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            background: getStatusBg(status?.ga4.status || 'not_configured'),
            color: getStatusColor(status?.ga4.status || 'not_configured'),
          }}>
            {status?.ga4.status.toUpperCase()}
          </span>
        </div>

        <div style={{ background: '#171717', border: '1px solid #363636', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#b4b4b4', marginBottom: '6px' }}>Measurement ID</label>
          <code style={{ fontSize: '14px', color: status?.ga4.configured ? '#3ecf8e' : '#6b7280' }}>
            {status?.ga4.measurementId || 'Not configured'}
          </code>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #363636', background: 'transparent', color: '#fafafa', fontSize: '13px', textDecoration: 'none', cursor: 'pointer' }}
          >
            📈 Open Analytics
          </a>
          <a
            href="https://support.google.com/analytics/answer/9539598"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #363636', background: 'transparent', color: '#898989', fontSize: '13px', textDecoration: 'none', cursor: 'pointer' }}
          >
            📖 Setup Guide
          </a>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', background: '#0f0f0f', borderRadius: '8px', border: '1px solid #2e2e2e' }}>
          <p style={{ fontSize: '12px', color: '#898989', margin: 0 }}>
            <strong style={{ color: '#b4b4b4' }}>Tracked Events:</strong> page_view, view_item, add_to_cart, begin_checkout, purchase, sign_up
          </p>
        </div>
      </div>

      {/* Meta Pixel */}
      <div style={{ background: '#1e1e1e', border: '1px solid #2e2e2e', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#1877F2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              📱
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fafafa', margin: 0 }}>Meta Pixel (Facebook)</h2>
              <p style={{ fontSize: '13px', color: '#898989', margin: '4px 0 0' }}>Facebook & Instagram conversion tracking</p>
            </div>
          </div>
          <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            background: getStatusBg(status?.metaPixel.status || 'not_configured'),
            color: getStatusColor(status?.metaPixel.status || 'not_configured'),
          }}>
            {status?.metaPixel.status.toUpperCase()}
          </span>
        </div>

        <div style={{ background: '#171717', border: '1px solid #363636', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#b4b4b4', marginBottom: '6px' }}>Pixel ID</label>
          <code style={{ fontSize: '14px', color: status?.metaPixel.configured ? '#3ecf8e' : '#6b7280' }}>
            {status?.metaPixel.pixelId || 'Not configured'}
          </code>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="https://business.facebook.com/events_manager"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #363636', background: 'transparent', color: '#fafafa', fontSize: '13px', textDecoration: 'none', cursor: 'pointer' }}
          >
            📱 Open Events Manager
          </a>
          <a
            href="https://developers.facebook.com/docs/meta-pixel/implementation"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #363636', background: 'transparent', color: '#898989', fontSize: '13px', textDecoration: 'none', cursor: 'pointer' }}
          >
            📖 Setup Guide
          </a>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', background: '#0f0f0f', borderRadius: '8px', border: '1px solid #2e2e2e' }}>
          <p style={{ fontSize: '12px', color: '#898989', margin: 0 }}>
            <strong style={{ color: '#b4b4b4' }}>Tracked Events:</strong> PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, CompleteRegistration
          </p>
        </div>
      </div>

      {/* Paddle */}
      <div style={{ background: '#1e1e1e', border: '1px solid #2e2e2e', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#6C5CE7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              💳
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fafafa', margin: 0 }}>Paddle</h2>
              <p style={{ fontSize: '13px', color: '#898989', margin: '4px 0 0' }}>Payment processing and subscriptions</p>
            </div>
          </div>
          <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            background: getStatusBg(status?.paddle.configured ? 'active' : 'not_configured'),
            color: getStatusColor(status?.paddle.configured ? 'active' : 'not_configured'),
          }}>
            {status?.paddle.configured ? status.paddle.environment.toUpperCase() : 'NOT CONFIGURED'}
          </span>
        </div>

        <div style={{ background: '#171717', border: '1px solid #363636', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#b4b4b4', marginBottom: '6px' }}>Vendor ID</label>
          <code style={{ fontSize: '14px', color: status?.paddle.configured ? '#3ecf8e' : '#6b7280' }}>
            {status?.paddle.vendorId || 'Not configured'}
          </code>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="https://vendors.paddle.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #363636', background: 'transparent', color: '#fafafa', fontSize: '13px', textDecoration: 'none', cursor: 'pointer' }}
          >
            💰 Open Vendor Dashboard
          </a>
          <a
            href="https://developer.paddle.com/paddlejs/overview"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #363636', background: 'transparent', color: '#898989', fontSize: '13px', textDecoration: 'none', cursor: 'pointer' }}
          >
            📖 Paddle.js Docs
          </a>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', background: '#0f0f0f', borderRadius: '8px', border: '1px solid #2e2e2e' }}>
          <p style={{ fontSize: '12px', color: '#898989', margin: 0 }}>
            <strong style={{ color: '#b4b4b4' }}>Environment:</strong> {status?.paddle.environment === 'not_configured' ? 'Not set (default: sandbox)' : status?.paddle.environment}
          </p>
        </div>
      </div>

      {/* Google Tag Manager */}
      <div style={{ background: '#1e1e1e', border: '1px solid #2e2e2e', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#EA4335', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              🏷️
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fafafa', margin: 0 }}>Google Tag Manager</h2>
              <p style={{ fontSize: '13px', color: '#898989', margin: '4px 0 0' }}>Tag management and container control</p>
            </div>
          </div>
          <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            background: getStatusBg(status?.gtm.status || 'not_configured'),
            color: getStatusColor(status?.gtm.status || 'not_configured'),
          }}>
            {status?.gtm.status.toUpperCase()}
          </span>
        </div>

        <div style={{ background: '#171717', border: '1px solid #363636', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#b4b4b4', marginBottom: '6px' }}>Container ID</label>
          <code style={{ fontSize: '14px', color: status?.gtm.configured ? '#3ecf8e' : '#6b7280' }}>
            {status?.gtm.containerId ? `GTM-${status.gtm.containerId}` : 'Not configured'}
          </code>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="https://tagmanager.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #363636', background: 'transparent', color: '#fafafa', fontSize: '13px', textDecoration: 'none', cursor: 'pointer' }}
          >
            🏷️ Open Tag Manager
          </a>
          <a
            href="https://support.google.com/tagmanager/answer/6103696"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #363636', background: 'transparent', color: '#898989', fontSize: '13px', textDecoration: 'none', cursor: 'pointer' }}
          >
            📖 Setup Guide
          </a>
        </div>
      </div>

      {/* Event Status Table */}
      <div style={{ background: '#1e1e1e', border: '1px solid #2e2e2e', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fafafa', margin: '0 0 20px' }}>Tracked Events</h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #363636' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#b4b4b4', fontSize: '13px', fontWeight: '600' }}>Event Name</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#b4b4b4', fontSize: '13px', fontWeight: '600' }}>Platform</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#b4b4b4', fontSize: '13px', fontWeight: '600' }}>Description</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#b4b4b4', fontSize: '13px', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={`${event.platform}-${event.name}`} style={{ borderBottom: '1px solid #2e2e2e' }}>
                  <td style={{ padding: '12px', color: '#fafafa', fontSize: '14px', fontFamily: 'monospace' }}>
                    {event.name}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: event.platform === 'GA4' ? 'rgba(249, 171, 0, 0.2)' :
                                  event.platform === 'Meta Pixel' ? 'rgba(24, 119, 242, 0.2)' :
                                  event.platform === 'Paddle' ? 'rgba(108, 92, 231, 0.2)' :
                                  'rgba(234, 67, 53, 0.2)',
                      color: event.platform === 'GA4' ? '#F9AB00' :
                             event.platform === 'Meta Pixel' ? '#1877F2' :
                             event.platform === 'Paddle' ? '#6C5CE7' :
                             '#EA4335',
                    }}>
                      {event.platform}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#898989', fontSize: '13px' }}>
                    {event.description}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: event.fired ? '#22c55e' : '#6b7280',
                      display: 'inline-block',
                    }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px', padding: '16px', background: '#0f0f0f', borderRadius: '8px', border: '1px solid #2e2e2e' }}>
          <p style={{ fontSize: '13px', color: '#898989', margin: 0 }}>
            💡 <strong style={{ color: '#b4b4b4' }}>Note:</strong> To configure tracking, add the appropriate environment variables to your <code style={{ background: '#171717', padding: '2px 6px', borderRadius: '4px' }}>.env.local</code> file and restart your development server.
          </p>
        </div>
      </div>

      {/* Environment Variables Help */}
      <div style={{ marginTop: '20px', padding: '16px', background: '#171717', border: '1px solid #363636', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fafafa', margin: '0 0 12px' }}>Environment Variables</h3>
        <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          <div style={{ marginBottom: '4px' }}>
            <code style={{ color: '#3ecf8e' }}>NEXT_PUBLIC_GA4_MEASUREMENT_ID</code>
            <span style={{ color: '#6b7280' }}> - Google Analytics 4 Measurement ID (G-XXXXXXXXXX)</span>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <code style={{ color: '#3ecf8e' }}>NEXT_PUBLIC_META_PIXEL_ID</code>
            <span style={{ color: '#6b7280' }}> - Facebook Pixel ID</span>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <code style={{ color: '#3ecf8e' }}>NEXT_PUBLIC_PADDLE_VENDOR_ID</code>
            <span style={{ color: '#6b7280' }}> - Paddle Vendor ID</span>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <code style={{ color: '#3ecf8e' }}>NEXT_PUBLIC_PADDLE_ENVIRONMENT</code>
            <span style={{ color: '#6b7280' }}> - sandbox or production</span>
          </div>
          <div>
            <code style={{ color: '#3ecf8e' }}>NEXT_PUBLIC_GTM_CONTAINER_ID</code>
            <span style={{ color: '#6b7280' }}> - Google Tag Manager Container ID (GTM-XXXXXXX)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
