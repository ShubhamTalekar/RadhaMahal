import SliderImport from "react-slick";
const Slider = SliderImport.default || SliderImport;
import { Eye, Heart } from "lucide-react";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { NextArrow, PrevArrow } from '../SliderArrow';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function NewArrivals({ newArrivals = [], wishlist = [], setWishlist }) {
  if (!newArrivals || newArrivals.length === 0) return null;

  const toggleWishlist = (product) => {
    const isProductInWishlist = wishlist?.some(item => item.id === product.id);
    if (isProductInWishlist) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
    } else {
      setWishlist(prev => [...prev, product]);
    }
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow customClass="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-[#d4af37] hover:bg-[#b8941f] text-primary rounded-full p-2 transition-all duration-300 shadow-lg" iconSize={5} />,
    prevArrow: <PrevArrow customClass="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-[#d4af37] hover:bg-[#b8941f] text-primary rounded-full p-2 transition-all duration-300 shadow-lg" iconSize={5} />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
    ]
  };

  const ProductCard = ({ product }) => (
    <Link to={`/product/${product.id}`} className="block group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_20px_50px_rgba(212,175,55,0.3)] transition-all duration-700 transform hover:-translate-y-2">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400x600?text=No+Image'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-gradient-to-r from-[#d4af37] to-[#f4d56f] text-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">New</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/0 group-hover:from-primary/60 to-transparent transition-all duration-500">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <button className="bg-[#fdfbf7] text-primary p-3 rounded-full hover:bg-[#d4af37] hover:scale-110 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-xl">
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
            className={`p-3 rounded-full hover:scale-110 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75 shadow-xl ${wishlist?.some(item => item.id === product.id) ? 'bg-[#d4af37] text-primary' : 'bg-[#fdfbf7] text-primary hover:bg-[#d4af37]'}`}
          >
            <Heart className={`w-5 h-5 ${wishlist?.some(item => item.id === product.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
      <div className="p-3 sm:p-4 border-t-4 border-[#d4af37]/30 bg-gradient-to-b from-white to-[#fdfbf7]">
        <h3 className="text-sm font-bold text-primary group-hover:text-[#d4af37] transition-colors duration-300 truncate mb-1">{product.title}</h3>
        <span className="text-sm font-bold bg-gradient-to-r from-[#d4af37] to-[#b8941f] bg-clip-text text-transparent">
          ₹{product.final_price?.toLocaleString('en-IN')}
        </span>
      </div>
    </Link>
  );

  return (
    <section id="new" className="py-12 md:py-24 bg-gradient-to-b from-[#fdfbf7] to-[#f5f1ed] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle, #4a1a6b 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-8 md:mb-16"
        >
          <span className="text-[#d4af37] tracking-[0.3em] mb-4 block font-bold text-sm">JUST ARRIVED</span>
          <h2 className="text-4xl md:text-7xl text-primary mb-4 font-bold">
            New <span className="bg-gradient-to-r from-[#d4af37] via-[#f4d56f] to-[#d4af37] bg-clip-text text-transparent animate-gradient">Arrivals</span>
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto"></div>
        </motion.div>

        {/* Mobile: 2-column grid */}
        <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
            className="grid grid-cols-2 gap-3 md:hidden"
        >
          {newArrivals.slice(0, 6).map((product) => (
            <motion.div key={product.id} variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } } }}>
                <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Desktop: slider carousel */}
        <div className="hidden md:block px-8">
          <Slider {...settings}>
            {newArrivals.map((product) => (
              <div key={product.id} className="px-3">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>

        <div className="text-center mt-10 md:mt-16">
          <Link to="/catalog?sort=New+Arrivals" className="inline-block group relative px-10 py-4 border-2 border-[#d4af37] text-primary hover:text-[#fdfbf7] rounded-full transition-all duration-500 font-bold text-base overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]">
            <span className="relative z-10">View All Products</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#b8941f] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </Link>
        </div>
      </div>
    </section>
  );
}
