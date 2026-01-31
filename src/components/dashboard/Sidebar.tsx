import React from 'react';
import { UserRole } from '@/contexts/AuthContext';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    role: UserRole;
    isRtl?: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, role, isRtl = false }: SidebarProps) {
    const menuItems = {
        STUDENT: [
            { id: 'library', label: isRtl ? 'الأرشيف العلمي' : 'Archives Scientifiques', icon: <LibraryIcon /> },
            { id: 'innovation', label: isRtl ? 'الرؤية و التحديثات' : 'Roadmap & Vision', icon: <ActivityIcon /> },
            { id: 'settings', label: isRtl ? 'الإعدادات' : 'Paramètres Profil', icon: <SettingsIcon /> }
        ],
        RESELLER_T2: [
            { id: 'overview', label: isRtl ? 'نظرة عامة' : 'Overview', icon: <ChartIcon /> },
            { id: 'licenses', label: isRtl ? 'التراخيص' : 'My Licenses', icon: <KeyIcon /> },
            { id: 'network', label: isRtl ? 'الشبكة' : 'Network', icon: <NetworkIcon /> },
            { id: 'content', label: isRtl ? 'المحتوى العلمي' : 'Scientific Content', icon: <LibraryIcon /> },
            { id: 'finance', label: isRtl ? 'المالية' : 'Finance', icon: <DollarIcon /> },
            { id: 'settings', label: isRtl ? 'الإعدادات' : 'Settings', icon: <SettingsIcon /> }
        ],
        RESELLER_T1: [
            { id: 'master-overview', label: isRtl ? 'لوحة القيادة' : 'Master Dashboard', icon: <ActivityIcon /> },
            { id: 'stock', label: isRtl ? 'المخزون' : 'License Stock', icon: <LayersIcon /> },
            { id: 'partners', label: isRtl ? 'الشركاء' : 'Partners', icon: <UsersIcon /> },
            { id: 'content', label: isRtl ? 'المحتوى العلمي' : 'Scientific Content', icon: <LibraryIcon /> },
            { id: 'wallet', label: isRtl ? 'المحفظة' : 'Global Wallet', icon: <DollarIcon /> },
            { id: 'settings', label: isRtl ? 'الإعدادات' : 'Settings', icon: <SettingsIcon /> }
        ],
        PROVIDER: [
            { id: 'studio', label: isRtl ? 'الاستوديو' : 'Creator Studio', icon: <VideoIcon /> },
            { id: 'analytics', label: isRtl ? 'التحليلات' : 'Performance', icon: <ChartIcon /> },
            { id: 'payouts', label: isRtl ? 'المدفوعات' : 'Payouts', icon: <DollarIcon /> },
            { id: 'settings', label: isRtl ? 'الإعدادات' : 'Settings', icon: <SettingsIcon /> }
        ],
        ADMIN: [
            { id: 'admin-overview', label: 'Overview', icon: <ActivityIcon /> },
            { id: 'users', label: 'Users', icon: <UsersIcon /> },
            { id: 'content', label: 'Content', icon: <LibraryIcon /> },
            { id: 'system', label: 'System', icon: <SettingsIcon /> },
            { id: 'settings', label: 'Profile', icon: <UserIcon /> }
        ]
    };

    const items = menuItems[role] || menuItems.STUDENT;

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-[#080d21]/95 backdrop-blur-xl border-r border-white/5 p-6 z-40 hidden lg:block">
            <div className="mb-10 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black text-lg">M</div>
                    <div className="text-xl font-black tracking-widest text-white">MATC</div>
                </div>
            </div>

            <div className="space-y-2">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${activeTab === item.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <div className={`${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                            {item.icon}
                        </div>
                        <span className="font-bold text-sm">{item.label}</span>
                    </button>
                ))}
            </div>
        </aside>
    );
}

// Icons
function LibraryIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>; }
function GraduationIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>; }
function ShieldIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>; }
function ChartIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>; }
function KeyIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>; }
function NetworkIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>; }
function DollarIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2-3-.895-3-2M12 4v4m0 4v4" /></svg>; }
function ActivityIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>; }
function LayersIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>; }
function UsersIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>; }
function VideoIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>; }
function SettingsIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function UserIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
