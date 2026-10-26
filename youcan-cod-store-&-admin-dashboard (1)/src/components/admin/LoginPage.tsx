import React, { useState } from 'react';
import { Lock, Mail, Key, LogIn, Store, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabaseLogin } from '../../services/supabase';

interface LoginPageProps {
  onLoginSuccess: (user: { id: string; email: string }) => void;
  onBackToStore: () => void;
  lang?: 'ar' | 'fr' | 'en';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Veuillez saisir votre adresse email et votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      const result = await supabaseLogin(email.trim(), password.trim());

      if (result.success && result.user) {
        setSuccessMessage(result.message || 'Connexion réussie !');
        setTimeout(() => {
          onLoginSuccess({
            id: result.user.id,
            email: result.user.email || email.trim(),
          });
        }, 500);
      } else if (result.success) {
        // Fallback user ID based on email
        const cleanUser = {
          id: email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
          email: email.trim(),
        };
        onLoginSuccess(cleanUser);
      } else {
        setErrorMessage(
          result.message || 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans dir-ltr" dir="ltr">
      {/* Ambient background blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 relative z-10">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-teal-400 text-white shadow-lg shadow-blue-500/20 mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Espace d'Administration
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Connectez-vous pour gérer votre boutique en ligne</span>
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 text-red-300 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3 text-blue-300 text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Adresse Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@domaine.com"
                className="w-full bg-slate-900/80 border border-slate-700 focus:border-blue-500 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900/80 border border-slate-700 focus:border-blue-500 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-500"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Se Connecter</span>
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
          <p className="text-slate-400 text-xs leading-relaxed">
            Chaque compte possède sa propre boutique dédiée, avec un catalogue de produits et des commandes totalement indépendants.
          </p>

          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={onBackToStore}
              className="text-slate-400 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>Voir la boutique</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
