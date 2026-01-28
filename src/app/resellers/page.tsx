"use client";

import Link from 'next/link';

export default function ResellersPage() {
    return (
        <main className="min-h-screen mesh-gradient px-6 py-12 lg:px-24">
            <nav className="flex justify-between items-center mb-24">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
                    QHSE<span className="text-indigo-500">PORTAL</span>
                </Link>
                <Link href="/dashboard" className="px-6 py-2.5 bg-indigo-600 text-white rounded-full glow-btn">
                    Partner Login
                </Link>
            </nav>

            <div className="max-w-5xl mx-auto text-center mb-24">
                <h1 className="text-6xl lg:text-7xl font-black mb-8 gradient-text">Commercial Distribution Program</h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    Scale your business by providing high-demand QHSE certifications to organizations and professionals.
                    Our tiered model is built for both large agencies and individual consultants.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                {/* Tier 1 Card */}
                <div className="glass-card p-12 border-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                        <span className="text-6xl font-black text-white/5 group-hover:text-indigo-500/10 transition-colors">01</span>
                    </div>
                    <h2 className="text-3xl font-black mb-2">Master Commercial</h2>
                    <div className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-8">Tier 1 Partner</div>

                    <ul className="space-y-5 text-slate-400 mb-12">
                        <li className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            Direct Student Sales
                        </li>
                        <li className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            Recruit & Manage Tier 2 Partners
                        </li>
                        <li className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            Bulk License Discounts (40%+)
                        </li>
                        <li className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            Custom Branding Options
                        </li>
                    </ul>

                    <button className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-lg glow-btn">
                        Apply as Master
                    </button>
                </div>

                {/* Tier 2 Card */}
                <div className="glass-card p-12 border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                        <span className="text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">02</span>
                    </div>
                    <h2 className="text-3xl font-black mb-2">Associate Partner</h2>
                    <div className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-8">Tier 2 Reseller</div>

                    <ul className="space-y-5 text-slate-400 mb-12">
                        <li className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            Individual Student Sales
                        </li>
                        <li className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            Full Access to Training Content
                        </li>
                        <li className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            Marketing Support Kits
                        </li>
                        <li className="flex items-center gap-3 text-white/20 line-through">
                            Tier 2 Recruitment Access
                        </li>
                    </ul>

                    <button className="w-full py-4 glass-card border-white/10 rounded-2xl font-black text-lg hover:bg-white/5 transition-colors">
                        Start as Associate
                    </button>
                </div>
            </div>
        </main>
    );
}
