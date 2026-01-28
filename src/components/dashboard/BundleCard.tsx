import React from 'react';
import Link from 'next/link';
import { TrainingBundle } from '@/hooks/useBundles';

export default function BundleCard({ bundle }: { bundle: TrainingBundle }) {
    const isVideo = bundle.stats.videoHours > 0;

    return (
        <div className="group relative bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-2">
            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#080d21] via-transparent to-transparent z-10" />
                <img
                    src={bundle.thumbnail}
                    alt={bundle.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 z-20">
                    <div className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">
                            {bundle.stats.hasLiveSupport ? 'Support Live' : 'Archive'}
                        </span>
                    </div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white transform scale-50 group-hover:scale-100 transition-transform duration-500">
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                </div>
            </div>

            <div className="p-6 relative">
                {/* Provider Tag */}
                <div className="flex items-center gap-2 mb-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${bundle.provider.type === 'Expert' ? 'bg-amber-500 text-black' :
                            bundle.provider.type === 'Institute' ? 'bg-indigo-500 text-white' :
                                'bg-rose-500 text-white'
                        }`}>
                        {bundle.provider.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{bundle.provider.name}</span>
                </div>

                <h3 className="text-xl font-black text-white leading-tight mb-3 group-hover:text-indigo-400 transition-colors">
                    {bundle.title}
                </h3>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 text-slate-500">
                        {isVideo ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {isVideo ? `${bundle.stats.videoHours}h Video` : `${bundle.stats.documentCount} Docs`}
                        </span>
                    </div>
                    <div className="w-1 h-1 bg-slate-700 rounded-full" />
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        <span className="text-xs font-bold uppercase tracking-wider">{bundle.rating}/5.0</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Accès Complet</span>
                        <span className="text-lg font-black text-white">{bundle.price} TND</span>
                    </div>
                    <button className="px-6 py-2.5 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all duration-300">
                        Débloquer
                    </button>
                </div>
            </div>
        </div>
    );
}
