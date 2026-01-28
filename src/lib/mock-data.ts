export type UserRole = 'ADMIN' | 'PROVIDER' | 'RESELLER_T1' | 'RESELLER_T2' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plusPoints?: number;
  walletBalance?: number;
  enrolledLearners?: number;
}

export interface Session {
  id: string;
  title: string;
  videoUrl?: string; // Mock URL
  supportUrl?: string; // Mock URL
  duration: string;
}

export interface TrainingBundle {
  id: string;
  title: string;
  provider: {
    name: string;
    logo?: string;
    type: 'Expert' | 'Institute' | 'Agency';
  };
  contentType: string;
  description: string;
  thumbnail: string;
  stats: {
    videoHours: number;
    documentCount: number;
    hasLiveSupport: boolean;
  };
  price: number;
  rating?: number;
  sessions?: Session[];
}

export interface License {
  id: string;
  key: string;
  status: 'AVAIL' | 'USED' | 'EXPIRED';
  learnerName?: string;
  activationDate?: string;
}

export interface PartnerActivity {
  id: string;
  partnerName: string;
  location: string;
  sales: number;
  activeLearners: number;
  lastPayment: string;
}

export interface Reseller {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  whatsapp: string;
  paymentMethods: string[];
  role: 'PARTNER' | 'MASTER' | 'HEAD';
  bio?: string;
}

export const MOCK_RESELLERS: Reseller[] = [
  {
    id: 'head-01',
    name: 'MATC Direction Générale',
    country: 'International',
    countryCode: 'INT',
    whatsapp: '+21644172284',
    paymentMethods: ['ARTIM Application ONLY'],
    role: 'HEAD',
    bio: 'Administration centrale du réseau MATC Vault QHSE.'
  },
  {
    id: 'm1',
    name: 'Ahmed Ben Salem',
    country: 'Tunisia',
    countryCode: 'TN',
    whatsapp: '+21699000111',
    paymentMethods: ['D17', 'Konnect', 'Virement'],
    role: 'MASTER',
    bio: 'Master Reseller Exécutif zone MENA.'
  },
  {
    id: 'p1',
    name: 'Sami Mansour',
    country: 'Tunisia',
    countryCode: 'TN',
    whatsapp: '+21622333444',
    paymentMethods: ['D17', 'Sobflous'],
    role: 'PARTNER',
    bio: 'Partenaire certifié zone Sahel.'
  }
];

export const MOCK_BUNDLES: TrainingBundle[] = [
  {
    id: 'b1',
    title: 'Devenir Responsable QHSE',
    provider: { name: 'QHSE Academy Europe', type: 'Institute' },
    contentType: 'Archive de Workshop',
    description: 'Masterclass complète sur le pilotage stratégique et opérationnel d\'un système QHSE.',
    thumbnail: '/qhse_manager.png',
    stats: { videoHours: 24, documentCount: 45, hasLiveSupport: true },
    price: 35
  },
  {
    id: 'b2',
    title: 'Superviseur HSE',
    provider: { name: 'Dr. Mansour Professionals', type: 'Expert' },
    contentType: 'Série Technique Archivée',
    description: 'Compétences opérationnelles pour la supervision de la sécurité sur site industriel.',
    thumbnail: '/hse_supervisor.png',
    stats: { videoHours: 12, documentCount: 10, hasLiveSupport: false },
    price: 35
  },
  {
    id: 'b3',
    title: 'ISO 9001:2015 Quality Management Systems',
    provider: { name: 'Safety Masters', type: 'Agency' },
    contentType: 'Archive Intensive',
    description: 'Pilotage complet d\'un système de management de la qualité.',
    thumbnail: '/iso_audit.png',
    stats: { videoHours: 20, documentCount: 50, hasLiveSupport: true },
    price: 35
  }
];

export const MOCK_USERS: Record<string, User> = {
  admin: { id: 'a1', name: 'Direction MATC', email: 'admin@matcvault.com', role: 'ADMIN' },
  master: { id: 'm1', name: 'Ahmed Ben Salem', email: 'ahmed.bensalem@matcvault.com', role: 'RESELLER_T1', walletBalance: 14700 },
  partner: { id: 'p1', name: 'Sami Mansour', email: 'sami.mansour@matcvault.com', role: 'RESELLER_T2', walletBalance: 620, enrolledLearners: 124 },
  student: { id: 's1', name: 'Anis Khanchouch', email: 'anis.k@member.com', role: 'STUDENT' },
  provider: { id: 'prov-1', name: 'QHSE Elite Institute', email: 'submit@elite-qhse.com', role: 'PROVIDER', plusPoints: 15.5 }
};

