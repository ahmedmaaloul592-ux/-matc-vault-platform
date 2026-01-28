"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'STUDENT' | 'RESELLER_T2' | 'RESELLER_T1';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT' as UserRole,
        phone: '',
        country: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                phone: formData.phone,
                country: formData.country
            });

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <main className="min-h-screen bg-[#080d21] mesh-gradient flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center font-black text-2xl group-hover:rotate-12 transition-transform">
                            MATC
                        </div>
                        <div className="text-4xl font-black tracking-[0.1em] uppercase">
                            MATC<span className="text-slate-500">VAULT</span>
                        </div>
                    </Link>
                    <h1 className="text-5xl font-black text-white uppercase italic mb-4">
                        Créer un compte
                    </h1>
                    <p className="text-slate-400 text-lg font-bold">
                        Rejoignez l'écosystème MATC Vault
                    </p>
                </div>

                {/* Registration Form */}
                <div className="p-12 rounded-[60px] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                            <p className="text-rose-400 text-sm font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-300 font-bold mb-2 text-sm uppercase tracking-wider">
                                    Nom complet *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="Ahmed Ben Salem"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 font-bold mb-2 text-sm uppercase tracking-wider">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="ahmed@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-300 font-bold mb-2 text-sm uppercase tracking-wider">
                                    Mot de passe *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 font-bold mb-2 text-sm uppercase tracking-wider">
                                    Confirmer mot de passe *
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-300 font-bold mb-2 text-sm uppercase tracking-wider">
                                Type de compte *
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                required
                            >
                                <option value="STUDENT" className="bg-[#0a0f2b]">Learner (5€/trimestre)</option>
                                <option value="RESELLER_T2" className="bg-[#0a0f2b]">Partner (100€/an)</option>
                                <option value="RESELLER_T1" className="bg-[#0a0f2b]">Master (400€/an)</option>
                            </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-300 font-bold mb-2 text-sm uppercase tracking-wider">
                                    Téléphone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="+216 -- --- ---"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 font-bold mb-2 text-sm uppercase tracking-wider">
                                    Pays
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="Tunisia"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Création du compte...' : 'Créer mon compte'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm font-bold">
                            Vous avez déjà un compte?{' '}
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                Se connecter
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
        </main>
    );
}
