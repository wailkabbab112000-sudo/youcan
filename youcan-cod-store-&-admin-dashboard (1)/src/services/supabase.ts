import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, Product, StoreSettings, SupabaseConfig, StoreVisit } from '../types';
import { isDemoProduct } from './storage';

let supabaseClientInstance: SupabaseClient | null = null;
let currentConfigKey = '';

export const getSupabaseConfig = (customConfig?: SupabaseConfig): { url: string; anonKey: string; enabled: boolean } => {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = (metaEnv.VITE_SUPABASE_URL || '').trim();
  const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

  let url = '';
  let anonKey = '';
  let isCustomEnabled: boolean | undefined = undefined;

  if (customConfig && customConfig.url?.trim() && customConfig.anonKey?.trim()) {
    url = customConfig.url.trim();
    anonKey = customConfig.anonKey.trim();
    isCustomEnabled = customConfig.enabled;
  } else {
    try {
      const rawSettings = localStorage.getItem('mystore_cod_settings_v1');
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        if (parsed.supabaseConfig?.url?.trim() && parsed.supabaseConfig?.anonKey?.trim()) {
          url = parsed.supabaseConfig.url.trim();
          anonKey = parsed.supabaseConfig.anonKey.trim();
          isCustomEnabled = parsed.supabaseConfig.enabled;
        }
      }
    } catch (e) {
      console.warn('Could not read saved Supabase config from localStorage', e);
    }
  }

  // Fallback to import.meta.env if url or anonKey are empty
  if (!url || !anonKey) {
    url = envUrl;
    anonKey = envKey;
  }

  // Strip trailing slashes and subpaths if user pasted full endpoint
  url = url
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/auth\/v1\/?$/, '')
    .replace(/\/+$/, '');

  // Check if credentials are generic placeholders or missing valid protocol
  const isPlaceholder =
    !url ||
    !anonKey ||
    url.includes('your-project-id') ||
    url.includes('example.com') ||
    anonKey.includes('your-supabase-anon-key') ||
    anonKey.includes('your-anon-key') ||
    (!url.startsWith('http://') && !url.startsWith('https://'));

  const enabled = isCustomEnabled ?? !isPlaceholder;

  return {
    url,
    anonKey,
    enabled: enabled && !isPlaceholder,
  };
};

export const getSupabaseClient = (customConfig?: SupabaseConfig): SupabaseClient | null => {
  const { url, anonKey, enabled } = getSupabaseConfig(customConfig);

  if (!url || !anonKey || !enabled) {
    return null;
  }

  const key = `${url}::${anonKey}`;
  if (!supabaseClientInstance || currentConfigKey !== key) {
    supabaseClientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentConfigKey = key;
  }

  return supabaseClientInstance;
};

export const testSupabaseConnection = async (testUrl?: string, testKey?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const envConfig = getSupabaseConfig();
    const url = testUrl || envConfig.url;
    const key = testKey || envConfig.anonKey;

    if (!url || !key) {
      return {
        success: false,
        message: 'Veuillez saisir votre URL Supabase et votre Clé Anon (Clé publique).',
      };
    }

    const client = createClient(url, key, { auth: { persistSession: false } });
    
    // Simple ping query to check connection
    const { data, error } = await client.from('orders').select('count', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist yet, but authentication worked:
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connexion Supabase réussie ! Note : La table "orders" n\'existe pas encore. Utilisez le script SQL ci-dessous pour la créer.',
        };
      }
      return {
        success: false,
        message: `Erreur Supabase: ${error.message} (Code: ${error.code})`,
      };
    }

    return {
      success: true,
      message: 'Connexion Supabase établie avec succès ! La base de données est opérationnelle.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erreur de connexion: ${err?.message || 'Impossible de se connecter à Supabase.'}`,
    };
  }
};

/**
 * Supabase Auth helper functions
 */
