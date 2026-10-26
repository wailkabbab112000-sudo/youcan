import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Link,
  CheckCircle2,
  Copy,
  Download,
  Send,
  AlertCircle,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Facebook,
  Database,
  Plus,
  Trash2,
  ArrowLeft,
  Tag,
  ShoppingBag,
  Filter,
  Check,
  Layers,
  Search,
  X
} from 'lucide-react';
import { GoogleSheetsConfig, GoogleSheetRule, Order, StoreSettings, CodZossConfig, Product } from '../../types';
import { syncOrderToGoogleSheet, exportOrdersToCSV, syncOrderToCodZoss } from '../../services/storage';

interface IntegrationsSettingsProps {
  config: GoogleSheetsConfig;
  onSaveConfig: (newConfig: GoogleSheetsConfig) => void;
  codZossConfig: CodZossConfig;
  onSaveCodZossConfig: (newConfig: CodZossConfig) => void;
  orders: Order[];
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  products?: Product[];
}

export const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({
  config,
  onSaveConfig,
  codZossConfig,
  onSaveCodZossConfig,
  orders,
  settings,
  onSaveSettings,
  products = [],
}) => {
  const [activeView, setActiveView] = useState<'selection' | 'pixel' | 'tiktok' | 'googleads' | 'sheets' | 'codzoss'>('selection');
  
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || '');

  const [autoSync, setAutoSync] = useState(config.autoSync || false);

  // Multi-Google Sheets Rules State
  const [rules, setRules] = useState<GoogleSheetRule[]>(() => {
    if (config.rules && config.rules.length > 0) {
      return config.rules;
    }
    return [
      {
        id: 'rule-' + Date.now(),
        name: 'Feuille Principale',
        webhookUrl: config.webhookUrl || '',
        enabled: true,
        applyToAllProducts: true,
        productIds: [],
        skus: [],
      }
    ];
  });

  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);
  const [activeProductModalRuleId, setActiveProductModalRuleId] = useState<string | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const activeRuleForModal = rules.find(r => r.id === activeProductModalRuleId);
  const filteredProductsForModal = products.filter(p => {
    if (!productSearchQuery.trim()) return true;
    const q = productSearchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
  });

  const handleSelectAllProductsForRule = (ruleId: string) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, productIds: products.map(p => p.id) } : r));
  };

  const handleDeselectAllProductsForRule = (ruleId: string) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, productIds: [] } : r));
  };
  const [ruleTestResults, setRuleTestResults] = useState<{ [ruleId: string]: { success: boolean; message: string } }>({});

  const handleAddRule = () => {
    const newRule: GoogleSheetRule = {
      id: 'rule-' + Date.now(),
      name: `Feuille Google #${rules.length + 1}`,
      webhookUrl: '',
      enabled: true,
      applyToAllProducts: true,
      productIds: [],
      skus: [],
    };
    setRules([...rules, newRule]);
  };

  const handleUpdateRule = (id: string, updatedFields: Partial<GoogleSheetRule>) => {
    setRules(rules.map(r => r.id === id ? { ...r, ...updatedFields } : r));
  };

  const handleDeleteRule = (id: string) => {
    if (rules.length <= 1) {
      setRules([{
        id: 'rule-' + Date.now(),
        name: 'Feuille Principale',
        webhookUrl: '',
        enabled: true,
        applyToAllProducts: true,
        productIds: [],
        skus: [],
      }]);
      return;
    }
    setRules(rules.filter(r => r.id !== id));
  };

  const handleToggleProductInRule = (ruleId: string, productId: string) => {
    setRules(rules.map(r => {
      if (r.id !== ruleId) return r;
      const exists = r.productIds.includes(productId);
      const newProductIds = exists
        ? r.productIds.filter(pId => pId !== productId)
        : [...r.productIds, productId];
      return { ...r, productIds: newProductIds };
    }));
  };

  const handleTestRuleSync = async (rule: GoogleSheetRule) => {
    if (!rule.webhookUrl || !rule.webhookUrl.trim()) {
      setRuleTestResults(prev => ({
        ...prev,
        [rule.id]: { success: false, message: 'Veuillez saisir une URL de Webhook valide.' }
      }));
      return;
    }

    setTestingRuleId(rule.id);
    const testOrder: Order = {
      id: 'test-order-' + rule.id,
      orderNumber: 'CMD-TEST',
      createdAt: new Date().toISOString(),
      customerName: 'Test Client (Google Sheet)',
      phone: '0600000000',
      city: 'Casablanca',
      address: 'Test Adresse',
      items: [
        {
          productId: rule.productIds[0] || 'p-test',
          productTitle: 'Produit Test Connexion',
          productImage: '',
          quantity: 1,
          price: 299,
        }
      ],
      totalPrice: 299,
      status: 'nouveau',
    };

    const success = await syncOrderToGoogleSheet(testOrder, rule.webhookUrl.trim());
    setTestingRuleId(null);

    setRuleTestResults(prev => ({
      ...prev,
      [rule.id]: {
        success,
        message: success
          ? 'Connexion réussie ! Ligne de test envoyée vers cette feuille.'
          : 'Échec de connexion. Vérifiez la configuration de votre Webhook.'
      }
    }));
  };
  
  // CodZoss Logic
  const [codZossApiToken, setCodZossApiToken] = useState(codZossConfig.apiToken || '');
  const [codZossAutoSync, setCodZossAutoSync] = useState(codZossConfig.autoSync || false);
  const [isTestingCodZoss, setIsTestingCodZoss] = useState(false);
  const [codZossTestResult, setCodZossTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [codZossSaveSuccess, setCodZossSaveSuccess] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Facebook Pixel Logic
  const [pixelIds, setPixelIds] = useState<string[]>(() => {
    if (!settings.facebookPixelId) return [''];
    const ids = settings.facebookPixelId.split(',').map(id => id.trim()).filter(id => id.length > 0);
    return ids.length > 0 ? ids : [''];
  });
  const [pixelSaveSuccess, setPixelSaveSuccess] = useState(false);

  // TikTok Pixel Logic
  const [tiktokPixelIds, setTiktokPixelIds] = useState<string[]>(() => {
    if (!settings.tiktokPixelId) return [''];
    const ids = settings.tiktokPixelId.split(',').map(id => id.trim()).filter(id => id.length > 0);
    return ids.length > 0 ? ids : [''];
  });
  const [tiktokPixelSaveSuccess, setTiktokPixelSaveSuccess] = useState(false);

  // Google Ads Pixel Logic
  const [googleAdsPixelIds, setGoogleAdsPixelIds] = useState<string[]>(() => {
    if (!settings.googleAdsPixelId) return [''];
    const ids = settings.googleAdsPixelId.split(',').map(id => id.trim()).filter(id => id.length > 0);
    return ids.length > 0 ? ids : [''];
  });
  const [googleAdsPixelSaveSuccess, setGoogleAdsPixelSaveSuccess] = useState(false);

  const handleAddPixel = () => {
    setPixelIds([...pixelIds, '']);
  };

  const handleRemovePixel = (index: number) => {
    const newList = pixelIds.filter((_, i) => i !== index);
    setPixelIds(newList.length === 0 ? [''] : newList);
  };

  const handlePixelChange = (index: number, value: string) => {
    const newList = [...pixelIds];
    newList[index] = value.replace(/[^0-9]/g, ''); // Only numbers
    setPixelIds(newList);
  };

  const handleSavePixel = (e: React.FormEvent) => {
    e.preventDefault();
    const finalIds = pixelIds.map(id => id.trim()).filter(id => id.length > 0);
    onSaveSettings({
      ...settings,
      facebookPixelId: finalIds.join(','),
    });
    setPixelSaveSuccess(true);
    setTimeout(() => setPixelSaveSuccess(false), 3000);
  };

  const handleAddTiktokPixel = () => {
    setTiktokPixelIds([...tiktokPixelIds, '']);
  };

  const handleRemoveTiktokPixel = (index: number) => {
    const newList = tiktokPixelIds.filter((_, i) => i !== index);
    setTiktokPixelIds(newList.length === 0 ? [''] : newList);
  };

  const handleTiktokPixelChange = (index: number, value: string) => {
    const newList = [...tiktokPixelIds];
    newList[index] = value.trim();
    setTiktokPixelIds(newList);
  };

  const handleSaveTiktokPixel = (e: React.FormEvent) => {
    e.preventDefault();
    const finalIds = tiktokPixelIds.map(id => id.trim()).filter(id => id.length > 0);
    onSaveSettings({
      ...settings,
      tiktokPixelId: finalIds.join(','),
    });
    setTiktokPixelSaveSuccess(true);
    setTimeout(() => setTiktokPixelSaveSuccess(false), 3000);
  };

  const handleAddGoogleAdsPixel = () => {
    setGoogleAdsPixelIds([...googleAdsPixelIds, '']);
  };

  const handleRemoveGoogleAdsPixel = (index: number) => {
    const newList = googleAdsPixelIds.filter((_, i) => i !== index);
    setGoogleAdsPixelIds(newList.length === 0 ? [''] : newList);
  };

  const handleGoogleAdsPixelChange = (index: number, value: string) => {
    const newList = [...googleAdsPixelIds];
    newList[index] = value.trim();
    setGoogleAdsPixelIds(newList);
  };

  const handleSaveGoogleAdsPixel = (e: React.FormEvent) => {
    e.preventDefault();
    const finalIds = googleAdsPixelIds.map(id => id.trim()).filter(id => id.length > 0);
    onSaveSettings({
      ...settings,
      googleAdsPixelId: finalIds.join(','),
    });
    setGoogleAdsPixelSaveSuccess(true);
    setTimeout(() => setGoogleAdsPixelSaveSuccess(false), 3000);
  };

  // Template Google Apps Script to paste into user's Google Sheet
  const appsScriptCode = `// Code Google Apps Script pour synchroniser automatiquement les commandes COD
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Si la feuille est vide, créer les en-têtes
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "N° Commande",
        "Date",
        "Nom Client",
        "Téléphone",
        "Ville",
        "Adresse",
        "Notes",
        "Produit",
        "Quantité",
        "Total (${settings.currency})",
        "Statut"
      ]);
      sheet.getRange("A1:K1").setFontWeight("bold").setBackground("#10b981").setFontColor("#ffffff");
    }
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    sheet.appendRow([
      data.orderNumber || "CMD-" + Math.floor(Math.random()*10000),
      data.date || new Date().toLocaleString("fr-FR"),
      data.customerName || "Inconnu",
      "'" + (data.phone || ""),
      data.city || "",
      data.address || "",
      data.notes || "",
      data.product || "",
      data.quantity || 1,
      data.totalPrice || "",
      data.status || "nouveau"
    ]);

    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Commande enregistrée!" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow(["ERROR", err.toString(), new Date().toLocaleString()]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Google Sheet Webhook is active and running!");
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveSheets = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      webhookUrl: rules[0]?.webhookUrl?.trim() || webhookUrl.trim(),
      autoSync: autoSync,
      rules: rules,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestSync = async () => {
    if (!webhookUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Veuillez saisir une URL de webhook Google Apps Script valide d\'abord.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const testOrder: Order = {
      id: 'test-order',
      orderNumber: 'CMD-TEST',
      createdAt: new Date().toISOString(),
      customerName: 'Test Client (Vérification Connexion)',
      phone: '0600000000',
      city: 'Casablanca',
      address: 'Test Adresse',
      items: [
        {
          productId: 'p-test',
          productTitle: 'Produit Test Connexion',
          productImage: '',
          quantity: 1,
          price: 299,
        }
      ],
      totalPrice: 299,
      status: 'nouveau',
    };

    const success = await syncOrderToGoogleSheet(testOrder, webhookUrl.trim());
    setIsTesting(false);

    if (success) {
      setTestResult({
        success: true,
        message: 'Requête envoyée avec succès au Webhook Google Apps Script ! Vérifiez votre feuille Google Sheets.',
      });
    } else {
      setTestResult({
        success: false,
        message: 'Impossible de contacter le webhook. Assurez-وز أن déploiement Apps Script est public ("Anyone").',
      });
    }
  };

  const handleSaveCodZoss = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCodZossConfig({
      ...codZossConfig,
      apiToken: codZossApiToken.trim(),
      autoSync: codZossAutoSync,
    });
    setCodZossSaveSuccess(true);
    setTimeout(() => setCodZossSaveSuccess(false), 3000);
  };

  const handleTestCodZossSync = async () => {
    if (!codZossApiToken.trim()) {
      setCodZossTestResult({
        success: false,
        message: 'Veuillez saisir votre Token API CodZoss d\'abord.',
      });
      return;
    }

    setIsTestingCodZoss(true);
    setCodZossTestResult(null);

    const testOrder: Order = {
      id: 'test-order-codzoss',
      orderNumber: 'CMD-TEST-CODZOSS',
      createdAt: new Date().toISOString(),
      customerName: 'Test CodZoss Client',
      phone: '0600000000',
      city: 'Casablanca',
      address: 'Test Adresse CodZoss',
      items: [
        {
          productId: 'p-test',
          productTitle: 'Produit Test CodZoss',
          productImage: '',
          quantity: 1,
          price: 299,
          sku: 'TEST-SKU-001',
        }
      ],
      totalPrice: 299,
      status: 'nouveau',
    };

    const success = await syncOrderToCodZoss(testOrder, codZossApiToken.trim(), settings.countryCode || 'MA');
    setIsTestingCodZoss(false);

    if (success) {
      setCodZossTestResult({
        success: true,
        message: 'Connexion réussie avec CodZoss ! La commande test a été envoyée.',
      });
    } else {
      setCodZossTestResult({
        success: false,
        message: 'Échec de la connexion. Vérifiez votre Token API CodZoss et assurez-vous qu\'il est actif.',
      });
    }
  };

  // 1. SELECTION VIEW
  if (activeView === 'selection') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-black tracking-tight">App Store & Intégrations</h2>
            <p className="text-blue-50 text-sm max-w-md">
              Connectez votre store aux meilleures applications marketing et logistiques en un clic.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Facebook Pixel Card */}
          <button
            onClick={() => setActiveView('pixel')}
            className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 opacity-50" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <h3 className="text-xl font-black mt-6 text-gray-900">Facebook Pixel</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Suivez vos conversions et optimisez vos campagnes Facebook Ads avec précision.
              </p>
              <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                <span>Configurer</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </button>

          {/* TikTok Pixel Card */}
          <button
            onClick={() => setActiveView('tiktok')}
            className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-pink-100 transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 opacity-50" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-black text-sm">TikTok</span>
              </div>
              <h3 className="text-xl font-black mt-6 text-gray-900">TikTok Pixel</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Suivez vos performances publicitaires et optimisez vos campagnes TikTok Ads.
              </p>
              <div className="mt-6 flex items-center gap-2 text-pink-600 font-bold text-xs uppercase tracking-widest">
                <span>Configurer</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </button>

          {/* Google Ads Card */}
          <button
            onClick={() => setActiveView('googleads')}
            className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-amber-100 transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 opacity-50" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <h3 className="text-xl font-black mt-6 text-gray-900">Google Ads Pixel</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Suivez les conversions et optimisez vos campagnes Google Search & Performance Max.
              </p>
              <div className="mt-6 flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest">
                <span>Configurer</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </button>

          {/* Google Sheets Card */}
          <button
            onClick={() => setActiveView('sheets')}
            className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 opacity-50" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
                  <path d="M30 4H12C9.79086 4 8 5.79086 8 8V40C8 42.2091 9.79086 44 12 44H36C38.2091 44 40 42.2091 40 40V14L30 4Z" fill="#0F9D58"/>
                  <path d="M30 4L40 14H30V4Z" fill="#076838"/>
                  <path d="M15 20H33V37H15V20Z" fill="#F1F1F1"/>
                  <path d="M15 20H33V25H15V20Z" fill="#0F9D58"/>
                  <path d="M18 22.5H30" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18 29.5H30" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18 33.5H30" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M24 20V37" stroke="#0F9D58" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-xl font-black mt-6 text-gray-900">Google Sheets</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Automatisez l'exportation de vos commandes directement dans votre tableur.
              </p>
              <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                <span>Configurer</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </button>

          {/* CodZoss Card */}
          <button
            onClick={() => setActiveView('codzoss')}
            className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 opacity-50" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black mt-6 text-gray-900">CodZoss API</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Reliez votre boutique à la plateforme CodZoss pour la gestion et confirmation des commandes.
              </p>
              <div className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                <span>Configurer</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // 2. FACEBOOK PIXEL VIEW
  if (activeView === 'pixel') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <button 
          onClick={() => setActiveView('selection')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR AUX INTÉGRATIONS</span>
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm max-w-2xl">
          <div className="p-8 border-b border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Facebook Pixel Configuration</h3>
              <p className="text-xs text-gray-500">Gérez vos identifiants de suivi publicitaire</p>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSavePixel} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">
                  Identifiants Facebook Pixels (Pixel IDs)
                </label>
                
                {pixelIds.map((id, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={id}
                        onChange={(e) => handlePixelChange(index, e.target.value)}
                        placeholder={`Pixel ID ${index + 1}`}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    {pixelIds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePixel(index)}
                        className="p-4 text-red-500 hover:bg-red-50 rounded-2xl border border-gray-100 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddPixel}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>AJOUTER UN AUTRE PIXEL</span>
                </button>
              </div>

              {pixelSaveSuccess && (
                <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Tous les Pixels ont été enregistrés avec succès !</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <span>Mettre à jour la configuration</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. TIKTOK PIXEL VIEW
  if (activeView === 'tiktok') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <button 
          onClick={() => setActiveView('selection')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR AUX INTÉGRATIONS</span>
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm max-w-2xl">
          <div className="p-8 border-b border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-md">
              <span className="text-white font-black text-xs">TikTok</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">TikTok Pixel Configuration</h3>
              <p className="text-xs text-gray-500">Gérez vos identifiants de suivi publicitaire TikTok</p>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSaveTiktokPixel} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">
                  Identifiants TikTok Pixels (Pixel IDs)
                </label>
                
                {tiktokPixelIds.map((id, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={id}
                        onChange={(e) => handleTiktokPixelChange(index, e.target.value)}
                        placeholder={`TikTok Pixel ID (ex: C...) ${index + 1}`}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-mono focus:ring-2 focus:ring-pink-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    {tiktokPixelIds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTiktokPixel(index)}
                        className="p-4 text-red-500 hover:bg-red-50 rounded-2xl border border-gray-100 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddTiktokPixel}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-400 hover:border-pink-400 hover:text-pink-500 hover:bg-pink-50/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>AJOUTER UN AUTRE PIXEL TIKTOK</span>
                </button>
              </div>

              {tiktokPixelSaveSuccess && (
                <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Configuration TikTok Pixel enregistrée avec succès !</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <span>Mettre à jour la configuration</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 4. GOOGLE ADS PIXEL VIEW
  if (activeView === 'googleads') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <button 
          onClick={() => setActiveView('selection')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR AUX INTÉGRATIONS</span>
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm max-w-2xl">
          <div className="p-8 border-b border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Google Ads Conversion ID Configuration</h3>
              <p className="text-xs text-gray-500">Gérez vos identifiants Google Tag / Google Ads (ex: AW-XXXXXXXXX)</p>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSaveGoogleAdsPixel} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">
                  Google Ads Conversion IDs (ex: AW-123456789)
                </label>
                
                {googleAdsPixelIds.map((id, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={id}
                        onChange={(e) => handleGoogleAdsPixelChange(index, e.target.value)}
                        placeholder={`AW-XXXXXXXXX ${index + 1}`}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    {googleAdsPixelIds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGoogleAdsPixel(index)}
                        className="p-4 text-red-500 hover:bg-red-50 rounded-2xl border border-gray-100 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddGoogleAdsPixel}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-400 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>AJOUTER UN AUTRE GOOGLE ADS ID</span>
                </button>
              </div>

              {googleAdsPixelSaveSuccess && (
                <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Configuration Google Ads enregistrée avec succès !</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <span>Mettre à jour la configuration</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 5. GOOGLE SHEETS VIEW
  if (activeView === 'sheets') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <button 
          onClick={() => setActiveView('selection')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR AUX INTÉGRATIONS</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Info & Global Auto Sync */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
                    <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none">
                      <path d="M30 4H12C9.79086 4 8 5.79086 8 8V40C8 42.2091 9.79086 44 12 44H36C38.2091 44 40 42.2091 40 40V14L30 4Z" fill="#0F9D58"/>
                      <path d="M30 4L40 14H30V4Z" fill="#076838"/>
                      <path d="M15 20H33V37H15V20Z" fill="#F1F1F1"/>
                      <path d="M15 20H33V25H15V20Z" fill="#0F9D58"/>
                      <path d="M18 22.5H30" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M18 29.5H30" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M18 33.5H30" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M24 20V37" stroke="#0F9D58" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Google Sheets Multi-Intégration</h3>
                    <p className="text-xs text-gray-500">Affectez chaque produit ou SKU à sa propre feuille Google Sheet</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 rounded-2xl bg-blue-50/50 border border-blue-100/60">
                <div>
                  <span className="font-bold text-sm text-blue-950 block">Auto-Sync Automatique (Temps Réel)</span>
                  <span className="text-xs text-blue-800">Synchroniser les nouvelles commandes dès leur réception sur le store.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>

            {/* Configured Sheet Rules Form */}
            <form onSubmit={handleSaveSheets} className="space-y-6">
              {rules.map((rule, index) => (
                <div key={rule.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm p-6 md:p-8 space-y-6 relative transition-all">
                  {/* Rule Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                      <span className="w-8 h-8 rounded-xl bg-gray-900 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => handleUpdateRule(rule.id, { name: e.target.value })}
                        placeholder="Nom de la feuille (ex: Feuille Smartwatches)"
                        className="font-black text-base md:text-lg text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-600 focus:outline-none px-1 py-0.5 w-full"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateRule(rule.id, { enabled: !rule.enabled })}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                          rule.enabled
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-blue-600' : 'bg-gray-400'}`} />
                        <span>{rule.enabled ? 'Actif' : 'Inactif'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Supprimer cette feuille"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rule Webhook Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      URL du Web App Google Apps Script
                    </label>
                    <input
                      type="url"
                      value={rule.webhookUrl}
                      onChange={(e) => handleUpdateRule(rule.id, { webhookUrl: e.target.value })}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Product Filtering Option */}
                  <div className="space-y-4 pt-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <Filter className="w-4 h-4 text-blue-600" />
                      <span>Affectation des produits envoyés vers cette feuille</span>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Option 1: All products */}
                      <label
                        className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                          rule.applyToAllProducts
                            ? 'border-blue-600 bg-blue-50/30 text-blue-950 shadow-xs'
                            : 'border-gray-100 bg-gray-50 hover:bg-gray-100/80 text-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`product-filter-${rule.id}`}
                          checked={rule.applyToAllProducts}
                          onChange={() => handleUpdateRule(rule.id, { applyToAllProducts: true })}
                          className="mt-1 accent-blue-600"
                        />
                        <div>
                          <span className="font-bold text-xs block">Tous les produits (Feuille Globale)</span>
                          <span className="text-[11px] text-gray-500">Toutes les commandes reçues seront enregistrées dans cette feuille.</span>
                        </div>
                      </label>

                      {/* Option 2: Filtered by product or SKU */}
                      <label
                        className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                          !rule.applyToAllProducts
                            ? 'border-blue-600 bg-blue-50/30 text-blue-950 shadow-xs'
                            : 'border-gray-100 bg-gray-50 hover:bg-gray-100/80 text-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`product-filter-${rule.id}`}
                          checked={!rule.applyToAllProducts}
                          onChange={() => handleUpdateRule(rule.id, { applyToAllProducts: false })}
                          className="mt-1 accent-blue-600"
                        />
                        <div>
                          <span className="font-bold text-xs block">Filtrer par Produit spécifique ou SKU</span>
                          <span className="text-[11px] text-gray-500">Seules les commandes contenant les produits ou SKUs sélectionnés iront ici.</span>
                        </div>
                      </label>
                    </div>

                    {/* Specific product selection sub-panel */}
                    {!rule.applyToAllProducts && (
                      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-5 animate-in fade-in duration-200">
                        {/* Catalog Products Checklist Trigger & Selected Chips */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                              <span>1. Produits du catalogue à inclure :</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveProductModalRuleId(rule.id);
                                setProductSearchQuery('');
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Sélectionner des produits ({rule.productIds.length})</span>
                            </button>
                          </div>

                          {/* Display ONLY selected products in clean compact cards */}
                          {rule.productIds.length === 0 ? (
                            <div
                              onClick={() => {
                                setActiveProductModalRuleId(rule.id);
                                setProductSearchQuery('');
                              }}
                              className="p-5 bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 text-center cursor-pointer transition-all space-y-1"
                            >
                              <p className="text-xs font-bold text-gray-700">Aucun produit sélectionné pour cette feuille.</p>
                              <p className="text-[11px] text-blue-700 font-semibold underline">Cliquez ici pour ouvrir le catalogue et sélectionner vos produits.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {products.filter(p => rule.productIds.includes(p.id)).map((prod) => {
                                const imageSrc = prod.images && prod.images.length > 0 ? prod.images[0] : null;

                                return (
                                  <div
                                    key={prod.id}
                                    className="flex items-center justify-between gap-3 p-2.5 bg-white rounded-2xl border border-blue-300 shadow-2xs group"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                        {imageSrc ? (
                                          <img src={imageSrc} alt={prod.title} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ShoppingBag className="w-4 h-4" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-900 truncate">{prod.title}</p>
                                        <p className="text-[10px] text-blue-700 font-extrabold">
                                          {prod.price} {settings.currency || 'DH'}
                                          {prod.sku ? ` • SKU: ${prod.sku}` : ''}
                                        </p>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleToggleProductInRule(rule.id, prod.id)}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex-shrink-0"
                                      title="Retirer"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Custom SKUs text field */}
                        <div className="space-y-2 pt-2 border-t border-gray-200/60">
                          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-blue-600" />
                            <span>2. SKUs spécifiques (séparés par des virgules) :</span>
                          </span>
                          <input
                            type="text"
                            value={(rule.skus || []).join(', ')}
                            onChange={(e) => {
                              const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              handleUpdateRule(rule.id, { skus: list });
                            }}
                            placeholder="Ex: SKU-WATCH-01, SKU-ROBE-02"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                          <p className="text-[10px] text-gray-500 italic">
                            Astuce: Vous pouvez renseigner des codes SKU personnalisés. Dès qu'un produit commandé comporte ce SKU, la commande est transmise à cette feuille.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Test Webhook per rule */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleTestRuleSync(rule)}
                      disabled={testingRuleId === rule.id}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 border border-blue-200 transition-colors cursor-pointer"
                    >
                      {testingRuleId === rule.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-blue-800 border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Tester cette feuille</span>
                    </button>

                    {ruleTestResults[rule.id] && (
                      <span className={`text-xs font-bold ${
                        ruleTestResults[rule.id].success ? 'text-blue-600' : 'text-rose-600'
                      }`}>
                        {ruleTestResults[rule.id].message}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Add New Rule Button */}
              <button
                type="button"
                onClick={handleAddRule}
                className="w-full py-4 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 text-blue-800 font-extrabold text-xs rounded-3xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une autre feuille Google Sheet</span>
              </button>

              {saveSuccess && (
                <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 text-sm font-bold rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <span>Toutes vos configurations Google Sheets ont été sauvegardées avec succès !</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-lg transition-all text-sm cursor-pointer"
              >
                Enregistrer toutes les configurations Google Sheets
              </button>
            </form>

            {/* Guide Card */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <span>Guide d'installation pas à pas (Google Apps Script)</span>
                </h3>
                <button
                  onClick={handleCopyCode}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedCode ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copié !' : 'Copier le Code Script'}</span>
                </button>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {[
                    "Créez votre feuille Google Sheets.",
                    "Allez dans Extensions > Apps Script.",
                    "Collez le script ci-contre.",
                    "Déployez en tant que 'Web App' avec accès 'Anyone'."
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-black flex items-center justify-center flex-shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-gray-600 font-medium pt-1.5">{step}</p>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <pre className="bg-gray-900 text-blue-400 p-6 rounded-2xl text-[10px] font-mono h-48 border border-gray-800 overflow-y-auto">
                    {appsScriptCode}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl space-y-4">
              <Sparkles className="w-10 h-10 opacity-60" />
              <h4 className="text-lg font-black">Pourquoi séparer par feuille ?</h4>
              <p className="text-sm text-blue-100 leading-relaxed">
                Envoyez automatiquement les commandes de chaque produit au fournisseur ou livreur concerné sans mélanger vos données.
              </p>
              <div className="pt-2 text-xs text-blue-200 border-t border-blue-500/50 space-y-2">
                <p className="font-bold text-white">Exemple pratique :</p>
                <p>• <strong>Feuille 1:</strong> Produits High-Tech (SKU-WATCH) → Transmise à l'équipe High-Tech</p>
                <p>• <strong>Feuille 2:</strong> Cosmétiques (SKU-BEAUTY) → Transmise au fournisseur Cosmétique</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Selection Modal Overlay */}
        {activeProductModalRuleId && activeRuleForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">
                      Sélectionner les produits du catalogue
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {activeRuleForModal.name} ({activeRuleForModal.productIds.length} produit(s) sélectionné(s))
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveProductModalRuleId(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Search & Bulk Selection Actions */}
              <div className="p-5 border-b border-gray-100 space-y-3 bg-white">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit par nom ou SKU..."
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  {productSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setProductSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500 font-medium">
                    {filteredProductsForModal.length} produit(s) trouvé(s)
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectAllProductsForRule(activeRuleForModal.id)}
                      className="font-extrabold text-blue-700 hover:underline cursor-pointer"
                    >
                      Tout cocher
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleDeselectAllProductsForRule(activeRuleForModal.id)}
                      className="font-extrabold text-gray-500 hover:text-gray-800 hover:underline cursor-pointer"
                    >
                      Tout décocher
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Product List */}
              <div className="p-6 overflow-y-auto flex-1 max-h-[50vh] space-y-2.5">
                {filteredProductsForModal.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs italic">
                    {products.length === 0 ? 'Aucun produit dans le catalogue.' : 'Aucun produit ne correspond à votre recherche.'}
                  </div>
                ) : (
                  filteredProductsForModal.map((prod) => {
                    const isChecked = activeRuleForModal.productIds.includes(prod.id);
                    const imageSrc = prod.images && prod.images.length > 0 ? prod.images[0] : null;

                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleToggleProductInRule(activeRuleForModal.id, prod.id)}
                        className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-blue-50/70 border-blue-500 text-blue-950 shadow-2xs'
                            : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 shadow-2xs">
                            {imageSrc ? (
                              <img src={imageSrc} alt={prod.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <p className="text-xs font-extrabold text-gray-900 truncate">{prod.title}</p>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                                {prod.price} {settings.currency || 'DH'}
                              </span>
                              {prod.sku && (
                                <span className="font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200">
                                  SKU: {prod.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white shadow-xs' : 'border-gray-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">
                  {activeRuleForModal.productIds.length} produit(s) sélectionné(s)
                </span>

                <button
                  type="button"
                  onClick={() => setActiveProductModalRuleId(null)}
                  className="bg-gray-900 hover:bg-black text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  Valider la sélection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. CODZOSS VIEW
  if (activeView === 'codzoss') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <button 
          onClick={() => setActiveView('selection')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR AUX INTÉGRATIONS</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Intégration CodZoss</h3>
                  <p className="text-xs text-gray-500">Envoyez vos commandes automatiquement à CodZoss</p>
                </div>
              </div>
              
              <div className="p-8">
                <form onSubmit={handleSaveCodZoss} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Token API CodZoss
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={codZossApiToken}
                        onChange={(e) => setCodZossApiToken(e.target.value)}
                        placeholder="Ex: 1e6a9074..."
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 italic mt-1">
                      Retrouvez ce token dans votre panel CodZoss → API Integration → Authentication.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100">
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">Auto-Sync CodZoss</span>
                      <span className="text-xs text-gray-500">Chaque nouvelle commande est créée sur CodZoss.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={codZossAutoSync}
                        onChange={(e) => setCodZossAutoSync(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  {codZossSaveSuccess && (
                    <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-2xl flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Configuration CodZoss enregistrée !</span>
                    </div>
                  )}

                  {codZossTestResult && (
                    <div className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
                      codZossTestResult.success ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-rose-50 border-rose-100 text-rose-800'
                    }`}>
                      {codZossTestResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <span className="font-medium">{codZossTestResult.message}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-lg transition-all"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={handleTestCodZossSync}
                      disabled={isTestingCodZoss}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-8 rounded-2xl flex items-center gap-2 transition-all border border-indigo-100"
                    >
                      {isTestingCodZoss ? <div className="w-4 h-4 border-2 border-indigo-700 border-t-transparent animate-spin rounded-full" /> : <Send className="w-4 h-4" />}
                      <span>Tester Connexion</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Quick API Reference */}
            <div className="bg-gray-900 text-white rounded-3xl p-8 border border-gray-800 shadow-sm space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-indigo-400">
                <Link className="w-4 h-4" />
                <span>Format de l'API (POST orders-create)</span>
              </h4>
              <p className="text-[10px] text-gray-400">Voici les données qui seront envoyées à CodZoss :</p>
              <pre className="text-[10px] font-mono bg-black/30 p-4 rounded-xl text-gray-300 overflow-x-auto">
{`{
  "api_token": "VOTRE_TOKEN",
  "recipient": "Nom du Client",
  "phone": "Numéro de téléphone",
  "city": "Ville",
  "address": "Adresse complète",
  "items": [
    { "product_title": "Nom Produit", "quantity": 1, "price": 299 }
  ]
}`}
              </pre>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl">
              <Database className="w-10 h-10 mb-6 opacity-50" />
              <h4 className="text-lg font-black mb-2">Sync CodZoss</h4>
              <p className="text-sm text-indigo-100 leading-relaxed">
                Connectez votre boutique à la plateforme CodZoss pour automatiser la confirmation et le suivi de vos commandes COD.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
