import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Star, ArrowRight, ShieldCheck, Truck, RotateCcw, Search, Sparkles, PhoneCall,
  Flame, Cpu, Home, HeartHandshake, Shirt, Dumbbell, Layers, Grid, Zap, Package
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { getStoreThemeColor } from '../utils/themeHelper';
import { getLocalizedBadge } from '../utils/offerLocalization';
import { Footer } from './Footer';

interface StorefrontCatalogProps {
  products: Product[];
  settings: StoreSettings;
  onSelectProduct: (product: Product) => void;
  lang: 'ar' | 'fr' | 'en';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
}

export const StorefrontCatalog: React.FC<StorefrontCatalogProps> = ({
  products,
  settings,
  onSelectProduct,
  lang,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}) => {
  const isAr = lang === 'ar';
  const isEn = lang === 'en';
  const themeColor = getStoreThemeColor(settings.themeColor);
  const [currentSlide, setCurrentSlide] = useState(0);

  React.useEffect(() => {
    if (settings.slides && settings.slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % settings.slides!.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [settings.slides]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      const raw = (p.category || '').trim();
      if (raw) {
        const lower = raw.toLowerCase();
        if (!map.has(lower)) {
          map.set(lower, raw);
        }
      }
    });
    return ['all', ...Array.from(map.values())];
  }, [products]);

  const filteredProducts = products.filter((p) => {
    const pCat = (p.category || '').trim().toLowerCase();
    const selCat = (selectedCategory || '').trim().toLowerCase();
    const matchesCat = selCat === 'all' || pCat === selCat;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.titleAr && p.titleAr.includes(searchQuery)) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/50" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Hero Banner with Moroccan COD appeal */}
      <section style={{ background: `linear-gradient(to bottom right, ${themeColor}, #111827)` }} className="text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div style={{ backgroundColor: `${themeColor}40`, borderColor: `${themeColor}60`, color: '#fff' }} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold border">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              {isAr
                ? 'المتجر الإلكتروني رقم 1 للدفع عند الاستلام'
                : isEn
                ? 'No.1 Cash on Delivery Store'
                : 'N°1 du Cash on Delivery'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {isAr
              ? 'تسوق أفضل المنتجات مع الدفع عند الاستلام والتوصيل بالمجان'
              : isEn
              ? 'Order in 1 Click and Pay on Delivery'
              : 'Commandez en 1 Clic et Payez à la Livraison'}
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            {isAr
              ? 'اختر منتجك المفضل، املأ معلوماتك في ثوانٍ، وتوصل بطلبيتك حتى باب منزلك مع إمكانية المعاينة قبل الدفع!'
              : isEn
              ? 'Select your product, fill in your details in seconds, and receive your order at your doorstep with inspection before payment!'
              : 'Sélectionnez votre article, commandez sans carte bancaire, et réglez en espèces après vérification de votre colis.'}
          </p>

          {/* Quick Value Props */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto gap-3.5 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col items-center justify-center transition-all hover:bg-white/15">
              <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center mb-2.5 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-white">{isAr ? 'توصيل مجاني' : isEn ? 'Free Delivery' : 'Livraison 0 DH'}</p>
              <p className="text-[11px] text-white/80 font-medium mt-0.5">{isAr ? '24 - 48 ساعة' : isEn ? 'All Cities' : 'Toutes les villes'}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col items-center justify-center transition-all hover:bg-white/15">
              <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center mb-2.5 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-white">{isAr ? 'دفع عند الاستلام' : isEn ? 'Cash on Delivery' : 'Paiement COD'}</p>
              <p className="text-[11px] text-white/80 font-medium mt-0.5">{isAr ? 'بعد المعاينة' : isEn ? 'No card needed' : 'Sans carte'}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col items-center justify-center transition-all hover:bg-white/15">
              <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center mb-2.5 shadow-xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-white">{isAr ? 'ضمان 14 يوم' : isEn ? '14-Day Guarantee' : 'Garantie 14j'}</p>
              <p className="text-[11px] text-white/80 font-medium mt-0.5">{isAr ? 'استبدال أو استرجاع' : isEn ? 'Satisfied / Refunded' : 'Satisfait/Remboursé'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Slideshow / Banners - Full Width Edge-to-Edge */}
      {settings.slides && settings.slides.length > 0 && (
        <section className="relative w-full mb-8">
          <div className="relative w-full overflow-hidden shadow-md aspect-[21/9] sm:aspect-[3.5/1] bg-gray-900 group">
            {settings.slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.title || 'Slide'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding={idx === 0 ? 'sync' : 'async'}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
                  {slide.title && <h2 className="text-xl sm:text-4xl font-black mb-1.5">{slide.title}</h2>}
                  {slide.subtitle && <p className="text-xs sm:text-base text-gray-200 mb-4 max-w-2xl">{slide.subtitle}</p>}
                  {slide.buttonText && (
                    <button
                      onClick={() => {
                        const el = document.getElementById('catalog-products-grid');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{ backgroundColor: themeColor }}
                      className="self-start text-white font-bold text-xs sm:text-sm py-3 px-8 rounded-xl shadow-lg hover:opacity-95 transition-opacity cursor-pointer"
                    >
                      {slide.buttonText}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Navigation arrows */}
            {settings.slides.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + settings.slides!.length) % settings.slides!.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-lg font-bold"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % settings.slides!.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-lg font-bold"
                >
                  ›
                </button>
                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                  {settings.slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Catalog & Filter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="catalog-products-grid">
        {/* Pro Categories Bar - Centered with stunning category icons */}
        <div className="mb-10 text-center">
          <div
            style={{ backgroundColor: `${themeColor}15`, color: themeColor, borderColor: `${themeColor}30` }}
            className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full text-xs font-bold border"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'الأقسام والفئات المميزة' : isEn ? 'Featured Categories' : 'Nos Catégories Populaires'}</span>
          </div>
          <h3 className="font-black text-gray-950 text-xl sm:text-2xl mb-6">
            {isAr ? 'اختر الفئة التي تبحث عنها' : isEn ? 'Explore what you love' : 'Trouvez ce dont vous avez besoin'}
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            {categories.map((cat) => {
              const isSelected = (selectedCategory || '').trim().toLowerCase() === cat.trim().toLowerCase();
              const count = cat === 'all'
                ? products.length
                : products.filter((p) => (p.category || '').trim().toLowerCase() === cat.trim().toLowerCase()).length;
              
              const catStr = String(cat || '').toLowerCase();
              let CatIcon = Package;
              if (catStr === 'all' || catStr.includes('الكل') || catStr.includes('tous')) CatIcon = Flame;
              else if (catStr.includes('tech') || catStr.includes('إلكترونيات') || catStr.includes('gadget') || catStr.includes('phone')) CatIcon = Zap;
              else if (catStr.includes('mode') || catStr.includes('ملابس') || catStr.includes('fashion') || catStr.includes('vetement')) CatIcon = Shirt;
              else if (catStr.includes('beauté') || catStr.includes('beaute') || catStr.includes('santé') || catStr.includes('sante') || catStr.includes('تجميل') || catStr.includes('soin')) CatIcon = Sparkles;
              else if (catStr.includes('عسل') || catStr.includes('miel') || catStr.includes('nature') || catStr.includes('طبيعي') || catStr.includes('bio') || catStr.includes('أكل') || catStr.includes('food') || catStr.includes('زيوت')) CatIcon = Sparkles;
              else if (catStr.includes('home') || catStr.includes('مطبخ') || catStr.includes('maison') || catStr.includes('cuisine') || catStr.includes('auto')) CatIcon = Home;
              else if (catStr.includes('sport') || catStr.includes('رياضة')) CatIcon = Dumbbell;

              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  style={isSelected ? { backgroundColor: themeColor, borderColor: themeColor, color: '#fff' } : undefined}
                  className={`group px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    isSelected
                      ? 'shadow-lg ring-2 ring-offset-2 scale-105 font-black'
                      : 'bg-white border-gray-200/90 text-gray-800 hover:border-gray-300 hover:shadow-md hover:bg-gray-50/50 font-bold'
                  }`}
                >
                  <div
                    style={!isSelected ? { backgroundColor: `${themeColor}15`, color: themeColor, borderColor: `${themeColor}25` } : undefined}
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-white/20 border-white/30 text-white shadow-xs'
                        : ''
                    }`}
                  >
                    <CatIcon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className={isAr ? 'text-right' : 'text-left'}>
                    <span className="text-xs sm:text-sm capitalize block font-extrabold leading-tight">
                      {cat === 'all'
                        ? (isAr ? 'جميع المنتجات' : isEn ? 'All Products' : 'Tous les produits')
                        : cat}
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {count} {isAr ? 'منتج' : isEn ? 'items' : 'produits'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isAr ? 'بحث عن منتج في المتجر...' : isEn ? 'Search for a product...' : 'Rechercher un produit dans le store...'}
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-bold">
              {isAr ? 'لا توجد منتجات تطابق بحثك حالياً' : isEn ? 'No products found' : 'Aucun produit trouvé'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const discountPercent = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              const prodLang: 'ar' | 'fr' | 'en' =
                product.pageLanguage ||
                (settings.storeLanguage as 'ar' | 'fr' | 'en') ||
                lang ||
                'ar';
              const isProdEn = prodLang === 'en';
              const isProdFr = prodLang === 'fr';
              const isProdAr = prodLang === 'ar';

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = themeColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer group"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.images[0] || '/products/grass-seeds-1.webp'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      loading="eager"
                      decoding="async"
                    />
                    {discountPercent > 0 && (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-sm">
                        -{discountPercent}%
                      </span>
                    )}
                    {getLocalizedBadge(product, prodLang) && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                        {getLocalizedBadge(product, prodLang)}
                      </span>
                    )}

                    {/* Language Badge */}
                    <span
                      className={`absolute bottom-2.5 left-2.5 backdrop-blur-xs text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 border ${
                        isProdEn
                          ? 'bg-amber-50/95 text-amber-900 border-amber-300/80'
                          : isProdFr
                          ? 'bg-blue-50/95 text-blue-900 border-blue-300/80'
                          : 'bg-emerald-50/95 text-emerald-900 border-emerald-300/80'
                      }`}
                    >
                      <span>{isProdEn ? 'EN' : isProdFr ? 'FR' : 'AR'}</span>
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">
                        {(product.category || '').trim()}
                      </span>
                      <h3 
                        onMouseEnter={(e) => (e.currentTarget.style.color = themeColor)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}
                        className="font-bold text-gray-900 text-base transition-colors line-clamp-2 mt-1"
                        dir={isProdAr ? 'rtl' : 'ltr'}
                      >
                        {isProdAr
                          ? (product.titleAr || product.title)
                          : (product.title || product.titleAr)}
                      </h3>
                      {product.reviews && product.reviews.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-amber-400"
                            />
                          ))}
                          <span className="text-gray-400 text-[11px] font-semibold mr-1">
                            ({(product.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / product.reviews.length).toFixed(1)})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-baseline justify-between mb-3">
                        <div className="flex items-baseline gap-2">
                          <span style={{ color: themeColor }} className="text-xl font-black">
                            {product.price} {settings.currency}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              {product.originalPrice} {settings.currency}
                            </span>
                          )}
                        </div>
                        <span style={{ color: themeColor, backgroundColor: `${themeColor}15` }} className="text-[11px] font-bold px-2 py-0.5 rounded">
                          {isProdAr ? 'توصيل مجاني' : isProdEn ? 'Free Delivery' : 'Livraison 0 DH'}
                        </span>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        style={{ backgroundColor: themeColor }}
                        className="w-full text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer hover:opacity-90"
                        id={`btn-order-prod-${product.id}`}
                      >
                        <span>
                          {isProdAr
                            ? (product.orderButtonTextAr || 'اطلب الآن (الدفع عند الاستلام) 🛒')
                            : isProdEn
                            ? (product.orderButtonTextEn || product.orderButtonText || 'Order Now (Cash on Delivery) 🛒')
                            : (product.orderButtonText || 'Commander Maintenant (COD) 🛒')}
                        </span>
                        <ArrowRight className={`w-4 h-4 transition-transform ${isProdAr ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Moroccan COD FAQ Section (Builds trust) */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-black text-gray-900">
              {isAr ? 'الأسئلة الشائعة حول الطلب والدفع' : isEn ? 'Frequently Asked Questions (FAQ)' : 'Questions Fréquentes (FAQ)'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isAr ? 'كل ما يهمك معرفته حول التوصيل والدفع عند الاستلام' : isEn ? 'Everything you need to know about delivery and cash on delivery' : 'Tout ce que vous devez savoir sur la livraison'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                {isAr ? 'متى أؤدي ثمن الطلبية؟' : isEn ? 'When do I pay for my order?' : 'Quand dois-je payer ma commande ?'}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {isAr
                  ? 'الدفع يكون 100% نقداً عند استلام طلبيتك وفحصها من طرف عامل التوصيل أمام منزلك، لا تحتاج لأي بطاقة بنكية.'
                  : isEn
                  ? 'Payment is 100% in cash upon receipt and inspection of your order by the delivery agent at your doorstep. No bank card required.'
                  : 'Le paiement s’effectue 100% en espèces lors de la réception de votre colis. Aucune carte bancaire requise.'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                {isAr ? 'كم يستغرق التوصيل؟' : isEn ? 'How long does delivery take?' : 'Quel est le délai de livraison ?'}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {isAr
                  ? 'التوصيل سريع ويستغرق ما بين 24 إلى 48 ساعة فقط.'
                  : isEn
                  ? 'Delivery is fast and takes between 24 and 48 hours.'
                  : 'La livraison prend entre 24h et 48h directement à votre adresse.'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                {isAr ? 'هل التوصيل مجاني فعلاً؟' : isEn ? 'Is delivery really free?' : 'La livraison est-elle gratuite ?'}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {isAr
                  ? 'نعم، التوصيل مجاني 100% لجميع الطلبات بدون أي رسوم إضافية مخفية.'
                  : isEn
                  ? 'Yes, delivery is 100% free for all orders with no hidden fees.'
                  : 'Oui, la livraison est 100% gratuite sans aucun frais caché.'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                {isAr ? 'ماذا أفعل إذا كان هناك مشكل بالمنتج؟' : isEn ? 'What if there is an issue with the product?' : 'Que faire en cas de problème ?'}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {isAr
                  ? 'نضمن لك استبدال المنتج أو استرجاع أموالك خلال 14 يوماً بكل سهولة وسرعة.'
                  : isEn
                  ? 'We guarantee product replacement or money back within 14 days easily and quickly.'
                  : 'Vous bénéficiez d’une garantie de 14 jours satisfait ou remboursé avec échange rapide.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Store Footer */}
      <Footer settings={settings} lang={lang} />
    </div>
  );
};
