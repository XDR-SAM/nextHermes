/**
 * Tracking utilities for GA4, Meta Pixel, Paddle, and GTM
 * Provides typed helpers for firing conversion events
 */

// Type definitions for tracking parameters
export interface GA4Params {
  currency?: string;
  value?: number;
  transaction_id?: string;
  items?: GA4Item[];
  coupon?: string;
  tax?: number;
  shipping?: number;
  [key: string]: string | number | undefined | GA4Item[] | undefined;
}

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
  coupon?: string;
  index?: number;
}

export interface MetaPixelParams {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string | 'product' | 'product_group';
  value?: number;
  currency?: string;
  contents?: MetaContent[];
  num_items?: number;
  [key: string]: string | number | string[] | MetaContent[] | undefined;
}

export interface MetaContent {
  id: string;
  quantity: number;
  item_price?: number;
}

export interface PaddleEventData {
  [key: string]: unknown;
}

// Extend Window interface for tracking globals
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    fbq: (action: string, event: string, params?: Record<string, unknown>) => void;
    dataLayer: unknown[];
    Paddle: {
      Environment: {
        set: (env: 'sandbox' | 'production') => void;
      };
      Initialize: (config: { token: string }) => void;
      Checkout: {
        open: (options: PaddleCheckoutOptions) => void;
      };
      [key: string]: unknown;
    };
  }
}

/**
 * Check if GA4 is available
 */
export function isGA4Available(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Check if Meta Pixel is available
 */
export function isMetaPixelAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

/**
 * Check if Paddle is available
 */
export function isPaddleAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.Paddle !== 'undefined';
}

// ==================== GA4 Tracking ====================

/**
 * Track GA4 events
 * @param event - Event name (e.g., 'purchase', 'add_to_cart', 'view_item')
 * @param params - Event parameters
 */
export function trackGA4(event: string, params?: GA4Params): void {
  if (!isGA4Available()) {
    console.warn(`[Tracking] GA4 not available, skipping event: ${event}`);
    return;
  }

  try {
    window.gtag('event', event, {
      ...params,
      // Ensure currency is uppercase for GA4
      currency: params?.currency?.toUpperCase(),
    });
    console.log(`[GA4] Event tracked: ${event}`, params);
  } catch (error) {
    console.error(`[Tracking] Error tracking GA4 event ${event}:`, error);
  }
}

// Standard GA4 event helpers
export const ga4Events = {
  viewItem: (item: { id: string; name: string; price?: number; category?: string }) => {
    trackGA4('view_item', {
      currency: 'USD',
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
      }],
    });
  },

  addToCart: (item: { id: string; name: string; price: number; quantity: number; category?: string }) => {
    trackGA4('add_to_cart', {
      currency: 'USD',
      value: item.price * item.quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
      }],
    });
  },

  removeFromCart: (item: { id: string; name: string; price: number; quantity: number }) => {
    trackGA4('remove_from_cart', {
      currency: 'USD',
      value: item.price * item.quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }],
    });
  },

  beginCheckout: (value?: number, items?: GA4Item[]) => {
    trackGA4('begin_checkout', {
      currency: 'USD',
      value,
      items,
    });
  },

  addPaymentInfo: () => {
    trackGA4('add_payment_info', {
      currency: 'USD',
    });
  },

  purchase: (transaction: {
    transaction_id: string;
    value: number;
    tax?: number;
    shipping?: number;
    coupon?: string;
    items: GA4Item[];
  }) => {
    trackGA4('purchase', {
      currency: 'USD',
      transaction_id: transaction.transaction_id,
      value: transaction.value,
      tax: transaction.tax,
      shipping: transaction.shipping,
      coupon: transaction.coupon,
      items: transaction.items,
    });
  },

  signUp: (method?: string) => {
    trackGA4('sign_up', {
      method,
    });
  },

  search: (searchTerm: string) => {
    trackGA4('search', {
      search_term: searchTerm,
    });
  },

  viewCart: (value: number, items: GA4Item[]) => {
    trackGA4('view_cart', {
      currency: 'USD',
      value,
      items,
    });
  },
};

// ==================== Meta Pixel Tracking ====================

/**
 * Track Meta Pixel events
 * @param event - Event name (e.g., 'PageView', 'ViewContent', 'AddToCart')
 * @param params - Event parameters
 */
export function trackMetaPixel(event: string, params?: MetaPixelParams): void {
  if (!isMetaPixelAvailable()) {
    console.warn(`[Tracking] Meta Pixel not available, skipping event: ${event}`);
    return;
  }

  try {
    window.fbq('track', event, params);
    console.log(`[Meta Pixel] Event tracked: ${event}`, params);
  } catch (error) {
    console.error(`[Tracking] Error tracking Meta Pixel event ${event}:`, error);
  }
}

/**
 * Track Meta Pixel events with custom data (for events that don't map to standard events)
 */
export function trackMetaPixelCustom(event: string, params?: Record<string, unknown>): void {
  if (!isMetaPixelAvailable()) {
    console.warn(`[Tracking] Meta Pixel not available, skipping event: ${event}`);
    return;
  }

  try {
    window.fbq('trackCustom', event, params);
    console.log(`[Meta Pixel] Custom event tracked: ${event}`, params);
  } catch (error) {
    console.error(`[Tracking] Error tracking Meta Pixel custom event ${event}:`, error);
  }
}

