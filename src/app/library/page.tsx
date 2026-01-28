"use client";

import { MOCK_ASSETS } from '@/lib/mock-data';
import Link from 'next/link';

export default function AssetLibraryPage() {
    return (
        <main className="min-h-screen bg-[#020617] relative overflow-hidden px-6 py-12 lg:px-24">
            <nav className="relative z-50 flex justify-between items-center mb-24">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl text-white">Q</div>
                    <div className="text-2xl font-black tracking-tighter text-white uppercase group-hover:text-indigo-400 transition-colors">
                        QHSE<span className="text-indigo-500 group-hover:text-white">Hub</span>
                    </div>
                </Link>
                <Link href="/dashboard" className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-sm hover:bg-white/10 transition-all uppercase tracking-widest">
                    Partner Dashboard
                </Link>
            </nav>

            <header className="max-w-4xl mb-32 relative z-10">
                <div className="text-indigo-500 font-black text-xs uppercase tracking-[0.3em] mb-4">Certified Inventory</div>
                <h1 className="text-6xl lg:text-7xl font-black mb-10 gradient-text leading-tight">Expert Content & <br /> Technical Support.</h1>
                <p className="text-xl text-slate-400 leading-relaxed font-medium">
                    Access high-definition recordings from global experts combined with full technical
                    documentation (Scientific Support) for specialized QHSE sectors.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
                {MOCK_ASSETS.map((asset) => (
                    <div key={asset.id} className="glass-card group overflow-hidden border-white/5 hover:border-indigo-500/30 transition-all">
                        <div className="relative h-72">
                            <img src={asset.thumbnail} alt={asset.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-90" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-indigo-600/80 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest">Recorded Package</span>
                                    {asset.supportIncluded && <span className="px-3 py-1 bg-emerald-600/80 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest">Support Included</span>}
                                </div>
                            </div>
                        </div>

                        <div className="p-10">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Presented by {asset.expertName}</div>
                            <h3 className="text-3xl font-black text-white mb-4 group-hover:text-indigo-400 transition-all leading-tight">{asset.title}</h3>
                            <p className="text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed font-medium">
                                {asset.description}
                            </p>

                            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                <div className="flex gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-1">Expert Sessions</span>
                                        <span className="text-white font-black text-sm uppercase">{asset.videoDuration.split(' ')[0]} Hrs</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-1">Scientific Support</span>
                                        <span className="text-white font-black text-sm uppercase">{asset.documents.length} Docs</span>
                                    </div>
                                </div>
                                <button className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Support Hub Card */}
                <div className="glass-card p-12 flex flex-col justify-center border-dashed border-indigo-500/20 bg-indigo-500/[0.02]">
                    <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-8 border border-indigo-500/20">
                        <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <h3 className="text-3xl font-black mb-4">Scientific Support Hub</h3>
                    <p className="text-slate-500 font-medium mb-10 leading-relaxed">Direct support line for all asset participants. We ensure the scientific content is mastered through dedicated assistance.</p>
                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">Contact Support Team</button>
                </div>
            </div>
        </main>
    );
}
