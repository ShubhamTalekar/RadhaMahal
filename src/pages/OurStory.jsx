import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

export default function OurStory() {
    return (
        <div className="bg-[#fdfbf7] text-primary min-h-screen">
            <SEO 
                title="Our Story - Radha Mahal" 
                description="Discover the heritage, craftsmanship, and soul behind Radha Mahal's exquisite creations." 
            />
            {/* Hero Section */}
            <section className="relative h-[45vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-primary">
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="/ourstory-hero.png"
                        alt="Handloom Weaving"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-primary"></div>
                </div>
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10 text-center max-w-5xl mx-auto px-8"
                >
                    <span className="text-secondary tracking-[0.5em] uppercase text-sm font-bold block mb-8 font-body">
                        The Legacy of Radha Mahal
                    </span>
                    <h1 className="text-4xl md:text-8xl text-[#fdfbf7] mb-8 leading-[1.1] font-display">
                        Woven With Time.<br />
                        <span className="italic text-secondary">Worn With Grace.</span>
                    </h1>
                    <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto"></div>
                </motion.div>
            </section>

            {/* The Founder's Journey */}
            <section className="py-12 md:py-24 px-5 md:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-start">
                    <div className="relative lg:sticky lg:top-32">
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden relative z-10 shadow-[0_30px_60px_-15px_rgba(74,26,107,0.3)] border border-[#d4af37]/20">
                            <img
                                src="/founder-latest.jpg"
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
                                "Every brand has a beginning, but some begin with a feeling."
                            </p>
                            <p>
                                For me, it started with two names—Neha, the one the world knows, and Radha, the one my home, my roots, and my heart have always called me. Over time, Radha became more than just a name. It became a quiet identity—a dream waiting to take form.
                            </p>
                            <p>
                                Like every dreamer, I stepped into the world with big aspirations. I tried, I explored, I failed, and I learned. There were moments of doubt, moments when things didn't go as planned—but there was always a voice within me that refused to give up. A belief that one day, I would create something truly mine… something that would carry my essence.
                            </p>
                            <p>
                                In the process of finding myself, I began expressing my thoughts through videos. It was raw, honest, and real—just me, sharing my journey. Slowly, people began to notice. Their words, their encouragement, and their belief in me became the strength I didn't know I needed. They saw something in me, and somewhere along the way, I started seeing it too.
                            </p>
                            <p>
                                That's when the idea was born. I didn't just want to build a business. I wanted to build a world—a space that reflects warmth, belonging, beauty, and authenticity. A world where every piece tells a story. A world where tradition meets emotion. A world where everyone feels a part of something special.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mt-12 md:mt-16">
                    <div className="space-y-8 text-lg text-[#000000] leading-relaxed font-body text-left">
                        <p className="text-2xl font-display text-primary">
                            And that vision gave life to <span className="italic font-semibold">Radha Mahal</span>.
                        </p>
                        <p>
                            <span className="font-semibold text-primary">Radha</span>—my soul, my identity. <span className="font-semibold text-primary">Mahal</span>—a place not just of walls, but of emotions… a home where everyone is welcome.
                        </p>
                        <p>
                            At Radha Mahal, we bring you sarees and dresses that are not just products, but expressions of art. Each piece is thoughtfully sourced directly from skilled manufacturers, celebrating craftsmanship in its purest form. Our collections are handwoven, raw, and deeply rooted in authenticity—created with intention, love, and respect for tradition.
                        </p>
                    </div>
                    
                    <div className="space-y-8 text-lg text-[#000000] leading-relaxed font-body text-left">
                        <p>
                            We believe luxury is not just about appearance—it's about feeling. The feeling of wearing something made with heart. The feeling of carrying a story, a culture, a dream.
                        </p>
                        <div className="py-8">
                            <p className="font-semibold text-2xl md:text-3xl text-primary italic leading-relaxed font-display">
                                "This journey is no longer just mine. It belongs to every person who connects with it, believes in it, and becomes a part of it."
                            </p>
                        </div>
                        <p className="text-xl">
                            Radha Mahal is not just a brand. It is a dream turned into a destination. A reflection of resilience, passion, and the courage to create your own world.
                        </p>
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

                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={{ visible: { transition: { staggerChildren: 0.2 } }, hidden: {} }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-12"
                    >
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
                            <motion.div 
                                key={i} 
                                variants={{
                                    hidden: { opacity: 0, y: 50 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                                }}
                                className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#d4af37]/30 transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className="aspect-square rounded-2xl overflow-hidden mb-8 shadow-2xl">
                                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                </div>
                                <h3 className="text-2xl text-[#d4af37] mb-4 font-display">{item.title}</h3>
                                <p className="text-white/60 leading-relaxed text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 text-center px-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "backOut" }}
                    className="max-w-3xl mx-auto space-y-12"
                >
                    <h2 className="text-4xl md:text-6xl text-primary italic font-display">
                        Become a part of the narrative.
                    </h2>
                    <Link to="/catalog" className="inline-block px-12 py-5 bg-primary text-[#fdfbf7] hover:bg-[#3d1259] rounded-full text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-2xl hover:shadow-[0_20px_40px_-10px_rgba(74,26,107,0.4)] hover:-translate-y-1">
                        Explore The Collections
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
