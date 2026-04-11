import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const sizeMap = {
    4: 'w-4 h-4',
    5: 'w-5 h-5',
    6: 'w-6 h-6',
    7: 'w-7 h-7',
    8: 'w-8 h-8'
};

export function NextArrow({ onClick, customClass, iconSize = 6 }) {
    return (
        <button 
            type="button"
            onClick={onClick} 
            className={`${customClass} flex items-center justify-center w-12 h-12 md:w-16 md:h-16 !bg-[#d4af37] rounded-full text-[#4b284d] transition-all duration-300 hover:scale-105 hover:brightness-105 active:scale-95 group z-30`}
            aria-label="Next slide"
        >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" strokeWidth={4} />
        </button>
    );
}

export function PrevArrow({ onClick, customClass, iconSize = 6 }) {
    return (
        <button 
            type="button"
            onClick={onClick} 
            className={`${customClass} flex items-center justify-center w-12 h-12 md:w-16 md:h-16 !bg-[#d4af37] rounded-full text-[#4b284d] transition-all duration-300 hover:scale-105 hover:brightness-105 active:scale-95 group z-30`}
            aria-label="Previous slide"
        >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" strokeWidth={4} />
        </button>
    );
}
