import React from 'react';
import { useBundles } from '@/hooks/useBundles';
import BundleCard from './BundleCard';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/hooks/useUserProgress';

export default function StudentView({ activeTab, setActiveTab }: { activeTab: string, setActiveTab?: (tab: string) => void }) {
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
        const isUnlicensedStudent = user?.role === 'STUDENT' && !user?.hasActiveLicense;
        const isDemoUser = user?.isDemo;

        if (isDemoUser || isUnlicensedStudent) {
            if (!b.isDemo) return false;
        }

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
            },
            strategy: {
                badge: "Opportunités de Croissance",
                title: "L'Espace Business & Partenariat",
                desc: "Le MATC Vault n'est pas qu'une bibliothèque ; c'est un écosystème conçu pour les entrepreneurs QHSE du futur.",
                concept: {
                    title: "Le Concept : La Propriété Intellectuelle Partagée",
                    desc: "Nous avons numérisé des centaines de protocoles, formations et archives techniques. En rejoignant nos programmes Business, vous ne payez plus pour 'apprendre', vous investissez dans des 'droits de distribution' pour générer des revenus récurrents."
                },
                partner: {
                    title: "Profil Partenaire (Indépendant)",
                    desc: "Idéal pour les consultants QHSE et formateurs souhaitant digitaliser leur offre sans frais de développement.",
                    features: ["Double Licence Revendable (2 utilisateurs)", "Marque Blanche Partielle", "Assistance Technique 24/7", "Certificat de Partenariat MATC"]
                },
                master: {
                    title: "Profil Master (Multi-Réseaux)",
                    desc: "Conçu pour les cabinets de conseil et agences RH souhaitant devenir les piliers de notre distribution mondiale.",
                    features: ["Gestion de Réseau (Sub-Partners)", "Tarifs de Gros (Volume Licensing)", "Accès Exclusif aux Nouveautés", "Dashboard d'Analyses Avancées"]
                },
                comparison: {
                    title: "Guide de Sélection : Quel profil vous correspond ?",
                    learner: { tag: "Individuel", title: "Apprenant (Student)", desc: "Idéal pour les étudiants et techniciens qui veulent exploiter l'archive pour leur propre savoir.", profit: "Accès technique illimité", price: "5€ / 3 mois" },
                    partner: { tag: "Business Start", title: "Partenaire (Partner)", desc: "Pour les consultants qui veulent revendre des accès et créer leur propre marque.", profit: "Revente de licences + Branding", price: "100€ / an" },
                    master: { tag: "Enterprise", title: "Master (Agency)", desc: "Pour les structures qui veulent gérer une équipe de partenaires et dominer un marché regional.", profit: "Gestion de réseau + Marges Max", price: "400€ / an" }
                }
            },
            accessDenied: {
                title: "Accès Restreint",
                desc: "Désolé, vous devez posséder une licence valide pour accéder aux Archives Scientifiques. Vous pouvez demander une licence à un partenaire agréé ou essayer la démo.",
                btnDemo: "Demander Accès Démo",
                btnBusiness: "Opportunités Business"
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
            },
            strategy: {
                badge: "Growth Opportunities",
                title: "Business & Partnership Space",
                desc: "MATC Vault is more than just a library; it's an ecosystem designed for future QHSE entrepreneurs.",
                concept: {
                    title: "The Concept: Shared Intellectual Property",
                    desc: "We have digitized hundreds of protocols, training sessions, and technical archives. By joining our Business programs, you no longer pay to 'learn'—you invest in 'distribution rights' to generate recurring revenue."
                },
                partner: {
                    title: "Partner Profile (Independent)",
                    desc: "Ideal for QHSE consultants and trainers who want to digitalize their offerings without development costs.",
                    features: ["Resellable Dual License (2 users)", "Partial White-Labeling", "24/7 Technical Assistance", "MATC Partnership Certificate"]
                },
                master: {
                    title: "Master Profile (Multi-Network)",
                    desc: "Designed for consulting firms and HR agencies who want to become pillars of our global distribution.",
                    features: ["Network Management (Sub-Partners)", "Volume Wholesale Pricing", "Exclusive Access to New Releases", "Advanced Analytics Dashboard"]
                },
                comparison: {
                    title: "Selection Guide: Which profile suits you?",
                    learner: { tag: "Individual", title: "Learner (Student)", desc: "Perfect for students and technicians wanting to leverage the archive for personal learning.", profit: "Unlimited technical access", price: "5€ / 3 months" },
                    partner: { tag: "Business Start", title: "Partner (Partner)", desc: "For consultants wanting to resell access and build their own digital brand.", profit: "License resale + Branding", price: "100€ / year" },
                    master: { tag: "Enterprise", title: "Master (Agency)", desc: "For firms aiming to manage a partner team and dominate a regional market.", profit: "Network management + Max Margins", price: "400€ / year" }
                }
            },
            accessDenied: {
                title: "Access Restricted",
                desc: "Sorry, you must have a valid license to access the Scientific Archives. You can request a license from one of our certified partners or try the demo.",
                btnDemo: "Request Demo Access",
                btnBusiness: "Explore Business Opportunities"
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
            },
            strategy: {
                badge: "فرص النمو",
                title: "فضاء الأعمال والشراكة الإستراتيجية",
                desc: "مشروع MATC Vault ليس مجرد مكتبة رقمية، بل هو نظام بيئي متكامل مصمم لصناعة رواد الأعمال في مجال الـ QHSE.",
                concept: {
                    title: "المفهوم الأساسي: استثمار المعرفة ورقمنتها",
                    desc: "لقد قمنا برقمنة مئات البروتوكولات والدورات التقنية. بانضمامك لبرامجنا، أنت لا تدفع مقابل 'التعلم' فقط، بل تستثمر في 'حقوق التوزيع' لتوليد دخل مستمر من خلال أصول علمية جاهزة."
                },
                partner: {
                    title: "نظام الشريك (Partner)",
                    desc: "مخصص للمدربين والخبراء الذين يرغبون في إطلاق منصتهم الرقمية الخاصة دون تكاليف تطوير باهظة.",
                    features: ["رخصة ثنائية قابلة لإعادة البيع", "لوحة تحكم خاصة لإدارة المشتركين", "دعم فني واستشاري دائم", "شهادة شريك معتمد MATC"]
                },
                master: {
                    title: "نظام الماستر (Master)",
                    desc: "مخصص للمكاتب الكبرى ووكالات التوظيف التي تطمح لقيادة شبكة توزيع وبرند عالمي.",
                    features: ["إدارة شبكة من الشركاء (Sub-Partners)", "أسعار الجملة على الرخص (Volume Licensing)", "أولوية الوصول حصرياً للمحتوى الجديد", "تقارير أداء وتحليلات مالية متقدمة"]
                },
                comparison: {
                    title: "دليل الإختيار: أي حساب يناسب احتياجاتك؟",
                    learner: { tag: "حساب فردي", title: "متعلم (Student)", desc: "مثالي للطلبة والتقنيين الراغبين في استغلال الأرشيف لتطوير مهاراتهم الشخصية.", profit: "وصول كامل للمحتوى التقني", price: "5€ / 3 أشهر" },
                    partner: { tag: "بيزنس ناشئ", title: "شريك (Partner)", desc: "للمستشارين الراغبين في إعادة بيع التراخيص وبناء علامتهم التجارية الرقمية.", profit: "إعادة بيع الرخص + براند خاص", price: "100€ / سنة" },
                    master: { tag: "مستوى المؤسسات", title: "وكيل عام (Master)", desc: "للهياكل التي ترغب في إدارة فريق من الشركاء والسيطرة على سوق إقليمية كاملة.", profit: "إدارة الشبكة + هوامش ربح قصوى", price: "400€ / سنة" }
                }
            },
            accessDenied: {
                title: "الوصول مقيد",
                desc: "عذراً، يجب عليك الحصول على رخصة تفعيل صالحة للوصول للأرشيف العلمي. يمكنك طلب رخصة من أحد شركائنا المعتمدين أو تجربة النسخة التجريبية.",
                btnDemo: "طلب نسخة تجريبية",
                btnBusiness: "استكشاف فرص الشراكة"
            }
        }
    };

    const t = roadmapTranslations[lang];

    return (
        <div className="relative">
            {activeTab === 'library' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {(!user?.hasActiveLicense && !user?.isDemo && user?.role !== 'STUDENT') ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="max-w-xl w-full bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 blur-[80px]" />
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                        <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10M3 12a9 9 0 0117.917-2.18l-3.238 3.238L15 11l-3 3-5-5" /></svg>
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase italic mb-4">{(t as any).accessDenied.title}</h3>
                                    <p className="text-slate-400 font-medium mb-10 leading-relaxed italic">"{(t as any).accessDenied.desc}"</p>
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <button onClick={() => window.location.href = '/login?demo=true'} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20">{(t as any).accessDenied.btnDemo}</button>
                                        <button
                                            onClick={() => setActiveTab?.('strategy')}
                                            className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            {(t as any).accessDenied.btnBusiness}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic mb-2">Archives Scientifiques</h2>
                                    <p className="text-sm md:text-base text-slate-400 font-medium">Accédez à nos ressources techniques, outils et archives QHSE</p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="relative w-full md:w-auto">
                                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher une archive..." className="w-full md:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                                        <svg className="w-4 h-4 text-slate-500 absolute right-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {categories.map((cat) => (
                                    <button key={cat.id} onClick={() => setSelectedType(cat.id)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedType === cat.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-white/5'}`}>{cat.label}</button>
                                ))}
                            </div>
                            {loading ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => <div key={i} className="h-[400px] bg-white/5 rounded-3xl animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredBundles.map((bundle) => (
                                        <BundleCard key={bundle._id} bundle={bundle} isStarred={progressMap[bundle._id]?.isStarred} progress={progressMap[bundle._id]?.progress} onToggleStar={() => toggleStar(bundle._id)} onProgressUpdate={(val) => updateProgress(bundle._id, val)} onOpen={() => setSelectedBundle(bundle)} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'innovation' && (
                <div className={`space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ${lang === 'AR' ? 'text-right rtl' : ''}`}>
                    <div className="flex items-center gap-2 justify-end mb-6">
                        {(['FR', 'EN', 'AR'] as const).map(l => (
                            <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-lg text-[10px] font-black border transition-all ${lang === l ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>{l}</button>
                        ))}
                    </div>
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 rounded-[3rem] p-12">
                        <div className="relative z-10 max-w-3xl">
                            <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20 mb-6 inline-block italic">{t.badge}</span>
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic leading-tight mb-6">{t.title}</h2>
                            <p className="text-slate-300 text-base md:text-lg font-medium leading-relaxed mb-8">{t.desc}</p>
                        </div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] -mr-16 -mb-16" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { color: 'amber', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', title: t.cards.model.title, desc: t.cards.model.desc },
                            { color: 'indigo', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', title: t.cards.ai.title, desc: t.cards.ai.desc },
                            { color: 'emerald', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: t.cards.content.title, desc: t.cards.content.desc },
                            { color: 'rose', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', title: t.cards.tools.title, desc: t.cards.tools.desc }
                        ].map((c, i) => (
                            <div key={i} className={`group bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 hover:border-${c.color}-500/30 transition-all duration-500`}>
                                <div className={`w-16 h-16 bg-${c.color}-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-${c.color}-600/20 group-hover:scale-110 transition-transform`}>
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={c.icon} /></svg>
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase italic mb-4">{c.title}</h3>
                                <p className="text-slate-400 font-medium leading-relaxed">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <h2 className="text-3xl font-black text-white uppercase italic mb-2">Mon Profil Apprenant</h2>
                    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 max-w-2xl">
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <input type="text" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} placeholder="Votre nom" className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 font-bold text-white transition-all shadow-inner" />
                            <input type="tel" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} placeholder="+216 -- --- ---" className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 font-bold text-white transition-all shadow-inner" />
                            <button type="submit" disabled={saving} className="px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase italic tracking-widest shadow-2xl hover:bg-emerald-500 transition-all disabled:opacity-50">{saving ? 'Enregistrement...' : 'Mettre à jour'}</button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'strategy' && (
                <div className={`space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ${lang === 'AR' ? 'text-right rtl' : ''}`}>
                    <div className="flex items-center gap-2 justify-end mb-6">
                        {(['FR', 'EN', 'AR'] as const).map(l => (
                            <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-lg text-[10px] font-black border transition-all ${lang === l ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>{l}</button>
                        ))}
                    </div>
                    <div className="relative overflow-hidden bg-[#080d21] border border-white/10 rounded-[3rem] p-12 text-center">
                        <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20 mb-6 inline-block italic">{t.strategy.badge}</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic leading-tight mb-6">{t.strategy.title}</h2>
                        <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto">{t.strategy.desc}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { title: t.strategy.partner.title, desc: t.strategy.partner.desc, features: t.strategy.partner.features, btn: 'Postuler', color: 'indigo' },
                            { title: t.strategy.master.title, desc: t.strategy.master.desc, features: t.strategy.master.features, btn: 'Devenir Master', color: 'purple', premium: true }
                        ].map((p, i) => (
                            <div key={i} className={`relative group bg-white/[0.03] border border-white/5 rounded-[3rem] p-10 hover:border-${p.color}-500/30 transition-all duration-500 overflow-hidden`}>
                                <h3 className="text-3xl font-black text-white uppercase italic mb-2">{p.title} {p.premium && <span className="px-2 py-1 bg-amber-500 text-black text-[8px] font-black rounded uppercase">Premium</span>}</h3>
                                <p className="text-slate-500 font-bold mb-8">{p.desc}</p>
                                <ul className="space-y-4 mb-10">
                                    {p.features.map((f: string, fi: number) => (
                                        <li key={fi} className="flex items-center gap-3 text-slate-300 font-medium"><svg className={`w-5 h-5 text-${p.color}-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>{f}</li>
                                    ))}
                                </ul>
                                <button className={`w-full py-5 bg-${p.color}-600/10 hover:bg-${p.color}-600 text-${p.color}-400 hover:text-white border border-${p.color}-600/30 rounded-2xl font-black uppercase italic tracking-widest transition-all`}>{p.btn}</button>
                            </div>
                        ))}
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 pt-12 border-t border-white/5">
                        {[
                            { ...t.strategy.comparison.learner, color: 'slate' },
                            { ...t.strategy.comparison.partner, color: 'indigo', highlighted: true },
                            { ...t.strategy.comparison.master, color: 'slate' }
                        ].map((c: any, i) => (
                            <div key={i} className={`bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.04] transition-all ${c.highlighted ? 'scale-105 bg-indigo-600/5 border-indigo-500/20 shadow-xl shadow-indigo-600/5' : ''}`}>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">{c.tag}</div>
                                <h4 className="text-xl font-black text-white uppercase italic mb-4">{c.title}</h4>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{c.desc}</p>
                                <div className="text-2xl font-black text-white">{c.price}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!['library', 'innovation', 'settings', 'strategy'].includes(activeTab) && (
                <div className="flex items-center justify-center p-20 text-center">
                    <h3 className="text-xl font-black text-white uppercase italic mb-2">Espace {activeTab}</h3>
                    <p className="text-slate-500 font-medium">Cette section est actuellement en cours de développement.</p>
                </div>
            )}

            {selectedBundle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0b1229] border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <h3 className="text-2xl font-black text-white uppercase italic">{selectedBundle.title}</h3>
                            <button onClick={() => setSelectedBundle(null)} className="p-4 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-2xl transition-all"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]"><p className="text-slate-300 text-sm leading-relaxed">{selectedBundle.description}</p></div>
                                    {selectedBundle.externalLink && <a href={selectedBundle.externalLink} target="_blank" rel="noopener noreferrer" className="block w-full py-5 bg-indigo-600 text-white rounded-2xl text-center font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all">Ouvrir Cloud</a>}
                                </div>
                                <div className="lg:col-span-2 space-y-3">
                                    {selectedBundle.sessions?.map((session: any, idx: number) => (
                                        <div key={idx} className="group bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.05] flex items-center justify-between">
                                            <div className="flex items-center gap-4"><div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-black text-xs">{idx + 1}</div><h5 className="text-white font-bold text-sm">{session.title}</h5></div>
                                            <div className="flex items-center gap-2">
                                                {session.videoUrl && <button onClick={() => window.open(session.videoUrl, '_blank')} className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400">Vidéo</button>}
                                                {session.supportUrl && <button onClick={() => window.open(session.supportUrl, '_blank')} className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-wider border border-white/10 transition-all hover:bg-white/20">Support</button>}
                                            </div>
                                        </div>
                                    )) || <p className="text-slate-600 italic">Aucune session archivée.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
