"use client";

import { useState, useEffect } from 'react';

interface AdminUser {
    id: string;
    name: string;
    email: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    country?: string;
    paymentMethods?: string;
    isDemo?: boolean;
    status: string;
}

interface Request {
    _id: string;
    userName: string;
    userEmail: string;
    quantity: number;
    status: string;
    createdAt: string;
}

interface Stats {
    users: {
        total: number;
        breakdown: Record<string, number>;
    };
    content: {
        bundles: number;
    };
    sales: {
        licenses: number;
        active: number;
        revenue: number;
    };
}

export default function AdminPage() {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [stats, setStats] = useState<Stats | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings' | 'requests' | 'content'>('overview');
    const [usersList, setUsersList] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [requests, setRequests] = useState<Request[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);

    const [showAddBundle, setShowAddBundle] = useState(false);
    const [isCreatingBundle, setIsCreatingBundle] = useState(false);
    const [newBundleData, setNewBundleData] = useState({
        title: '',
        description: '',
        category: 'Archive',
        resourceType: 'COURSE_SERIES',
        price: 0,
        thumbnail: '',
        externalLink: '',
        isDemo: false,
        sessions: [] as { title: string; videoUrl: string; supportUrl: string }[]
    });

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
        if (activeTab === 'requests') {
            fetchRequests();
        }
        if (activeTab === 'content') {
            fetchBundles();
        }
    }, [activeTab]);

    const [bundles, setBundles] = useState<any[]>([]);
    const [isFetchingBundles, setIsFetchingBundles] = useState(false);

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

    const handleApproveBundle = async (id: string) => {
        if (!confirm('Approuver ce contenu ?')) return;
        try {
            const res = await fetch(`/api/bundles/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ approvalStatus: 'approved', isActive: true })
            });
            if (res.ok) fetchBundles();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRejectBundle = async (id: string) => {
        if (!confirm('Rejeter ce contenu ?')) return;
        try {
            const res = await fetch(`/api/bundles/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ approvalStatus: 'rejected', isActive: false })
            });
            if (res.ok) fetchBundles();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddBundleFromAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingBundle(true);
        try {
            const res = await fetch('/api/bundles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newBundleData,
                    approvalStatus: 'approved',
                    isActive: true,
                    documentFormat: 'PDF', // Default
                    stats: {
                        videoHours: 0,
                        documentCount: 0,
                        sessionCount: newBundleData.sessions.length,
                        hasLiveSupport: false
                    },
                    provider: { name: 'MATC Expert', type: 'Expert' }
                })
            });
            const data = await res.json();
            if (res.ok) {
                setShowAddBundle(false);
                setNewBundleData({
                    title: '',
                    description: '',
                    category: 'Archive',
                    resourceType: 'COURSE_SERIES',
                    price: 0,
                    thumbnail: '',
                    externalLink: '',
                    isDemo: false,
                    sessions: []
                });
                fetchBundles();
            } else {
                const errorMsg = data.errors ? `${data.message}: ${data.errors.join(', ')}` : (data.message || 'Erreur lors de la création du bundle');
                alert(errorMsg);
            }
        } catch (err) {
            console.error(err);
            alert('Erreur réseau');
        } finally {
            setIsCreatingBundle(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await fetch('/api/requests');
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir valider cette demande ?')) return;
        try {
            const response = await fetch('/api/requests/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            });
            if (response.ok) {
                alert('Demande approuvée avec succès');
                fetchRequests();
            } else {
                const err = await response.json();
                alert('Erreur: ' + err.message);
            }
        } catch (error) {
            alert('Erreur de connexion');
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) return;
        try {
            const response = await fetch('/api/requests/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            });
            if (response.ok) {
                alert('Demande rejetée');
                fetchRequests();
            } else {
                const err = await response.json();
                alert('Erreur: ' + err.message);
            }
        } catch (error) {
            alert('Erreur de connexion');
        }
    };

    // Fetch users from API
    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                const mappedUsers = data.map((u: any) => ({
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    password: u.plainPassword || 'Haché (Sécurisé)', // Better than dots 
                    role: u.role === 'RESELLER_T1' ? 'Master' :
                        u.role === 'RESELLER_T2' ? 'Partner' :
                            u.role === 'STUDENT' ? 'Learner' : u.role,
                    phone: u.phone || '',
                    country: u.country || '',
                    paymentMethods: u.paymentMethods || '',
                    isDemo: u.isDemo,
                    status: u.isActive ? 'Actif' : 'Inactif'
                }));
                setUsersList(mappedUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    // Load users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Delete User Handler
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsUpdatingUser(true);
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingUser.id,
                    name: editingUser.name,
                    email: editingUser.email,
                    password: editingUser.password, // This will store in plainPassword and re-hash password
                    role: editingUser.role === 'Master' ? 'RESELLER_T1' :
                        editingUser.role === 'Partner' ? 'RESELLER_T2' :
                            editingUser.role === 'Learner' ? 'STUDENT' : editingUser.role,
                    isDemo: editingUser.isDemo
                })
            });

            if (response.ok) {
                alert('Compte mis à jour avec succès');
                setEditingUser(null);
                fetchUsers();
            } else {
                const err = await response.json();
                alert(`Erreur: ${err.message}`);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Erreur lors de la mise à jour');
        } finally {
            setIsUpdatingUser(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                const response = await fetch(`/api/admin/users?id=${userId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await fetchUsers(); // Refresh list
                } else {
                    alert('Erreur lors de la suppression');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    // Check if user is already logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('matc_user');
        const storedToken = localStorage.getItem('matc_token');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            if (storedToken) setToken(storedToken);
            fetchStats();
        }
        setLoading(false);
    }, []);

    const fetchStats = () => {
        // Mock stats data
        setStats({
            users: {
                total: 156,
                breakdown: {
                    ADMIN: 2,
                    PROVIDER: 5,
                    RESELLER_T1: 8,
                    RESELLER_T2: 23,
                    STUDENT: 118
                }
            },
            content: {
                bundles: 47
            },
            sales: {
                licenses: 342,
                active: 287,
                revenue: 1710
            }
        });
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setError('');

        setTimeout(() => {
            // Real credential validation
            const ADMIN_EMAIL = 'matrainingconsulting@matc.com';
            const ADMIN_PASSWORD = 'matrainingconsulting@20388542value';

            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                const adminUser = {
                    id: 'admin-1',
                    name: 'MATC Administration',
                    email: email,
                    role: 'ADMIN'
                };

                const fakeToken = 'local-admin-token-' + Date.now();
                localStorage.setItem('matc_user', JSON.stringify(adminUser));
                localStorage.setItem('matc_token', fakeToken);
                setUser(adminUser);
                setToken(fakeToken);
                setLoginLoading(false);
                fetchStats();
            } else {
                setLoginLoading(false);
                setError('Accès refusé. Identifiants invalides.');
            }
        }, 1500);
    };

    const handleLogout = () => {
        localStorage.removeItem('matc_user');
        localStorage.removeItem('matc_token');
        setUser(null);
        setEmail('');
        setPassword('');
        setStats(null);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold animate-pulse">Chargement...</p>
                </div>
            </div>
        );
    }

    // Login Gate (if not logged in)
    if (!user) {
        return (
            <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative font-['Outfit',sans-serif] overflow-hidden">
                {/* Security Grid Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent shadow-[0_0_20px_rgba(79,70,229,1)]"></div>

                <div className="relative z-10 w-full max-w-xl space-y-12">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full mb-4">
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></div>
                            <span className="text-rose-500 font-black text-[9px] uppercase tracking-[0.3em]">Restricted Area</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic">PayMendt <span className="text-slate-500 underline decoration-indigo-600 line-offset-8">Admin Gateway</span></h1>
                        <p className="text-slate-500 font-medium italic">Accès réservé aux administrateurs et contributeurs experts certifiés.</p>
                    </div>

                    <div className="glass-card p-12 rounded-[60px] border border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                        <form onSubmit={handleLogin} className="space-y-8 animate-in fade-in duration-700">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Security ID (Email)</label>
                                    <input
                                        type="email"
                                        autoFocus
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@paymendt.com"
                                        className="w-full bg-white/[0.03] border border-white/10 p-6 rounded-3xl outline-none focus:border-indigo-500 font-bold italic transition-all text-white placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Encrypted Access Key</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full bg-white/[0.03] border border-white/10 p-6 rounded-3xl outline-none focus:border-indigo-500 font-bold italic transition-all text-white placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-rose-500 text-xs font-black text-center italic animate-shake">{error}</p>}

                            <button
                                disabled={loginLoading}
                                className="w-full py-8 bg-white text-black rounded-[35px] font-black uppercase italic tracking-[0.2em] shadow-2xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                            >
                                {loginLoading ? (
                                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    "Initialize Secure Session"
                                )}
                            </button>

                            <div className="text-center pt-4">
                                <a href="/" className="text-slate-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">← Retour au site public</a>
                            </div>
                        </form>
                    </div>

                    <div className="text-center opacity-30">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[1em]">Secure Environment Port 3000-AD</p>
                    </div>
                </div>
            </main>
        );
    }

    // Admin Dashboard (if logged in)
    return (
        <div className="min-h-screen bg-[#020617] text-white font-['Outfit',sans-serif]">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/20">
                            P
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase italic tracking-wider">
                                PayMendt <span className="text-indigo-400">Admin</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-bold">Restricted Area</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <div className="text-white font-bold text-sm">{user.name}</div>
                            <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider">Administrator</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white font-black shadow-lg shadow-rose-500/20">
                            {user.name.charAt(0)}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            title="Déconnexion"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Sidebar + Content */}
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 min-h-[calc(100vh-73px)] bg-white/[0.02] border-r border-white/5 p-6">
                    <nav className="space-y-2">
                        <TabButton
                            active={activeTab === 'overview'}
                            onClick={() => setActiveTab('overview')}
                            icon="📊"
                            label="Vue d'ensemble"
                        />
                        <TabButton
                            active={activeTab === 'users'}
                            onClick={() => setActiveTab('users')}
                            icon="👥"
                            label="Gestion des Comptes"
                        />
                        <TabButton
                            active={activeTab === 'requests'}
                            onClick={() => setActiveTab('requests')}
                            icon="📩"
                            label="Demandes"
                        />
                        <TabButton
                            active={activeTab === 'content'}
                            onClick={() => setActiveTab('content')}
                            icon="📚"
                            label="Contenu"
                        />
                        <TabButton
                            active={activeTab === 'settings'}
                            onClick={() => setActiveTab('settings')}
                            icon="⚙️"
                            label="Paramètres"
                        />
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {activeTab === 'overview' && stats && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic mb-2">Administration Centrale</h2>
                                <p className="text-slate-400 font-medium">Vue d'ensemble de l'écosystème PayMendt</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    label="Utilisateurs Total"
                                    value={stats.users.total}
                                    sub={`${stats.users.breakdown.STUDENT || 0} Apprenants`}
                                    color="indigo"
                                />
                                <StatCard
                                    label="Revenus Générés"
                                    value={`${stats.sales.revenue}€`}
                                    sub="Est. Total"
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

                            {/* Distribution Chart */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                                    <h3 className="text-xl font-black text-white uppercase italic mb-6">Distribution Utilisateurs</h3>
                                    <div className="space-y-4">
                                        <BarItem label="Administrateurs" count={stats.users.breakdown.ADMIN || 0} total={stats.users.total} color="bg-rose-500" />
                                        <BarItem label="Providers" count={stats.users.breakdown.PROVIDER || 0} total={stats.users.total} color="bg-amber-500" />
                                        <BarItem label="Masters" count={stats.users.breakdown.RESELLER_T1 || 0} total={stats.users.total} color="bg-emerald-500" />
                                        <BarItem label="Partners" count={stats.users.breakdown.RESELLER_T2 || 0} total={stats.users.total} color="bg-indigo-500" />
                                        <BarItem label="Apprenants" count={stats.users.breakdown.STUDENT || 0} total={stats.users.total} color="bg-slate-500" />
                                    </div>
                                </div>

                                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex items-center justify-center">
                                    <h4 className="text-white font-black uppercase italic mb-6">Journal d'Audit Système</h4>
                                    <div className="space-y-4 text-left w-full">
                                        {[
                                            { event: 'Nouveau Partner créé: kdjdf@gmail.com', time: '14:20', type: 'info' },
                                            { event: 'Demande de 10 Licences approuvée (Master: ahmedmaaloul)', time: '12:05', type: 'success' },
                                            { event: 'Système mis à jour v.2.4.0', time: '09:00', type: 'warning' },
                                            { event: 'Alerte sécurité: Tentative login invalide de 192.168.1.1', time: 'Hier', type: 'danger' }
                                        ].map((log, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                                <div className={`w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-emerald-500' :
                                                    log.type === 'danger' ? 'bg-rose-500' :
                                                        log.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                                                    }`} />
                                                <div className="flex-1">
                                                    <div className="text-[11px] font-bold text-slate-200">{log.event}</div>
                                                    <div className="text-[9px] text-slate-500 uppercase font-black">{log.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic mb-2">Gestion des Utilisateurs</h2>
                                <p className="text-slate-400 font-medium">Créer et gérer les comptes utilisateurs</p>
                            </div>

                            {/* Create User Form */}
                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8">
                                <h3 className="text-xl font-black text-white uppercase italic mb-6">Créer un nouveau compte</h3>

                                <form className="space-y-6" onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const formData = new FormData(form);

                                    try {
                                        const response = await fetch('/api/admin/users', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                name: formData.get('name'),
                                                email: formData.get('email'),
                                                password: formData.get('password'),
                                                role: formData.get('role'),
                                                phone: formData.get('phone'),
                                                country: formData.get('country'),
                                                isDemo: formData.get('isDemo') === 'true',
                                                paymentMethods: formData.get('paymentMethods')
                                            })
                                        });

                                        if (response.ok) {
                                            await fetchUsers(); // Refresh list via API
                                            alert(`Compte créé avec succès!`);
                                            form.reset();
                                        } else {
                                            const err = await response.json();
                                            alert(`Erreur: ${err.message}`);
                                        }
                                    } catch (error) {
                                        console.error(error);
                                        alert('Erreur lors de la création');
                                    }
                                }}>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Nom complet</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                placeholder="Ahmed Ben Salem"
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white placeholder:text-slate-600 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                placeholder="user@example.com"
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white placeholder:text-slate-600 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Mot de passe</label>
                                            <input
                                                type="text"
                                                name="password"
                                                required
                                                placeholder="••••••••"
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white placeholder:text-slate-600 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Téléphone / WhatsApp</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="+216 ..."
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white placeholder:text-slate-600 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Pays / Ville</label>
                                            <input
                                                type="text"
                                                name="country"
                                                placeholder="Tunisie / Tunis"
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white placeholder:text-slate-600 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Modes de Paiement (Séparés par virgule)</label>
                                            <input
                                                type="text"
                                                name="paymentMethods"
                                                placeholder="D17, Sobflous, Virement"
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white placeholder:text-slate-600 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Type de compte</label>
                                            <select
                                                name="role"
                                                required
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all appearance-none"
                                            >
                                                <option value="STUDENT" className="bg-[#020617]">Learner (Apprenant)</option>
                                                <option value="RESELLER_T2" className="bg-[#020617]">Partner (Partenaire)</option>
                                                <option value="RESELLER_T1" className="bg-[#020617]">Master (Revendeur Principal)</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Accès Démo</label>
                                            <select
                                                name="isDemo"
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-emerald-500 font-bold text-white transition-all appearance-none"
                                            >
                                                <option value="false" className="bg-[#020617]">Non (Compte Officiel)</option>
                                                <option value="true" className="bg-[#020617]">Oui (Compte Démo)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full md:w-auto px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        Créer le compte
                                    </button>
                                </form>
                            </div>

                            {/* Account Types Info */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white/[0.03] border border-indigo-500/20 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                            <span className="text-xl">🎓</span>
                                        </div>
                                        <h4 className="text-white font-black">Learner</h4>
                                    </div>
                                    <p className="text-slate-400 text-sm">Accès à la bibliothèque complète de formations QHSE et documents.</p>
                                </div>

                                <div className="bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                            <span className="text-xl">👥</span>
                                        </div>
                                        <h4 className="text-white font-black">Partner</h4>
                                    </div>
                                    <p className="text-slate-400 text-sm">Gestion de licences, développement de réseau et suivi des apprenants.</p>
                                </div>

                                <div className="bg-white/[0.03] border border-amber-500/20 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                            <span className="text-xl">🛡️</span>
                                        </div>
                                        <h4 className="text-white font-black">Master</h4>
                                    </div>
                                    <p className="text-slate-400 text-sm">Pilotage du réseau de partenaires, gestion avancée et statistiques globales.</p>
                                </div>
                            </div>

                            <div className="pt-12 border-t border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-black text-white uppercase italic">Liste des Comptes</h3>
                                    <button
                                        onClick={() => fetchUsers()}
                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                                        title="Actualiser"
                                    >
                                        <svg className={`w-5 h-5 ${isLoadingUsers ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-white/[0.03] border-b border-white/5">
                                                <tr>
                                                    <th className="text-left p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Nom</th>
                                                    <th className="text-left p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Email</th>
                                                    <th className="text-left p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Mot de passe</th>
                                                    <th className="text-left p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Rôle</th>
                                                    <th className="text-left p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Statut</th>
                                                    <th className="text-right p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {usersList.map((u) => {
                                                    const roleColor = u.role === 'Master' ? 'amber' : u.role === 'Partner' ? 'emerald' : 'indigo';
                                                    const initial = u.name.charAt(0).toUpperCase();

                                                    return (
                                                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                                            <td className="p-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-12 h-12 bg-gradient-to-br from-${roleColor}-500/20 to-${roleColor}-600/10 rounded-2xl flex items-center justify-center text-${roleColor}-400 font-black text-lg border border-${roleColor}-500/10`}>
                                                                        {initial}
                                                                    </div>
                                                                    <span className="text-white font-bold">{u.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-6">
                                                                <div className="flex flex-col">
                                                                    <div className="text-white font-bold">{u.email}</div>
                                                                    <div className="text-xs text-indigo-400 font-black">{u.phone || 'Pas de tel'}</div>
                                                                </div>
                                                            </td>
                                                            <td className="p-6">
                                                                <span className="px-4 py-2 bg-slate-500/10 text-slate-300 rounded-xl text-xs font-black tracking-wider border border-white/5">
                                                                    {u.password}
                                                                </span>
                                                            </td>
                                                            <td className="p-6">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className={`px-4 py-2 bg-${roleColor}-500/10 text-${roleColor}-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-${roleColor}-500/10 text-center`}>
                                                                        {u.role}
                                                                    </span>
                                                                    {u.isDemo && (
                                                                        <span className="text-[9px] font-black text-emerald-400 text-center uppercase tracking-widest">⭐ DÉMO</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-6">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                                    <span className="text-emerald-400 text-xs font-black uppercase tracking-wider">{u.status}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-6 text-right">
                                                                <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => setEditingUser(u)}
                                                                        className="p-3 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl transition-all border border-indigo-500/10"
                                                                        title="Modifier"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteUser(u.id)}
                                                                        className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all border border-rose-500/10"
                                                                        title="Supprimer"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic mb-2">Demandes de Licences</h2>
                                <p className="text-slate-400 font-medium">Valider ou refuser les demandes de réapprovisionnement.</p>
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                                                <th className="pb-4 pl-4 font-bold">Demandeur</th>
                                                <th className="pb-4 font-bold">Quantité</th>
                                                <th className="pb-4 font-bold">Date</th>
                                                <th className="pb-4 font-bold">Statut</th>
                                                <th className="pb-4 font-bold text-right pr-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {requests.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="py-8 text-center text-slate-500 italic">Aucune demande trouvée.</td>
                                                </tr>
                                            ) : (
                                                requests.map((request) => (
                                                    <tr key={request._id} className="text-slate-300 hover:bg-white/[0.02] transition-colors">
                                                        <td className="py-4 pl-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-white">{request.userName}</span>
                                                                <span className="text-xs text-slate-500">{request.userEmail}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 font-bold text-xl text-white">{request.quantity}</td>
                                                        <td className="py-4 text-sm text-slate-400">
                                                            {new Date(request.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4">
                                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${request.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                request.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
                                                                    'bg-amber-500/20 text-amber-400'
                                                                }`}>
                                                                {request.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-right pr-4">
                                                            {request.status === 'PENDING' && (
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleApproveRequest(request._id)}
                                                                        className="p-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition-colors"
                                                                        title="Valider"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectRequest(request._id)}
                                                                        className="p-2 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-colors"
                                                                        title="Refuser"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {request.status !== 'PENDING' && (
                                                                <span className="text-xs text-slate-600 italic">Traité</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase italic mb-2">Gestion du Contenu</h2>
                                    <p className="text-slate-400 font-medium">Gérez vos formations, documents et accès démo.</p>
                                </div>
                                <button
                                    onClick={() => setShowAddBundle(true)}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                    + Nouveau Bundle
                                </button>
                            </div>

                            {showAddBundle && (
                                <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 animate-in slide-in-from-top duration-500">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black text-white uppercase italic">Nouveau Contenu Scientifique</h3>
                                        <button onClick={() => setShowAddBundle(false)} className="text-slate-500 hover:text-white font-black text-xs uppercase tracking-widest">Annuler ×</button>
                                    </div>
                                    <form onSubmit={handleAddBundleFromAdmin} className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Titre de l'archive</label>
                                            <input
                                                type="text"
                                                required
                                                value={newBundleData.title}
                                                onChange={e => setNewBundleData({ ...newBundleData, title: e.target.value })}
                                                placeholder="ex: ISO 9001:2015 Expert..."
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Catégorie</label>
                                            <select
                                                value={newBundleData.category}
                                                onChange={e => setNewBundleData({ ...newBundleData, category: e.target.value as any })}
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all appearance-none"
                                            >
                                                <option value="Archive" className="bg-[#020617]">Archive</option>
                                                <option value="QHSE" className="bg-[#020617]">QHSE</option>
                                                <option value="ISO" className="bg-[#020617]">ISO</option>
                                                <option value="Safety" className="bg-[#020617]">Safety</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Description Courte</label>
                                            <textarea
                                                required
                                                value={newBundleData.description}
                                                onChange={e => setNewBundleData({ ...newBundleData, description: e.target.value })}
                                                placeholder="Décrivez brièvement le contenu technique..."
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all h-24"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Type de Ressource</label>
                                            <select
                                                value={newBundleData.resourceType}
                                                onChange={e => setNewBundleData({ ...newBundleData, resourceType: e.target.value as any })}
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all appearance-none"
                                            >
                                                <option value="COURSE_SERIES" className="bg-[#020617]">Formations (Series)</option>
                                                <option value="VIDEO" className="bg-[#020617]">Vidéos</option>
                                                <option value="DOCUMENT" className="bg-[#020617]">Documents</option>
                                                <option value="TOOL" className="bg-[#020617]">Outils Technologiques</option>
                                                <option value="EDUCATIONAL_PLATFORM" className="bg-[#020617]">Plateformes Externes</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4 italic">Rendu Démo (Visibilité)</label>
                                            <select
                                                value={newBundleData.isDemo ? 'true' : 'false'}
                                                onChange={e => setNewBundleData({ ...newBundleData, isDemo: e.target.value === 'true' })}
                                                className="w-full bg-white/[0.03] border border-indigo-500/30 p-4 rounded-2xl outline-none focus:border-indigo-500 font-black text-indigo-400 transition-all appearance-none"
                                            >
                                                <option value="false" className="bg-[#020617]">Catalogue Officiel</option>
                                                <option value="true" className="bg-[#020617]">⭐ Espace Démo Uniquement</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Thumbnail URL</label>
                                            <input
                                                type="text"
                                                value={newBundleData.thumbnail}
                                                onChange={e => setNewBundleData({ ...newBundleData, thumbnail: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4 italic">Lien Externe (Drive / URL)</label>
                                            <input
                                                type="text"
                                                value={newBundleData.externalLink}
                                                onChange={e => setNewBundleData({ ...newBundleData, externalLink: e.target.value })}
                                                placeholder="https://drive.google.com/..."
                                                className="w-full bg-white/[0.03] border border-indigo-500/20 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all shadow-inner"
                                            />
                                        </div>

                                        {newBundleData.resourceType === 'COURSE_SERIES' && (
                                            <div className="col-span-2 space-y-6">
                                                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                                    <h4 className="text-sm font-black text-indigo-400 uppercase italic">Structure des Sessions (Vidéos & Supports)</h4>
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

                                                <div className="space-y-4">
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
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div className="space-y-1">
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
                                                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Lien Vidéo (Drive/URL)</label>
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
                                                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Support PDF/Ressource</label>
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
                                                        <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-3xl text-slate-600 italic text-xs">
                                                            Aucune séance n'est définie pour cette formation série.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="col-span-2 pt-4">
                                            <button
                                                type="submit"
                                                disabled={isCreatingBundle}
                                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                                            >
                                                {isCreatingBundle ? 'Création en cours...' : 'Enregistrer dans la bibliothèque'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.03] border-b border-white/5">
                                        <tr>
                                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Archive / Ressource</th>
                                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Type</th>
                                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Accès</th>
                                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {isFetchingBundles ? (
                                            <tr><td colSpan={4} className="p-20 text-center animate-pulse text-slate-500">Chargement...</td></tr>
                                        ) : (
                                            bundles.map((bundle) => (
                                                <tr key={bundle._id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden shadow-inner">
                                                                {bundle.thumbnail ? <img src={bundle.thumbnail} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-700 font-black italic text-[8px]">ARCH</div>}
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-bold text-sm uppercase">{bundle.title}</div>
                                                                <div className="text-[9px] text-indigo-400 uppercase font-black tracking-widest">{bundle.category}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        <span className="px-3 py-1 bg-white/5 text-slate-400 text-[8px] font-black uppercase tracking-widest border border-white/5 rounded-lg">
                                                            {bundle.resourceType}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${bundle.isDemo ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-slate-500 border border-white/5'}`}>
                                                            {bundle.isDemo ? '⭐ Démo' : '📘 Officiel'}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${bundle.approvalStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : bundle.approvalStatus === 'rejected' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                                    {bundle.approvalStatus || 'approved'}
                                                                </span>
                                                                {bundle.approvalStatus === 'pending' && (
                                                                    <div className="flex gap-1">
                                                                        <button onClick={() => handleApproveBundle(bundle._id)} className="text-[8px] font-black text-emerald-500 hover:underline">Approuver</button>
                                                                        <span className="text-[8px] text-slate-700">|</span>
                                                                        <button onClick={() => handleRejectBundle(bundle._id)} className="text-[8px] font-black text-rose-500 hover:underline">Rejeter</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-black italic text-slate-600 uppercase">
                                                                {bundle.isActive ? 'En ligne' : 'Hors-ligne'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic mb-2">Paramètres Système</h2>
                                <p className="text-slate-400 font-medium">Configuration globale de la plateforme PayMendt</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                                    <h3 className="text-xl font-black text-white uppercase italic">Paramètres Généraux</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Nom de la Plateforme</label>
                                            <input type="text" defaultValue="MATC Vault - Scientific Archives" className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all shadow-inner" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-4">URL de Maintenance</label>
                                            <input type="text" defaultValue="https://vault.matc.com/maintenance" className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all shadow-inner" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                                    <h3 className="text-xl font-black text-white uppercase italic">Finance & Tarification</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-4">TVA / Taxe (%)</label>
                                            <input type="number" defaultValue="19" className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all shadow-inner" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Commission Master par Défaut (%)</label>
                                            <input type="number" defaultValue="15" className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all shadow-inner" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button className="px-12 py-6 bg-white text-black rounded-[2.5rem] font-black uppercase italic tracking-widest shadow-2xl hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-105 active:scale-95">Appliquer les changements</button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#080d21] border border-white/10 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic">Modifier le Compte</h3>
                                <p className="text-slate-400 text-sm font-medium">Mise à jour des informations de {editingUser.name}</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nom complet</label>
                                <input
                                    type="text"
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</label>
                                <input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mot de passe</label>
                                <input
                                    type="text"
                                    value={editingUser.password}
                                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Téléphone</label>
                                <input
                                    type="tel"
                                    value={editingUser.phone}
                                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Pays</label>
                                <input
                                    type="text"
                                    value={editingUser.country}
                                    onChange={(e) => setEditingUser({ ...editingUser, country: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Paiements</label>
                                <input
                                    type="text"
                                    value={editingUser.paymentMethods}
                                    onChange={(e) => setEditingUser({ ...editingUser, paymentMethods: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Rôle</label>
                                <select
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-white transition-all appearance-none"
                                >
                                    <option value="Learner">Learner (Apprenant)</option>
                                    <option value="Partner">Partner (Partenaire)</option>
                                    <option value="Master">Master (Revendeur Principal)</option>
                                    <option value="PROVIDER">Provider</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Accès Démo</label>
                                <select
                                    value={editingUser.isDemo ? 'true' : 'false'}
                                    onChange={(e) => setEditingUser({ ...editingUser, isDemo: e.target.value === 'true' })}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-emerald-500 font-bold text-white transition-all appearance-none"
                                >
                                    <option value="false" className="bg-[#080d21]">Non (Officiel)</option>
                                    <option value="true" className="bg-[#080d21]">Oui (Démo)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 py-4 px-6 border border-white/10 hover:bg-white/5 rounded-2xl text-white font-black uppercase tracking-widest transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingUser}
                                    className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
                                >
                                    {isUpdatingUser ? 'Mise à jour...' : 'Confirmer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${active
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <span className="text-xl">{icon}</span>
            <span className="text-sm">{label}</span>
        </button>
    );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
    return (
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl">
            <div className={`text-${color}-400 text-xs font-black uppercase tracking-wider mb-2`}>{label}</div>
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-slate-500 text-xs font-bold">{sub}</div>
        </div>
    );
}

function BarItem({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
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