// Standard Meta Pixel event helpers
export const metaPixelEvents = {
  pageView: () => {
    trackMetaPixel('PageView');
  },

  viewContent: (item: { id: string; name: string; price?: number; category?: string }) => {
    trackMetaPixel('ViewContent', {
      content_name: item.name,
      content_category: item.category,
      content_ids: [item.id],
      content_type: 'product',
      value: item.price,
      currency: 'USD',
    });
  },

  addToCart: (item: { id: string; name: string; price: number; quantity: number }) => {
    trackMetaPixel('AddToCart', {
      content_name: item.name,
      content_ids: [item.id],
      content_type: 'product',
      value: item.price * item.quantity,
      currency: 'USD',
      num_items: item.quantity,
    });
  },

  addToWishlist: (item: { id: string; name: string; price?: number }) => {
    trackMetaPixel('AddToWishlist', {
      content_name: item.name,
      content_ids: [item.id],
      content_type: 'product',
      value: item.price,
      currency: 'USD',
    });
  },

  initiateCheckout: (value?: number, numItems?: number) => {
    trackMetaPixel('InitiateCheckout', {
      value,
      currency: 'USD',
      num_items: numItems,
    });
  },

  addPaymentInfo: () => {
    trackMetaPixel('AddPaymentInfo');
  },

  purchase: (transaction: { transaction_id: string; value: number; currency?: string; num_items?: number }) => {
    trackMetaPixel('Purchase', {
      transaction_id: transaction.transaction_id,
      value: transaction.value,
      currency: transaction.currency || 'USD',
      num_items: transaction.num_items,
    });
  },

  signUp: (method?: string) => {
    trackMetaPixel('CompleteRegistration', {
      content_name: method || 'unknown',
    });
  },

  search: (searchTerm: string) => {
    trackMetaPixelCustom('Search', {
      search_string: searchTerm,
    });
  },

  contact: () => {
    trackMetaPixelCustom('Contact');
  },

  lead: (source?: string) => {
    trackMetaPixelCustom('Lead', {
      content_name: source,
    });
  },
};

// ==================== Paddle Integration ====================

export interface PaddleCheckoutOptions {
  items: PaddleItem[];
  settings?: PaddleSettings;
  customData?: Record<string, unknown>;
}

export interface PaddleItem {
  quantity?: number;
  priceId: string;
}

export interface PaddleSettings {
  appearance?: string;
  displayMode?: 'overlay' | 'inline';
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  allowLogout?: boolean;
  title?: string;
  description?: string;
  successUrl?: string;
}

/**
 * Open Paddle checkout
 */
export function openPaddleCheckout(options: PaddleCheckoutOptions): void {
  if (!isPaddleAvailable()) {
    console.error('[Tracking] Paddle not available');
    return;
  }

  try {
    window.Paddle.Checkout.open({
      items: options.items,
      customData: options.customData,
      settings: {
        displayMode: options.settings?.displayMode || 'overlay',
        theme: options.settings?.theme || 'auto',
        locale: options.settings?.locale || 'en',
        successUrl: options.settings?.successUrl || window.location.href,
        ...options.settings,
      },
    });
    console.log('[Paddle] Checkout opened', options);
  } catch (error) {
    console.error('[Tracking] Error opening Paddle checkout:', error);
  }
}

/**
 * Initialize Paddle with vendor ID
 */
export function initializePaddle(vendorId: string, environment: 'sandbox' | 'production' = 'production'): void {
  if (typeof window === 'undefined') return;

  // Set environment
  if (environment === 'sandbox') {
    window.Paddle.Environment.set('sandbox');
  }

  window.Paddle.Initialize({
    token: vendorId,
  });

  console.log(`[Paddle] Initialized with vendor: ${vendorId}, env: ${environment}`);
}

// ==================== Utility Functions ====================

/**
 * Initialize all tracking (called on app load)
 */
export function initializeTracking(): void {
  // Track initial page view on both platforms
  if (isGA4Available()) {
    trackGA4('page_view', {
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    });
  }

  if (isMetaPixelAvailable()) {
    metaPixelEvents.pageView();
  }
}

/**
 * Track a conversion event across all platforms
 */
export function trackConversion(event: {
  name: string;
  value?: number;
  currency?: string;
  transactionId?: string;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
}): void {
  const ga4Items = event.items?.map((item, index) => ({
    item_id: item.id,
    item_name: item.name,
    item_category: item.category,
    price: item.price,
    quantity: item.quantity,
    index,
  }));

  // Track on all platforms
  trackGA4(event.name, {
    currency: event.currency || 'USD',
    value: event.value,
    transaction_id: event.transactionId,
    items: ga4Items,
  });

  // Track Meta equivalent
  if (event.name === 'purchase' && event.transactionId) {
    metaPixelEvents.purchase({
      transaction_id: event.transactionId,
      value: event.value || 0,
      currency: event.currency,
      num_items: event.items?.length,
    });
  }
}
