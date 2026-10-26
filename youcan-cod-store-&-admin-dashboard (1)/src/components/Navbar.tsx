import React from 'react';
import { ShoppingBag, ShieldCheck, Phone, LayoutDashboard, Store, Sparkles, ChevronRight, Search, LayoutGrid } from 'lucide-react';
import { StoreSettings, Product } from '../types';
import { getStoreThemeColor } from '../utils/themeHelper';

interface NavbarProps {
  currentView: 'store' | 'admin' | 'product';
  onNavigate: (view: 'store' | 'admin' | 'product', productId?: string) => void;
  settings: StoreSettings;
  ordersCount: number;
  lang: 'ar' | 'fr' | 'en';
  onToggleLang: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  products?: Product[];
  selectedCategory?: string;
  onCategoryChange?: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  settings,
  ordersCount,
  lang,
  onToggleLang,
  searchQuery,
  onSearchChange,
  isSearchOpen,
  onToggleSearch,
  products = [],
  selectedCategory = 'all',
  onCategoryChange = (_cat: string) => {},
}) => {
  const isAr = lang === 'ar';
  const isEn = lang === 'en';

  const announcementText = isAr
    ? settings.announcementTextAr
    : isEn
    ? (settings.announcementTextEn || settings.announcementText)
    : settings.announcementText;

  const subtitleText = isAr
    ? 'متجر الدفع عند الاستلام المعتمد'
    : isEn
    ? 'Certified Cash on Delivery Store'
    : 'Boutique Cash On Delivery certifiée';

  const homeText = isAr ? 'الرئيسية' : isEn ? 'Home' : 'Accueil';
  const contactText = isAr ? 'اتصل بنا' : isEn ? 'Contact' : 'Contact';
  const categoriesMenuText = isAr ? 'التصنيفات' : isEn ? 'Collections' : 'Catégories';

  const viewStoreText = isAr ? 'معاينة المتجر للزبون' : isEn ? 'View Client Store' : 'Voir Boutique Client';
  const adminText = isAr ? 'لوحة التحكم Admin' : isEn ? 'Admin Dashboard' : 'Tableau de Bord Admin';

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];
  const themeColor = getStoreThemeColor(settings.themeColor);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Announcement Bar */}
      {settings.enableAnnouncement && (
        <div style={{ backgroundColor: themeColor }} className="text-white text-xs sm:text-sm font-medium py-2 px-4 text-center flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse hidden sm:inline" />
          <span>{announcementText}</span>
          <span className="hidden md:inline text-emerald-200">|</span>
          <span className="hidden md:inline font-bold text-amber-300">
            {isAr ? 'الدفع بعد المعاينة والرضا عن المنتج' : isEn ? 'Pay after inspection of the package' : 'Paiement après vérification du colis'}
          </span>
        </div>
      )}

      {/* Main Bar */}
      <div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all"
        style={{ minHeight: Math.max(64, (settings.logoHeight || 45) + 16) }}
      >
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('store')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
            id="brand-logo-btn"
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                style={{ height: `${settings.logoHeight || 45}px` }}
                className="w-auto object-contain hover:opacity-90 transition-opacity"
                loading="eager"
                decoding="sync"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span
                style={{ color: themeColor }}
                className="font-extrabold text-xl sm:text-2xl tracking-tight uppercase"
              >
                {settings.storeName}
              </span>
            )}
          </button>
        </div>

        {/* Center / Navigation items */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onNavigate('store')}
            className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${
              currentView === 'store' ? '' : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{
              color: currentView === 'store' ? getStoreThemeColor(settings.themeColor) : undefined
            }}
          >
            <Store className="w-4 h-4" style={{ color: getStoreThemeColor(settings.themeColor) }} />
            <span>{homeText}</span>
          </button>

          <div className="h-4 w-px bg-gray-200" />

          <button
            onClick={() => {
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
            className="text-sm font-bold transition-colors flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
          >
            <Phone className="w-4 h-4" style={{ color: getStoreThemeColor(settings.themeColor) }} />
            <span>{contactText}</span>
          </button>

          <div className="h-4 w-px bg-gray-200" />

          <button
            onClick={() => {
              if (currentView !== 'store') onNavigate('store');
              if (!isSearchOpen) onToggleSearch();
            }}
            className="text-sm font-bold transition-colors flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
          >
            <LayoutGrid className="w-4 h-4" style={{ color: getStoreThemeColor(settings.themeColor) }} />
            <span>{categoriesMenuText}</span>
          </button>
        </div>

        {/* Right: Search Toggle & Admin Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Toggle Button */}
          <button
            onClick={onToggleSearch}
            className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center ${
              isSearchOpen ? 'bg-gray-200 border-gray-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            title={isAr ? 'بحث' : 'Search'}
            id="toggle-search-btn"
          >
            <Search className="w-4 h-4 text-gray-700" />
          </button>

          {/* Admin Switcher Button (Only shown when inside admin view) */}
          {currentView === 'admin' && (
            <button
              onClick={() => onNavigate('store')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
              id="switch-to-store-btn"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">{viewStoreText}</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Full-Width Search Bar Banner */}
      {isSearchOpen && (
        <div
          style={{ backgroundColor: getStoreThemeColor(settings.themeColor) }}
          className="py-3.5 px-4 sm:px-8 shadow-md border-t border-white/10 transition-all duration-300 animate-fadeIn"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            {/* Collection / Category Dropdown */}
            <div className="w-full sm:w-64 relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  onCategoryChange(e.target.value);
                  if (currentView !== 'store') onNavigate('store');
                }}
                className="w-full bg-white text-gray-800 font-semibold py-2.5 px-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-white text-xs sm:text-sm appearance-none cursor-pointer"
              >
                <option value="all">{isAr ? 'جميع المجموعات (All Collections)' : isEn ? 'All Collections' : 'Toutes les collections'}</option>
                {categories.filter(c => c !== 'all').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
            </div>

            {/* Search Input Box */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView !== 'store') onNavigate('store');
                }}
                placeholder={isAr ? 'بحث عن منتج (Search product)...' : isEn ? 'Search product...' : 'Rechercher un produit...'}
                className="w-full bg-white text-gray-900 placeholder-gray-400 font-medium py-2.5 pl-4 pr-11 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-white text-xs sm:text-sm shadow-sm"
                autoFocus
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onToggleSearch}
              className="text-white hover:bg-black/10 px-3 py-2 rounded-xl transition-colors font-bold text-xs flex items-center gap-1 cursor-pointer"
              title="Close"
            >
              ✕ {isAr ? 'إغلاق' : isEn ? 'Close' : 'Fermer'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
