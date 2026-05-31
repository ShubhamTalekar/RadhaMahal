import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { createShopifyCart } from '../shopifyClient';
import SEO from '../components/SEO';

export default function Checkout() {
    const navigate = useNavigate();
    const { bag, setBag, user, setUser } = useApp();
    const [selectedPayment, setSelectedPayment] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState(null);
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
    
    const primaryAddress = user?.addresses?.find(a => a.isPrimary) || null;
    const [shippingDetails, setShippingDetails] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        street: primaryAddress ? primaryAddress.lines[0] : '',
        city: primaryAddress ? primaryAddress.lines[1] : '',
        pin: primaryAddress ? primaryAddress.lines[2]?.replace(', India', '') : '',
        region: 'maharashtra'
    });

    // Shipping and Taxes are dynamically fetched from Shopify API based on actual shipping zones during Checkout
    const shippingCost = 0;

    const subtotal = bag.reduce((sum, item) => sum + ((item.final_price || item.price) * item.quantity), 0);
    const taxes = 0;
    const total = subtotal + taxes + shippingCost;

    const handlePlaceOrder = async () => {
        if (bag.length === 0) {
            showToast("Your bag is empty!");
            return;
        }

        setIsProcessing(true);

        try {
            // Create Shopify Cart
            const shopifyCartData = await createShopifyCart(bag.map(item => ({
                variantId: item.variantId,
                quantity: item.quantity
            })), shippingDetails, user?.email);

            if (shopifyCartData?.cart?.checkoutUrl) {
                // Clear local bag
                setBag([]);
                
                // Immediately clear from Supabase if logged in, or local guest_bag
                if (user?.email) {
                    try {
                        const { supabase } = await import('../supabaseClient');
                        await supabase.from('shopping_bags').upsert({ email: user.email, items: [] }, { onConflict: 'email' });
                    } catch (e) {
                        console.error("Failed to clear remote bag", e);
                    }
                } else {
                    try {
                        localStorage.removeItem('guest_bag');
                    } catch (e) {}
                }
                
                let checkoutUrl = shopifyCartData.cart.checkoutUrl;
                // Rewrite the URL if Shopify uses the headless Vercel domain as primary
                const shopifyDomain = import.meta.env.VITE_SHOPIFY_DOMAIN || 'radha-mahal-2.myshopify.com';
                try {
                    const urlObj = new URL(checkoutUrl);
                    if (urlObj.hostname !== shopifyDomain) {
                        urlObj.hostname = shopifyDomain;
                        checkoutUrl = urlObj.toString();
                    }
                } catch (e) {
                    console.error("Failed to parse checkout URL", e);
                }
                
                // Redirect user to Shopify native checkout
                window.location.href = checkoutUrl;
            } else {
                const errorMsg = shopifyCartData?.userErrors?.[0]?.message || "Shopify checkout is unavailable. Check your product availability.";
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            showToast(`Artisan Concierge: ${error.message}`);
            setIsProcessing(false);
        }
    };

    return (
        <main className="pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
            <SEO 
                title="Checkout - Radha Mahal"
                description="Complete your order and secure your bespoke pieces."
            />
            {toast && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-60 sm:w-72 text-[10px] sm:text-xs">
                <div className="cursor-default flex items-center justify-between w-full h-12 sm:h-14 rounded-lg bg-[#232531] px-[10px] shadow-2xl">
                  <div className="flex gap-2 items-center">
                    <div className="text-red-400 bg-white/5 backdrop-blur-xl p-1 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Error</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left Column: Forms */}
                <div className="lg:col-span-7 space-y-20">
                    {/* Shipping Address Section */}
                    <section>
                        <h2 className="font-headline text-3xl text-secondary mb-10 flex items-center gap-4">
                            Shipping Address
                            <span className="h-[1px] flex-grow bg-secondary/20"></span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2 relative group">
                                <label className="block text-xs font-label uppercase tracking-widest text-outline mb-2 group-focus-within:text-secondary transition-colors">Shipping Region</label>
                                <select value={shippingDetails.region} onChange={e => setShippingDetails({...shippingDetails, region: e.target.value})} className="w-full bg-transparent border-0 border-b border-outline/30 focus:ring-0 focus:border-secondary transition-all py-3 px-0 text-on-surface font-body outline-none">
                                    <option value="maharashtra">Maharashtra</option>
                                    <option value="india">Rest of India</option>
                                    <option value="global">Global Delivery</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 relative group">
                                <label className="block text-xs font-label uppercase tracking-widest text-outline mb-2 group-focus-within:text-secondary transition-colors">Full Name</label>
                                <input value={shippingDetails.name} onChange={e => setShippingDetails({...shippingDetails, name: e.target.value})} className="w-full bg-transparent border-0 border-b border-outline/30 focus:ring-0 focus:border-secondary transition-all py-3 px-0 text-on-surface font-body" placeholder={user?.name || "Full Name"} type="text" />
                            </div>
                            <div className="md:col-span-2 relative group">
                                <label className="block text-xs font-label uppercase tracking-widest text-outline mb-2 group-focus-within:text-secondary transition-colors">Street Address</label>
                                <input value={shippingDetails.street} onChange={e => setShippingDetails({...shippingDetails, street: e.target.value})} className="w-full bg-transparent border-0 border-b border-outline/30 focus:ring-0 focus:border-secondary transition-all py-3 px-0 text-on-surface font-body" placeholder="Street Address" type="text" />
                            </div>
                            <div className="relative group">
                                <label className="block text-xs font-label uppercase tracking-widest text-outline mb-2 group-focus-within:text-secondary transition-colors">City</label>
                                <input value={shippingDetails.city} onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})} className="w-full bg-transparent border-0 border-b border-outline/30 focus:ring-0 focus:border-secondary transition-all py-3 px-0 text-on-surface font-body" placeholder="City" type="text" />
                            </div>
                            <div className="relative group">
                                <label className="block text-xs font-label uppercase tracking-widest text-outline mb-2 group-focus-within:text-secondary transition-colors">Pin Code</label>
                                <input value={shippingDetails.pin} onChange={e => setShippingDetails({...shippingDetails, pin: e.target.value})} className="w-full bg-transparent border-0 border-b border-outline/30 focus:ring-0 focus:border-secondary transition-all py-3 px-0 text-on-surface font-body" placeholder="Pin Code" type="text" />
                            </div>
                        </div>
                    </section>

                    {/* Payment Methods Section */}
                    <section>
                        <h2 className="font-headline text-3xl text-secondary mb-10 flex items-center gap-4">
                            Payment Methods
                            <span className="h-[1px] flex-grow bg-secondary/20"></span>
                        </h2>
                        <p className="text-on-surface-variant font-body mb-6 text-sm">You will be redirected to the secure Shopify Checkout to complete your payment.</p>
                        <div className="space-y-4">
                            {/* Credit/Debit Card */}
                            <div onClick={() => setSelectedPayment('card')} className={`p-6 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer border group flex items-center justify-between ${selectedPayment === 'card' ? 'border-secondary' : 'border-transparent hover:border-secondary/20'}`}>
                                <div className="flex items-center gap-6">
                                    <span className={`material-symbols-outlined text-3xl transition-colors ${selectedPayment === 'card' ? 'text-secondary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>credit_card</span>
                                    <span className={`font-headline text-lg transition-colors ${selectedPayment === 'card' ? 'text-secondary' : 'group-hover:text-secondary text-on-surface'}`}>Credit/Debit Card</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'card' ? 'border-secondary' : 'border-outline/30'}`}>
                                    {selectedPayment === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>}
                                </div>
                            </div>
                            {/* UPI */}
                            <div onClick={() => setSelectedPayment('upi')} className={`p-6 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer border group flex items-center justify-between ${selectedPayment === 'upi' ? 'border-secondary' : 'border-transparent hover:border-secondary/20'}`}>
                                <div className="flex items-center gap-6">
                                    <span className={`material-symbols-outlined text-3xl transition-colors ${selectedPayment === 'upi' ? 'text-secondary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                                    <span className={`font-headline text-lg transition-colors ${selectedPayment === 'upi' ? 'text-secondary' : 'group-hover:text-secondary text-on-surface'}`}>UPI</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'upi' ? 'border-secondary' : 'border-outline/30'}`}>
                                    {selectedPayment === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>}
                                </div>
                            </div>
                            {/* Net Banking */}
                            <div onClick={() => setSelectedPayment('net')} className={`p-6 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer border group flex items-center justify-between ${selectedPayment === 'net' ? 'border-secondary' : 'border-transparent hover:border-secondary/20'}`}>
                                <div className="flex items-center gap-6">
                                    <span className={`material-symbols-outlined text-3xl transition-colors ${selectedPayment === 'net' ? 'text-secondary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                                    <span className={`font-headline text-lg transition-colors ${selectedPayment === 'net' ? 'text-secondary' : 'group-hover:text-secondary text-on-surface'}`}>Net Banking</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'net' ? 'border-secondary' : 'border-outline/30'}`}>
                                    {selectedPayment === 'net' && <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-5">
                    <aside className="sticky top-32 p-10 rounded-xl bg-surface-container-low shadow-2xl overflow-hidden">
                        {/* Background Accent Pattern */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(#e9c349 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }}></div>
                        <h3 className="font-headline text-2xl text-secondary mb-8 border-b border-outline-variant/30 pb-4">Order Summary</h3>
                        <div className="space-y-6 mb-10 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {bag.map(item => (
                                <div key={item.cartItemId} className="flex gap-4 items-center">
                                    <div className="w-20 h-24 rounded-lg bg-surface-container-high flex-shrink-0 overflow-hidden">
                                        <img alt={item.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src={item.image} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-headline text-sm uppercase tracking-wider mb-1 line-clamp-1" title={item.title}>{item.title}</p>
                                        <p className="text-xs text-on-surface-variant font-label">Qty: {item.quantity.toString().padStart(2, '0')}</p>
                                        <p className="text-secondary font-headline mt-1">₹{((item.final_price || item.price) * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-8 border-t border-outline-variant/30">
                            <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant uppercase tracking-widest font-label">Subtotal</span>
                                <span className="font-headline">₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between pt-6 mt-4 border-t border-outline-variant/30 text-xl">
                                <span className="font-headline text-secondary uppercase tracking-widest">Total</span>
                                <span className="font-headline text-secondary">₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={isProcessing}
                            className={`w-full mt-10 py-5 rounded-full bg-secondary text-on-secondary font-headline text-lg uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale`}
                        >
                            {isProcessing ? 'Preparing Your Atelier...' : 'Secure Heritage Checkout'}
                        </button>
                        <p className="text-center mt-6 text-[10px] text-outline uppercase tracking-widest leading-loose">
                            Handcrafted with heritage. Secured by Shopify Payments.
                        </p>
                    </aside>
                </div>
            </div>
        </main>
    );
}
