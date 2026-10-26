import { Product, Order, StoreSettings, GoogleSheetsConfig, CodZossConfig, StoreVisit } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_SHEETS_CONFIG, INITIAL_CODZOSS_CONFIG, INITIAL_ORDERS, INITIAL_VISITS } from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'mystore_cod_products_v1',
  ORDERS: 'mystore_cod_orders_v1',
  SETTINGS: 'mystore_cod_settings_v1',
  SHEETS: 'mystore_cod_sheets_v1',
  CODZOSS: 'mystore_cod_codzoss_v1',
  VISITS: 'mystore_cod_visits_v1',
  VISITS_COUNT: 'mystore_total_visits_count_v1',
  FAST_METRICS: 'mystore_fast_dashboard_metrics_v1',
};

// Initial sample orders for demonstration
const SAMPLE_ORDERS: Order[] = [];

// Helper to identify and purge sample/demo products
export const isDemoProduct = (p: any): boolean => {
  if (!p) return true;
  const id = String(p.id || '');
  const slug = String(p.slug || '').toLowerCase();
  const title = String(p.title || '').toLowerCase();
  const titleAr = String(p.titleAr || p.title_ar || '');

  if (['prod-1', 'prod-2', 'prod-3', 'prod-1789425967052'].includes(id)) return true;
  if (['smartwatch-ultra-pro', 'aspirateur-sans-fil-turbo', 'pack-soin-argan-eclat', 'grass-seeds'].includes(slug)) return true;
  if (title.includes('smartwatch') || title.includes('aspirateur') || title.includes('pack soin') || title.includes('grass seeds')) return true;
  if (titleAr.includes('ساعة ذكية') || titleAr.includes('مكنسة') || titleAr.includes('مجموعة العناية')) return true;

  return false;
};

export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      safeSetItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed: Product[] = JSON.parse(raw);
    const cleaned = parsed.filter((p) => !isDemoProduct(p)).map((p) => {
      // If product is English and has orderButtonText, ensure orderButtonTextEn is also populated
      if (p.pageLanguage === 'en' && !p.orderButtonTextEn && p.orderButtonText) {
        return { ...p, orderButtonTextEn: p.orderButtonText };
      }
      return p;
    });

    if (!cleaned || cleaned.length === 0) {
      safeSetItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }

    if (cleaned.length !== parsed.length) {
      saveStoredProducts(cleaned);
    }
    return cleaned;
  } catch (e) {
    console.error('Failed to load products from storage', e);
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: Product[]) => {
  try {
    safeSetItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.warn('Failed to save products to storage', e);
  }
};

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      safeSetItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    const parsed: Order[] = JSON.parse(raw);
    // Remove old demo sample orders if present
    const cleaned = parsed.filter((o) => !['ord-101', 'ord-102', 'ord-103'].includes(o.id));
    if (!cleaned || cleaned.length === 0) {
      safeSetItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    if (cleaned.length !== parsed.length) {
      saveStoredOrders(cleaned);
    }
    return cleaned;
  } catch (e) {
    console.error('Failed to load orders from storage', e);
    return INITIAL_ORDERS;
  }
};

export const saveStoredOrders = (orders: Order[]) => {
  try {
    safeSetItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.warn('Failed to save orders to storage', e);
  }
};

export const getStoredSettings = (): StoreSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    const storeName = (!parsed.storeName || parsed.storeName === 'MYSTORE MAROC') ? 'MYSTORE' : parsed.storeName;
    const themeColor = parsed.themeColor ? parsed.themeColor : INITIAL_SETTINGS.themeColor;
    const dashboardColor = parsed.dashboardColor ? parsed.dashboardColor : INITIAL_SETTINGS.dashboardColor;
    const currency = parsed.currency ? parsed.currency : INITIAL_SETTINGS.currency;
    const storeLanguage = parsed.storeLanguage ? parsed.storeLanguage : INITIAL_SETTINGS.storeLanguage;
    const logoUrl = (parsed.logoUrl && parsed.logoUrl.trim() !== '') ? parsed.logoUrl : INITIAL_SETTINGS.logoUrl;
    const logoHeight = parsed.logoHeight ? parsed.logoHeight : INITIAL_SETTINGS.logoHeight;
    const rawSlides = Array.isArray(parsed.slides) ? parsed.slides : [];
    const slides = rawSlides.filter((s: any) => 
      s && 
      s.id !== 'slide-1' && 
      s.id !== 'slide-2' && 
      s.imageUrl !== '/slides/slide-1.webp' && 
      s.imageUrl !== '/slides/slide-2.webp'
    );
    return {
      ...INITIAL_SETTINGS,
      ...parsed,
      storeName,
      themeColor,
      dashboardColor,
      currency,
      storeLanguage,
      logoUrl,
      logoHeight,
      slides,
      checkoutFields: {
        ...INITIAL_SETTINGS.checkoutFields,
        ...(parsed?.checkoutFields || {})
      }
    };
  } catch (e) {
    return INITIAL_SETTINGS;
  }
};

