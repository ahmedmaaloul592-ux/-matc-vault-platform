import React from 'react';

export default function ProviderView({ activeTab }: { activeTab: string }) {
    if (activeTab === 'studio') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">Creator Studio</h2>
                        <p className="text-slate-400 font-medium">Gérez vos contenus de formation et vos revenus</p>
                    </div>
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors">
                        + Nouveau Contenu
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 text-center border-dashed border-2 border-white/10 hover:border-indigo-500/50 transition-colors cursor-pointer group">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">Uploader un nouveau Bundle</h3>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto">Glissez vos fichiers ici ou cliquez pour parcourir. Supporte MP4, PDF, et DOCX.</p>
                        </div>

                        <h3 className="text-xl font-black text-white uppercase italic">Vos Contenus Actifs</h3>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center text-slate-500 italic">
                            Aucun contenu publié pour le moment.
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/10 rounded-3xl p-6">
                            <h3 className="text-white font-black uppercase text-sm tracking-wider mb-4">Revenus Est.</h3>
                            <div className="text-4xl font-black text-white mb-2">0.00 TND</div>
                            <div className="text-indigo-300 text-xs font-bold">+0% ce mois</div>
                        </div>

                        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                            <h3 className="text-white font-black uppercase text-sm tracking-wider mb-4">Top Performance</h3>
                            <p className="text-slate-500 text-sm">Vos meilleures ventes apparaîtront ici.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
                <h3 className="text-xl font-black text-white uppercase italic mb-2">Section {activeTab}</h3>
                <p className="text-slate-400">En cours de développement.</p>
            </div>
        </div>
    );
}
