import { Product, ProductOffer } from '../types';

/**
 * Returns clean, idiomatic text for the offer label based on the selected language.
 */
export function getLocalizedOfferLabel(offer?: ProductOffer | null, lang: 'ar' | 'fr' | 'en' = 'ar'): string {
  if (!offer) return '';
  if (lang === 'en') {
    if (offer.labelEn && offer.labelEn.trim()) return offer.labelEn;
    const q = offer.quantity;
    const raw = offer.label || '';
    if (q === 1) return '1 Piece';
    if (q === 2) return "2 Pieces - Most Popular";
    if (q === 3) {
      if (raw.toLowerCase().includes('offerte') || raw.includes('مجانا') || raw.toLowerCase().includes('free')) {
        return '3 Pieces (Buy 2 + 1 Free)';
      }
      return '3 Pieces - Best Value Pack';
    }
    return `${q} Pieces - Special Offer`;
  }

  if (lang === 'fr') {
    if (offer.labelFr && offer.labelFr.trim()) return offer.labelFr;
    
    // If the label is pure Arabic or has mixed Arabic text, translate automatically
    const raw = offer.label || '';
    const hasArabic = /[\u0600-\u06FF]/.test(raw);
    if (hasArabic) {
      const q = offer.quantity;
      if (q === 1) return '1 Pièce';
      if (q === 2) return "2 Pièces - L'offre la plus demandée";
      if (q === 3) {
        if (raw.includes('مجانا') || raw.includes('هدية')) {
          return '3 Pièces (2 achetées + 1 offerte)';
        }
        return '3 Pièces - Pack Économique';
      }
      return `${q} Pièces - Offre Spéciale`;
    }

    return raw || `${offer.quantity} Pièce${offer.quantity > 1 ? 's' : ''}`;
  } else {
    // Arabic (RTL)
    if (offer.labelAr && offer.labelAr.trim()) return offer.labelAr;

    const raw = offer.label || '';
    const hasFrench = /[a-zA-Z]/.test(raw);
    const hasArabic = /[\u0600-\u06FF]/.test(raw);

    // If pure French without Arabic
    if (hasFrench && !hasArabic) {
      const q = offer.quantity;
      if (q === 1) return 'قطعة واحدة (1)';
      if (q === 2) return 'قطعتين (2) - العرض الأكثر طلباً';
      if (q === 3) {
        if (raw.toLowerCase().includes('gratuit') || raw.toLowerCase().includes('offerte')) {
          return '3 قطع (اشتري 2 واحصل على الثالثة مجاناً)';
        }
        return '3 قطع - باقة التوفير العائلية';
      }
      return `${q} قطع - باقة خاصة`;
    }

    // Clean up if it was "قطعة واحدة (1 Pièce)" -> make it clean Arabic "قطعة واحدة (1)"
    if (raw.includes('قطعة واحدة')) return 'قطعة واحدة (1)';
    if (raw.includes('قطعتين')) return 'قطعتين (2) - العرض الأكثر طلباً';
    if (raw.includes('3 قطع')) return '3 قطع - باقة التوفير العائلية';

    return raw || `${offer.quantity} قطع`;
  }
}

/**
 * Returns localized promotional discount badge based on active language.
 */
