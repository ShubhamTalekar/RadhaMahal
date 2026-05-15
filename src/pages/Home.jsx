import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getProducts, getCarouselProducts } from '../shopifyClient';
import SEO from '../components/SEO';
import { HeroSection } from '../components/sections/HeroSection';
import { FeaturedCategories } from '../components/sections/FeaturedCategories';
import { NewArrivals as FigmaNewArrivals } from '../components/sections/NewArrivals';
import { OurStory as OurStorySection } from '../components/sections/OurStorySection';
import { Testimonials } from '../components/sections/Testimonials';
import { FestiveBanner } from '../components/sections/FestiveBanner';
import { InstagramFeed } from '../components/sections/InstagramFeed';// Static fallback slides used when no products are tagged "carousel" in Shopify.
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
                    videoUrl: p.videoUrl ?? null,   // Shopify product media video (if any)
                }));
                setHeroSlides(slides);
            } else {
                setHeroSlides(FALLBACK_SLIDES);
            }

            if (products?.length) {
                const sortedNewArrivals = [...products].sort((a, b) => Number(b.id) - Number(a.id));

                const uniqueCats = [...new Set(sortedNewArrivals.map(p => p.category))];
                const categoryItems = uniqueCats.filter(Boolean).sort().slice(0, 8).map(cat => ({
                    name: cat,
                    image: sortedNewArrivals.find(p => p.category === cat)?.images[0] || '/category-placeholder.jpg',
                    description: `Discover our exclusive ${cat} collection.`
                }));
                setCategories(categoryItems);

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
            <main>
                <SEO />
                {/* Hero skeleton */}
                <section className="relative h-[80vh] bg-gradient-to-br from-[#250624] to-[#3f1e3c] animate-pulse">
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
                        <div className="h-4 w-48 bg-[#e9c349]/20 rounded mb-6" />
                        <div className="h-12 w-80 bg-[#e9c349]/15 rounded mb-4" />
                        <div className="h-6 w-64 bg-white/10 rounded mb-8" />
                        <div className="h-12 w-44 bg-[#e9c349]/20 rounded-full" />
                    </div>
                </section>
                {/* Category skeleton */}
                <section className="py-16 bg-[#fdfbf7]">
                    <div className="container mx-auto px-4">
                        <div className="h-8 w-56 bg-[#e8e3dc] rounded mx-auto mb-10 animate-pulse" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="aspect-square bg-gradient-to-br from-[#f0ece6] to-[#e8e3dc] rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </section>
                {/* NewArrivals skeleton is handled by the component itself */}
                <FigmaNewArrivals newArrivals={[]} loading={true} wishlist={wishlist} setWishlist={setWishlist} />
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
            <SEO />
            <HeroSection slides={slides} />
            <FeaturedCategories categories={categories} />
            <FigmaNewArrivals newArrivals={newArrivals} loading={false} wishlist={wishlist} setWishlist={setWishlist} />
            <OurStorySection />
            <Testimonials />
            <FestiveBanner />
            <InstagramFeed />
        </main >
    );
}
