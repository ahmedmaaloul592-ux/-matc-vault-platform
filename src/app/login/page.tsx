"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type LoginStep = 'role' | 'credentials';
type UserType = 'student' | 'partner' | 'master';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const [step, setStep] = useState<LoginStep>('role');
    const [selectedRole, setSelectedRole] = useState<UserType | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRoleSelect = (role: UserType) => {
        setSelectedRole(role);
        setStep('credentials');
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);

            // Redirect to callback URL or dashboard
            const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
            router.push(callbackUrl);
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#080d21] mesh-gradient flex items-center justify-center p-6">
            <div className="w-full max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center font-black text-2xl group-hover:rotate-12 transition-transform">
                            MATC
                        </div>
                        <div className="text-4xl font-black tracking-[0.1em] uppercase">
                            MATC<span className="text-slate-500">VAULT</span>
                        </div>
                    </Link>
                    <h1 className="text-5xl font-black text-white uppercase italic mb-4">
                        Connexion Sécurisée
                    </h1>
                    <p className="text-slate-400 text-lg font-bold">
                        Accédez à votre espace membre MATC Vault
                    </p>
                </div>

                {step === 'role' ? (
                    /* Role Selection */
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Student Card */}
                        <button
                            onClick={() => handleRoleSelect('student')}
                            className="p-12 rounded-[60px] border-2 border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-500 group text-left"
                        >
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <StudentIcon />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4 uppercase italic">Learner</h3>
                            <p className="text-slate-300 font-bold leading-relaxed">
                                Accès à la bibliothèque complète de formations QHSE
                            </p>
                        </button>

                        {/* Partner Card */}
                        <button
                            onClick={() => handleRoleSelect('partner')}
                            className="p-12 rounded-[60px] border-2 border-indigo-500/20 bg-indigo-500/[0.03] hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all duration-500 group text-left"
                        >
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <PartnerIcon />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4 uppercase italic">Partner</h3>
                            <p className="text-slate-300 font-bold leading-relaxed">
                                Gérez vos licences et développez votre réseau
                            </p>
                        </button>

                        {/* Master Card */}
                        <button
                            onClick={() => handleRoleSelect('master')}
                            className="p-12 rounded-[60px] border-2 border-rose-500/20 bg-rose-500/[0.03] hover:bg-rose-500/10 hover:border-rose-500/40 transition-all duration-500 group text-left"
                        >
                            <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <MasterIcon />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4 uppercase italic">Master</h3>
                            <p className="text-slate-300 font-bold leading-relaxed">
                                Pilotez votre réseau de partenaires certifiés
                            </p>
                        </button>
                    </div>
                ) : (
                    /* Login Form */
                    <div className="max-w-md mx-auto">
                        <div className="p-12 rounded-[60px] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
                            <button
                                onClick={() => setStep('role')}
                                className="mb-8 text-slate-400 hover:text-white font-bold flex items-center gap-2 transition-colors"
                            >
                                ← Retour
                            </button>

                            <h2 className="text-3xl font-black text-white mb-8 uppercase italic">
                                {selectedRole === 'student' && 'Learner Login'}
                                {selectedRole === 'partner' && 'Partner Login'}
                                {selectedRole === 'master' && 'Master Login'}
                            </h2>

                            {error && (
                                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                    <p className="text-rose-400 text-sm font-bold">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleLoginSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-slate-300 font-bold mb-2 text-sm uppercase tracking-wider">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="votre@email.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-bold mb-2 text-sm uppercase tracking-wider">
                                        Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Connexion...' : 'Se connecter'}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-slate-400 text-sm font-bold">
                                    Pas encore de compte?{' '}
                                    <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                        S'inscrire
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-[1em]">
                                MATC Ecosystem © 2026
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#080d21] flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
            <LoginContent />
        </Suspense>
    );
}

// Icons
function StudentIcon() {
    return <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
}

function PartnerIcon() {
    return <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}

function MasterIcon() {
    return <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}