export function getLocalizedDiscountBadge(offer?: ProductOffer | null, lang: 'ar' | 'fr' | 'en' = 'ar'): string | undefined {
  if (!offer) return undefined;
  if (lang === 'en') {
    if (offer.discountBadgeEn && offer.discountBadgeEn.trim()) return offer.discountBadgeEn;
    const badge = offer.discountBadge || '';
    if (!badge) return undefined;
    const lower = badge.toLowerCase();
    if (lower.includes('gratuit') || lower.includes('free') || badge.includes('مجاني')) return 'Free Delivery 🚚';
    if (lower.includes('15%')) return 'Save 15% ⚡';
    if (lower.includes('25%')) return 'Save 25% 🔥';
    if (lower.includes('30%')) return 'Save 30% 💎';
    if (lower.includes('offerte') || badge.includes('مجانا')) return 'Buy 2 Get 1 FREE 🎁';
    if (lower.includes('réduction') || lower.includes('وفر') || lower.includes('discount')) return 'Special Discount ⚡';
    return 'Special Offer 🔥';
  }

  if (lang === 'fr') {
    if (offer.discountBadgeFr && offer.discountBadgeFr.trim()) return offer.discountBadgeFr;
    const badge = offer.discountBadge || '';
    if (!badge) return undefined;

    if (/[\u0600-\u06FF]/.test(badge)) {
      if (badge.includes('توصيل مجاني')) return 'Livraison Gratuite';
      if (badge.includes('15%')) return 'Économisez 15% ⚡';
      if (badge.includes('25%')) return 'Économisez 25% 🔥';
      if (badge.includes('30%')) return 'Économisez 30% 💎';
      if (badge.includes('100 درهم') || badge.includes('100dh') || badge.includes('100 DH')) return 'Économisez 100 DH ⚡';
      if (badge.includes('مجانا')) return '3ème OFFERTE 🎁';
      return 'Offre Spéciale 🔥';
    }

    return badge;
  } else {
    // Arabic
    if (offer.discountBadgeAr && offer.discountBadgeAr.trim()) return offer.discountBadgeAr;
    const badge = offer.discountBadge || '';
    if (!badge) return undefined;

    if (/[a-zA-Z]/.test(badge) && !/[\u0600-\u06FF]/.test(badge)) {
      const lower = badge.toLowerCase();
      if (lower.includes('gratuit') || lower.includes('free')) return 'توصيل مجاني';
      if (lower.includes('15%')) return 'وفر 15% ⚡';
      if (lower.includes('25%')) return 'وفر 25% 🔥';
      if (lower.includes('30%')) return 'وفر 30% 💎';
      if (lower.includes('offerte')) return '3 مجاناً 🎁';
      return 'تخفيض حصري 🔥';
    }

    return badge;
  }
}

/**
 * Returns localized product badge (hook badge / badge d'accroche) based on active language.
 */
export function getLocalizedBadge(
  product?: { badge?: string; badgeFr?: string; badgeAr?: string; badgeEn?: string } | null,
  lang: 'ar' | 'fr' | 'en' = 'ar'
): string | undefined {
  if (!product) return undefined;
  if (lang === 'en') {
    if (product.badgeEn && product.badgeEn.trim()) return product.badgeEn;
    const badge = product.badge || product.badgeFr || product.badgeAr || '';
    if (!badge) return undefined;

    const lower = badge.toLowerCase();
    if (lower.includes('demandé') || lower.includes('الأكثر طلباً') || lower.includes('الأكثر مبيعاً') || lower.includes('best')) {
      return 'Best Seller 🔥';
    }
    if (lower.includes('livraison') || lower.includes('gratuit') || lower.includes('توصيل مجاني') || lower.includes('free')) {
      return 'Free Shipping 🚚';
    }
    if (lower.includes('réduction') || lower.includes('تخفيض') || lower.includes('خصم') || lower.includes('discount')) {
      return 'Special Discount ⚡';
    }
    if (lower.includes('naturel') || lower.includes('طبيعي') || lower.includes('natural')) {
      return '100% Natural 🌿';
    }
    if (lower.includes('top') || lower.includes('مميز')) {
      return 'Top Pick ⭐';
    }
    return 'Best Seller 🔥';
  }

  if (lang === 'fr') {
    if (product.badgeFr && product.badgeFr.trim()) return product.badgeFr;
    const badge = product.badge || '';
    if (!badge) return undefined;

    if (/[\u0600-\u06FF]/.test(badge)) {
      if (badge.includes('الأكثر طلباً') || badge.includes('الأكثر مبيعاً')) return 'Le Plus Demandé 🔥';
      if (badge.includes('توصيل مجاني')) return 'Livraison Gratuite 🚚';
      if (badge.includes('تخفيض') || badge.includes('خصم')) return 'Réduction Spéciale ⚡';
      if (badge.includes('طبيعي')) return '100% Naturel 🌿';
      return 'Offre Spéciale 🔥';
    }
    return badge;
  } else {
    // Arabic
    if (product.badgeAr && product.badgeAr.trim()) return product.badgeAr;
    const badge = product.badge || '';
    if (!badge) return undefined;

    if (/[a-zA-Z]/.test(badge) && !/[\u0600-\u06FF]/.test(badge)) {
      const lower = badge.toLowerCase();
      if (lower.includes('demandé') || lower.includes('best')) return 'الأكثر طلباً 🔥';
      if (lower.includes('livraison') || lower.includes('gratuit')) return 'توصيل مجاني 🚚';
      if (lower.includes('réduction') || lower.includes('discount')) return 'تخفيض خاص ⚡';
      if (lower.includes('naturel')) return 'طبيعي 100% 🌿';
      return 'عرض خاص 🔥';
    }
    return badge;
  }
}

