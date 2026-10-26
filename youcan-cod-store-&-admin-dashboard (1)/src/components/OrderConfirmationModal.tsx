import React from 'react';
import { CheckCircle2, MessageCircle, ArrowRight, Package, MapPin, Phone, ShieldCheck, X } from 'lucide-react';
import { Order, StoreSettings } from '../types';

interface OrderConfirmationModalProps {
  order: Order | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'fr' | 'en';
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen || !order) return null;

  const isAr = lang === 'ar';
  const isEn = lang === 'en';

  const productNames = order.items.map((i) => `${i.productTitle} (x${i.quantity})`).join(', ');

  // Generate WhatsApp confirmation message link
  const whatsappMessage = encodeURIComponent(
    isAr
      ? `السلام عليكم، لقد قمت بطلب رقم ${order.orderNumber} على متجركم.\nالاسم: ${order.customerName}\nالمدينة: ${order.city}\nالمنتج: ${productNames}\nالمجموع: ${order.totalPrice} درهم.\nأرغب في تأكيد طلبي لتسريع الإرسال. شكراً!`
      : isEn
      ? `Hello, I placed order # ${order.orderNumber} on your store.\nName: ${order.customerName}\nCity: ${order.city}\nProduct: ${productNames}\nTotal: ${order.totalPrice} DH.\nI would like to confirm my order for fast shipping. Thank you!`
      : `Bonjour, je confirme ma commande N° ${order.orderNumber} sur votre boutique.\nNom: ${order.customerName}\nVille: ${order.city}\nProduit: ${productNames}\nTotal: ${order.totalPrice} DH.\nMerci de procéder à la livraison!`
  );

  const cleanStorePhone = settings.storePhone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanStorePhone}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-center relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full mb-2 uppercase tracking-wide">
          {isAr ? 'تم استلام طلبك بنجاح' : isEn ? 'Order Received Successfully' : 'Commande Reçue avec Succès'}
        </span>

        <h2 className="text-2xl font-black text-gray-900 mb-2">
          {isAr ? 'شكراً لثقتكم بنا! 🎉' : isEn ? 'Thank you for your trust! 🎉' : 'Merci pour votre confiance ! 🎉'}
        </h2>

        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          {isAr
            ? `لقد تم تسجيل طلبكم بنجاح تحت رقم `
            : isEn
            ? `Your order has been successfully recorded under number `
            : `Votre commande a été enregistrée avec le numéro `}
          <span className="font-extrabold text-emerald-700 font-mono">
            {order.orderNumber}
          </span>
          {isAr
            ? `. سيتصل بكم فريقنا خلال الساعات القادمة لتأكيد العنوان والشحن.`
            : isEn
            ? `. Our team will contact you shortly to confirm your delivery address.`
            : `. Notre équipe vous contactera sous peu pour confirmer l'adresse de livraison.`}
        </p>

        {/* Order Details Card */}
        <div className="bg-gray-50 rounded-2xl p-4 text-xs text-left mb-6 space-y-2 border border-gray-200/80" dir="ltr">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="text-gray-500 font-medium">{isEn ? 'Order Number :' : 'Numéro de Commande :'}</span>
            <span className="font-bold text-gray-900 font-mono">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">{isEn ? 'Customer :' : 'Client :'}</span>
            <span className="font-semibold text-gray-900">{order.customerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">{isEn ? 'Phone :' : 'Téléphone :'}</span>
            <span className="font-semibold text-gray-900 font-mono">{order.phone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">{isEn ? 'City :' : 'Ville :'}</span>
            <span className="font-semibold text-gray-900">{order.city}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">{isEn ? 'Product :' : 'Produit :'}</span>
            <span className="font-semibold text-gray-900 truncate max-w-[200px]">{productNames}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
            <span className="font-bold text-gray-900">{isEn ? 'Total to pay (COD) :' : 'Total à payer (COD) :'}</span>
            <span className="font-black text-emerald-600">{order.totalPrice} DH</span>
          </div>
        </div>

        {/* WhatsApp Fast Confirmation Button */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black py-3.5 px-5 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer"
            id="btn-whatsapp-confirm"
          >
            <MessageCircle className="w-5 h-5" />
            <span>
              {isAr ? 'تأكيد فوري عبر الواتساب (لتسريع الشحن)' : isEn ? 'Instant WhatsApp Confirmation (Fast Shipping)' : 'Confirmer sur WhatsApp (Livraison Express)'}
            </span>
          </a>

          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-5 rounded-xl transition-colors text-sm"
          >
            {isAr ? 'متابعة التصفح في المتجر' : isEn ? 'Continue Shopping' : 'Continuer les achats'}
          </button>
        </div>

        {/* Note */}
        <p className="text-[11px] text-gray-400 mt-4 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isAr ? 'الدفع يتم نقداً عند استلام ومعاينة المنتج' : isEn ? 'Cash payment upon delivery & product inspection' : 'Paiement en espèces lors de la livraison'}</span>
        </p>
      </div>
    </div>
  );
};
