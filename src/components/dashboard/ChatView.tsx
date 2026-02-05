import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
    _id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    content: string;
    channel?: string;
    createdAt: string;
}

export default function ChatView() {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/chat', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchMessages();
        scrollToBottom();

        // Auto-refresh every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const [targetChannel, setTargetChannel] = useState('GLOBAL');

    // Check if user is allowed to post to specific channels
    const canPostAdmin = user?.role === 'ADMIN';
    const canPostPartner = user?.role === 'ADMIN' || user?.role === 'RESELLER_T1' || user?.role === 'RESELLER_T2';

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: newMessage,
                    channel: targetChannel
                })
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const [filterRole, setFilterRole] = useState('ALL');

    // ... existing funcs ...

    const filteredMessages = messages.filter(msg => {
        if (filterRole === 'ALL') return true;
        if (filterRole === 'ADMIN') return msg.senderRole === 'ADMIN';
        if (filterRole === 'PARTNER') return msg.senderRole === 'RESELLER_T2' || msg.senderRole === 'RESELLER_T1';
        return true;
    });

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase italic mb-2">Espace Discussion 💬</h2>
                    <p className="text-slate-400 font-medium text-sm">
                        Chat en direct avec la communauté. <span className="text-rose-400 font-bold">⚠️ Messages supprimés après 48h.</span>
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-3">Filtrer par:</span>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-transparent text-white text-xs font-bold uppercase tracking-wider p-2 outline-none cursor-pointer [&>option]:bg-[#0f172a]"
                    >
                        <option value="ALL">Tout le monde</option>
                        <option value="ADMIN">Admins Uniquement</option>
                        <option value="PARTNER">Partenaires (Master & T2)</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden flex flex-col relative">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            <p className="font-bold uppercase tracking-widest text-sm">Aucun message pour ce filtre</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg) => {
                            const isMe = msg.senderId === user?.id; // Assuming user.id is available in AuthContext. If user context uses _id, check that.
                            // Checking AuthContext in previous file view, it uses `user.id`.
                            const msgChannel = msg.channel || 'GLOBAL';

                            return (
                                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] md:max-w-[60%] flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 shadow-lg ${isMe ? 'bg-indigo-600' : 'bg-slate-700'
                                            }`}>
                                            {msg.senderName.charAt(0)}
                                        </div>

                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-white max-w-[150px] truncate">{msg.senderName}</span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider ${msg.senderRole === 'ADMIN' ? 'bg-rose-500/20 text-rose-400' :
                                                    msg.senderRole === 'RESELLER_T1' ? 'bg-purple-500/20 text-purple-400' :
                                                        msg.senderRole === 'RESELLER_T2' ? 'bg-indigo-500/20 text-indigo-400' :
                                                            msg.senderRole === 'PROVIDER' ? 'bg-amber-500/20 text-amber-400' :
                                                                'bg-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                    {msg.senderRole === 'RESELLER_T1' ? 'Master' :
                                                        msg.senderRole === 'RESELLER_T2' ? 'Partner' :
                                                            msg.senderRole}
                                                </span>

                                                {/* Channel Badge */}
                                                {msgChannel !== 'GLOBAL' && (
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider flex items-center gap-1 ${msgChannel === 'ADMIN' ? 'bg-rose-500 text-white shadow-rose-500/20 shadow-lg' :
                                                        'bg-indigo-500 text-white shadow-indigo-500/20 shadow-lg'
                                                        }`}>
                                                        {msgChannel === 'ADMIN' ? '🔒 Admin Only' : '👥 Partners'}
                                                    </span>
                                                )}

                                                <span className="text-[10px] text-slate-500">{formatTime(msg.createdAt)}</span>
                                            </div>

                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-lg ${isMe
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-[#1a2035] text-slate-200 rounded-tl-none border border-white/5'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-black/20 backdrop-blur-sm border-t border-white/5 space-y-3">
                    {/* Channel Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Envoyer à :</span>
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            <button
                                type="button"
                                onClick={() => setTargetChannel('GLOBAL')}
                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${targetChannel === 'GLOBAL' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                🌍 Global
                            </button>
                            {canPostPartner && (
                                <button
                                    type="button"
                                    onClick={() => setTargetChannel('PARTNER')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${targetChannel === 'PARTNER' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    👥 Partenaires
                                </button>
                            )}
                            {canPostAdmin && (
                                <button
                                    type="button"
                                    onClick={() => setTargetChannel('ADMIN')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${targetChannel === 'ADMIN' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    🔒 Admins
                                </button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSend} className="flex gap-4">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Message pour ${targetChannel === 'GLOBAL' ? 'tout le monde' : targetChannel === 'ADMIN' ? 'les admins uniquement' : 'le réseau de partenaires'}...`}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-medium"
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className={`px-6 py-3 text-white rounded-xl font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg ${targetChannel === 'ADMIN' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' :
                                targetChannel === 'PARTNER' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' :
                                    'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                }`}
                        >
                            {sending ? '...' : (
                                <>
                                    <span>Envoyer</span>
                                    <svg className="w-5 h-5 -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
