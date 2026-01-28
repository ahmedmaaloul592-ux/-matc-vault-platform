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
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
