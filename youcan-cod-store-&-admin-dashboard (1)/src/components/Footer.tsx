import React from 'react';
import { PhoneCall, Truck, ShieldCheck } from 'lucide-react';
import { StoreSettings } from '../types';
import { getStoreThemeColor } from '../utils/themeHelper';

interface FooterProps {
  settings: StoreSettings;
  lang: 'ar' | 'fr' | 'en';
  onNavigateHome?: () => void;
  isProductPage?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  lang,
  onNavigateHome,
  isProductPage = false,
}) => {
  const isAr = lang === 'ar';
  const isEn = lang === 'en';
  const themeColor = getStoreThemeColor(settings.themeColor);

  return (
    <footer
      className={`bg-gray-950 text-white pt-12 ${
        isProductPage ? 'pb-24 sm:pb-8' : 'pb-8'
      } border-t border-gray-800 mt-16`}
      dir={isAr ? 'rtl' : 'ltr'}
      id="store-main-footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Store Logo */}
          <div className="space-y-3 flex flex-col justify-center">
            <div
              className={`flex items-center gap-2.5 ${onNavigateHome ? 'cursor-pointer hover:opacity-90 transition-opacity w-fit' : ''}`}
              onClick={onNavigateHome}
            >
              {settings.logoUrl ? (
                <div className="bg-white px-3.5 py-2 rounded-xl border border-white/20 inline-flex items-center justify-center shadow-xs">
                  <img
                    src={settings.logoUrl}
                    alt={settings.storeName}
                    style={{ height: `${settings.logoHeight || 45}px` }}
                    className="w-auto max-w-[200px] object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <>
                  <div
                    style={{ backgroundColor: themeColor }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm text-lg"
                  >
                    {settings.storeName.charAt(0)}
                  </div>
                  <span className="font-extrabold text-xl text-white">{settings.storeName}</span>
                </>
              )}
            </div>
            {settings.storeDescription && (
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                {settings.storeDescription}
              </p>
            )}
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 style={{ color: themeColor }} className="font-bold text-sm">
              {isAr ? 'روابط سريعة' : isEn ? 'Quick Links' : 'Liens Rapides'}
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                {onNavigateHome ? (
                  <button
                    onClick={onNavigateHome}
                    className="hover:text-white transition-colors cursor-pointer text-start"
                  >
                    {isAr ? 'كتالوج المنتجات' : isEn ? 'Product Catalog' : 'Catalogue Produits'}
                  </button>
                ) : (
                  <a href="#catalog-products-grid" className="hover:text-white transition-colors">
                    {isAr ? 'كتالوج المنتجات' : isEn ? 'Product Catalog' : 'Catalogue Produits'}
                  </a>
                )}
              </li>
              <li>
                <span className="text-gray-400">
                  {isAr ? 'الدفع عند الاستلام (COD)' : isEn ? 'Cash on Delivery' : 'Paiement à la livraison'}
                </span>
              </li>
              <li>
                <span className="text-gray-400">
                  {isAr ? 'ضمان الاستبدال والاسترجاع' : isEn ? 'Refund & Exchange Policy' : 'Garantie & Retour'}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Support & Phone */}
          <div className="space-y-3">
            <h4 style={{ color: themeColor }} className="font-bold text-sm">
              {isAr ? 'خدمة العملاء والدعم' : isEn ? 'Customer Support' : 'Service Client'}
            </h4>
            <p className="text-xs text-gray-400">
              {isAr
                ? 'تواصل معنا مباشرة عبر الواتساب:'
                : isEn
                ? 'Contact us directly on WhatsApp:'
                : 'Assistance directe via WhatsApp :'}
            </p>
            {settings.storePhone ? (
              <a
                href={`https://wa.me/${settings.storePhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer pt-1"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 2c-5.514 0-9.997 4.486-9.997 10 0 1.82.49 3.53 1.343 5.006l-1.377 5.03 5.176-1.356c1.432.782 3.072 1.239 4.818 1.239 5.514 0 10-4.486 10-10s-4.486-10-10-10zm0 18.167c-1.583 0-3.079-.427-4.382-1.171l-.314-.18-3.072.805.819-2.996-.197-.314c-.815-1.303-1.248-2.813-1.248-4.343 0-4.503 3.662-8.167 8.167-8.167s8.167 3.664 8.167 8.167-3.664 8.167-8.167 8.167zm4.512-6.136c-.247-.124-1.462-.722-1.689-.805-.227-.082-.392-.124-.557.124-.165.247-.64.805-.784.97-.144.165-.289.185-.536.062-.247-.124-1.044-.385-1.988-1.227-.735-.656-1.232-1.467-1.377-1.714-.144-.247-.015-.381.109-.504.111-.111.247-.289.371-.433.124-.144.165-.247.247-.412.082-.165.041-.309-.021-.433-.062-.124-.557-1.341-.763-1.835-.201-.482-.406-.418-.557-.425l-.474-.008c-.165 0-.433.062-.66.309-.227.247-.866.845-.866 2.062 0 1.216.886 2.391 1.01 2.556.124.165 1.744 2.663 4.225 3.733.59.255 1.05.407 1.41.521.593.188 1.132.162 1.558.098.475-.071 1.462-.598 1.669-1.175.206-.577.206-1.072.144-1.175-.062-.103-.227-.185-.474-.309z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400 block">
                    {isAr ? 'واتساب الدعم السريع' : isEn ? 'WhatsApp Support' : 'Support WhatsApp'}
                  </span>
                  <span className="font-extrabold text-sm text-white tracking-wide font-mono block">
                    {settings.storePhone}
                  </span>
                </div>
              </a>
            ) : (
              <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-800 text-gray-400 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-400 font-bold">Support 24/7 Available</span>
              </div>
            )}
          </div>

          {/* Col 4: Trust Badge */}
          <div className="space-y-3">
            <h4 style={{ color: themeColor }} className="font-bold text-sm">
              {isAr ? 'الثقة والأمان' : isEn ? 'Trust & Security' : 'Sécurité & Confiance'}
            </h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-2.5 flex items-center gap-3">
                <div
                  style={{
                    backgroundColor: `${themeColor}20`,
                    color: themeColor,
                    borderColor: `${themeColor}40`,
                  }}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
                >
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-bold text-gray-200">
                  {isAr ? 'توصيل لجميع المدن' : isEn ? 'Delivery everywhere' : 'Livraison partout'}
                </span>
              </div>

              <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-2.5 flex items-center gap-3">
                <div
                  style={{
                    backgroundColor: `${themeColor}20`,
                    color: themeColor,
                    borderColor: `${themeColor}40`,
                  }}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-bold text-gray-200">
                  {isAr ? 'معاينة قبل الدفع' : isEn ? 'Inspect before pay' : 'Vérification avant paiement'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-900 text-center text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} {settings.storeName}.{' '}
            {isAr
              ? 'جميع الحقوق محفوظة.'
              : isEn
              ? 'All rights reserved.'
              : 'Tous droits réservés.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
