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

    // Aggressive DOM Removal to bypass CSS obfuscation
    const removeWatermarkDOM = () => {
        const widgetContainer = document.querySelector('.elfsight-app-e80e1416-2714-4e99-87c7-2148e75693bb');
        if (!widgetContainer) return;

        const root = widgetContainer.shadowRoot || widgetContainer;
        
        // Find and destroy the anchor tag containing the text or link
        const links = root.querySelectorAll('a');
        links.forEach(link => {
            const text = (link.textContent || "").toLowerCase();
            if (text.includes('free') || text.includes('widget') || link.href.includes('elfsight.com') || link.href.includes('apps.elfsight')) {
                link.style.display = 'none';
                link.style.opacity = '0';
                if (link.parentNode) link.parentNode.removeChild(link);
            }
        });

        // Suppress any generic widget titles
        const titles = root.querySelectorAll('[class*="title"], .eapps-widget-title, .eapps-instagram-feed-title');
        titles.forEach(t => { 
            t.style.display = 'none'; 
            if (t.parentNode && t.textContent.toLowerCase().includes('yummy')) t.parentNode.removeChild(t);
        });
    };

    // Run interval to ensure we catch the widget after it dynamically renders its shadow DOM tree
    const interval = setInterval(removeWatermarkDOM, 500);
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
