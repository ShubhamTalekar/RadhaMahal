import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Hold the splash screen for 2.2 seconds before fading out
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) {
                setTimeout(onComplete, 800); // give time for fade out transition
            }
        }, 2200);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[99999] bg-[#3B1745] flex items-center justify-center pointer-events-none"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Subtle glow effect behind the logo matching the gold accent */}
                        <div className="absolute inset-0 bg-[#d4af37]/10 blur-3xl rounded-full scale-[1.5] animate-pulse"></div>
                        <img 
                            src="/logo.png" 
                            alt="Radha Mahal By Neha" 
                            className="w-48 sm:w-64 md:w-96 max-w-[80vw] h-auto object-contain relative z-10 drop-shadow-2xl rounded-2xl" 
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
