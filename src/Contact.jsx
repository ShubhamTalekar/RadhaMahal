import React, { useState, useEffect } from 'react';
import { Mail, Phone, Send } from 'lucide-react';
import { CONTACT_EMAIL } from './constants';
import { useApp } from './context/AppContext';

export default function Contact() {
    const { user } = useApp();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState('');

    // Sync form when user logs in mid-session
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || user.name || '',
                email: prev.email || user.email || '',
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        
        try {
            const BASE = import.meta.env.VITE_API_BASE_URL;
            const response = await fetch(`${BASE}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Server error');
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus(''), 5000);
        } catch (error) {
            console.error('Email error:', error);
            setStatus('error');
            setTimeout(() => setStatus(''), 5000);
        }
    };

    return (
        <main className="bg-[#fdfbf7] text-primary min-h-screen pt-24 pb-32 font-body">
            {/* Header section */}
            <section className="max-w-7xl mx-auto px-6 mb-24">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-[2px] bg-[#d4af37]"></div>
                    <span className="text-[#d4af37] tracking-[0.3em] uppercase text-xs font-bold" >
                        Connect With Us
                    </span>
                </div>
                <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 font-display" >
                    Let's Begin a <br />
                    <span className="italic text-primary/70 font-headline">New Narrative</span>
                </h1>
                <p className="max-w-2xl text-xl text-[#000000] leading-relaxed italic" >
                    Whether you seek a bespoke bridal masterpiece or wish to inquire about our weaving clusters, our concierge is here to assist your journey.
                </p>
            </section>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 font-display">
                {/* Contact Information */}
                <div className="lg:col-span-5 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                        {[
                            {
                                icon: <Mail className="w-6 h-6" />,
                                title: "Email Our Concierge",
                                detail: CONTACT_EMAIL,
                                sub: "Response within 24 hours"
                            },
                            {
                                icon: <Phone className="w-6 h-6" />,
                                title: "Direct Inquiry",
                                detail: "+91 96190 95314",
                                sub: "Mon-Sat, 10am - 7pm IST"
                            }
                        ].map((item, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-white border border-[#d4af37]/10 shadow-[0_10px_40px_rgba(74,26,107,0.05)] hover:border-[#d4af37]/30 transition-all duration-500">
                                <div className="p-3 bg-[#d4af37]/10 text-[#d4af37] w-fit rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-2">{item.title}</h3>
                                <p className="text-2xl font-medium mb-1" >{item.detail}</p>
                                <p className="text-sm text-[#000000] tracking-wide font-display">{item.sub}</p>
                            </div>
                        ))}
                    </div>


                </div>

                {/* Contact Form */}
                <div className="lg:col-span-7">
                    <div className="bg-white p-12 rounded-[3rem] shadow-[0_30px_60px_rgba(74,26,107,0.08)] border border-[#d4af37]/10">
                        <h2 className="text-3xl text-primary mb-10" >Send a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-transparent border-0 border-b border-primary/20 focus:border-[#d4af37] focus:ring-0 transition-all py-3 px-0 text-lg font-medium text-primary"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-transparent border-0 border-b border-primary/20 focus:border-[#d4af37] focus:ring-0 transition-all py-3 px-0 text-lg font-medium text-primary"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Email Address"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">Subject</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-transparent border-0 border-b border-primary/20 focus:border-[#d4af37] focus:ring-0 transition-all py-3 px-0 text-lg font-medium text-primary"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="Order Inquiry, Bespoke Request, etc."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full bg-transparent border-0 border-b border-primary/20 focus:border-[#d4af37] focus:ring-0 transition-all py-3 px-0 text-lg font-medium text-primary resize-none"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full py-5 bg-primary text-[#fdfbf7] rounded-full font-bold uppercase tracking-[0.2em] text-sm hover:bg-[#3d1259] transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 group"
                            >
                                {status === 'sending' ? (
                                    <>Syncing to Atelier...</>
                                ) : status === 'success' ? (
                                    <>✓ Inquiry Received — We'll Be in Touch</>
                                ) : status === 'error' ? (
                                    <>Failed to Deliver — Please Try Again</>
                                ) : (
                                    <>
                                        Deliver Message
                                        <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
