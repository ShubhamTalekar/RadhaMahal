import { Link } from "react-router-dom";
import { Heart, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function OurStory() {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-[#f5f1ed] to-[#fdfbf7]">
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
                src="https://images.unsplash.com/photo-1773739967506-b6bda37a6fc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZXh0aWxlJTIwc2lsayUyMGZhYnJpY3xlbnwxfHx8fDE3NzM5MDgwNDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Our Atelier"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
            </div>
            
            <div className="absolute -bottom-8 -right-8 bg-[#d4af37] text-primary p-8 rounded-2xl shadow-xl max-w-xs">
              <p className="text-4xl mb-2">
                15+
              </p>
              <p className="text-sm">
                Years of Excellence in Ethnic Fashion
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
                    Award-Winning Designs
                  </h3>
                  <p className="text-[#6d5c7d]">
                    Recognized for excellence in ethnic fashion and design innovation
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
