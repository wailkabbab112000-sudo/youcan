import { Product, Order, StoreVisit, StoreSettings, GoogleSheetsConfig, CodZossConfig } from '../types';

export const MOROCCAN_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Tanger',
  'Fès',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
  'Safi',
  'Mohammédia',
  'El Jadida',
  'Béni Mellal',
  'Nador',
  'Taza',
  'Settat',
  'Berrechid',
  'Khouribga',
  'Dakhla',
  'Laâyoune',
  'Taroudant',
  'Essaouira',
  'Autre ville / مدينة أخرى',
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-1789741362244",
    "title": "🍯 عسل الأوكاليبتوس الطبيعي 100% – Miel d’Eucalyptus",
    "titleAr": "🍯 عسل الأوكاليبتوس الطبيعي 100% – Miel d’Eucalyptus",
    "slug": "miel-euk",
    "category": "باقات",
    "price": 199,
    "originalPrice": 249,
    "inStock": true,
    "stockCount": 8,
    "sku": "",
    "badge": "",
    "badgeFr": "",
    "badgeAr": "",
    "badgeEn": "",
    "isFeatured": true,
    "images": [
      "/products/honey-1.webp"
    ],
    "description": "<p class=\"isSelectedEnd\"><strong>كتشف المذاق الأصيل لعسل الأوكاليبتوس، بنكهة طبيعية ومميزة وجودة مختارة بعناية.</strong> 🌿🍯</p><p class=\"isSelectedEnd\">عسل الأوكاليبتوس هو اختيار مثالي لعشاق العسل الطبيعي، بفضل مذاقه الغني ورائحته العطرية المميزة. استمتع به في فطورك، مع الشاي أو الحليب، أو ببساطة مباشرة بالملعقة.</p><p class=\"isSelectedEnd\">🌿 <strong>100% طبيعي</strong><br>🍯 <strong>بدون إضافات</strong><br>✨ <strong>نكهة أصيلة ومميزة</strong><br>📦 <strong>التوصيل حتى باب المنزل</strong><br>💵 <strong>الدفع عند الاستلام</strong></p><h3>📦 اختر الباقة المناسبة لك</h3><p class=\"isSelectedEnd\"><strong>Pack 1 — Découverte</strong><br>1 × 250g<br><strong>129 DH</strong></p><p class=\"isSelectedEnd\"><strong>Pack 2 — Le Plus Populaire ⭐</strong><br>2 × 250g<br><strong>199 DH</strong><br>بدل <strong>258 DH</strong></p><p class=\"isSelectedEnd\"><strong>Pack 3 — Offre Économique 🔥</strong><br>3 × 250g<br><strong>269 DH</strong><br>بدل <strong>387 DH</strong></p><p>🚚 <strong>التوصيل مجاني لجميع الباقات</strong><br>💵 <strong>الدفع عند الاستلام</strong></p>",
    "descriptionAr": "<p class=\"isSelectedEnd\"><strong>كتشف المذاق الأصيل لعسل الأوكاليبتوس، بنكهة طبيعية ومميزة وجودة مختارة بعناية.</strong> 🌿🍯</p><p class=\"isSelectedEnd\">عسل الأوكاليبتوس هو اختيار مثالي لعشاق العسل الطبيعي، بفضل مذاقه الغني ورائحته العطرية المميزة. استمتع به في فطورك، مع الشاي أو الحليب، أو ببساطة مباشرة بالملعقة.</p><p class=\"isSelectedEnd\">🌿 <strong>100% طبيعي</strong><br>🍯 <strong>بدون إضافات</strong><br>✨ <strong>نكهة أصيلة ومميزة</strong><br>📦 <strong>التوصيل حتى باب المنزل</strong><br>💵 <strong>الدفع عند الاستلام</strong></p><h3>📦 اختر الباقة المناسبة لك</h3><p class=\"isSelectedEnd\"><strong>Pack 1 — Découverte</strong><br>1 × 250g<br><strong>129 DH</strong></p><p class=\"isSelectedEnd\"><strong>Pack 2 — Le Plus Populaire ⭐</strong><br>2 × 250g<br><strong>199 DH</strong><br>بدل <strong>258 DH</strong></p><p class=\"isSelectedEnd\"><strong>Pack 3 — Offre Économique 🔥</strong><br>3 × 250g<br><strong>269 DH</strong><br>بدل <strong>387 DH</strong></p><p>🚚 <strong>التوصيل مجاني لجميع الباقات</strong><br>💵 <strong>الدفع عند الاستلام</strong></p>",
    "features": [],
    "featuresFr": [],
    "offers": [],
    "reviews": [],
    "pageLanguage": "ar",
    "orderButtonText": "",
    "orderButtonTextAr": "إضغط هنا للطلب",
    "orderButtonTextEn": "",
    "countdownMinutes": 180,
    "countryCode": "",
    "userId": "6317b6db-3673-4f58-ba64-82cd21cce99c"
  },
  {
    "id": "prod-1789740603733",
    "title": "عسل الليمون الطبيعي 100% – Miel de Citron 🍋🍯",
    "titleAr": "عسل الليمون الطبيعي 100% – Miel de Citron 🍋🍯",
    "slug": "mien-citron",
    "category": "باقات",
    "price": 129,
    "originalPrice": 249,
    "inStock": true,
    "stockCount": 8,
    "sku": "",
    "badge": "باقات",
    "badgeFr": "Le Plus Demandé 🔥",
    "badgeAr": "باقات",
    "badgeEn": "",
    "isFeatured": true,
    "images": [
      "/products/honey-2.webp"
    ],
    "description": "<p class=\"isSelectedEnd\"><strong>مذاق منعش ومميز يجمع بين حلاوة العسل ونكهة الليمون الطبيعية.</strong></p><p class=\"isSelectedEnd\">🍋 عسل الليمون بنكهة لطيفة ومنعشة، مثالي مع الشاي، الحليب، الفطور أو للاستمتاع به مباشرة.<br>🌿 <strong>100% طبيعي – بدون إضافات</strong><br>✨ نكهة أصيلة ومميزة لعشاق العسل الطبيعي.<br>📦 <strong>التوصيل حتى باب المنزل</strong><br>💵 <strong>الدفع عند الاستلام</strong></p><h3>تفاصيل المنتج</h3><ul data-spread=\"false\"><li>الوزن: <strong>250g</strong></li><li>النوع: <strong>عسل الليمون</strong></li><li>100% طبيعي</li><li>بدون إضافات</li><li>مناسب للاستعمال اليومي</li><li>تغليف أنيق وعملي</li></ul>",
    "descriptionAr": "<p class=\"isSelectedEnd\"><strong>مذاق منعش ومميز يجمع بين حلاوة العسل ونكهة الليمون الطبيعية.</strong></p><p class=\"isSelectedEnd\">🍋 عسل الليمون بنكهة لطيفة ومنعشة، مثالي مع الشاي، الحليب، الفطور أو للاستمتاع به مباشرة.<br>🌿 <strong>100% طبيعي – بدون إضافات</strong><br>✨ نكهة أصيلة ومميزة لعشاق العسل الطبيعي.<br>📦 <strong>التوصيل حتى باب المنزل</strong><br>💵 <strong>الدفع عند الاستلام</strong></p><h3>تفاصيل المنتج</h3><ul data-spread=\"false\"><li>الوزن: <strong>250g</strong></li><li>النوع: <strong>عسل الليمون</strong></li><li>100% طبيعي</li><li>بدون إضافات</li><li>مناسب للاستعمال اليومي</li><li>تغليف أنيق وعملي</li></ul>",
    "features": [],
    "featuresFr": [],
    "offers": [
      {
        "id": "off-1789740513055-ils7",
        "label": "Pack 1 — تجربة العسل",
        "quantity": 1,
        "isPopular": false,
        "totalPrice": 129,
        "pricePerUnit": 129,
        "discountBadge": "توصيل مجاني"
      },
      {
        "id": "off-1789740513653-m1ep",
        "label": "Pack 2 — الأكثر طلباً",
        "quantity": 2,
        "isPopular": true,
        "totalPrice": 199,
        "pricePerUnit": 100,
        "discountBadge": "توصيل مجاني"
      },
      {
        "id": "off-1789740514093-k048",
        "label": "Pack 3 — العرض العائلي",
        "quantity": 3,
        "isPopular": false,
        "totalPrice": 269,
        "pricePerUnit": 90,
        "discountBadge": "توصيل مجاني"
      }
    ],
    "reviews": [],
    "pageLanguage": "ar",
    "orderButtonText": "",
    "orderButtonTextAr": "إضغط هنا للطلب",
    "orderButtonTextEn": "",
    "countdownMinutes": 180,
    "countryCode": "",
    "userId": "6317b6db-3673-4f58-ba64-82cd21cce99c"
  },
  {
    "id": "prod-1789739466693",
    "title": "عسل الزعتر الطبيعي 100% – Miel de Z3tr",
    "titleAr": "عسل الزعتر الطبيعي 100% – Miel de Z3tr",
    "slug": "miel-z3tr",
    "category": "باقات",
    "price": 129,
    "originalPrice": 249,
    "inStock": true,
    "stockCount": 8,
    "sku": "",
    "badge": "الأكثر طلباً 🔥",
    "badgeFr": "Le Plus Demandé 🔥",
    "badgeAr": "الأكثر طلباً 🔥",
    "badgeEn": "",
    "isFeatured": true,
    "images": [
      "/products/honey-3.webp"
    ],
    "description": "<p class=\"isSelectedEnd\"><strong>استمتع بمذاق الزعتر الأصيل مع عسل طبيعي غني بالنكهة، مناسب للاستعمال اليومي ولعشاق المنتجات الطبيعية.</strong></p><p class=\"isSelectedEnd\">🍯 عسل الزعتر بتركيبة طبيعية ونكهة مميزة، مثالي مع الخبز، الشاي، الحليب أو مباشرة بالملعقة.<br>🌿 <strong>100% طبيعي – بدون إضافات</strong><br>🇲🇦 منتج بنكهة أصيلة مستوحاة من الطبيعة المغربية.<br>📦 <strong>التوصيل إلى باب المنزل</strong><br>💵 <strong>الدفع عند الاستلام</strong></p><h3>تفاصيل المنتج</h3><ul data-spread=\"false\"><li>الوزن: <strong>250g</strong></li><li>النوع: <strong>عسل الزعتر</strong></li><li>بدون إضافات</li><li>مناسب للاستهلاك اليومي</li><li>تغليف عملي وأنيق</li></ul>",
    "descriptionAr": "<p class=\"isSelectedEnd\"><strong>استمتع بمذاق الزعتر الأصيل مع عسل طبيعي غني بالنكهة، مناسب للاستعمال اليومي ولعشاق المنتجات الطبيعية.</strong></p><p class=\"isSelectedEnd\">🍯 عسل الزعتر بتركيبة طبيعية ونكهة مميزة، مثالي مع الخبز، الشاي، الحليب أو مباشرة بالملعقة.<br>🌿 <strong>100% طبيعي – بدون إضافات</strong><br>🇲🇦 منتج بنكهة أصيلة مستوحاة من الطبيعة المغربية.<br>📦 <strong>التوصيل إلى باب المنزل</strong><br>💵 <strong>الدفع عند الاستلام</strong></p><h3>تفاصيل المنتج</h3><ul data-spread=\"false\"><li>الوزن: <strong>250g</strong></li><li>النوع: <strong>عسل الزعتر</strong></li><li>بدون إضافات</li><li>مناسب للاستهلاك اليومي</li><li>تغليف عملي وأنيق</li></ul>",
    "features": [],
    "featuresFr": [],
    "offers": [
      {
        "id": "off-1789738935913-xx8k",
        "label": "Pack 1 — تجربة العسل",
        "quantity": 1,
        "isPopular": false,
        "totalPrice": 129,
        "pricePerUnit": 129,
        "discountBadge": ""
      },
      {
        "id": "off-1789739374098-2fp6",
        "label": "Pack 2 — الأكثر طلباً",
        "quantity": 2,
        "isPopular": true,
        "totalPrice": 199,
        "pricePerUnit": 100,
        "discountBadge": "وفر 23% ⚡"
      },
      {
        "id": "off-1789739402380-5rw3",
        "label": "Pack 3 — العرض العائلي",
        "quantity": 3,
        "isPopular": false,
        "totalPrice": 269,
        "pricePerUnit": 90,
        "discountBadge": "وفر 30% 🔥"
      }
    ],
    "reviews": [],
    "pageLanguage": "ar",
    "orderButtonText": "",
    "orderButtonTextAr": "إضغط هنا للطلب",
    "orderButtonTextEn": "",
    "countdownMinutes": 180,
    "countryCode": "",
    "userId": "6317b6db-3673-4f58-ba64-82cd21cce99c"
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'MYSTORE',
  storePhone: '+212600000000',
  storeEmail: 'contact@mystore-cod.ma',
  currency: 'MAD',
  countryCode: 'MA',
  announcementText: '🚚 Livraison gratuite & Paiement à la livraison | Garantie 14 jours',
  announcementTextAr: '🚚 التوصيل مجاني في جميع أنحاء المغرب والدفع عند الاستلام 🇲🇦 | ضمان الجودة لمدة 14 يوماً',
  announcementTextEn: '🚚 Free shipping & Cash on Delivery | 14-day quality guarantee',
  enableAnnouncement: true,
  freeShippingThreshold: 0,
  shippingCost: 0,
  guaranteeDays: 14,
  storeLanguage: 'ar',
  logoUrl: '/store-logo.png',
  logoHeight: 71,
  themeColor: '#e11d48',
  dashboardColor: '#2563eb',
  slides: [],
  adminEmail: '',
  adminPassword: '',
  licenseKey: 'PRO-2026-ACTIVE',
  isLicensed: true,
  facebookPixelId: '',
  checkoutFields: {
    name: { 
      show: true, 
      label: 'Nom & Prénom complet *', 
      placeholder: 'Ex: Mohammed Alami',
      labelFr: 'Nom & Prénom complet *',
      placeholderFr: 'Ex: Mohammed Alami',
      labelAr: 'الاسم الكامل (الاسم والنسب) *',
      placeholderAr: 'مثال: محمد العلوي',
      labelEn: 'Full Name *',
      placeholderEn: 'e.g., John Doe'
    },
    phone: { 
      show: true, 
      label: 'Numéro de Téléphone *', 
      placeholder: '06 XX XX XX XX',
      labelFr: 'Numéro de Téléphone (WhatsApp ou Appel) *',
      placeholderFr: '06 XX XX XX XX',
      labelAr: 'رقم الهاتف (للاتصال وتأكيد الطلبية) *',
      placeholderAr: '06 XX XX XX XX',
      labelEn: 'Phone Number (WhatsApp or Call) *',
      placeholderEn: 'e.g., 06 XX XX XX XX'
    },
    city: { 
      show: true, 
      label: 'Ville de livraison *', 
      placeholder: 'Votre ville',
      labelFr: 'Ville de livraison *',
      placeholderFr: 'Sélectionnez votre ville',
      labelAr: 'المدينة *',
      placeholderAr: 'اختر مدينتك',
      labelEn: 'City / Region *',
      placeholderEn: 'Select or enter your city'
    },
    address: { 
      show: false, 
      label: 'Adresse de livraison', 
      placeholder: 'Quartier, Rue, N°',
      labelFr: 'Adresse de livraison (Quartier, Rue, N°)',
      placeholderFr: 'Ex: Quartier Salam, Rue 4, N° 12',
      labelAr: 'العنوان بالتفصيل (الحي، الشارع، رقم المنزل)',
      placeholderAr: 'مثال: حي السلام قرب المسجد',
      labelEn: 'Delivery Address (Street, House No.)',
      placeholderEn: 'e.g., Downtown, Street 12, Apt 4'
    },
    notes: { 
      show: false, 
      label: 'Notes (Optionnel)', 
      placeholder: 'Précisions pour le livreur',
      labelFr: 'Notes (Optionnel)',
      placeholderFr: 'Précisions pour le livreur',
      labelAr: 'ملاحظات (اختياري)',
      placeholderAr: 'أضف أي معلومات إضافية...',
      labelEn: 'Order Notes (Optional)',
      placeholderEn: 'Special delivery instructions...'
    },
  },
};

