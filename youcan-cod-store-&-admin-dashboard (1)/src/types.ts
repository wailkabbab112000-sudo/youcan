export interface ProductOffer {
  id: string;
  quantity: number;
  label: string;
  labelFr?: string;
  labelAr?: string;
  labelEn?: string;
  pricePerUnit: number;
  totalPrice: number;
  discountBadge?: string;
  discountBadgeFr?: string;
  discountBadgeAr?: string;
  discountBadgeEn?: string;
  isPopular?: boolean;
}

export interface ProductReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  title: string;
  titleAr?: string;
  slug: string;
  description: string;
  descriptionAr?: string;
  features: string[];
  featuresFr?: string[];
  price: number; // in MAD / DH
  originalPrice?: number;
  category: string;
  images: string[];
  inStock: boolean;
  stockCount: number;
  countdownMinutes?: number; // scarcity timer
  offers?: ProductOffer[];
  badge?: string;
  badgeFr?: string;
  badgeAr?: string;
  badgeEn?: string;
  isFeatured?: boolean;
  reviews?: ProductReview[];
  pageLanguage?: 'ar' | 'fr' | 'en'; // Choix de la langue de la page produit (Arabe, Français ou Anglais)
  orderButtonText?: string;
  orderButtonTextAr?: string;
  orderButtonTextEn?: string;
  sku?: string;
  countryCode?: string;
  userId?: string;
}

export type OrderStatus = 'nouveau' | 'confirme' | 'expedie' | 'livre' | 'annule';

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  price: number;
  sku?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  phone: string;
  city: string;
  address?: string;
  notes?: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  userId?: string;
  syncedToGoogleSheet?: boolean;
  googleSheetSyncError?: string;
  syncedToCodZoss?: boolean;
  codZossSyncError?: string;
}

export interface StoreSlide {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export interface StoreSettings {
  storeName: string;
  storePhone: string; // for WhatsApp support
  storeEmail: string;
  currency: string;
  countryCode?: string;
  announcementText: string;
  announcementTextAr: string;
  announcementTextEn?: string;
  enableAnnouncement: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
  guaranteeDays: number;
  storeLanguage?: 'fr' | 'ar' | 'en';
  logoUrl?: string;
  logoHeight?: number;
  themeColor?: string;
  dashboardColor?: string;
  updatedAt?: number | string;
  slides?: StoreSlide[];
  facebookPixelId?: string;
  tiktokPixelId?: string;
  googleAdsPixelId?: string;
  adminEmail?: string;
  adminPassword?: string;
  licenseKey?: string;
  isLicensed?: boolean;
  checkoutFields?: {
    name: { show: boolean; label: string; placeholder: string; labelFr?: string; placeholderFr?: string; labelAr?: string; placeholderAr?: string; labelEn?: string; placeholderEn?: string };
    phone: { show: boolean; label: string; placeholder: string; labelFr?: string; placeholderFr?: string; labelAr?: string; placeholderAr?: string; labelEn?: string; placeholderEn?: string };
    city: { show: boolean; label: string; placeholder: string; labelFr?: string; placeholderFr?: string; labelAr?: string; placeholderAr?: string; labelEn?: string; placeholderEn?: string };
    address: { show: boolean; label: string; placeholder: string; labelFr?: string; placeholderFr?: string; labelAr?: string; placeholderAr?: string; labelEn?: string; placeholderEn?: string };
    notes: { show: boolean; label: string; placeholder: string; labelFr?: string; placeholderFr?: string; labelAr?: string; placeholderAr?: string; labelEn?: string; placeholderEn?: string };
  };
}

export interface GoogleSheetRule {
  id: string;
  name: string;
  webhookUrl: string;
  enabled: boolean;
  applyToAllProducts: boolean;
  productIds: string[]; // Assigned product IDs
  skus: string[]; // Assigned SKUs
}

export interface GoogleSheetsConfig {
  webhookUrl: string;
  autoSync: boolean;
  lastSyncTime?: string;
  sheetName?: string;
  rules?: GoogleSheetRule[];
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSyncOrders: boolean;
  autoSyncProducts: boolean;
  enabled: boolean;
}

export interface CodZossConfig {
  apiToken: string;
  autoSync: boolean;
  lastSyncTime?: string;
}

export interface StoreVisit {
  id: string;
  timestamp: string;
  page: string;
  userId?: string;
  visitorId?: string;
}