export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    const isQuota = e?.name === 'QuotaExceededError' || e?.code === 22 || e?.code === 1014 || String(e).toLowerCase().includes('quota');
    if (isQuota) {
      // Free up space by purging old visits cache
      try {
        localStorage.removeItem(STORAGE_KEYS.VISITS);
      } catch (_) {}

      // Retry saving
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (_) {}
    }
    return false;
  }
};

export const saveStoredSettings = (settings: StoreSettings) => {
  try {
    const toSave: StoreSettings = {
      ...settings,
      updatedAt: settings.updatedAt || new Date().toISOString()
    };

    // Save directly without replacing or corrupting user slides
    const success = safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(toSave));
    if (success) return;

    // Retry after clearing temporary logs
    try {
      localStorage.removeItem(STORAGE_KEYS.VISITS);
      safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(toSave));
    } catch (_) {}
  } catch (e) {
    console.warn('Could not cache settings locally:', e);
  }
};

export const getStoredSheetsConfig = (): GoogleSheetsConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SHEETS, JSON.stringify(INITIAL_SHEETS_CONFIG));
      return INITIAL_SHEETS_CONFIG;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SHEETS_CONFIG;
  }
};

export const saveStoredSheetsConfig = (config: GoogleSheetsConfig) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SHEETS, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save sheets config', e);
  }
};

export const getStoredCodZossConfig = (): CodZossConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CODZOSS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CODZOSS, JSON.stringify(INITIAL_CODZOSS_CONFIG));
      return INITIAL_CODZOSS_CONFIG;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CODZOSS_CONFIG;
  }
};

export const saveStoredCodZossConfig = (config: CodZossConfig) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CODZOSS, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save CodZoss config', e);
  }
};

// Google Sheet Sync via Webhook (Apps Script Web App)
export const syncOrderToGoogleSheet = async (order: Order, webhookUrl: string, currency: string = 'DH'): Promise<boolean> => {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return false;
  }

  const payload = {
    orderNumber: order.orderNumber,
    date: new Date(order.createdAt).toLocaleString('fr-FR'),
    customerName: order.customerName,
    phone: order.phone,
    city: order.city,
    address: order.address || 'Non spécifiée',
    notes: order.notes || '',
    product: order.items.map(i => `${i.productTitle} (x${i.quantity})`).join(', '),
    quantity: order.items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: `${order.totalPrice} ${currency}`,
    status: order.status,
  };

  try {
    // Mode 'no-cors' allows posting to Google Apps Script Web App endpoints without CORS blockage in the browser
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.error('Google Sheet Webhook sync failed:', error);
    return false;
  }
};

// Multi-Sheet smart sync function filtered by products and SKUs
export const syncOrderToAllMatchingSheets = async (
  order: Order,
  config: GoogleSheetsConfig,
  products: Product[] = [],
  currency: string = 'DH'
): Promise<{ totalSynced: number; sheetNames: string[] }> => {
  let totalSynced = 0;
  const sheetNames: string[] = [];

  // Check multi-sheet rules first
  if (config.rules && config.rules.length > 0) {
    for (const rule of config.rules) {
      if (!rule.enabled || !rule.webhookUrl || !rule.webhookUrl.trim().startsWith('http')) {
        continue;
      }

      let matches = false;

      if (rule.applyToAllProducts) {
        matches = true;
      } else {
        // Check if order items match configured product IDs or SKUs
        for (const item of order.items) {
          // Match by product ID
          if (rule.productIds && rule.productIds.includes(item.productId)) {
            matches = true;
            break;
          }

          // Match by item SKU or catalog product SKU
          const catalogProd = products.find(p => p.id === item.productId);
          const itemSku = (item.sku || catalogProd?.sku || '').trim().toLowerCase();

          if (itemSku && rule.skus && rule.skus.some(s => s.trim().toLowerCase() === itemSku)) {
            matches = true;
            break;
          }
        }
      }

      if (matches) {
        const success = await syncOrderToGoogleSheet(order, rule.webhookUrl.trim(), currency);
        if (success) {
          totalSynced++;
          sheetNames.push(rule.name || 'Feuille Google');
        }
      }
    }
  } else if (config.webhookUrl && config.webhookUrl.trim().startsWith('http')) {
    // Fallback to legacy single webhookUrl if rules array is empty
    const success = await syncOrderToGoogleSheet(order, config.webhookUrl.trim(), currency);
    if (success) {
      totalSynced++;
      sheetNames.push('Feuille Principale');
    }
  }

  return { totalSynced, sheetNames };
};

