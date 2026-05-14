import { Link } from "react-router-dom";
import { Heart, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function OurStory() {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-[#f5f1ed] to-[#fdfbf7] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/homepage-story.jpg"
                alt="Our Atelier"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
            </div>
            
            <div className="absolute -bottom-8 lg:-bottom-12 -right-4 lg:-right-8 bg-secondary p-6 lg:p-8 rounded-2xl shadow-2xl max-w-[200px] animate-float z-20">
              <p className="text-3xl lg:text-4xl font-headline text-on-secondary mb-2">
                100%
              </p>
              <p className="text-xs lg:text-sm text-on-secondary/90 font-medium">
                Handcrafted with Love &amp; Precision
              </p>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <span className="text-[#d4af37] tracking-widest mb-4 block">
              OUR STORY
            </span>
            <h2 
              className="text-4xl md:text-5xl text-primary mb-6"
             
            >
              Where Heritage Meets Modern Elegance
            </h2>
            
            <p className="text-[#6d5c7d] mb-6 leading-relaxed">
              Radha Mahal was born from a passion for preserving the rich tapestry of Indian craftsmanship 
              while embracing contemporary aesthetics. Founded by Neha, our brand is a celebration of the 
              timeless beauty that defines Indian ethnic wear.
            </p>
            
            <p className="text-[#6d5c7d] mb-8 leading-relaxed">
              Each creation at Radha Mahal tells a story — of skilled artisans, exquisite fabrics, and 
              intricate detailing that have been passed down through generations. We believe that every 
              woman deserves to feel regal, confident, and connected to her roots.
            </p>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="flex gap-4 items-start">
                <div className="bg-[#d4af37] text-primary p-3 rounded-lg">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl text-primary mb-2">
                    Crafted with Love
                  </h3>
                  <p className="text-[#6d5c7d]">
                    Every piece is handpicked and crafted with meticulous attention to detail
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-[#d4af37] text-primary p-3 rounded-lg">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl text-primary mb-2">
                    Exclusive Collections
                  </h3>
                  <p className="text-[#6d5c7d]">
                    Limited-edition pieces blending Indian heritage with flawless modern execution
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-[#d4af37] text-primary p-3 rounded-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl text-primary mb-2">
                    Timeless Elegance
                  </h3>
                  <p className="text-[#6d5c7d]">
                    Collections that transcend trends and celebrate traditional beauty
                  </p>
                </div>
              </div>
            </div>

            <Link to="/our-story" className="inline-block px-8 py-4 bg-primary text-[#fdfbf7] hover:bg-[#3d1259] rounded-full transition-all duration-300 shadow-lg text-center">
              Discover Our Journey
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
