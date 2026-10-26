import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductPage } from './components/ProductPage';
import { ProductPageSkeleton } from './components/ProductPageSkeleton';
import { StorefrontCatalog } from './components/StorefrontCatalog';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginPage } from './components/admin/LoginPage';
import { FacebookPixel, trackPixelEvent } from './components/FacebookPixel';
import { TikTokPixel, trackTikTokEvent } from './components/TikTokPixel';
import { GoogleAdsPixel, trackGoogleAdsConversion } from './components/GoogleAdsPixel';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { Product, Order, OrderStatus, StoreSettings, GoogleSheetsConfig, CodZossConfig, StoreVisit } from './types';
import { applyStoreTheme } from './utils/themeHelper';
import {
  getStoredProducts,
  saveStoredProducts,
  isDemoProduct,
  getStoredOrders,
  saveStoredOrders,
  getStoredSettings,
  saveStoredSettings,
  getStoredSheetsConfig,
  saveStoredSheetsConfig,
  getStoredCodZossConfig,
  saveStoredCodZossConfig,
  getStoredVisits,
  saveStoredVisits,
  recordRealVisit,
  syncOrderToGoogleSheet,
  syncOrderToAllMatchingSheets,
  syncOrderToCodZoss,
} from './services/storage';
import {
  syncOrderToSupabase,
  fetchOrdersFromSupabase,
  syncProductToSupabase,
  fetchProductsFromSupabase,
  fetchSingleProductFromSupabase,
  syncSettingsToSupabase,
  fetchSettingsFromSupabase,
  syncVisitToSupabase,
  fetchVisitsFromSupabase,
  syncDailyAnalyticsToSupabase,
  deleteProductFromSupabase,
  deleteOrderFromSupabase,
  supabaseLogout,
  supabaseGetCurrentUser,
  subscribeToSupabaseChanges,
} from './services/supabase';

