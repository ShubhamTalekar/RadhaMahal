import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../shopifyClient';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const colorMapHex = {
    red: '#b91c1c', gold: '#eab308', blue: '#2563eb', pastel: '#ffc9c1',
    maroon: '#6b1e22', pink: '#ec4899', black: '#111827', green: '#047857',
    yellow: '#facc15', wine: '#4e1136', purple: '#9333ea', orange: '#f97316',
    navy: '#312e81', cream: '#fffdd0', silver: '#d1d5db', floral: '#d8a8a8',
    'blush pink': '#ffb6c1', 'champagne gold': '#ebdac3', white: '#ffffff',
    grey: '#9ca3af', gray: '#9ca3af', brown: '#92400e', peach: '#ffceb4',
    teal: '#0d9488', magenta: '#d946ef', cyan: '#06b6d4', olive: '#4d7c0f',
    coral: '#f87171'
};
const ITEMS_PER_PAGE = 12;

// Fallback base colors to organically identify future color tags
const baseColors = ['red', 'gold', 'blue', 'pastel', 'maroon', 'pink', 'black', 'green', 'yellow', 'wine', 'purple', 'orange', 'navy', 'cream', 'silver', 'floral', 'white', 'grey', 'gray', 'brown', 'peach', 'teal', 'magenta', 'cyan', 'olive', 'coral'];

function isColorTag(tag) {
    const lower = tag.toLowerCase();
    if (colorMapHex[lower]) return true;
    return baseColors.some(color => lower.includes(color));
}

