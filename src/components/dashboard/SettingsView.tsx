import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsView() {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [country, setCountry] = useState(user?.country || '');
    const [paymentMethods, setPaymentMethods] = useState(user?.paymentMethods || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUser({ name, phone, country, paymentMethods, bio });
            alert('Paramètres enregistrés avec succès !');
        } catch (error: any) {
            alert('Erreur: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
            <div>
                <h2 className="text-3xl font-black text-white uppercase italic mb-2">Paramètres du Compte</h2>
                <p className="text-slate-400 font-medium">Gérez vos informations personnelles et préférences</p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Nom Complet</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Votre nom"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Téléphone</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+216 ..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Email (Non modifiable)</label>
                    <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Pays / Région</label>
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Ex: Tunisie"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>

                {(user?.role === 'RESELLER_T1' || user?.role === 'RESELLER_T2') && (
                    <div className="pt-6 border-t border-white/10 space-y-6">
                        <div>
                            <label className="block text-indigo-400 text-xs font-black uppercase tracking-widest mb-4 italic">Biographie Professionnelle (Public sur la page d'accueil)</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Ex: Expert en QHSE avec 10 ans d'expérience, certifié MATC..."
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-medium text-sm"
                            />
                            <p className="text-[10px] text-slate-500 mt-2 italic">* Cette description sera visible par tout le monde sur la plateforme.</p>
                        </div>

                        <div>
                            <label className="block text-amber-500 text-xs font-black uppercase tracking-widest mb-4 italic">Configuration des Paiements (Public pour vos élèves)</label>
                            <textarea
                                value={paymentMethods}
                                onChange={(e) => setPaymentMethods(e.target.value)}
                                placeholder="Ex: Payez par D17 sur le numéro 22XXXXXX ou Flouci..."
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-medium text-sm"
                            />
                            <p className="text-[10px] text-slate-500 mt-2 italic">* Ces informations s'afficheront à vos élèves lorsqu'ils tenteront d'activer une licence.</p>
                        </div>
                    </div>
                )}

                <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </div>

            {!user?.email?.includes('demo') && (
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-8">
                    <h3 className="text-rose-400 font-bold mb-2">Zone de Danger</h3>
                    <p className="text-slate-400 text-sm mb-4">La suppression du compte est irréversible et effacera toutes vos données.</p>
                    <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-bold transition-colors">
                        Supprimer mon compte
                    </button>
                </div>
            )}
        </div>
    );
}