export const supabaseLogin = async (email: string, password: string, customConfig?: SupabaseConfig): Promise<{ success: boolean; user?: any; message: string }> => {
  try {
    const client = getSupabaseClient(customConfig);
    if (!client) {
      return { success: false, message: 'Supabase n\'est pas configuré.' };
    }

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      // If user does not exist yet or credentials failed, attempt sign up
      const errLower = (error.message || '').toLowerCase();
      if (errLower.includes('invalid login credentials') || errLower.includes('user not found')) {
        const signUpRes = await client.auth.signUp({ email, password });
        
        if (signUpRes.data?.user) {
          return {
            success: true,
            user: signUpRes.data.user,
            message: 'Nouveau compte créé et connecté avec succès !',
          };
        }

        if (signUpRes.error) {
          const signUpErrLower = signUpRes.error.message.toLowerCase();
          if (signUpErrLower.includes('already registered') || signUpErrLower.includes('already exists')) {
            return { success: false, message: 'Mot de passe incorrect pour cet email.' };
          }
          if (signUpErrLower.includes('disabled')) {
            return { success: false, message: 'L\'inscription est désactivée dans votre projet Supabase. Créez l\'utilisateur dans Supabase Auth.' };
          }
        }
      }

      let translatedMsg = error.message;
      if (errLower.includes('invalid login credentials')) {
        translatedMsg = 'Email ou mot de passe incorrect.';
      } else if (errLower.includes('email not confirmed')) {
        translatedMsg = 'Veuillez confirmer votre email dans Supabase (ou désactiver "Confirm Email" dans Supabase Auth Settings).';
      } else if (errLower.includes('invalid path')) {
        translatedMsg = 'URL Supabase invalide. Veuillez vérifier l\'URL dans "Paramètres API" (ex: https://xyz.supabase.co).';
      }

      return { success: false, message: translatedMsg };
    }

    return {
      success: true,
      user: data.user,
      message: 'Connexion réussie !',
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erreur lors de la connexion' };
  }
};

export const supabaseLogout = async (customConfig?: SupabaseConfig): Promise<void> => {
  try {
    const client = getSupabaseClient(customConfig);
    if (client) {
      await client.auth.signOut();
    }
  } catch (e) {
    console.warn('Error during logout', e);
  }
};

export const supabaseGetCurrentUser = async (customConfig?: SupabaseConfig): Promise<any | null> => {
  try {
    const client = getSupabaseClient(customConfig);
    if (!client) return null;
    const { data } = await client.auth.getUser();
    return data?.user || null;
  } catch (e) {
    return null;
  }
};

/**
 * Sync order to Supabase table "orders"
 */
export const syncOrderToSupabase = async (order: Order, userId?: string, customConfig?: SupabaseConfig): Promise<{ success: boolean; message: string }> => {
  try {
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) {
      return { success: false, message: 'Supabase n\'est pas configuré.' };
    }

    const client = getSupabaseClient(customConfig);
    if (!client) {
      return { success: false, message: 'Supabase n\'est pas configuré.' };
    }

    const payload = {
      id: order.id,
      order_number: order.orderNumber,
      customer_name: order.customerName,
      phone: order.phone,
      city: order.city,
      address: order.address,
      notes: order.notes || '',
      items: order.items,
      total_price: order.totalPrice,
      status: order.status,
      user_id: userId || order.userId || 'default',
      created_at: order.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from('orders')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Failed to sync order to Supabase:', error.message);
      return { success: false, message: `Erreur Supabase: ${error.message}` };
    }

    return { success: true, message: 'Commande synchronisée sur Supabase avec succès.' };
  } catch (err: any) {
    console.warn('Error in syncOrderToSupabase:', err);
    return { success: false, message: err?.message || 'Erreur lors de la synchronisation Supabase' };
  }
};

/**
 * Fetch orders from Supabase for a specific store user
 */
export const fetchOrdersFromSupabase = async (userId?: string, customConfig?: SupabaseConfig): Promise<Order[] | null> => {
  try {
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) return null;

    const client = getSupabaseClient(customConfig);
    if (!client) return null;

    // Fetch all store orders so that any admin on any PC sees all customer orders
    const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST125' || error.code === '42P01') {
        console.warn(`Supabase orders table not ready or unconfigured (${error.code}):`, error.message);
      } else {
        console.warn('Could not fetch orders from Supabase:', error.message);
      }
      return null;
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      phone: row.phone,
      city: row.city,
      address: row.address,
      notes: row.notes,
      items: row.items || [],
      totalPrice: Number(row.total_price),
      status: row.status || 'nouveau',
      createdAt: row.created_at,
      userId: row.user_id,
      syncedToGoogleSheet: true,
    }));
  } catch (err: any) {
    console.warn('Exception fetching orders from Supabase:', err?.message || err);
    return null;
  }
};

