import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminView({ activeTab }: { activeTab: string }) {
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bundles, setBundles] = useState<any[]>([]);
    const [showAddBundle, setShowAddBundle] = useState(false);
    const [newBundleData, setNewBundleData] = useState({
        title: '',
        description: '',
        category: 'Archive',
        resourceType: 'COURSE_SERIES',
        documentFormat: 'PDF',
        price: 0,
        thumbnail: '',
        externalLink: '',
        isDemo: false,
        sessions: [] as { title: string; videoUrl: string; supportUrl: string; }[],
        stats: { videoHours: 0, documentCount: 0, sessionCount: 0, hasLiveSupport: false },
        provider: { name: 'MATC Expert', type: 'Expert' }
    });
    const [processing, setProcessing] = useState(false);
    const [contentFilter, setContentFilter] = useState<'ALL' | 'OFFICIAL' | 'DEMO'>('ALL');

    const [users, setUsers] = useState<any[]>([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUserData, setNewUserData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT',
        phone: '',
        country: '',
        isDemo: false,
        paymentMethods: ''
    });

    useEffect(() => {
        if (activeTab === 'admin-overview' && token) {
            fetchStats();
        }
        if (activeTab === 'content' && token) {
            fetchBundles();
        }
        if (activeTab === 'users' && token) {
            fetchUsers();
        }
    }, [activeTab, token]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBundles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bundles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setBundles(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBundle = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const res = await fetch('/api/bundles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newBundleData)
            });
            const data = await res.json();
            if (res.ok) {
                setShowAddBundle(false);
                setNewBundleData({
                    title: '',
                    description: '',
                    category: 'Archive',
                    resourceType: 'COURSE_SERIES',
                    documentFormat: 'PDF',
                    price: 0,
                    thumbnail: '',
                    externalLink: '',
                    isDemo: false,
                    sessions: [],
                    stats: { videoHours: 0, documentCount: 0, sessionCount: 0, hasLiveSupport: false },
                    provider: { name: 'MATC Expert', type: 'Expert' }
                });
                fetchBundles();
            } else {
                const errorMsg = data.errors ? `${data.message}: ${data.errors.join(', ')}` : (data.message || 'Erreur lors de la création');
                alert(errorMsg);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const toggleDemo = async (bundleId: string, currentVal: boolean) => {
        try {
            await fetch(`/api/bundles/${bundleId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isDemo: !currentVal })
            });
            fetchBundles();
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (activeTab === 'admin-overview') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase italic mb-2">Administration Centrale</h2>
                    <p className="text-slate-400 font-medium">Vue d'ensemble de l'écosystème MATC Vault</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}
                    </div>
                ) : stats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Utilisateurs Total"
                            value={stats.users.total}
                            sub={`${stats.users.breakdown.STUDENT || 0} Apprenants`}
                            color="indigo"
                        />
                        <StatCard
                            label="Modules Techniques"
                            value={stats.content.bundles}
                            sub="Catalogue Actif"
                            color="emerald"
                        />
                        <StatCard
                            label="Licences Vendues"
                            value={stats.sales.licenses}
                            sub={`${stats.sales.active} Actives`}
                            color="amber"
                        />
                        <StatCard
                            label="Bundles Contenu"
                            value={stats.content.bundles}
                            sub="Formations & Docs"
                            color="rose"
                        />
                    </div>
                ) : null}

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                        <h3 className="text-xl font-black text-white uppercase italic mb-6">Distribution Utilisateurs</h3>
                        {stats && (
                            <div className="space-y-4">
                                <BarItem label="Administrateurs" count={stats.users.breakdown.ADMIN || 0} total={stats.users.total} color="bg-rose-500" />
                                <BarItem label="Providers" count={stats.users.breakdown.PROVIDER || 0} total={stats.users.total} color="bg-amber-500" />
                                <BarItem label="Masters" count={stats.users.breakdown.RESELLER_T1 || 0} total={stats.users.total} color="bg-emerald-500" />
                                <BarItem label="Partners" count={stats.users.breakdown.RESELLER_T2 || 0} total={stats.users.total} color="bg-indigo-500" />
                                <BarItem label="Apprenants" count={stats.users.breakdown.STUDENT || 0} total={stats.users.total} color="bg-slate-500" />
                            </div>
                        )}
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h4 className="text-white font-bold">Activités Récentes</h4>
                            <p className="text-slate-500 text-sm">Le journal d'activité système sera bientôt disponible.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'content') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">Gestion du Contenu</h2>
                        <div className="flex items-center gap-3 mt-4">
                            <button
                                onClick={() => setContentFilter('ALL')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${contentFilter === 'ALL' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                            >
                                Tout
                            </button>
                            <button
                                onClick={() => setContentFilter('OFFICIAL')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${contentFilter === 'OFFICIAL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
                            >
                                📘 Officiel
                            </button>
                            <button
                                onClick={() => setContentFilter('DEMO')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${contentFilter === 'DEMO' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
                            >
                                ⭐ Démo Uniquement
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddBundle(true)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        + Nouveau Bundle
                    </button>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Chargement du catalogue...</p>
                    </div>
                ) : (
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Archive / Resource</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Type</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Accès</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {bundles.filter(b => {
                                    if (contentFilter === 'OFFICIAL') return !b.isDemo;
                                    if (contentFilter === 'DEMO') return b.isDemo;
                                    return true;
                                }).map((bundle) => (
                                    <tr key={bundle._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform">
                                                    {bundle.thumbnail ? (
                                                        <img src={bundle.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold bg-slate-900">ARCH</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-white font-black italic uppercase tracking-tight line-clamp-1">{bundle.title}</div>
                                                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                                        {bundle.category}
                                                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                                        <span className="text-indigo-400 capitalize">{bundle.createdBy?.role?.toLowerCase() || 'Admin'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-black underline uppercase">
                                                    {bundle.resourceType || 'DOCUMENT'}
                                                </span>
                                                {bundle.resourceType === 'DOCUMENT' && bundle.documentFormat && (
                                                    <span className="text-slate-500 text-[8px] font-bold">{bundle.documentFormat}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${bundle.approvalStatus === 'approved'
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                                                    : bundle.approvalStatus === 'rejected'
                                                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20'
                                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/20 animate-pulse'
                                                    }`}
                                                >
                                                    {bundle.approvalStatus === 'approved' ? '✓ Approuvé' : bundle.approvalStatus === 'rejected' ? '✕ Refusé' : '⌛ En Attente'}
                                                </span>
                                                <button
                                                    onClick={() => toggleDemo(bundle._id, bundle.isDemo)}
                                                    className={`text-[8px] font-bold uppercase ${bundle.isDemo ? 'text-emerald-400' : 'text-slate-600'}`}
                                                >
                                                    {bundle.isDemo ? '⭐ Mode Démo Actif' : '📘 Catalogue Standard'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {bundle.approvalStatus === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm('Approuver ce contenu ?')) {
                                                                    await fetch(`/api/bundles/${bundle._id}`, {
                                                                        method: 'PATCH',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            'Authorization': `Bearer ${token}`
                                                                        },
                                                                        body: JSON.stringify({ approvalStatus: 'approved', isActive: true })
                                                                    });
                                                                    fetchBundles();
                                                                }
                                                            }}
                                                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl transition-all border border-emerald-500/10"
                                                            title="Approuver"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm('Refuser ce contenu ?')) {
                                                                    await fetch(`/api/bundles/${bundle._id}`, {
                                                                        method: 'PATCH',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            'Authorization': `Bearer ${token}`
                                                                        },
                                                                        body: JSON.stringify({ approvalStatus: 'rejected', isActive: false })
                                                                    });
                                                                    fetchBundles();
                                                                }
                                                            }}
                                                            className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/10"
                                                            title="Rejeter"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </>
                                                )}
                                                <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {showAddBundle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl relative overflow-hidden h-[90vh] overflow-y-auto">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

                            <button onClick={() => setShowAddBundle(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="mb-8">
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">Nouveau Bundle</h3>
                                <p className="text-slate-400 font-medium">Créez une nouvelle formation ou ressource technique.</p>
                            </div>

                            <form onSubmit={handleAddBundle} className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Titre de la Formation</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBundleData.title}
                                        onChange={e => setNewBundleData({ ...newBundleData, title: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Catégorie</label>
                                    <select
                                        value={newBundleData.category}
                                        onChange={e => setNewBundleData({ ...newBundleData, category: e.target.value as any })}
                                        className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white appearance-none"
                                    >
                                        <option value="Archive" className="bg-[#0f172a]">Archive Scientifique</option>
                                        <option value="QHSE" className="bg-[#0f172a]">QHSE</option>
                                        <option value="ISO" className="bg-[#0f172a]">ISO</option>
                                        <option value="Safety" className="bg-[#0f172a]">Safety</option>
                                        <option value="Quality" className="bg-[#0f172a]">Quality</option>
                                        <option value="Environment" className="bg-[#0f172a]">Environment</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Type de Ressource</label>
                                    <select
                                        value={newBundleData.resourceType}
                                        onChange={e => setNewBundleData({ ...newBundleData, resourceType: e.target.value as any })}
                                        className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white appearance-none"
                                    >
                                        <option value="COURSE_SERIES" className="bg-[#0f172a]">Formations (Series)</option>
                                        <option value="VIDEO" className="bg-[#0f172a]">Vidéos</option>
                                        <option value="DOCUMENT" className="bg-[#0f172a]">Documents</option>
                                        <option value="TOOL" className="bg-[#0f172a]">Outils Technologiques</option>
                                        <option value="EDUCATIONAL_PLATFORM" className="bg-[#0f172a]">Plateformes Externes</option>
                                    </select>
                                </div>

                                {newBundleData.resourceType === 'DOCUMENT' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Format du Document</label>
                                        <select
                                            value={newBundleData.documentFormat}
                                            onChange={e => setNewBundleData({ ...newBundleData, documentFormat: e.target.value as any })}
                                            className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white appearance-none"
                                        >
                                            <option value="PDF" className="bg-[#0f172a]">PDF</option>
                                            <option value="EXCEL" className="bg-[#0f172a]">Excel</option>
                                            <option value="WORD" className="bg-[#0f172a]">Word</option>
                                            <option value="POWERPOINT" className="bg-[#0f172a]">PowerPoint</option>
                                            <option value="SHEET" className="bg-[#0f172a]">Google Sheet</option>
                                        </select>
                                    </div>
                                )}

                                {newBundleData.resourceType === 'VIDEO' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Heures de Vidéo</label>
                                        <input
                                            type="number"
                                            value={newBundleData.stats.videoHours}
                                            onChange={e => setNewBundleData({ ...newBundleData, stats: { ...newBundleData.stats, videoHours: Number(e.target.value) } })}
                                            className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white"
                                        />
                                    </div>
                                )}

                                {newBundleData.resourceType === 'COURSE_SERIES' && (
                                    <div className="col-span-2 space-y-6">
                                        <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                            <h4 className="text-sm font-black text-indigo-400 uppercase italic">Sessions & Supports</h4>
                                            <button
                                                type="button"
                                                onClick={() => setNewBundleData({
                                                    ...newBundleData,
                                                    sessions: [...newBundleData.sessions, { title: '', videoUrl: '', supportUrl: '' }]
                                                })}
                                                className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase transition-all"
                                            >
                                                + Ajouter une séance
                                            </button>
                                        </div>

                                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                            {newBundleData.sessions.map((session, index) => (
                                                <div key={index} className="bg-white/5 border border-white/5 p-6 rounded-2xl relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newSessions = [...newBundleData.sessions];
                                                            newSessions.splice(index, 1);
                                                            setNewBundleData({ ...newBundleData, sessions: newSessions });
                                                        }}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        ×
                                                    </button>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2 space-y-1">
                                                            <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Titre de la séance {index + 1}</label>
                                                            <input
                                                                type="text"
                                                                value={session.title}
                                                                onChange={e => {
                                                                    const newSessions = [...newBundleData.sessions];
                                                                    newSessions[index].title = e.target.value;
                                                                    setNewBundleData({ ...newBundleData, sessions: newSessions });
                                                                }}
                                                                placeholder="ex: Séance 1: Introduction..."
                                                                className="w-full bg-black/20 border border-white/10 p-3 rounded-xl outline-none focus:border-indigo-500 font-bold text-white text-xs transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Lien Vidéo</label>
                                                            <input
                                                                type="text"
                                                                value={session.videoUrl}
                                                                onChange={e => {
                                                                    const newSessions = [...newBundleData.sessions];
                                                                    newSessions[index].videoUrl = e.target.value;
                                                                    setNewBundleData({ ...newBundleData, sessions: newSessions });
                                                                }}
                                                                placeholder="https://..."
                                                                className="w-full bg-black/20 border border-white/10 p-3 rounded-xl outline-none focus:border-indigo-500 font-bold text-white text-xs transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Support Scientifique</label>
                                                            <input
                                                                type="text"
                                                                value={session.supportUrl}
                                                                onChange={e => {
                                                                    const newSessions = [...newBundleData.sessions];
                                                                    newSessions[index].supportUrl = e.target.value;
                                                                    setNewBundleData({ ...newBundleData, sessions: newSessions });
                                                                }}
                                                                placeholder="https://..."
                                                                className="w-full bg-black/20 border border-white/10 p-3 rounded-xl outline-none focus:border-indigo-500 font-bold text-white text-xs transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {newBundleData.sessions.length === 0 && (
                                                <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-3xl text-slate-600 italic text-[10px] uppercase font-black">
                                                    Aucune session définie
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Nom du Formateur / Entité</label>
                                    <input
                                        type="text"
                                        value={newBundleData.provider.name}
                                        onChange={e => setNewBundleData({ ...newBundleData, provider: { ...newBundleData.provider, name: e.target.value } })}
                                        className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Type de Badge</label>
                                    <select
                                        value={newBundleData.provider.type}
                                        onChange={e => setNewBundleData({ ...newBundleData, provider: { ...newBundleData.provider, type: e.target.value as any } })}
                                        className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all appearance-none"
                                    >
                                        <option value="Expert" className="bg-[#0f172a]">Formateur Expert</option>
                                        <option value="Institute" className="bg-[#0f172a]">Institut / Académie</option>
                                        <option value="Agency" className="bg-[#0f172a]">Agence / Cabinet</option>
                                    </select>
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Description</label>
                                    <textarea
                                        required
                                        value={newBundleData.description}
                                        onChange={e => setNewBundleData({ ...newBundleData, description: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white h-24 resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic text-emerald-500">Demo Access</label>
                                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <input
                                            type="checkbox"
                                            checked={newBundleData.isDemo}
                                            onChange={e => setNewBundleData({ ...newBundleData, isDemo: e.target.checked })}
                                            className="w-5 h-5 rounded accent-emerald-500"
                                        />
                                        <span className="text-white font-bold text-sm">Visible pour le compte démo</span>
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic text-indigo-500">Thumbnail URL</label>
                                    <input
                                        type="text"
                                        value={newBundleData.thumbnail}
                                        onChange={e => setNewBundleData({ ...newBundleData, thumbnail: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all shadow-inner"
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4 italic">Lien Externe (Google Drive / Vidéo URL)</label>
                                    <input
                                        type="text"
                                        value={(newBundleData as any).externalLink || ''}
                                        onChange={e => setNewBundleData({ ...newBundleData, externalLink: e.target.value } as any)}
                                        placeholder="https://drive.google.com/..."
                                        className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all shadow-inner"
                                    />
                                </div>

                                <div className="col-span-2 pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                                    >
                                        {processing ? 'Création...' : 'Valider et Publier'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (activeTab === 'users') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">Gestion des Comptes</h2>
                        <p className="text-slate-400 font-medium">Gérez les accès et les rôles de la plateforme.</p>
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Utilisateur</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Rôle</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Password (Admin)</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Statut</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-6">
                                        <div>
                                            <div className="text-white font-black italic uppercase tracking-tight line-clamp-1">{u.name}</div>
                                            <div className="text-slate-500 text-xs font-bold">{u.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-400' :
                                                u.role === 'PROVIDER' ? 'bg-amber-500/20 text-amber-400' :
                                                    u.role === 'RESELLER_T1' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        'bg-indigo-500/20 text-indigo-400'
                                                }`}>
                                                {u.role}
                                            </span>
                                            {u.isDemo && (
                                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">⭐ DÉMO</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6 text-center font-mono text-xs text-slate-500">{u.plainPassword || '********'}</td>
                                    <td className="p-6 text-center">
                                        <span className={`w-2 h-2 rounded-full inline-block ${u.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-20">
            <div className="text-center">
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-xl font-black text-white uppercase italic mb-2">Espace {activeTab}</h3>
                <p className="text-slate-500 font-medium">Cette section est actuellement en cours de développement.</p>
            </div>
        </div>
    );
}

// ... helper functions (StatCard, BarItem) stay the same ...

function StatCard({ label, value, sub, color }: any) {
    return (
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl">
            <div className={`text-${color}-400 text-xs font-black uppercase tracking-wider mb-2`}>{label}</div>
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-slate-500 text-xs font-bold">{sub}</div>
        </div>
    );
}

function BarItem({ label, count, total, color }: any) {
    const percent = total > 0 ? (count / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                <span>{label}</span>
                <span>{count}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}
