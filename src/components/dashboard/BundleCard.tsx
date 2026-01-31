import React from 'react';
import Link from 'next/link';
import { TrainingBundle } from '@/hooks/useBundles';

export default function BundleCard({
    bundle,
    isStarred = false,
    progress = 0,
    onToggleStar,
    onProgressUpdate,
    onOpen
}: {
    bundle: TrainingBundle;
    isStarred?: boolean;
    progress?: number;
    onToggleStar?: () => void;
    onProgressUpdate?: (val: number) => void;
    onOpen?: () => void;
}) {
    const isVideo = bundle.stats.videoHours > 0;

    return (
        <div className="group relative bg-[#1e293b]/50 border border-white/5 rounded-3xl overflow-hidden hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-2">
            {/* Star Toggle */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    onToggleStar?.();
                }}
                className={`absolute top-4 right-4 z-30 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 ${isStarred
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-110'
                    : 'bg-black/50 text-slate-400 hover:bg-black/70 border border-white/10'
                    }`}
            >
                <svg className="w-4 h-4" fill={isStarred ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            </button>

            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#080d21] via-transparent to-transparent z-10" />
                <img
                    src={bundle.thumbnail}
                    alt={bundle.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />

                {/* Evolution Pulse */}
                {progress > 0 && (
                    <div className="absolute bottom-4 left-6 right-6 z-20">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-black text-white uppercase tracking-widest italic drop-shadow-md">Évolution</span>
                            <span className="text-[9px] font-black text-white italic drop-shadow-md">{progress}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000 ease-out animate-pulse"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="absolute top-4 left-4 z-20">
                    <div className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">
                            {bundle.stats.hasLiveSupport ? 'Support Live' : 'Archive'}
                        </span>
                    </div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white transform scale-50 group-hover:scale-100 transition-transform duration-500">
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                </div>
            </div>

            <div className="p-6 relative">
                {/* Resource Type Tag */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${bundle.provider.type === 'Expert' ? 'bg-amber-500 text-black' :
                            bundle.provider.type === 'Institute' ? 'bg-indigo-500 text-white' :
                                'bg-rose-500 text-white'
                            }`}>
                            {bundle.provider.name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{bundle.provider.name}</span>
                    </div>
                    {bundle.resourceType && (
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-400/20 px-2 py-0.5 rounded">
                            {bundle.resourceType.replace('_', ' ')}
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-black text-white leading-tight mb-3 group-hover:text-indigo-400 transition-colors">
                    {bundle.title}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                    <div className="flex items-center gap-1.5 text-slate-500">
                        {bundle.resourceType === 'VIDEO' || bundle.resourceType === 'COURSE_SERIES' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : bundle.resourceType === 'TOOL' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        ) : bundle.resourceType === 'EDUCATIONAL_PLATFORM' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {bundle.resourceType === 'VIDEO' ? 'Vidéo Courte' :
                                bundle.resourceType === 'DOCUMENT' ? `${bundle.documentFormat || 'DOC'}` :
                                    bundle.resourceType === 'TOOL' ? 'Outil / Logiciel' :
                                        bundle.resourceType === 'EDUCATIONAL_PLATFORM' ? 'Site Externe' :
                                            `${bundle.stats.videoHours}h / ${bundle.stats.sessionCount || 0} Sessions`}
                        </span>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (onOpen) {
                                onOpen();
                            } else if (bundle.externalLink) {
                                window.open(bundle.externalLink, '_blank');
                            }
                            if (progress < 100) onProgressUpdate?.(progress + 10);
                        }}
                        className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all duration-300"
                    >
                        {bundle.resourceType === 'DOCUMENT' ? 'Accéder au Document' :
                            bundle.resourceType === 'EDUCATIONAL_PLATFORM' ? 'Visiter la plateforme' :
                                'Ouvrir l\'archive'}
                    </button>
                </div>
            </div>
        </div>
    );
}