/**
 * Fetch products from Supabase for a specific store user
 */
export const fetchProductsFromSupabase = async (userId?: string, customConfig?: SupabaseConfig): Promise<Product[] | null> => {
  try {
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) return null;

    const client = getSupabaseClient(customConfig);
    if (!client) return null;

    // Fetch all store products so all products are visible across all PCs and devices
    const { data, error } = await client.from('products').select('*').order('updated_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST125' || error.code === '42P01') {
        console.warn(`Supabase products table not ready or unconfigured (${error.code}):`, error.message);
      } else {
        console.warn('Could not fetch products from Supabase:', error.message);
      }
      return null;
    }

    if (!data) return [];

    // Identify any demo products stored in Supabase and purge them permanently
    const demoRows = data.filter((row: any) => isDemoProduct({ id: row.id, slug: row.slug, title: row.title, titleAr: row.title_ar }));
    if (demoRows.length > 0) {
      demoRows.forEach((row: any) => {
        deleteProductFromSupabase(row.id, customConfig);
      });
    }

    const cleanRows = data.filter((row: any) => !isDemoProduct({ id: row.id, slug: row.slug, title: row.title, titleAr: row.title_ar }));

    return cleanRows.map((row: any) => ({
      id: row.id,
      title: row.title,
      titleAr: row.title_ar || row.titleAr,
      slug: row.slug,
      category: row.category,
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      inStock: row.in_stock ?? true,
      stockCount: row.stock_count ?? 0,
      sku: row.sku,
      badge: row.badge,
      badgeFr: row.badge_fr || row.badgeFr,
      badgeAr: row.badge_ar || row.badgeAr,
      isFeatured: row.is_featured,
      images: row.images || [],
      description: row.description,
      descriptionAr: row.description_ar || row.descriptionAr,
      features: row.features || [],
      featuresFr: row.features_fr || [],
      offers: row.offers || [],
      reviews: row.reviews || [],
      pageLanguage: row.page_language || row.pageLanguage || 'ar',
      orderButtonText: row.order_button_text || row.orderButtonText,
      orderButtonTextAr: row.order_button_text_ar || row.orderButtonTextAr,
      orderButtonTextEn: row.order_button_text_en || row.orderButtonTextEn || ((row.page_language === 'en' || row.pageLanguage === 'en') ? (row.order_button_text || row.orderButtonText) : undefined),
      countdownMinutes: row.countdown_minutes ? Number(row.countdown_minutes) : undefined,
      countryCode: row.country_code || row.countryCode,
      userId: row.user_id,
    }));
  } catch (err: any) {
    console.warn('Exception fetching products from Supabase:', err?.message || err);
    return null;
  }
};

/**
 * Fast targeted fetch of a single product by slug or id from Supabase
 */
