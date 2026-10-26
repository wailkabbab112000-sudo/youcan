import React, { useState, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Package,
  Layers,
  Clock,
  Flame,
  ExternalLink,
  ShieldCheck,
  Truck,
  Eye,
  Tag,
  Star,
  RefreshCw,
  AlertCircle,
  UploadCloud,
  Check,
  X,
  MessageSquare,
  Link as LinkIcon
} from 'lucide-react';
import { Product, ProductOffer, ProductReview, StoreSettings } from '../../types';
import { getLocalizedBadge } from '../../utils/offerLocalization';
import { RichMarketingDescriptionEditor } from './RichMarketingDescriptionEditor';

interface ProductEditorPageProps {
  product: Product | null;
  settings: StoreSettings;
  allProducts?: Product[];
  onSave: (product: Product) => void;
  onCancel: () => void;
  onViewProductPage?: (product: Product) => void;
  lang: 'ar' | 'fr';
}

export const ProductEditorPage: React.FC<ProductEditorPageProps> = ({
  product,
  settings,
  allProducts,
  onSave,
  onCancel,
  onViewProductPage,
  lang,
}) => {
  const isEditing = !!product;

  // Saved custom categories stored in browser localStorage
  const [savedCategories, setSavedCategories] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('store_custom_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((c): c is string => typeof c === 'string' && !!c.trim());
        }
      }
    } catch {}
    return [];
  });

  // Collect all unique categories from existing products + savedCategories
  const storeCategories = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    const addCat = (c?: string) => {
      if (!c) return;
      const trimmed = c.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        list.push(trimmed);
      }
    };

    // 1. Categories from current products in store
    (allProducts || []).forEach((p) => addCat(p.category));

    // 2. Custom categories previously added/saved by merchant
    savedCategories.forEach((c) => addCat(c));

    // 3. If currently editing a product with a category
    if (product?.category) addCat(product.category);

    return list;
  }, [allProducts, savedCategories, product?.category]);

  // Helper to generate URL slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Form State
  const [title, setTitle] = useState(product?.title || '');
  const [titleAr, setTitleAr] = useState(product?.titleAr || '');
  const [slug, setSlug] = useState(product?.slug || (product?.title ? generateSlug(product.title) : ''));
  const [isSlugUserEdited, setIsSlugUserEdited] = useState(!!product?.slug);
  const [pageLanguage, setPageLanguage] = useState<'ar' | 'fr' | 'en'>(
    product?.pageLanguage || (settings?.storeLanguage as any) || 'ar'
  );
  const [price, setPrice] = useState(product?.price?.toString() || '299');
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice?.toString() || '499');
  const [category, setCategory] = useState(product?.category?.trim() || '');

  const handleSaveNewCategory = (catToSave?: string) => {
    const target = (catToSave !== undefined ? catToSave : category).trim();
    if (!target) return;

    if (!savedCategories.some((c) => c.toLowerCase() === target.toLowerCase())) {
      const updated = [...savedCategories, target];
      setSavedCategories(updated);
      try {
        localStorage.setItem('store_custom_categories', JSON.stringify(updated));
      } catch {}
    }
    setCategory(target);
  };

  const handleDeleteSavedCategory = (catToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedCategories.filter((c) => c.toLowerCase() !== catToDelete.toLowerCase());
    setSavedCategories(updated);
    try {
      localStorage.setItem('store_custom_categories', JSON.stringify(updated));
    } catch {}
    if (category.trim().toLowerCase() === catToDelete.trim().toLowerCase()) {
      setCategory('');
    }
  };
  const [stockCount, setStockCount] = useState(product?.stockCount?.toString() || '8');
  const [countdownMinutes, setCountdownMinutes] = useState(product?.countdownMinutes?.toString() || '180');
  const [badge, setBadge] = useState(() => {
    if (!product) {
      if (settings?.storeLanguage === 'en') return 'Best Seller 🔥';
      if (settings?.storeLanguage === 'fr') return 'Le Plus Demandé 🔥';
      return 'الأكثر طلباً 🔥';
    }
    if (product.pageLanguage === 'en') {
      return product.badgeEn || getLocalizedBadge(product, 'en') || 'Best Seller 🔥';
    }
    if (product.pageLanguage === 'fr') {
      return product.badgeFr || getLocalizedBadge(product, 'fr') || 'Le Plus Demandé 🔥';
    }
    return product.badgeAr || product.badge || 'الأكثر طلباً 🔥';
  });
  const [inStock, setInStock] = useState(product ? product.inStock : true);
  const [sku, setSku] = useState(product?.sku || '');
  const [productCountryCode, setProductCountryCode] = useState(product?.countryCode || '');

  // Images state
  const [images, setImages] = useState<string[]>(
    product?.images && product.images.length > 0 ? product.images : []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingImages, setIsDraggingImages] = useState(false);

  // Description state
  const [description, setDescription] = useState(product?.description || '');
  const [descriptionAr, setDescriptionAr] = useState(product?.descriptionAr || '');

  // Features state - Empty by default (no unwanted placeholder text)
  const [features, setFeatures] = useState<string[]>(
    product?.features && product.features.length > 0
      ? product.features.filter(f => !f.includes('توصيل مجاني وسريع') && !f.includes('الدفع نقداً عند الاستلام') && !f.includes('Livraison rapide') && !f.includes('Paiement à la livraison'))
      : []
  );
  const [newFeature, setNewFeature] = useState('');

  // French features state - Empty by default
  const [featuresFr, setFeaturesFr] = useState<string[]>(
    product?.featuresFr && product.featuresFr.length > 0
      ? product.featuresFr.filter(f => !f.includes('Livraison rapide') && !f.includes('Paiement à la livraison') && !f.includes('Garantie échange') && !f.includes('Qualité originale'))
      : []
  );
  const [newFeatureFr, setNewFeatureFr] = useState('');

  // Offers state - Empty by default for new products (user controls all packs)
  const [offers, setOffers] = useState<ProductOffer[]>(
    product?.offers && product.offers.length > 0 ? product.offers : []
  );

  // Reviews state (Avis Client)
  const [reviews, setReviews] = useState<ProductReview[]>(
    product?.reviews || []
  );
  const [orderButtonText, setOrderButtonText] = useState(product?.orderButtonText || '');
  const [orderButtonTextAr, setOrderButtonTextAr] = useState(product?.orderButtonTextAr || '');
  const [orderButtonTextEn, setOrderButtonTextEn] = useState(
    product?.orderButtonTextEn || (product?.pageLanguage === 'en' ? (product?.orderButtonText || '') : '')
  );
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewCity, setNewReviewCity] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  const handleAddReview = () => {
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      alert(pageLanguage === 'fr' ? 'Veuillez saisir le nom du client et son commentaire.' : 'الرجاء إدخال اسم الزبون والتعليق.');
      return;
    }
    const rev: ProductReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: newReviewAuthor.trim(),
      city: newReviewCity.trim() || (pageLanguage === 'fr' ? 'Client' : 'زبون'),
      rating: Number(newReviewRating) || 5,
      comment: newReviewComment.trim(),
      date: pageLanguage === 'fr' ? 'Récemment' : 'مؤخراً',
      verified: true,
    };
    setReviews([...reviews, rev]);
    setNewReviewAuthor('');
    setNewReviewComment('');
  };

  const handleRemoveReview = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  // PACK MANAGEMENT HANDLERS (Add, Edit, Delete, Popular toggle, Recalculate)
  const handleUpdateOffer = (index: number, field: keyof ProductOffer, value: any) => {
    const updated = [...offers];
    const current = { ...updated[index], [field]: value };

    // Auto calculate pricePerUnit if quantity or totalPrice changes
    if (field === 'totalPrice' || field === 'quantity') {
      const q = field === 'quantity' ? Math.max(1, parseInt(value, 10) || 1) : current.quantity;
      const t = field === 'totalPrice' ? Math.max(0, parseFloat(value) || 0) : current.totalPrice;
      current.quantity = q;
      current.totalPrice = t;
      current.pricePerUnit = Math.round(t / q);
    }

    updated[index] = current;
    setOffers(updated);
  };

  const handleTogglePopularOffer = (index: number) => {
    const updated = offers.map((off, idx) => ({
      ...off,
      isPopular: idx === index ? !off.isPopular : false,
    }));
    setOffers(updated);
  };

  const handleRemoveOffer = (index: number) => {
    setOffers(offers.filter((_, idx) => idx !== index));
  };

  const handleLanguageChange = (newLang: 'ar' | 'fr' | 'en') => {
    setPageLanguage(newLang);
    // Automatically translate badge accroche
    if (newLang === 'en') {
      const translatedBadge = getLocalizedBadge({ badge }, 'en') || 'Best Seller 🔥';
      if (translatedBadge) setBadge(translatedBadge);
    } else if (newLang === 'fr') {
      const translatedBadge = getLocalizedBadge({ badge }, 'fr') || 'Le Plus Demandé 🔥';
      if (translatedBadge) setBadge(translatedBadge);
    } else {
      const translatedBadge = getLocalizedBadge({ badge }, 'ar') || 'الأكثر طلباً 🔥';
      if (translatedBadge) setBadge(translatedBadge);
    }

    // Automatically translate and adapt existing pack labels & badges to the selected language
    setOffers((prevOffers) =>
      prevOffers.map((off) => {
        const q = off.quantity;
        if (newLang === 'en') {
          let label = `${q} Piece${q > 1 ? 's' : ''}`;
          let badge = off.discountBadge;
          if (q === 1) {
            label = '1 Piece';
            badge = off.discountBadge ? 'Free Shipping 🚚' : '';
          } else if (q === 2) {
            label = '2 Pieces - Most Popular';
            badge = off.discountBadge ? 'Save 15% ⚡' : '';
          } else if (q === 3) {
            label = '3 Pieces - Best Value Pack';
            badge = off.discountBadge ? 'Save 25% 🔥' : '';
          } else {
            label = `${q} Pieces - Special Pack`;
            badge = off.discountBadge ? 'Save 30% 💎' : '';
          }
          return { ...off, label, discountBadge: badge };
        } else if (newLang === 'fr') {
          let label = `${q} Pièce${q > 1 ? 's' : ''}`;
          let badge = off.discountBadge;
          if (q === 1) {
            label = '1 Pièce';
            badge = off.discountBadge ? 'Livraison Gratuite' : '';
          } else if (q === 2) {
            label = "2 Pièces - L'offre la plus demandée";
            badge = off.discountBadge ? 'Économisez 15% ⚡' : '';
          } else if (q === 3) {
            label = '3 Pièces - Pack Économique';
            badge = off.discountBadge ? 'Économisez 25% 🔥' : '';
          } else {
            label = `${q} Pièces - Offre Spéciale`;
            badge = off.discountBadge ? 'Économisez 30% 🔥' : '';
          }
          return { ...off, label, discountBadge: badge };
        } else {
          let label = `${q} قطع`;
          let badge = off.discountBadge;
          if (q === 1) {
            label = 'قطعة واحدة (1)';
            badge = off.discountBadge ? 'توصيل مجاني' : '';
          } else if (q === 2) {
            label = 'قطعتين (2) - العرض الأكثر طلباً';
            badge = off.discountBadge ? 'وفر 15% ⚡' : '';
          } else if (q === 3) {
            label = '3 قطع - باقة التوفير العائلية';
            badge = off.discountBadge ? 'وفر 25% 🔥' : '';
          } else {
            label = `${q} قطع - باقة خاصة`;
            badge = off.discountBadge ? 'تخفيض 30% 🔥' : '';
          }
          return { ...off, label, discountBadge: badge };
        }
      })
    );
  };

  const handleAddCustomOffer = () => {
    const nextQty = offers.length > 0 ? Math.max(...offers.map((o) => o.quantity)) + 1 : 1;
    const baseP = parseFloat(price) || 299;
    let estTotal = baseP;
    let label = '';
    let badge = '';
    let isPop = false;

    if (pageLanguage === 'en') {
      if (nextQty === 1) {
        estTotal = baseP;
        label = '1 Piece';
        badge = 'Free Shipping 🚚';
      } else if (nextQty === 2) {
        estTotal = Math.round(baseP * 1.7);
        label = '2 Pieces - Most Popular';
        badge = 'Save 15% ⚡';
        isPop = true;
      } else if (nextQty === 3) {
        estTotal = Math.round(baseP * 2.25);
        label = '3 Pieces - Best Value Pack';
        badge = 'Save 25% 🔥';
      } else {
        estTotal = Math.round(baseP * nextQty * 0.7);
        label = `${nextQty} Pieces - Special Pack`;
        badge = 'Save 30% 💎';
      }
    } else if (pageLanguage === 'fr') {
      if (nextQty === 1) {
        estTotal = baseP;
        label = '1 Pièce';
        badge = 'Livraison Gratuite';
      } else if (nextQty === 2) {
        estTotal = Math.round(baseP * 1.7);
        label = "2 Pièces - L'offre la plus demandée";
        badge = 'Économisez 15% ⚡';
        isPop = true;
      } else if (nextQty === 3) {
        estTotal = Math.round(baseP * 2.25);
        label = '3 Pièces - Pack Économique';
        badge = 'Économisez 25% 🔥';
      } else {
        estTotal = Math.round(baseP * nextQty * 0.7);
        label = `${nextQty} Pièces - Offre Spéciale`;
        badge = 'Économisez 30% 🔥';
      }
    } else {
      if (nextQty === 1) {
        estTotal = baseP;
        label = 'قطعة واحدة (1)';
        badge = 'توصيل مجاني';
      } else if (nextQty === 2) {
        estTotal = Math.round(baseP * 1.7);
        label = 'قطعتين (2) - العرض الأكثر طلباً';
        badge = 'وفر 15% ⚡';
        isPop = true;
      } else if (nextQty === 3) {
        estTotal = Math.round(baseP * 2.25);
        label = '3 قطع - باقة التوفير العائلية';
        badge = 'وفر 25% 🔥';
      } else {
        estTotal = Math.round(baseP * nextQty * 0.7);
        label = `${nextQty} قطع - باقة خاصة`;
        badge = 'تخفيض 30% 🔥';
      }
    }

    const newOffer: ProductOffer = {
      id: `off-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      quantity: nextQty,
      label,
      pricePerUnit: Math.round(estTotal / nextQty),
      totalPrice: estTotal,
      discountBadge: badge,
      isPopular: isPop,
    };
    setOffers([...offers, newOffer]);
  };

  const handleAddPresetOffer = (
    qty: number,
    label: string,
    multiplier: number,
    badgeText: string,
    isPopular: boolean = false
  ) => {
    const baseP = parseFloat(price) || 299;
    const totalP = Math.round(baseP * multiplier);
    const newOffer: ProductOffer = {
      id: `off-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      quantity: qty,
      label: label,
      pricePerUnit: Math.round(totalP / qty),
      totalPrice: totalP,
      discountBadge: badgeText,
      isPopular: isPopular,
    };
    setOffers([...offers, newOffer]);
  };

  const handleRecalculatePacks = () => {
    const baseP = parseFloat(price) || 299;
    const updated = offers.map((off) => {
      let mult = off.quantity;
      if (off.quantity === 1) mult = 1;
      else if (off.quantity === 2) mult = 1.7; // 15% off
      else if (off.quantity === 3) mult = 2.25; // 25% off
      else if (off.quantity === 4) mult = 2.8; // 30% off
      else mult = off.quantity * 0.7;

      const totalP = Math.round(baseP * mult);
      return {
        ...off,
        pricePerUnit: Math.round(totalP / off.quantity),
        totalPrice: totalP,
      };
    });
    setOffers(updated);
  };

  const handleResetDefaultPacks = () => {
    const baseP = parseFloat(price) || 299;
    if (pageLanguage === 'en') {
      setOffers([
        {
          id: `off-1-${Date.now()}`,
          quantity: 1,
          label: '1 Piece',
          pricePerUnit: baseP,
          totalPrice: baseP,
          discountBadge: 'Free Shipping 🚚',
        },
        {
          id: `off-2-${Date.now()}`,
          quantity: 2,
          label: '2 Pieces - Most Popular',
          pricePerUnit: Math.round(baseP * 0.85),
          totalPrice: Math.round(baseP * 0.85 * 2),
          discountBadge: 'Save 15% ⚡',
          isPopular: true,
        },
        {
          id: `off-3-${Date.now()}`,
          quantity: 3,
          label: '3 Pieces - Best Value Pack',
          pricePerUnit: Math.round(baseP * 0.75),
          totalPrice: Math.round(baseP * 0.75 * 3),
          discountBadge: 'Save 25% 🔥',
        },
      ]);
    } else if (pageLanguage === 'fr') {
      setOffers([
        {
          id: `off-1-${Date.now()}`,
          quantity: 1,
          label: '1 Pièce',
          pricePerUnit: baseP,
          totalPrice: baseP,
          discountBadge: 'Livraison Gratuite',
        },
        {
          id: `off-2-${Date.now()}`,
          quantity: 2,
          label: "2 Pièces - L'offre la plus demandée",
          pricePerUnit: Math.round(baseP * 0.85),
          totalPrice: Math.round(baseP * 0.85 * 2),
          discountBadge: 'Économisez 15% ⚡',
          isPopular: true,
        },
        {
          id: `off-3-${Date.now()}`,
          quantity: 3,
          label: '3 Pièces - Pack Économique',
          pricePerUnit: Math.round(baseP * 0.75),
          totalPrice: Math.round(baseP * 0.75 * 3),
          discountBadge: 'Économisez 25% 🔥',
        },
      ]);
    } else {
      setOffers([
        {
          id: `off-1-${Date.now()}`,
          quantity: 1,
          label: 'قطعة واحدة (1)',
          pricePerUnit: baseP,
          totalPrice: baseP,
          discountBadge: 'توصيل مجاني',
        },
        {
          id: `off-2-${Date.now()}`,
          quantity: 2,
          label: 'قطعتين (2) - العرض الأكثر طلباً',
          pricePerUnit: Math.round(baseP * 0.85),
          totalPrice: Math.round(baseP * 0.85 * 2),
          discountBadge: 'وفر 15% ⚡',
          isPopular: true,
        },
        {
          id: `off-3-${Date.now()}`,
          quantity: 3,
          label: '3 قطع - باقة التوفير العائلية',
          pricePerUnit: Math.round(baseP * 0.75),
          totalPrice: Math.round(baseP * 0.75 * 3),
          discountBadge: 'وفر 25% 🔥',
        },
      ]);
    }
  };

  // Helper to compress uploaded images via canvas to keep storage fast and lightweight
  const compressUploadedImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawData = event.target?.result as string;
        if (!rawData) return resolve('');
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            let compressed = canvas.toDataURL('image/webp', 0.85);
            if (!compressed.startsWith('data:image/webp')) {
              compressed = canvas.toDataURL('image/jpeg', 0.85);
            }
            resolve(compressed);
          } else {
            resolve(rawData);
          }
        };
        img.onerror = () => resolve(rawData);
        img.src = rawData;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Image upload and management handlers (direct device upload only, no URLs)
  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const compressed = await compressUploadedImage(file);
      if (compressed) {
        setImages((prev) => [...prev, compressed]);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageFiles(e.target.files);
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingImages(false);
    handleImageFiles(e.dataTransfer.files);
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleAddFeatureFr = () => {
    if (newFeatureFr.trim()) {
      setFeaturesFr([...featuresFr, newFeatureFr.trim()]);
      setNewFeatureFr('');
    }
  };

  const handleRemoveFeatureFr = (idx: number) => {
    setFeaturesFr(featuresFr.filter((_, i) => i !== idx));
  };

  const parsedPrice = parseFloat(price) || 199;
  const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : undefined;
  const discountSaved = parsedOriginalPrice ? Math.max(0, parsedOriginalPrice - parsedPrice) : 0;
  const discountPercent = parsedOriginalPrice && parsedOriginalPrice > parsedPrice
    ? Math.round(((parsedOriginalPrice - parsedPrice) / parsedOriginalPrice) * 100)
    : 0;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const finalTitleAr = titleAr.trim() || title.trim() || 'منتج جديد';
    const finalTitleFr = title.trim() || titleAr.trim() || 'Nouveau Produit';

    const finalSlug = slug.trim()
      ? slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : generateSlug(finalTitleFr || finalTitleAr || 'produit');

    const trimmedCat = category.trim();
    const finalCategory = trimmedCat || (pageLanguage === 'ar' ? 'عام' : pageLanguage === 'en' ? 'General' : 'Général');

    // Auto-save custom category to localStorage
    if (trimmedCat && !savedCategories.some((c) => c.toLowerCase() === trimmedCat.toLowerCase())) {
      const updated = [...savedCategories, trimmedCat];
      setSavedCategories(updated);
      try {
        localStorage.setItem('store_custom_categories', JSON.stringify(updated));
      } catch {}
    }

    const savedProduct: Product = {
      id: product?.id || `prod-${Date.now()}`,
      title: finalTitleFr,
      titleAr: finalTitleAr,
      slug: finalSlug,
      description: description.trim() || descriptionAr.trim(),
      descriptionAr: descriptionAr.trim() || description.trim(),
      category: finalCategory,
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      inStock: inStock,
      stockCount: parseInt(stockCount, 10) || 8,
      countdownMinutes: parseInt(countdownMinutes, 10) || 180,
      badge: badge.trim(),
      badgeEn: pageLanguage === 'en' ? badge.trim() : (product?.badgeEn || getLocalizedBadge({ badge }, 'en')),
      badgeFr: pageLanguage === 'fr' ? badge.trim() : (product?.badgeFr || getLocalizedBadge({ badge }, 'fr')),
      badgeAr: pageLanguage === 'ar' ? badge.trim() : (product?.badgeAr || getLocalizedBadge({ badge }, 'ar')),
      pageLanguage: pageLanguage,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
      features: features,
      featuresFr: featuresFr,
      offers: offers,
      reviews: reviews,
      orderButtonText: pageLanguage === 'en'
        ? (orderButtonTextEn.trim() || orderButtonText.trim())
        : orderButtonText.trim(),
      orderButtonTextAr: orderButtonTextAr.trim(),
      orderButtonTextEn: orderButtonTextEn.trim() || (pageLanguage === 'en' ? orderButtonText.trim() : (product?.orderButtonTextEn || '')),
      sku: sku.trim(),
      countryCode: productCountryCode.trim().toUpperCase(),
      isFeatured: true,
    };

    onSave(savedProduct);
  };

  return (
    <div className="min-h-screen bg-gray-50/80 pb-20">
      {/* Sticky Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              id="back-to-products-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {pageLanguage === 'en'
                  ? 'Back to Products'
                  : pageLanguage === 'fr'
                  ? 'Retour aux Produits'
                  : 'العودة للمنتجات / Retour'}
              </span>
            </button>
            <div className="h-5 w-px bg-gray-200 hidden sm:block" />
            <div>
              <h1 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>
                  {isEditing
                    ? (pageLanguage === 'en' ? `Edit: ${product.title}` : pageLanguage === 'fr' ? `Modifier: ${product.title}` : `تعديل: ${product.titleAr || product.title}`)
                    : (pageLanguage === 'en' ? 'Add New Product (Dedicated Page)' : pageLanguage === 'fr' ? 'Ajouter un Nouveau Produit (Page Dédiée)' : 'إضافة منتج جديد (صفحة مخصصة)')}
                </span>
              </h1>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                {pageLanguage === 'en'
                  ? 'Full-screen editor optimized to configure your product and Cash on Delivery landing page'
                  : pageLanguage === 'fr'
                  ? 'Éditeur plein écran optimisé pour configurer votre produit et page de vente Cash on Delivery'
                  : 'محرر متكامل وسريع لتهيئة منتجك وصفحة المبيعات بالدفع عند الاستلام'}
              </p>
            </div>
          </div>


          {isEditing && product && (
            <div className="flex items-center gap-2">
              <a
                href={`/product/${product.slug || product.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Voir la page produit dans un nouvel onglet"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Voir la page</span>
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Spacious Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT MAIN CONTENT COLUMN (8 Cols on Desktop) */}
            <div className="lg:col-span-8 space-y-6">

              {/* CARD 1: PRODUCT PAGE LANGUAGE (AR / EN / FR) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌐</span>
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-gray-900">
                        {pageLanguage === 'en'
                          ? 'Product Page Language for Customers *'
                          : pageLanguage === 'fr'
                          ? 'Langue de la Page Produit *'
                          : 'لغة صفحة المنتج للزبون *'}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('ar')}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      pageLanguage === 'ar'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20 text-blue-950 text-right'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/40 text-gray-700 text-left'
                    }`}
                    id="page-lang-choice-ar"
                  >
                    <div className="flex items-center gap-3">
                      <div className={pageLanguage === 'ar' ? 'text-right' : 'text-left'}>
                        <span className="font-black text-sm block text-gray-900">
                          {pageLanguage === 'en' ? 'Arabic (RTL)' : pageLanguage === 'fr' ? 'Arabe (RTL)' : 'العربية (RTL)'}
                        </span>
                        <span className="text-xs text-gray-500 block mt-0.5">
                          {pageLanguage === 'en'
                            ? 'Title and COD form in Arabic'
                            : pageLanguage === 'fr'
                            ? 'Titre, description et formulaire en arabe'
                            : 'العنوان والوصف واستمارة COD بالعربية'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-black px-3 py-1 rounded-full shrink-0 ${
                        pageLanguage === 'ar'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {pageLanguage === 'en'
                        ? (pageLanguage === 'ar' ? '✓ Active' : 'Select')
                        : pageLanguage === 'fr'
                        ? (pageLanguage === 'ar' ? '✓ Actif' : 'Sélectionner')
                        : (pageLanguage === 'ar' ? '✓ مفعّلة' : 'تحديد')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLanguageChange('en')}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 text-left cursor-pointer ${
                      pageLanguage === 'en'
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20 text-indigo-950'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/40 text-gray-700'
                    }`}
                    id="page-lang-choice-en"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="font-black text-sm block text-gray-900">
                          {pageLanguage === 'ar' ? 'الإنجليزية (LTR)' : 'English (LTR)'}
                        </span>
                        <span className="text-xs text-gray-500 block mt-0.5">
                          {pageLanguage === 'ar'
                            ? 'العنوان والوصف واستمارة COD بالإنجليزية'
                            : 'Title, description and COD form in English'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-black px-3 py-1 rounded-full shrink-0 ${
                        pageLanguage === 'en'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {pageLanguage === 'en'
                        ? '✓ Active'
                        : pageLanguage === 'fr'
                        ? (pageLanguage === 'en' ? '✓ Actif' : 'Sélectionner')
                        : (pageLanguage === 'en' ? '✓ مفعّلة' : 'تحديد')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLanguageChange('fr')}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 text-left cursor-pointer ${
                      pageLanguage === 'fr'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20 text-blue-950'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/40 text-gray-700'
                    }`}
                    id="page-lang-choice-fr"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="font-black text-sm block text-gray-900">
                          {pageLanguage === 'en' ? 'French (LTR)' : pageLanguage === 'fr' ? 'Français (LTR)' : 'الفرنسية (LTR)'}
                        </span>
                        <span className="text-xs text-gray-500 block mt-0.5">
                          {pageLanguage === 'en'
                            ? 'Title and COD form in French'
                            : pageLanguage === 'fr'
                            ? 'Titre, description et formulaire en français'
                            : 'العنوان والوصف واستمارة COD بالفرنسية'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-black px-3 py-1 rounded-full shrink-0 ${
                        pageLanguage === 'fr'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {pageLanguage === 'en'
                        ? (pageLanguage === 'fr' ? '✓ Active' : 'Select')
                        : pageLanguage === 'fr'
                        ? (pageLanguage === 'fr' ? '✓ Actif' : 'Sélectionner')
                        : (pageLanguage === 'fr' ? '✓ مفعّلة' : 'تحديد')}
                    </span>
                  </button>
                </div>
              </div>

              {/* CARD 2: TITLES */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>
                      {pageLanguage === 'ar'
                        ? 'عنوان المنتج'
                        : pageLanguage === 'en'
                        ? 'Product Title'
                        : 'Titre du Produit'}
                    </span>
                  </h2>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    pageLanguage === 'ar'
                      ? 'bg-blue-100 text-blue-800'
                      : pageLanguage === 'en'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {pageLanguage === 'ar' ? 'بالعربية (RTL)' : pageLanguage === 'en' ? 'In English (LTR)' : 'En Français (LTR)'}
                  </span>
                </div>

                {pageLanguage === 'ar' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 text-right font-arabic">
                      عنوان المنتج (بالعربية) *
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      required
                      value={titleAr}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTitleAr(val);
                        if (!title || title === 'Nouveau Produit' || title === 'New Product') {
                          setTitle(val);
                        }
                        if (!isSlugUserEdited && val.trim()) {
                          setSlug(generateSlug(val));
                        }
                      }}
                      placeholder="مثال: صندل جلدي فاخر"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-arabic text-right font-medium"
                      id="product-title-input-ar"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5 text-right font-arabic">
                      هذا العنوان سيظهر للزبون مباشرة في صفحة المنتج العربية.
                    </p>
                  </div>
                ) : pageLanguage === 'en' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Product Title (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTitle(val);
                        if (!titleAr || titleAr === 'منتج جديد') {
                          setTitleAr(val);
                        }
                        if (!isSlugUserEdited && val.trim()) {
                          setSlug(generateSlug(val));
                        }
                      }}
                      placeholder="Ex: Premium Leather Sandals"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                      id="product-title-input-en"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      This title will be displayed directly to customers on the product page.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Titre du Produit (Français) *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTitle(val);
                        if (!titleAr || titleAr === 'منتج جديد') {
                          setTitleAr(val);
                        }
                        if (!isSlugUserEdited && val.trim()) {
                          setSlug(generateSlug(val));
                        }
                      }}
                      placeholder="Ex: Sandale en Cuir Véritable"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                      id="product-title-input-fr"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Ce titre s'affichera directement au client sur la page produit en français.
                    </p>
                  </div>
                )}
              </div>

              {/* CARD 2.1: SLUG / URL PERSONNALISÉ */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-3">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-blue-600" />
                    <span>
                      {pageLanguage === 'en'
                        ? 'Product Link / URL Slug'
                        : pageLanguage === 'ar'
                        ? 'رابط المنتج المخصص (Slug URL)'
                        : 'Lien / Slug du Produit'}
                    </span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      const auto = generateSlug(title || titleAr || 'product');
                      setSlug(auto);
                      setIsSlugUserEdited(false);
                    }}
                    className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                  >
                    {pageLanguage === 'en'
                      ? 'Auto-generate from title'
                      : pageLanguage === 'ar'
                      ? 'توليد تلقائي من العنوان'
                      : 'Auto-générer du titre'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {pageLanguage === 'en'
                      ? 'Product Slug (URL Identifier) *'
                      : pageLanguage === 'ar'
                      ? 'اسم الرابط الفرعي (Slug) *'
                      : 'Slug du Produit (Identifiant URL) *'}
                  </label>
                  <div className="flex items-center rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden bg-gray-50/50">
                    <span className="px-3 py-2.5 text-xs font-mono font-bold text-gray-500 bg-gray-100/90 border-r border-gray-200 shrink-0 select-none">
                      mystore.com/product/
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => {
                        const formatted = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                        setSlug(formatted);
                        setIsSlugUserEdited(true);
                      }}
                      placeholder="sandale"
                      className="w-full px-3 py-2.5 text-sm bg-transparent border-0 focus:outline-none font-mono font-bold text-blue-700"
                      id="product-slug-input"
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>
                      {pageLanguage === 'en'
                        ? `Direct link to access product: www.mystore.com/product/${slug || 'product'}`
                        : pageLanguage === 'ar'
                        ? `الرابط المباشر للمنتج: www.mystore.com/product/${slug || 'sandale'}`
                        : `Lien direct pour accéder au produit : www.mystore.com/product/${slug || 'sandale'}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 2.5: RICH MARKETING DESCRIPTION EDITOR WITH TYPOGRAPHY, COLORS & EMBEDDED PHOTOS */}
              <RichMarketingDescriptionEditor
                description={description}
                onChangeDescription={setDescription}
                descriptionAr={descriptionAr}
                onChangeDescriptionAr={setDescriptionAr}
                availableGalleryImages={images}
                activeLanguage={pageLanguage}
              />

              {/* CARD 3: MEDIA & PHOTOS GALLERY (DIRECT DEVICE UPLOAD ONLY - NO URLS) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>
                        {pageLanguage === 'en'
                          ? `Product Photo Gallery (${images.length} ${images.length <= 1 ? 'photo' : 'photos'})`
                          : pageLanguage === 'fr'
                          ? `Galerie Photos du Produit (${images.length} ${images.length <= 1 ? 'photo' : 'photos'})`
                          : `معرض صور المنتج (${images.length} ${images.length <= 1 ? 'صورة' : 'صور'})`}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {pageLanguage === 'en'
                        ? 'Upload product photos from your device. The first photo will be the main cover image.'
                        : pageLanguage === 'fr'
                        ? "Téléchargez les photos du produit depuis votre appareil. La première photo sera l'image principale."
                        : 'ارفع صور المنتج مباشرة من هاتفك أو حاسوبك - الصورة الأولى ستكون هي الصورة الرئيسية'}
                    </p>
                  </div>
                  {images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>
                        {pageLanguage === 'en'
                          ? 'Add Photos'
                          : pageLanguage === 'fr'
                          ? 'Ajouter des photos'
                          : 'إضافة صور'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Hidden File Input for Direct Device Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="product-gallery-file-input"
                />

                {/* Direct Upload Dropzone (Click or Drag & Drop) */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingImages(true);
                  }}
                  onDragLeave={() => setIsDraggingImages(false)}
                  onDrop={handleImageDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    isDraggingImages
                      ? 'border-blue-600 bg-blue-50/80 scale-[1.01]'
                      : 'border-gray-300 hover:border-blue-500 bg-gray-50/50 hover:bg-blue-50/20'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">
                      {pageLanguage === 'en'
                        ? 'Click or drag & drop product photos here'
                        : pageLanguage === 'fr'
                        ? 'Cliquez ou glissez-déposez les photos de votre produit ici'
                        : 'اضغط هنا لاختيار أو رفع صور المنتج من جهازك'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {pageLanguage === 'en'
                        ? 'Accepted formats: JPG, PNG, WEBP, GIF'
                        : pageLanguage === 'fr'
                        ? 'Formats acceptés : JPG, PNG, WEBP, GIF'
                        : 'انقر أو اسحب الصور هنا (JPG, PNG, WEBP, GIF)'}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors mt-1">
                    <Plus className="w-4 h-4" />
                    <span>
                      {pageLanguage === 'en'
                        ? 'Select from Device'
                        : pageLanguage === 'fr'
                        ? "Sélectionner depuis l'appareil"
                        : 'اختيار الصور من الجهاز'}
                    </span>
                  </span>
                </div>

                {/* Gallery Preview Grid */}
                {images.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                      <span className="font-bold text-gray-700">
                        {pageLanguage === 'en'
                          ? `Uploaded Photos (${images.length})`
                          : pageLanguage === 'fr'
                          ? `Photos téléchargées (${images.length})`
                          : `الصور المرفوعة (${images.length})`}
                      </span>
                      <span className="text-[11px] text-blue-700 font-medium">
                        {pageLanguage === 'en'
                          ? '💡 You can set any photo as the main cover photo'
                          : pageLanguage === 'fr'
                          ? '💡 Vous pouvez définir n’importe quelle photo comme photo principale'
                          : '💡 يمكنك تحديد أي صورة لتكون الصورة الرئيسية'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {images.map((img, i) => (
                        <div
                          key={i}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 group bg-gray-100 transition-all ${
                            i === 0 ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />

                          {i === 0 ? (
                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>
                                {pageLanguage === 'en'
                                  ? 'Main Photo'
                                  : pageLanguage === 'fr'
                                  ? 'Photo Principale'
                                  : 'الصورة الرئيسية'}
                              </span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetMainImage(i);
                              }}
                              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm transition-all cursor-pointer"
                              title={pageLanguage === 'en' ? 'Set as main photo' : pageLanguage === 'fr' ? 'Définir comme photo principale' : 'تعيين كصورة رئيسية'}
                            >
                              {pageLanguage === 'en' ? '⭐ Set as main' : pageLanguage === 'fr' ? '⭐ Définir principale' : '⭐ تعيين كرئيسية'}
                            </button>
                          )}

                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(i);
                              }}
                              className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl text-xs font-bold transition-transform cursor-pointer shadow-md"
                              title={pageLanguage === 'en' ? 'Delete photo' : pageLanguage === 'fr' ? 'Supprimer la photo' : 'حذف الصورة'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    {pageLanguage === 'en'
                      ? 'No photos added yet. Click the box above to upload photos for this product.'
                      : pageLanguage === 'fr'
                      ? 'Aucune photo ajoutée pour le moment. Cliquez sur la zone ci-dessus pour importer les photos de votre produit.'
                      : 'لم تقم برفع أي صورة بعد. اضغط على المربع أعلاه لرفع صور هذا المنتج.'}
                  </div>
                )}
              </div>

              {/* CARD 4: OFFRES ET PACKS QUANTITÉS (BUNDLES) - FULL MANAGEMENT */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5" id="bundles-management-card">
                <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-600" />
                      <span>
                        {pageLanguage === 'en'
                          ? 'Quantity Bundles & Offer Packs'
                          : pageLanguage === 'fr'
                          ? 'Gestion des Packs & Offres de Quantité'
                          : 'إدارة باقات وعروض الكمية (عروض التوفير)'}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {pageLanguage === 'en'
                        ? 'All labels, badges, and pack prices will be displayed in English on the product page'
                        : pageLanguage === 'fr'
                        ? 'Tous les libellés, badges et prix seront affichés en français sur la page produit'
                        : 'تحكم كامل في الباقات: إضافة وتعديل الكميات والأسعار ونصوص العروض والشارات بالعربية'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleLanguageChange(pageLanguage)}
                      title={
                        pageLanguage === 'en'
                          ? 'Align all pack texts to English'
                          : pageLanguage === 'fr'
                          ? 'Harmoniser tous les textes des packs en Français'
                          : 'تحويل وتوحيد نصوص جميع الباقات إلى العربية'
                      }
                      className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {pageLanguage === 'en'
                          ? 'Adapt in English'
                          : pageLanguage === 'fr'
                          ? 'Adapter en Français'
                          : 'تحويل للعربية'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRecalculatePacks}
                      title={
                        pageLanguage === 'en'
                          ? 'Automatically recalculate pack prices based on current base price'
                          : pageLanguage === 'fr'
                          ? 'Recalculer les prix des packs automatiquement'
                          : 'إعادة حساب أسعار الباقات تلقائياً حسب سعر المنتج الأساسي'
                      }
                      className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                      <span>
                        {pageLanguage === 'en'
                          ? 'Auto Recalculate'
                          : pageLanguage === 'fr'
                          ? 'Recalculer auto'
                          : 'إعادة الحساب'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetDefaultPacks}
                      title={
                        pageLanguage === 'en'
                          ? 'Reset to standard 3 packs (1, 2, 3 pieces) in English'
                          : pageLanguage === 'fr'
                          ? 'Réinitialiser les 3 packs standards (1, 2, 3 pièces) en français'
                          : 'استعادة الباقات الافتراضية (1، 2، 3 قطع) بالعربية'
                      }
                      className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                    >
                      <span>
                        {pageLanguage === 'en'
                          ? 'Reset (1, 2, 3)'
                          : pageLanguage === 'fr'
                          ? 'Réinitialiser (1, 2, 3)'
                          : 'استعادة الباقات'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddCustomOffer}
                      className="px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      id="add-new-pack-btn"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {pageLanguage === 'en'
                          ? '+ Add Pack'
                          : pageLanguage === 'fr'
                          ? '+ Ajouter un Pack'
                          : '+ إضافة باقة'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Quick Presets Bar */}
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>
                        {pageLanguage === 'en'
                          ? '💡 1-Click Quick Add Preset Packs (in English):'
                          : pageLanguage === 'fr'
                          ? '💡 Ajout rapide de packs en Français (en 1 clic) :'
                          : '💡 إضافة سريعة لباقات جاهزة بالعربية (بنقرة واحدة) :'}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {pageLanguage === 'en' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(1, '1 Piece', 1, 'Free Shipping')}
                          className="text-xs bg-white hover:bg-blue-100/60 text-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ 1 Piece Pack (Standard Price)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(2, '2 Pieces - Most Popular Offer', 1.7, 'Save 15% ⚡', true)}
                          className="text-xs bg-white hover:bg-blue-100/60 text-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ 2 Pieces Pack (-15% Most Popular)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(3, '3 Pieces - Best Value Family Pack', 2.25, 'Save 25% 🔥')}
                          className="text-xs bg-white hover:bg-blue-100/60 text-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ 3 Pieces Pack (-25% Best Value)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(4, '4 Pieces - Special Bulk Pack', 2.8, 'Save 30% 💎')}
                          className="text-xs bg-white hover:bg-blue-100/60 text-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ 4 Pieces Pack (-30% Special)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(3, '3 Pieces (Buy 2 + Get 1 Free)', 2.0, '3rd FREE 🎁', true)}
                          className="text-xs bg-amber-100/70 hover:bg-amber-100 text-amber-950 px-3 py-1.5 rounded-lg border border-amber-300 transition-colors flex items-center gap-1 font-bold cursor-pointer shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>+ Buy 2 Get 1 Free (3 Pieces for the price of 2)</span>
                        </button>
                      </>
                    ) : pageLanguage === 'fr' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(1, '1 Pièce', 1, 'Livraison Gratuite')}
                          className="text-xs bg-white hover:bg-blue-100/60 text-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ Pack 1 Pièce (Prix standard)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(2, "2 Pièces - L'offre la plus demandée", 1.7, 'Économisez 15% ⚡', true)}
                          className="text-xs bg-white hover:bg-blue-100/60 text-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ Pack 2 Pièces (-15% Populaire)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(3, '3 Pièces - Pack Économique', 2.25, 'Économisez 25% 🔥')}
                          className="text-xs bg-white hover:bg-blue-100/60 text-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ Pack 3 Pièces (-25% Pack Éco)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(4, '4 Pièces - Offre Spéciale', 2.8, 'Économisez 30% 💎')}
                          className="text-xs bg-white hover:bg-blue-100/60 text-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ Pack 4 Pièces (-30% Spécial)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(3, '3 Pièces (2 achetées + 1 offerte)', 2.0, '3ème OFFERTE 🎁', true)}
                          className="text-xs bg-amber-100/70 hover:bg-amber-100 text-amber-950 px-3 py-1.5 rounded-lg border border-amber-300 transition-colors flex items-center gap-1 font-bold cursor-pointer shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>+ Pack 2 + 1 Gratuit (3 pièces au prix de 2)</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(1, 'قطعة واحدة (1)', 1, 'توصيل مجاني')}
                          className="text-xs bg-white hover:bg-blue-100/60 text-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ باقة 1 قطعة (سعر عادي)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(2, 'قطعتين (2) - العرض الأكثر طلباً', 1.7, 'وفر 15% ⚡', true)}
                          className="text-xs bg-white hover:bg-blue-100/60 text-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ باقة 2 قطع (-15% الأكثر طلباً)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(3, '3 قطع - باقة التوفير العائلية', 2.25, 'وفر 25% 🔥')}
                          className="text-xs bg-white hover:bg-blue-100/60 text-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ باقة 3 قطع (-25% عائلي)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(4, '4 قطع - باقة خاصة', 2.8, 'وفر 30% 💎')}
                          className="text-xs bg-white hover:bg-blue-100/60 text-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ باقة 4 قطع (-30%)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPresetOffer(3, '3 قطع (اشتري 2 واحصل على الثالثة مجاناً)', 2.0, '3 مجاناً 🎁', true)}
                          className="text-xs bg-amber-100/70 hover:bg-amber-100 text-amber-950 px-3 py-1.5 rounded-lg border border-amber-300 transition-colors flex items-center gap-1 font-bold cursor-pointer shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>+ باقة 2 + 1 مجاناً (3 قطع بسعر 2)</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Empty State if no offers */}
                {offers.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/60 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">
                        {pageLanguage === 'en'
                          ? 'No packs configured for this product'
                          : pageLanguage === 'fr'
                          ? 'Aucun pack configuré pour ce produit'
                          : 'قائمة الباقات فارغة (Aucun pack)'}
                      </h4>
                      <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
                        {pageLanguage === 'en'
                          ? `The pack list is empty. Customers will purchase by unit at base price (${price} ${settings.currency}). Use the buttons above to add your offers.`
                          : pageLanguage === 'fr'
                          ? `La liste des packs est vide. Le client achètera à l'unité au prix de base (${price} ${settings.currency}). Utilisez les boutons ci-dessus pour ajouter vos offres.`
                          : `المكان فارغ تماماً لكي تضيف فقط الباقات التي تناسبك. في حال لم تضف أي باقة، سيشتري الزبون بالقطعة الواحدة بالسعر الأساسي (${price} ${settings.currency}).`}
                      </p>
                    </div>
                    <div className="pt-2 flex justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleAddCustomOffer}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>
                          {pageLanguage === 'en'
                            ? '+ Add Custom Pack'
                            : pageLanguage === 'fr'
                            ? '+ Ajouter un pack personnalisé'
                            : '+ إضافة باقة مخصصة'}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* List of Editable Packs */
                  <div className="space-y-4">
                    {offers.map((off, idx) => {
                      const regularPriceForQty = off.quantity * (parseFloat(price) || 299);
                      const savedDh = Math.max(0, regularPriceForQty - off.totalPrice);
                      const savedPercent = regularPriceForQty > 0 ? Math.round((savedDh / regularPriceForQty) * 100) : 0;

                      return (
                        <div
                          key={off.id}
                          className={`rounded-2xl border-2 transition-all p-4 sm:p-5 relative ${
                            off.isPopular
                              ? 'border-blue-500 bg-blue-50/30 shadow-xs ring-2 ring-blue-500/10'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          id={`pack-card-${idx}`}
                        >
                          {/* Pack Header Toolbar */}
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-gray-900 text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg">
                                Pack #{idx + 1}
                              </span>
                              <span className="text-xs font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                                {off.quantity}{' '}
                                {pageLanguage === 'en'
                                  ? off.quantity > 1
                                    ? 'Pieces'
                                    : 'Piece'
                                  : pageLanguage === 'fr'
                                  ? off.quantity > 1
                                    ? 'Pièces'
                                    : 'Pièce'
                                  : off.quantity > 1
                                  ? 'قطع'
                                  : 'قطعة'}
                              </span>
                              {off.isPopular && (
                                <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                                  <Star className="w-3 h-3 fill-white" />
                                  <span>
                                    {pageLanguage === 'en'
                                      ? 'Popular Offer ⭐'
                                      : pageLanguage === 'fr'
                                      ? 'Offre Populaire ⭐'
                                      : 'العرض الأكثر طلباً ⭐'}
                                  </span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Toggle Popular */}
                              <button
                                type="button"
                                onClick={() => handleTogglePopularOffer(idx)}
                                className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                                  off.isPopular
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                }`}
                                title={
                                  pageLanguage === 'en'
                                    ? 'Highlight this pack as the most popular offer'
                                    : pageLanguage === 'fr'
                                    ? "Mettre en avant ce pack comme l'offre la plus vendue"
                                    : 'تمييز هذا العرض كأفضل عرض مطلوب'
                                }
                              >
                                <Star className={`w-3.5 h-3.5 ${off.isPopular ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
                                <span>
                                  {pageLanguage === 'en'
                                    ? off.isPopular
                                      ? '⭐ Popular'
                                      : 'Set as Popular'
                                    : pageLanguage === 'fr'
                                    ? off.isPopular
                                      ? '⭐ Populaire'
                                      : 'Définir comme Populaire'
                                    : off.isPopular
                                    ? '⭐ العرض الأفضل'
                                    : 'تحديد كـ "الأكثر طلباً"'}
                                </span>
                              </button>

                              {/* Delete Pack */}
                              <button
                                type="button"
                                onClick={() => handleRemoveOffer(idx)}
                                className="text-rose-600 hover:text-white hover:bg-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold border border-rose-200 hover:border-rose-600"
                                title={
                                  pageLanguage === 'en'
                                    ? 'Delete this pack'
                                    : pageLanguage === 'fr'
                                    ? 'Supprimer ce pack définitivement'
                                    : 'حذف هذه الباقة نهائياً'
                                }
                                id={`delete-pack-btn-${idx}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">
                                  {pageLanguage === 'en'
                                    ? 'Delete'
                                    : pageLanguage === 'fr'
                                    ? 'Supprimer'
                                    : 'حذف'}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Pack Form Fields Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                            {/* Quantity Input */}
                            <div className="sm:col-span-3">
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                {pageLanguage === 'en'
                                  ? 'Quantity *'
                                  : pageLanguage === 'fr'
                                  ? 'Quantité *'
                                  : 'الكمية (القطع) *'}
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min={1}
                                  required
                                  value={off.quantity}
                                  onChange={(e) => handleUpdateOffer(idx, 'quantity', e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-black text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                  x
                                </span>
                              </div>
                            </div>

                            {/* Total Price Input */}
                            <div className="sm:col-span-4">
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                {pageLanguage === 'en'
                                  ? `Total Pack Price (${settings.currency}) *`
                                  : pageLanguage === 'fr'
                                  ? `Prix Total du Pack (${settings.currency}) *`
                                  : `السعر الإجمالي للباقة (${settings.currency}) *`}
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min={0}
                                  required
                                  value={off.totalPrice}
                                  onChange={(e) => handleUpdateOffer(idx, 'totalPrice', e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-black text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                  {settings.currency}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1 flex items-center justify-between">
                                <span>
                                  {pageLanguage === 'en' ? 'Or: ' : pageLanguage === 'fr' ? 'Soit : ' : 'أي : '}
                                  <strong>{off.pricePerUnit} {settings.currency}</strong>
                                  {pageLanguage === 'en' ? ' / unit' : pageLanguage === 'fr' ? ' / pièce' : ' / قطعة'}
                                </span>
                                {savedDh > 0 && (
                                  <span className="text-blue-700 font-bold">
                                    {pageLanguage === 'en'
                                      ? `Save ${savedDh} ${settings.currency} (${savedPercent}%)`
                                      : pageLanguage === 'fr'
                                      ? `Économie ${savedDh} ${settings.currency} (${savedPercent}%)`
                                      : `توفير ${savedDh} درهم (${savedPercent}%)`}
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Discount Badge Input */}
                            <div className="sm:col-span-5">
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                {pageLanguage === 'en'
                                  ? 'Discount Badge (Optional)'
                                  : pageLanguage === 'fr'
                                  ? 'Badge Promotionnel / Remise (Optionnel)'
                                  : 'شارة العرض / التخفيض (اختياري)'}
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={off.discountBadge || ''}
                                  onChange={(e) => handleUpdateOffer(idx, 'discountBadge', e.target.value)}
                                  placeholder={
                                    pageLanguage === 'en'
                                      ? 'Ex: Save 15% ⚡ / Free Shipping 🚚'
                                      : pageLanguage === 'fr'
                                      ? 'Ex: Économisez 15% ⚡ / Livraison Gratuite'
                                      : 'مثال: وفر 15% ⚡ / توصيل مجاني'
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <Tag className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>

                            {/* Pack Label / Title Displayed to Customer */}
                            <div className="sm:col-span-12">
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                {pageLanguage === 'en'
                                  ? 'Offer Title / Label displayed to customer on product page *'
                                  : pageLanguage === 'fr'
                                  ? "Titre / Libellé de l'offre affiché au client sur la page produit *"
                                  : 'اسم وعنوان الباقة المعروض للزبون في استمارة الطلب *'}
                              </label>
                              <input
                                type="text"
                                required
                                value={off.label}
                                onChange={(e) => handleUpdateOffer(idx, 'label', e.target.value)}
                                placeholder={
                                  pageLanguage === 'en'
                                    ? 'Ex: 2 Pieces - Most Popular'
                                    : pageLanguage === 'fr'
                                    ? "Ex: 2 Pièces - L'offre la plus demandée"
                                    : 'مثال: قطعتين (2) - العرض الأكثر طلباً'
                                }
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />

                              {/* Quick Title Suggestions */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] text-gray-400 font-semibold">
                                  {pageLanguage === 'en' ? 'Suggestions:' : pageLanguage === 'fr' ? 'Suggestions :' : 'مقترحات :'}
                                </span>
                                {(pageLanguage === 'en'
                                  ? [
                                      `${off.quantity} Piece${off.quantity > 1 ? 's' : ''}`,
                                      `${off.quantity} Pieces - Most Popular 🔥`,
                                      `${off.quantity} Pieces - Best Value Pack`,
                                      `Special Pack ${off.quantity} Pieces (Free Shipping)`,
                                    ]
                                  : pageLanguage === 'fr'
                                  ? [
                                      `${off.quantity} Pièce${off.quantity > 1 ? 's' : ''}`,
                                      `${off.quantity} Pièces - L'offre la plus demandée 🔥`,
                                      `${off.quantity} Pièces - Pack Économique`,
                                      `Pack Spécial ${off.quantity} Pièces (Livraison Gratuite)`,
                                    ]
                                  : [
                                      off.quantity === 1
                                        ? 'قطعة واحدة (1)'
                                        : off.quantity === 2
                                        ? 'قطعتين (2) - العرض الأكثر طلباً'
                                        : `${off.quantity} قطع`,
                                      `${off.quantity} قطع - العرض الأكثر طلباً 🔥`,
                                      `${off.quantity} قطع - باقة التوفير العائلية`,
                                      `باقة خاصة ${off.quantity} قطع (توصيل سريع مجاناً)`,
                                    ]
                                ).map((sug, sIdx) => (
                                  <button
                                    key={sIdx}
                                    type="button"
                                    onClick={() => handleUpdateOffer(idx, 'label', sug)}
                                    className="text-[10px] bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-800 px-2 py-0.5 rounded border border-gray-200 cursor-pointer"
                                  >
                                    {sug}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Bottom Add Pack Quick Button */}
                {offers.length > 0 && (
                  <div className="pt-2 flex justify-between items-center flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleAddCustomOffer}
                      className="px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {pageLanguage === 'en'
                          ? '+ Add another quantity pack'
                          : pageLanguage === 'fr'
                          ? '+ Ajouter un autre pack de quantité'
                          : '+ إضافة باقة كمية أخرى'}
                      </span>
                    </button>
                    <p className="text-[11px] text-gray-500">
                      {pageLanguage === 'en'
                        ? '💡 E-commerce tip: Offering a discounted 2-piece bundle increases average order value by over 40%.'
                        : pageLanguage === 'fr'
                        ? '💡 Astuce e-commerce : Proposer un pack 2 pièces avec remise augmente la valeur moyenne de commande de plus de 40%.'
                        : '💡 نصيحة للمبيعات: عرض قطعتين مع تخفيض بسيط يرفع المبيعات والأرباح بنسبة تتجاوز 40%.'}
                    </p>
                  </div>
                )}
              </div>

              {/* CARD 5: CUSTOMER REVIEWS MANAGEMENT (AVIS CLIENT) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5" id="reviews-management-card">
                <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <span>
                        {pageLanguage === 'en'
                          ? 'Customer Reviews Management (Optional)'
                          : pageLanguage === 'fr'
                          ? 'Gestion des Avis Clients (Avis Client - Optionnel)'
                          : 'إدارة آراء الزبناء (Avis Client - اختياري)'}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {pageLanguage === 'en'
                        ? 'If you leave this list empty, no customer reviews section will be displayed on the product page.'
                        : pageLanguage === 'fr'
                        ? "Si vous laissez cette liste vide, aucun avis client ne sera affiché sur la page produit."
                        : 'إذا تركت هذه القائمة فارغة، فلن يظهر أي قسم لآراء الزبناء في صفحة المنتج نهائياً.'}
                    </p>
                  </div>
                </div>

                {/* Add Review Form */}
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {pageLanguage === 'en'
                        ? 'Add a Customer Review'
                        : pageLanguage === 'fr'
                        ? 'Ajouter un avis client'
                        : 'إضافة رأي زبون جديد'}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        {pageLanguage === 'en' ? 'Customer Name *' : pageLanguage === 'fr' ? 'Nom du client *' : 'اسم الزبون *'}
                      </label>
                      <input
                        type="text"
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        placeholder={pageLanguage === 'en' ? 'Ex: John Smith' : pageLanguage === 'fr' ? 'Ex: Omar Casablanca' : 'مثال: عمر من الدار البيضاء'}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        {pageLanguage === 'en' ? 'City / Location' : pageLanguage === 'fr' ? 'Ville / Localisation' : 'المدينة / المنطقة'}
                      </label>
                      <input
                        type="text"
                        value={newReviewCity}
                        onChange={(e) => setNewReviewCity(e.target.value)}
                        placeholder={pageLanguage === 'en' ? 'New York / Casablanca' : 'Casablanca'}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        {pageLanguage === 'en' ? 'Rating (Stars)' : pageLanguage === 'fr' ? 'Note (Étoiles)' : 'التقييم (نجوم)'}
                      </label>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-bold"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                        <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                        <option value={3}>⭐⭐⭐ (3/5)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      {pageLanguage === 'en' ? 'Customer Review / Comment *' : pageLanguage === 'fr' ? 'Commentaire du client *' : 'نص التعليق / رأي الزبون *'}
                    </label>
                    <textarea
                      rows={2}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder={
                        pageLanguage === 'en'
                          ? 'Ex: Outstanding quality, super fast delivery!'
                          : pageLanguage === 'fr'
                          ? 'Ex: Produit exceptionnel, livraison rapide...'
                          : 'مثال: سلعة ممتازة وتوصيل سريع وصلني فنفس النهار...'
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddReview}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{pageLanguage === 'en' ? 'Add this review' : pageLanguage === 'fr' ? 'Ajouter cet avis' : 'إضافة هذا الرأي'}</span>
                    </button>
                  </div>
                </div>

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    {pageLanguage === 'en'
                      ? 'No customer reviews added yet. No reviews section will be shown on the product page.'
                      : pageLanguage === 'fr'
                      ? 'Aucun avis client ajouté. Aucun bloc d\'avis ne sera affiché sur la page produit.'
                      : 'لا توجد أي آراء مضافة حالياً. لن يتم عرض أي قسم لآراء الزبناء في صفحة المنتج.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-700">
                      {pageLanguage === 'en'
                        ? `Saved Customer Reviews (${reviews.length}):`
                        : pageLanguage === 'fr'
                        ? `Avis enregistrés (${reviews.length}) :`
                        : `الآراء المسجلة (${reviews.length}) :`}
                    </p>
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 rounded-xl bg-white border border-gray-200 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-950">{rev.author}</span>
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                              {rev.city}
                            </span>
                            <div className="flex text-amber-400">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-700">{rev.comment}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveReview(rev.id)}
                          className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title={pageLanguage === 'en' ? 'Delete this review' : 'Supprimer cet avis'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD 6: CUSTOM BUTTON TEXT CONFIGURATION */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>
                    {pageLanguage === 'en'
                      ? 'Custom Buy / Order Button Text (Optional)'
                      : pageLanguage === 'fr'
                      ? "Texte du bouton d'achat (Optionnel)"
                      : 'نص زر الشراء / الطلب لهذا المنتج (اختياري)'}
                  </span>
                </h2>
                <p className="text-xs text-gray-500">
                  {pageLanguage === 'en'
                    ? 'Customize the text displayed on the buy/order buttons for this specific product.'
                    : pageLanguage === 'fr'
                    ? "Personnalisez le texte affiché sur les boutons d'achat pour ce produit spécifique."
                    : 'قم بتخصيص النص الذي يظهر على زر الشراء والطلب لهذا المنتج فقط.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-2.5 rounded-xl transition-all ${pageLanguage === 'en' ? 'bg-amber-50/60 border-2 border-amber-300 ring-2 ring-amber-100' : 'border border-transparent'}`}>
                    <label className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>{pageLanguage === 'en' ? 'Button Text (English)' : pageLanguage === 'fr' ? 'Texte du bouton (Anglais)' : 'نص الزر (بالإنجليزية)'}</span>
                      {pageLanguage === 'en' && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded">Active ⭐</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={orderButtonTextEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOrderButtonTextEn(val);
                        if (pageLanguage === 'en') {
                          setOrderButtonText(val);
                        }
                      }}
                      placeholder="Ex: Click here to order 🛒"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    />
                  </div>
                  <div className={`p-2.5 rounded-xl transition-all ${pageLanguage === 'fr' ? 'bg-blue-50/60 border-2 border-blue-300 ring-2 ring-blue-100' : 'border border-transparent'}`}>
                    <label className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>{pageLanguage === 'en' ? 'Button Text (French)' : pageLanguage === 'fr' ? "Texte du bouton (Français)" : 'نص الزر (بالفرنسية)'}</span>
                      {pageLanguage === 'fr' && (
                        <span className="text-[10px] bg-blue-200 text-blue-900 font-extrabold px-1.5 py-0.5 rounded">Actif ⭐</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={orderButtonText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOrderButtonText(val);
                        if (pageLanguage === 'en' && !orderButtonTextEn) {
                          setOrderButtonTextEn(val);
                        }
                      }}
                      placeholder="Ex: Acheter Maintenant 🛒"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                  </div>
                  <div className={`p-2.5 rounded-xl transition-all ${pageLanguage === 'ar' ? 'bg-blue-50/60 border-2 border-blue-300 ring-2 ring-blue-100' : 'border border-transparent'}`}>
                    <label className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                      {pageLanguage === 'ar' && (
                        <span className="text-[10px] bg-blue-200 text-blue-900 font-extrabold px-1.5 py-0.5 rounded">نشط ⭐</span>
                      )}
                      <span className="text-right w-full">{pageLanguage === 'en' ? 'Button Text (Arabic)' : pageLanguage === 'fr' ? "Texte du bouton (Arabe)" : 'نص الزر (بالعربية)'}</span>
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={orderButtonTextAr}
                      onChange={(e) => setOrderButtonTextAr(e.target.value)}
                      placeholder="مثال: اطلب الآن والدفع عند الاستلام 🛍️"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR COLUMN (4 Cols on Desktop) */}
            <div className="lg:col-span-4 space-y-6">

              {/* SIDEBAR CARD 1: PRIMARY ACTION & PREVIEW */}
              <div className="bg-white rounded-2xl border-2 border-blue-600 p-5 shadow-sm space-y-3">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm sm:text-base py-3.5 px-4 rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  id="save-product-sidebar-btn"
                >
                  <Save className="w-5 h-5" />
                  <span>
                    {pageLanguage === 'en'
                      ? 'Save Product'
                      : pageLanguage === 'fr'
                      ? 'Enregistrer le Produit'
                      : 'حفظ المنتج'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  {pageLanguage === 'en'
                    ? 'Cancel and return'
                    : pageLanguage === 'fr'
                    ? 'Annuler et retourner'
                    : 'إلغاء والعودة'}
                </button>

                {product?.id && (
                  <a
                    href={`/product/${slug || product.slug || product.id}`}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0 && onViewProductPage) {
                        e.preventDefault();
                        onViewProductPage({
                          ...product,
                          title: title || product.title,
                          titleAr: titleAr || product.titleAr,
                          slug: slug || product.slug,
                          price: price ? parseFloat(price) : product.price,
                          originalPrice: originalPrice ? parseFloat(originalPrice) : product.originalPrice,
                          pageLanguage: pageLanguage || product.pageLanguage,
                        });
                      }
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs py-2.5 px-3 rounded-xl border border-blue-200 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>
                      {pageLanguage === 'en'
                        ? 'View Product Page'
                        : pageLanguage === 'fr'
                        ? 'Voir la page du produit'
                        : 'معاينة صفحة المنتج'}
                    </span>
                  </a>
                )}
              </div>

              {/* SIDEBAR CARD 2: PRICING & PROFIT */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-2.5">
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span>
                      {pageLanguage === 'en'
                        ? `Pricing & Rates (${settings.currency})`
                        : pageLanguage === 'fr'
                        ? `Prix & Tarification (${settings.currency})`
                        : `الأسعار والتعرفة (${settings.currency})`}
                    </span>
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {pageLanguage === 'en'
                      ? `Selling Price (${settings.currency}) *`
                      : pageLanguage === 'fr'
                      ? `Prix de vente (${settings.currency}) *`
                      : `سعر البيع (${settings.currency}) *`}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="299"
                      className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-gray-300 text-base font-black text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      {settings.currency}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {pageLanguage === 'en'
                      ? `Original / Compare Price (${settings.currency})`
                      : pageLanguage === 'fr'
                      ? `Prix Barré / Ancien Prix (${settings.currency})`
                      : `السعر الأصلي / المشطوب (${settings.currency})`}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="499"
                      className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-gray-300 text-sm line-through text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      {settings.currency}
                    </span>
                  </div>
                </div>

                {/* Discount Summary Pill */}
                {discountPercent > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-blue-900">
                      <span>
                        {pageLanguage === 'en'
                          ? 'Customer Discount:'
                          : pageLanguage === 'fr'
                          ? 'Réduction affichée au client :'
                          : 'نسبة التخفيض المعروضة:'}
                      </span>
                      <span>-{discountPercent}%</span>
                    </div>
                    <div className="flex justify-between text-blue-700 text-[11px]">
                      <span>
                        {pageLanguage === 'en'
                          ? 'Customer Savings:'
                          : pageLanguage === 'fr'
                          ? 'Économie pour le client :'
                          : 'توفير الزبون:'}
                      </span>
                      <span>{discountSaved} {settings.currency}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SIDEBAR CARD: API & Sync Identifiers */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="border-b border-indigo-200 pb-2.5">
                  <h3 className="text-sm font-black text-indigo-900 flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-indigo-600" />
                    <span>
                      {pageLanguage === 'en'
                        ? 'Integration & Sync Settings'
                        : pageLanguage === 'fr'
                        ? "Paramètres d'Intégration"
                        : 'إعدادات المزامنة والربط'}
                    </span>
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-indigo-700 mb-1 uppercase tracking-wider">
                      {pageLanguage === 'en' ? 'SKU Reference *' : pageLanguage === 'fr' ? 'Référence (SKU) *' : 'رمز المنتج (SKU) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Ex: WATCH-PRO-01"
                      className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 bg-white text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-indigo-700 mb-1 uppercase tracking-wider">
                      {pageLanguage === 'en' ? 'Country Code (ISO)' : pageLanguage === 'fr' ? 'Code Pays (ISO)' : 'رمز الدولة (ISO)'}
                    </label>
                    <input
                      type="text"
                      value={productCountryCode}
                      onChange={(e) => setProductCountryCode(e.target.value.toUpperCase())}
                      placeholder="Ex: MA / US / FR"
                      maxLength={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 bg-white text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-indigo-200"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-indigo-400 mt-2 leading-relaxed">
                  {pageLanguage === 'en'
                    ? 'Essential identifiers for automatic synchronization with order management and fulfillment platforms.'
                    : pageLanguage === 'fr'
                    ? 'Identifiants indispensables pour la synchronisation automatique avec les plateformes de gestion de commandes.'
                    : 'معرفات ضرورية للمزامنة التلقائية مع منصات إدارة الطلبات والشحن.'}
                </p>
              </div>

              {/* SIDEBAR CARD 3: STOCK & URGENCY (SCARCITY) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-2.5">
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>
                      {pageLanguage === 'en'
                        ? 'Inventory & Urgency (Scarcity)'
                        : pageLanguage === 'fr'
                        ? 'Disponibilité & Urgence (Stock)'
                        : 'المخزون ومحفز الاستعجال'}
                    </span>
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {pageLanguage === 'en'
                      ? 'Urgency Stock Displayed (Items Remaining)'
                      : pageLanguage === 'fr'
                      ? "Stock d'urgence affiché (Pièces restantes)"
                      : 'الكمية المتبقية المعروضة (للاستعجال)'}
                  </label>
                  <input
                    type="number"
                    value={stockCount}
                    onChange={(e) => setStockCount(e.target.value)}
                    placeholder="8"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    {pageLanguage === 'en'
                      ? 'Triggers urgency message: "Only X items left in stock"'
                      : pageLanguage === 'fr'
                      ? 'Déclenche le message d\'urgence : "Plus que X pièces en stock"'
                      : 'رسالة الاستعجال التلقائية : "بقي فقط X قطع في المخزون"'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {pageLanguage === 'en'
                      ? 'Promo Countdown Timer (Minutes)'
                      : pageLanguage === 'fr'
                      ? 'Durée du Compteur Promo (Minutes)'
                      : 'مدة العداد التنازلي (بالدقائق)'}
                  </label>
                  <input
                    type="number"
                    value={countdownMinutes}
                    onChange={(e) => setCountdownMinutes(e.target.value)}
                    placeholder="180"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-gray-800">
                      {pageLanguage === 'en'
                        ? 'Product in stock (Active in store)'
                        : pageLanguage === 'fr'
                        ? 'Produit disponible en stock (Actif)'
                        : 'المنتج متوفر في المخزون (نشط)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* SIDEBAR CARD 4: CATEGORY & BADGE */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-2.5">
                  <h3 className="text-sm font-black text-gray-900">
                    {pageLanguage === 'en'
                      ? 'Organization & Badges'
                      : pageLanguage === 'fr'
                      ? 'Organisation & Badges'
                      : 'التصنيف والشارات'}
                  </h3>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      {pageLanguage === 'en' ? 'Product Category' : pageLanguage === 'fr' ? 'Catégorie du produit' : 'تصنيف المنتج'}
                    </label>
                    {category.trim() && !storeCategories.some((c) => c.toLowerCase() === category.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => handleSaveNewCategory()}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        {pageLanguage === 'en' ? 'Save category' : pageLanguage === 'fr' ? 'Enregistrer catégorie' : 'حفظ التصنيف في القائمة'}
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveNewCategory();
                        }
                      }}
                      placeholder={
                        pageLanguage === 'en'
                          ? 'Ex: Honey, Electronics, Beauty...'
                          : pageLanguage === 'fr'
                          ? 'Ex: Miel, High-Tech, Beauté...'
                          : 'اكتب التصنيف هنا (مثال: عسل، زيوت، ملابس...)'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {category.trim() && (
                      <button
                        type="button"
                        onClick={() => handleSaveNewCategory()}
                        title={pageLanguage === 'en' ? 'Save to list' : pageLanguage === 'fr' ? 'Enregistrer dans la liste' : 'حفظ في القائمة'}
                        className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{pageLanguage === 'en' ? 'Save' : pageLanguage === 'fr' ? 'Enregistrer' : 'حفظ'}</span>
                      </button>
                    )}
                  </div>

                  {/* List of Saved and Available Store Categories */}
                  <div className="pt-2.5">
                    <span className="block text-[11px] font-bold text-gray-500 mb-1.5">
                      {pageLanguage === 'en'
                        ? 'Available categories (click to choose):'
                        : pageLanguage === 'fr'
                        ? 'Catégories disponibles (cliquez pour choisir) :'
                        : 'التصنيفات المحفوظة والمتوفرة في متجرك (اضغط للاختيار):'}
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      {storeCategories.map((cat) => {
                        const isSelected = category.trim().toLowerCase() === cat.trim().toLowerCase();
                        const isCustomSaved = savedCategories.some((sc) => sc.toLowerCase() === cat.toLowerCase());

                        return (
                          <div
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border select-none ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200/80 hover:border-gray-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            <span>{cat}</span>
                            {isCustomSaved && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteSavedCategory(cat, e)}
                                title={pageLanguage === 'en' ? 'Delete from saved' : pageLanguage === 'fr' ? 'Supprimer' : 'حذف من المحفوظات'}
                                className={`ml-0.5 rounded-full p-0.5 transition-colors ${
                                  isSelected
                                    ? 'hover:bg-blue-700 text-white/80 hover:text-white'
                                    : 'hover:bg-gray-300 text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {storeCategories.length === 0 && (
                        <div className="text-[11px] text-gray-400 italic py-1">
                          {pageLanguage === 'en'
                            ? 'No categories yet. Type above and click Save!'
                            : pageLanguage === 'fr'
                            ? 'Aucune catégorie enregistrée. Saisissez ci-dessus et enregistrez !'
                            : 'لا توجد تصنيفات بعد. اكتب اسماً في الأعلى واضغط حفظ لتسجيله هنا!'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {pageLanguage === 'en'
                      ? 'Product Catch Badge'
                      : pageLanguage === 'fr'
                      ? "Badge d'Accroche Produit"
                      : 'شارة لفت الانتباه'}
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder={
                      pageLanguage === 'en'
                        ? 'Ex: Best Seller 🔥'
                        : pageLanguage === 'fr'
                        ? 'Ex: Le Plus Demandé 🔥'
                        : 'Ex: الأكثر طلباً 🔥'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(pageLanguage === 'en'
                      ? [
                          'Best Seller 🔥',
                          'Free Shipping 🚚',
                          'Save 50% ⚡',
                          'Limited Stock ⏳',
                        ]
                      : pageLanguage === 'fr'
                      ? [
                          'Le Plus Demandé 🔥',
                          'Livraison Gratuite 🚚',
                          'Réduction -50% ⚡',
                          'Best-Seller 🌟',
                        ]
                      : [
                          'الأكثر طلباً 🔥',
                          'توصيل مجاني 🚚',
                          'تخفيض 50% ⚡',
                          'الأكثر مبيعاً 🌟',
                        ]
                    ).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBadge(b)}
                        className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded cursor-pointer"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </form>
      </main>
    </div>
  );
};
