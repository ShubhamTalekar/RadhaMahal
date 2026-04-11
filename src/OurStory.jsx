import { Link } from 'react-router-dom';

export default function OurStory() {
    return (
        <div className="bg-[#fdfbf7] text-primary min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-primary">
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="/ourstory-hero.png"
                        alt="Handloom Weaving"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-primary"></div>
                </div>
                <div className="relative z-10 text-center max-w-5xl mx-auto px-8">
                    <span className="text-secondary tracking-[0.5em] uppercase text-sm font-bold block mb-8 font-body">
                        The Legacy of Radha Mahal
                    </span>
                    <h1 className="text-5xl md:text-8xl text-[#fdfbf7] mb-8 leading-[1.1] font-display">
                        Woven With Time.<br />
                        <span className="italic text-secondary">Worn With Grace.</span>
                    </h1>
                    <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto"></div>
                </div>
            </section>

            {/* The Founder's Journey */}
            <section className="py-32 px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="relative">
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden relative z-10 shadow-[0_30px_60px_-15px_rgba(74,26,107,0.3)] border border-[#d4af37]/20">
                            <img
                                src="/founder.png"
                                alt="Our Founder"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -top-10 -left-10 w-40 h-40 border-2 border-[#d4af37]/20 rounded-full animate-pulse"></div>
                        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="space-y-10">
                        <div className="inline-block px-4 py-1 bg-[#d4af37]/10 text-[#d4af37] rounded-full text-xs font-bold tracking-widest uppercase">
                            Our Story
                        </div>
                        <h2 className="text-4xl md:text-6xl text-primary leading-tight font-display">
                            A Journey of <br />
                            <span className="italic">Threads & Passion</span>
                        </h2>
                        <div className="space-y-6 text-lg text-[#000000] leading-relaxed font-body">
                            <p className="font-semibold text-xl text-primary">
                                "Radha Mahal was born not from commerce, but from reverence."
                            </p>
                            <p>
                                Growing up surrounded by the rich textiles of India, our founder Neha developed a profound respect for the artisans who spend weeks, sometimes months, hunched over wooden looms to create a single six-yard masterpiece.
                            </p>
                            <p>
                                Witnessing the gradual fading of these ancestral techniques in a fast-fashion world, Radha Mahal was established with a singular vision: to revive, protect, and celebrate the authentic handloom heritage of India. Every garment in our collection is a testament to the hands that wove it.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Craftsmanship - Bento Style */}
            <section className="py-32 bg-primary text-[#fdfbf7] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>
                
                <div className="max-w-7xl mx-auto px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <span className="text-[#d4af37] tracking-[0.3em] uppercase text-xs font-bold block mb-6">Our Atelier</span>
                        <h2 className="text-4xl md:text-6xl mb-8 font-display">
                            The Anatomy of <span className="italic text-[#d4af37]">Luxury</span>
                        </h2>
                        <p className="text-lg text-white/70 italic font-body">
                            We collaborate directly with weaving clusters across Banaras, Kanchipuram, and Chanderi. There are no middlemen. Only pure silk, authentic zari, and generations of technique.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Purest Silks",
                                desc: "Sourced ethically and spun with precision for a drape that feels as weightless as air.",
                                img: "/purest-silks.png"
                            },
                            {
                                title: "Authentic Zari",
                                desc: "Intricate motifs woven with genuine metallic threads that refuse to lose their luster.",
                                img: "/authentic-zari.png"
                            },
                            {
                                title: "Heirloom Quality",
                                desc: "Designed not just for a season, but to be passed down as cherished family treasures.",
                                img: "https://www.eleganttdrapes.com/cdn/shop/files/cream-red-kanjivaram-silk-saree-close-up.jpg?v=1768286696&width=600"
                            }
                        ].map((item, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#d4af37]/30 transition-all duration-500 hover:-translate-y-2">
                                <div className="aspect-square rounded-2xl overflow-hidden mb-8 shadow-2xl">
                                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                </div>
                                <h3 className="text-2xl text-[#d4af37] mb-4 font-display">{item.title}</h3>
                                <p className="text-white/60 leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 text-center px-8">
                <div className="max-w-3xl mx-auto space-y-12">
                    <h2 className="text-4xl md:text-6xl text-primary italic font-display">
                        Become a part of the narrative.
                    </h2>
                    <Link to="/catalog" className="inline-block px-12 py-5 bg-primary text-[#fdfbf7] hover:bg-[#3d1259] rounded-full text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-2xl hover:shadow-[0_20px_40px_-10px_rgba(74,26,107,0.4)] hover:-translate-y-1">
                        Explore The Collections
                    </Link>
                </div>
            </section>
        </div>
    );
}
