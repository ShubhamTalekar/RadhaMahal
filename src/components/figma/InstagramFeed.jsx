import { useEffect } from "react";
import { motion } from "framer-motion";

const Instagram = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

export function InstagramFeed() {
  useEffect(() => {
    // Dynamically inject the Elfsight script so that React reliably mounts it without DOM conflicts
    if (!document.querySelector('script[src="https://elfsightcdn.com/platform.js"]')) {
      const script = document.createElement("script");
      script.src = "https://elfsightcdn.com/platform.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Shadow DOM Piercing to force-hide Elfsight Branding & Titles
    const hideWatermark = () => {
        const widgetContainer = document.querySelector('.elfsight-app-e80e1416-2714-4e99-87c7-2148e75693bb');
        if (!widgetContainer) return;

        // Target the Shadow Root where Elfsight locks its CSS
        const root = widgetContainer.shadowRoot || widgetContainer;
        
        if (root && !root.querySelector('#radha-elfsight-override')) {
            const style = document.createElement('style');
            style.id = 'radha-elfsight-override';
            style.innerHTML = `
                /* Nuke #yummy title */
                .eapps-instagram-feed-title,
                .eapps-widget-title,
                [class*="eapps-instagram-feed-header"] { display: none !important; }
                
                /* Nuke free widget watermark */
                .eapps-link,
                [class*="elfsight-app-branding"],
                a[href*="elfsight.com"] { display: none !important; }
            `;
            root.appendChild(style);
        }
    };

    // Run interval to ensure we catch the widget after it dynamically renders its shadow DOM tree
    const interval = setInterval(hideWatermark, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-[#f5f1ed]">
      <div className="container mx-auto px-4 max-w-screen-xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Instagram className="w-6 h-6 text-[#d4af37]" />
            <span className="text-[#d4af37] tracking-widest">
              @RADHAMAHALBYNEHA
            </span>
          </div>
          <h2 
            className="text-4xl md:text-5xl text-primary mb-4"
           
          >
            Follow Our Journey
          </h2>
          <p className="text-[#6d5c7d]">
            Experience our timeless creations live on our feed.
          </p>
        </motion.div>

        {/* The Live Video Widget Container */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true, margin: "-50px" }}
          className="w-full relative z-10 min-h-[400px]"
        >
          {/* Official Elfsight Instagram App Integration */}
          <div className="elfsight-app-e80e1416-2714-4e99-87c7-2148e75693bb" data-elfsight-app-lazy></div>
        </motion.div>

        <div className="text-center mt-12">
          <a href="https://instagram.com/radhamahalbyneha" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-primary hover:shadow-xl rounded-full transition-all duration-300 transform hover:scale-105 font-bold">
            <Instagram className="w-5 h-5" />
            Connect on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
