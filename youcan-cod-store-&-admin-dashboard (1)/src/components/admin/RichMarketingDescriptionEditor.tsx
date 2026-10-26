import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Image as ImageIcon,
  CheckCircle,
  Edit3,
  Upload,
  Link,
  Sparkles,
  ShieldCheck,
  Plus,
  X,
  Code,
  Trash2,
  Maximize2
} from 'lucide-react';

interface RichMarketingDescriptionEditorProps {
  description: string;
  onChangeDescription: (val: string) => void;
  descriptionAr: string;
  onChangeDescriptionAr: (val: string) => void;
  availableGalleryImages?: string[];
  activeLanguage?: 'ar' | 'fr' | 'en';
}

export const RichMarketingDescriptionEditor: React.FC<RichMarketingDescriptionEditorProps> = ({
  description,
  onChangeDescription,
  descriptionAr,
  onChangeDescriptionAr,
  availableGalleryImages = [],
  activeLanguage = 'ar',
}) => {
  // Current language tab: Arabic or French/English (syncs with activeLanguage when changed in dashboard)
  const [currentLang, setCurrentLang] = useState<'ar' | 'fr' | 'en'>(activeLanguage);

  useEffect(() => {
    if (activeLanguage) {
      setCurrentLang(activeLanguage);
    }
  }, [activeLanguage]);

  // Editor mode: 'visual' (WYSIWYG - directly renders images & styles) or 'code' (raw HTML)
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');

  // Image insertion modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageSourceTab, setImageSourceTab] = useState<'url' | 'gallery' | 'upload'>('url');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');
  const [imageAlignment, setImageAlignment] = useState<'full' | 'center'>('full');

  // Dropdowns
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#059669');
  const [showSizePicker, setShowSizePicker] = useState(false);

  // Ref to the visual contentEditable div
  const visualEditorRef = useRef<HTMLDivElement | null>(null);
  // Saved selection range to restore after interacting with modal/toolbar
  const savedSelectionRef = useRef<Range | null>(null);
  // Track last known value to prevent cursor-jumping re-renders
  const lastVisualHtmlRef = useRef<string>('');

  // Selected image block in visual editor & floating toolbar position
  const [selectedImageBlock, setSelectedImageBlock] = useState<HTMLElement | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);

  const currentText = currentLang === 'ar' ? descriptionAr : description;
  const setCurrentText = currentLang === 'ar' ? onChangeDescriptionAr : onChangeDescription;
  const isAr = currentLang === 'ar';
  const isEn = currentLang === 'en';

  // Save current cursor selection in the visual editor
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && visualEditorRef.current?.contains(sel.anchorNode)) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Restore cursor selection in visual editor
  const restoreSelection = () => {
    if (savedSelectionRef.current && visualEditorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
  };

  // Calculate floating toolbar position relative to visualEditorRef
  const updateToolbarPosition = (block: HTMLElement | null) => {
    if (!block || !visualEditorRef.current) {
      setToolbarPosition(null);
      return;
    }
    const editorRect = visualEditorRef.current.getBoundingClientRect();
    const blockRect = block.getBoundingClientRect();

    const relativeTop = blockRect.top - editorRect.top + visualEditorRef.current.scrollTop;
    const relativeLeft = blockRect.left - editorRect.left;

    setToolbarPosition({
      top: Math.max(8, relativeTop - 46),
      left: Math.max(8, relativeLeft + (blockRect.width / 2) - 130),
    });
  };

  // Mark image block as selected
  const selectImageBlock = (block: HTMLElement | null) => {
    if (visualEditorRef.current) {
      visualEditorRef.current.querySelectorAll('.selected-image-active').forEach((el) => {
        el.classList.remove('selected-image-active');
      });
    }

    if (block) {
      block.classList.add('selected-image-active');
      setSelectedImageBlock(block);
      updateToolbarPosition(block);
    } else {
      setSelectedImageBlock(null);
      setToolbarPosition(null);
    }
  };

  // Delete selected image
  const handleDeleteSelectedImage = () => {
    if (!selectedImageBlock) return;
    const blockToDelete = selectedImageBlock.closest('.editor-image-block') || selectedImageBlock;
    blockToDelete.remove();
    setSelectedImageBlock(null);
    setToolbarPosition(null);
    handleVisualInput();
  };

  // Resize selected image
  const handleResizeSelectedImage = (widthPercent: '100%' | '80%' | '50%') => {
    if (!selectedImageBlock) return;
    const img = selectedImageBlock.tagName === 'IMG'
      ? (selectedImageBlock as HTMLImageElement)
      : selectedImageBlock.querySelector('img');

    if (img) {
      img.style.width = widthPercent;
      img.style.maxWidth = widthPercent === '100%' ? '100%' : widthPercent === '80%' ? '520px' : '320px';
      handleVisualInput();
      setTimeout(() => updateToolbarPosition(selectedImageBlock), 50);
    }
  };

  // Click handler inside editor to detect image selection
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // ONLY select if clicked directly on an IMG tag
    if (target.tagName === 'IMG') {
      const block = (target.closest('.editor-image-block') as HTMLElement) || target;
      selectImageBlock(block);
      return;
    }

    // Clicked anywhere else (text, paragraph, line, container) -> immediately clear selection
    if (!target.closest('.image-floating-toolbar')) {
      selectImageBlock(null);
    }
  };

  // Keyboard handler on editor
  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    if (selectedImageBlock) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        e.stopPropagation();
        handleDeleteSelectedImage();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        selectImageBlock(null);
        return;
      }
      // When typing any character/phrase or space, immediately deselect image so toolbar disappears
      selectImageBlock(null);
    }
    saveSelection();
  };

  // Scroll handler to keep floating toolbar attached
  const handleEditorScroll = () => {
    if (selectedImageBlock) {
      updateToolbarPosition(selectedImageBlock);
    }
  };

  // Get clean HTML without temporary editor selection styling
  const getCleanHtml = () => {
    if (!visualEditorRef.current) return '';
    const clone = visualEditorRef.current.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.selected-image-active').forEach((el) => {
      el.classList.remove('selected-image-active');
    });
    return clone.innerHTML;
  };

  // Sync content into visualEditorRef when language changes or when editor mode switches
  useEffect(() => {
    if (visualEditorRef.current && editorMode === 'visual') {
      let htmlToSet = currentText || '';
      // Clean up legacy frozen attributes
      htmlToSet = htmlToSet
        .replace(/contenteditable="false"/gi, '')
        .replace(/user-select:\s*none;?/gi, '');

      // If plain text with newlines and no HTML tags, convert newlines to <p>
      if (htmlToSet && !/<\/?[a-z][\s\S]*>/i.test(htmlToSet)) {
        htmlToSet = htmlToSet
          .split('\n\n')
          .map((para) => `<p style="margin-bottom: 8px;">${para.replace(/\n/g, '<br>')}</p>`)
          .join('');
      }
      
      if (visualEditorRef.current.innerHTML !== htmlToSet) {
        visualEditorRef.current.innerHTML = htmlToSet;
        lastVisualHtmlRef.current = htmlToSet;
      }
    }
  }, [currentLang, editorMode]);

  // Execute formatting commands directly on the visual editor
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (visualEditorRef.current) {
      visualEditorRef.current.focus();
      restoreSelection();
      document.execCommand(command, false, value);
      handleVisualInput();
    }
  };

  // When user types or mutates content in visual editor
  const handleVisualInput = () => {
    if (selectedImageBlock) {
      selectImageBlock(null);
    }
    if (visualEditorRef.current) {
      const cleanHtml = getCleanHtml();
      lastVisualHtmlRef.current = cleanHtml;
      setCurrentText(cleanHtml);
      saveSelection();
    }
  };

  // Apply Font Size Heading (H2, H3, P, Small)
  const applyFontSize = (type: 'h2' | 'h3' | 'p' | 'small') => {
    setShowSizePicker(false);
    if (!visualEditorRef.current) return;
    visualEditorRef.current.focus();
    restoreSelection();

    if (type === 'h2') {
      document.execCommand('formatBlock', false, '<h2>');
    } else if (type === 'h3') {
      document.execCommand('formatBlock', false, '<h3>');
    } else if (type === 'p') {
      document.execCommand('formatBlock', false, '<p>');
    } else if (type === 'small') {
      const sel = window.getSelection();
      if (sel && sel.toString()) {
        const span = document.createElement('small');
        span.style.color = '#6b7280';
        span.style.fontSize = '13px';
        span.textContent = sel.toString();
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(span);
      }
    }
    handleVisualInput();
  };

  // Apply Color
  const applyColor = (colorHex: string) => {
    setShowColorPicker(false);
    executeCommand('foreColor', colorHex);
  };

  // Apply Highlight
  const applyHighlight = (bg: string = '#fef08a') => {
    executeCommand('hiliteColor', bg);
  };

  // Insert Feature List with Green Checkmarks
  const insertFeatureList = () => {
    const listHtml = isEn
      ? `<ul style="margin: 12px 0; padding-left: 20px; list-style-type: none; border-left: 3px solid #10b981;">
  <li style="margin: 6px 0;">✅ <strong>Premium Quality:</strong> Robust materials and premium finish.</li>
  <li style="margin: 6px 0;">✅ <strong>Easy to Use:</strong> Immediate and seamless daily experience.</li>
  <li style="margin: 6px 0;">✅ <strong>Peace of Mind Guarantee:</strong> Fast shipping and cash on delivery after checking.</li>
</ul><p><br></p>`
      : isAr
      ? `<ul style="margin: 12px 0; padding-right: 20px; list-style-type: none; border-right: 3px solid #10b981;">
  <li style="margin: 6px 0;">✅ <strong>ميزة حصرية:</strong> جودة تصنيع أصلية ومقاومة عالية.</li>
  <li style="margin: 6px 0;">✅ <strong>سهولة الاستخدام:</strong> يعمل بكفاءة تامة من أول استعمال.</li>
  <li style="margin: 6px 0;">✅ <strong>ضمان الجودة:</strong> توصيل سريع مع المعاينة قبل الدفع.</li>
</ul><p><br></p>`
      : `<ul style="margin: 12px 0; padding-left: 20px; list-style-type: none; border-left: 3px solid #10b981;">
  <li style="margin: 6px 0;">✅ <strong>Qualité Supérieure :</strong> Matériaux robustes et finition premium.</li>
  <li style="margin: 6px 0;">✅ <strong>Facile à Utiliser :</strong> Prise en main immédiate au quotidien.</li>
  <li style="margin: 6px 0;">✅ <strong>Garantie Sérénité :</strong> Livraison express et paiement après vérification.</li>
</ul><p><br></p>`;
    
    if (editorMode === 'visual' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      restoreSelection();
      document.execCommand('insertHTML', false, listHtml);
      handleVisualInput();
    } else {
      setCurrentText(currentText + `\n${listHtml}`);
    }
  };

  // Insert Callout Box
  const insertCalloutBox = (type: 'guarantee' | 'warning') => {
    let boxHtml = '';
    if (type === 'guarantee') {
      boxHtml = isEn
        ? `<div style="background-color: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 12px; padding: 14px; margin: 16px 0; text-align: center;">
  <strong style="color: #065f46; font-size: 16px; display: block; margin-bottom: 4px;">🛡️ 100% Satisfaction or Money-Back Guarantee</strong>
  <p style="color: #047857; margin: 0; font-size: 13px;">Open the parcel upon delivery, verify your item before paying the delivery agent.</p>
</div><p><br></p>`
        : isAr
        ? `<div style="background-color: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 12px; padding: 14px; margin: 16px 0; text-align: center;">
  <strong style="color: #065f46; font-size: 16px; display: block; margin-bottom: 4px;">🛡️ ضمان الرضا 100% أو استرجاع أموالك</strong>
  <p style="color: #047857; margin: 0; font-size: 13px;">يمكنك فحص المنتج بنفسك عند وصول الموزع والدفع بعد التأكد التام من الجودة.</p>
</div><p><br></p>`
        : `<div style="background-color: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 12px; padding: 14px; margin: 16px 0; text-align: center;">
  <strong style="color: #065f46; font-size: 16px; display: block; margin-bottom: 4px;">🛡️ Garantie 100% Satisfait ou Remboursé</strong>
  <p style="color: #047857; margin: 0; font-size: 13px;">Ouvrez le colis à la livraison, vérifiez votre produit avant de régler au livreur.</p>
</div><p><br></p>`;
    } else {
      boxHtml = isEn
        ? `<div style="background-color: #fff7ed; border: 2px solid #fed7aa; border-radius: 12px; padding: 14px; margin: 16px 0; text-align: center;">
  <strong style="color: #9a3412; font-size: 15px; display: block; margin-bottom: 4px;">⚠️ Warning: Extremely Limited Stock</strong>
  <p style="color: #c2410c; margin: 0; font-size: 13px;">High demand today. Order yours right now before it sells out.</p>
</div><p><br></p>`
        : isAr
        ? `<div style="background-color: #fff7ed; border: 2px solid #fed7aa; border-radius: 12px; padding: 14px; margin: 16px 0; text-align: center;">
  <strong style="color: #9a3412; font-size: 15px; display: block; margin-bottom: 4px;">⚠️ تنبيه: الكمية المتوفرة محدودة جداً</strong>
  <p style="color: #c2410c; margin: 0; font-size: 13px;">الطلب كبير على هذا المنتج، سارع بحجز طلبك الآن قبل نفاد المخزون!</p>
</div><p><br></p>`
        : `<div style="background-color: #fff7ed; border: 2px solid #fed7aa; border-radius: 12px; padding: 14px; margin: 16px 0; text-align: center;">
  <strong style="color: #9a3412; font-size: 15px; display: block; margin-bottom: 4px;">⚠️ Attention : Stocks Très Limités</strong>
  <p style="color: #c2410c; margin: 0; font-size: 13px;">Forte demande aujourd'hui. Commandez dès maintenant avant la rupture définitive.</p>
</div><p><br></p>`;
    }

    if (editorMode === 'visual' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      restoreSelection();
      document.execCommand('insertHTML', false, boxHtml);
      handleVisualInput();
    } else {
      setCurrentText(currentText + `\n${boxHtml}`);
    }
  };

  // INSERT IMAGE DIRECTLY VISIBLE IN EDITOR (NO CODE!)
  const handleConfirmInsertImage = (src: string, caption: string = '') => {
    if (!src) return;

    const widthStyle = imageAlignment === 'center' ? 'width: 95%; max-width: 95%;' : 'width: 100%; max-width: 100%;';
    const captionHtml = caption
      ? `<div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 6px; font-weight: 500;">${caption}</div>`
      : '';

    // Create visually rendered image block directly - non-editable container so text cursor remains in text paragraphs
    const imgHtml = `<div class="editor-image-block" contenteditable="false" style="text-align: center; margin: 16px 0; position: relative; width: 100%;">
  <img src="${src}" alt="Demo visual" style="${widthStyle} border-radius: 12px; margin: 0 auto; display: block; cursor: pointer; object-fit: cover;" />
  ${captionHtml}
</div><p><br></p>`;

    if (editorMode === 'visual' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      restoreSelection();
      // Directly insert image HTML so it's instantly rendered as an actual image!
      document.execCommand('insertHTML', false, imgHtml);
      handleVisualInput();
    } else {
      // If in code mode
      setCurrentText((currentText || '') + `\n${imgHtml}\n`);
    }

    setShowImageModal(false);
    setImageUrlInput('');
    setImageCaptionInput('');
  };

  // Local Image Upload via FileReader
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        handleConfirmInsertImage(result, imageCaptionInput);
      }
    };
    reader.readAsDataURL(file);
  };

  // Sample COD Product Images / GIFs
  const sampleCodImages = [
    {
      titleAr: 'صورة توضيحية لكيفية العمل',
      titleFr: 'Démonstration du fonctionnement',
      titleEn: 'Demo of how it works',
      url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    },
    {
      titleAr: 'التغليف الفاخر والشكل الحقيقي',
      titleFr: 'Packaging premium & vue réelle',
      titleEn: 'Premium packaging & real product',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    },
    {
      titleAr: 'ختم الجودة والضمان الأصلي',
      titleFr: 'Garantie de qualité & authenticité',
      titleEn: 'Quality and authentic warranty',
      url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-500/30 p-5 sm:p-6 shadow-xs space-y-4" id="rich-marketing-description-section">
      
      {/* Header & Language Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>
              {isEn
                ? 'Rich Marketing Description (Visual WYSIWYG Editor)'
                : isAr
                ? 'الوصف التسويقي التفاعلي (محرر مرئي مباشر)'
                : 'Description Marketing Visuelle (Éditeur WYSIWYG)'}
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEn
              ? 'Direct visual editor (WYSIWYG): Write, format, and insert visuals with live preview and no coding'
              : isAr
              ? 'محرر مرئي مباشر (WYSIWYG): اكتب ونسّق وشاهد الصور تظهر مباشرة أمامك دون أي أكواد'
              : 'Éditeur visuel direct (WYSIWYG) : Rédigez, mettez en forme et insérez vos visuels sans aucun code'}
          </p>
        </div>

        {/* Language Tabs & Modes */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Indicator synced with chosen product page language */}
          <div className="flex items-center gap-1.5">
            <span
              className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 ${
                isAr
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              <span>
                {isEn
                  ? 'English Description (LTR)'
                  : isAr
                  ? 'الوصف بالعربية (RTL)'
                  : 'Description en Français (LTR)'}
              </span>
            </span>
          </div>

          {/* Editor Mode: Visual (Default) vs Code */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setEditorMode('visual')}
              title={isEn ? 'Direct Visual Mode' : isAr ? 'الوضع المرئي المباشر' : 'Mode Visuel direct'}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                editorMode === 'visual'
                  ? 'bg-white text-blue-700 shadow-xs font-black'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>{isEn ? 'Visual' : isAr ? 'مرئي (Visuel)' : 'Visuel'}</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorMode('code')}
              title={isEn ? 'HTML Source Code Mode' : isAr ? 'وضع كود HTML المصدري' : 'Mode Code HTML'}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                editorMode === 'code'
                  ? 'bg-white text-gray-900 shadow-xs font-black'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>
          </div>
        </div>
      </div>

      {/* RICH VISUAL TOOLBAR - COMPREHENSIVE & TALL */}
      <div className="bg-gray-50/95 border border-gray-200 rounded-xl p-2.5 sm:p-3 flex items-center flex-wrap gap-2 sticky top-20 z-10 backdrop-blur-xs shadow-2xs">
          
          {/* GROUP 1: FONT SIZE / HEADINGS */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowSizePicker(!showSizePicker);
              }}
              className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title={isEn ? 'Font size and headings' : isAr ? 'حجم الخط والعناوين' : 'Taille de police et titres'}
            >
              <Type className="w-3.5 h-3.5 text-blue-600" />
              <span>{isEn ? 'Font Size' : isAr ? 'حجم الخط' : 'Taille de police'}</span>
            </button>

            {showSizePicker && (
              <div className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-30 space-y-1">
                <button
                  type="button"
                  onClick={() => applyFontSize('h2')}
                  className={`w-full ${isAr ? 'text-right' : 'text-left'} px-3 py-1.5 rounded-lg hover:bg-blue-50 text-xs font-black text-gray-900 flex items-center justify-between cursor-pointer`}
                >
                  <span className="text-blue-700 font-bold text-sm">H2</span>
                  <span>{isEn ? 'Large Main Heading' : isAr ? 'عنوان رئيسي كبير' : 'Grand titre principal'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyFontSize('h3')}
                  className={`w-full ${isAr ? 'text-right' : 'text-left'} px-3 py-1.5 rounded-lg hover:bg-blue-50 text-xs font-bold text-gray-800 flex items-center justify-between cursor-pointer`}
                >
                  <span className="text-blue-700 font-bold text-xs">H3</span>
                  <span>{isEn ? 'Medium Subheading' : isAr ? 'عنوان فرعي متوسط' : 'Sous-titre moyen'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyFontSize('p')}
                  className={`w-full ${isAr ? 'text-right' : 'text-left'} px-3 py-1.5 rounded-lg hover:bg-blue-50 text-xs text-gray-700 flex items-center justify-between cursor-pointer`}
                >
                  <span className="text-gray-400">P</span>
                  <span>{isEn ? 'Normal text' : isAr ? 'نص عادي' : 'Texte normal'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyFontSize('small')}
                  className={`w-full ${isAr ? 'text-right' : 'text-left'} px-3 py-1.5 rounded-lg hover:bg-blue-50 text-xs text-gray-500 flex items-center justify-between cursor-pointer`}
                >
                  <span className="text-gray-400">Sm</span>
                  <span>{isEn ? 'Small text / Note' : isAr ? 'نص صغير / ملاحظة' : 'Texte discret / Note'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-gray-300" />

          {/* GROUP 2: TEXT STYLES (BOLD, ITALIC, UNDERLINE, HIGHLIGHT) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-lg text-xs font-black flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title={isEn ? 'Bold (Ctrl+B)' : isAr ? 'عريض (Ctrl+B)' : 'Gras (Ctrl+B)'}
            >
              <Bold className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isEn ? 'Bold' : isAr ? 'عريض' : 'Gras'}</span>
            </button>

            <button
              type="button"
              onClick={() => executeCommand('italic')}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-lg text-xs italic flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title={isEn ? 'Italic (Ctrl+I)' : isAr ? 'مائل (Ctrl+I)' : 'Italique (Ctrl+I)'}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => executeCommand('underline')}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-lg text-xs underline flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title={isEn ? 'Underline (Ctrl+U)' : isAr ? 'مسطر (Ctrl+U)' : 'Souligné (Ctrl+U)'}
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => applyHighlight('#fef08a')}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title={isEn ? 'Yellow highlight' : isAr ? 'تظليل فسفوري أصفر' : 'Surligner en jaune'}
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">{isEn ? 'Highlight' : isAr ? 'تظليل' : 'Surligner'}</span>
            </button>
          </div>

          <div className="h-5 w-px bg-gray-300" />

          {/* GROUP 3: TEXT COLORS */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowColorPicker(!showColorPicker);
              }}
              className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title={isEn ? 'Text color' : isAr ? 'ألوان النص' : 'Couleur du texte'}
            >
              <Palette className="w-3.5 h-3.5 text-rose-600" />
              <span>{isEn ? 'Colors' : isAr ? 'الألوان' : 'Couleurs'}</span>
            </button>

            {showColorPicker && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-30 space-y-2.5">
                <p className="text-[11px] font-bold text-gray-600">
                  {isEn
                    ? 'Choose color for selected text:'
                    : isAr
                    ? 'اختر لون الكتابة المحدد :'
                    : 'Choisissez la couleur du texte sélectionné :'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyColor('#059669')}
                    className="p-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>{isEn ? 'Green' : isAr ? 'أخضر' : 'Vert'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyColor('#dc2626')}
                    className="p-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full bg-rose-600" />
                    <span>{isEn ? 'Red' : isAr ? 'أحمر' : 'Rouge'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyColor('#2563eb')}
                    className="p-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>{isEn ? 'Blue' : isAr ? 'أزرق' : 'Bleu'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyColor('#d97706')}
                    className="p-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>{isEn ? 'Orange' : isAr ? 'برتقالي' : 'Orange'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyColor('#111827')}
                    className="p-1.5 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-900 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full bg-gray-900" />
                    <span>{isEn ? 'Black' : isAr ? 'أسود' : 'Noir'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyColor('#7c3aed')}
                    className="p-1.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full bg-purple-600" />
                    <span>{isEn ? 'Purple' : isAr ? 'بنفسجي' : 'Violet'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-semibold">
                    {isEn ? 'Custom color:' : isAr ? 'لون مخصص:' : 'Couleur personnalisée :'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-7 h-7 rounded border border-gray-300 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => applyColor(customColor)}
                      className="px-2.5 py-1 text-xs bg-gray-900 text-white font-bold rounded cursor-pointer"
                    >
                      {isEn ? 'Apply' : isAr ? 'تطبيق' : 'Appliquer'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-gray-300" />

          {/* GROUP 4: ALIGNMENT */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => executeCommand('justifyRight')}
              className="p-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs cursor-pointer shadow-2xs"
              title={isEn ? 'Align Right' : isAr ? 'محاذاة لليمين' : 'Aligner à droite'}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyCenter')}
              className="p-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs cursor-pointer shadow-2xs"
              title={isEn ? 'Center text' : isAr ? 'توسيط النص' : 'Centrer le texte'}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyLeft')}
              className="p-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs cursor-pointer shadow-2xs"
              title={isEn ? 'Align Left' : isAr ? 'محاذاة لليسار' : 'Aligner à gauche'}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-gray-300" />

          {/* GROUP 5: MARKETING ELEMENTS */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={insertFeatureList}
              className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title={
                isEn
                  ? 'Insert feature list with green checkmarks'
                  : isAr
                  ? 'إدراج قائمة مميزات مع علامات صح خضراء'
                  : "Insérer une liste d'avantages avec coches vertes"
              }
            >
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>{isEn ? 'Feature List' : isAr ? 'قائمة مميزات' : "Liste d'avantages"}</span>
            </button>

            <button
              type="button"
              onClick={() => insertCalloutBox('guarantee')}
              className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 rounded-lg text-xs font-bold hidden sm:flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title={
                isEn
                  ? 'Insert peace of mind guarantee box'
                  : isAr
                  ? 'إدراج مربع ضمان المعاينة'
                  : 'Insérer un encadré de garantie'
              }
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{isEn ? 'Guarantee Box' : isAr ? 'ضمان المعاينة' : 'Garantie Sérénité'}</span>
            </button>
          </div>

          <div className="h-5 w-px bg-gray-300" />

          {/* GROUP 6: INSERT VISUAL PHOTO (DIRECTLY EMBEDDED IN EDITOR) */}
          <button
            type="button"
            onClick={() => {
              saveSelection();
              setShowImageModal(true);
            }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ring-2 ring-blue-500/20"
            id="insert-description-photo-btn"
          >
            <ImageIcon className="w-4 h-4" />
            <span>
              {isEn
                ? '+ Insert photo in description'
                : isAr
                ? '+ إضافة صورة في الوصف'
                : '+ Insérer photo dans la description'}
            </span>
          </button>

          {/* DYNAMIC BUTTON: DELETE SELECTED PHOTO */}
          {selectedImageBlock && (
            <button
              type="button"
              onClick={handleDeleteSelectedImage}
              className="px-3 py-1.5 bg-gray-800 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              id="delete-selected-photo-btn"
              title={
                isEn
                  ? 'Delete selected photo (or Backspace / Del)'
                  : isAr
                  ? 'حذف الصورة المحددة (أو مفتاح Backspace / Suppr)'
                  : 'Supprimer la photo sélectionnée (ou touche Backspace / Suppr)'
              }
            >
              <Trash2 className="w-4 h-4" />
              <span>{isEn ? 'Delete photo' : isAr ? 'مسح الصورة' : 'Supprimer la photo'}</span>
            </button>
          )}

        </div>

      {/* EDITING CONTAINER */}
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span className="font-bold flex items-center gap-1.5 text-gray-700">
            <span>
              {isEn
                ? 'Editing Canvas (English Description)'
                : isAr
                ? 'مساحة التحرير (الوصف بالعربية)'
                : 'Espace de Rédaction (Français)'}
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {editorMode === 'visual'
                ? isEn
                  ? 'Visual Mode (WYSIWYG) - Live Preview'
                  : isAr
                  ? 'وضع مرئي مباشر (WYSIWYG) - الصور تظهر فوراً'
                  : 'Mode Visuel (WYSIWYG) - Aperçu direct'
                : isEn
                ? 'HTML Source Code Mode'
                : isAr
                ? 'وضع الكود المصدري (HTML)'
                : 'Mode Code Source (HTML)'}
            </span>
          </span>
          <span className="text-[11px] text-gray-400">
            {editorMode === 'visual'
              ? isEn
                ? '💡 Write and add photos with live visual display'
                : isAr
                ? '💡 اكتب وأضف الصور لتظهر حقيقية أمامك'
                : '💡 Rédigez et ajoutez des photos visibles en direct'
              : isEn
              ? 'HTML Code'
              : isAr
              ? 'كود HTML'
              : 'Code HTML'}
          </span>
        </div>

            {/* VISUAL WYSIWYG EDITOR (Active by default) */}
            {editorMode === 'visual' ? (
              <div className="relative">
                {/* Floating quick action bar when an image is selected */}
                {selectedImageBlock && toolbarPosition && (
                  <div
                    className="image-floating-toolbar absolute z-30 flex items-center gap-1.5 p-1.5 bg-gray-950/95 text-white rounded-xl shadow-2xl border border-gray-700 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150"
                    style={{
                      top: `${Math.max(8, toolbarPosition.top)}px`,
                      left: `${Math.max(8, toolbarPosition.left)}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={handleDeleteSelectedImage}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      title={isEn ? 'Delete photo (Backspace / Del)' : isAr ? 'حذف الصورة (Backspace / Suppr)' : 'Supprimer la photo (Backspace / Suppr)'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Delete' : isAr ? 'مسح الصورة' : 'Supprimer'}</span>
                    </button>

                    <div className="h-4 w-px bg-gray-700" />

                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-300 px-1">
                      <span className="text-gray-400 text-[10px]">{isEn ? 'Width:' : isAr ? 'العرض:' : 'Largeur :'}</span>
                      <button
                        type="button"
                        onClick={() => handleResizeSelectedImage('100%')}
                        className="px-1.5 py-0.5 hover:bg-gray-800 rounded cursor-pointer"
                        title={isEn ? '100% Full width' : isAr ? '100% عرض كامل' : '100% Pleine largeur'}
                      >
                        100%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResizeSelectedImage('80%')}
                        className="px-1.5 py-0.5 hover:bg-gray-800 rounded cursor-pointer"
                        title={isEn ? '80% Centered' : isAr ? '80% ممركزة' : '80% Centrée'}
                      >
                        80%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResizeSelectedImage('50%')}
                        className="px-1.5 py-0.5 hover:bg-gray-800 rounded cursor-pointer"
                        title={isEn ? '50% Compact' : isAr ? '50% مدمجة' : '50% Compacte'}
                      >
                        50%
                      </button>
                    </div>

                    <div className="h-4 w-px bg-gray-700" />

                    <button
                      type="button"
                      onClick={() => selectImageBlock(null)}
                      className="p-1 text-gray-400 hover:text-white rounded cursor-pointer"
                      title={isEn ? 'Deselect' : isAr ? 'إلغاء التحديد' : 'Désélectionner'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div
                  ref={visualEditorRef}
                  contentEditable={true}
                  dir={isAr ? 'rtl' : 'ltr'}
                  onFocus={() => selectImageBlock(null)}
                  onInput={handleVisualInput}
                  onClick={handleEditorClick}
                  onKeyDown={handleEditorKeyDown}
                  onScroll={handleEditorScroll}
                  onKeyUp={saveSelection}
                  onMouseUp={saveSelection}
                  className={`rich-description-area w-full p-5 rounded-xl border-2 border-blue-500/30 bg-white text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-inner text-gray-800 min-h-[380px] max-h-[700px] overflow-y-auto ${
                    isAr ? 'font-arabic text-right' : 'text-left'
                  }`}
                  style={{ outline: 'none' }}
                  data-placeholder={
                    isEn
                      ? 'Write your product details and benefits here... and click "+ Insert photo in description" to embed visuals directly!'
                      : isAr
                      ? 'اكتب هنا تفاصيل ومميزات المنتج... واضغط على "+ إضافة صورة في الوصف" لتظهر الصور والتوضيحات مباشرة داخل هذا الحقل!'
                      : 'Rédigez ici la description et cliquez sur "+ Insérer photo dans la description" pour insérer des visuels directement dans cette zone !'
                  }
                />
              </div>
            ) : (
              /* RAW CODE EDITOR (If user explicitly switched to HTML) */
              <textarea
                dir="ltr"
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                rows={16}
                className="w-full p-4 rounded-xl border border-gray-300 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-gray-900 text-blue-400 min-h-[380px]"
              />
            )}

            <div className="text-[11px] text-gray-500 pt-1">
              <span>
                {editorMode === 'visual'
                  ? isEn
                    ? '✨ Complete control: Click any photo to select, resize, or delete it using the Delete button or Backspace key.'
                    : isAr
                    ? '✨ تحكم كامل: اضغط على أي صورة لاختيارها وحذفها عبر زر (مسح الصورة) أو زر Backspace / Suppr في لوحة المفاتيح.'
                    : '✨ Contrôle complet : Cliquez sur une photo pour la sélectionner, la redimensionner ou la supprimer.'
                  : isEn
                  ? 'You are in raw HTML code mode.'
                  : isAr
                  ? 'أنت في وضع كود HTML المصدري.'
                  : 'Vous êtes en mode code HTML.'}
              </span>
            </div>
          </div>

      {/* MODAL: INSERT PHOTO / GIF DIRECTLY */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  <span>
                    {isEn
                      ? 'Insert image or GIF into description'
                      : isAr
                      ? 'إدراج صورة أو GIF مباشرة في الوصف'
                      : 'Insérer une image ou GIF dans la description'}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEn
                    ? 'The visual will render directly in your content area'
                    : isAr
                    ? 'ستظهر الصورة بشكل مرئي مباشر داخل مساحة الكتابة'
                    : "L'image s'affichera directement dans votre texte"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setImageSourceTab('url')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  imageSourceTab === 'url' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Link className="w-3.5 h-3.5 text-blue-600" />
                <span>{isEn ? 'Image / GIF URL' : isAr ? 'رابط URL صورة أو GIF' : 'Lien URL Image / GIF'}</span>
              </button>

              {availableGalleryImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setImageSourceTab('gallery')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    imageSourceTab === 'gallery' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {isEn
                      ? `Product Photos (${availableGalleryImages.length})`
                      : isAr
                      ? `صور المنتج (${availableGalleryImages.length})`
                      : `Photos du produit (${availableGalleryImages.length})`}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setImageSourceTab('upload')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  imageSourceTab === 'upload' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>{isEn ? 'Upload from device' : isAr ? 'تحميل من جهازك' : "Importer depuis l'appareil"}</span>
              </button>
            </div>

            {/* TAB 1: URL INPUT */}
            {imageSourceTab === 'url' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isEn
                      ? 'Direct image or animated GIF link (URL):'
                      : isAr
                      ? 'رابط الصورة أو الجيف (URL) :'
                      : "Lien direct de l'image ou GIF animé (URL) :"}
                  </label>
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://media.giphy.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Quick Sample Presets */}
                <div>
                  <span className="text-[11px] font-bold text-gray-500 block mb-1.5">
                    {isEn ? 'Or select a demo illustration:' : isAr ? 'أو اختر من النماذج الجاهزة :' : 'Ou sélectionnez un modèle d’illustration :'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {sampleCodImages.map((sImg, sIdx) => (
                      <div
                        key={sIdx}
                        onClick={() => setImageUrlInput(sImg.url)}
                        className={`p-2 rounded-xl border cursor-pointer transition-all text-center space-y-1.5 ${
                          imageUrlInput === sImg.url
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <img
                          src={sImg.url}
                          alt="Demo"
                          className="w-full h-16 object-cover rounded-lg"
                        />
                        <p className="text-[10px] font-bold text-gray-700 line-clamp-1">
                          {isEn ? sImg.titleEn : isAr ? sImg.titleAr : sImg.titleFr}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SELECT FROM PRODUCT GALLERY */}
            {imageSourceTab === 'gallery' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600 font-medium">
                  {isEn
                    ? 'Select a photo from your product gallery to embed into the description:'
                    : isAr
                    ? 'اختر أي صورة من صور المنتج لإدراجها مباشرة داخل الوصف:'
                    : 'Sélectionnez une photo de votre galerie produit à insérer dans la description :'}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {availableGalleryImages.map((gImg, gIdx) => (
                    <div
                      key={gIdx}
                      onClick={() => setImageUrlInput(gImg)}
                      className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-square ${
                        imageUrlInput === gImg
                          ? 'border-blue-600 ring-4 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={gImg} alt={`Gallery ${gIdx}`} className="w-full h-full object-cover" />
                      {imageUrlInput === gImg && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white drop-shadow" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: UPLOAD FROM LOCAL DEVICE */}
            {imageSourceTab === 'upload' && (
              <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-6 text-center space-y-3 transition-colors bg-gray-50/50">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">
                    {isEn ? 'Choose an image from your phone or computer' : isAr ? 'اختر صورة من هاتفك أو حاسوبك' : 'Sélectionnez une photo depuis votre appareil'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isEn ? 'JPG, PNG, WebP or animated GIF' : isAr ? 'JPG, PNG, WebP أو GIF متحرك' : 'JPG, PNG, WebP ou GIF animé'}
                  </p>
                </div>
                <label className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm transition-all">
                  <span>{isEn ? 'Browse and select' : isAr ? 'تصفح واختيار الصورة' : 'Parcourir et sélectionner'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLocalImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* IMAGE PREVIEW & OPTIONS */}
            {imageUrlInput && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={imageUrlInput}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-300 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {isEn ? 'Photo ready to insert' : isAr ? 'صورة جاهزة للإدراج' : 'Photo prête à être insérée'}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{imageUrlInput}</p>
                  </div>
                </div>

                {/* Display Width Setting */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/80">
                  <span className="text-xs font-bold text-gray-700">
                    {isEn ? 'Display width on page:' : isAr ? 'عرض الصورة في الصفحة:' : "Largeur d'affichage sur la page :"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImageAlignment('full')}
                      className={`text-xs px-3 py-1 rounded-lg border font-bold cursor-pointer ${
                        imageAlignment === 'full'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {isEn ? 'Full width (100%)' : isAr ? 'عرض كامل (100%)' : 'Pleine largeur (100%)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageAlignment('center')}
                      className={`text-xs px-3 py-1 rounded-lg border font-bold cursor-pointer ${
                        imageAlignment === 'center'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {isEn ? 'Centered (85%)' : isAr ? 'متوسطة ممركزة (85%)' : 'Centrée (85%)'}
                    </button>
                  </div>
                </div>

                {/* Optional Caption */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {isEn ? 'Caption under image (Optional):' : isAr ? 'تعليق توضيحي تحت الصورة (اختياري) :' : 'Légende sous l’image (Optionnel) :'}
                  </label>
                  <input
                    type="text"
                    value={imageCaptionInput}
                    onChange={(e) => setImageCaptionInput(e.target.value)}
                    placeholder={
                      isEn
                        ? 'Ex: Real view of product upon arrival'
                        : isAr
                        ? 'مثال: صورة حقيقية للمنتج عند الاستلام'
                        : 'Ex: Vue réelle du produit à la réception'
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                {isEn ? 'Cancel' : isAr ? 'إلغاء' : 'Annuler'}
              </button>

              <button
                type="button"
                disabled={!imageUrlInput}
                onClick={() => handleConfirmInsertImage(imageUrlInput, imageCaptionInput)}
                className={`px-5 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  imageUrlInput
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{isEn ? 'Insert photo' : isAr ? 'إدراج الصورة مباشرة' : "Insérer l'image"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

