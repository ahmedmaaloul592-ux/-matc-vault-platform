"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import StudentView from '@/components/dashboard/StudentView';
import PartnerView from '@/components/dashboard/PartnerView';
import ProviderView from '@/components/dashboard/ProviderView';
import AdminView from '@/components/dashboard/AdminView';
import SettingsView from '@/components/dashboard/SettingsView';

export default function DashboardPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    // Initial tab selection based on role
    useEffect(() => {
        if (user) {
            if (user.role === 'STUDENT') setActiveTab('library');
            else if (user.role === 'RESELLER_T1' || user.role === 'RESELLER_T2') setActiveTab('overview');
            else if (user.role === 'PROVIDER') setActiveTab('studio');
            else setActiveTab('admin-overview');
        }
    }, [user]);

    // Protect route
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#080d21] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold animate-pulse">Chargement du Dashboard...</p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (activeTab === 'settings') {
            return <SettingsView />;
        }

        switch (user.role) {
            case 'STUDENT':
                return <StudentView activeTab={activeTab} />;
            case 'RESELLER_T1': // Master
            case 'RESELLER_T2': // Partner
                return <PartnerView activeTab={activeTab} />;
            case 'PROVIDER':
                return <ProviderView activeTab={activeTab} />;
            case 'ADMIN':
                return <AdminView activeTab={activeTab} />;
            default:
                return <div>Role unknown</div>;
        }
    };

    return (
        <div className="min-h-screen bg-[#080d21] mesh-gradient text-slate-200 font-['Outfit',sans-serif]">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                role={user.role}
                isRtl={user.country === 'Tunisia' || user.country === 'TN' ? false : false} // Force LTR for now unless config 
            />

            <main className="lg:pl-64 min-h-screen flex flex-col transition-all duration-300">
                {/* Top Header */}
                <header className="sticky top-0 z-30 px-8 py-5 bg-[#080d21]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
                    <h1 className="text-xl font-black text-white uppercase tracking-wider italic">
                        {user.role === 'STUDENT' ? 'Espace Apprenant' :
                            user.role === 'RESELLER_T2' ? 'Espace Partenaire' :
                                user.role === 'RESELLER_T1' ? 'Espace Master' : 'Dashboard'}
                    </h1>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <div className="text-white font-bold text-sm">{user.name}</div>
                                <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{user.role}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
                                {user.name.charAt(0)}
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            title="Déconnexion"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 p-8">
                    {user.role === 'STUDENT' && (user as any).managedBy && (
                        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top duration-700">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Votre Partenaire MATC</div>
                                <h3 className="text-xl font-black text-white italic capitalize">{(user as any).managedBy.name}</h3>
                                <div className="flex items-center justify-center md:justify-start gap-4 mt-1 text-slate-400 text-sm font-medium">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2.945M8 3.935A9 9 0 1116.065 19.865" /></svg>
                                        {(user as any).managedBy.country || 'International'}
                                    </span>
                                </div>
                            </div>
                            {(user as any).managedBy.paymentMethods && (
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl max-w-xs">
                                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-wider mb-2">Instructions de Paiement :</div>
                                    <p className="text-slate-300 text-sm italic font-medium">{(user as any).managedBy.paymentMethods}</p>
                                </div>
                            )}
                        </div>
                    )}
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
