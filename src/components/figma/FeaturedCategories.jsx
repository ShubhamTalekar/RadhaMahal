import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";



export function FeaturedCategories({ categories = [] }) {
  if (!categories || categories.length === 0) return null;
  return (
    <section id="collections" className="py-24 bg-gradient-to-b from-[#fdfbf7] via-[#f5f1ed] to-[#fdfbf7] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-7 h-7 text-[#d4af37] animate-pulse" />
            <span className="text-[#d4af37] tracking-[0.3em] font-bold text-sm">
              COLLECTIONS
            </span>
            <Sparkles className="w-7 h-7 text-[#d4af37] animate-pulse" />
          </div>
          <h2 
            className="text-5xl md:text-7xl text-primary mb-6 font-bold"
           
          >
            Explore Our{" "}
            <span className="bg-gradient-to-r from-[#d4af37] via-[#f4d56f] to-[#d4af37] bg-clip-text text-transparent animate-gradient">
              Heritage
            </span>
          </h2>
          <p className="text-xl text-[#6d5c7d] max-w-3xl mx-auto leading-relaxed">
            Each piece tells a story of tradition, craftsmanship, and timeless beauty
          </p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
             visible: { transition: { staggerChildren: 0.2 } },
             hidden: {}
          }}
          className={`grid grid-cols-1 md:grid-cols-2 ${categories.length === 1 ? 'max-w-lg mx-auto' : categories.length === 2 ? 'lg:grid-cols-2 max-w-6xl mx-auto gap-12' : categories.length === 3 ? 'lg:grid-cols-3 max-w-[90rem] mx-auto gap-10' : 'lg:grid-cols-4'} gap-8`}>
          {categories.map((category, index) => (
            <motion.div
              variants={{
                 hidden: { opacity: 0, y: 50 },
                 visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
              }}
              key={index}
            >
              <Link
                to={`/catalog?category=${encodeURIComponent(category.name)}`}
                className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-[0_20px_60px_rgba(212,175,55,0.4)] transition-all duration-700 cursor-pointer transform hover:-translate-y-3 block"
              >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />
              
              {/* Animated border */}
              <div className="absolute inset-0 border-4 border-[#d4af37] opacity-0 group-hover:opacity-100 transition-all duration-500 m-4 rounded-2xl">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#f4d56f]"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#f4d56f]"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#f4d56f]"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#f4d56f]"></div>
              </div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 animate-shimmer"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                <h3 
                  className="text-4xl text-[#fdfbf7] mb-3 transform translate-y-0 group-hover:-translate-y-3 transition-transform duration-500 font-bold drop-shadow-lg"
                 
                >
                  {category.name}
                </h3>
                <p 
                  className="text-lg text-[#d4af37] opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 font-semibold"
                 
                >
                  {category.description}
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-700 delay-100">
                  <span className="inline-block px-6 py-2 border-2 border-[#d4af37] rounded-full text-[#fdfbf7] text-sm font-semibold hover:bg-[#d4af37] hover:text-primary transition-colors duration-300">
                    Explore →
                  </span>
                </div>
              </div>
            </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}