// CodZoss Sync via API
export const syncOrderToCodZoss = async (order: Order, apiToken: string, countryCode: string = 'MA'): Promise<boolean> => {
  if (!apiToken) {
    return false;
  }

  // CodZoss expects a single product per request or a primary product reference
  const firstItem = order.items[0];
  
  const payload = {
    api_token: apiToken,
    recipient: order.customerName,
    phone: order.phone,
    address: order.address || 'Non spécifiée',
    city: order.city,
    product: firstItem?.sku || firstItem?.productTitle || 'N/A',
    product_qt: firstItem?.quantity || 1,
    amount: order.totalPrice,
    country: countryCode,
    note: order.notes || '',
    can_open: true, // Default to true as it's common for COD
  };

  try {
    const response = await fetch('https://codzoss.app/api/v1/orders-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return true;
    }
    const data = await response.json();
    console.error('CodZoss API error:', data);
    return false;
  } catch (error) {
    console.error('CodZoss sync failed:', error);
    return false;
  }
};

// Export Orders to CSV
export const exportOrdersToCSV = (orders: Order[]) => {
  const headers = [
    'N° Commande',
    'Date',
    'Nom Client',
    'Téléphone',
    'Ville',
    'Adresse',
    'Produit',
    'Quantité',
    'Total (DH)',
    'Statut',
  ];

  const rows = orders.map((o) => [
    o.orderNumber,
    new Date(o.createdAt).toLocaleString('fr-FR'),
    `"${(o.customerName || '').replace(/"/g, '""')}"`,
    `"${o.phone}"`,
    `"${(o.city || '').replace(/"/g, '""')}"`,
    `"${(o.address || '').replace(/"/g, '""')}"`,
    `"${o.items.map((i) => `${i.productTitle} (x${i.quantity})`).join(' + ')}"`,
    o.items.reduce((s, i) => s + i.quantity, 0),
    o.totalPrice,
    o.status,
  ]);

  // UTF-8 BOM so Arabic and French letters display accurately in Excel & Sheets
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `commandes_cod_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- Real Visits Storage Helpers ---
export const getStoredVisits = (): StoreVisit[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VISITS);
    if (!raw) {
      safeSetItem(STORAGE_KEYS.VISITS, JSON.stringify(INITIAL_VISITS));
      return INITIAL_VISITS;
    }
    const parsed: StoreVisit[] = JSON.parse(raw);
    // Remove old legacy dummy visits if any exist
    const cleaned = parsed.filter((v) => v.id && !v.id.startsWith('vis_demo') && v.visitorId !== 'demo_visitor');
    if (!cleaned || cleaned.length === 0) {
      safeSetItem(STORAGE_KEYS.VISITS, JSON.stringify(INITIAL_VISITS));
      return INITIAL_VISITS;
    }
    if (cleaned.length !== parsed.length) {
      saveStoredVisits(cleaned);
    }
    return cleaned;
  } catch (e) {
    return INITIAL_VISITS;
  }
};

export const saveStoredVisits = (visits: StoreVisit[]) => {
  try {
    // Keep full visits history in storage, up to 3000 visits (never capping to 200)
    safeSetItem(STORAGE_KEYS.VISITS, JSON.stringify(visits.slice(0, 3000)));
    safeSetItem(STORAGE_KEYS.VISITS_COUNT, String(visits.length));
  } catch (e) {
    console.warn('Failed to save visits to local storage:', e);
  }
};

export const recordRealVisit = (page: string, userId?: string): { visits: StoreVisit[]; newVisit: StoreVisit } => {
  try {
    let visitorId = sessionStorage.getItem('mystore_visitor_token');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      sessionStorage.setItem('mystore_visitor_token', visitorId);
    }

    const newVisit: StoreVisit = {
      id: 'vis_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      page: page || '/store',
      userId: userId || 'default',
      visitorId,
    };

    const existing = getStoredVisits();
    const updated = [newVisit, ...existing].slice(0, 3000);
    saveStoredVisits(updated);
    return { visits: updated, newVisit };
  } catch (e) {
    console.warn('Failed to record real visit:', e);
    const dummyVisit: StoreVisit = {
      id: 'vis_' + Date.now(),
      timestamp: new Date().toISOString(),
      page: page || '/store',
      userId: userId || 'default',
    };
    return { visits: [], newVisit: dummyVisit };
  }
};

// --- Fast Instant Dashboard Metrics Cache ---
export interface CachedDashboardMetrics {
  ordersCount: number;
  totalRevenue: number;
  rangeAOV: number;
  visitsCount: number;
  confirmedCount: number;
  timestamp: number;
}

export const getCachedDashboardMetrics = (): CachedDashboardMetrics | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAST_METRICS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveCachedDashboardMetrics = (metrics: Partial<CachedDashboardMetrics>) => {
  try {
    const existing = getCachedDashboardMetrics() || {
      ordersCount: 4,
      totalRevenue: 785,
      rangeAOV: 196,
      visitsCount: 400,
      confirmedCount: 3,
      timestamp: Date.now(),
    };
    const updated: CachedDashboardMetrics = {
      ...existing,
      ...metrics,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.FAST_METRICS, JSON.stringify(updated));
  } catch {}
};
