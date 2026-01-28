import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminView({ activeTab }: { activeTab: string }) {
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'admin-overview' && token) {
            fetchStats();
        }
    }, [activeTab, token]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (activeTab === 'admin-overview') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase italic mb-2">Administration Centrale</h2>
                    <p className="text-slate-400 font-medium">Vue d'ensemble de l'écosystème MATC Vault</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}
                    </div>
                ) : stats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Utilisateurs Total"
                            value={stats.users.total}
                            sub={`${stats.users.breakdown.STUDENT || 0} Apprenants`}
                            color="indigo"
                        />
                        <StatCard
                            label="Revenus Générés"
                            value={`${stats.sales.revenue}€`}
                            sub="Est. Total"
                            color="emerald"
                        />
                        <StatCard
                            label="Licences Vendues"
                            value={stats.sales.licenses}
                            sub={`${stats.sales.active} Actives`}
                            color="amber"
                        />
                        <StatCard
                            label="Bundles Contenu"
                            value={stats.content.bundles}
                            sub="Formations & Docs"
                            color="rose"
                        />
                    </div>
                ) : null}

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                        <h3 className="text-xl font-black text-white uppercase italic mb-6">Distribution Utilisateurs</h3>
                        {stats && (
                            <div className="space-y-4">
                                <BarItem label="Administrateurs" count={stats.users.breakdown.ADMIN || 0} total={stats.users.total} color="bg-rose-500" />
                                <BarItem label="Providers" count={stats.users.breakdown.PROVIDER || 0} total={stats.users.total} color="bg-amber-500" />
                                <BarItem label="Masters" count={stats.users.breakdown.RESELLER_T1 || 0} total={stats.users.total} color="bg-emerald-500" />
                                <BarItem label="Partners" count={stats.users.breakdown.RESELLER_T2 || 0} total={stats.users.total} color="bg-indigo-500" />
                                <BarItem label="Apprenants" count={stats.users.breakdown.STUDENT || 0} total={stats.users.total} color="bg-slate-500" />
                            </div>
                        )}
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h4 className="text-white font-bold">Activités Récentes</h4>
                            <p className="text-slate-500 text-sm">Le journal d'activité système sera bientôt disponible.</p>
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

function StatCard({ label, value, sub, color }: any) {
    return (
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl">
            <div className={`text-${color}-400 text-xs font-black uppercase tracking-wider mb-2`}>{label}</div>
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-slate-500 text-xs font-bold">{sub}</div>
        </div>
    );
}

function BarItem({ label, count, total, color }: any) {
    const percent = total > 0 ? (count / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                <span>{label}</span>
                <span>{count}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}
