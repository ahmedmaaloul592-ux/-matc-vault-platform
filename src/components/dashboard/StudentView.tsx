import React from 'react';
import { useBundles } from '@/hooks/useBundles';
import BundleCard from './BundleCard';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/hooks/useUserProgress';

export default function StudentView({ activeTab }: { activeTab: string }) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedType, setSelectedType] = React.useState('All');
    const [lang, setLang] = React.useState<'FR' | 'EN' | 'AR'>('FR');

    const { bundles, loading } = useBundles({
        search: searchQuery
    });
    const { progressMap, toggleStar, updateProgress } = useUserProgress();
    const { user, token } = useAuth();
    const [selectedBundle, setSelectedBundle] = React.useState<any>(null);

    const [profileData, setProfileData] = React.useState({
        name: '',
        phone: ''
    });
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user?.id,
                    ...profileData
                })
            });
            if (!response.ok) throw new Error('Update failed');
            alert('Profil mis à jour !');
            window.location.reload();
        } catch (error) {
            alert('Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    const categories = [
        { id: 'All', label: 'Tout voir' },
        { id: 'Starred', label: 'Favoris' },
        { id: 'COURSE_SERIES', label: 'Formations' },
        { id: 'DOCUMENT', label: 'Documents' },
        { id: 'VIDEO', label: 'Vidéos' },
        { id: 'EDUCATIONAL_PLATFORM', label: 'Plateformes' }
    ];

    const filteredBundles = bundles.filter(b => {
        // First layer: isDemo filter
        if (user?.isDemo) {
            if (!b.isDemo) return false;
        } else {
            if (b.isDemo) return false;
        }

        // Second layer: Type/Search filter
        if (selectedType === 'Starred') return progressMap[b._id]?.isStarred;
        if (selectedType === 'All') return true;
        if (selectedType === 'DOCUMENT' && (b.resourceType === 'DOCUMENT' || b.resourceType === 'TOOL')) return true;
        return b.resourceType === selectedType;
    });

    const roadmapTranslations = {
        FR: {
            badge: "Vision & Accessibilité",
            title: "Le Savoir QHSE Pour Tous",
            desc: "MATC n'est pas un institut de formation classique, mais un cabinet de conseil qui s'engage à démocratiser l'expertise technique. Notre mission est de vous offrir un accès illimité à des ressources de haute qualité à un coût symbolique.",
            infraNote: {
                title: "Stratégie Cloud & Accessibilité",
                desc: "Pour garantir le prix le plus bas du marché, nos archives volumineuses (Vidéos/Supports) sont actuellement distribuées via des espaces Cloud sécurisés externes (ex: Google Drive). Une expérience full-native est prévue dans notre roadmap technologique 2027."
            },
            cards: {
                model: { title: "Modèle Auto-Dictacte", desc: "Cette plateforme fonctionne sur un modèle de Consultation Libre. En échange d'un prix réduit, l'apprenant avance en toute autonomie. Notez qu'aucun encadrement pédagogique direct ou coaching personnalisé n'est inclus dans ces archives." },
                ai: { title: "L'Expert Intelligent AI", desc: "Pour compenser l'absence d'encadrement humain direct, nous développons une IA capable de répondre à vos questions techniques instantanément." },
                content: { title: "Archives Hebdomadaires", desc: "Nous enrichissons notre bibliothèque chaque semaine avec de nouveaux protocoles, des cours exclusifs et des retours d'expérience concrets." },
                tools: { title: "Interface Personnalisée", desc: "Nous écoutons vos retours pour rendre l'interface de plus en plus intuitive et optimiser votre temps de recherche." }
            },
            banner: {
                title: "Une extension numérique de MATC Consulting",
                desc: "Le \"MATC Vault\" est une plateforme en évolution constante, conçue par notre cellule d'innovation. C'est votre coffre-fort technique personnel.",
                btn: "Visiter le Site Officiel",
                note: "Note : Cette plateforme est actuellement en phase \"Bêta-Evolution\"."
            }
        },
        EN: {
            badge: "Vision & Accessibility",
            title: "QHSE Knowledge For All",
            desc: "MATC is not a traditional training institute, but a consulting firm committed to democratizing technical expertise. Our mission is to provide unlimited access to high-quality resources at a symbolic cost.",
            infraNote: {
                title: "Cloud & Accessibility Strategy",
                desc: "To guarantee the lowest market price, our large archives (Videos/Docs) are currently distributed via external secure Cloud spaces (e.g., Google Drive). A full-native experience is planned in our 2027 technology roadmap."
            },
            cards: {
                model: { title: "Self-Taught Model", desc: "This platform operates on a Free Consultation model. In exchange for a reduced price, the learner progresses independently. Note that no direct pedagogical supervision or personal coaching is included." },
                ai: { title: "Smart AI Expert", desc: "To compensate for the lack of direct human supervision, we are developing an AI capable of answering your technical questions instantly." },
                content: { title: "Weekly Archives", desc: "We enrich our library every week with new protocols, exclusive courses, and concrete professional feedback." },
                tools: { title: "Custom Interface", desc: "We listen to your feedback to make the interface increasingly intuitive and optimize your search time." }
            },
            banner: {
                title: "A digital extension of MATC Consulting",
                desc: "The \"MATC Vault\" is a platform in constant evolution, designed by our innovation unit. It is your personal technical safe.",
                btn: "Visit Official Site",
                note: "Note: This platform is currently in a \"Beta-Evolution\" phase."
            }
        },
        AR: {
            badge: "الرؤية و الوصول",
            title: "المعرفة في متناول الجميع",
            desc: "MATC ليس مجرد معهد تدريب كلاسيكي، بل هو مكتب استشاري ملتزم بتبسيط الخبرة التقنية. مهمتنا هي منحكم وصولاً غير محدود لموارد عالية الجودة بتكلفة رمزية.",
            infraNote: {
                title: "استراتيجية السحابة وسهولة الوصول",
                desc: "لضمان أقل سعر ممكن، يتم تخزين الأرشيفات الضخمة (فيديوهات وملفات) حالياً عبر مساحات سحابية آمنة (مثل Google Drive). ومن المقرر دمجها بالكامل داخل المنصة في خارطة طريق 2027."
            },
            cards: {
                model: { title: "نموذج التعلم الذاتي", desc: "تعمل هذه المنصة على نموذج الاطلاع الحر. مقابل سعر مخفض، يتقدم المتعلم بشكل مستقل تماماً. يرجى العلم أنه لا يوجد تأطير بيداغوجي مباشر أو تدريب شخصي مشمول." },
                ai: { title: "الخبير الذكي AI", desc: "لتعويض غياب التأطير البشري المباشر، نقوم بتطوير ذكاء اصطناعي قادر على الإجابة على أسئلتكم التقنية فوراً." },
                content: { title: "أرشيفات أسبوعية", desc: "نقوم بإثراء مكتبتنا كل أسبوع ببروتوكولات جديدة، دورات حصرية وتجارب مهنية واقعية." },
                tools: { title: "واجهة مخصصة", desc: "نحن نستمع لملاحظاتكم لجعل الواجهة أكثر سهولة وتطويراً لتوفير وقتكم في البحث." }
            },
            banner: {
                title: "امتداد رقمي لـ MATC Consulting",
                desc: "\"MATC Vault\" هي منصة في تطور مستمر، صممت من قبل خلية الابتكار لدينا. إنها خزنتكم التقنية الشخصية.",
                btn: "زيارة الموقع الرسمي",
                note: "ملاحظة: هذه المنصة حالياً في مرحلة \"التطور الأولي\"."
            }
        }
    };

    const t = roadmapTranslations[lang];

    return (
        <div className="relative">
            {activeTab === 'library' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase italic mb-2">Archives Scientifiques</h2>
                            <p className="text-slate-400 font-medium">Accédez à nos ressources techniques, outils et archives QHSE</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher une archive..."
                                    className="w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                                <svg className="w-4 h-4 text-slate-500 absolute right-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedType(cat.id)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedType === cat.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-white/5'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[400px] bg-white/5 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBundles.map((bundle) => (
                                <BundleCard
                                    key={bundle._id}
                                    bundle={bundle}
                                    isStarred={progressMap[bundle._id]?.isStarred}
                                    progress={progressMap[bundle._id]?.progress}
                                    onToggleStar={() => toggleStar(bundle._id)}
                                    onProgressUpdate={(val) => updateProgress(bundle._id, val)}
                                    onOpen={() => setSelectedBundle(bundle)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'innovation' && (
                <div className={`space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ${lang === 'AR' ? 'text-right rtl' : ''}`}>
                    <div className="flex items-center gap-2 justify-end mb-6">
                        {(['FR', 'EN', 'AR'] as const).map(l => (
                            <button
                                key={l}
                                onClick={() => setLang(l)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black border transition-all ${lang === l ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 rounded-[3rem] p-12">
                        <div className="relative z-10 max-w-3xl">
                            <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20 mb-6 inline-block italic">
                                {t.badge}
                            </span>
                            <h2 className="text-5xl font-black text-white uppercase italic leading-tight mb-6">
                                {t.title}
                            </h2>
                            <p className="text-slate-300 text-lg font-medium leading-relaxed mb-8">
                                {t.desc}
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] -mr-16 -mb-16" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="group bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 hover:border-amber-500/30 transition-all duration-500">
                            <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-amber-600/20 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic mb-4">{t.cards.model.title}</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">{t.cards.model.desc}</p>
                        </div>

                        <div className="group bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic mb-4">{t.cards.ai.title}</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">{t.cards.ai.desc}</p>
                        </div>

                        <div className="group bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 hover:border-emerald-500/30 transition-all duration-500">
                            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic mb-4">{t.cards.content.title}</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">{t.cards.content.desc}</p>
                        </div>

                        <div className="group bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 hover:border-rose-500/30 transition-all duration-500">
                            <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-rose-600/20 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic mb-4">{t.cards.tools.title}</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">{t.cards.tools.desc}</p>
                        </div>

                        <div className="md:col-span-2 group bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] p-10 hover:bg-indigo-500/10 transition-all duration-500 border-dashed">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase italic">{t.infraNote.title}</h3>
                            </div>
                            <p className="text-slate-400 font-medium leading-relaxed text-lg italic">
                                "{t.infraNote.desc}"
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 relative overflow-hidden">
                        <div className="grid md:grid-cols-3 gap-12 items-center">
                            <div className="md:col-span-2 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center font-black text-xl">M</div>
                                    <div>
                                        <h4 className="text-white font-black uppercase italic tracking-wider">MATC Vault Lab</h4>
                                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest italic">Division Innovation</p>
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black text-white leading-tight">{t.banner.title}</h3>
                                <p className="text-slate-400 font-medium leading-relaxed">{t.banner.desc}</p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <a href="https://matc-consulting.com" target="_blank" rel="noopener noreferrer" className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase italic tracking-widest text-center hover:bg-slate-200 transition-all">
                                    {t.banner.btn}
                                </a>
                                <p className="text-[9px] text-slate-600 text-center italic">{t.banner.note}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">Mon Profil Apprenant</h2>
                        <p className="text-slate-400 font-medium">Gérez vos informations et votre sécurité</p>
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 max-w-2xl">
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Nom de l'apprenant</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                    placeholder="Votre nom"
                                    className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 font-bold text-white transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Numéro de téléphone</label>
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                    placeholder="+216 -- --- ---"
                                    className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 font-bold text-white transition-all shadow-inner"
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase italic tracking-widest shadow-2xl hover:bg-emerald-500 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Enregistrement...' : 'Mettre à jour le profil'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!['library', 'innovation', 'settings'].includes(activeTab) && (
                <div className="flex items-center justify-center p-20">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10">
                            <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase italic mb-2">Espace {activeTab}</h3>
                        <p className="text-slate-500 font-medium">Cette section est actuellement en cours de développement.</p>
                    </div>
                </div>
            )}

            {/* Course Viewer Modal */}
            {selectedBundle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0b1229] border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white/5 rounded-2xl overflow-hidden shadow-inner border border-white/10">
                                    <img src={selectedBundle.thumbnail} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{selectedBundle.title}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/10">{selectedBundle.category}</span>
                                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{selectedBundle.resourceType?.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedBundle(null)}
                                className="p-4 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-2xl transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Left: Info & Description */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">À propos de cette archive</h4>
                                        <p className="text-slate-300 text-sm leading-relaxed font-medium mb-8">
                                            {selectedBundle.description}
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
                                            <div>
                                                <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Expert / Source</div>
                                                <div className="text-white text-xs font-black italic">{selectedBundle.provider?.name}</div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Type</div>
                                                <div className="text-indigo-400 text-xs font-black italic">{selectedBundle.provider?.type}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedBundle.externalLink && (
                                        <a
                                            href={selectedBundle.externalLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl text-center font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 hover:from-indigo-500 hover:to-indigo-600 transition-all transform hover:-translate-y-1"
                                        >
                                            {lang === 'AR' ? 'فتح مساحة التخزين (Cloud)' : lang === 'EN' ? 'Open Cloud Space (Drive)' : "Ouvrir l'espace Cloud (Drive)"}
                                        </a>
                                    )}

                                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-[2rem] space-y-3">
                                        <div className="flex items-center gap-2 text-indigo-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{(roadmapTranslations as any)[lang].infraNote.title}</span>
                                        </div>
                                        <p className="text-slate-500 text-[10px] leading-relaxed font-bold italic">
                                            {(roadmapTranslations as any)[lang].infraNote.desc}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Sessions List */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-xs font-black text-white uppercase tracking-widest italic">
                                                Programme & Sessions ({selectedBundle.sessions?.length || 0})
                                            </h4>
                                            {selectedBundle.isDemo && (
                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-tighter border border-emerald-500/10 rounded">⭐ Démo</span>
                                            )}
                                        </div>
                                        <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-tighter italic">Mode Consultation Autonome</span>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedBundle.sessions && selectedBundle.sessions.length > 0 ? (
                                            selectedBundle.sessions.map((session: any, idx: number) => (
                                                <div key={idx} className="group bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.05] transition-all flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white/5 group-hover:bg-indigo-600 group-hover:text-white rounded-xl flex items-center justify-center text-slate-500 font-black text-sm transition-all shadow-inner">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-bold text-sm tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{session.title}</div>
                                                            <div className="flex items-center gap-3 mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                {session.videoUrl && (
                                                                    <span className="flex items-center gap-1.5 text-emerald-400 text-[9px] font-black uppercase">
                                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                                        Vidéo de Séance
                                                                    </span>
                                                                )}
                                                                {session.supportUrl && (
                                                                    <span className="flex items-center gap-1.5 text-indigo-400 text-[9px] font-black uppercase">
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                        Support Scientifique
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all transform lg:translate-x-4 lg:group-hover:translate-x-0">
                                                        {session.videoUrl && (
                                                            <button
                                                                onClick={() => window.open(session.videoUrl, '_blank')}
                                                                className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20"
                                                            >
                                                                Voir Vidéo
                                                            </button>
                                                        )}
                                                        {session.supportUrl && (
                                                            <button
                                                                onClick={() => window.open(session.supportUrl, '_blank')}
                                                                className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-white/20 transition-all border border-white/10"
                                                            >
                                                                S'informer
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-24 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/5">
                                                <p className="text-slate-600 font-bold italic text-sm">Contenu en cours d'indexation scientifique...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

