import React, { useState } from 'react';
import { Truck, CheckCircle2, ShieldCheck, MapPin, User, Phone, Package, ArrowRight, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { Product, ProductOffer, Order, StoreSettings } from '../types';
import { MOROCCAN_CITIES } from '../data/initialData';
import { trackPixelEvent } from './FacebookPixel';
import { getLocalizedOfferLabel, getLocalizedDiscountBadge } from '../utils/offerLocalization';
import { getStoreThemeColor } from '../utils/themeHelper';

interface CodOrderFormProps {
  product: Product;
  selectedOffer: ProductOffer | null;
  onSelectOffer: (offer: ProductOffer) => void;
  onSubmitOrder: (orderDetails: {
    customerName: string;
    phone: string;
    city: string;
    address: string;
    notes?: string;
    quantity: number;
    totalPrice: number;
  }) => void;
  lang: 'ar' | 'fr' | 'en';
  settings?: StoreSettings;
}

export const CodOrderForm: React.FC<CodOrderFormProps> = ({
  product,
  selectedOffer,
  onSelectOffer,
  onSubmitOrder,
  lang,
  settings,
}) => {
  const isAr = lang === 'ar';
  const isEn = lang === 'en';
  const themeColor = getStoreThemeColor(settings?.themeColor);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; city?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields Configuration
  const rawFields = settings?.checkoutFields;
  const fields = {
    name: {
      show: rawFields?.name?.show ?? true,
      label: isAr
        ? (rawFields?.name?.labelAr || 'الاسم الكامل')
        : isEn
        ? (rawFields?.name?.labelEn || 'Full Name *')
        : (rawFields?.name?.labelFr || rawFields?.name?.label || 'Nom & Prénom'),
      placeholder: isAr
        ? (rawFields?.name?.placeholderAr || 'مثال: محمد العلوي')
        : isEn
        ? (rawFields?.name?.placeholderEn || 'e.g., John Doe')
        : (rawFields?.name?.placeholderFr || rawFields?.name?.placeholder || 'Ex: Mohammed Alami')
    },
    phone: {
      show: rawFields?.phone?.show ?? true,
      label: isAr
        ? (rawFields?.phone?.labelAr || 'رقم الهاتف')
        : isEn
        ? (rawFields?.phone?.labelEn || 'Phone Number (WhatsApp or Call) *')
        : (rawFields?.phone?.labelFr || rawFields?.phone?.label || 'Téléphone (WhatsApp ou Appel)'),
      placeholder: isAr
        ? (rawFields?.phone?.placeholderAr || '06 XX XX XX XX')
        : isEn
        ? (rawFields?.phone?.placeholderEn || 'Phone number')
        : (rawFields?.phone?.placeholderFr || rawFields?.phone?.placeholder || '06 XX XX XX XX')
    },
    city: {
      show: rawFields?.city?.show ?? true,
      label: isAr
        ? (rawFields?.city?.labelAr || 'المدينة')
        : isEn
        ? (rawFields?.city?.labelEn || 'City / Region *')
        : (rawFields?.city?.labelFr || rawFields?.city?.label || 'Ville'),
      placeholder: isAr
        ? (rawFields?.city?.placeholderAr || 'المدينة')
        : isEn
        ? (rawFields?.city?.placeholderEn || 'Your city')
        : (rawFields?.city?.placeholderFr || rawFields?.city?.placeholder || 'Votre ville')
    },
    address: {
      show: rawFields?.address?.show ?? true,
      label: isAr
        ? (rawFields?.address?.labelAr || 'العنوان')
        : isEn
        ? (rawFields?.address?.labelEn || 'Delivery Address *')
        : (rawFields?.address?.labelFr || rawFields?.address?.label || 'Adresse de Livraison'),
      placeholder: isAr
        ? (rawFields?.address?.placeholderAr || 'الحي، الشارع')
        : isEn
        ? (rawFields?.address?.placeholderEn || 'Street address, neighborhood...')
        : (rawFields?.address?.placeholderFr || rawFields?.address?.placeholder || 'Quartier, Rue')
    },
    notes: {
      show: rawFields?.notes?.show ?? true,
      label: isAr
        ? (rawFields?.notes?.labelAr || 'ملاحظات')
        : isEn
        ? (rawFields?.notes?.labelEn || 'Order Notes (Optional)')
        : (rawFields?.notes?.labelFr || rawFields?.notes?.label || 'Notes'),
      placeholder: isAr
        ? (rawFields?.notes?.placeholderAr || 'ملاحظات')
        : isEn
        ? (rawFields?.notes?.placeholderEn || 'Special delivery instructions...')
        : (rawFields?.notes?.placeholderFr || rawFields?.notes?.placeholder || 'Précisions')
    }
  };

  // Determine active offer / quantity
  const activeOffer = selectedOffer || (product.offers && product.offers.length > 0 ? product.offers[0] : {
    id: 'default',
    quantity: 1,
    label: isAr ? 'قطعة واحدة' : isEn ? '1 Piece' : '1 Pièce',
    pricePerUnit: product.price,
    totalPrice: product.price,
  });

  const validate = () => {
    const errs: { name?: string; phone?: string; city?: string } = {};

    if (fields.name.show && !customerName.trim()) {
      errs.name = isAr ? 'يرجى إدخال اسمك الكامل' : isEn ? 'Please enter your full name' : 'Veuillez saisir votre nom complet';
    }

    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    if (fields.phone.show) {
      if (!cleanPhone) {
        errs.phone = isAr ? 'يرجى إدخال رقم الهاتف' : isEn ? 'Please enter your phone number' : 'Veuillez saisir votre numéro de téléphone';
      } else if (cleanPhone.length < 6) {
        errs.phone = isAr ? 'رقم الهاتف غير صحيح' : isEn ? 'Invalid phone number' : 'Numéro invalide';
      }
    }

    if (fields.city.show && !city.trim()) {
      errs.city = isAr ? 'يرجى إدخال مدينتك' : isEn ? 'Please enter your city' : 'Veuillez saisir votre ville';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Track Lead and Purchase on success
    trackPixelEvent('Lead', {
      content_name: product.title,
      content_category: product.category,
      value: activeOffer.totalPrice,
      currency: 'MAD'
    });
    
    trackPixelEvent('Purchase', {
      content_name: product.title,
      content_category: product.category,
      value: activeOffer.totalPrice,
      currency: 'MAD'
    });

    setTimeout(() => {
      onSubmitOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        city: fields.city.show ? (city.trim() || 'Casablanca') : 'Unspecified',
        address: fields.address.show ? address.trim() : 'Unspecified',
        notes: fields.notes.show ? notes.trim() : '',
        quantity: activeOffer.quantity,
        totalPrice: activeOffer.totalPrice,
      });
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div id="cod-order-section" style={{ borderColor: `${themeColor}aa`, boxShadow: `0 20px 25px -5px ${themeColor}15` }} className="bg-white rounded-2xl border-2 p-5 sm:p-7 relative overflow-hidden">
      {/* Top Banner Ribbon */}
      <div style={{ backgroundColor: themeColor }} className="text-white -mx-5 -mt-5 sm:-mx-7 sm:-mt-7 p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black">
            📝
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg leading-tight">
              {isAr ? 'استمارة الطلب السريع (الدفع عند الاستلام)' : isEn ? 'Express Order Form (Cash on Delivery)' : 'Formulaire Express (Paiement à la Livraison)'}
            </h3>
            <p className="text-white/90 text-xs">
              {isAr ? 'املأ معلوماتك وسنتصل بك لتأكيد الطلب وإرساله إليك' : isEn ? 'Fill in your details and we will call you to confirm' : 'Remplissez le formulaire, nous vous appellerons pour confirmer'}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white">
          <Truck className="w-3.5 h-3.5" />
          <span>{isAr ? 'توصيل مجاني 100%' : isEn ? '100% Free Delivery' : 'Livraison Gratuite'}</span>
        </div>
      </div>

      {/* Offer / Quantity Selector if multiple offers exist */}
      {product.offers && product.offers.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-2">
            <Package style={{ color: themeColor }} className="w-4 h-4" />
            <span>{isAr ? 'اختر الكمية والعرض المناسب لك:' : isEn ? 'Choose quantity & offer:' : 'Choisissez la quantité & votre offre :'}</span>
          </label>
          <div className="space-y-2.5">
            {product.offers.map((offer) => {
              const isSelected = activeOffer.id === offer.id;
              return (
                <div
                  key={offer.id}
                  onClick={() => onSelectOffer(offer)}
                  style={isSelected ? { borderColor: themeColor, backgroundColor: `${themeColor}10` } : undefined}
                  className={`cursor-pointer rounded-xl p-3.5 sm:p-4 border-2 transition-all flex items-center justify-between relative ${
                    isSelected
                      ? 'shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  id={`offer-${offer.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={isSelected ? { borderColor: themeColor, backgroundColor: themeColor } : undefined}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? '' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">
                          {getLocalizedOfferLabel(offer, lang)}
                        </span>
                        {getLocalizedDiscountBadge(offer, lang) && (
                          <span className="bg-amber-100 text-amber-900 text-[11px] font-extrabold px-2 py-0.5 rounded-md border border-amber-300">
                            {getLocalizedDiscountBadge(offer, lang)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isAr
                          ? `سعر القطعة: ${offer.pricePerUnit} ${settings?.currency || 'DH'} فقط`
                          : isEn
                          ? `Unit price: ${offer.pricePerUnit} ${settings?.currency || 'DH'}`
                          : `Prix unitaire : ${offer.pricePerUnit} ${settings?.currency || 'DH'}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span style={{ color: themeColor }} className="text-lg sm:text-xl font-extrabold">
                      {offer.totalPrice} {settings?.currency || 'DH'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* The Direct Form */}
      <form onSubmit={handleSubmit} className="space-y-4" id="direct-checkout-form">
        {/* Full Name */}
        {fields.name.show && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span>{fields.name.label}</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder={fields.name.placeholder}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-gray-300 bg-gray-50/50 hover:bg-white focus:bg-white'
              }`}
              id="input-customer-name"
            />
            {errors.name && <p className="text-rose-600 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
          </div>
        )}

        {/* Phone Number with Moroccan formatting */}
        {fields.phone.show && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-500" />
              <span>{fields.phone.label}</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
                placeholder={fields.phone.placeholder}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold tracking-wide focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                  errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-gray-300 bg-gray-50/50 hover:bg-white focus:bg-white'
                }`}
                id="input-phone-number"
              />
            </div>
            {errors.phone && <p className="text-rose-600 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
          </div>
        )}

        {/* City Input */}
        {fields.city.show && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              <span>{fields.city.label}</span>
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) setErrors({ ...errors, city: undefined });
              }}
              placeholder={fields.city.placeholder}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                errors.city ? 'border-rose-400 bg-rose-50/30' : 'border-gray-300 bg-gray-50/50 hover:bg-white focus:bg-white'
              }`}
              id="input-city"
            />
            {errors.city && <p className="text-rose-600 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.city}</p>}
          </div>
        )}

        {/* Delivery Address */}
        {fields.address.show && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {fields.address.label}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={fields.address.placeholder}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50/50 hover:bg-white focus:bg-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              id="input-delivery-address"
            />
          </div>
        )}

        {/* Notes */}
        {fields.notes.show && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {fields.notes.label}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={fields.notes.placeholder}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50/50 hover:bg-white focus:bg-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all resize-none"
              id="input-order-notes"
            />
          </div>
        )}

        {/* Total Summary Box */}
        <div style={{ backgroundColor: `${themeColor}12`, borderColor: `${themeColor}40` }} className="border rounded-xl p-4 mt-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>{isAr ? 'المنتج:' : isEn ? 'Product:' : 'Produit :'}</span>
            <span className="font-semibold text-gray-800 truncate max-w-[200px]">
              {isAr ? (product.titleAr || product.title) : product.title}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>{isAr ? 'الكمية المطلوبة:' : isEn ? 'Quantity:' : 'Quantité :'}</span>
            <span className="font-bold text-gray-900">{activeOffer.quantity} {isAr ? 'قطعة' : isEn ? 'item(s)' : 'pièce(s)'}</span>
          </div>
          <div style={{ color: themeColor }} className="flex justify-between items-center text-xs font-bold">
            <span>{isAr ? 'مصاريف الشحن والتوصيل:' : isEn ? 'Shipping & Delivery:' : 'Frais de Livraison :'}</span>
            <span style={{ backgroundColor: `${themeColor}25`, color: themeColor }} className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase">
              {isAr ? `مجاناً 0 ${settings?.currency || 'DH'}` : isEn ? `FREE SHIPPING (0 ${settings?.currency || 'DH'})` : `GRATUIT (0 ${settings?.currency || 'DH'})`}
            </span>
          </div>
          <div style={{ borderColor: `${themeColor}40` }} className="border-t pt-2 flex justify-between items-center">
            <span className="font-bold text-sm text-gray-900">
              {isAr ? 'المجموع المؤدى عند الاستلام:' : isEn ? 'Total to Pay on Delivery:' : 'Total à payer à la livraison :'}
            </span>
            <div className="text-right">
              <span style={{ color: themeColor }} className="text-2xl font-black">
                {activeOffer.totalPrice} {settings?.currency || 'DH'}
              </span>
            </div>
          </div>
        </div>

        {/* Giant Direct Buy Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            backgroundColor: themeColor,
            '--pulse-shadow': `${themeColor}66`,
            '--pulse-shadow-hover': `${themeColor}99`,
          } as React.CSSProperties}
          className="w-full text-white font-black text-base sm:text-lg py-4 px-6 rounded-xl shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-3 pulse-cta cursor-pointer mt-5 hover:opacity-90"
          id="btn-confirm-cod-order"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{isAr ? 'جاري تسجيل طلبكم...' : isEn ? 'Processing your order...' : 'Enregistrement de la commande...'}</span>
            </div>
          ) : (
            <>
              <span>
                {isAr
                  ? (product.orderButtonTextAr || 'اضغط هنا للطلب والدفع عند الاستلام 🛍️')
                  : isEn
                  ? (product.orderButtonTextEn || product.orderButtonText || 'Order Now (Pay on Delivery) 🛍️')
                  : (product.orderButtonText || 'Commander Maintenant (Payer à la Livraison) 🛍️')}
              </span>
              <ArrowRight className="w-5 h-5 text-emerald-100 hidden sm:inline" />
            </>
          )}
        </button>

        {/* Guarantees Badges */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 text-[11px] text-gray-600">
            <Truck className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="font-bold text-gray-900">{isAr ? 'توصيل سريع' : isEn ? 'Fast Delivery' : 'Livraison Rapide'}</span>
            <span>{isAr ? '24 - 48 ساعة' : isEn ? '24h - 48h' : '24h - 48h'}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 text-[11px] text-gray-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="font-bold text-gray-900">{isAr ? 'معاينة المنتج' : isEn ? 'Cash on Delivery' : 'Paiement COD'}</span>
            <span>{isAr ? 'قبل الدفع' : isEn ? 'Pay upon delivery' : 'Sans carte bancaire'}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 text-[11px] text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="font-bold text-gray-900">{isAr ? 'ضمان 14 يوم' : isEn ? '14-Day Guarantee' : 'Garantie 14j'}</span>
            <span>{isAr ? 'استبدال مجاني' : isEn ? 'Satisfied or refunded' : 'Satisfait ou remboursé'}</span>
          </div>
        </div>
      </form>
    </div>
  );
};
