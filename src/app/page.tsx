"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_BUNDLES, MOCK_RESELLERS, Reseller } from '@/lib/mock-data';

type Language = 'fr' | 'ar' | 'en';

const translations = {
  fr: {
    nav: { login: 'Connexion', subtitle: 'MATC Scientific Vault' },
    hero: {
      tag: 'Archive on Demand',
      title: 'Scientific Assets Vault HQ',
      desc: "MATC Vault est l'Écosystème Numérique de référence dédié à la préservation et la haute valorisation d'actifs scientifiques QHSE. Nous combinons un accès exclusif à des archives certifiées et un modèle collaboratif d'élite où chaque ressource technique est validée par nos experts pour garantir l'excellence scientifique.",
      b1: { title: 'Archives Enregistrées', desc: 'Accès instantané aux sessions HD archivées de workshops réels' },
      b2: { title: 'Vault Documentaire', desc: 'SOPs, rapports d\'audit et modèles techniques prêts à l\'usage' },
      b3: { title: 'Modèle Commercial', desc: 'Transformez vos accès numériques en opportunités d\'affaires rentables' }
    },
    royalty: {
      title: 'Enrichissez le Vault. Créez de la Valeur',
      desc: 'En tant que partenaire, chaque contribution technique ajoutée est soumise à une validation experte par l\'administration avant d\'être publiée, générant des crédits de renouvellement cumulables pour vos prochaines années',
      item1: 'Série Inédite Archivée (Validation Admin)',
      item2: 'Document/Vidéo Technique (Filtre Qualité)',
      item3: 'Cumulable sur Exercices Futurs'
    },
    roles: {
      title: 'Accès au Stock Numérique',
      subtitle: 'Niveaux de Distribution & Intégration Écosystème',
      l: { title: 'LEARNER', desc: 'Accès illimité aux archives QHSE de pointe pour seulement 5€ / trimestre', badge: 'Meilleure Offre', btn: 'Activer mon Accès (5€)', promo: 'Tarif imbattable à l\'échelle internationale' },
      p: { title: 'PARTNER', desc: 'Exploitez le stock numérique, gérez vos licences et contribuez au contenu (après approbation admin) pour 100€ / an', badge: 'Profil Business', btn: 'Contacter un Master' },
      m: { title: 'MASTER', desc: 'Maximisez vos profits : Distribuez directement, piloter votre réseau et publiez vos propres archives certifiées pour 400€ / an', badge: 'Network Leader', btn: 'Contacter via WhatsApp' }
    },
    showcase: {
      title: 'Patrimoine Scientifique QHSE',
      subtitle: 'Bibliothèque technique d\'excellence destinée aux experts et ingénieurs en Management QSE. Chaque archive est validée par le comité scientifique MATC.',
      label: 'Asset Vault',
      size: 'Volume Archives',
      method: 'Flux On-Demand'
    },
    artim: {
      title: 'PAIEMENT VIA ARTIM APP',
      desc: "Toutes les transactions financières, la gestion des licences et le suivi des royalties s'effectuent exclusivement via l'application mobile ARTIM",
      wallet: 'Identifiant Portefeuille ARTIM',
      btn: 'Validation WhatsApp'
    },
    directory: {
      title: "Réseau d'Agents Certifiés",
      desc: 'Annuaire officiel des distributeurs agréés par zone géographique et protocole local',
      contactBtn: 'Contact WhatsApp'
    },
    vision: {
      tag: 'Horizon 2026',
      title: "L'Avenir est Intelligent. Cap sur Juin 2026",
      desc: "MATC Vault intégrera l'Intelligence Artificielle (AI) pour proposer des outils d'audit prédictifs et une assistance automatisée à la conformité"
    },
    promo: {
      text: "🔥 OFFRE BETA LIMITÉE : Testez la plateforme pendant 30 jours (Contenu Limité) - Réservé aux 10 premiers !",
      prices: "PARTNER: 35€ / MASTER: 150€ (au lieu de 100€/400€)",
      close: "Fermer"
    },
    demo: {
      text: "🚧 SITE EN BETA : Création de compte ouverte pour tester le système.",
      sub: "C'est le dernier jour pour profiter de l'offre '10 Premiers' !",
      close: "J'ai compris"
    },
    protocol: {
      title: "Protocole de Distribution Officiel",
      feb: {
        title: "Février 2026 : Phase Alpha",
        desc: "Le règlement des accès PARTNER (35€) et MASTER (150€) se fait directement via WhatsApp."
      },
      postFeb: {
        title: "Dès Mars 2026 : Phase Beta",
        desc: "Le support central ne traitera que les demandes MASTER. Les accès LEARNER sont strictement réservés à la distribution via les partenaires."
      },
      warning: "IMPORTANT : Le Support Central ne vend JAMAIS d'accès LEARNER (5€) directement."
    }
  },
  ar: {
    nav: { login: 'دخول الأعضاء', subtitle: 'خزنة MATC العلمية' },
    hero: {
      tag: 'أرشيف تخصصي عند الطلب',
      title: 'مقر خزنة الأصول العلمية للمحترفين',
      desc: "تعتبر خزنة MATC المنظومة الرقمية المرجعية المخصصة لحفظ وتثمين الأصول العلمية في مجال الجودة والسلامة والبيئة. نجمع بين الوصول الحصري للأرشيفات المعتمدة ونموذج تعاوني فريد حيث تخضع كل مساهمة تقنية لتدقيق خبرائنا لضمان التميز العلمي.",
      b1: { title: 'أرشيفات مسجلة', desc: 'مشاهدة فورية لجلسات وورش عمل حقيقية بجودة عالية' },
      b2: { title: 'خزنة الوثائق التقنية', desc: 'آلاف النماذج وسجلات التدقيق الجاهزة للتنفيذ الميداني' },
      b3: { title: 'نموذج تجاري مرن', desc: 'حول حقوق الوصول الرقمية إلى مشروع أعمال مربح ومستدام' }
    },
    royalty: {
      title: 'أثرِ الخزنة الرقمية.. وضاعف أرباحك',
      desc: 'كشريك استراتيجي، كل مساهمة علمية ترفعها تخضع لتدقيق فني وبروتوكول جودة من قبل الإدارة قبل النشر، وتولّد رصيد خصم تراكمي يُحتسب لك في تجديدات السنوات القادمة',
      item1: 'سلسلة مؤرشفة (تدقيق إداري)',
      item2: 'وثيقة تقنية (فلترة الجودة)',
      item3: 'تراكمي لجميع السنوات القادمة'
    },
    roles: {
      title: 'الوصول إلى المخزون الرقمي',
      subtitle: 'مستويات التوزيع والاندماج في المنظومة الاقتصادية',
      l: { title: 'متعلم', desc: 'وصول غير محدود للأرشيف العلمي التخصصي مقابل 5 يورو فقط كل 3 أشهر', badge: 'أفضل قيمة', btn: 'تفعيل الوصول (5€)', promo: 'سعر تنافسي لا مثيل له عالمياً' },
      p: { title: 'شريك', desc: 'استثمر في المخزون الرقمي، أدر تراخيصك وساهم في إثراء المحتوى (بعد موافقة الإدارة) بـ 100 يورو سنوياً', badge: 'بروفايل أعمال', btn: 'تواصل مع الوكيل العام' },
      m: { title: 'وكيل عام', desc: 'ضاعف أرباحك: قم بالتوزيع المباشر، إدراة شبكتك ونشر أرشيفك العلمي المعتمد بـ 400 يورو سنوياً', badge: 'قائد شبكة', btn: 'تواصل عبر واتساب' }
    },
    showcase: {
      title: 'التراث العلمي الرقمي للـ QHSE',
      subtitle: 'مكتبة تقنية متكاملة مخصصة للخبراء. كل أرشيف يتم تدقيقه من قبل اللجنة العلمية لـ MATC قبل العرض',
      label: 'أصل رقمي',
      size: 'حجم الأرشيف',
      method: 'وصول مباشر'
    },
    artim: {
      title: 'الدفع عبر تطبيق ARTIM',
      desc: 'نعتمد تطبيق ARTIM كوسيلة الدفع الوحيدة لإدارة الاشتراكات، التحويلات المالية الفورية وتتبع نظام العمولات (Royalties)',
      wallet: 'معرف محفظة ARTIM',
      btn: 'التأكيد عبر واتساب'
    },
    directory: {
      title: 'السجل الرسمي للوكلاء المعتمدين',
      desc: 'الدليل المعتمد للموزعين الرسميين حسب التوزيع الجغرافي وطرق الدفع المحلية',
      contactBtn: 'تواصل واتساب'
    },
    vision: {
      tag: 'رؤية 2026',
      title: 'الذكاء الاصطناعي.. قادم في جوان 2026',
      desc: 'ستشهد المنصة دمج تقنيات الذكاء الاصطناعي لتوفير حلول تنبؤية في السلامة وأدوات تدقيق ذكية مؤتمتة'
    },
    promo: {
      text: "🔥 عرض تجريبي محدود: جرب المنصة لمدة 30 يوم (محتوى محدود) - لأول 10 مشتركين فقط!",
      prices: "شريك: 35€ / وكيل عام: 150€ (بدلاً من 100€/400€)",
      close: "إغلاق"
    },
    demo: {
      text: "🚧 نسخة تجريبية: التسجيل مفتوح لتجربة النظام.",
      sub: "هذا هو آخر أجل لحجز مقعدك ضمن عرض العشرة الأوائل!",
      close: "فهمت"
    },
    protocol: {
      title: "بروتوكول التوزيع الرسمي",
      feb: {
        title: "فيفري 2026: المرحلة الأولى",
        desc: "عمليات الدفع لرتبة شريك (35€) ووكيل عام (150€) تتم مباشرة عبر واتساب."
      },
      postFeb: {
        title: "ابتداءً من مارس 2026: المرحلة الثانية",
        desc: "الدعم المركزي سيتخصص فقط في رتبة وكيل عام (MASTER). رتبة متعلم (LEARNER) لا تباع إلا عبر الموزعين المعتمدين."
      },
      warning: "تنبيه هام: الدعم المركزي لا يبيع رتبة متعلم (LEARNER) مباشرة نهائياً."
    }
  },
  en: {
    nav: { login: 'Member Login', subtitle: 'MATC Scientific Vault' },
    hero: {
      tag: 'Specialized Archive on Demand',
      title: 'Scientific Assets Vault HQ',
      desc: "MATC Vault is the premier Digital Ecosystem dedicated to the preservation and high-value leveraging of QHSE scientific assets. We provide exclusive access to certified archives and an elite collaborative model where every technical resource is validated by our experts to ensure scientific excellence.",
      b1: { title: 'Recorded Archives', desc: 'Instant access to HD recordings of real-world technical sessions' },
      b2: { title: 'Technical Vault', desc: 'SOPs, audit templates and checklists ready for field deployment' },
      b3: { title: 'Business Model', desc: 'Transform your digital access rights into high-growth business ops' }
    },
    royalty: {
      title: 'Enrich the Vault. Scale your Value',
      desc: 'As a strategic partner, every technical contribution you upload undergoes expert validation by the administration before publishing, generating cumulative renewal credits',
      item1: 'New Archived Series (Admin Approved)',
      item2: 'Tech Video/Document (Quality Filter)',
      item3: 'Cumulative for future exercises'
    },
    roles: {
      title: 'Digital Stock Access',
      subtitle: 'Distribution Layers & Ecosystem Integration',
      l: { title: 'LEARNER', desc: 'Unlimited access to core QHSE archives for only 5€ / quarter', badge: 'Best Value', btn: 'Activate Access (5€)', promo: 'Globally unbeatable pricing' },
      p: { title: 'PARTNER', desc: 'Leverage the digital assets, manage licenses and contribute content (after admin approval) for 100€ / year', badge: 'Business Profile', btn: 'Contact a Master' },
      m: { title: 'MASTER', desc: 'Maximize profits: Direct distribution, network management and publication of your own certified archives for 400€ / year', badge: 'Network Leader', btn: 'Contact via WhatsApp' }
    },
    showcase: {
      title: 'QHSE Scientific Heritage',
      subtitle: 'Excellence technical library for QSE management. Every archive is validated by the MATC scientific committee before display.',
      label: 'Vault Asset',
      size: 'Archive Volume',
      method: 'On-Demand Stream'
    },
    artim: {
      title: 'PAYMENT VIA ARTIM APP',
      desc: 'All financial transactions, license renewals and royalty tracking are securely processed exclusively through the ARTIM mobile application',
      wallet: 'ARTIM Wallet ID',
      btn: 'WhatsApp Validation'
    },
    directory: {
      title: 'Official Certified Agent Registry',
      desc: 'Certified directory of authorized resellers mapped locally by payment protocols',
      contactBtn: 'WhatsApp Contact'
    },
    vision: {
      tag: 'Roadmap 2026',
      title: 'The Future is Intelligent. June 2026',
      desc: 'MATC Vault will integrate AI technology to provide predictive safety tools and automated compliance assistance'
    },
    promo: {
      text: "🔥 LIMITED BETA OFFER: Test the platform for 30 days (Limited Content) - First 10 users only!",
      prices: "PARTNER: 35€ / MASTER: 150€ (instead of 100€/400€)",
      close: "Close"
    },
    demo: {
      text: "🚧 BETA SITE: Account creation open for system testing.",
      sub: "This is the final deadline to claim the 'First 10' offer!",
      close: "Understood"
    },
    protocol: {
      title: "Official Distribution Protocol",
      feb: {
        title: "February 2026: Alpha Phase",
        desc: "Payments for PARTNER (35€) and MASTER (150€) access are processed directly via WhatsApp."
      },
      postFeb: {
        title: "From March 2026: Beta Phase",
        desc: "Central support will only handle MASTER requests. LEARNER access is strictly reserved for reseller-only distribution."
      },
      warning: "IMPORTANT: Central Support NEVER sells LEARNER access (5€) directly."
    }
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('fr');
  const [showPromo, setShowPromo] = useState(true);
  const [showDemo, setShowDemo] = useState(true);
  const [realSellers, setRealSellers] = useState<Reseller[]>([]);
  const t = translations[lang] as any;
  const isRtl = lang === 'ar';

  useEffect(() => {
    // Set deadline to 30 days from now (or a specific beta end date)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("EXPIRED");
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [timeLeft, setTimeLeft] = useState("");

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/sellers');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setRealSellers(data);
        } else {
          setRealSellers(MOCK_RESELLERS);
        }
      } else {
        setRealSellers(MOCK_RESELLERS);
      }
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
      setRealSellers(MOCK_RESELLERS);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const masters = realSellers.length > 0
    ? realSellers.filter(r => r.role === 'MASTER')
    : MOCK_RESELLERS.filter(r => r.role === 'MASTER');

  const partners = realSellers.length > 0
    ? realSellers.filter(r => r.role === 'PARTNER')
    : MOCK_RESELLERS.filter(r => r.role === 'PARTNER');

  const head = MOCK_RESELLERS.find(r => r.role === 'HEAD');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className={`min-h-screen bg-[#080d21] mesh-gradient text-white overflow-x-hidden relative font-['Outfit',sans-serif] ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Promo Banner */}
      {showPromo && (
        <div className="relative w-full z-[100] animate-in slide-in-from-top duration-500">
          <div className="bg-gradient-to-r from-indigo-600 via-rose-600 to-indigo-600 p-1">
            <div className="bg-[#080d21] px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between backdrop-blur-3xl">
              <div className="flex-1 flex items-center justify-center gap-4 flex-wrap">
                <span className="flex p-2 rounded-lg bg-white/10">
                  <span className="text-white font-black text-xs">OFFRE 10/10</span>
                </span>
                <p className="font-black text-white text-sm italic tracking-tight">
                  <span className="hidden md:inline">{t.promo.text}</span>
                  <span className="ml-2 text-indigo-400 border-l border-white/20 pl-4">{t.promo.prices}</span>
                </p>
                <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg border border-white/10">
                  <svg className="w-4 h-4 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-mono text-emerald-400 font-bold text-xs">{timeLeft}</span>
                </div>
              </div>
              <button
                onClick={() => setShowPromo(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors group"
              >
                <span className="sr-only">{t.promo.close}</span>
                <svg className="h-5 w-5 text-white group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[150px] rounded-full"></div>
      </div>

      {/* Navbar - Restyled */}
      <nav className="relative z-50 flex justify-between items-center px-6 lg:px-24 py-10">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-16 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-xl group-hover:rotate-12 transition-transform duration-500">MATC</div>
          <div className="text-3xl font-black tracking-[0.1em] uppercase">MATC<span className="text-slate-500">VAULT</span></div>
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex items-center bg-white/[0.03] backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-inner">
            {(['fr', 'ar', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all duration-300 ${lang === l ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <Link href="/login" className="hidden md:flex px-8 py-3 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all duration-500 shadow-xl">{t.nav.login}</Link>
        </div>
      </nav>

      {/* Hero Section - Refined Design */}
      <section className="relative z-10 px-6 lg:px-24 pt-16 pb-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
              <span className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">{t.hero.tag}</span>
            </div>
            <h1 className="text-6xl lg:text-[7rem] font-black leading-[1.1] tracking-[-0.02em] uppercase italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              {t.hero.title}
            </h1>
            <p className="text-2xl text-slate-100 font-bold leading-relaxed max-w-xl italic border-s-4 border-indigo-500 pl-6">
              {t.hero.desc}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 pt-4">
              <Benefit num="01" title={t.hero.b1.title} desc={t.hero.b1.desc} color="indigo" />
              <Benefit num="02" title={t.hero.b2.title} desc={t.hero.b2.desc} color="emerald" />
              <Benefit num="03" title={t.hero.b3.title} desc={t.hero.b3.desc} color="rose" />
            </div>
          </div>
          <div className="relative group overflow-hidden rounded-[80px]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent z-10 opacity-60 group-hover:opacity-20 transition-opacity duration-700"></div>
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800"
              className="relative z-0 rounded-[80px] border border-white/5 grayscale-[50%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
              alt="QHSE Platform Vision"
            />
          </div>
        </div>
      </section>

      {/* Loyalty / Royalty Section - Enhanced Grid */}
      <section className="relative z-10 px-6 lg:px-24 py-40 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <h2 className="text-5xl lg:text-8xl font-black text-white tracking-tighter uppercase italic text-glow">{t.royalty.title}</h2>
          <p className="text-xl text-slate-200 font-bold leading-relaxed max-w-3xl mx-auto italic">{t.royalty.desc}</p>
          <div className="grid md:grid-cols-3 gap-10">
            <RoyaltyCard val="-1€" label={t.royalty.item1} color="indigo" />
            <RoyaltyCard val="-0.1€" label={t.royalty.item2} color="emerald" />
            <RoyaltyCard val="LifeTime" label={t.royalty.item3} color="rose" dashed />
          </div>
        </div>
      </section>

      {/* Role Selection - Premium Cards */}
      <section className="relative z-10 px-6 lg:px-24 py-40">
        <div className="text-center mb-40">
          <h2 className="text-5xl lg:text-8xl font-black text-white tracking-tighter uppercase italic leading-none mb-10 text-glow">{t.roles.title}</h2>
          <p className="text-slate-300 text-[12px] font-black uppercase tracking-[0.6em] italic">{t.roles.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto items-center">
          {/* Learner Card */}
          <RoleCard
            badge={t.roles.l.badge}
            title={t.roles.l.title}
            desc={t.roles.l.desc}
            promo={t.roles.l.promo}
            btn={t.roles.l.btn}
            color="emerald"
            onClick={() => scrollToSection('partners')}
            isRtl={isRtl}
          />
          {/* Partner Card - Featured */}
          <RoleCard
            badge={t.roles.p.badge}
            title={t.roles.p.title}
            desc={t.roles.p.desc}
            btn={t.roles.p.btn}
            color="indigo"
            featured
            onClick={() => scrollToSection('masters')}
            isRtl={isRtl}
          />
          {/* Master Card */}
          <RoleCard
            badge={t.roles.m.badge}
            title={t.roles.m.title}
            desc={t.roles.m.desc}
            btn={t.roles.m.btn}
            color="rose"
            onClick={() => scrollToSection('artim')}
            isRtl={isRtl}
          />
        </div>
      </section>

      {/* Showcase - Cinematic Grid */}
      <section className="px-6 lg:px-24 py-40 bg-white/[0.01]">
        <div className="text-center mb-32 relative">
          <h2 className="text-6xl lg:text-[12rem] font-black text-white/[0.03] absolute left-1/2 -translate-x-1/2 -top-24 select-none uppercase tracking-[0.1em]">Exclusive</h2>
          <h2 className="text-5xl lg:text-[6rem] font-black text-white tracking-[-0.04em] uppercase italic leading-none relative z-10">{t.showcase.title}</h2>
          <p className="text-slate-500 text-xl font-bold mt-10 italic max-w-3xl mx-auto opacity-70">{t.showcase.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {MOCK_BUNDLES.map(b => (
            <div key={b.id} className="group relative overflow-hidden rounded-[50px] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all duration-700">
              <div className="aspect-square overflow-hidden relative">
                <img src={b.thumbnail} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000 opacity-40 group-hover:opacity-80" alt={b.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
                <div className="absolute top-8 right-8">
                  <div className="px-5 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">{t.showcase.label}</div>
                </div>
              </div>
              <div className={`p-10 ${isRtl ? 'text-right' : 'text-left'} space-y-6`}>
                <h3 className="text-3xl font-black text-white leading-tight italic tracking-tighter">{b.title}</h3>
                <div className="flex justify-between items-center pt-8 border-t border-white/5">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-1 tracking-widest">{t.showcase.size}</span>
                    <span className="text-2xl font-black text-white">{b.stats.videoHours}h Archive</span>
                  </div>
                  <Link href="/login" className="text-indigo-400 font-bold italic group-hover:translate-x-3 transition-transform hover:text-white cursor-pointer select-none">
                    {t.showcase.method} →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Distribution Protocol Section - New */}
      <section className="px-6 lg:px-24 py-40 bg-[#0a0f2b] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 blur-[120px] rounded-full"></div>
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-8">
            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tight uppercase italic text-glow">{t.protocol.title}</h2>
            <div className="h-1 w-40 bg-indigo-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Feb Rule */}
            <div className="glass-card p-12 rounded-[60px] border border-indigo-500/20 bg-indigo-500/[0.03] space-y-6 hover:scale-105 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse"></div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{t.protocol.feb.title}</h3>
              </div>
              <p className="text-xl text-slate-200 font-bold leading-relaxed italic">{t.protocol.feb.desc}</p>
            </div>

            {/* Post-Feb Rule */}
            <div className="glass-card p-12 rounded-[60px] border border-rose-500/20 bg-rose-500/[0.03] space-y-6 hover:scale-105 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-rose-500 animate-pulse"></div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{t.protocol.postFeb.title}</h3>
              </div>
              <p className="text-xl text-slate-200 font-bold leading-relaxed italic">{t.protocol.postFeb.desc}</p>
            </div>
          </div>

          <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[40px] text-center max-w-4xl mx-auto backdrop-blur-3xl">
            <p className="text-rose-400 font-black uppercase text-xs tracking-[0.2em] italic">{t.protocol.warning}</p>
          </div>
        </div>
      </section>


      {/* Official Directory - Agency Cards */}
      <section className="px-6 lg:px-24 py-40">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h2 className="text-5xl lg:text-[7rem] font-black text-white tracking-[-0.04em] uppercase italic leading-none">{t.directory.title}</h2>
            <p className={`text-slate-200 text-2xl font-black italic ${isRtl ? 'border-r-8 pr-8' : 'border-l-8 pl-8'} border-indigo-500 inline-block`}>{t.directory.desc}</p>
          </div>

          {/* Masters */}
          <div id="masters" className="scroll-mt-20 space-y-16">
            <div className={`flex items-center gap-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="h-[3px] w-24 bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.5)]"></div>
              <h3 className="text-3xl font-black text-rose-500 uppercase tracking-[0.2em] italic underline underline-offset-[16px]">Master Resellers</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {masters.map(m => (
                <ResellerCard key={m.id} reseller={m} contactBtn={t.directory.contactBtn} isRtl={isRtl} variant="rose" />
              ))}
            </div>
          </div>

          {/* Partners */}
          <div id="partners" className="scroll-mt-20 space-y-16">
            <div className={`flex items-center gap-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="h-[3px] w-24 bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]"></div>
              <h3 className="text-3xl font-black text-indigo-400 uppercase tracking-[0.2em] italic underline underline-offset-[16px]">Partner Resellers</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {partners.map(p => (
                <ResellerCard key={p.id} reseller={p} contactBtn={t.directory.contactBtn} isRtl={isRtl} variant="indigo" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Ethics Section */}
      <section className="px-6 lg:px-24 py-40 bg-[#080a1a] border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_30px_rgba(79,70,229,1)]"></div>
        <div className="max-w-5xl mx-auto text-center space-y-16 relative z-10">
          <div className="inline-block px-8 py-3 bg-indigo-500/10 text-indigo-400 text-[11px] font-black uppercase tracking-[0.5em] rounded-full border border-indigo-500/20 shadow-2xl animate-bounce">
            {t.vision.tag}
          </div>
          <h2 className="text-6xl lg:text-[8rem] font-black text-white tracking-[-0.04em] uppercase italic leading-[0.9]">
            {t.vision.title}
          </h2>
          <p className="text-2xl text-slate-200 font-bold leading-relaxed italic max-w-4xl mx-auto px-6">
            {t.vision.desc}
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6 opacity-40 group hover:opacity-100 transition-opacity">
            <Tag text="AI Audit Neural Core" />
            <Tag text="Predictive Risk Engine" />
            <Tag text="Automated Compliance AI" />
          </div>
        </div>
      </section>

      <footer className="px-6 lg:px-24 py-20 border-t border-white/5 text-center">
        <div className="text-[11px] font-black text-slate-800 uppercase tracking-[1.5em] mb-4">MATC Ecosystem © 2026</div>
        <div className="text-slate-600 text-[9px] font-bold uppercase tracking-widest italic opacity-50">Scientific Archives Vault • Digital Hub Tunisia</div>
      </footer>

    </main>
  );
}


// Components with Refined Design
interface BenefitProps {
  num: string;
  title: string;
  desc: string;
  color: 'indigo' | 'emerald' | 'rose';
}

function Benefit({ num, title, desc, color }: BenefitProps) {
  const colors: Record<string, string> = {
    indigo: 'text-indigo-400 border-indigo-500/20 group-hover:border-indigo-500 shadow-indigo-500/5',
    emerald: 'text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500 shadow-emerald-500/5',
    rose: 'text-rose-400 border-rose-500/20 group-hover:border-rose-500 shadow-rose-500/5'
  };
  return (
    <div className={`p-10 border rounded-[50px] flex gap-10 items-center bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-700 group shadow-2xl ${colors[color]}`}>
      <div className="text-5xl font-black opacity-20 group-hover:opacity-100 transition-all duration-700 italic font-['Outfit',sans-serif]">{num}</div>
      <div className="space-y-2">
        <h4 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h4>
        <p className="text-slate-200 text-sm font-bold italic group-hover:opacity-100 transition-opacity">{desc}</p>
      </div>
    </div>
  )
}

interface RoyaltyCardProps {
  val: string;
  label: string;
  color: 'indigo' | 'emerald' | 'rose';
  dashed?: boolean;
}

function RoyaltyCard({ val, label, color, dashed }: RoyaltyCardProps) {
  const colors: Record<string, string> = {
    indigo: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/[0.02]',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/[0.02]',
    rose: 'text-rose-400 border-rose-500/30 bg-rose-500/[0.02]'
  };
  return (
    <div className={`p-12 border ${dashed ? 'border-dashed' : ''} rounded-[60px] hover:scale-105 transition-all duration-700 shadow-2xl glass-card ${colors[color]}`}>
      <div className="text-7xl font-black mb-6 font-['Outfit',sans-serif] tracking-tighter">{val}</div>
      <div className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em]">{label}</div>
    </div>
  )
}

interface RoleCardProps {
  badge: string;
  title: string;
  desc: string;
  promo?: string;
  btn: string;
  color: 'emerald' | 'indigo' | 'rose';
  featured?: boolean;
  onClick: () => void;
  isRtl?: boolean;
}

function RoleCard({ badge, title, desc, promo, btn, color, featured, onClick, isRtl }: RoleCardProps) {
  const colors: Record<string, string> = {
    emerald: featured ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-white/[0.03] border-emerald-500/20',
    indigo: featured ? 'bg-indigo-600 shadow-indigo-600/40 translate-y-[-20px] scale-110' : 'bg-white/[0.03] border-indigo-500/20',
    rose: featured ? 'bg-rose-600 shadow-rose-600/30' : 'bg-white/[0.03] border-rose-500/20'
  };

  return (
    <div className={`p-16 rounded-[80px] border flex flex-col justify-between min-h-[750px] transition-all duration-700 relative overflow-hidden group hover:shadow-2xl ${colors[color]}`}>
      {featured && <div className="absolute top-0 right-0 p-20 opacity-10 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>}

      <div className={`absolute top-10 ${isRtl ? '-left-14' : '-right-14'} px-20 py-2 bg-black/40 text-white text-[9px] font-black uppercase tracking-[0.4em] ${isRtl ? '-rotate-45' : 'rotate-45'} shadow-2xl border border-white/10 z-20`}>{badge}</div>

      <div className="space-y-12">
        <div className={`w-16 h-2 ${featured ? 'bg-white' : 'bg-indigo-600'} rounded-full`}></div>
        <h4 className="text-6xl font-black text-white italic tracking-tighter uppercase">{title}</h4>
        <p className={`text-2xl font-medium leading-relaxed italic ${featured ? 'text-white' : 'text-slate-400'}`}>{desc}</p>
        {promo && <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 animate-pulse">{promo}</div>}
      </div>

      <button
        onClick={onClick}
        className={`w-full py-8 ${featured ? 'bg-white text-black' : 'bg-white/10 text-white border border-white/10'} rounded-[40px] font-black uppercase text-xs tracking-[0.3em] hover:scale-105 transition-all duration-500 shadow-2xl active:scale-95`}
      >
        {btn}
      </button>
    </div>
  )
}

interface ResellerCardProps {
  reseller: Reseller;
  contactBtn: string;
  isRtl?: boolean;
  variant: 'indigo' | 'rose';
}

function ResellerCard({ reseller, contactBtn, isRtl, variant }: ResellerCardProps) {
  const colorClasses: Record<string, string> = {
    rose: 'border-rose-500/10 hover:border-rose-500/40 bg-rose-500/[0.01]',
    indigo: 'border-indigo-500/10 hover:border-indigo-500/40 bg-indigo-500/[0.01]'
  };

  return (
    <div className={`p-12 rounded-[60px] border glass-card transition-all duration-700 group relative overflow-hidden shadow-2xl ${colorClasses[variant]}`}>
      <div className={`absolute top-0 ${isRtl ? 'left-10' : 'right-10'} bg-white/[0.03] px-6 py-2 rounded-b-3xl text-[9px] font-black text-slate-600 uppercase tracking-widest`}>{reseller.countryCode}</div>
      <div className={`space-y-10 ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="space-y-4">
          <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] italic">{reseller.country}</span>
          <h3 className="text-4xl font-black text-white italic group-hover:text-indigo-400 transition-colors uppercase">{reseller.name}</h3>
          <p className={`text-slate-200 text-lg font-bold leading-relaxed italic ${isRtl ? 'border-r-4 pr-6' : 'border-l-4 pl-6'} border-white/20 group-hover:border-indigo-500/60 transition-colors line-clamp-2`}>{reseller.bio}</p>
        </div>
        <div className="space-y-10">
          <div className={`flex flex-wrap gap-3 ${isRtl ? 'justify-end' : 'justify-start'}`}>
            {reseller.paymentMethods.map((pm: string) => (
              <span key={pm} className="text-[10px] font-bold px-5 py-2 bg-white/5 rounded-2xl text-slate-400 border border-white/5 uppercase tracking-widest">{pm}</span>
            ))}
          </div>
          <a
            href={`https://wa.me/${reseller.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            className="flex items-center justify-center gap-4 w-full py-6 bg-white text-black rounded-[30px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#25D366] hover:text-white transition-all duration-500 shadow-xl italic"
          >
            {contactBtn}
          </a>
        </div>
      </div>
    </div>
  )
}

function Tag({ text }: { text: string }) {
  return (
    <div className="px-10 py-5 bg-white/[0.02] border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-default shadow-inner">
      {text}
    </div>
  )
}
