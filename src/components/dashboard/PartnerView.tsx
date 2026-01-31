import React, { useState, useEffect } from 'react';
import { useLicenses } from '@/hooks/useLicenses';
import { useAuth } from '@/contexts/AuthContext';

export default function PartnerView({ activeTab }: { activeTab: string }) {
    const { user, token } = useAuth();
    const isMaster = user?.role === 'RESELLER_T1';
    const { licenses, stats, loading, requestLicenses, activateLicense, userRequests, refetchRequests, refetch } = useLicenses();

    // Partners State for Master
    const [partners, setPartners] = useState<any[]>([]);
    const [loadingPartners, setLoadingPartners] = useState(false);

    useEffect(() => {
        if ((activeTab === 'partners' || activeTab === 'network') && user?.id) {
            fetchPartners();
        }
        if (activeTab === 'content') {
            fetchBundles();
        }
    }, [activeTab, user]);

    const [bundles, setBundles] = useState<any[]>([]);
    const [isFetchingBundles, setIsFetchingBundles] = useState(false);
    const [showAddBundle, setShowAddBundle] = useState(false);
    const [newBundleData, setNewBundleData] = useState({
        title: '',
        description: '',
        category: 'Archive',
        resourceType: 'COURSE_SERIES',
        price: 35,
        thumbnail: '',
        externalLink: '',
        isDemo: false,
        sessions: [] as { title: string; videoUrl: string; supportUrl: string }[]
    });

    const fetchBundles = async () => {
        setIsFetchingBundles(true);
        try {
            const res = await fetch('/api/bundles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setBundles(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsFetchingBundles(false);
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
                body: JSON.stringify({
                    ...newBundleData,
                    provider: {
                        name: user?.name || 'Expert MATC',
                        type: 'Expert'
                    },
                    stats: {
                        videoHours: 0,
                        documentCount: 0,
                        sessionCount: newBundleData.sessions.length,
                        hasLiveSupport: false
                    }
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setShowAddBundle(false);
                setNewBundleData({
                    title: '', description: '', category: 'Archive', resourceType: 'COURSE_SERIES',
                    price: 35, thumbnail: '', externalLink: '', isDemo: false, sessions: []
                });
                fetchBundles();
            } else {
                const errorMsg = data.errors ? `${data.message}: ${data.errors.join(', ')}` : (data.message || 'Erreur lors de la soumission');
                alert(errorMsg);
            }
        } catch (err) {
            console.error(err);
            alert('Erreur réseau');
        } finally {
            setProcessing(false);
        }
    };

    const fetchPartners = async () => {
        setLoadingPartners(true);
        try {
            const response = await fetch(`/api/master/partners?masterId=${user?.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPartners(data);
            }
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setLoadingPartners(false);
        }
    };

    // State for activation modal
    const [showActivate, setShowActivate] = useState(false);
    const [selectedKey, setSelectedKey] = useState('');
    const [learnerData, setLearnerData] = useState({ name: '', email: '', phone: '' });
    const [processing, setProcessing] = useState(false);

    // State for requesting licenses
    const [showRequest, setShowRequest] = useState(false);
    const [requestQuantity, setRequestQuantity] = useState(5);

    // State for creating a partner (Master only)
    const [showAddPartner, setShowAddPartner] = useState(false);
    const [showAddLearner, setShowAddLearner] = useState(false);
    const [newPartnerData, setNewPartnerData] = useState({ name: '', email: '', phone: '', country: '', paymentMethods: '', licenseKey: '' });
    const [newLearnerData, setNewLearnerData] = useState({ name: '', email: '', phone: '', licenseKey: '' });

    // State for Profile Settings
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        country: user?.country || '',
        paymentMethods: user?.paymentMethods || ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                phone: user.phone || '',
                bio: user.bio || '',
                country: user.country || '',
                paymentMethods: user.paymentMethods || ''
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user?.id,
                    ...profileData
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            alert('Profil mis à jour ! Refreshing data...');
            // In a real app we'd update AuthContext here.
            window.location.reload();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const response = await fetch('/api/master/partners/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newPartnerData,
                    masterId: user?.id
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            alert(`Partenaire ajouté ! Donnez-lui ces accès:\nEmail: ${newPartnerData.email}\nMot de passe: ${newPartnerData.licenseKey}\nTéléphone: ${newPartnerData.phone}`);
            setShowAddPartner(false);
            setNewPartnerData({ name: '', email: '', phone: '', country: '', paymentMethods: '', licenseKey: '' });
            fetchPartners();
            refetchRequests(); // Refresh licenses stock since one was used
        } catch (error: any) {
            alert(error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await activateLicense(selectedKey, learnerData.email, learnerData.name, learnerData.phone);
            setShowActivate(false);
            setLearnerData({ name: '', email: '', phone: '' });
            alert(`Licence activée avec succès!\n\nEnvoyez ces accès à l'étudiant:\nEmail: ${learnerData.email}\nMot de passe: ${selectedKey}`);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleAddLearner = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await activateLicense(newLearnerData.licenseKey, newLearnerData.email, newLearnerData.name, newLearnerData.phone);
            setShowAddLearner(false);
            setNewLearnerData({ name: '', email: '', phone: '', licenseKey: '' });
            alert(`Compte Étudiant créé avec succès!\n\nEnvoyez ces accès à l'étudiant:\nEmail: ${newLearnerData.email}\nMot de passe: ${newLearnerData.licenseKey}`);
            fetchPartners(); // Refresh list to see if stats updated
            refetch(); // Refresh licenses stock
        } catch (error: any) {
            alert(error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleRequest = async () => {
        setProcessing(true);
        try {
            await requestLicenses(requestQuantity);
            await refetchRequests();
            setShowRequest(false);
            alert(`Demande envoyée pour ${requestQuantity} licences ! L'administrateur va traiter votre demande.`);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setProcessing(false);
        }
    };

    if (activeTab === 'overview' || activeTab === 'master-overview') {


        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">
                            {isMaster ? 'Tableau de Bord Master' : 'Tableau de Bord Partenaire'}
                        </h2>
                        <p className="text-slate-400 font-medium">
                            {isMaster
                                ? 'Vue d\'ensemble de votre réseau et performances globales'
                                : 'Gérez votre activité commerciale et vos licences'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowRequest(true)}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Demander des Licences
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isMaster ? (
                        <>
                            <StatCard label="Stock Global" value={stats.total} color="indigo" icon="Key" />
                            <StatCard label="Licences Actives" value={stats.used} color="emerald" icon="Check" />
                            <StatCard label="Partenaires" value={partners.length} color="amber" icon="Users" />
                            <StatCard
                                label="Réseau Apprenants"
                                value={partners.reduce((acc, p) => acc + (p.activeLicenses || 0), 0)}
                                color="rose"
                                icon="UserGroup"
                            />
                        </>
                    ) : (
                        <>
                            <StatCard label="Total Licences" value={stats.total} color="indigo" icon="Key" />
                            <StatCard label="Disponibles" value={stats.available} color="emerald" icon="Check" />
                            <StatCard label="Activées" value={stats.used} color="amber" icon="User" />
                            <StatCard
                                label="Revenus Est."
                                value={`${licenses.reduce((acc, l) => acc + (l.usageCount || 0), 0) * 5}€`}
                                color="rose"
                                icon="Dollar"
                            />
                        </>
                    )}
                </div>

                {/* Recent Licenses */}
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                    <h3 className="text-xl font-black text-white uppercase italic mb-6">
                        {isMaster ? 'Dernières Activités Licences' : 'Licences Récentes'}
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="pb-4 pl-4 font-bold">Clé de Licence</th>
                                    <th className="pb-4 font-bold">Statut</th>
                                    <th className="pb-4 font-bold">Apprenant</th>
                                    <th className="pb-4 font-bold">Date d'Activation</th>
                                    {!isMaster && <th className="pb-4 font-bold">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {(licenses || []).slice(0, 5).map((license) => {
                                    const isFull = license.usageCount >= (license.maxUsers || 10);

                                    return (
                                        <tr key={license._id} className="text-slate-300 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 pl-4 font-mono text-sm">{license.key}</td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${license.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    license.status === 'PARTIALLY_USED' ? 'bg-indigo-500/20 text-indigo-400' :
                                                        license.status === 'USED' ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-rose-500/20 text-rose-400'
                                                    }`}>
                                                    {license.status === 'PARTIALLY_USED' ? 'ACTIF' : license.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white">{license.usageCount}/{license.maxUsers || 10} Utilisateurs</span>
                                                    <span className="text-xs text-slate-500">
                                                        {license.learners && license.learners.length > 0
                                                            ? license.learners[license.learners.length - 1].name + (license.learners.length > 1 ? ` +${license.learners.length - 1} autres` : '')
                                                            : '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm">
                                                {license.activationDate ? new Date(license.activationDate).toLocaleDateString() : '-'}
                                            </td>
                                            {!isMaster && (
                                                <td className="py-4">
                                                    {!isFull && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedKey(license.key);
                                                                setShowActivate(true);
                                                            }}
                                                            className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-indigo-500/30"
                                                        >
                                                            + Ajouter
                                                        </button>
                                                    )}
                                                    {isFull && (
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Complet</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                                {(licenses || []).length === 0 && (
                                    <tr>
                                        <td colSpan={isMaster ? 4 : 5} className="py-8 text-center text-slate-500 italic">Aucune licence trouvée</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* Activation Modal */}
                {
                    showActivate && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                            <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                                <button
                                    onClick={() => setShowActivate(false)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>

                                <h3 className="text-2xl font-black text-white uppercase italic mb-2">Ajouter un participant</h3>
                                <p className="text-slate-400 text-sm mb-6">Ajoutez un nouvel utilisateur à cette licence. <br /> <span className="text-indigo-400 font-bold">Note: Le mot de passe sera la clé de licence.</span></p>

                                <form onSubmit={handleActivate} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nom Complet</label>
                                        <input
                                            type="text"
                                            required
                                            value={learnerData.name}
                                            onChange={(e) => setLearnerData({ ...learnerData, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="Ex: Mohamed Ali"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={learnerData.email}
                                            onChange={(e) => setLearnerData({ ...learnerData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="email@exemple.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Téléphone (Optionnel)</label>
                                        <input
                                            type="tel"
                                            value={learnerData.phone}
                                            onChange={(e) => setLearnerData({ ...learnerData, phone: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="+216 ..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-black uppercase tracking-wider hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
                                    >
                                        {processing ? 'Activation en cours...' : 'Confirmer l\'ajout'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Request Stock Modal */}
                {
                    showRequest && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                            <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                                <button
                                    onClick={() => setShowRequest(false)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>

                                <h3 className="text-2xl font-black text-white uppercase italic mb-2">Demander des Licences</h3>
                                <p className="text-slate-400 text-sm mb-6">Demandez un réapprovisionnement de licences (Gratuit).</p>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                        <span className="text-slate-300 font-bold">Coût</span>
                                        <span className="text-emerald-400 font-black text-xl">GRATUIT</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quantité</label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setRequestQuantity(Math.max(1, requestQuantity - 1))}
                                                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white font-bold transition-colors"
                                            >
                                                -
                                            </button>
                                            <div className="flex-1 text-center font-black text-3xl text-white">{requestQuantity}</div>
                                            <button
                                                onClick={() => setRequestQuantity(requestQuantity + 1)}
                                                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white font-bold transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleRequest}
                                        disabled={processing}
                                        className="w-full py-4 bg-emerald-500 rounded-xl text-white font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                                    >
                                        {processing ? 'Envoi...' : 'Envoyer la demande'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }

    if (activeTab === 'stock' || activeTab === 'license-stock' || activeTab === 'licenses') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">Stock de Licences</h2>
                        <p className="text-slate-400 font-medium">Gérez votre inventaire de licences</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => refetch()}
                            className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
                            title="Actualiser le stock"
                        >
                            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setShowRequest(true)}
                            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-emerald-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Demander des Licences
                        </button>
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="pb-4 pl-4 font-bold">Clé</th>
                                    <th className="pb-4 font-bold">Capacité</th>
                                    <th className="pb-4 font-bold">Utilisés</th>
                                    <th className="pb-4 font-bold">Statut</th>
                                    <th className="pb-4 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {(licenses || []).map((license) => (
                                    <tr key={license._id} className="text-slate-300 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 pl-4 font-mono text-emerald-400 font-bold">{license.key}</td>
                                        <td className="py-4 text-white font-bold">{license.maxUsers} Utilisateurs</td>
                                        <td className="py-4 text-slate-400">{license.usageCount}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${license.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' :
                                                license.status === 'PARTIALLY_USED' ? 'bg-indigo-500/20 text-indigo-400' :
                                                    'bg-rose-500/20 text-rose-400'
                                                }`}>
                                                {license.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right pr-4">
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(license.key); alert('Clé copiée !'); }}
                                                className="text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase transition-colors"
                                            >
                                                Copier
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {licenses.length === 0 && (
                            <div className="text-center py-10 text-slate-500">Aucune licence en stock. Générez-en une nouvelle !</div>
                        )}
                    </div>
                </div>

                {/* Request Stock Modal */}
                {showRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setShowRequest(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <h3 className="text-2xl font-black text-white uppercase italic mb-2">Demander des Licences</h3>
                            <p className="text-slate-400 text-sm mb-6">Demandez un réapprovisionnement de licences (Gratuit).</p>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-slate-300 font-bold">Coût</span>
                                    <span className="text-emerald-400 font-black text-xl">GRATUIT</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quantité</label>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setRequestQuantity(Math.max(1, requestQuantity - 1))} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold">-</button>
                                        <div className="flex-1 text-center font-black text-3xl text-white">{requestQuantity}</div>
                                        <button onClick={() => setRequestQuantity(requestQuantity + 1)} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold">+</button>
                                    </div>
                                </div>
                                <button onClick={handleRequest} disabled={processing} className="w-full py-4 bg-emerald-500 rounded-xl text-white font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                                    {processing ? 'Envoi...' : 'Envoyer la demande'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Requests History */}
                {userRequests && userRequests.length > 0 && (
                    <div className="mt-12 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-px bg-white/10"></div>
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest italic">Historique des demandes</h3>
                            <div className="flex-1 h-px bg-white/10"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userRequests.map((req) => (
                                <div key={req._id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold uppercase tracking-tighter">
                                            {new Date(req.createdAt).toLocaleDateString()} - {req.quantity} Licences
                                        </div>
                                        <div className="text-white font-black italic">Demande #{req._id.substring(req._id.length - 4)}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                                        req.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
                                            'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {req.status === 'PENDING' ? 'EN ATTENTE' : req.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (activeTab === 'partners' || activeTab === 'network') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">
                            {isMaster ? 'Gestion des Partenaires' : 'Gestion de mes Étudiants'}
                        </h2>
                        <p className="text-slate-400 font-medium">
                            {isMaster ? 'Visualisez et suivez les activités de vos partenaires.' : 'Gérez vos étudiants et leurs accès aux formations.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAddLearner(true)}
                            className="px-6 py-3 bg-white/5 text-white rounded-xl font-black uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center gap-2 border border-white/10"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Ajouter Étudiant
                        </button>
                        {isMaster && (
                            <button
                                onClick={() => setShowAddPartner(true)}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                Nouveau Partenaire
                            </button>
                        )}
                    </div>
                </div>

                {/* Add Partner Modal */}
                {showAddPartner && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                            <button onClick={() => setShowAddPartner(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="mb-8">
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">Ajouter un Partenaire</h3>
                                <p className="text-slate-400 font-medium">Créez un compte REDSELLER_T2 lié à votre Master.</p>
                            </div>

                            <form onSubmit={handleAddPartner} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Nom Complet</label>
                                    <input
                                        type="text"
                                        required
                                        value={newPartnerData.name}
                                        onChange={e => setNewPartnerData({ ...newPartnerData, name: e.target.value })}
                                        placeholder="Ex: Ahmed Ben Salem"
                                        className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Adresse Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newPartnerData.email}
                                        onChange={e => setNewPartnerData({ ...newPartnerData, email: e.target.value })}
                                        placeholder="partner@example.com"
                                        className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Numéro de Téléphone</label>
                                    <input
                                        type="tel"
                                        value={newPartnerData.phone}
                                        onChange={e => setNewPartnerData({ ...newPartnerData, phone: e.target.value })}
                                        placeholder="Ex: +216 20 388 542"
                                        className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Ville / Pays</label>
                                        <input
                                            type="text"
                                            value={newPartnerData.country}
                                            onChange={e => setNewPartnerData({ ...newPartnerData, country: e.target.value })}
                                            placeholder="Tunis, TN"
                                            className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Modes de Paiement</label>
                                        <input
                                            type="text"
                                            value={newPartnerData.paymentMethods}
                                            onChange={e => setNewPartnerData({ ...newPartnerData, paymentMethods: e.target.value })}
                                            placeholder="D17, Konnect..."
                                            className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Sélectionner une Licence (Password)</label>
                                    <select
                                        required
                                        value={newPartnerData.licenseKey}
                                        onChange={e => setNewPartnerData({ ...newPartnerData, licenseKey: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all appearance-none"
                                    >
                                        <option value="" className="bg-[#0f172a]">Choisir une licence disponible...</option>
                                        {licenses.filter(l => l.status === 'AVAILABLE').map(l => (
                                            <option key={l._id} value={l.key} className="bg-[#0f172a]">
                                                {l.key} (10 Utilisateurs)
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-amber-500/80 font-bold italic ml-4 mt-2">
                                        * Cette licence sera utilisée comme mot de passe initial pour le partenaire.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 mt-4"
                                >
                                    {processing ? 'Création en cours...' : 'Créer le Partenaire'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Learner Modal */}
                {showAddLearner && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-indigo-500"></div>

                            <button onClick={() => setShowAddLearner(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="mb-8">
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">Ajouter un Étudiant</h3>
                                <p className="text-slate-400 font-medium">Créez un compte LEARNER lié à l'une de vos licences.</p>
                            </div>

                            <form onSubmit={handleAddLearner} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Nom de l'Étudiant</label>
                                    <input
                                        type="text"
                                        required
                                        value={newLearnerData.name}
                                        onChange={e => setNewLearnerData({ ...newLearnerData, name: e.target.value })}
                                        placeholder="Ex: Mohamed Ali"
                                        className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 font-bold text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newLearnerData.email}
                                        onChange={e => setNewLearnerData({ ...newLearnerData, email: e.target.value })}
                                        placeholder="student@example.com"
                                        className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 font-bold text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={newLearnerData.phone}
                                        onChange={e => setNewLearnerData({ ...newLearnerData, phone: e.target.value })}
                                        placeholder="+216 ..."
                                        className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 font-bold text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Choisir une Licence</label>
                                    <select
                                        required
                                        value={newLearnerData.licenseKey}
                                        onChange={e => setNewLearnerData({ ...newLearnerData, licenseKey: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 font-bold text-white transition-all appearance-none"
                                    >
                                        <option value="" className="bg-[#0f172a]">Sélectionner une licence...</option>
                                        {licenses.filter(l => l.status === 'AVAILABLE' || l.status === 'PARTIALLY_USED').map(l => (
                                            <option key={l._id} value={l.key} className="bg-[#0f172a]">
                                                {l.key} ({l.maxUsers - (l.usageCount || 0)} places libres)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-5 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:from-emerald-500 hover:to-indigo-500 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 mt-4"
                                >
                                    {processing ? 'Activation...' : 'Créer le compte Étudiant'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                    {loadingPartners ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chargement du réseau...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="pb-4 pl-4 font-bold">Nom / Utilisateur</th>
                                        <th className="pb-4 font-bold">Contact & Accès</th>
                                        <th className="pb-4 font-bold">Détails / Stock</th>
                                        <th className="pb-4 font-bold">Expiration</th>
                                        <th className="pb-4 font-bold text-right pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {partners.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-500 italic">
                                                Aucun partenaire lié à votre compte.
                                            </td>
                                        </tr>
                                    ) : (
                                        partners.map((partner) => {
                                            const isStudent = partner.role === 'STUDENT';
                                            const expiryDate = partner.expiryDate ? new Date(partner.expiryDate) : null;
                                            const isExpired = expiryDate && expiryDate < new Date();
                                            const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

                                            return (
                                                <tr key={partner._id} className="text-slate-300 hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-4 pl-4 font-bold text-white">{partner.name}</td>
                                                    <td className="py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{partner.email}</span>
                                                            <div className="flex gap-2 text-[10px] font-bold mt-1">
                                                                <span className="text-indigo-400">{partner.phone || 'Pas de tél'}</span>
                                                                <span className="text-slate-600">|</span>
                                                                <span className="text-emerald-400 uppercase tracking-tighter">Pw: {partner.plainPassword || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        {isStudent ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-white">Étudiant</span>
                                                                <span className="text-[10px] text-slate-500 uppercase">5€ / trimestre</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-white">{partner.licenseCount || 0} Licences</span>
                                                                <span className="text-[10px] text-slate-500 uppercase">{partner.activeLicenses || 0} Actives</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-4">
                                                        {isStudent && expiryDate ? (
                                                            <div className="flex flex-col">
                                                                <span className={`text-xs font-bold ${isExpired ? 'text-rose-400' : daysLeft && daysLeft < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                                    {expiryDate.toLocaleDateString('fr-FR')}
                                                                </span>
                                                                <span className={`text-[10px] font-bold uppercase ${isExpired ? 'text-rose-500' : daysLeft && daysLeft < 10 ? 'text-amber-500' : 'text-slate-500'}`}>
                                                                    {isExpired ? 'Expiré' : `${daysLeft}j restants`}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-600 text-xs">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-right pr-4">
                                                        {isStudent ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm(`Renouveler l'abonnement de ${partner.name} pour 3 mois (5€) ?`)) return;
                                                                        try {
                                                                            const res = await fetch('/api/students/renew', {
                                                                                method: 'POST',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    'Authorization': `Bearer ${token}`
                                                                                },
                                                                                body: JSON.stringify({ studentId: partner._id })
                                                                            });
                                                                            const data = await res.json();
                                                                            if (res.ok) {
                                                                                alert(data.message);
                                                                                fetchPartners();
                                                                            } else {
                                                                                alert(data.message);
                                                                            }
                                                                        } catch (err) {
                                                                            alert('Erreur lors du renouvellement');
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-emerald-500/30"
                                                                >
                                                                    ↻ Renouveler
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm(`ATTENTION: Supprimer définitivement ${partner.name} ? Cette action est irréversible.`)) return;
                                                                        try {
                                                                            const res = await fetch('/api/students/delete', {
                                                                                method: 'DELETE',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    'Authorization': `Bearer ${token}`
                                                                                },
                                                                                body: JSON.stringify({ studentId: partner._id })
                                                                            });
                                                                            const data = await res.json();
                                                                            if (res.ok) {
                                                                                alert(data.message);
                                                                                fetchPartners();
                                                                            } else {
                                                                                alert(data.message);
                                                                            }
                                                                        } catch (err) {
                                                                            alert('Erreur lors de la suppression');
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-rose-500/30"
                                                                >
                                                                    ✕ Supprimer
                                                                </button>
                                                            </div>
                                                        ) : partner.role === 'RESELLER_T2' ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm(`Renouveler l'abonnement Partner de ${partner.name} pour 1 an (100€) ?`)) return;
                                                                        try {
                                                                            const res = await fetch('/api/partners/renew', {
                                                                                method: 'POST',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    'Authorization': `Bearer ${token}`
                                                                                },
                                                                                body: JSON.stringify({ partnerId: partner._id })
                                                                            });
                                                                            const data = await res.json();
                                                                            if (res.ok) {
                                                                                alert(data.message);
                                                                                fetchPartners();
                                                                            } else {
                                                                                alert(data.message);
                                                                            }
                                                                        } catch (err) {
                                                                            alert('Erreur lors du renouvellement');
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-indigo-500/30"
                                                                >
                                                                    ↻ Renouveler
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${partner.role === 'RESELLER_T2'
                                                                ? 'bg-indigo-500/20 text-indigo-400'
                                                                : 'bg-emerald-500/20 text-emerald-400'
                                                                }`}>
                                                                {partner.role === 'RESELLER_T2' ? 'PARTNER' : 'STUDENT'}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Generic content for other tabs
    if (activeTab === 'wallet' || activeTab === 'finance') {
        const title = isMaster ? 'Global Wallet' : 'Finances & Revenus';
        const description = isMaster ? 'Suivez la santé financière de votre réseau' : 'Gérez vos gains et vos transactions';

        // Dynamic Calculations
        let totalLearners = 0;
        let partnerRevenue = 0;
        let royaltyCredit = 0;
        let nextRenewalPrice = 0;
        let totalPartnerCount = 0;
        let totalContentCount = 0;

        if (isMaster) {
            // Master: Calculate from entire network (all partners under them)
            totalPartnerCount = partners.filter(p => p.role === 'RESELLER_T2').length;

            // Count all students from all partners
            totalLearners = partners.filter(p => p.role === 'STUDENT').length;

            // Revenue from all students in network (5€ each)
            partnerRevenue = totalLearners * 5;

            // Count all content from all partners (would need API call to get this)
            // For now using bundles from current user
            totalContentCount = bundles.length;
            royaltyCredit = totalContentCount * 0.5;

            // Masters get 400€ annual subscription
            nextRenewalPrice = Math.max(0, 400 - royaltyCredit);
        } else {
            // Partner: Calculate from own licenses only
            totalLearners = licenses.reduce((sum, lic) => sum + (lic.usageCount || 0), 0);
            partnerRevenue = totalLearners * 5;
            royaltyCredit = bundles.length * 0.5;
            nextRenewalPrice = Math.max(0, 100 - royaltyCredit);
        }

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">{title}</h2>
                        <p className="text-slate-400 font-medium">{description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
                                <div className="relative">
                                    <div className="text-indigo-100/60 text-xs font-black uppercase tracking-widest mb-4 italic">
                                        {isMaster ? 'Revenus Réseau (5€/Etudiant)' : 'Revenus Gain (5€/Etudiant)'}
                                    </div>
                                    <div className="text-5xl font-black text-white mb-2">{partnerRevenue.toFixed(2)}€</div>
                                    <div className="text-indigo-200 text-sm font-medium italic">
                                        {isMaster
                                            ? `${totalPartnerCount} Partners • ${totalLearners} Étudiants`
                                            : `Basé sur ${totalLearners} étudiants actifs`
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.05] transition-all duration-300">
                                <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4 italic">Prochain Abonnement Annuel</div>
                                <div className="text-4xl font-black text-white mb-2">{nextRenewalPrice.toFixed(2)}€</div>
                                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 10l7-7 7 7M5 14l7 7 7-7" /></svg>
                                    <span>Remise Royalty: -{royaltyCredit.toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8">
                            <h3 className="text-xl font-black text-white uppercase italic mb-8">Détails des Gains & Crédits</h3>
                            <div className="space-y-4">
                                {/* Revenue Item */}
                                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">
                                                {isMaster ? 'Commissions Réseau (Total)' : 'Commissions Apprenants (Total)'}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                                {isMaster
                                                    ? `${totalPartnerCount} partners • ${totalLearners} étudiants x 5€`
                                                    : `${totalLearners} apprenants x 5€`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-emerald-400">+{partnerRevenue.toFixed(2)}€</div>
                                    </div>
                                </div>

                                {/* Content Royalty Item */}
                                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Crédit "Enrich The Vault"</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                                {isMaster
                                                    ? `${totalContentCount} contributions réseau x 0.50€`
                                                    : `${bundles.length} contributions x 0.50€`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-indigo-400">-{royaltyCredit.toFixed(2)}€</div>
                                        <div className="text-[10px] text-slate-600 font-bold uppercase">
                                            {isMaster ? 'Sur 400€/an' : 'Sur abonnement'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl p-8">
                            <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h4 className="text-white font-black uppercase italic mb-2 tracking-tight">Bonus Performance</h4>
                            <p className="text-slate-400 text-sm font-medium mb-6">Vous avez atteint 80% de votre objectif trimestriel. Continuez ainsi !</p>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full w-[80%]"></div>
                            </div>
                        </div>

                        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8">
                            <h4 className="text-white font-black uppercase italic mb-6 tracking-tight">Méthodes de Payement</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-10 h-6 bg-slate-800 rounded border border-white/10"></div>
                                    <div className="text-xs font-bold text-indigo-100">•••• 4242</div>
                                </div>
                                <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-dashed border-white/10">
                                    + Ajouter une méthode
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'settings') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase italic mb-2">Paramètres du Compte</h2>
                    <p className="text-slate-400 font-medium">Gérez vos informations personnelles et préférences</p>
                </div>

                <div className="max-w-4xl bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="p-10 border-r border-white/5 bg-white/[0.01]">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-4xl font-black text-white mb-6 shadow-2xl shadow-indigo-500/20">
                                {user?.name?.charAt(0)}
                            </div>
                            <h3 className="text-xl font-black text-white mb-1 uppercase italic">{user?.name}</h3>
                            <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-6">{isMaster ? 'Master Distributor' : 'Sales Partner'}</p>
                            <div className="space-y-2">
                                <button className="w-full text-left px-4 py-3 bg-white/5 text-white text-xs font-bold rounded-xl border border-white/5">Profil</button>
                                <button className="w-full text-left px-4 py-3 text-slate-500 hover:bg-white/5 hover:text-white text-xs font-bold rounded-xl transition-all">Sécurité</button>
                                <button className="w-full text-left px-4 py-3 text-slate-500 hover:bg-white/5 hover:text-white text-xs font-bold rounded-xl transition-all">Notifications</button>
                            </div>
                        </div>
                        <div className="col-span-2 p-10">
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Nom Complet</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Email</label>
                                        <input type="email" defaultValue={user?.email} className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all opacity-50 cursor-not-allowed" readOnly />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Téléphone (Format: +216...)</label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Ville / Pays</label>
                                        <input
                                            type="text"
                                            value={profileData.country}
                                            onChange={e => setProfileData({ ...profileData, country: e.target.value })}
                                            placeholder="Ex: Tunis, Tunisie"
                                            className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Ma Bio Professionnelle</label>
                                    <textarea
                                        rows={4}
                                        value={profileData.bio}
                                        onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all resize-none"
                                        placeholder="Quelques mots sur votre expérience (apparaîtra sur la page d'accueil)..."
                                    ></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Méthodes de Paiement (Séparées par virgule)</label>
                                    <input
                                        type="text"
                                        value={profileData.paymentMethods}
                                        onChange={e => setProfileData({ ...profileData, paymentMethods: e.target.value })}
                                        placeholder="Ex: D17, Konnect, Sobflous"
                                        className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-10 py-5 bg-white text-black rounded-[2rem] font-black uppercase italic tracking-widest shadow-2xl hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
                                    >
                                        {processing ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                                    </button>
                                </div>
                            </form>
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
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">Espace Contributeur</h2>
                        <p className="text-slate-400 font-medium">Partagez votre expertise et enrichissez le coffre-fort MATC.</p>
                    </div>
                    <button
                        onClick={() => setShowAddBundle(true)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        Nouvelle Archive
                    </button>
                </div>

                {/* Bundle Grid/List */}
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Mes Contributions Scientifiques</h3>
                        <div className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-md uppercase">
                            Total: {bundles.length}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                                    <th className="p-6">Archive / Sujet</th>
                                    <th className="p-6 text-center">Type</th>
                                    <th className="p-6 text-center">Statut Approbation</th>
                                    <th className="p-6 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {bundles.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                <span className="font-black uppercase italic">Aucune contribution pour le moment</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    bundles.map((bundle) => (
                                        <tr key={bundle._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                                                        {bundle.thumbnail ? (
                                                            <img src={bundle.thumbnail} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold bg-slate-900 text-xs">ARCH</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-black italic uppercase tracking-tight line-clamp-1">{bundle.title}</div>
                                                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{bundle.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-black underline uppercase">
                                                    {bundle.resourceType}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${bundle.approvalStatus === 'approved'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                                        : bundle.approvalStatus === 'rejected'
                                                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20'
                                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/20 animate-pulse'
                                                        }`}
                                                    >
                                                        {bundle.approvalStatus === 'approved' ? '✓ Approuvé' : bundle.approvalStatus === 'rejected' ? '✕ Refusé' : '⌛ En Attente Admin'}
                                                    </span>
                                                    {bundle.approvalStatus === 'approved' && (
                                                        <span className="text-[8px] text-slate-500 font-bold uppercase">Visible par les apprenants</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right text-slate-500 text-xs font-bold">
                                                {new Date(bundle.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Bundle Modal (Same as Admin but with submitting to admin logic) */}
                {showAddBundle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
                        <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl relative overflow-y-auto max-h-[90vh]">
                            <button onClick={() => setShowAddBundle(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            <h3 className="text-3xl font-black text-white uppercase italic mb-8">Soumettre une Expertise</h3>

                            <form onSubmit={handleAddBundle} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Titre de l'Archive</label>
                                        <input type="text" required value={newBundleData.title} onChange={e => setNewBundleData({ ...newBundleData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Catégorie</label>
                                        <select value={newBundleData.category} onChange={e => setNewBundleData({ ...newBundleData, category: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-indigo-500">
                                            {['QHSE', 'ISO', 'Safety', 'Quality', 'Environment', 'Archive'].map(c => <option key={c} value={c} className="bg-[#0f172a]">{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Description Scientifique</label>
                                    <textarea required rows={3} value={newBundleData.description} onChange={e => setNewBundleData({ ...newBundleData, description: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-indigo-500"></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Lien Thumbnail (Image)</label>
                                        <input type="text" required value={newBundleData.thumbnail} onChange={e => setNewBundleData({ ...newBundleData, thumbnail: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Espace Cloud (Drive/Link)</label>
                                        <input type="text" value={newBundleData.externalLink} onChange={e => setNewBundleData({ ...newBundleData, externalLink: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-indigo-500" />
                                    </div>
                                </div>

                                {/* Sessions Manager */}
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Structure de la Formation/Archive</label>
                                        <button type="button" onClick={() => setNewBundleData({ ...newBundleData, sessions: [...newBundleData.sessions, { title: '', videoUrl: '', supportUrl: '' }] })} className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1 rounded-full uppercase hover:bg-indigo-700 transition-colors">+ Ajouter Session</button>
                                    </div>
                                    <div className="space-y-4">
                                        {newBundleData.sessions.map((s, idx) => (
                                            <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3 relative group">
                                                <button type="button" onClick={() => { const s2 = [...newBundleData.sessions]; s2.splice(idx, 1); setNewBundleData({ ...newBundleData, sessions: s2 }); }} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                                <input type="text" placeholder="Titre de la session/vidéo" value={s.title} onChange={e => { const s2 = [...newBundleData.sessions]; s2[idx].title = e.target.value; setNewBundleData({ ...newBundleData, sessions: s2 }); }} className="w-full bg-white/5 border border-white/5 p-2 rounded text-xs text-white outline-none" />
                                                <div className="grid grid-cols-2 gap-3 text-[10px]">
                                                    <input type="text" placeholder="URL Vidéo (Cloud)" value={s.videoUrl} onChange={e => { const s2 = [...newBundleData.sessions]; s2[idx].videoUrl = e.target.value; setNewBundleData({ ...newBundleData, sessions: s2 }); }} className="w-full bg-white/5 border border-white/5 p-2 rounded text-white outline-none" />
                                                    <input type="text" placeholder="URL Support/Docs" value={s.supportUrl} onChange={e => { const s2 = [...newBundleData.sessions]; s2[idx].supportUrl = e.target.value; setNewBundleData({ ...newBundleData, sessions: s2 }); }} className="w-full bg-white/5 border border-white/5 p-2 rounded text-white outline-none" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase italic tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-2xl disabled:opacity-50"
                                >
                                    {processing ? 'Envoi en cours...' : 'Soumettre à l\'administration'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
                <h3 className="text-xl font-black text-white uppercase italic mb-2">Section {activeTab}</h3>
                <p className="text-slate-400 italic">Cette interface est en cours d'optimisation pour votre profil {isMaster ? 'Master' : 'Partner'}.</p>
            </div>
        </div>
    );
}

// Helper Components
function StatCard({ label, value, color, icon }: any) {
    const renderIcon = () => {
        switch (icon) {
            case 'Key': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
            case 'Check': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case 'User': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
            case 'Dollar': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2-3-.895-3-2M12 4v4m0 4v4" /></svg>;
            case 'Users': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
            case 'UserGroup': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
            default: return <div className="w-6 h-6 bg-current opacity-50 rounded" />;
        }
    };

    return (
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl group hover:bg-white/[0.05] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${color}-500/20 text-${color}-400 group-hover:scale-110 transition-transform`}>
                    {renderIcon()}
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