export default function ProductCatalog() {
    const [searchParams] = useSearchParams();

    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
    const [selectedColors, setSelectedColors] = useState([]);
    const [priceRange, setPriceRange] = useState(searchParams.get('price') ? Number(searchParams.get('price')) : null);
    const [selectedOccasions, setSelectedOccasions] = useState(searchParams.get('occasion') ? [searchParams.get('occasion')] : []);
    const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'Featured');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [soldOutTimestamps, setSoldOutTimestamps] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('soldOutTimestamps') || '{}');
        } catch {
            return {};
        }
    });

    const [openSections, setOpenSections] = useState({
        categories: false,
        colors: false,
        price: false,
        occasions: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    useEffect(() => {
        let mounted = true;
        getProducts()
            .then(fetchedProducts => {
                if (mounted) {
                    const prods = fetchedProducts || [];
                    setProducts(prods);

                    // Track when each product first went sold out
                    setSoldOutTimestamps(prev => {
                        const now = Date.now();
                        const updated = { ...prev };
                        let changed = false;

                        prods.forEach(p => {
                            if (!p.availableForSale) {
                                // First time we see it as sold out — record the timestamp
                                if (!updated[p.id]) {
                                    updated[p.id] = now;
                                    changed = true;
                                }
                            } else {
                                // Back in stock — remove the timestamp
                                if (updated[p.id]) {
                                    delete updated[p.id];
                                    changed = true;
                                }
                            }
                        });

                        if (changed) {
                            localStorage.setItem('soldOutTimestamps', JSON.stringify(updated));
                        }
                        return changed ? updated : prev;
                    });
                }
            })
            .catch(() => {
                if (mounted) setError(true);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        setSelectedCategory(searchParams.get('category') || null);
        setPriceRange(searchParams.get('price') ? Number(searchParams.get('price')) : null);
        setSelectedOccasions(searchParams.get('occasion') ? [searchParams.get('occasion')] : []);
        setSortOption(searchParams.get('sort') || 'Featured');
        setSearchQuery(searchParams.get('q') || '');
        setCurrentPage(1);
    }, [searchParams]);

    const categories = useMemo(() => {
        const uniqueCats = [...new Set(products.map(p => p.category))];
        return uniqueCats.filter(Boolean).sort();
    }, [products]);
    const availableColors = useMemo(() => {
        const allTags = [...new Set(products.flatMap(p => p.colors || []))];
        return allTags.filter(isColorTag).slice(0, 12);
    }, [products]);
    
    const availableOccasions = useMemo(() => {
        const allTags = [...new Set(products.flatMap(p => p.occasion || []))];
        return allTags.filter(tag => {
            const lower = tag.toLowerCase();
            if (isColorTag(tag)) return false; // It's a color
            if (lower === 'carousel' || lower === 'hero') return false; // System tags
            if (lower === 'automated collection' || lower === 'home page') return false; // System collections
            if (lower.includes('silk') || lower.includes('saree') || lower.includes('zari')) return false; // Fabrics/Types
            return true; // Keep the rest as actual occasions
        }).sort();
    }, [products]);

    const { minPrice, maxPrice } = useMemo(() => {
        if (!products.length) return { minPrice: 0, maxPrice: 100000 };
        const prices = products.map(p => p.final_price || p.price || 0);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return { 
            minPrice: Math.floor(min / 1000) * 1000, 
            maxPrice: Math.ceil(max / 1000) * 1000 
        };
    }, [products]);

    const currentPriceRange = priceRange !== null ? priceRange : maxPrice;

    // A product is considered "stale sold out" (push to end) if it has been
    // continuously out of stock for more than 24 hours.
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const isStaleSoldOut = (product) => {
        if (product.availableForSale) return false;
        const ts = soldOutTimestamps[product.id];
        if (!ts) return false; // Timestamp not yet recorded (e.g., first page load)
        return Date.now() - ts >= ONE_DAY_MS;
    };

    const filteredProducts = useMemo(() => {
        if (!products.length) return [];
        return products.filter(p => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchedName = p.name && p.name.toLowerCase().includes(q);
                const matchedTitle = p.title && p.title.toLowerCase().includes(q);
                const matchedCat = p.category && p.category.toLowerCase().includes(q);
                if (!matchedName && !matchedTitle && !matchedCat) return false;
            }
            if (selectedCategory) {
                if (p.category !== selectedCategory) return false;
            }
            if (selectedColors.length > 0) {
                if (!p.colors || !selectedColors.some(c => p.colors.includes(c))) return false;
            }
            if (selectedOccasions.length > 0) {
                if (!p.occasion || !selectedOccasions.some(o => p.occasion.includes(o))) return false;
            }
            if (p.final_price > currentPriceRange) return false;
            return true;
        }).sort((a, b) => {
            // Always push stale sold-out products to the end, regardless of sort order
            const aStale = isStaleSoldOut(a);
            const bStale = isStaleSoldOut(b);
            if (aStale && !bStale) return 1;
            if (!aStale && bStale) return -1;

            // Normal sort for the rest
            if (sortOption === 'Price: Low to High') return a.final_price - b.final_price;
            if (sortOption === 'Price: High to Low') return b.final_price - a.final_price;
            if (sortOption === 'New Arrivals') return Number(b.id) - Number(a.id);
            return 0;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products, selectedCategory, selectedColors, selectedOccasions, currentPriceRange, sortOption, searchQuery, soldOutTimestamps]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const currentProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <main className="min-h-screen">
            <SEO 
                title={searchQuery ? `Search: ${searchQuery} - Radha Mahal` : selectedCategory ? `${selectedCategory} - Radha Mahal` : 'The Collection - Radha Mahal'} 
                description="Explore the exquisite collection of Radha Mahal."
            />
            {/* Hero Banner Section */}
            <section className="relative overflow-hidden py-24 silk-texture" style={{ background: 'radial-gradient(circle at center, #3f1e3c 0%, #250624 100%)' }}>
                <div className="absolute inset-0 bg-[#e9c349]/5 pointer-events-none" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)', maskImage: 'linear-gradient(to bottom, black, transparent)' }}></div>
                <div className="max-w-screen-2xl mx-auto px-12 relative z-10 text-center">
                    <p className="text-secondary font-headline italic text-xl mb-4 tracking-widest">
                        {searchQuery ? 'Search Results' : 'Timeless Heritage'}
                    </p>
                    <h1 className="text-6xl md:text-8xl font-headline text-secondary mb-8">
                        {searchQuery ? `"${searchQuery}"` : 'The Collection'}
                    </h1>
                    <div className="w-24 h-px bg-secondary/40 mx-auto"></div>
                    <p className="text-[#e9c349]/80 font-body text-xs md:text-sm mt-6 uppercase tracking-[0.25em] font-medium">
                        {selectedCategory || (selectedOccasions.length > 0 ? selectedOccasions[0] : (searchQuery ? `Search: ${searchQuery}` : 'Collection'))}
                    </p>
                </div>
            </section>

            {/* Product Listing Layout */}
            <div className="max-w-screen-2xl mx-auto px-8 md:px-12 py-20 flex flex-col md:flex-row gap-16 relative">
                 {/* Sidebar Filtering */}
                 <aside className="w-full md:w-72 flex-shrink-0 space-y-6 bg-[#e9c349]/5 p-8 rounded-2xl border border-[#e9c349]/10 h-fit sticky top-32 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.1)] z-10 font-headline">
                     {/* Category Filter */}
                     <div className="border-b border-[#e9c349]/10 pb-6">
                         <button
                             onClick={() => toggleSection('categories')}
                             className="w-full flex justify-between items-center text-left focus:outline-none group"
                         >
                             <h3 className="font-headline text-secondary text-lg uppercase tracking-widest">Categories</h3>
                             <span className={`material-symbols-outlined text-secondary text-sm transition-transform duration-300 ${openSections.categories ? 'rotate-180' : ''}`}>
                                 expand_more
                             </span>
                         </button>
                         <motion.div
                             initial={false}
                             animate={{ height: openSections.categories ? 'auto' : 0, opacity: openSections.categories ? 1 : 0 }}
                             transition={{ duration: 0.3, ease: 'easeInOut' }}
                             className="overflow-hidden"
                         >
                             <ul className="space-y-4 pt-6">
                                 {categories.map(cat => (
                                     <li key={cat}>
                                         <button
                                             onClick={() => { setSelectedCategory(cat === selectedCategory ? null : cat); setCurrentPage(1); }}
                                             className={`${cat === selectedCategory ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'} transition-colors flex justify-between items-center group w-full text-left`}
                                         >
                                             {cat}
                                             {cat === selectedCategory ?
                                                 <span className="material-symbols-outlined text-sm opacity-100">chevron_right</span> :
                                                 <span className="text-xs text-outline opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>
                                             }
                                         </button>
                                     </li>
                                 ))}
                             </ul>
                         </motion.div>
                     </div>

                     {/* Color Filter */}
                     <div className="border-b border-[#e9c349]/10 pb-6">
                         <button
                             onClick={() => toggleSection('colors')}
                             className="w-full flex justify-between items-center text-left focus:outline-none group"
                         >
                             <h3 className="font-headline text-secondary text-lg uppercase tracking-widest">Color</h3>
                             <span className={`material-symbols-outlined text-secondary text-sm transition-transform duration-300 ${openSections.colors ? 'rotate-180' : ''}`}>
                                 expand_more
                             </span>
                         </button>
                         <motion.div
                             initial={false}
                             animate={{ height: openSections.colors ? 'auto' : 0, opacity: openSections.colors ? 1 : 0 }}
                             transition={{ duration: 0.3, ease: 'easeInOut' }}
                             className="overflow-hidden"
                         >
                             <div className="flex flex-wrap gap-3 pt-6">
                                 {availableColors.map(c => {
                                     const lower = c.toLowerCase();
                                     const mappedColor = colorMapHex[lower] || lower.split(' ').pop();
                                     
                                     return (
                                         <button
                                             key={c}
                                             onClick={() => {
                                                 setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
                                                 setCurrentPage(1);
                                             }}
                                             style={{ backgroundColor: mappedColor }}
                                             className={`w-8 h-8 rounded-full transition-all duration-300 ${mappedColor === '#ffffff' ? 'border border-black' : 'border border-white/20'} ${selectedColors.includes(c) ? 'ring-offset-2 ring-offset-[#250624] ring-2 ring-[#e9c349] shadow-[0_0_15px_rgba(233,195,73,0.5)] scale-110' : 'opacity-70 hover:opacity-100 hover:scale-110 hover:shadow-lg hover:border-white/40'}`}
                                             title={c}
                                         />
                                     );
                                 })}
                             </div>
                         </motion.div>
                     </div>

                     {/* Price Range */}
                     <div className="border-b border-[#e9c349]/10 pb-6">
                         <button
                             onClick={() => toggleSection('price')}
                             className="w-full flex justify-between items-center text-left focus:outline-none group"
                         >
                             <h3 className="font-headline text-secondary text-lg uppercase tracking-widest">Price Range</h3>
                             <span className={`material-symbols-outlined text-secondary text-sm transition-transform duration-300 ${openSections.price ? 'rotate-180' : ''}`}>
                                 expand_more
                             </span>
                         </button>
                         <motion.div
                             initial={false}
                             animate={{ height: openSections.price ? 'auto' : 0, opacity: openSections.price ? 1 : 0 }}
                             transition={{ duration: 0.3, ease: 'easeInOut' }}
                             className="overflow-hidden"
                         >
                             <div className="pt-6">
                                 <input
                                     className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary"
                                     type="range" min={minPrice} max={maxPrice} step={Math.max(1000, Math.floor((maxPrice - minPrice) / 20))}
                                     value={currentPriceRange}
                                     onChange={(e) => { setPriceRange(Number(e.target.value)); setCurrentPage(1); }}
                                 />
                                 <div className="flex justify-between mt-4 text-sm text-on-surface-variant font-medium">
                                     <span>₹{minPrice.toLocaleString('en-IN')}</span>
                                     <span>₹{currentPriceRange.toLocaleString('en-IN')}{currentPriceRange >= maxPrice ? '+' : ''}</span>
                                 </div>
                             </div>
                         </motion.div>
                     </div>

                     {/* Occasion Filter */}
                     {availableOccasions.length > 0 && (
                         <div className="pb-2">
                             <button
                                 onClick={() => toggleSection('occasions')}
                                 className="w-full flex justify-between items-center text-left focus:outline-none group"
                             >
                                 <h3 className="font-headline text-secondary text-lg uppercase tracking-widest">Occasion</h3>
                                 <span className={`material-symbols-outlined text-secondary text-sm transition-transform duration-300 ${openSections.occasions ? 'rotate-180' : ''}`}>
                                     expand_more
                                 </span>
                             </button>
                             <motion.div
                                 initial={false}
                                 animate={{ height: openSections.occasions ? 'auto' : 0, opacity: openSections.occasions ? 1 : 0 }}
                                 transition={{ duration: 0.3, ease: 'easeInOut' }}
                                 className="overflow-hidden"
                             >
                                 <div className="space-y-3 pt-6">
                                     {availableOccasions.map(occ => (
                                         <label key={occ} className="flex items-center gap-3 cursor-pointer group">
                                             <input
                                                 className="form-checkbox w-5 h-5 bg-black/20 border-[#e9c349]/30 text-[#e9c349] rounded focus:ring-[#e9c349]/30 focus:ring-offset-[#250624] transition-all cursor-pointer"
                                                 type="checkbox"
                                                 checked={selectedOccasions.includes(occ)}
                                                 onChange={(e) => {
                                                     if (e.target.checked) setSelectedOccasions([...selectedOccasions, occ]);
                                                     else setSelectedOccasions(selectedOccasions.filter(x => x !== occ));
                                                     setCurrentPage(1);
                                                 }}
                                             />
                                             <span className="text-on-surface-variant group-hover:text-secondary transition-colors font-headline">{occ}</span>
                                         </label>
                                     ))}
                                 </div>
                             </motion.div>
                         </div>
                     )}
                 </aside>

                {/* Main Product Grid */}
                <div className="flex-1">
                    {/* Grid Controls */}
                    <div className="flex justify-between items-end mb-12 border-b border-outline-variant/20 pb-6">
                        <div>
                            <p className="text-on-surface-variant font-medium">Showing <span className="text-secondary">{currentProducts.length}</span> of {filteredProducts.length} products</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm uppercase tracking-widest text-outline">Sort by:</span>
                            <select
                                value={sortOption}
                                onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                                className="bg-transparent border-none text-secondary font-headline focus:ring-0 cursor-pointer"
                            >
                                <option>Featured</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>New Arrivals</option>
                            </select>
                        </div>
                    </div>

                    {/* Products */}
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-12 sm:gap-y-16 animate-pulse">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="group relative block">
                                    <div className="aspect-[3/4] overflow-hidden rounded-xl bg-surface-container-highest mb-6 relative"></div>
                                    <div className="w-3/4 h-5 bg-surface-container-highest rounded mb-2"></div>
                                    <div className="w-1/4 h-5 bg-surface-container-highest rounded mt-2"></div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px]">
                            <span className="material-symbols-outlined text-6xl text-error mb-4" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>error_outline</span>
                            <h3 className="font-headline text-2xl text-secondary mb-4">Error loading products</h3>
                            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-secondary text-on-secondary rounded-full font-bold uppercase tracking-widest text-sm hover:brightness-110 shadow-lg">Try Again</button>
                        </div>
                    ) : (
                        <motion.div 
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.05 } },
                                hidden: {}
                            }}
                            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-12 sm:gap-y-16">
                            {currentProducts.map((product) => (
                                <motion.div 
                                    variants={{
                                        hidden: { opacity: 0, y: 30 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                                    }}
                                    key={product.id}>
                                    <Link to={`/product/${product.id}`} className="group relative block">
                                        <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#250624] mb-6 relative shadow-lg group/image">
                                        {/* Use Shopify image if available */}
                                        {(() => {
                                            const img1 = product.images?.[0] || null;
                                            const img2 = product.images?.[1] || null; 
                                            const hasHover = Boolean(img2);
                                            
                                            return (
                                                <>
                                                    {img1 ? (
                                                        <img alt={product.title} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out z-10 ${hasHover ? 'group-hover/image:scale-110 group-hover/image:opacity-0' : 'group-hover/image:scale-105'}`} src={img1} />
                                                    ) : (
                                                        <div className="absolute inset-0 w-full h-full bg-[#3a0a35] z-10" />
                                                    )}
                                                    {hasHover && (
                                                        <img alt={`${product.title} alternate view`} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover/image:opacity-100 group-hover/image:scale-105 z-0" src={img2} />
                                                    )}
                                                </>
                                            );
                                        })()}



                                        {(!product.availableForSale) && (
                                            <div className="absolute inset-0 bg-[#250624]/40 z-[15] flex items-center justify-center pointer-events-none transition-all duration-500 group-hover/image:bg-[#250624]/20">
                                                <span className="bg-white backdrop-blur-md px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-[#250624] border border-white/20 shadow-2xl tracking-[0.2em]">Out of Stock</span>
                                            </div>
                                        )}

                                        {product.discount_percent > 0 && (
                                            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
                                                <span className="bg-[#250624]/80 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-[#e9c349] border border-[#e9c349]/20 shadow-lg">-{product.discount_percent}%</span>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-headline text-on-surface text-sm sm:text-lg mb-1 truncate" title={product.title}>{product.title}</h4>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <p className="text-secondary font-bold tracking-wider text-sm sm:text-base">₹{product.final_price.toLocaleString('en-IN')}</p>
                                        {product.discount_percent > 0 && (
                                            <p className="text-xs text-outline line-through">₹{product.price.toLocaleString('en-IN')}</p>
                                        )}
                                    </div>
                                    <p className="text-xs text-outline mt-2 uppercase tracking-widest">{product.category}</p>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-24 flex items-center justify-center gap-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="w-12 h-12 rounded-full flex items-center justify-center border border-[#e9c349]/20 text-[#d2c2cc] hover:border-[#e9c349] hover:bg-[#e9c349]/5 hover:text-[#e9c349] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === page ? 'bg-[#e9c349] text-[#250624] font-bold shadow-[0_0_15px_rgba(233,195,73,0.4)]' : 'text-[#d2c2cc] hover:bg-[#e9c349]/10 hover:text-[#e9c349]'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="w-12 h-12 rounded-full flex items-center justify-center border border-[#e9c349]/20 text-[#d2c2cc] hover:border-[#e9c349] hover:bg-[#e9c349]/5 hover:text-[#e9c349] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
