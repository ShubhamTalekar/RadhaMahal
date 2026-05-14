import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function Wishlist() {
    const { wishlist, setWishlist, bag, setBag } = useApp();
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const removeWishlistItem = (id) => {
        setWishlist(prev => prev.filter(item => item.id !== id));
    };

    const clearAll = () => {
        setWishlist([]);
    };

    const moveToBag = (item) => {
        setBag(prev => [...prev, { ...item, cartItemId: Date.now(), quantity: 1, selectedSize: item.selectedSize || 'M' }]);
        removeWishlistItem(item.id);
        navigate('/bag');
    };
    return (
        <div className="min-h-screen pb-24 md:pb-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(233, 195, 73, 0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-60 sm:w-72 text-[10px] sm:text-xs">
                <div className="cursor-default flex items-center justify-between w-full h-12 sm:h-14 rounded-lg bg-[#232531] px-[10px] shadow-2xl">
                  <div className="flex gap-2 items-center">
                    <div className="text-[#2b9875] bg-white/5 backdrop-blur-xl p-1 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Done!</p>
                      <p className="text-gray-400">{toast}</p>
                    </div>
                  </div>
                  <button onClick={() => setToast(null)} className="text-gray-500 hover:bg-white/5 p-1 rounded-md transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
            <main className="pt-12 px-4 md:px-12 max-w-7xl mx-auto">
                {/* Wishlist Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="space-y-2">
                        <h4 className="font-headline italic text-primary text-xl">The Royal Atelier</h4>
                        <h1 className="font-headline text-5xl md:text-7xl text-secondary font-bold tracking-tight">Your Wishlist</h1>
                        <p className="text-on-surface-variant max-w-md font-light leading-relaxed">A curated collection of your most coveted heritage pieces, waiting to be part of your legacy.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: 'My Radha Mahal Wishlist',
                                    text: 'Check out my favorite bespoke pieces!',
                                    url: window.location.href,
                                }).catch(console.error);
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                showToast("Wishlist link copied to clipboard");
                            }
                        }} className="flex items-center gap-2 px-6 py-3 border border-outline-variant/20 rounded-full text-on-surface hover:bg-surface-container-high transition-all">
                            <span className="material-symbols-outlined text-sm">share</span>
                            <span className="text-sm font-label tracking-wider uppercase">Share List</span>
                        </button>
                        {wishlist.length > 0 && (
                            <button onClick={clearAll} className="flex items-center gap-2 px-6 py-3 border border-error/20 rounded-full text-error hover:bg-error/10 transition-all">
                                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                                <span className="text-sm font-label tracking-wider uppercase">Clear All</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* Wishlist Grid */}
                {wishlist.length === 0 ? (
                    <div className="text-center py-24 bg-surface-container-low rounded-xl border border-outline-variant/10 mb-24">
                        <span className="material-symbols-outlined text-6xl text-outline mb-4">favorite_border</span>
                        <h3 className="font-headline text-2xl text-secondary mb-4">Your wishlist is empty</h3>
                        <p className="text-on-surface-variant font-light mb-8 max-w-md mx-auto">Discover timeless heritage pieces and save your favorites here.</p>
                        <Link to="/catalog" className="inline-block px-8 py-3 bg-secondary text-on-secondary rounded-full font-bold uppercase tracking-widest text-sm hover:brightness-110">Explore Catalog</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-24">
                        {wishlist.map(item => (
                            <div key={item.id} className="group relative flex flex-col">
                                <Link to={`/product/${item.id}`} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-low mb-6 block">
                                    <img alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.image} />
                                    <button
                                        onClick={(e) => { e.preventDefault(); removeWishlistItem(item.id); }}
                                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/40 backdrop-blur-md flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-surface transition-all z-10"
                                    >
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </button>
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60 pointer-events-none"></div>
                                </Link>
                                <div className="space-y-1 mb-4 px-2 flex-grow">
                                    <div className="flex justify-between items-start gap-4">
                                        <Link to={`/product/${item.id}`} className="font-headline text-2xl text-on-surface hover:text-secondary transition-colors line-clamp-2">{item.title}</Link>
                                        <div className="flex flex-col items-end flex-shrink-0">
                                            <span className="text-secondary font-semibold">₹{(item.final_price || item.price).toLocaleString('en-IN')}</span>
                                            {item.discount_percent > 0 && item.price && (
                                                <span className="text-[10px] text-outline line-through mt-1">₹{item.price.toLocaleString('en-IN')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-on-surface-variant font-light text-sm">{item.category}</p>
                                </div>
                                <button
                                    onClick={() => moveToBag(item)}
                                    className="mt-auto w-full py-4 rounded-full bg-secondary text-on-secondary font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 hover:brightness-110 shadow-lg shadow-secondary/10"
                                >
                                    <span className="material-symbols-outlined text-lg">shopping_bag</span>
                                    Move to Bag
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </main>
        </div>
    );
}