/**
 * Returns localized category name for clean display in any language.
 */
export function getLocalizedCategory(category: string, lang: 'ar' | 'fr' | 'en'): string {
  if (!category || !category.trim()) return lang === 'ar' ? 'عام' : lang === 'en' ? 'General' : 'Général';
  const trimmed = category.trim();
  const c = trimmed.toLowerCase();

  if (lang === 'en') {
    if (c === 'maison' || c.includes('منزل') || c.includes('بيت')) return 'Home';
    if (c === 'cuisine' || c.includes('مطبخ')) return 'Kitchen';
    if (c === 'high-tech' || c === 'electronique' || c.includes('إلكترونيات')) return 'High-Tech';
    if (c.includes('beauté') || c.includes('beaute') || c.includes('santé') || c.includes('sante') || c.includes('تجميل') || c.includes('صحة')) return 'Beauty & Health';
    if (c.includes('mode') || c.includes('accessoire') || c.includes('أزياء') || c.includes('ملابس')) return 'Fashion & Accessories';
    if (c.includes('sport') || c.includes('رياضة')) return 'Sports & Fitness';
    if (c.includes('bébé') || c.includes('bebe') || c.includes('enfant') || c.includes('أطفال')) return 'Baby & Kids';
    if (c.includes('auto') || c.includes('moto') || c.includes('سيارات')) return 'Auto & Moto';
    if (c.includes('jardin') || c.includes('حديقة')) return 'Garden & Outdoor';
    if (c === 'général' || c === 'general' || c.includes('عام')) return 'General';
    return trimmed;
  }

  if (lang === 'ar') {
    if (c === 'maison' || c.includes('home')) return 'منزل';
    if (c === 'cuisine' || c.includes('kitchen')) return 'مطبخ';
    if (c === 'high-tech' || c.includes('tech')) return 'إلكترونيات';
    if (c.includes('beauté') || c.includes('beauty')) return 'صحة وجمال';
    if (c.includes('mode') || c.includes('fashion')) return 'أزياء وإكسسوارات';
    if (c.includes('sport')) return 'رياضة ولياقة';
    if (c.includes('bébé') || c.includes('baby')) return 'أطفال ورضع';
    if (c.includes('auto')) return 'سيارات ودراجات';
    if (c.includes('jardin') || c.includes('garden')) return 'حديقة وأدوات';
    return trimmed;
  }

  // French
  if (c.includes('منزل') || c === 'home') return 'Maison';
  if (c.includes('مطبخ') || c === 'kitchen') return 'Cuisine';
  if (c.includes('إلكترونيات')) return 'High-Tech';
  if (c.includes('صحة') || c.includes('تجميل')) return 'Beauté & Santé';
  if (c.includes('أزياء')) return 'Mode & Accessoires';
  return trimmed;
}