export const MOCK_LICENSES: License[] = [
  { id: 'l1', key: 'PM-2026-X8Y2', status: 'USED', learnerName: 'Mohamed Ali', activationDate: '2026-01-10' },
  { id: 'l2', key: 'PM-2026-A1Z9', status: 'USED', learnerName: 'Sonia Gharbi', activationDate: '2026-01-15' },
  { id: 'l3', key: 'PM-2026-BUFF', status: 'AVAIL' },
  { id: 'l4', key: 'PM-2026-K9L0', status: 'AVAIL' },
  { id: 'l5', key: 'PM-2026-M4N2', status: 'AVAIL' }
];

export const MOCK_NETWORK: PartnerActivity[] = [
  { id: 'na1', partnerName: 'Sami Mansour', location: 'Tunis, TN', sales: 124, activeLearners: 85, lastPayment: '2026-01-20' },
  { id: 'na2', partnerName: 'Yassine Brahmi', location: 'Sousse, TN', sales: 92, activeLearners: 42, lastPayment: '2026-01-25' },
  { id: 'na3', partnerName: 'Amine Djebabla', location: 'Alger, DZ', sales: 210, activeLearners: 180, lastPayment: '2026-01-15' }
];
// --- LEARNER LIBRARY CONTENT ---
export const MOCK_COURSES: TrainingBundle[] = [
  {
    id: 'c1',
    title: 'Cycle Expert: Management QSE Intégré',
    provider: { name: 'Dr. Ben Salem', type: 'Expert' },
    contentType: 'Cours Enregistré',
    description: 'Une série de 12 modules couvrant l\'intégralité du management QSE.',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800',
    stats: { videoHours: 30, documentCount: 15, hasLiveSupport: true },
    price: 35,
    rating: 5,
    sessions: [
      { id: 's1-1', title: 'Introduction au Management QSE', duration: '2h 15m', videoUrl: '#', supportUrl: '#' },
      { id: 's1-2', title: 'Analyse Contexte & Parties Intéressées', duration: '3h 45m', videoUrl: '#', supportUrl: '#' },
      { id: 's1-3', title: 'Leadership et Engagement Direction', duration: '2h 30m', videoUrl: '#', supportUrl: '#' }
    ]
  },
  {
    id: 'c2',
    title: 'Audit Interne: Protocole Professionnel',
    provider: { name: 'QHSE Institute', type: 'Institute' },
    contentType: 'Cours Enregistré',
    description: 'Techniques avancées d\'audit sur site et à distance.',
    thumbnail: 'https://images.unsplash.com/photo-1454165833767-027ffcb70c18?q=80&w=800',
    stats: { videoHours: 12, documentCount: 10, hasLiveSupport: false },
    price: 35,
    rating: 4,
    sessions: [
      { id: 's2-1', title: 'Préparation du Plan d\'Audit', duration: '1h 45m', videoUrl: '#', supportUrl: '#' },
      { id: 's2-2', title: 'Conduite de la Réunion d\'Ouverture', duration: '1h 10m', videoUrl: '#', supportUrl: '#' }
    ]
  }
];

export const MOCK_VIDEOS: TrainingBundle[] = [
  {
    id: 'v1',
    title: 'Workshop: Analyse des Défaillances (AMDEC)',
    provider: { name: 'Elite Experts', type: 'Expert' },
    contentType: 'Vidéo Enregistrée',
    description: 'Démonstration réelle d\'une session AMDEC en milieu industriel.',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800',
    stats: { videoHours: 4, documentCount: 2, hasLiveSupport: false },
    price: 35,
    rating: 5
  },
  {
    id: 'v2',
    title: 'Immersion: Sécurité Incendie Tertiaire',
    provider: { name: 'Safety Masters', type: 'Agency' },
    contentType: 'Vidéo Enregistrée',
    description: 'Archive HD d\'une simulation d\'évacuation et gestion de crise.',
    thumbnail: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800',
    stats: { videoHours: 6, documentCount: 0, hasLiveSupport: false },
    price: 35,
    rating: 3
  }
];

export const MOCK_DOCUMENTS: TrainingBundle[] = [
  {
    id: 'd1',
    title: 'Pack SOPs: Qualité Agroalimentaire',
    provider: { name: 'Food Safety Agency', type: 'Agency' },
    contentType: 'Document QHSE',
    description: 'Modèles de procédures opérationnelles standards éditables.',
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800',
    stats: { videoHours: 0, documentCount: 120, hasLiveSupport: false },
    price: 35,
    rating: 5
  },
  {
    id: 'd2',
    title: 'Toolkit: Registre des Risques Légaux',
    provider: { name: 'Legal QHSE', type: 'Expert' },
    contentType: 'Document QHSE',
    description: 'Tableurs Excel automatiques pour l\'évaluation de conformité.',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800',
    stats: { videoHours: 0, documentCount: 15, hasLiveSupport: false },
    price: 35,
    rating: 2
  }
];
