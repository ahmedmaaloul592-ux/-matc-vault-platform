import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsView() {
    const { user } = useAuth();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
            <div>
                <h2 className="text-3xl font-black text-white uppercase italic mb-2">Paramètres du Compte</h2>
                <p className="text-slate-400 font-medium">Gérez vos informations personnelles et préférences</p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-6">
                <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Nom Complet</label>
                    <input
                        type="text"
                        defaultValue={user?.name}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Email</label>
                    <input
                        type="email"
                        defaultValue={user?.email}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-2">L'adresse email ne peut pas être modifiée.</p>
                </div>

                <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Mot de passe</label>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-colors">
                        Changer le mot de passe
                    </button>
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors">
                        Enregistrer
                    </button>
                </div>
            </div>

            <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-8">
                <h3 className="text-rose-400 font-bold mb-2">Zone de Danger</h3>
                <p className="text-slate-400 text-sm mb-4">La suppression du compte est irréversible et effacera toutes vos données.</p>
                <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-bold transition-colors">
                    Supprimer mon compte
                </button>
            </div>
        </div>
    );
}
