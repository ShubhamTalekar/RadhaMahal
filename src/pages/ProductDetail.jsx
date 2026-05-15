import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getProductById } from '../shopifyClient';
import ProductReviews from '../components/ProductReviews';
import ProductImageGallery from '../components/ProductImageGallery';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

// No hardcoded images.

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { bag, setBag, wishlist, setWishlist, user } = useApp();

    const [selectedSize, setSelectedSize] = useState('');
    const [showSizeError, setShowSizeError] = useState(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [addedToBag, setAddedToBag] = useState(false);
    const [addedToWishlist, setAddedToWishlist] = useState(false);
    const [notificationEmail, setNotificationEmail] = useState(user?.email || '');
    const [notifyStatus, setNotifyStatus] = useState('idle');

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(false);
        getProductById(id)
            .then(found => { if (mounted) setProduct(found || null); })
            .catch(() => { if (mounted) setError(true); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [id]);

    useEffect(() => {
        if (!loading && window.location.hash === '#reviews') {
            const element = document.getElementById('reviews');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [loading]);

    const fallbackImage = product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&h=800&q=80';

    if (loading) {
        return (
            <main className="max-w-screen-2xl mx-auto px-6 md:px-12 py-12">
                <SEO title="Loading Product... - Radha Mahal" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start animate-pulse">
                    <div className="lg:col-span-7">
                        <div className="w-full aspect-[3/4] bg-surface-container-highest rounded-2xl"></div>
                    </div>
                    <div className="lg:col-span-5 space-y-6 pt-10">
                        <div className="h-12 bg-surface-container-highest rounded w-3/4"></div>
                        <div className="h-8 bg-surface-container-highest rounded w-1/4"></div>
                        <div className="space-y-3 pt-6">
                            <div className="h-4 bg-surface-container-highest rounded w-full"></div>
                            <div className="h-4 bg-surface-container-highest rounded w-5/6"></div>
                            <div className="h-4 bg-surface-container-highest rounded w-4/6"></div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-[60vh] flex flex-col items-center justify-center mt-24">
                <SEO title="Error - Radha Mahal" />
                <span className="material-symbols-outlined text-6xl text-error mb-4" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>error_outline</span>
                <h3 className="font-headline text-2xl text-secondary mb-4">Error loading product details</h3>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-secondary text-on-secondary rounded-full font-bold uppercase tracking-widest text-sm hover:brightness-110 shadow-lg">Try Again</button>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-6">
                <SEO title="Product Not Found - Radha Mahal" />
                <h1 className="text-4xl text-secondary font-headline">Product not found.</h1>
                <Link to="/catalog" className="px-8 py-3 bg-secondary text-on-secondary rounded-full font-bold uppercase tracking-widest hover:brightness-110">Back to Catalog</Link>
            </main>
        );
    }

    const handleAddToBag = () => {
        if (product.variants?.length > 0 && !selectedSize) {
            setShowSizeError(true);
            return;
        }
        const selectedVariant = product.variants?.find(v => v.title === selectedSize) || product.variants?.[0];
        // Fall back to the stored defaultVariantId (full GID) for single-variant products
        const resolvedVariantId = selectedVariant?.id || product.defaultVariantId;
        const itemToAdd = { 
            ...product, 
            selectedSize, 
            variantId: resolvedVariantId, 
            cartItemId: Date.now(), 
            quantity: 1, 
            image: fallbackImage 
        };
        setBag(prev => {
            const existingItemIndex = prev.findIndex(item => item.variantId === resolvedVariantId);
            if (existingItemIndex > -1) {
                const updatedBag = [...prev];
                updatedBag[existingItemIndex] = { ...updatedBag[existingItemIndex], quantity: updatedBag[existingItemIndex].quantity + 1 };
                return updatedBag;
            }
            return [...prev, itemToAdd];
        });
        setAddedToBag(true);
        setTimeout(() => setAddedToBag(false), 2000);
    };

    const handleAddToWishlist = () => {
        if (product.variants?.length > 0 && !selectedSize) {
            setShowSizeError(true);
            return;
        }
        const selectedVariant = product.variants?.find(v => v.title === selectedSize) || product.variants?.[0];
        if (!wishlist.find(item => item.id === product.id)) {
            setWishlist(prev => [...prev, { 
                ...product, 
                selectedSize, 
                variantId: selectedVariant?.id, 
                image: fallbackImage 
            }]);
        }
        setAddedToWishlist(true);
        setTimeout(() => setAddedToWishlist(false), 2000);
    };

    const handleNotifySubmit = async (e) => {
        e.preventDefault();
        if(!notificationEmail) return;
        setNotifyStatus('submitting');
        try {
            const selectedVariant = product.variants?.find(v => v.title === selectedSize) || product.variants?.[0];
            const BASE = import.meta.env.VITE_API_BASE_URL;
            await fetch(`${BASE}/api/v1/restock-notification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: notificationEmail, 
                    productId: product.id, 
                    variantId: selectedVariant?.id, 
                    productName: `${product.title} ${selectedSize ? `| Size: ${selectedSize}` : ''}`
                })
            });
            setNotifyStatus('success');
            setTimeout(() => setNotifyStatus('idle'), 5000);
        } catch (err) {
            setNotifyStatus('idle');
        }
    };

    return (
        <main className="max-w-screen-2xl mx-auto px-6 md:px-12 py-12">
            <SEO 
                title={`${product.title} - Radha Mahal`}
                description={product.description || `Buy ${product.title} at Radha Mahal.`}
                image={product.images?.[0]}
            />
            {/* Product Detail Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                {/* Left: Gallery Layout (Bento-inspired asymmetry) */}
                <ProductImageGallery product={product} />

                {/* Right: Product Info Panel */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    className="lg:col-span-5 sticky top-32 space-y-10">
                    <header className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-headline text-secondary leading-tight">{product.title}</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-body font-light tracking-wide text-on-surface">₹{product.final_price?.toLocaleString('en-IN')}</span>
                            {product.discount_percent > 0 && product.price && (
                                <span className="text-lg font-body text-outline line-through opacity-70">₹{product.price.toLocaleString('en-IN')}</span>
                            )}
                            <span className="px-3 py-1 bg-surface-container-high text-primary text-[10px] md:text-xs tracking-widest uppercase rounded-full">
                                {product.fabric}
                            </span>
                        </div>
                    </header>
                    {product.descriptionHtml ? (
                        <div 
                            className="text-on-surface/90 text-xs md:text-sm leading-loose font-light prose prose-sm md:prose-base max-w-none prose-p:mb-4 prose-a:text-secondary"
                            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} 
                        />
                    ) : product.description ? (
                        <div className="space-y-5 text-on-surface/90 text-xs md:text-sm leading-loose font-light">
                            {product.description.split('\n').map(l => l.trim()).filter(Boolean).map((line, idx) => {
                                if (line.toLowerCase().includes('key features')) {
                                    return <h4 key={idx} className="text-base font-headline text-secondary mt-8 mb-2 border-b border-secondary/20 pb-2 inline-block">{line}</h4>;
                                }
                                if (line.includes(':') && line.split(':')[0].length < 40) {
                                    const [title, ...rest] = line.split(':');
                                    if (rest.join(':').trim()) {
                                        return (
                                            <p key={idx} className="ml-2 border-l-2 border-secondary/30 pl-4 py-1 bg-surface-container-low/50 rounded-r-lg pr-4">
                                                <strong className="font-medium text-secondary tracking-wide">{title}:</strong> {rest.join(':')}
                                            </p>
                                        );
                                    }
                                }
                                return <p key={idx} className="text-justify leading-relaxed">{line}</p>;
                            })}
                        </div>
                    ) : (
                        <p className="text-on-surface/90 text-xs md:text-sm leading-loose font-light text-justify">
                            A masterpiece of {product.fabric || 'silk'} designed for {(product.occasion || []).join(' and ').toLowerCase() || 'special'} celebrations. Each thread tells a story of exquisite craftsmanship.
                        </p>
                    )}
                    {product.variants?.length > 0 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h3 className="font-label uppercase tracking-widest text-sm text-outline flex items-center gap-3">
                                    Select Size
                                    {showSizeError && <span className="text-red-500 normal-case text-xs bg-red-500/10 px-2 py-1 rounded-md animate-fade-in">Please select a size</span>}
                                </h3>
                                <button type="button" onClick={(e) => { e.preventDefault(); setShowSizeGuide(true); }} className="text-primary text-sm font-medium hover:underline tracking-wider">Size Guide</button>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                {product.variants.map(variant => (
                                    <button
                                        key={variant.id}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedSize(variant.title);
                                            setShowSizeError(false);
                                        }}
                                        className={`px-4 h-14 min-w-[3.5rem] rounded-full flex items-center justify-center transition-all ${
                                            selectedSize === variant.title 
                                                ? 'border-2 border-secondary text-secondary font-bold shadow-[0_0_15px_rgba(233,195,73,0.3)]' 
                                                : 'border border-outline-variant hover:border-secondary hover:text-secondary'
                                        }`}
                                    >
                                        {variant.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-4 pt-4">
                        {(() => {
                            const activeVariant = product.variants?.find(v => v.title === selectedSize) || (product.variants?.length === 1 ? product.variants[0] : null);
                            const completelySoldOut = product.availableForSale === false;
                            
                            let isOutOfStock = false;
                            if (activeVariant) {
                                isOutOfStock = !activeVariant.available;
                            } else if (selectedSize) {
                                isOutOfStock = true;
                            } else if (completelySoldOut) {
                                isOutOfStock = true;
                            }
                            
                            if (isOutOfStock) {
                                const needsSizeToNotify = completelySoldOut && !selectedSize && product.variants?.length > 1;
                                
                                return (
                                    <div className="space-y-4">
                                        <button disabled onClick={(e) => e.preventDefault()} className="w-full py-5 rounded-full font-bold uppercase tracking-widest transition-all bg-surface-container-highest text-outline cursor-not-allowed border border-outline-variant/30">
                                            Sold Out
                                        </button>
                                        {notifyStatus === 'success' ? (
                                            <div className="p-4 bg-green-900/20 text-green-600 text-center rounded-lg text-sm font-bold border border-green-600/30">
                                                You're on the list! We'll notify you instantly. 💌
                                            </div>
                                        ) : needsSizeToNotify ? (
                                            <div className="text-center text-sm text-outline animate-fade-in font-medium tracking-wide">
                                                Select a specific size to be notified of restocks.
                                            </div>
                                        ) : (
                                            <form onSubmit={handleNotifySubmit} className="flex gap-2">
                                                <input 
                                                    type="email" 
                                                    placeholder="Enter email for restock alert" 
                                                    required
                                                    value={notificationEmail}
                                                    onChange={(e) => setNotificationEmail(e.target.value)}
                                                    className="flex-1 bg-surface-container border border-outline-variant/50 rounded-full px-5 focus:outline-none focus:border-secondary text-sm placeholder:text-outline/50"
                                                />
                                                <button 
                                                    type="submit" 
                                                    disabled={notifyStatus === 'submitting'}
                                                    className="px-6 py-3 bg-primary text-secondary border border-secondary/40 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-secondary hover:text-on-secondary transition-colors"
                                                >
                                                    {notifyStatus === 'submitting' ? '...' : 'Notify Me'}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <button
                                    onClick={handleAddToBag}
                                    className={`w-full py-5 rounded-full font-bold uppercase tracking-widest transition-all shadow-lg shadow-black/20 ${addedToBag ? 'bg-green-600 text-white' : 'bg-secondary text-on-secondary hover:brightness-110'}`}
                                >
                                    {addedToBag ? 'Added to Bag ✔' : 'Add to Bag'}
                                </button>
                            );
                        })()}
                        <button
                            onClick={handleAddToWishlist}
                            className={`w-full border text-secondary py-5 rounded-full font-bold uppercase tracking-widest transition-all ${addedToWishlist ? 'border-green-600 text-green-600 bg-green-600/10' : 'border-secondary/40 hover:bg-secondary/5'}`}
                        >
                            {addedToWishlist ? 'Wishlisted ♥' : 'Add to Wishlist'}
                        </button>
                    </div>
                    {/* Trust Badges */}
                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-outline-variant/15">
                        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            Handcrafted Authenticity
                        </div>
                        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                            Priority Global Shipping
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* The Craftsmanship Section (Text Only) */}
            <section className="mt-32 mb-16 space-y-8">
                <div className="text-center space-y-4 max-w-3xl mx-auto px-6">
                    <h2 className="text-4xl font-headline text-secondary italic">The Craftsmanship</h2>
                    <p className="text-on-surface-variant font-light leading-relaxed">
                        Our artisans spend over 400 hours meticulously hand-stitching each motif using traditional techniques. 
                        The base is an exquisite Grade-A heritage fabric designed to be passed down through generations.
                    </p>
                </div>
            </section>

            {/* Style it With section removed */}

            {/* Care & Maintenance */}
            <section className="mt-32 bg-surface-container-low rounded-3xl p-12 md:p-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h3 className="text-3xl font-headline text-secondary">Care &amp; Maintenance</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined text-secondary mt-1">dry_cleaning</span>
                            <p className="text-on-surface-variant text-sm">Professional dry clean only. Avoid spraying perfumes directly on the gold zardosi embroidery.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined text-secondary mt-1">inventory_2</span>
                            <p className="text-on-surface-variant text-sm">Store in a breathable muslin bag in a cool, dry place. Avoid hanging to maintain the silhouette.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined text-secondary mt-1">iron</span>
                            <p className="text-on-surface-variant text-sm">Steam iron on reverse side only at the lowest silk setting. Do not iron over the embroidery.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface-container-high p-8 rounded-2xl border border-outline-variant/10">
                    <blockquote className="italic text-lg text-primary leading-relaxed">
                        "A Radha Mahal creation is designed to be an heirloom. Treat it with the same love that our artisans used to create it."
                    </blockquote>
                    <cite className="block mt-6 text-secondary font-headline">— Neha, Creative Director</cite>
                </div>
            </section>
            {/* Size Guide Modal */}
            {showSizeGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl transition-opacity animate-fade-in">
                    <div className="bg-surface-container-high border border-outline-variant/20 rounded-2xl p-8 max-w-md w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <button onClick={() => setShowSizeGuide(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant hover:text-secondary hover:bg-black/20 transition-all">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                        <h3 className="text-2xl font-headline text-secondary mb-6 italic text-center">Size Guide</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs uppercase tracking-widest text-outline border-b border-outline-variant/20 pb-3 font-bold">
                                <span>Size</span>
                                <span className="w-16 text-center">Bust</span>
                                <span className="w-16 text-center">Waist</span>
                                <span className="w-16 text-center">Hips</span>
                            </div>
                            {[
                                ['XS', '32"', '24"', '34"'],
                                ['S', '34"', '26"', '36"'],
                                ['M', '36"', '28"', '38"'],
                                ['L', '38"', '30"', '40"'],
                                ['XL', '40"', '32"', '42"'],
                                ['XXL', '42"', '34"', '44"'],
                                ['XXXL', '44"', '36"', '46"']
                            ].map(([size, bust, waist, hips]) => (
                                <div key={size} className="flex justify-between text-sm text-on-surface-variant py-3 border-b border-outline-variant/5 last:border-0 hover:bg-white/5 transition-colors rounded-lg px-2 -mx-2">
                                    <span className="font-bold text-secondary w-12">{size}</span>
                                    <span className="w-16 text-center">{bust}</span>
                                    <span className="w-16 text-center">{waist}</span>
                                    <span className="w-16 text-center">{hips}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-outline mt-8 text-center italic opacity-70">
                            All measurements are body measurements.
                        </p>
                    </div>
                </div>
            )}

            <ProductReviews productId={id} user={user} />
        </main>
    );
}
