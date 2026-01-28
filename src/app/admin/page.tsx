"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MOCK_USERS } from '@/lib/mock-data';

export default function AdminGatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [authStep, setAuthStep] = useState<'select' | 'form'>('select');
    const [selectedRole, setSelectedRole] = useState<'admin' | 'provider' | null>(null);

    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRoleSelect = (role: 'admin' | 'provider') => {
        setSelectedRole(role);
        setAuthStep('form');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading('auth');
        setError('');

        // Secure simulation delay
        setTimeout(() => {
            const user = MOCK_USERS[selectedRole!];
            if (user) {
                localStorage.setItem('paymendt_user', JSON.stringify(user));
                router.push('/dashboard');
            } else {
                setLoading(null);
                setError('Accès refusé. Clé de sécurité invalide.');
            }
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative font-['Outfit',sans-serif] overflow-hidden">
            {/* Security Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent shadow-[0_0_20px_rgba(79,70,229,1)]"></div>

            <div className="relative z-10 w-full max-w-2xl space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full mb-4">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></div>
                        <span className="text-rose-500 font-black text-[9px] uppercase tracking-[0.3em]">Restricted Area</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic">PayMendt <span className="text-slate-500 underline decoration-indigo-600 line-offset-8">Admin Gateway</span></h1>
                    <p className="text-slate-500 font-medium italic">Accès réservé aux administrateurs et contributeurs experts certifiés.</p>
                </div>

                <div className="glass-card p-12 rounded-[60px] border border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                    {authStep === 'select' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button
                                    onClick={() => handleRoleSelect('admin')}
                                    className="p-10 rounded-[40px] bg-white/[0.03] border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/[0.05] transition-all group text-left"
                                >
                                    <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black mb-6 group-hover:rotate-12 transition-transform">A</div>
                                    <h3 className="text-2xl font-black italic uppercase italic mb-2">Root Admin</h3>
                                    <p className="text-slate-500 text-xs font-bold italic">Gestion réseau, validation ARTIM & Securité.</p>
                                </button>
                                <button
                                    onClick={() => handleRoleSelect('provider')}
                                    className="p-10 rounded-[40px] bg-white/[0.03] border border-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/[0.05] transition-all group text-left"
                                >
                                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black mb-6 group-hover:rotate-12 transition-transform">E</div>
                                    <h3 className="text-2xl font-black italic uppercase italic mb-2">Expert Contrib</h3>
                                    <p className="text-slate-500 text-xs font-bold italic">Gestion du Vault Scientifique & Archives HQ.</p>
                                </button>
                            </div>
                            <div className="text-center pt-4">
                                <Link href="/" className="text-slate-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">← Retour au site public</Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="flex items-center justify-between mb-4">
                                <button type="button" onClick={() => setAuthStep('select')} className="text-slate-500 hover:text-white text-xs font-black uppercase italic italic transition-colors">← Back</button>
                                <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedRole === 'admin' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                    {selectedRole === 'admin' ? 'SYSTEM ROOT' : 'EXPERT VAULT'}
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Security ID (Email)</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="admin@paymendt.com"
                                        className="w-full bg-white/[0.03] border border-white/10 p-6 rounded-3xl outline-none focus:border-indigo-500 font-bold italic transition-all"
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
                                        className="w-full bg-white/[0.03] border border-white/10 p-6 rounded-3xl outline-none focus:border-indigo-500 font-bold italic transition-all"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-rose-500 text-xs font-black text-center italic animate-shake">{error}</p>}

                            <button
                                disabled={!!loading}
                                className="w-full py-8 bg-white text-black rounded-[35px] font-black uppercase italic tracking-[0.2em] shadow-2xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    "Initialize Secure Session"
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="text-center opacity-30">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[1em]">Secure Environment Port 3000-AD</p>
                </div>
            </div>
        </main>
    );
}
