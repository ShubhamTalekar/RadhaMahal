import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { getProducts, getCarouselProducts } from './shopifyClient';
import { HeroSection } from './components/figma/HeroSection';
import { FeaturedCategories } from './components/figma/FeaturedCategories';
import { NewArrivals as FigmaNewArrivals } from './components/figma/NewArrivals';
import { OurStory } from './components/figma/OurStory';
import { Testimonials } from './components/figma/Testimonials';
import { FestiveBanner } from './components/figma/FestiveBanner';
import { InstagramFeed } from './components/figma/InstagramFeed';// Static fallback slides used when no products are tagged "carousel" in Shopify.
const FALLBACK_SLIDES = [
    {
        id: '1',
        handle: null,
        image: '/hero1.jpg',
        altText: 'The Emerald Courts',
        tag: 'EXCLUSIVE COLLECTION',
        headline: 'Elegance Woven\nin Tradition',
        subtitle: 'Discover our exquisite collection of handcrafted sarees',
    },
    {
        id: '15',
        handle: null,
        image: '/hero2.jpg',
        altText: 'The Ganga Collection',
        tag: 'EXCLUSIVE COLLECTION',
        headline: 'Elegance Woven\nin Tradition',
        subtitle: 'Discover our exquisite collection of handcrafted sarees',
    },
    {
        id: '22',
        handle: null,
        image: '/hero3.jpg',
        altText: 'Serene In Red',
        tag: 'FESTIVE COLLECTION',
        headline: 'Celebrate Every\nMoment in Style',
        subtitle: 'Step into the spotlight with our limited-edition couture.',
    },
];

export default function Home() {
    const { wishlist, setWishlist } = useApp();
    const [categories, setCategories] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    // null = still loading (prevents fallback flash); [] = loaded but empty (use fallback)
    const [heroSlides, setHeroSlides] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(false);

        Promise.all([
            getCarouselProducts().catch(() => { setError(true); return []; }),
            getProducts().catch(() => { setError(true); return []; })
        ]).then(([carouselProducts, products]) => {
            if (!mounted) return;
            setLoading(false);
            
            if (carouselProducts.length > 0) {
                const slides = carouselProducts.map(p => ({
                    id: p.id,          // numeric ID — used for /product/:id routing
                    handle: p.handle,
                    image: p.image,
                    altText: p.altText,
                    tag: p.title,
                    headline: p.title,
                    subtitle: 'Discover our exquisite collection of handcrafted sarees',
                }));
                setHeroSlides(slides);
            } else {
                setHeroSlides(FALLBACK_SLIDES);
            }

            if (products?.length) {
                const uniqueCats = [...new Set(products.map(p => p.category))];
                const categoryItems = uniqueCats.filter(Boolean).sort().slice(0, 8).map(cat => ({
                    name: cat,
                    image: products.find(p => p.category === cat)?.images[0] || '/category-placeholder.jpg',
                    description: `Discover our exclusive ${cat} collection.`
                }));
                setCategories(categoryItems);

                const sortedNewArrivals = [...products].sort((a, b) => Number(b.id) - Number(a.id));
                setNewArrivals(sortedNewArrivals.slice(0, 8)); // more for side-scroll
            }
        });

        return () => { mounted = false; };
    }, []);

    // While loading (null): render NO slides so fallback images never flash on-screen.
    // Once Shopify resolves, heroSlides is either the live data or FALLBACK_SLIDES.
    const slides = heroSlides ?? [];

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center animate-pulse">
                    <span className="material-symbols-outlined text-[#e9c349] text-5xl animate-spin mb-4" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>sync</span>
                    <p className="text-secondary font-headline tracking-widest uppercase text-xs">Curating Collection...</p>
                </div>
            </main>
        );
    }

    if (error && !slides.length && !newArrivals.length) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-error mb-4" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>error_outline</span>
                <h3 className="font-headline text-2xl text-secondary mb-4">Error loading store</h3>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-secondary text-on-secondary rounded-full font-bold uppercase tracking-widest text-sm hover:brightness-110 shadow-lg">Try Again</button>
            </main>
        );
    }

    return (
        <main>
            <HeroSection slides={slides} />
            <FeaturedCategories categories={categories} />
            <FigmaNewArrivals newArrivals={newArrivals} wishlist={wishlist} setWishlist={setWishlist} />
            <OurStory />
            <Testimonials />
            <FestiveBanner />
            <InstagramFeed />
        </main >
    );
}
