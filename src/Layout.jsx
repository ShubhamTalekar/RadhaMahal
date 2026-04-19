import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Footer as FigmaFooter } from './components/figma/Footer';
import { useApp } from './context/AppContext';

const ANNOUNCEMENT = import.meta.env.VITE_ANNOUNCEMENT_TEXT || "Free shipping all over Maharashtra";
const ANNOUNCEMENT_REPEATS = 8;

export default function Layout() {
    const { bag, wishlist, user, setUser, categories, occasions } = useApp();
    const navigate = useNavigate();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-secondary selection:text-on-secondary min-h-screen flex flex-col">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-gradient-to-r from-primary via-primary to-primary text-[#fdfbf7] shadow-2xl border-b-2 border-secondary font-sans leading-relaxed">
                {/* Announcement Marquee */}
                <div className="bg-[#d4af37] text-primary py-2 overflow-hidden flex whitespace-nowrap">
                    <div className="animate-marquee inline-block font-headline text-xs lg:text-sm tracking-[0.2em] uppercase font-bold">
                        {Array.from({ length: ANNOUNCEMENT_REPEATS }, (_, i) => (
                            <span key={i} className="mx-12">{ANNOUNCEMENT}</span>
                        ))}
                    </div>
                </div>
                <div className="absolute inset-0 top-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="max-w-screen-2xl w-full mx-auto px-3 lg:px-8 py-3 lg:py-5 relative z-10 grid grid-cols-3 items-center">
                    
                    <div className="flex justify-start">
                        <Link to="/" className="relative group cursor-pointer flex flex-col items-start">
                            <span 
                              className="text-base sm:text-xl lg:text-[2rem] tracking-wide bg-gradient-to-r from-secondary via-[#f4d56f] to-secondary bg-clip-text text-transparent animate-gradient drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] whitespace-nowrap"
                              
                            >
                              Radha Mahal
                            </span>
                            <span className="text-secondary text-[8px] sm:text-[10px] lg:text-xs mt-0.5 tracking-[0.2em] lg:tracking-[0.3em] font-semibold uppercase font-body" >
                              By Neha
                            </span>
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-secondary to-[#f4d56f] group-hover:w-full transition-all duration-500 font-body"></span>
                        </Link>
                    </div>

                    {/* Centered Nav Items */}
                    <nav className="hidden lg:flex justify-center items-center gap-10 font-sans text-white font-bold text-[14px] tracking-wide" >
                        <div className="relative group py-4">
                            <button className="flex items-center gap-1 relative text-sm font-semibold tracking-wide hover:text-secondary transition-colors duration-300">
                                Shop <span className="material-symbols-outlined text-[1.1rem]">arrow_drop_down</span>
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-64 bg-primary border border-[#D4AF37]/20 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 rounded-b-xl overflow-hidden backdrop-blur-2xl">
                                {categories.length > 0 ? categories.map(cat => (
                                    <Link key={cat} to={`/catalog?category=${encodeURIComponent(cat)}`} className="block px-8 py-4 text-xs tracking-widest text-[#e8e4e6] hover:text-primary hover:bg-secondary transition-colors border-b border-[#D4AF37]/10">
                                        {cat}
                                    </Link>
                                )) : (
                                    <Link to="/catalog" className="block px-8 py-4 text-xs tracking-widest text-[#e8e4e6] hover:text-primary hover:bg-secondary transition-colors">
                                        View All
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="relative group py-4">
                            <Link to="/catalog" className="flex items-center gap-1 relative text-sm font-semibold tracking-wide hover:text-secondary transition-colors duration-300">
                                Collections {(occasions && occasions.length > 0) && <span className="material-symbols-outlined text-[1.1rem]">arrow_drop_down</span>}
                            </Link>
                            {(occasions && occasions.length > 0) && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-56 bg-primary border border-[#D4AF37]/20 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 rounded-b-xl overflow-hidden backdrop-blur-2xl">
                                    {occasions.map(occ => (
                                        <Link key={occ} to={`/catalog?occasion=${encodeURIComponent(occ)}`} className="block px-8 py-4 text-xs tracking-widest text-[#e8e4e6] hover:text-primary hover:bg-secondary transition-colors border-b border-[#D4AF37]/10">{occ}</Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link to="/catalog?sort=New+Arrivals" className="relative text-sm font-semibold tracking-wide hover:text-secondary transition-colors duration-300 group">
                            New Arrivals
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-secondary group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link to="/our-story" className="relative text-sm font-semibold tracking-wide hover:text-secondary transition-colors duration-300 group">
                            Our Story
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-secondary group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link to="/video-consultation" className="relative text-sm font-semibold tracking-wide hover:text-secondary transition-colors duration-300 group">
                            Video Consult
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-secondary group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link to="/contact" className="relative text-sm font-semibold tracking-wide hover:text-secondary transition-colors duration-300 group">
                            Contact
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-secondary group-hover:w-full transition-all duration-300"></span>
                        </Link>
                    </nav>

                    {/* Action Icons */}
                    <div className="flex justify-end items-center gap-3 lg:gap-5 text-white">
                        <div className="relative flex items-center">
                            <form onSubmit={handleSearch} className={`absolute top-full mt-6 right-0 bg-primary/95 backdrop-blur-xl border border-[#D4AF37]/20 shadow-[-10px_20px_30px_rgba(0,0,0,0.5)] rounded-xl transition-all duration-300 origin-top-right z-50 p-2 ${isSearchOpen ? 'w-80 opacity-100 scale-100' : 'w-80 opacity-0 scale-95 pointer-events-none'}`}>
                                <input
                                    type="text"
                                    placeholder="Search bespoke sarees..."
                                    className="w-full bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-lg py-3 px-5 pr-16 text-[#e8e4e6] text-sm focus:outline-none focus:ring-0 focus:border-[#D4AF37]/50 font-body placeholder-[#e8e4e6]/40 shadow-none ring-0 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus={isSearchOpen}
                                    style={{ boxShadow: 'none' }}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-white uppercase tracking-widest font-bold opacity-40">Enter</div>
                            </form>
                            <button onClick={() => {
                                if (isSearchOpen) {
                                    setIsSearchOpen(false);
                                    setSearchQuery("");
                                } else {
                                    setIsSearchOpen(true);
                                }
                            }} className="hover:text-secondary hover:scale-110 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
                                <span className="material-symbols-outlined">{isSearchOpen ? 'close' : 'search'}</span>
                            </button>
                        </div>

                        <Link to="/wishlist" className="hover:text-secondary hover:scale-110 transition-all duration-300 relative hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
                            <span className="material-symbols-outlined">favorite</span>
                            {wishlist.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gradient-to-br from-secondary to-[#b8941f] text-primary rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold shadow-lg">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative group py-4 flex items-center">
                                <span className="hover:text-secondary hover:scale-110 transition-all duration-300 relative hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] cursor-default">
                                    <span className="material-symbols-outlined">person_check</span>
                                </span>
                                <div className="absolute top-full right-0 mt-0 w-40 bg-primary border border-[#D4AF37]/20 shadow-[-5px_15px_30px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 rounded-b-xl overflow-hidden backdrop-blur-2xl">
                                    <Link to="/profile" className="block px-6 py-4 text-xs tracking-widest text-[#e8e4e6] hover:text-primary hover:bg-secondary transition-colors border-b border-[#D4AF37]/10">
                                        Profile
                                    </Link>
                                    <button onClick={() => { setUser(null); navigate('/login'); }} className="block w-full text-left px-6 py-4 text-xs tracking-widest text-[#e8e4e6] hover:text-white hover:bg-error transition-colors uppercase">
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="hover:text-secondary hover:scale-110 transition-all duration-300 relative hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] flex items-center">
                                <span className="material-symbols-outlined">person</span>
                            </Link>
                        )}
                        
                        <Link to="/bag" className="hover:text-secondary hover:scale-110 transition-all duration-300 relative hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
                            <span className="material-symbols-outlined">shopping_bag</span>
                            {bag.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gradient-to-br from-secondary to-[#b8941f] text-primary rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold shadow-lg">
                                    {bag.length}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex-1">
                <Outlet />
            </div>

            {/* Footer */}
            <FigmaFooter />

            {/* Global WhatsApp Floating Widget */}
            <a 
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919123456789'}?text=${encodeURIComponent("Hello! I am interested in your bespoke collection.")}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_15px_40px_rgba(37,211,102,0.6)] transition-all duration-300 flex items-center justify-center group"
                aria-label="Chat with Atelier on WhatsApp"
            >
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>
        </div>
    );
}
