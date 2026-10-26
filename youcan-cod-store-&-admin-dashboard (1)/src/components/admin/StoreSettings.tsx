import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Image as ImageIcon, 
  Layout, 
  ClipboardList, 
  Smartphone, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  LayoutDashboard,
  Palette,
  Eye,
  Trash2,
  Plus,
  Type,
  MapPin,
  Phone,
  MessageSquare,
  Sliders,
  Database,
  Copy,
  Check,
  Monitor,
  Ruler,
  Info,
  Sparkles
} from 'lucide-react';
import { StoreSettings as StoreSettingsType, StoreSlide } from '../../types';
import { applyStoreTheme } from '../../utils/themeHelper';

interface StoreSettingsProps {
  settings: StoreSettingsType;
  onSaveSettings: (settings: StoreSettingsType) => void;
}

const ensureStoreSettings = (s: StoreSettingsType): StoreSettingsType => {
  return {
    ...s,
    checkoutFields: {
      name: {
        show: s?.checkoutFields?.name?.show ?? true,
        label: s?.checkoutFields?.name?.label || 'Nom & Prénom complet *',
        placeholder: s?.checkoutFields?.name?.placeholder || 'Ex: Mohammed Alami',
        labelFr: s?.checkoutFields?.name?.labelFr || s?.checkoutFields?.name?.label || 'Nom & Prénom complet *',
        placeholderFr: s?.checkoutFields?.name?.placeholderFr || s?.checkoutFields?.name?.placeholder || 'Ex: Mohammed Alami',
        labelAr: s?.checkoutFields?.name?.labelAr || 'الاسم الكامل (الاسم والنسب) *',
        placeholderAr: s?.checkoutFields?.name?.placeholderAr || 'مثال: محمد العلوي',
        labelEn: s?.checkoutFields?.name?.labelEn || 'Full Name *',
        placeholderEn: s?.checkoutFields?.name?.placeholderEn || 'e.g., John Doe',
      },
      phone: {
        show: s?.checkoutFields?.phone?.show ?? true,
        label: s?.checkoutFields?.phone?.label || 'Numéro de Téléphone *',
        placeholder: s?.checkoutFields?.phone?.placeholder || '06 XX XX XX XX',
        labelFr: s?.checkoutFields?.phone?.labelFr || s?.checkoutFields?.phone?.label || 'Numéro de Téléphone (WhatsApp ou Appel) *',
        placeholderFr: s?.checkoutFields?.phone?.placeholderFr || s?.checkoutFields?.phone?.placeholder || '06 XX XX XX XX',
        labelAr: s?.checkoutFields?.phone?.labelAr || 'رقم الهاتف (للاتصال وتأكيد الطلبية) *',
        placeholderAr: s?.checkoutFields?.phone?.placeholderAr || '06 XX XX XX XX',
        labelEn: s?.checkoutFields?.phone?.labelEn || 'Phone Number (WhatsApp or Call) *',
        placeholderEn: s?.checkoutFields?.phone?.placeholderEn || 'e.g., 06 XX XX XX XX',
      },
      city: {
        show: s?.checkoutFields?.city?.show ?? true,
        label: s?.checkoutFields?.city?.label || 'Ville de livraison *',
        placeholder: s?.checkoutFields?.city?.placeholder || 'Votre ville',
        labelFr: s?.checkoutFields?.city?.labelFr || s?.checkoutFields?.city?.label || 'Ville de livraison *',
        placeholderFr: s?.checkoutFields?.city?.placeholderFr || s?.checkoutFields?.city?.placeholder || 'Sélectionnez votre ville',
        labelAr: s?.checkoutFields?.city?.labelAr || 'المدينة *',
        placeholderAr: s?.checkoutFields?.city?.placeholderAr || 'اختر مدينتك',
        labelEn: s?.checkoutFields?.city?.labelEn || 'City / Region *',
        placeholderEn: s?.checkoutFields?.city?.placeholderEn || 'Select or enter your city',
      },
      address: {
        show: s?.checkoutFields?.address?.show ?? true,
        label: s?.checkoutFields?.address?.label || 'Adresse de livraison',
        placeholder: s?.checkoutFields?.address?.placeholder || 'Quartier, Rue, N°',
        labelFr: s?.checkoutFields?.address?.labelFr || s?.checkoutFields?.address?.label || 'Adresse de livraison (Quartier, Rue, N°)',
        placeholderFr: s?.checkoutFields?.address?.placeholderFr || s?.checkoutFields?.address?.placeholder || 'Ex: Quartier Salam, Rue 4, N° 12',
        labelAr: s?.checkoutFields?.address?.labelAr || 'العنوان بالتفصيل (الحي، الشارع، رقم المنزل)',
        placeholderAr: s?.checkoutFields?.address?.placeholderAr || 'مثال: حي السلام قرب المسجد',
        labelEn: s?.checkoutFields?.address?.labelEn || 'Delivery Address (Street, House No.)',
        placeholderEn: s?.checkoutFields?.address?.placeholderEn || 'e.g., Downtown, Street 12, Apt 4',
      },
      notes: {
        show: s?.checkoutFields?.notes?.show ?? true,
        label: s?.checkoutFields?.notes?.label || 'Notes (Optionnel)',
        placeholder: s?.checkoutFields?.notes?.placeholder || 'Précisions pour le livreur',
        labelFr: s?.checkoutFields?.notes?.labelFr || s?.checkoutFields?.notes?.label || 'Notes (Optionnel)',
        placeholderFr: s?.checkoutFields?.notes?.placeholderFr || s?.checkoutFields?.notes?.placeholder || 'Précisions pour le livreur',
        labelAr: s?.checkoutFields?.notes?.labelAr || 'ملاحظات (اختياري)',
        placeholderAr: s?.checkoutFields?.notes?.placeholderAr || 'أضف أي معلومات إضافية...',
        labelEn: s?.checkoutFields?.notes?.labelEn || 'Order Notes (Optional)',
        placeholderEn: s?.checkoutFields?.notes?.placeholderEn || 'Special delivery instructions...',
      },
    }
  };
};