// Helpers for synchronous URL routing
function extractTargetSlugFromUrl(): string {
  try {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    let targetSlug = '';

    if (path.startsWith('/products/')) {
      targetSlug = path.replace('/products/', '').split('/')[0];
    } else if (path.startsWith('/product/')) {
      targetSlug = path.replace('/product/', '').split('/')[0];
    } else if (path.startsWith('/p/')) {
      targetSlug = path.replace('/p/', '').split('/')[0];
    }

    if (!targetSlug && hash) {
      const cleanHash = hash.replace(/^#\/?/, '');
      if (cleanHash.startsWith('product/')) {
        targetSlug = cleanHash.replace('product/', '').split('/')[0];
      } else if (cleanHash.startsWith('products/')) {
        targetSlug = cleanHash.replace('products/', '').split('/')[0];
      } else if (!['login', 'admin', 'dashboard', 'store'].includes(cleanHash)) {
        targetSlug = cleanHash;
      }
    }

    if (!targetSlug && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      targetSlug = (params.get('product') || params.get('slug') || params.get('p') || '').toLowerCase();
    }

    return targetSlug ? decodeURIComponent(targetSlug) : '';
  } catch {
    return '';
  }
}

function getInitialRouteInfo(initialProducts: Product[], savedUser: any): {
  view: 'store' | 'product' | 'admin' | 'login';
  product: Product | null;
} {
  try {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();

    const isLoginRoute = path === '/login' || hash === '#login' || search.includes('page=login');
    const isAdminRoute =
      path === '/admin' ||
      path === '/dashboard' ||
      hash === '#admin' ||
      hash === '#dashboard' ||
      search.includes('page=admin') ||
      search.includes('page=dashboard');

    if (isLoginRoute) {
      return { view: 'login', product: null };
    }
    if (isAdminRoute) {
      return { view: savedUser ? 'admin' : 'login', product: null };
    }

    const slug = extractTargetSlugFromUrl();
    if (slug) {
      const matched = initialProducts.find(
        (p) =>
          (p.slug && p.slug.toLowerCase() === slug) ||
          p.id.toLowerCase() === slug ||
          (p.title && p.title.toLowerCase().replace(/\s+/g, '-') === slug)
      );
      return { view: 'product', product: matched || null };
    }
  } catch (e) {}

  return { view: 'store', product: null };
}

export default function App() {
  const initialProducts = getStoredProducts();
  const initialSettings = getStoredSettings();
  const savedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('mystore_current_user_v1') : null;
  let initialUser = null;
  if (savedUserRaw) {
    try {
      initialUser = JSON.parse(savedUserRaw);
    } catch {}
  }
  const initialRoute = getInitialRouteInfo(initialProducts, initialUser);

  const [products, setProducts] = useState<Product[]>(() => initialProducts);
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [settings, setSettings] = useState<StoreSettings>(() => initialSettings);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(getStoredSheetsConfig());
  const [codZossConfig, setCodZossConfig] = useState<CodZossConfig>(getStoredCodZossConfig());
  const [visits, setVisits] = useState<StoreVisit[]>(() => getStoredVisits());

  // Authenticated user state for multi-tenant store isolation
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(() => initialUser);

  // Apply theme color immediately
  useLayoutEffect(() => {
    applyStoreTheme(settings.themeColor);
  }, [settings.themeColor]);

  // View state: 'product', 'store', 'admin', or 'login'
  const [currentView, setCurrentView] = useState<'store' | 'product' | 'admin' | 'login'>(() => initialRoute.view);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => initialRoute.product);

  // Language state: 'ar' (العربية), 'fr' (Français) or 'en' (English)
  const [lang, setLang] = useState<'ar' | 'fr' | 'en'>(
    () => initialRoute.product?.pageLanguage || initialSettings.storeLanguage || 'ar'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Confirmation modal state
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Match product slug from URL path, hash, or search query
  const matchProductFromUrl = (productList: Product[]) => {
    const targetSlug = extractTargetSlugFromUrl();
    if (!targetSlug) return false;

    if (productList && productList.length > 0) {
      const matched = productList.find(
        (p) =>
          (p.slug && p.slug.toLowerCase() === targetSlug) ||
          p.id.toLowerCase() === targetSlug ||
          (p.title && p.title.toLowerCase().replace(/\s+/g, '-') === targetSlug)
      );
      if (matched) {
        setSelectedProduct(matched);
        if (matched.pageLanguage) {
          setLang(matched.pageLanguage);
        }
        setCurrentView('product');
        return true;
      }
    }

    // Direct single product fetch from Supabase if not found in current memory
    fetchSingleProductFromSupabase(targetSlug).then((singleProd) => {
      if (singleProd) {
        setSelectedProduct(singleProd);
        if (singleProd.pageLanguage) {
          setLang(singleProd.pageLanguage);
        }
        setCurrentView('product');
        setProducts((prev) => {
          if (prev.some((p) => p.id === singleProd.id)) return prev;
          return [singleProd, ...prev];
        });
      }
    });

    return false;
  };

  // Check URL path or hash for /login, /dashboard, /admin, or /products/:slug routing
  useEffect(() => {
    const handleUrlCheck = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      const isLoginRoute = path === '/login' || hash === '#login' || search.includes('page=login');
      const isAdminRoute =
        path === '/admin' ||
        path === '/dashboard' ||
        hash === '#admin' ||
        hash === '#dashboard' ||
        search.includes('page=admin') ||
        search.includes('page=dashboard');

      const targetSlug = extractTargetSlugFromUrl();

      if (isLoginRoute) {
        setCurrentView('login');
      } else if (isAdminRoute) {
        const savedUserRaw = localStorage.getItem('mystore_current_user_v1');
        if (savedUserRaw) {
          setCurrentView('admin');
        } else {
          setCurrentView('login');
        }
      } else if (targetSlug) {
        // We are on a product URL: NEVER flash store view!
        setCurrentView('product');
        matchProductFromUrl(products);
      } else {
        setCurrentView('store');
      }
    };

    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, [products]);

  // Initialize data from local storage & Supabase
  useEffect(() => {
    const loadedSettings = getStoredSettings();
    const loadedSheets = getStoredSheetsConfig();
    const loadedCodZoss = getStoredCodZossConfig();

    setSettings(loadedSettings);
    setSheetsConfig(loadedSheets);
    setCodZossConfig(loadedCodZoss);
    if (loadedSettings.storeLanguage) {
      setLang(loadedSettings.storeLanguage);
    }
    if (loadedSettings.themeColor) {
      applyStoreTheme(loadedSettings.themeColor);
    }

    // Try restoring saved user
    const savedUserRaw = localStorage.getItem('mystore_current_user_v1');
    let hasSavedUser = false;
    if (savedUserRaw) {
      try {
        const u = JSON.parse(savedUserRaw);
        if (u && u.id) {
          setCurrentUser(u);
          hasSavedUser = true;
        }
      } catch (e) {}
    }

    // Always hydrate products, orders, and visits synchronously from fast local storage
    const loadedProducts = getStoredProducts().filter((p) => !isDemoProduct(p));
    const loadedOrders = getStoredOrders();
    const loadedVisits = getStoredVisits();
    if (loadedProducts.length > 0) setProducts(loadedProducts);
    if (loadedOrders.length > 0) setOrders(loadedOrders);
    if (loadedVisits.length > 0) setVisits(loadedVisits);

    if (loadedProducts.length > 0) {
      const targetSlug = extractTargetSlugFromUrl();
      const urlMatched = targetSlug
        ? loadedProducts.find(
            (p) =>
              (p.slug && p.slug.toLowerCase() === targetSlug) ||
              p.id.toLowerCase() === targetSlug ||
              (p.title && p.title.toLowerCase().replace(/\s+/g, '-') === targetSlug)
          )
        : null;
      setSelectedProduct(urlMatched || loadedProducts[0]);
    }

    // Try restoring Supabase auth session
    supabaseGetCurrentUser().then((user) => {
      if (user) {
        const u = { id: user.id, email: user.email || '' };
        setCurrentUser(u);
        localStorage.setItem('mystore_current_user_v1', JSON.stringify(u));
      }
    });
  }, []);

  // Unified Realtime Data Synchronization Engine
  useEffect(() => {
    // 1. Immediately hydrate from local storage
    const localProds = getStoredProducts().filter((p) => !isDemoProduct(p));
    const localOrds = getStoredOrders();
    const localSettings = getStoredSettings();

    if (localProds.length > 0) {
      setProducts(localProds);
      if (!selectedProduct) {
        const targetSlug = extractTargetSlugFromUrl();
        const urlMatched = targetSlug
          ? localProds.find(
              (p) =>
                (p.slug && p.slug.toLowerCase() === targetSlug) ||
                p.id.toLowerCase() === targetSlug ||
                (p.title && p.title.toLowerCase().replace(/\s+/g, '-') === targetSlug)
            )
          : null;
        const initialSelected = urlMatched || localProds[0];
        setSelectedProduct(initialSelected);
        if (initialSelected?.pageLanguage) {
          setLang(initialSelected.pageLanguage);
        }
      }
    }
    if (localOrds.length > 0) {
      setOrders(localOrds);
    }
    if (localSettings) {
      setSettings(localSettings);
      if (localSettings.themeColor) applyStoreTheme(localSettings.themeColor);
      if (localSettings.storeLanguage) setLang(localSettings.storeLanguage);
    }

    // Function to load and sync products from Supabase
    const syncProducts = async () => {
      try {
        const remoteProducts = await fetchProductsFromSupabase();
        if (Array.isArray(remoteProducts)) {
          const clean = remoteProducts.filter((p) => !isDemoProduct(p));
          if (clean.length > 0) {
            setProducts(clean);
            saveStoredProducts(clean);
            setSelectedProduct((prevSel) => {
              const targetSlug = extractTargetSlugFromUrl();
              if (targetSlug) {
                const urlMatched = clean.find(
                  (p) =>
                    (p.slug && p.slug.toLowerCase() === targetSlug) ||
                    p.id.toLowerCase() === targetSlug ||
                    (p.title && p.title.toLowerCase().replace(/\s+/g, '-') === targetSlug)
                );
                if (urlMatched) {
                  if (urlMatched.pageLanguage) setLang(urlMatched.pageLanguage);
                  return urlMatched;
                }
              }
              const found = prevSel ? clean.find((p) => p.id === prevSel.id) : null;
              const current = found || clean[0];
              if (current?.pageLanguage) setLang(current.pageLanguage);
              return current;
            });
          }
        }
      } catch (err) {
        console.warn('Sync products error:', err);
      }
    };

    // Function to load and sync orders from Supabase
    const syncOrders = async () => {
      try {
        const remoteOrders = await fetchOrdersFromSupabase();
        if (Array.isArray(remoteOrders)) {
          setOrders(remoteOrders);
          saveStoredOrders(remoteOrders);
          if (currentUser?.id) {
            syncDailyAnalyticsToSupabase(remoteOrders, getStoredVisits(), currentUser.id);
          }
        }
      } catch (err) {
        console.warn('Sync orders error:', err);
      }
    };

    // Function to load and sync settings from Supabase
    const syncSettings = async () => {
      try {
        const remoteSettings = await fetchSettingsFromSupabase();
        if (remoteSettings) {
          setSettings(remoteSettings);
          saveStoredSettings(remoteSettings);
          if (remoteSettings.themeColor) applyStoreTheme(remoteSettings.themeColor);
          if (remoteSettings.storeLanguage) setLang(remoteSettings.storeLanguage);
        }
      } catch (err) {
        console.warn('Sync settings error:', err);
      }
    };

    // Function to load visits from Supabase
    const syncVisits = async () => {
      try {
        const remoteVisits = await fetchVisitsFromSupabase();
        if (Array.isArray(remoteVisits)) {
          setVisits(remoteVisits);
          saveStoredVisits(remoteVisits);
        }
      } catch (err) {
        console.warn('Sync visits error:', err);
      }
    };

    // Execute initial fetches
    syncProducts();
    syncOrders();
    syncSettings();
    syncVisits();

    // Register Supabase Realtime subscription for instant live sync across devices
    const unsubscribe = subscribeToSupabaseChanges(
      () => syncProducts(),
      () => syncOrders(),
      () => syncSettings()
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id]);

  // Real Store Visit Recording Effect whenever someone views the store or a product
  useEffect(() => {
    if (currentView === 'product' || currentView === 'store') {
      const pagePath = currentView === 'product' && selectedProduct
        ? `/product/${selectedProduct.slug || selectedProduct.id}`
        : '/store';
      const targetUserId = selectedProduct?.userId || currentUser?.id || 'default';
      
      // Do not count admin's own preview navigation as real customer store visits
      const isAdminSelfViewing = currentUser && currentUser.id === targetUserId;
      if (!isAdminSelfViewing) {
        const { visits: updatedVisits, newVisit } = recordRealVisit(pagePath, targetUserId);
        setVisits(updatedVisits);
        syncVisitToSupabase(newVisit, targetUserId);
      }
    }
  }, [currentView, selectedProduct?.id]);

  // Login handler
  const handleLoginSuccess = (user: { id: string; email: string }) => {
    setCurrentUser(user);
    localStorage.setItem('mystore_current_user_v1', JSON.stringify(user));
    updateUrlPath('/dashboard');
    setCurrentView('admin');
  };

  // Logout handler
  const handleLogout = async () => {
    await supabaseLogout();
    setCurrentUser(null);
    localStorage.removeItem('mystore_current_user_v1');
    updateUrlPath('/');
    setCurrentView('store');
  };

  // Handlers for Products
  const handleSaveProduct = (product: Product) => {
    const productWithUser = {
      ...product,
      userId: currentUser?.id || product.userId || 'default',
    };

    // Filter out sample demo products when user saves a product
    const customProdsOnly = products.filter((p) => !['prod-1', 'prod-2', 'prod-3'].includes(p.id));

    let updatedProducts: Product[];
    const exists = customProdsOnly.some((p) => p.id === productWithUser.id);
    if (exists) {
      updatedProducts = customProdsOnly.map((p) => (p.id === productWithUser.id ? productWithUser : p));
    } else {
      updatedProducts = [productWithUser, ...customProdsOnly];
    }
    setProducts(updatedProducts);
    saveStoredProducts(updatedProducts);

    if (selectedProduct?.id === productWithUser.id || !selectedProduct || isDemoProduct(selectedProduct)) {
      setSelectedProduct(productWithUser);
      if (productWithUser.pageLanguage) {
        setLang(productWithUser.pageLanguage);
      }
    }

    setSelectedCategory('all');
    setSearchQuery('');

    // Sync product to Supabase with owner user_id
    syncProductToSupabase(productWithUser, currentUser?.id);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    saveStoredProducts(updated);
    if (selectedProduct?.id === productId) {
      setSelectedProduct(updated.length > 0 ? updated[0] : null);
    }

    // Delete product from Supabase Database
    deleteProductFromSupabase(productId);
  };

  // Handlers for Orders
  const handleCreateOrder = async (details: {
    customerName: string;
    phone: string;
    city: string;
    address: string;
    notes?: string;
    quantity: number;
    upsellSelected?: boolean;
    upsellProduct?: { title: string; price: number };
  }) => {
    if (!selectedProduct) return;

    const basePrice = selectedProduct.discountPrice || selectedProduct.price;
    const upsellPrice = details.upsellSelected && details.upsellProduct ? details.upsellProduct.price : 0;
    const totalAmount = (basePrice * details.quantity) + upsellPrice;

    const orderNum = 'COD-' + Math.floor(100000 + Math.random() * 900000);
    const targetUserId = selectedProduct.userId || currentUser?.id || 'default';

    const newOrder: Order = {
      id: orderNum,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      customerName: details.customerName,
      phone: details.phone,
      city: details.city,
      address: details.address,
      notes: details.notes,
      items: [
        {
          productId: selectedProduct.id,
          productTitle: selectedProduct.title,
          productImage: selectedProduct.images?.[0] || selectedProduct.image || '',
          quantity: details.quantity,
          price: basePrice,
        },
        ...(details.upsellSelected && details.upsellProduct ? [{
          productId: 'upsell-' + selectedProduct.id,
          productTitle: details.upsellProduct.title,
          productImage: selectedProduct.images?.[0] || selectedProduct.image || '',
          quantity: 1,
          price: details.upsellProduct.price,
        }] : [])
      ],
      totalPrice: totalAmount,
      status: 'nouveau',
      userId: targetUserId,
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);

    setLatestOrder(newOrder);
    setIsConfirmationOpen(true);

    // Track Pixel Purchase events
    trackPixelEvent('Purchase', {
      value: newOrder.totalPrice,
      currency: settings.currency || 'MAD',
      content_name: selectedProduct.title,
    });
    trackTikTokEvent('CompletePayment', {
      value: newOrder.totalPrice,
      currency: settings.currency || 'MAD',
    });
    trackGoogleAdsConversion(newOrder.totalPrice, settings.currency || 'MAD', newOrder.id);

    // Sync to Google Sheets if configured
    if (sheetsConfig.webhookUrl || (sheetsConfig.rules && sheetsConfig.rules.length > 0)) {
      syncOrderToAllMatchingSheets(newOrder, sheetsConfig, products, settings.currency);
    }

    // Sync to CodZoss if configured
    if (codZossConfig.apiToken) {
      syncOrderToCodZoss(newOrder, codZossConfig.apiToken, settings.countryCode || 'MA');
    }

    // Sync to Supabase under target store owner's user_id
    syncOrderToSupabase(newOrder, targetUserId);
    syncDailyAnalyticsToSupabase(updatedOrders, visits, targetUserId);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updated);
    saveStoredOrders(updated);

    // Sync status change to Supabase
    const targetOrder = updated.find((o) => o.id === orderId);
    if (targetOrder) {
      syncOrderToSupabase(targetOrder, targetOrder.userId || currentUser?.id);
    }
    syncDailyAnalyticsToSupabase(updated, visits, currentUser?.id || 'default');
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    saveStoredOrders(updated);

    // Delete order from Supabase Database
    deleteOrderFromSupabase(orderId);
    syncDailyAnalyticsToSupabase(updated, visits, currentUser?.id || 'default');
  };

  const handleSaveSettings = (newSettings: StoreSettings) => {
    const settingsWithTimestamp: StoreSettings = {
      ...newSettings,
      updatedAt: new Date().toISOString(),
    };
    setSettings(settingsWithTimestamp);
    saveStoredSettings(settingsWithTimestamp);
    applyStoreTheme(settingsWithTimestamp.themeColor);
    if (settingsWithTimestamp.storeLanguage) {
      setLang(settingsWithTimestamp.storeLanguage);
    }
    syncSettingsToSupabase(settingsWithTimestamp, currentUser?.id);
  };

  const handleSaveSheetsConfig = (config: GoogleSheetsConfig) => {
    setSheetsConfig(config);
    saveStoredSheetsConfig(config);
  };

  const handleSaveCodZossConfig = (config: CodZossConfig) => {
    setCodZossConfig(config);
    saveStoredCodZossConfig(config);
  };

  const updateUrlPath = (path: string) => {
    try {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
      if (window.location.hash) {
        window.history.replaceState({}, '', path);
      }
    } catch {
      window.location.hash = path.startsWith('/') ? path.slice(1) : path;
    }
  };

  const handleNavigate = (view: 'store' | 'admin' | 'product' | 'login', productId?: string) => {
    if (productId) {
      const prod = products.find((p) => p.id === productId || p.slug === productId);
      if (prod) {
        setSelectedProduct(prod);
        if (prod.pageLanguage) {
          setLang(prod.pageLanguage);
        }
        const slugToUse = prod.slug || prod.id;
        updateUrlPath(`/product/${slugToUse}`);
      }
    }
    if (view === 'admin') {
      if (!currentUser) {
        updateUrlPath('/login');
        setCurrentView('login');
        return;
      }
      updateUrlPath('/dashboard');
    } else if (view === 'login') {
      updateUrlPath('/login');
    } else if (view === 'store') {
      setSelectedCategory('all');
      setSearchQuery('');
      updateUrlPath('/');
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-emerald-500 selection:text-white">
      {/* Pixels Integration */}
      <FacebookPixel pixelId={settings.facebookPixelId} />
      <TikTokPixel pixelId={settings.tiktokPixelId} />
      <GoogleAdsPixel pixelId={settings.googleAdsPixelId} />

      {/* Navigation Header */}
      {currentView !== 'admin' && currentView !== 'login' && !(currentView === 'product' && !selectedProduct) && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          settings={settings}
          ordersCount={orders.filter((o) => o.status === 'nouveau').length}
          lang={settings.storeLanguage || lang}
          onToggleLang={() => {
            const current = settings.storeLanguage || lang;
            const nextLang: 'ar' | 'fr' | 'en' = current === 'ar' ? 'fr' : current === 'fr' ? 'en' : 'ar';
            const updatedSettings = { ...settings, storeLanguage: nextLang };
            handleSaveSettings(updatedSettings);
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (currentView !== 'store') {
              setCurrentView('store');
            }
          }}
          isSearchOpen={isSearchOpen}
          onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
          products={products}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'login' ? (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onBackToStore={() => setCurrentView('store')}
            lang={settings.storeLanguage || lang}
          />
        ) : currentView === 'admin' ? (
          <AdminDashboard
            products={products}
            orders={orders}
            visits={visits}
            settings={settings}
            sheetsConfig={sheetsConfig}
            codZossConfig={codZossConfig}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onSaveSettings={handleSaveSettings}
            onSaveSheetsConfig={handleSaveSheetsConfig}
            onSaveCodZossConfig={handleSaveCodZossConfig}
            onViewProductPage={(prod) => {
              setSelectedProduct(prod);
              if (prod.pageLanguage) {
                setLang(prod.pageLanguage);
              }
              const slugToUse = prod.slug || prod.id;
              updateUrlPath(`/product/${slugToUse}`);
              setCurrentView('product');
            }}
            onSwitchToStore={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              updateUrlPath('/');
              setCurrentView('store');
            }}
            onLogout={handleLogout}
            lang={settings.storeLanguage || lang}
          />
        ) : currentView === 'product' ? (
          selectedProduct ? (
            <ProductPage
              product={selectedProduct}
              settings={settings}
              onSubmitOrder={handleCreateOrder}
              lang={selectedProduct.pageLanguage || settings.storeLanguage || lang}
              onUpdateProductLanguage={(newLang) => {
                const updated = { ...selectedProduct, pageLanguage: newLang };
                handleSaveProduct(updated);
                setLang(newLang);
              }}
              onLanguageChange={(newLang) => setLang(newLang)}
              onBackToCatalog={() => {
                updateUrlPath('/');
                setCurrentView('store');
              }}
            />
          ) : (
            <ProductPageSkeleton />
          )
        ) : (
          <StorefrontCatalog
            products={products}
            settings={settings}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              if (prod.pageLanguage) {
                setLang(prod.pageLanguage);
              }
              const slugToUse = prod.slug || prod.id;
              updateUrlPath(`/product/${slugToUse}`);
              setCurrentView('product');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            lang={settings.storeLanguage || lang}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        )}
      </div>

      {/* Cash On Delivery Order Confirmation Modal */}
      <OrderConfirmationModal
        order={latestOrder}
        settings={settings}
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        lang={settings.storeLanguage || lang}
      />
    </div>
  );
}
