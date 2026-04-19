import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ProductImageGallery({ product }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [zoomStyle, setZoomStyle] = useState({});
    
    // Combine images and videos
    const mediaItems = [
        ...(product.images?.map(url => ({ type: 'image', url })) || []),
        ...(product.videos?.map(url => ({ type: 'video', url })) || [])
    ];
    
    const activeMedia = mediaItems[activeIndex] || mediaItems[0];

    const handleMouseMove = (e) => {
        if (activeMedia?.type !== 'image') return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomStyle({ transformOrigin: `${x}% ${y}%` });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 grid grid-cols-5 gap-2 md:gap-4">
            
            <div className="col-span-5 rounded-lg overflow-hidden aspect-square md:aspect-[3/4] max-h-[55vh] md:max-h-none relative group bg-[#fdfbf7]">
                {activeMedia?.type === 'video' ? (
                    <video 
                        src={activeMedia.url} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img 
                        onMouseMove={handleMouseMove}
                        alt={`Main view of ${product.title}`} 
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[2]" 
                        src={activeMedia?.url} 
                        style={zoomStyle}
                    />
                )}
                <div className="absolute inset-0 silk-overlay pointer-events-none"></div>
            </div>
            
            {/* Thumbnails (Up to 5 + videos) */}
            {mediaItems.map((media, idx) => (
                <div 
                    key={idx} 
                    onClick={() => setActiveIndex(idx)}
                    className={`aspect-square md:aspect-[3/4] rounded-lg overflow-hidden border transition-all cursor-pointer relative ${activeIndex === idx ? 'border-secondary opacity-100 shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-outline-variant/15 opacity-70 hover:opacity-100 hover:border-secondary/50'}`}
                >
                    {media.type === 'video' ? (
                        <>
                            <video src={media.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                            </div>
                        </>
                    ) : (
                        <img alt={`Detail ${idx + 1}`} className="w-full h-full object-cover" src={media.url} />
                    )}
                </div>
            ))}
        </motion.div>
    );
}