export const StoreSettings: React.FC<StoreSettingsProps> = ({ settings, onSaveSettings }) => {
  const [activeView, setActiveView] = useState<'selection' | 'identity' | 'slides' | 'form'>('selection');
  const [tempSettings, setTempSettings] = useState<StoreSettingsType>(() => ensureStoreSettings(settings));
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with prop if settings change from outside
  useEffect(() => {
    setTempSettings(ensureStoreSettings(settings));
  }, [settings]);

  // Slides Local State
  const [newSlideImage, setNewSlideImage] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideBtn, setNewSlideBtn] = useState('');
  const [previewLang, setPreviewLang] = useState<'ar' | 'fr' | 'en'>('fr');
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [isProcessingSlideImage, setIsProcessingSlideImage] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSave = () => {
    onSaveSettings(tempSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingLogo(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize if oversized to maintain fast loading and safe JSONB storage
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress with high quality PNG or JPEG
            const isPng = file.type === 'image/png';
            const compressedDataUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.9);
            setTempSettings((prev) => ({ ...prev, logoUrl: compressedDataUrl }));
          } else {
            setTempSettings((prev) => ({ ...prev, logoUrl: event.target?.result as string }));
          }
          setIsProcessingLogo(false);
        };
        img.onerror = () => {
          setTempSettings((prev) => ({ ...prev, logoUrl: event.target?.result as string }));
          setIsProcessingLogo(false);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        setIsProcessingLogo(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSlideFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingSlideImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize slide to optimal responsive banner dimensions (1600 x 600 max)
          const MAX_WIDTH = 1600;
          const MAX_HEIGHT = 650;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            let compressed = '';
            try {
              compressed = canvas.toDataURL('image/webp', 0.82);
            } catch (_) {}
            if (!compressed || !compressed.startsWith('data:image/webp')) {
              compressed = canvas.toDataURL('image/jpeg', 0.80);
            }
            setNewSlideImage(compressed);
          } else {
            setNewSlideImage(event.target?.result as string);
          }
          setIsProcessingSlideImage(false);
        };
        img.onerror = () => {
          setNewSlideImage(event.target?.result as string);
          setIsProcessingSlideImage(false);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        setIsProcessingSlideImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSlide = () => {
    if (!newSlideImage) return;
    const newSlide: StoreSlide = {
      id: `slide-${Date.now()}`,
      imageUrl: newSlideImage,
      title: newSlideTitle,
      subtitle: newSlideSubtitle,
      buttonText: newSlideBtn,
    };
    setTempSettings({
      ...tempSettings,
      slides: [...(tempSettings.slides || []), newSlide],
    });
    setNewSlideImage('');
    setNewSlideTitle('');
    setNewSlideSubtitle('');
    setNewSlideBtn('');
  };

  const handleRemoveSlide = (id: string) => {
    const updatedSlides = (tempSettings.slides || []).filter(s => s.id !== id);
    const updated = {
      ...tempSettings,
      slides: updatedSlides,
    };
    setTempSettings(updated);
    onSaveSettings(updated);
  };

  const toggleField = (fieldName: keyof Required<StoreSettingsType>['checkoutFields']) => {
    if (!tempSettings.checkoutFields) return;
    setTempSettings({
      ...tempSettings,
      checkoutFields: {
        ...tempSettings.checkoutFields,
        [fieldName]: {
          ...tempSettings.checkoutFields[fieldName],
          show: !tempSettings.checkoutFields[fieldName].show
        }
      }
    });
  };

  const updateField = (
    fieldName: keyof Required<StoreSettingsType>['checkoutFields'], 
    key: 'labelFr' | 'placeholderFr' | 'labelAr' | 'placeholderAr' | 'labelEn' | 'placeholderEn', 
    value: string
  ) => {
    if (!tempSettings.checkoutFields) return;
    setTempSettings({
      ...tempSettings,
      checkoutFields: {
        ...tempSettings.checkoutFields,
        [fieldName]: {
          ...tempSettings.checkoutFields[fieldName],
          [key]: value
        }
      }
    });
  };

  // 1. SELECTION VIEW
  if (activeView === 'selection') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Settings className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Paramètres du Store</h2>
            <p className="text-indigo-50 text-sm max-w-md">
              Personnalisez l'apparence et le fonctionnement de votre boutique en ligne.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setActiveView('identity')}
            className="group w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 text-left flex items-center gap-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Palette className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">Identité & Design</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">Logo, couleur boutique, couleur du dashboard admin, nom et devise.</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tempSettings.themeColor || '#e11d48' }} />
                  Boutique : {tempSettings.themeColor || '#e11d48'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tempSettings.dashboardColor || '#2563eb' }} />
                  Dashboard Admin : {tempSettings.dashboardColor || '#2563eb'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-indigo-50 px-6 py-3 rounded-2xl text-indigo-600 font-bold text-xs uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <span>Gérer</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => setActiveView('slides')}
            className="group w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-amber-100 transition-all duration-300 text-left flex items-center gap-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <ImageIcon className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-gray-900 group-hover:text-amber-600 transition-colors">Bannières & Slides</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">Gérez le carrousel d'images de votre page d'accueil.</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Ruler className="w-3.5 h-3.5 text-amber-600" />
                  Format conseillé : 1920 × 600 px (ou 1400 × 450 px)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-amber-50 px-6 py-3 rounded-2xl text-amber-600 font-bold text-xs uppercase tracking-widest group-hover:bg-amber-600 group-hover:text-white transition-all">
              <span>Gérer</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => setActiveView('form')}
            className="group w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 text-left flex items-center gap-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <ClipboardList className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">Formulaire Checkout</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">Personnalisez les champs de commande avec aperçu réel.</p>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-2xl text-blue-600 font-bold text-xs uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all">
              <span>Gérer</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  // 2. IDENTITY VIEW
  if (activeView === 'identity') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <button onClick={() => setActiveView('selection')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-xs transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR AUX PARAMÈTRES</span>
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm max-w-4xl">
          <div className="p-8 border-b border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Identité & Design</h3>
              <p className="text-xs text-gray-500">L'image de marque de votre boutique</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Nom de la Boutique</label>
                <input
                  type="text"
                  value={tempSettings.storeName}
                  onChange={(e) => setTempSettings({ ...tempSettings, storeName: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">WhatsApp Support</label>
                <input
                  type="text"
                  value={tempSettings.storePhone}
                  onChange={(e) => setTempSettings({ ...tempSettings, storePhone: e.target.value })}
                  placeholder="Ex: +212600000000 (Optionnel)"
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Devise (Currency)</label>
                <select
                  value={tempSettings.currency}
                  onChange={(e) => setTempSettings({ ...tempSettings, currency: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all cursor-pointer"
                >
                  <option value="DH">DH (Dirham Marocain)</option>
                  <option value="MAD">MAD</option>
                  <option value="FCFA">FCFA</option>
                  <option value="TZS">TZS (Tanzania)</option>
                  <option value="€">€ (Euro)</option>
                  <option value="$">$ (Dollar)</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Langue du Store</label>
                <select
                  value={tempSettings.storeLanguage}
                  onChange={(e) => setTempSettings({ ...tempSettings, storeLanguage: e.target.value as 'fr' | 'ar' | 'en' })}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all cursor-pointer"
                >
                  <option value="ar">العربية (Arabe)</option>
                  <option value="fr">Français (French)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="bg-indigo-50/30 p-8 rounded-3xl border border-indigo-100 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider">Barre d'annonce (Top Header)</label>
                  <p className="text-[10px] text-indigo-600">Affichez un message en haut du site (ex: Livraison gratuite)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={tempSettings.enableAnnouncement} 
                    onChange={(e) => setTempSettings({ ...tempSettings, enableAnnouncement: e.target.checked })} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                </label>
              </div>

              {tempSettings.enableAnnouncement && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-indigo-800 uppercase flex items-center gap-1">
                      <span>🇫🇷</span>
                      <span>Texte Français</span>
                    </label>
                    <input 
                      type="text"
                      value={tempSettings.announcementText}
                      onChange={(e) => setTempSettings({ ...tempSettings, announcementText: e.target.value })}
                      className="w-full p-3 rounded-xl border border-indigo-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      placeholder="Livraison gratuite..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-indigo-800 uppercase flex items-center gap-1">
                      <span>🇬🇧</span>
                      <span>English Text</span>
                    </label>
                    <input 
                      type="text"
                      value={tempSettings.announcementTextEn || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, announcementTextEn: e.target.value })}
                      className="w-full p-3 rounded-xl border border-indigo-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      placeholder="Free shipping..."
                    />
                  </div>
                  <div className="space-y-2" dir="rtl">
                    <label className="text-[10px] font-bold text-indigo-800 uppercase text-right flex items-center justify-end gap-1">
                      <span>النص بالعربية</span>
                      <span>🇲🇦</span>
                    </label>
                    <input 
                      type="text"
                      value={tempSettings.announcementTextAr}
                      onChange={(e) => setTempSettings({ ...tempSettings, announcementTextAr: e.target.value })}
                      className="w-full p-3 rounded-xl border border-indigo-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-right"
                      placeholder="التوصيل مجاني..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Logo & Icône</label>
                {tempSettings.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setTempSettings({ ...tempSettings, logoUrl: '' })}
                    className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer le logo</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                <div 
                  className="rounded-2xl bg-white border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-all"
                  style={{ 
                    width: Math.min(180, Math.max(96, (tempSettings.logoHeight || 45) * 2)), 
                    height: Math.min(140, Math.max(96, (tempSettings.logoHeight || 45) + 30)) 
                  }}
                >
                  {isProcessingLogo ? (
                    <div className="flex flex-col items-center gap-1.5 p-2">
                      <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent animate-spin rounded-full" />
                      <span className="text-[10px] text-gray-400 font-bold">Optimisation...</span>
                    </div>
                  ) : tempSettings.logoUrl ? (
                    <img 
                      src={tempSettings.logoUrl} 
                      alt="Preview" 
                      style={{ height: `${tempSettings.logoHeight || 45}px` }} 
                      className="max-w-full object-contain p-2" 
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-xs file:font-black file:bg-gray-900 file:text-white hover:file:bg-black transition-all cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="Lien URL direct du logo (https://...)..."
                    value={tempSettings.logoUrl && tempSettings.logoUrl.startsWith('data:') ? '' : tempSettings.logoUrl || ''}
                    onChange={(e) => setTempSettings({ ...tempSettings, logoUrl: e.target.value })}
                    className="w-full px-4 py-2 text-xs font-mono border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-gray-400">
                    💡 Vous pouvez uploader un fichier (PNG, JPG, SVG, WebP) ou coller une URL d'image directe. L'image sera automatiquement enregistrée dans votre base de données.
                  </p>
                </div>
              </div>

              {/* Logo Height / Size Control */}
              <div className="pt-4 border-t border-gray-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-bold text-gray-800">Taille du Logo (Hauteur)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={20}
                      max={140}
                      step={1}
                      value={tempSettings.logoHeight || 45}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setTempSettings({ ...tempSettings, logoHeight: Math.min(140, Math.max(20, val)) });
                        }
                      }}
                      className="w-16 px-2 py-1 text-center font-mono font-bold text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-500 font-semibold">px</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-gray-400 font-medium shrink-0">Petit (25px)</span>
                  <input
                    type="range"
                    min={20}
                    max={120}
                    step={1}
                    value={tempSettings.logoHeight || 45}
                    onChange={(e) => setTempSettings({ ...tempSettings, logoHeight: parseInt(e.target.value, 10) })}
                    className="w-full accent-gray-900 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                  />
                  <span className="text-[11px] text-gray-400 font-medium shrink-0">Grand (120px)</span>
                </div>

                {/* Preset quick buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-gray-400 font-semibold">Tailles rapides :</span>
                  {[
                    { label: 'Compact (35px)', val: 35 },
                    { label: 'Standard (45px)', val: 45 },
                    { label: 'Moyen (60px)', val: 60 },
                    { label: 'Grand (80px)', val: 80 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setTempSettings({ ...tempSettings, logoHeight: preset.val })}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-bold border transition-all ${
                        (tempSettings.logoHeight || 45) === preset.val
                          ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Storefront Theme Color */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Couleur du Thème Boutique (Storefront)</label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer shrink-0 transition-transform active:scale-95">
                  <div 
                    className="w-full h-full rounded-2xl flex items-center justify-center transition-all"
                    style={{ backgroundColor: tempSettings.themeColor || '#e11d48' }}
                  >
                    <span className="text-[10px] font-mono font-bold text-white drop-shadow-xs px-1 py-0.5 rounded bg-black/25">
                      {(tempSettings.themeColor || '#e11d48').toUpperCase()}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={tempSettings.themeColor?.startsWith('#') && (tempSettings.themeColor.length === 7 || tempSettings.themeColor.length === 4) ? tempSettings.themeColor : '#e11d48'}
                    onChange={(e) => {
                      const newCol = e.target.value;
                      setTempSettings({ ...tempSettings, themeColor: newCol });
                      applyStoreTheme(newCol);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={tempSettings.themeColor || '#e11d48'}
                  onChange={(e) => {
                    const newCol = e.target.value;
                    setTempSettings({ ...tempSettings, themeColor: newCol });
                    if (newCol.startsWith('#') && (newCol.length === 4 || newCol.length === 7)) {
                      applyStoreTheme(newCol);
                    }
                  }}
                  placeholder="#e11d48"
                  className="flex-1 px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Quick Color Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-gray-400 mr-1">Couleurs rapides :</span>
                {[
                  { name: 'Rose / Rouge', hex: '#e11d48' },
                  { name: 'Vert Émeraude', hex: '#059669' },
                  { name: 'Vert Menthe', hex: '#10b981' },
                  { name: 'Bleu Royal', hex: '#2563eb' },
                  { name: 'Indigo Premium', hex: '#4f46e5' },
                  { name: 'Noir Élégant', hex: '#111827' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => {
                      setTempSettings({ ...tempSettings, themeColor: color.hex });
                      applyStoreTheme(color.hex);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      (tempSettings.themeColor || '#e11d48').toLowerCase() === color.hex.toLowerCase()
                        ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: color.hex }} />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard / Admin Color */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Couleur du Dashboard & Analytics (Admin)</label>
                  <p className="text-[11px] text-gray-400">Couleur d'accentuation des boutons, onglets et graphiques du tableau de bord</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const storeCol = tempSettings.themeColor || '#e11d48';
                    setTempSettings({ ...tempSettings, dashboardColor: storeCol });
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  Synchroniser avec la boutique
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer shrink-0 transition-transform active:scale-95">
                  <div 
                    className="w-full h-full rounded-2xl flex items-center justify-center transition-all"
                    style={{ backgroundColor: tempSettings.dashboardColor || '#2563eb' }}
                  >
                    <span className="text-[10px] font-mono font-bold text-white drop-shadow-xs px-1 py-0.5 rounded bg-black/25">
                      {(tempSettings.dashboardColor || '#2563eb').toUpperCase()}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={tempSettings.dashboardColor?.startsWith('#') && (tempSettings.dashboardColor.length === 7 || tempSettings.dashboardColor.length === 4) ? tempSettings.dashboardColor : '#2563eb'}
                    onChange={(e) => {
                      const newCol = e.target.value;
                      setTempSettings({ ...tempSettings, dashboardColor: newCol });
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={tempSettings.dashboardColor || '#2563eb'}
                  onChange={(e) => {
                    const newCol = e.target.value;
                    setTempSettings({ ...tempSettings, dashboardColor: newCol });
                  }}
                  placeholder="#2563eb"
                  className="flex-1 px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Quick Presets for Dashboard */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-gray-400 mr-1">Couleurs rapides :</span>
                {[
                  { name: 'Bleu Royal (Défaut)', hex: '#2563eb' },
                  { name: 'Indigo Moderne', hex: '#4f46e5' },
                  { name: 'Vert Émeraude', hex: '#059669' },
                  { name: 'Violet Sombre', hex: '#7c3aed' },
                  { name: 'Rose Dynamique', hex: '#e11d48' },
                  { name: 'Noir Carbone', hex: '#0f172a' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => {
                      setTempSettings({ ...tempSettings, dashboardColor: color.hex });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      (tempSettings.dashboardColor || '#2563eb').toLowerCase() === color.hex.toLowerCase()
                        ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: color.hex }} />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end relative">
              {saveSuccess && (
                <div className="absolute -top-10 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-200 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Identité enregistrée !</span>
                  </div>
                </div>
              )}
              <button
                onClick={handleSave}
                className={`font-black py-4 px-10 rounded-2xl shadow-lg transition-all flex items-center gap-2 ${
                  saveSuccess 
                  ? 'bg-blue-600 text-white scale-95' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 ml-auto'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>ENREGISTRÉ !</span>
                  </>
                ) : (
                  <span>Sauvegarder les modifications</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. SLIDES VIEW
  if (activeView === 'slides') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <button onClick={() => setActiveView('selection')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-xs transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR AUX PARAMÈTRES</span>
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Bannières & Slides</h3>
                <p className="text-xs text-gray-500">Mettez en avant vos offres promotionnelles</p>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs font-black px-4 py-2 rounded-xl">
              {tempSettings.slides?.length || 0} SLIDES ACTIFS
            </span>
          </div>

          <div className="p-8 space-y-8">
            {/* Guide des Dimensions & Pixels */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-6 sm:p-7 rounded-3xl border border-amber-200/80 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-amber-950 text-base sm:text-lg flex items-center gap-2">
                      <span>Dimensions Recommandées du Banner (Pixels)</span>
                      <span className="text-[10px] bg-amber-200/80 text-amber-900 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Guide Officiel
                      </span>
                    </h4>
                    <p className="text-xs text-amber-800/80 font-medium">
                      Suivez ces dimensions pour un affichage net, haute définition et parfaitement cadré sur PC et Mobile.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-mono font-black text-amber-900 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
                    1920 × 600 px
                  </span>
                </div>
              </div>

              {/* Grid with Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {/* Format 1: Idéal */}
                <div className="bg-white/90 p-4 rounded-2xl border border-amber-200/70 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Taille Idéale (Top)</span>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">Recommandé</span>
                  </div>
                  <div className="font-mono text-lg font-black text-gray-900 tracking-tight">
                    1920 × 600 <span className="text-xs font-semibold text-gray-500">px</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Ratio cinéma (3.2:1). Qualité maximale Retina pour tous les écrans d'ordinateur et tablettes.
                  </p>
                </div>

                {/* Format 2: Standard */}
                <div className="bg-white/90 p-4 rounded-2xl border border-amber-200/70 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-extrabold text-xs">
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Alternative Standard</span>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">Équilibré</span>
                  </div>
                  <div className="font-mono text-lg font-black text-gray-900 tracking-tight">
                    1400 × 450 <span className="text-xs font-semibold text-gray-500">px</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Ou <strong>1200 × 400 px</strong>. Format plus compact idéal pour charger encore plus vite.
                  </p>
                </div>

                {/* Format 3: Mobile & Safe Area */}
                <div className="bg-white/90 p-4 rounded-2xl border border-amber-200/70 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-700 font-extrabold text-xs">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Zone de Sécurité (Safe)</span>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Mobile</span>
                  </div>
                  <div className="font-mono text-lg font-black text-gray-900 tracking-tight">
                    1000 × 400 <span className="text-xs font-semibold text-gray-500">px (Centre)</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Placez les textes et boutons au <strong>centre</strong> pour éviter qu'ils soient coupés sur smartphone.
                  </p>
                </div>
              </div>

              {/* Note / Astuce */}
              <div className="flex items-start gap-2.5 bg-amber-100/60 p-3 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px] sm:text-xs">
                  💡 <strong>Astuce Canva / Photoshop :</strong> Créez votre design personnalisé avec une taille personnalisée de <strong>1920 × 600 px</strong> en format <strong>JPG</strong> ou <strong>PNG</strong>. Le système compresse automatiquement les images pour qu'elles s'affichent instantanément.
                </p>
              </div>
            </div>

            {/* List of Slides */}
            {tempSettings.slides && tempSettings.slides.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Bannières configurées</h4>
                  <span className="text-xs text-gray-400">Ratio actif dans le store : 21:9 (Mobile) & 3.5:1 (Desktop)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {tempSettings.slides.map((slide, index) => (
                    <div key={slide.id} className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="aspect-[21/9] sm:aspect-[3.5/1] w-full relative bg-gray-900">
                        <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={() => handleRemoveSlide(slide.id)}
                            className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg cursor-pointer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SLIDE #{index + 1}</span>
                          <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">1920 × 600 px</span>
                        </div>
                        {slide.title && <h4 className="font-bold text-sm mt-1 truncate text-gray-900">{slide.title}</h4>}
                        {slide.subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{slide.subtitle}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Add Form */}
            <div className="bg-amber-50/40 p-6 sm:p-8 rounded-3xl border border-amber-200/70 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-amber-900 text-base sm:text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>Ajouter une nouvelle Bannière / Slide</span>
                </h4>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200">
                  Taille : 1920 × 600 px
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image upload and preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Image de la Bannière (1920 × 600 px)
                    </label>
                    {newSlideImage && (
                      <button
                        type="button"
                        onClick={() => setNewSlideImage('')}
                        className="text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
                      >
                        Effacer l'image
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Preview Thumbnail */}
                    <div className="w-full sm:w-44 h-24 bg-white rounded-2xl border-2 border-dashed border-amber-300 overflow-hidden shadow-xs shrink-0 flex items-center justify-center relative">
                      {isProcessingSlideImage ? (
                        <div className="flex flex-col items-center gap-1.5 p-2">
                          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent animate-spin rounded-full" />
                          <span className="text-[10px] text-amber-700 font-bold">Optimisation...</span>
                        </div>
                      ) : newSlideImage ? (
                        <img src={newSlideImage} className="w-full h-full object-cover" alt="Slide preview" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-amber-400">
                          <ImageIcon className="w-6 h-6" />
                          <span className="text-[10px] font-bold text-amber-600">Aperçu</span>
                        </div>
                      )}
                    </div>

                    {/* Inputs: File + URL */}
                    <div className="flex-1 space-y-3 w-full">
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSlideFileChange}
                          className="w-full text-xs file:bg-amber-600 file:text-white file:border-0 file:py-2.5 file:px-5 file:rounded-xl file:font-bold cursor-pointer hover:file:bg-amber-700 transition-colors"
                        />
                        <p className="text-[11px] text-amber-700/80 mt-1 font-medium">
                          Sélectionnez une image de votre appareil (Format idéal : 1920 × 600 px).
                        </p>
                      </div>

                      <div className="pt-1">
                        <input
                          type="text"
                          placeholder="Ou collez une URL directe d'image (https://...)..."
                          value={newSlideImage.startsWith('data:') ? '' : newSlideImage}
                          onChange={(e) => setNewSlideImage(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs font-mono border border-amber-200 bg-white rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details (Title, Button) */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-amber-900">Titre affiché (Optionnel)</label>
                      <input 
                        type="text" 
                        value={newSlideTitle} 
                        onChange={(e) => setNewSlideTitle(e.target.value)} 
                        className="w-full p-3 rounded-xl border border-amber-200 bg-white outline-none focus:ring-2 focus:ring-amber-500 text-xs" 
                        placeholder="Ex: Nouvelle Collection 2026" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-amber-900">Texte du Bouton (Optionnel)</label>
                      <input 
                        type="text" 
                        value={newSlideBtn} 
                        onChange={(e) => setNewSlideBtn(e.target.value)} 
                        className="w-full p-3 rounded-xl border border-amber-200 bg-white outline-none focus:ring-2 focus:ring-amber-500 text-xs" 
                        placeholder="Ex: Commander maintenant" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-amber-900">Sous-titre / Description (Optionnel)</label>
                    <input 
                      type="text" 
                      value={newSlideSubtitle} 
                      onChange={(e) => setNewSlideSubtitle(e.target.value)} 
                      className="w-full p-3 rounded-xl border border-amber-200 bg-white outline-none focus:ring-2 focus:ring-amber-500 text-xs" 
                      placeholder="Ex: Livraison express gratuite partout au Maroc !" 
                    />
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleAddSlide}
                disabled={!newSlideImage || isProcessingSlideImage}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter ce Slide au Carrousel</span>
              </button>
            </div>

            <div className="pt-4 flex justify-end relative">
              {saveSuccess && (
                <div className="absolute -top-10 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-200 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Slides enregistrés !</span>
                  </div>
                </div>
              )}
              <button 
                onClick={handleSave} 
                className={`font-black py-4 px-12 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${
                  saveSuccess 
                  ? 'bg-blue-600 text-white scale-95' 
                  : 'bg-gray-900 text-white hover:bg-black cursor-pointer'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>ENREGISTRÉ !</span>
                  </>
                ) : (
                  <span>Enregistrer les Slides</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. FORM CUSTOMIZER VIEW
  if (activeView === 'form') {
    const fields = tempSettings.checkoutFields!;
    
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <button onClick={() => setActiveView('selection')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-xs transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR AUX PARAMÈTRES</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Controls */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Personnalisation du Formulaire</h3>
                <p className="text-xs text-gray-500">Configurez les champs de commande</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {(['name', 'phone', 'city', 'address', 'notes'] as const).map((key) => {
                const field = fields[key];
                return (
                  <div key={key} className={`p-6 rounded-2xl border transition-all ${field.show ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-dashed border-gray-300 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${field.show ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                          {key === 'name' && <Type className="w-4 h-4" />}
                          {key === 'phone' && <Phone className="w-4 h-4" />}
                          {key === 'city' && <MapPin className="w-4 h-4" />}
                          {key === 'address' && <Layout className="w-4 h-4" />}
                          {key === 'notes' && <MessageSquare className="w-4 h-4" />}
                        </div>
                        <span className="font-bold text-sm capitalize">{key}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={field.show} onChange={() => toggleField(key)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                      </label>
                    </div>

                    {field.show && (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Français */}
                        <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/80">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-xs">🇫🇷</span>
                            <span className="text-[11px] font-black text-blue-900 uppercase tracking-wide">Français (FR)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Label (Titre)</label>
                              <input 
                                type="text" 
                                value={field.labelFr || field.label} 
                                onChange={(e) => updateField(key, 'labelFr', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                placeholder="Nom du champ en français"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Placeholder (Texte indicatif)</label>
                              <input 
                                type="text" 
                                value={field.placeholderFr || field.placeholder} 
                                onChange={(e) => updateField(key, 'placeholderFr', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                placeholder="Exemple ou conseil"
                              />
                            </div>
                          </div>
                        </div>

                        {/* English */}
                        <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-xs">🇬🇧</span>
                            <span className="text-[11px] font-black text-amber-900 uppercase tracking-wide">English (EN)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Field Label</label>
                              <input 
                                type="text" 
                                value={field.labelEn || ''} 
                                onChange={(e) => updateField(key, 'labelEn', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                                placeholder="e.g., Full Name *"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Placeholder Text</label>
                              <input 
                                type="text" 
                                value={field.placeholderEn || ''} 
                                onChange={(e) => updateField(key, 'placeholderEn', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                                placeholder="e.g., John Doe"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Arabe */}
                        <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200/80" dir="rtl">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-xs">🇲🇦</span>
                            <span className="text-[11px] font-black text-blue-900 uppercase tracking-wide">العربية (AR)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase text-right block">اسم الحقل (Label)</label>
                              <input 
                                type="text" 
                                value={field.labelAr || ''} 
                                onChange={(e) => updateField(key, 'labelAr', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-right bg-white"
                                placeholder="اسم الحقل بالعربية"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase text-right block">النص المساعد (Placeholder)</label>
                              <input 
                                type="text" 
                                value={field.placeholderAr || ''} 
                                onChange={(e) => updateField(key, 'placeholderAr', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-right bg-white"
                                placeholder="مثال أو توجيه"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 relative">
                {saveSuccess && (
                  <div className="absolute -top-12 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-200 shadow-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Paramètres du formulaire enregistrés avec succès !</span>
                    </div>
                  </div>
                )}
                <button 
                  onClick={handleSave} 
                  className={`w-full py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                    saveSuccess 
                    ? 'bg-blue-500 text-white scale-95 shadow-blue-200' 
                    : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>ENREGISTRÉ !</span>
                    </>
                  ) : (
                    <span>Sauvegarder la structure du formulaire</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="sticky top-8 space-y-6">
            <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="font-black text-lg">Aperçu Réel</h4>
                </div>
                <div className="flex bg-white/10 p-1 rounded-xl gap-1">
                  <button 
                    onClick={() => setPreviewLang('fr')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${previewLang === 'fr' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white'}`}
                  >
                    FR 🇫🇷
                  </button>
                  <button 
                    onClick={() => setPreviewLang('en')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${previewLang === 'en' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white'}`}
                  >
                    EN 🇬🇧
                  </button>
                  <button 
                    onClick={() => setPreviewLang('ar')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${previewLang === 'ar' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white'}`}
                  >
                    AR 🇲🇦
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 text-gray-900 shadow-inner" dir={previewLang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="space-y-4">
                  {(['name', 'phone', 'city', 'address', 'notes'] as const).map((key) => {
                    const field = fields[key];
                    const label = previewLang === 'ar' 
                      ? (field.labelAr || field.label) 
                      : previewLang === 'en' 
                      ? (field.labelEn || field.label) 
                      : (field.labelFr || field.label);
                    const placeholder = previewLang === 'ar' 
                      ? (field.placeholderAr || field.placeholder) 
                      : previewLang === 'en' 
                      ? (field.placeholderEn || field.placeholder) 
                      : (field.placeholderFr || field.placeholder);

                    return field.show ? (
                      <div key={key} className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700">
                          {label}
                        </label>
                        <div className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-400">
                          {placeholder}
                        </div>
                      </div>
                    ) : null;
                  })}
                  <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md mt-4 text-sm uppercase">
                    {previewLang === 'ar' ? 'أطلب الآن 🛒' : previewLang === 'en' ? 'Order Now 🛒' : 'Commander Maintenant 🛒'}
                  </button>
                </div>
              </div>
              
              <div className="mt-8 flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <Smartphone className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                <p className="text-xs text-gray-300 leading-relaxed">
                  Cet aperçu montre exactement comment vos clients verront le formulaire sur mobile et desktop. Les champs décochés seront totalement masqués.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
