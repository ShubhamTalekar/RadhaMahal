import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from './context/AppContext';

export default function ShoppingBag() {
    const { bag, setBag } = useApp();

    const updateQuantity = (cartItemId, delta) => {
        setBag(prev => prev.map(item => {
            if (item.cartItemId === cartItemId) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeItem = (cartItemId) => {
        setBag(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const subtotal = bag.reduce((sum, item) => sum + ((item.final_price || item.price) * item.quantity), 0);
    const taxes = Math.round(subtotal * 0.05); // 5% estimated tax
    const total = subtotal + taxes;
    return (
        <main className="pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
            {/* Editorial Header */}
            <header className="mb-16">
                <h1 className="font-headline text-5xl md:text-7xl text-secondary mb-4 italic">The Shopping Bag</h1>
                <p className="font-body text-on-surface-variant tracking-wide max-w-lg">Your curated selections of heritage artistry, waiting to be part of your legacy.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-16 items-start">
                {/* Cart Items List */}
                <div className="flex-grow w-full space-y-12">
                    {bag.length === 0 ? (
                        <div className="text-center py-24 bg-surface-container-low rounded-xl border border-outline-variant/10">
                            <span className="material-symbols-outlined text-6xl text-outline mb-4">shopping_bag</span>
                            <h3 className="font-headline text-2xl text-secondary mb-4">Your bag is empty</h3>
                            <Link to="/catalog" className="inline-block px-8 py-3 bg-secondary text-on-secondary rounded-full font-bold uppercase tracking-widest text-sm hover:brightness-110">Continue Shopping</Link>
                        </div>
                    ) : (
                        bag.map((item) => (
                            <div key={item.cartItemId} className="flex flex-col md:flex-row gap-8 pb-12 border-b border-outline-variant/20 items-center md:items-start group">
                                <Link to={`/product/${item.id}`} className="w-full md:w-48 aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-low flex-shrink-0">
                                    <img alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={item.image} />
                                </Link>
                                <div className="flex-grow flex flex-col justify-between py-2">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <Link to={`/product/${item.id}`} className="font-headline text-2xl text-primary hover:text-secondary transition-colors">{item.title}</Link>
                                            <button onClick={() => removeItem(item.cartItemId)} className="text-on-surface-variant hover:text-error transition-colors px-2">
                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
                                            </button>
                                        </div>
                                        <p className="font-body text-on-surface-variant text-sm mb-6">{item.selectedSize ? `${item.selectedSize} | ` : ''}{item.category}</p>
                                        <div className="flex gap-8 text-sm">
                                            <div>
                                                <span className="text-outline uppercase tracking-widest block text-[10px] mb-1">Color/Size</span>
                                                <span className="text-secondary font-medium">{item.selectedSize}</span>
                                            </div>
                                            <div>
                                                <span className="text-outline uppercase tracking-widest block text-[10px] mb-1">Quantity</span>
                                                <div className="flex items-center gap-4 bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/20">
                                                    <button onClick={() => updateQuantity(item.cartItemId, -1)} className="text-on-surface-variant hover:text-secondary w-6 h-6 flex items-center justify-center">-</button>
                                                    <span className="text-on-surface font-semibold text-xs w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.cartItemId, 1)} className="text-on-surface-variant hover:text-secondary w-6 h-6 flex items-center justify-center">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 flex items-baseline gap-4">
                                        <span className="font-headline text-2xl text-secondary">₹{(item.final_price || item.price).toLocaleString('en-IN')}</span>
                                        {item.discount_percent > 0 && item.price && (
                                            <span className="text-sm font-body text-outline line-through opacity-70">₹{item.price.toLocaleString('en-IN')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Order Summary Sidebar */}
                <aside className="w-full lg:w-[400px] sticky top-32">
                    <div className="bg-surface-container-low rounded-xl p-8 shadow-2xl border border-outline-variant/10">
                        <h2 className="font-headline text-2xl text-secondary mb-8">Order Summary</h2>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-on-surface-variant font-body">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-on-surface-variant font-body">
                                <span>Shipping</span>
                                <span className={subtotal > 0 ? "text-primary italic" : "text-on-surface-variant"}>{subtotal > 0 ? 'Calculated at checkout' : '₹0'}</span>
                            </div>
                            <div className="flex justify-between text-on-surface-variant font-body">
                                <span>Estimated Taxes</span>
                                <span>₹{taxes.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="pt-4 mt-4 border-t border-outline-variant/20 flex justify-between items-end">
                                <span className="font-headline text-lg">Total</span>
                                <span className="font-headline text-3xl text-secondary">₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <Link to={bag.length > 0 ? "/checkout" : "#"} className={`block text-center w-full py-5 font-label uppercase tracking-[0.2em] text-xs font-bold rounded-full transition-all duration-300 shadow-lg ${bag.length > 0 ? 'bg-secondary text-on-secondary hover:bg-secondary-fixed shadow-secondary/10' : 'bg-surface-container-highest text-outline cursor-not-allowed pointer-events-none'}`}>
                            Proceed to Checkout
                        </Link>
                        <div className="mt-8 flex items-center justify-center gap-4 text-[10px] uppercase tracking-widest text-outline">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            Secure Checkout Guaranteed
                        </div>
                    </div>

                    {/* Heritage Note */}
                    <div className="mt-8 p-6 bg-surface-container-highest/30 rounded-lg border-l-2 border-secondary/40">
                        <p className="font-body italic text-sm text-on-surface-variant leading-relaxed">
                            "Every piece in your bag is a tribute to centuries of Indian craftsmanship. We ensure each stitch meets the royal standard of Radha Mahal."
                        </p>
                    </div>
                </aside>
            </div>

        </main>
    );
}
