import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Mobile Lightbox Modal ───────────────────────────────────────────────────
function ImageModal({ mediaItems, startIndex, onClose }) {
    const [current, setCurrent] = useState(startIndex);
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);

    const touchStartRef = useRef(null);
    const lastTapRef = useRef(0);
    const pinchStartDistRef = useRef(null);
    const pinchStartScaleRef = useRef(1);
    const dragStartRef = useRef(null);
    const imgRef = useRef(null);

    const activeMedia = mediaItems[current];
    const canPrev = current > 0;
    const canNext = current < mediaItems.length - 1;

    // Lock body scroll while modal open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Reset zoom when image changes
    useEffect(() => {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
        setIsZoomed(false);
    }, [current]);

    const resetZoom = useCallback(() => {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
        setIsZoomed(false);
    }, []);

    const handleDoubleTap = useCallback((e) => {
        const now = Date.now();
        if (now - lastTapRef.current < 300) {
            // Double tap
            if (isZoomed) {
                resetZoom();
            } else {
                const rect = imgRef.current?.getBoundingClientRect();
                if (rect) {
                    const touch = e.touches?.[0] || e;
                    const relX = ((touch.clientX - rect.left) / rect.width - 0.5) * rect.width;
                    const relY = ((touch.clientY - rect.top) / rect.height - 0.5) * rect.height;
                    setScale(2.5);
                    setTranslate({ x: -relX, y: -relY });
                    setIsZoomed(true);
                }
            }
        }
        lastTapRef.current = now;
    }, [isZoomed, resetZoom]);

    const getDistance = (t1, t2) => {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            dragStartRef.current = { ...translate };
            handleDoubleTap(e);
        } else if (e.touches.length === 2) {
            pinchStartDistRef.current = getDistance(e.touches[0], e.touches[1]);
            pinchStartScaleRef.current = scale;
        }
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        if (e.touches.length === 2 && pinchStartDistRef.current) {
            // Pinch zoom
            const dist = getDistance(e.touches[0], e.touches[1]);
            const ratio = dist / pinchStartDistRef.current;
            const newScale = Math.max(1, Math.min(4, pinchStartScaleRef.current * ratio));
            setScale(newScale);
            if (newScale > 1) setIsZoomed(true);
        } else if (e.touches.length === 1 && isZoomed && dragStartRef.current) {
            // Pan when zoomed
            const dx = e.touches[0].clientX - touchStartRef.current.x;
            const dy = e.touches[0].clientY - touchStartRef.current.y;
            setTranslate({ x: dragStartRef.current.x + dx, y: dragStartRef.current.y + dy });
        }
    };

    const handleTouchEnd = (e) => {
        if (!isZoomed && touchStartRef.current && e.changedTouches.length === 1) {
            const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
            // Swipe threshold: horizontal > 50px and more horizontal than vertical
            if (absDx > 50 && absDx > absDy) {
                if (dx < 0 && canNext) setCurrent(c => c + 1);
                if (dx > 0 && canPrev) setCurrent(c => c - 1);
            }
        }
        pinchStartDistRef.current = null;
        if (scale < 1.05) resetZoom();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex flex-col bg-black"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-3 z-10 bg-black/60 backdrop-blur-sm shrink-0">
                    <span className="text-white/60 text-xs font-body tracking-widest">
                        {current + 1} / {mediaItems.length}
                    </span>
                    {isZoomed && (
                        <button
                            onClick={resetZoom}
                            className="flex items-center gap-1 text-secondary text-xs font-body tracking-wide border border-secondary/40 rounded-full px-3 py-1"
                        >
                            <span className="material-symbols-outlined text-sm">zoom_out</span>
                            Reset
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Image area */}
                <div
                    className="flex-1 flex items-center justify-center overflow-hidden relative"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ touchAction: 'none' }}
                >
                    {activeMedia?.type === 'video' ? (
                        <video
                            src={activeMedia.url}
                            autoPlay loop muted playsInline
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : (
                        <img
                            ref={imgRef}
                            src={activeMedia?.url}
                            alt="Product zoom view"
                            draggable={false}
                            className="max-w-full max-h-full object-contain select-none"
                            style={{
                                transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                                transition: pinchStartDistRef.current ? 'none' : 'transform 0.2s ease',
                                willChange: 'transform',
                            }}
                        />
                    )}

                    {/* Swipe arrows */}
                    {canPrev && !isZoomed && (
                        <button
                            onClick={() => setCurrent(c => c - 1)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                            aria-label="Previous image"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                    )}
                    {canNext && !isZoomed && (
                        <button
                            onClick={() => setCurrent(c => c + 1)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                            aria-label="Next image"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    )}

                    {/* Hint - only show once until user zooms */}
                    {!isZoomed && activeMedia?.type === 'image' && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-white/70 text-[11px] font-body tracking-wide pointer-events-none">
                            <span className="material-symbols-outlined text-sm">pinch</span>
                            Pinch or double-tap to zoom
                        </div>
                    )}
                </div>

                {/* Thumbnail strip */}
                {mediaItems.length > 1 && (
                    <div className="shrink-0 px-4 pb-4 pt-2 bg-black/60 backdrop-blur-sm">
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar justify-center">
                            {mediaItems.map((media, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                        idx === current ? 'border-secondary opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                                    }`}
                                >
                                    {media.type === 'video'
                                        ? <div className="w-full h-full bg-white/10 flex items-center justify-center"><span className="material-symbols-outlined text-white text-sm">play_circle</span></div>
                                        : <img src={media.url} alt="" className="w-full h-full object-cover" />
                                    }
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main Gallery ────────────────────────────────────────────────────────────
export default function ProductImageGallery({ product }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [zoomStyle, setZoomStyle] = useState({});
    const [modalOpen, setModalOpen] = useState(false);

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
        <>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="lg:col-span-7 grid grid-cols-5 gap-2 md:gap-4"
            >
                {/* Main image */}
                <div
                    className="col-span-5 rounded-lg overflow-hidden aspect-square md:aspect-[3/4] max-h-[55vh] md:max-h-none relative group bg-[#fdfbf7] cursor-zoom-in"
                    onClick={() => setModalOpen(true)}
                >
                    {activeMedia?.type === 'video' ? (
                        <video
                            src={activeMedia.url}
                            autoPlay loop muted playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            onMouseMove={handleMouseMove}
                            alt={`Main view of ${product.title}`}
                            className="w-full h-full object-cover transition-transform duration-200 md:group-hover:scale-[2]"
                            src={activeMedia?.url}
                            style={zoomStyle}
                        />
                    )}
                    <div className="absolute inset-0 silk-overlay pointer-events-none" />

                    {/* Mobile tap-to-zoom badge */}
                    <div className="md:hidden absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 text-white text-[10px] font-body tracking-wide pointer-events-none">
                        <span className="material-symbols-outlined text-sm">zoom_in</span>
                        Tap to zoom
                    </div>
                </div>

                {/* Thumbnails */}
                {mediaItems.map((media, idx) => (
                    <div
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`aspect-square md:aspect-[3/4] rounded-lg overflow-hidden border transition-all cursor-pointer relative ${
                            activeIndex === idx
                                ? 'border-secondary opacity-100 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                                : 'border-outline-variant/15 opacity-70 hover:opacity-100 hover:border-secondary/50'
                        }`}
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

            {/* Lightbox modal */}
            {modalOpen && (
                <ImageModal
                    mediaItems={mediaItems}
                    startIndex={activeIndex}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </>
    );
}
