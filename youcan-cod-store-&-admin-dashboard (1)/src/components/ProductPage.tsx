import React, { useState, useEffect } from 'react';
import {
  Star,
  Truck,
  ShieldCheck,
  CheckCircle,
  Clock,
  Flame,
  ArrowRight,
  Share2,
  PhoneCall,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Gift
} from 'lucide-react';
import { Product, ProductOffer, StoreSettings } from '../types';
import { CodOrderForm } from './CodOrderForm';
import { RichDescriptionRenderer } from './RichDescriptionRenderer';
import { getStoreThemeColor } from '../utils/themeHelper';
import { getLocalizedBadge, getLocalizedCategory } from '../utils/offerLocalization';
import { Footer } from './Footer';

interface ProductPageProps {
  product: Product;
  settings: StoreSettings;
  onSubmitOrder: (orderDetails: any) => void;
  lang: 'ar' | 'fr' | 'en';
  onBackToCatalog: () => void;
  onLanguageChange?: (newLang: 'ar' | 'fr' | 'en') => void;
  onUpdateProductLanguage?: (newLang: 'ar' | 'fr' | 'en') => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  settings,
  onSubmitOrder,
  lang,
  onBackToCatalog,
  onLanguageChange,
  onUpdateProductLanguage,
}) => {
  // Active page language determination
  // The product's own pageLanguage takes strict precedence (en, fr, ar)
  const activeLang: 'ar' | 'fr' | 'en' =
    product.pageLanguage ||
    (settings.storeLanguage as 'ar' | 'fr' | 'en') ||
    lang ||
    'en';
  const isAr = activeLang === 'ar';
  const isEn = activeLang === 'en';
  const themeColor = getStoreThemeColor(settings.themeColor);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<ProductOffer | null>(
    product.offers && product.offers.length > 0 ? product.offers[0] : null
  );

  // Sync selected offer when the product changes
  useEffect(() => {
    setSelectedOffer(product.offers && product.offers.length > 0 ? product.offers[0] : null);
  }, [product.id]);

  // Scarcity countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    minutes: 42,
    seconds: 15,
  });

  // Simulated live viewers count that dynamically changes to look 100% realistic
  const [viewersCount, setViewersCount] = useState(() => Math.floor(Math.random() * 14) + 21);

  useEffect(() => {
    // Scarcity countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 12, seconds: 30 };
      });
    }, 1000);

    // Realistic live viewers dynamic fluctuation (changes every 4-6 seconds)
    const viewersTimer = setInterval(() => {
      setViewersCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, +1, +2
        const nextVal = prev + (delta === 0 ? 1 : delta);
        return Math.max(18, Math.min(46, nextVal));
      });
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(viewersTimer);
    };
  }, []);

  const scrollToForm = () => {
    const el = document.getElementById('cod-order-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic pricing based on selected pack / offer
  const activeOffer = selectedOffer || (product.offers && product.offers.length > 0 ? product.offers[0] : null);
  const currentPrice = activeOffer ? activeOffer.totalPrice : product.price;
  const currentQty = activeOffer ? (activeOffer.quantity || 1) : 1;

  // Calculate reference original price (unit original price * qty, or unit price * qty for bundle discounts)
  const currentOriginalPrice = product.originalPrice
    ? product.originalPrice * currentQty
    : (activeOffer && activeOffer.quantity > 1 && activeOffer.totalPrice < product.price * activeOffer.quantity
        ? product.price * activeOffer.quantity
        : undefined);

  const currentSavings = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? currentOriginalPrice - currentPrice
    : 0;

  const discountPercent = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  const displayTitle = isAr ? (product.titleAr || product.title) : product.title;
  const displayDescription = isAr ? (product.descriptionAr || product.description) : product.description;

  const hasCustomReviews = Boolean(product.reviews && product.reviews.length > 0);
  const reviewCount = hasCustomReviews ? product.reviews!.length : 0;
  const avgRating = hasCustomReviews
    ? (product.reviews!.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewCount).toFixed(1)
    : '5.0';

  const scrollToReviews = () => {
    const el = document.getElementById('customer-reviews-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Breadcrumb / Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-start">
        <button
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-gray-100 cursor-pointer"
          id="back-to-catalog-btn"
        >
          {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة لجميع المنتجات' : isEn ? 'Back to Catalog' : 'Retour au catalogue'}</span>
        </button>
      </div>

      {/* Main Product Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Visual Media & Gallery (5 Cols on Desktop) */}
          <div className="lg:col-span-6 space-y-4">
            {/* MOBILE ONLY: Title & Category shown first on mobile before image */}
            <div className="block lg:hidden space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-gray-100 text-gray-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                  {getLocalizedCategory(product.category, activeLang)}
                </span>
                {hasCustomReviews && (
                  <div
                    onClick={scrollToReviews}
                    className="flex items-center gap-1 text-amber-500 text-xs font-bold cursor-pointer hover:opacity-80"
                  >
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(Number(avgRating))
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-500 text-[11px]">
                      ({avgRating}/5 - {reviewCount})
                    </span>
                  </div>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
                {displayTitle}
              </h1>
              {/* Price right under title on mobile */}
              <div className="flex items-baseline gap-2.5 pt-1 whitespace-nowrap overflow-x-auto no-scrollbar">
                <span style={{ color: themeColor }} className="text-2xl sm:text-3xl font-black transition-all whitespace-nowrap">
                  {currentPrice}&nbsp;{settings.currency}
                </span>
                {currentOriginalPrice && (
                  <span className="text-base font-bold text-gray-400 line-through whitespace-nowrap">
                    {currentOriginalPrice}&nbsp;{settings.currency}
                  </span>
                )}
                {currentSavings > 0 ? (
                  <span className="bg-rose-100 text-rose-700 font-extrabold text-xs px-2.5 py-1 rounded-md whitespace-nowrap">
                    {isAr
                      ? `توفير ${currentSavings}\u00A0${settings.currency}`
                      : isEn
                      ? `Save ${currentSavings}\u00A0${settings.currency}`
                      : `Économisez ${currentSavings}\u00A0${settings.currency}`}
                  </span>
                ) : discountPercent > 0 ? (
                  <span className="bg-rose-100 text-rose-700 font-extrabold text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap">
                    -{discountPercent}%
                  </span>
                ) : null}
              </div>
            </div>

            {/* Main Featured Image - Pure, borderless, fully uncropped, taking the entire space */}
            <div className="relative group w-full rounded-xl bg-transparent">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={displayTitle}
                  className="w-full h-auto block rounded-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  {isAr ? 'لا توجد صورة' : isEn ? 'No image' : "Pas d'image"}
                </div>
              )}

              {/* Discount Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-rose-600 text-white font-extrabold text-xs sm:text-sm px-3 py-1.5 rounded-full shadow-md">
                  -{discountPercent}% {isAr ? 'تخفيض' : isEn ? 'OFF' : 'RÉDUCTION'}
                </div>
              )}

              {getLocalizedBadge(product, activeLang) && (
                <div className="absolute top-4 right-4 bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <span>{getLocalizedBadge(product, activeLang)}</span>
                </div>
              )}

              {/* Gallery Navigation arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )
                    }
                    className="opacity-0 group-hover:opacity-100 absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-md flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="opacity-0 group-hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-md flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={
                      activeImageIndex === idx
                        ? { borderColor: themeColor, boxShadow: `0 0 0 4px ${themeColor}20` }
                        : { borderColor: '#e5e7eb' }
                    }
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === idx
                        ? ''
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Social Proof Live Viewers */}
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-amber-950 font-medium shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center">
                  <Eye className="w-4 h-4 text-amber-600" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
                <span>
                  {isAr ? (
                    <>
                      يشاهد هذا المنتج الآن{' '}
                      <span className="font-extrabold text-amber-900 bg-amber-200/60 px-1.5 py-0.5 rounded text-[13px] font-mono transition-all">
                        {viewersCount}
                      </span>{' '}
                      شخص
                    </>
                  ) : isEn ? (
                    <>
                      <span className="font-extrabold text-amber-900 bg-amber-200/60 px-1.5 py-0.5 rounded text-[13px] font-mono transition-all">
                        {viewersCount}
                      </span>{' '}
                      people are viewing this product right now
                    </>
                  ) : (
                    <>
                      <span className="font-extrabold text-amber-900 bg-amber-200/60 px-1.5 py-0.5 rounded text-[13px] font-mono transition-all">
                        {viewersCount}
                      </span>{' '}
                      personnes consultent ce produit actuellement
                    </>
                  )}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {isAr ? 'مباشر' : isEn ? 'LIVE' : 'EN DIRECT'}
              </span>
            </div>

            {/* Customer Trust Badges */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {isAr ? 'مميزات التسوق من متجرنا' : isEn ? 'Our Customer Commitments' : 'Nos Engagements Clients'}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div style={{ backgroundColor: `${themeColor}20`, color: themeColor }} className="w-7 h-7 rounded-lg flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{isAr ? 'توصيل مجاني' : isEn ? 'Free Delivery' : 'Livraison Gratuite'}</p>
                    <p className="text-[11px] text-gray-500">{isAr ? 'لجميع المدن' : isEn ? 'To all cities' : 'Pour toutes les villes'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{isAr ? 'الدفع بعد المعاينة' : isEn ? 'Cash on Delivery' : 'Paiement à la livraison'}</p>
                    <p className="text-[11px] text-gray-500">{isAr ? '100% مضمون' : isEn ? '100% Secure' : 'En toute sécurité'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{isAr ? 'ضمان 14 يوم' : isEn ? '14-Day Guarantee' : 'Garantie 14 Jours'}</p>
                    <p className="text-[11px] text-gray-500">{isAr ? 'استبدال فوري' : isEn ? 'Exchange or return' : 'Échange ou retour'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{isAr ? 'خدمة الزبناء' : isEn ? 'Customer Support' : 'Support Client'}</p>
                    <p className="text-[11px] text-gray-500">{isAr ? '7/7 عبر الهاتف' : isEn ? '7 days a week' : 'Disponible 7j/7'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Scarcity, Direct Order Form (6-7 Cols on Desktop) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Header info - Desktop Only */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                  {getLocalizedCategory(product.category, activeLang)}
                </span>
                {hasCustomReviews && (
                  <div
                    onClick={scrollToReviews}
                    className="flex items-center gap-1 text-amber-500 text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(Number(avgRating))
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 font-semibold mr-1">
                      {isAr
                        ? `(${avgRating}/5 - ${reviewCount} ${reviewCount === 1 ? 'تقييم' : 'تقييمات'})`
                        : isEn
                        ? `(${avgRating}/5 - ${reviewCount} verified ${reviewCount === 1 ? 'review' : 'reviews'})`
                        : `(${avgRating}/5 - ${reviewCount} ${reviewCount === 1 ? 'avis vérifié' : 'avis vérifiés'})`}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-snug">
                {displayTitle}
              </h1>

              {/* Pricing section */}
              <div className="flex items-baseline gap-3 mt-3 whitespace-nowrap overflow-x-auto no-scrollbar">
                <span style={{ color: themeColor }} className="text-3xl sm:text-4xl font-black transition-all whitespace-nowrap">
                  {currentPrice}&nbsp;{settings.currency}
                </span>
                {currentOriginalPrice && (
                  <span className="text-lg sm:text-xl font-bold text-gray-400 line-through whitespace-nowrap">
                    {currentOriginalPrice}&nbsp;{settings.currency}
                  </span>
                )}
                {currentSavings > 0 ? (
                  <span className="bg-rose-100 text-rose-700 font-extrabold text-xs px-2.5 py-1 rounded-md whitespace-nowrap">
                    {isAr
                      ? `توفير ${currentSavings}\u00A0${settings.currency}`
                      : isEn
                      ? `Save ${currentSavings}\u00A0${settings.currency}`
                      : `Économisez ${currentSavings}\u00A0${settings.currency}`}
                  </span>
                ) : discountPercent > 0 ? (
                  <span className="bg-rose-100 text-rose-700 font-extrabold text-xs px-2.5 py-1 rounded-md whitespace-nowrap">
                    -{discountPercent}%
                  </span>
                ) : null}
              </div>
            </div>

            {/* Scarcity Countdown Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900">
                <Flame className="w-5 h-5 text-orange-500 animate-bounce" />
                <div>
                  <p className="text-xs font-bold">
                    {isAr ? 'سارع قبل نفاد الكمية! العرض ينتهي خلال:' : isEn ? 'Limited special offer! Expires in:' : 'Offre spéciale limitée ! Expire dans :'}
                  </p>
                  <p className="text-[11px] text-amber-700">
                    {isAr
                      ? `بقي فقط ${product.stockCount} قطع في المخزون ⚠️`
                      : isEn
                      ? `Only ${product.stockCount} pieces left in stock ⚠️`
                      : `Il ne reste que ${product.stockCount} pièces en stock ⚠️`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 font-mono font-black text-sm text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-orange-600 ml-1" />
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
                <span className="text-rose-600">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>

            {/* Fast Quick Scroll To Form Button */}
            <button
              onClick={scrollToForm}
              style={{ backgroundColor: getStoreThemeColor(settings.themeColor) }}
              className="w-full text-white font-black text-base sm:text-lg py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer group hover:opacity-90"
              id="scroll-to-order-btn"
            >
              <span>
                {isAr
                  ? (product.orderButtonTextAr || 'اضغط هنا للطلب الفوري 🛒')
                  : isEn
                  ? (product.orderButtonTextEn || product.orderButtonText || 'Order Now 🛒')
                  : (product.orderButtonText || 'Commander Maintenant 🛒')}
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Direct Cash On Delivery Order Form (Right here in product page!) */}
            <CodOrderForm
              product={product}
              selectedOffer={selectedOffer}
              onSelectOffer={setSelectedOffer}
              onSubmitOrder={onSubmitOrder}
              lang={activeLang}
              settings={settings}
            />

            {/* Description & Marketing Visuals - Direct display without restricting white card frame */}
            {displayDescription && displayDescription.trim() && (
              <div className="w-full space-y-4 pt-1">
                <RichDescriptionRenderer content={displayDescription} isArabic={isAr} />
              </div>
            )}

            {/* Customer Reviews Section */}
            {product.reviews && product.reviews.length > 0 && (
              <div id="customer-reviews-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 flex items-center gap-2">
                    <MessageSquare style={{ color: themeColor }} className="w-5 h-5" />
                    <span>{isAr ? 'آراء زبنائنا الكرام' : isEn ? 'Customer Reviews' : 'Avis de nos clients'}</span>
                  </h3>
                  <span style={{ color: themeColor, backgroundColor: `${themeColor}15` }} className="text-xs font-bold px-2.5 py-1 rounded-full">
                    {isAr ? '100% طلبات حقيقية' : isEn ? 'Verified Reviews' : 'Avis vérifiés'}
                  </span>
                </div>

                <div className="space-y-3">
                  {product.reviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{rev.author}</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {rev.city}
                          </span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 leading-normal">{rev.comment}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{rev.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Professional Store Footer */}
      <Footer
        settings={settings}
        lang={activeLang}
        onNavigateHome={onBackToCatalog}
        isProductPage={true}
      />

      {/* Sticky Mobile Purchase Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:hidden z-30 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="block text-[11px] text-gray-500 font-medium">
            {isAr ? 'السعر مع التوصيل المجاني:' : isEn ? 'Price with free delivery:' : 'Prix avec livraison :'}
          </span>
          <span style={{ color: themeColor }} className="text-xl font-black whitespace-nowrap">
            {currentPrice}&nbsp;{settings.currency}
          </span>
        </div>
        <button
          onClick={scrollToForm}
          style={{
            backgroundColor: themeColor,
            '--pulse-shadow': `${themeColor}66`,
            '--pulse-shadow-hover': `${themeColor}99`,
          } as React.CSSProperties}
          className="flex-1 active:scale-95 text-white font-black text-sm py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 pulse-cta hover:opacity-90"
        >
          <span>
            {isAr
              ? (product.orderButtonTextAr || 'اطلب الآن والدفع عند الاستلام')
              : isEn
              ? (product.orderButtonTextEn || product.orderButtonText || 'Order Now (COD)')
              : (product.orderButtonText || 'Acheter Maintenant (COD)')}
          </span>
        </button>
      </div>
    </div>
  );
};
