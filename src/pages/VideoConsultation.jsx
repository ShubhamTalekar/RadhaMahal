import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { api } from '../lib/apiClient';
import { toast } from 'sonner';

export default function VideoConsultation() {
    const { user } = useApp();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        date: '',
        time: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Sync form with user data when user logs in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || user.name || '',
                email: prev.email || user.email || '',
                phone: prev.phone || user.phone || '',
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/api/v1/consultation', formData);
            setIsSubmitting(false);
            setIsSubmitted(true);
            setTimeout(() => setIsSubmitted(false), 5000);
            setFormData({ name: '', email: '', phone: '', date: '', time: '' });
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
            toast.error("Booking failed. Please try again later.");
        }
    };

    return (
        <main className="min-h-screen bg-surface">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                {/* Fallback pattern in case image takes time to load */}
                <div className="absolute inset-0 bg-[#250624] silk-texture"></div> 
                <div className="absolute inset-0 bg-[#d4af37] mix-blend-overlay opacity-10"></div>
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-[#e9c349] font-headline tracking-[0.3em] text-sm uppercase mb-6"
                    >
                        Bespoke Styling
                    </motion.p>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-headline text-[#fdfbf7] mb-8 drop-shadow-lg"
                    >
                        Video Consultation
                    </motion.h1>
                    <motion.div 
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="w-24 h-[1px] bg-[#e9c349]/50 mx-auto origin-center"
                    ></motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    
                    {/* Information Side */}
                    <div className="space-y-10">
                        <div>
                            <h2 className="text-4xl text-primary font-headline mb-6">Your Personal Atelier</h2>
                            <p className="text-on-surface-variant font-body leading-relaxed text-lg">
                                Experience the luxury of a personalized styling session from the comfort of your home. 
                                Whether you are curating a bridal trousseau, seeking the perfect festive ensemble, or simply elevating your everyday elegance, our expert stylists are here to guide you.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full border border-[#d4af37]/30 flex items-center justify-center shrink-0 bg-[#d4af37]/5">
                                    <span className="material-symbols-outlined text-[#d4af37]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>videocam</span>
                                </div>
                                <div>
                                    <h3 className="font-headline text-xl text-primary mb-2">1-on-1 Virtual Session</h3>
                                    <p className="text-on-surface-variant font-body text-sm">Connect directly with our master stylists via a high-definition video call tailored to your schedule.</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full border border-[#d4af37]/30 flex items-center justify-center shrink-0 bg-[#d4af37]/5">
                                    <span className="material-symbols-outlined text-[#d4af37]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>checkroom</span>
                                </div>
                                <div>
                                    <h3 className="font-headline text-xl text-primary mb-2">Curated Selections</h3>
                                    <p className="text-on-surface-variant font-body text-sm">Preview exclusive pieces, intricate embroidery details, and fabric textures curated precisely for your aesthetic.</p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full border border-[#d4af37]/30 flex items-center justify-center shrink-0 bg-[#d4af37]/5">
                                    <span className="material-symbols-outlined text-[#d4af37]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>apparel</span>
                                </div>
                                <div>
                                    <h3 className="font-headline text-xl text-primary mb-2">Bespoke Guidance</h3>
                                    <p className="text-on-surface-variant font-body text-sm">Receive expert advice on customizing outfits, matching accessories, and perfecting your look for any occasion.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary opacity-5 -top-6 -left-6 rounded-3xl"></div>
                        <div className="relative bg-white p-10 md:p-14 rounded-3xl border border-[#d4af37]/20 shadow-[0_20px_50px_rgba(74,26,107,0.05)]">
                            <h3 className="text-3xl font-headline text-primary mb-2">Book Your Session</h3>
                            <p className="text-sm text-on-surface-variant mb-10">Reserve your complimentary 45-minute styling consultation.</p>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="relative group">
                                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-transparent border-0 border-b border-outline/30 focus:ring-0 focus:border-[#d4af37] transition-all py-3 px-0 text-on-surface font-body peer" placeholder=" " type="text" />
                                        <label className="absolute left-0 top-3 text-sm font-label uppercase tracking-widest text-outline -translate-y-6 scale-75 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 transition-all">Full Name</label>
                                    </div>
                                    <div className="relative group">
                                        <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-transparent border-0 border-b border-outline/30 focus:ring-0 focus:border-[#d4af37] transition-all py-3 px-0 text-on-surface font-body peer" placeholder=" " type="tel" />
                                        <label className="absolute left-0 top-3 text-sm font-label uppercase tracking-widest text-outline -translate-y-6 scale-75 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 transition-all">Phone Number</label>
                                    </div>
                                    <div className="relative group md:col-span-2">
                                        <input required name="email" value={formData.email} onChange={handleChange} className="w-full bg-transparent border-0 border-b border-outline/30 focus:ring-0 focus:border-[#d4af37] transition-all py-3 px-0 text-on-surface font-body peer" placeholder=" " type="email" />
                                        <label className="absolute left-0 top-3 text-sm font-label uppercase tracking-widest text-outline -translate-y-6 scale-75 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 transition-all">Email Address</label>
                                    </div>
                                    <div className="relative group">
                                        <input required name="date" value={formData.date} onChange={handleChange} className="w-full bg-transparent border-0 border-b border-outline/30 focus:ring-0 focus:border-[#d4af37] transition-all py-3 px-0 text-on-surface font-body peer text-sm" type="date" />
                                        <label className="absolute left-0 top-3 text-sm font-label uppercase tracking-widest text-outline -translate-y-6 scale-75 origin-[0] peer-focus:-translate-y-6 peer-focus:scale-75 transition-all">Preferred Date</label>
                                    </div>
                                    <div className="relative group">
                                        <input required name="time" value={formData.time} onChange={handleChange} className="w-full bg-transparent border-0 border-b border-outline/30 focus:ring-0 focus:border-[#d4af37] transition-all py-3 px-0 text-on-surface font-body peer text-sm" type="time" />
                                        <label className="absolute left-0 top-3 text-sm font-label uppercase tracking-widest text-outline -translate-y-6 scale-75 origin-[0] peer-focus:-translate-y-6 peer-focus:scale-75 transition-all">Preferred Time</label>
                                    </div>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isSubmitted}
                                    className={`w-full py-5 rounded-full font-headline text-lg uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3
                                        ${isSubmitted ? 'bg-[#1b4332] text-white cursor-default' : 'bg-primary text-secondary hover:bg-[#341133] hover:scale-[1.02] active:scale-95'}`}
                                >
                                    {isSubmitting ? (
                                        <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>sync</span>
                                    ) : isSubmitted ? (
                                        <>
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>check_circle</span>
                                            Session Booked
                                        </>
                                    ) : (
                                        'Confirm Booking'
                                    )}
                                </button>
                                {isSubmitted && (
                                    <p className="text-center text-xs text-[#1b4332] font-label tracking-widest mt-4 animate-fade-in">We will send a calendar invite shortly.</p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
