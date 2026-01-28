import React, { useState } from 'react';
import { useLicenses } from '@/hooks/useLicenses';
import { useAuth } from '@/contexts/AuthContext';

export default function PartnerView({ activeTab }: { activeTab: string }) {
    const { user } = useAuth();
    const { licenses, stats, loading, createLicenses, activateLicense } = useLicenses();

    // State for activation modal
    const [showActivate, setShowActivate] = useState(false);
    const [selectedKey, setSelectedKey] = useState('');
    const [learnerData, setLearnerData] = useState({ name: '', email: '', phone: '' });
    const [processing, setProcessing] = useState(false);

    // State for buying licenses
    const [showBuy, setShowBuy] = useState(false);
    const [buyQuantity, setBuyQuantity] = useState(5);

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await activateLicense(selectedKey, learnerData.email, learnerData.name, learnerData.phone);
            setShowActivate(false);
            setLearnerData({ name: '', email: '', phone: '' });
            alert('Licence activée avec succès!');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleBuy = async () => {
        setProcessing(true);
        try {
            // For demo purposes, price is fixed 5€
            await createLicenses(buyQuantity, 5);
            setShowBuy(false);
            alert(`${buyQuantity} licences ajoutées à votre stock!`);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setProcessing(false);
        }
    };

    if (activeTab === 'overview') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">Tableau de Bord Partenaire</h2>
                        <p className="text-slate-400 font-medium">Gérez votre activité commerciale et vos licences</p>
                    </div>
                    <button
                        onClick={() => setShowBuy(true)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Acheter du Stock
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Total Licences" value={stats.total} color="indigo" icon="Key" />
                    <StatCard label="Disponibles" value={stats.available} color="emerald" icon="Check" />
                    <StatCard label="Activées" value={stats.used} color="amber" icon="User" />
                    <StatCard label="Revenus Est." value={`${stats.used * 35}€`} color="rose" icon="Dollar" />
                </div>

                {/* Recent Licenses */}
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                    <h3 className="text-xl font-black text-white uppercase italic mb-6">Licences Récentes</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="pb-4 pl-4 font-bold">Clé de Licence</th>
                                    <th className="pb-4 font-bold">Statut</th>
                                    <th className="pb-4 font-bold">Apprenant</th>
                                    <th className="pb-4 font-bold">Date d'Activation</th>
                                    <th className="pb-4 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {licenses.slice(0, 5).map((license) => (
                                    <tr key={license._id} className="text-slate-300 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 pl-4 font-mono text-sm">{license.key}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${license.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    license.status === 'USED' ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-rose-500/20 text-rose-400'
                                                }`}>
                                                {license.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm">{license.learner?.name || '-'}</td>
                                        <td className="py-4 text-sm">
                                            {license.activationDate ? new Date(license.activationDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="py-4">
                                            {license.status === 'AVAILABLE' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedKey(license.key);
                                                        setShowActivate(true);
                                                    }}
                                                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                                                >
                                                    Activer
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {licenses.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-500 italic">Aucune licence trouvée</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Generic content for other tabs
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
                <h3 className="text-xl font-black text-white uppercase italic mb-2">Section {activeTab}</h3>
                <p className="text-slate-400">En cours de développement.</p>
            </div>
        </div>
    );

    // Helper Components
    function StatCard({ label, value, color, icon }: any) {
        return (
            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl group hover:bg-white/[0.05] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${color}-500/20 text-${color}-400 group-hover:scale-110 transition-transform`}>
                        {/* Simple Icons based on name */}
                        <div className="w-6 h-6 bg-current opacity-50 rounded" />
                    </div>
                    <span className={`text-${color}-400 text-xs font-black uppercase tracking-wider bg-${color}-500/10 px-2 py-1 rounded-lg`}>
                        +12%
                    </span>
                </div>
                <div className="text-3xl font-black text-white mb-1">{value}</div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</div>
            </div>
        );
    }
}
