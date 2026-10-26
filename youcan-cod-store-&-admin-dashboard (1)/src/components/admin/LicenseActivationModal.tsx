import React, { useState } from 'react';
import { KeyRound, ShieldCheck, AlertCircle, CheckCircle2, Sparkles, Lock } from 'lucide-react';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onActivate: (key: string) => void;
  currentLicenseKey?: string;
  isLicensed?: boolean;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  isOpen,
  onActivate,
  currentLicenseKey,
  isLicensed
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanInput = keyInput.trim();
      
      if (cleanInput.length < 5) {
        setError('Clé de licence invalide. Veuillez entrer une clé valide fournie par le créateur.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onActivate(cleanInput);
      }, 800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 md:p-10 shadow-2xl relative space-y-8 border border-gray-100 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/30">
            <KeyRound className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Activation Officielle de la Boutique</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
            Activation de la Licence Hostinger
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            Pour activer votre application e-commerce sur votre hébergement Hostinger et déverrouiller toutes les fonctionnalités, veuillez entrer votre clé de licence unique.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6 relative z-10">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold p-4 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-blue-600" />
              <span>Licence activée avec succès ! Chargement de votre boutique...</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              <span>Clé de Licence (License Key)</span>
              <span className="text-[11px] text-gray-400 font-normal">Fournie par votre fournisseur</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Ex: PRO-STORE-2026-XXXX"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 text-sm font-mono font-bold text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all placeholder:font-sans placeholder:font-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-black py-4 rounded-2xl text-base shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Activer la Boutique Maintenant</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center relative z-10">
          <p className="text-xs text-gray-400">
            Besoin d'aide ou d'une clé de licence ? Contactez le support technique ou votre revendeur officiel.
          </p>
        </div>
      </div>
    </div>
  );
};