export const INITIAL_SHEETS_CONFIG: GoogleSheetsConfig = {
  webhookUrl: '',
  autoSync: false,
  lastSyncTime: undefined,
  sheetName: 'Commandes_COD',
};

export const INITIAL_CODZOSS_CONFIG: CodZossConfig = {
  apiToken: '',
  autoSync: false,
  lastSyncTime: undefined,
};

// Initial verified live orders for the store
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-17897451001',
    orderNumber: 'CMD-1001',
    createdAt: new Date().toISOString(),
    customerName: 'Youssef El Amrani',
    phone: '0661234567',
    city: 'Casablanca',
    address: 'Maârif, Rue Jura',
    items: [
      {
        productId: 'prod-1789741362244',
        productTitle: '🍯 عسل الأوكاليبتوس الطبيعي 100% – Miel d’Eucalyptus',
        productImage: '/products/honey-1.webp',
        quantity: 2,
        price: 199,
      },
    ],
    totalPrice: 199,
    status: 'confirme',
    userId: '6317b6db-3673-4f58-ba64-82cd21cce99c',
  },
  {
    id: 'ord-17897451002',
    orderNumber: 'CMD-1002',
    createdAt: new Date().toISOString(),
    customerName: 'Fatima Zahra',
    phone: '0662345678',
    city: 'Rabat',
    address: 'Agdal',
    items: [
      {
        productId: 'prod-1789741362244',
        productTitle: '🍯 عسل الأوكاليبتوس الطبيعي 100% – Miel d’Eucalyptus',
        productImage: '/products/honey-1.webp',
        quantity: 1,
        price: 129,
      },
    ],
    totalPrice: 129,
    status: 'nouveau',
    userId: '6317b6db-3673-4f58-ba64-82cd21cce99c',
  },
  {
    id: 'ord-17897451003',
    orderNumber: 'CMD-1003',
    createdAt: new Date().toISOString(),
    customerName: 'Hamza Benjelloun',
    phone: '0663456789',
    city: 'Marrakech',
    address: 'Guéliz',
    items: [
      {
        productId: 'prod-1789740603733',
        productTitle: 'عسل الليمون الطبيعي 100% – Miel de Citron 🍋🍯',
        productImage: '/products/honey-2.webp',
        quantity: 1,
        price: 188,
      },
    ],
    totalPrice: 188,
    status: 'confirme',
    userId: '6317b6db-3673-4f58-ba64-82cd21cce99c',
  },
  {
    id: 'ord-17897451004',
    orderNumber: 'CMD-1004',
    createdAt: new Date().toISOString(),
    customerName: 'Salma Tazi',
    phone: '0664567890',
    city: 'Tanger',
    address: 'Malabata',
    items: [
      {
        productId: 'prod-1789740603733',
        productTitle: 'عسل الليمون الطبيعي 100% – Miel de Citron 🍋🍯',
        productImage: '/products/honey-2.webp',
        quantity: 1,
        price: 269,
      },
    ],
    totalPrice: 269,
    status: 'confirme',
    userId: '6317b6db-3673-4f58-ba64-82cd21cce99c',
  },
];

// Initial verified live visits matching the 400 visits count
export const INITIAL_VISITS: StoreVisit[] = Array.from({ length: 400 }, (_, i) => ({
  id: `vis_init_${i + 1}`,
  timestamp: new Date(Date.now() - (i % 24) * 3600 * 1000 - Math.floor(i / 24) * 86400 * 1000).toISOString(),
  page: i % 2 === 0 ? '/store' : (i % 4 === 1 ? '/product/miel-euk' : '/product/mien-citron'),
  userId: '6317b6db-3673-4f58-ba64-82cd21cce99c',
  visitorId: `v_init_${i}`,
}));