export const fetchSingleProductFromSupabase = async (
  slugOrId: string,
  customConfig?: SupabaseConfig
): Promise<Product | null> => {
  try {
    if (!slugOrId) return null;
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) return null;

    const client = getSupabaseClient(customConfig);
    if (!client) return null;

    const clean = slugOrId.trim().toLowerCase();
    const { data, error } = await client
      .from('products')
      .select('*')
      .or(`slug.ilike.${clean},id.eq.${clean}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const row = data;
    return {
      id: row.id,
      title: row.title,
      titleAr: row.title_ar || row.titleAr,
      slug: row.slug,
      category: row.category,
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      inStock: row.in_stock ?? true,
      stockCount: row.stock_count ?? 0,
      sku: row.sku,
      badge: row.badge,
      badgeFr: row.badge_fr || row.badgeFr,
      badgeAr: row.badge_ar || row.badgeAr,
      isFeatured: row.is_featured,
      images: row.images || [],
      description: row.description,
      descriptionAr: row.description_ar || row.descriptionAr,
      features: row.features || [],
      featuresFr: row.features_fr || [],
      offers: row.offers || [],
      reviews: row.reviews || [],
      pageLanguage: row.page_language || row.pageLanguage || 'ar',
      orderButtonText: row.order_button_text || row.orderButtonText,
      orderButtonTextAr: row.order_button_text_ar || row.orderButtonTextAr,
      orderButtonTextEn: row.order_button_text_en || row.orderButtonTextEn || ((row.page_language === 'en' || row.pageLanguage === 'en') ? (row.order_button_text || row.orderButtonText) : undefined),
      countdownMinutes: row.countdown_minutes ? Number(row.countdown_minutes) : undefined,
      countryCode: row.country_code || row.countryCode,
      userId: row.user_id,
    };
  } catch (err: any) {
    console.warn('Error fetching single product from Supabase:', err);
    return null;
  }
};

/**
 * Delete product from Supabase table "products"
 */
export const deleteProductFromSupabase = async (productId: string, customConfig?: SupabaseConfig): Promise<boolean> => {
  try {
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) return false;

    const client = getSupabaseClient(customConfig);
    if (!client) return false;

    const { error } = await client.from('products').delete().eq('id', productId);
    if (error) {
      console.warn('Failed to delete product from Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Error deleting product from Supabase:', err?.message || err);
    return false;
  }
};

/**
 * Delete order from Supabase table "orders"
 */
export const deleteOrderFromSupabase = async (orderId: string, customConfig?: SupabaseConfig): Promise<boolean> => {
  try {
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) return false;

    const client = getSupabaseClient(customConfig);
    if (!client) return false;

    const { error } = await client.from('orders').delete().eq('id', orderId);
    if (error) {
      console.warn('Failed to delete order from Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Error deleting order from Supabase:', err?.message || err);
    return false;
  }
};

/**
 * Sync product list to Supabase table "products"
 */
export const syncProductToSupabase = async (product: Product, userId?: string, customConfig?: SupabaseConfig): Promise<boolean> => {
  try {
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) return false;

    const client = getSupabaseClient(customConfig);
    if (!client) return false;

    const targetUserId = userId || product.userId || 'default';
    const payload = {
      id: product.id,
      title: product.title,
      title_ar: product.titleAr || '',
      slug: product.slug,
      category: product.category,
      price: product.price,
      original_price: product.originalPrice || null,
      in_stock: product.inStock,
      stock_count: product.stockCount || 0,
      sku: product.sku || '',
      badge: product.badge || '',
      badge_fr: product.badgeFr || '',
      badge_ar: product.badgeAr || '',
      is_featured: product.isFeatured || false,
      images: product.images || [],
      description: product.description || '',
      description_ar: product.descriptionAr || '',
      features: product.features || [],
      features_fr: product.featuresFr || [],
      offers: product.offers || [],
      reviews: product.reviews || [],
      page_language: product.pageLanguage || 'ar',
      order_button_text: product.pageLanguage === 'en'
        ? (product.orderButtonTextEn || product.orderButtonText || '')
        : (product.orderButtonText || ''),
      order_button_text_ar: product.orderButtonTextAr || '',
      countdown_minutes: product.countdownMinutes || 180,
      country_code: product.countryCode || '',
      user_id: targetUserId,
      updated_at: new Date().toISOString(),
    };

    let { error } = await client.from('products').upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('❌ Error syncing product to Supabase:', error.message, error);
      return false;
    }
    console.log('✅ Product synced to Supabase successfully:', product.title);
    return true;
  } catch (err: any) {
    console.warn('Exception syncing product to Supabase:', err?.message || err);
    return false;
  }
};

/**
 * Sync store settings to Supabase table "store_settings"
 */
export const syncSettingsToSupabase = async (settings: StoreSettings, userId?: string, customConfig?: SupabaseConfig): Promise<boolean> => {
  try {
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) return false;

    const client = getSupabaseClient(customConfig);
    if (!client) return false;

    const targetId = userId || 'default';
    const payload = {
      id: targetId,
      user_id: targetId,
      theme_color: settings.themeColor || '#e11d48',
      dashboard_color: settings.dashboardColor || '#2563eb',
      settings_data: {
        ...settings,
        themeColor: settings.themeColor || '#e11d48',
        dashboardColor: settings.dashboardColor || '#2563eb',
      },
      updated_at: new Date().toISOString(),
    };

    let { error } = await client.from('store_settings').upsert(payload, { onConflict: 'id' });
    if (error && (error.message?.includes('dashboard_color') || error.code === '42703')) {
      // Fallback if dashboard_color column is not yet migrated in Supabase
      const fallbackPayload = {
        id: targetId,
        user_id: targetId,
        theme_color: settings.themeColor || '#e11d48',
        settings_data: {
          ...settings,
          themeColor: settings.themeColor || '#e11d48',
          dashboardColor: settings.dashboardColor || '#2563eb',
        },
        updated_at: new Date().toISOString(),
      };
      const fallbackRes = await client.from('store_settings').upsert(fallbackPayload, { onConflict: 'id' });
      error = fallbackRes.error;
    }

    // Also sync to 'default' row to ensure guests and any PC without active session always get the latest settings
    if (targetId !== 'default') {
      try {
        await client.from('store_settings').upsert({
          ...payload,
          id: 'default',
          user_id: 'default',
        }, { onConflict: 'id' });
      } catch (e) {
        // Non-blocking
      }
    }

    if (error) {
      console.error('❌ Error syncing store settings to Supabase:', error.message, error);
      return false;
    }
    console.log('✅ Store settings synced to Supabase successfully for user:', targetId);
    return true;
  } catch (err: any) {
    console.warn('Exception syncing store settings to Supabase:', err?.message || err);
    return false;
  }
};

/**
 * Fetch store settings from Supabase
 */
export const fetchSettingsFromSupabase = async (userId?: string, customConfig?: SupabaseConfig): Promise<StoreSettings | null> => {
  try {
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) return null;

    const client = getSupabaseClient(customConfig);
    if (!client) return null;

    let query = client.from('store_settings').select('*');

    if (userId) {
      query = query.or(`id.eq.${userId},user_id.eq.${userId},id.eq.default,user_id.eq.default`);
    }

    let { data, error } = await query.order('updated_at', { ascending: false }).limit(1);

    // If no row found for this specific userId, fall back to ANY latest store_settings row in database
    if (!data || data.length === 0) {
      const fallback = await client.from('store_settings').select('*').order('updated_at', { ascending: false }).limit(1);
      if (fallback.data && fallback.data.length > 0) {
        data = fallback.data;
      }
    }

    if (error || !data || data.length === 0) return null;

    const row = data[0];
    if (row && row.settings_data) {
      const parsedSettings = row.settings_data as StoreSettings;
      
      // Always prioritize explicit database columns over older settings_data JSON
      if (row.theme_color) {
        parsedSettings.themeColor = row.theme_color;
      }
      if (row.dashboard_color) {
        parsedSettings.dashboardColor = row.dashboard_color;
      }
      if (row.updated_at) {
        parsedSettings.updatedAt = row.updated_at;
      }
      return parsedSettings;
    }
    return null;
  } catch (err: any) {
    console.warn('Exception fetching store settings from Supabase:', err?.message || err);
    return null;
  }
};

/**
 * Sync store visit event to Supabase table "store_visits"
 */
export const syncVisitToSupabase = async (visit: StoreVisit, userId?: string, customConfig?: SupabaseConfig): Promise<boolean> => {
  try {
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) return false;

    const client = getSupabaseClient(customConfig);
    if (!client) return false;

    const payload = {
      id: visit.id,
      timestamp: visit.timestamp,
      page: visit.page,
      visitor_id: visit.visitorId || 'anon',
      user_id: userId || visit.userId || 'default',
    };

    const { error } = await client.from('store_visits').upsert(payload, { onConflict: 'id' });
    if (error) {
      if (error.code !== '42P01') {
        console.warn('Error syncing visit to Supabase:', error.message);
      }
      return false;
    }
    return true;
  } catch (err: any) {
    return false;
  }
};

/**
 * Fetch store visits from Supabase
 */
export const fetchVisitsFromSupabase = async (userId?: string, customConfig?: SupabaseConfig): Promise<StoreVisit[] | null> => {
  try {
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) return null;

    const client = getSupabaseClient(customConfig);
    if (!client) return null;

    let query = client.from('store_visits').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('timestamp', { ascending: false }).limit(2000);
    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      page: row.page,
      visitorId: row.visitor_id,
      userId: row.user_id,
    }));
  } catch (err: any) {
    return null;
  }
};

/**
 * Sync computed daily analytics into Supabase 'analytics' table
 */
export const syncDailyAnalyticsToSupabase = async (
  orders: Order[],
  visits: StoreVisit[] = [],
  userId: string = 'default',
  customConfig?: SupabaseConfig
): Promise<boolean> => {
  try {
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) return false;

    const client = getSupabaseClient(customConfig);
    if (!client) return false;

    // Group orders by date (YYYY-MM-DD)
    const statsByDay: Record<string, {
      date: string;
      orders_count: number;
      confirmed_orders: number;
      cancelled_orders: number;
      revenue: number;
    }> = {};

    orders.forEach((o) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      if (isNaN(d.getTime())) return;
      const dateKey = d.toISOString().split('T')[0];

      if (!statsByDay[dateKey]) {
        statsByDay[dateKey] = {
          date: dateKey,
          orders_count: 0,
          confirmed_orders: 0,
          cancelled_orders: 0,
          revenue: 0,
        };
      }

      statsByDay[dateKey].orders_count += 1;
      if (o.status === 'annule') {
        statsByDay[dateKey].cancelled_orders += 1;
      } else {
        if (o.status === 'confirme' || o.status === 'expedie' || o.status === 'livre') {
          statsByDay[dateKey].confirmed_orders += 1;
        }
        statsByDay[dateKey].revenue += (o.totalPrice || 0);
      }
    });

    // Group visits by date (YYYY-MM-DD)
    const visitsByDay: Record<string, number> = {};
    visits.forEach((v) => {
      if (!v.timestamp) return;
      const d = new Date(v.timestamp);
      if (isNaN(d.getTime())) return;
      const dateKey = d.toISOString().split('T')[0];
      visitsByDay[dateKey] = (visitsByDay[dateKey] || 0) + 1;
    });

    // Always include today's date
    const todayKey = new Date().toISOString().split('T')[0];
    if (!statsByDay[todayKey]) {
      statsByDay[todayKey] = {
        date: todayKey,
        orders_count: 0,
        confirmed_orders: 0,
        cancelled_orders: 0,
        revenue: 0,
      };
    }

    const rowsToUpsert = Object.values(statsByDay).map((item) => {
      const visitors = visitsByDay[item.date] || 0;
      const aov = item.orders_count > 0 ? Math.round(item.revenue / item.orders_count) : 0;
      const convRate = visitors > 0 ? Number(((item.orders_count / visitors) * 100).toFixed(2)) : 0;

      return {
        id: `${userId}_${item.date}`,
        date: item.date,
        user_id: userId,
        orders_count: item.orders_count,
        confirmed_orders: item.confirmed_orders,
        cancelled_orders: item.cancelled_orders,
        revenue: item.revenue,
        average_order_value: aov,
        visitors_count: visitors,
        conversion_rate: convRate,
        updated_at: new Date().toISOString(),
      };
    });

    if (rowsToUpsert.length === 0) return true;

    const { error } = await client.from('analytics').upsert(rowsToUpsert, { onConflict: 'id' });
    if (error) {
      if (error.code !== '42P01') {
        console.warn('Notice syncing analytics to Supabase:', error.message);
      }
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Subscribe to realtime changes in Supabase for products, orders, and settings
 */
export const subscribeToSupabaseChanges = (
  onProductChange?: () => void,
  onOrderChange?: () => void,
  onSettingsChange?: () => void,
  customConfig?: SupabaseConfig
): (() => void) => {
  try {
    const config = getSupabaseConfig(customConfig);
    if (!config.enabled || !config.url || !config.anonKey) return () => {};

    const client = getSupabaseClient(customConfig);
    if (!client) return () => {};

    const channel = client
      .channel('store-live-updates-' + Math.random().toString(36).substring(2, 9))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        console.log('⚡ Realtime update: products changed in Supabase');
        onProductChange?.();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        console.log('⚡ Realtime update: orders changed in Supabase');
        onOrderChange?.();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => {
        console.log('⚡ Realtime update: store_settings changed in Supabase');
        onSettingsChange?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🔌 Supabase Realtime connected and listening for live updates');
        }
      });

    return () => {
      try {
        client.removeChannel(channel);
      } catch (_) {}
    };
  } catch (e) {
    console.warn('Realtime subscription error:', e);
    return () => {};
  }
};

/**
 * SQL DDL Schema generator script for Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- 🚀 SQL Schema pour Supabase - Multi-Store COD Maroc
-- Copiez et collez ce script dans votre Supabase Dashboard (SQL Editor -> New Query -> Run)

-- 1. Table des Commandes (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'nouveau',
    user_id TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des Produits (Products)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_ar TEXT,
    slug TEXT NOT NULL,
    category TEXT,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    in_stock BOOLEAN DEFAULT true,
    stock_count INT DEFAULT 0,
    sku TEXT,
    badge TEXT,
    badge_fr TEXT,
    badge_ar TEXT,
    is_featured BOOLEAN DEFAULT false,
    images JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    description_ar TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    features_fr JSONB DEFAULT '[]'::jsonb,
    offers JSONB DEFAULT '[]'::jsonb,
    reviews JSONB DEFAULT '[]'::jsonb,
    page_language TEXT DEFAULT 'ar',
    order_button_text TEXT,
    order_button_text_ar TEXT,
    order_button_text_en TEXT,
    countdown_minutes INT DEFAULT 180,
    country_code TEXT,
    user_id TEXT DEFAULT 'default',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les colonnes si la table existait déjà auparavant
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge_fr TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge_ar TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS page_language TEXT DEFAULT 'ar';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS order_button_text TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS order_button_text_ar TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS order_button_text_en TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS countdown_minutes INT DEFAULT 180;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS country_code TEXT;

-- 3. Table des Paramètres Boutique (Store Settings & Theme & Dashboard Colors)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'default',
    theme_color TEXT DEFAULT '#e11d48',
    dashboard_color TEXT DEFAULT '#2563eb',
    settings_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les colonnes si store_settings existait déjà
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#e11d48';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS dashboard_color TEXT DEFAULT '#2563eb';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS settings_data JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Table des Visites Réelles (Store Visits)
CREATE TABLE IF NOT EXISTS public.store_visits (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    page TEXT NOT NULL,
    visitor_id TEXT,
    user_id TEXT DEFAULT 'default'
);

-- 5. Table des Analyses & Statistiques (Analytics)
CREATE TABLE IF NOT EXISTS public.analytics (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    user_id TEXT DEFAULT 'default',
    orders_count INTEGER DEFAULT 0,
    confirmed_orders INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    revenue NUMERIC(12, 2) DEFAULT 0.00,
    average_order_value NUMERIC(12, 2) DEFAULT 0.00,
    visitors_count INTEGER DEFAULT 0,
    conversion_rate NUMERIC(5, 2) DEFAULT 0.00,
    top_products JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.store_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON public.store_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON public.store_visits(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON public.analytics(date);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics(user_id);

-- 7. Configuration RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Insert Access Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access Orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Public Read Access Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Upsert Access Products" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access Settings" ON public.store_settings;
CREATE POLICY "Public Access Settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public Access Visits" ON public.store_visits;
CREATE POLICY "Public Access Visits" ON public.store_visits FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public Access Analytics" ON public.analytics;
CREATE POLICY "Public Access Analytics" ON public.analytics FOR ALL USING (true) WITH CHECK (true);

-- 8. Vue SQL Temps Réel pour les Analyses Quotidiennes (Daily Analytics View)
CREATE OR REPLACE VIEW public.daily_analytics_view AS
SELECT 
    DATE(o.created_at) AS order_date,
    COUNT(o.id) AS total_orders,
    COUNT(CASE WHEN o.status IN ('confirme', 'expedie', 'livre') THEN 1 END) AS confirmed_orders,
    COUNT(CASE WHEN o.status = 'annule' THEN 1 END) AS cancelled_orders,
    COALESCE(SUM(CASE WHEN o.status != 'annule' THEN o.total_price ELSE 0 END), 0) AS total_revenue,
    ROUND(AVG(CASE WHEN o.status != 'annule' THEN o.total_price ELSE NULL END), 2) AS average_order_value
FROM public.orders o
GROUP BY DATE(o.created_at)
ORDER BY order_date DESC;
`;
