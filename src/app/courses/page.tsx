"use client";

import { MOCK_COURSES } from '@/lib/mock-data';
import Link from 'next/link';

export default function CoursesPage() {
    return (
        <main className="min-h-screen mesh-gradient px-6 py-12 lg:px-24">
            <nav className="flex justify-between items-center mb-16">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
                    QHSE<span className="text-indigo-500">PORTAL</span>
                </Link>
                <Link href="/dashboard" className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-full hover:bg-white/10 transition-all">
                    My Dashboard
                </Link>
            </nav>

            <header className="mb-20">
                <h1 className="text-5xl font-black mb-6 gradient-text">Knowledge Base</h1>
                <p className="text-slate-400 max-w-2xl text-lg">
                    Browse our certified QHSE training modules. Each course includes HD video recordings and downloadable technical documentation.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {MOCK_COURSES.map((course) => (
                    <div key={course.id} className="glass-card group overflow-hidden border-white/5 hover:border-indigo-500/30 transition-colors">
                        <div className="relative h-64">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{course.title}</h3>
                            <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                                {course.description}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-slate-500">Videos</span>
                                        <span className="text-white font-bold">12 Lessons</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-slate-500">Files</span>
                                        <span className="text-white font-bold">{course.stats.documentCount} PDFs</span>
                                    </div>
                                </div>
                                <button className="text-indigo-400 font-bold text-sm hover:underline">Access Details</button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Library Card */}
                <div className="glass-card p-10 flex flex-col justify-center items-center text-center border-dashed border-white/10 bg-white/[0.01]">
                    <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-6 border border-indigo-500/20">
                        <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">QHSE Digital Library</h3>
                    <p className="text-slate-500 text-sm mb-8">Access over 500+ technical documents, safety posters, and audit checklists.</p>
                    <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all">Explore Library</button>
                </div>
            </div>
        </main>
    );
}
