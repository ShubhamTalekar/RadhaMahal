import { useRef, useEffect, useCallback, useState } from "react";
import SliderImport from "react-slick";
const Slider = SliderImport.default || SliderImport;
import "slick-carousel/slick/slick.css";
// Removed slick-theme.css to prevent default arrow/dot overrides
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

import { NextArrow, PrevArrow } from "../SliderArrow";

export function HeroSection({ slides }) {
  const sliderRef = useRef(null);
  const videoRefs = useRef({});
  const currentIndexRef = useRef(0);
  const [isMuted, setIsMuted] = useState(true);   // starts muted (browser autoplay policy)
  const [activeIndex, setActiveIndex] = useState(0);

  /** Toggle mute on the currently active video */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const videoEl = videoRefs.current[currentIndexRef.current];
      if (videoEl) videoEl.muted = next;
      return next;
    });
  }, []);

  /** Called by react-slick before each slide change */
  const handleBeforeChange = useCallback((oldIndex, newIndex) => {
    currentIndexRef.current = newIndex;

    // Pause & reset every video so background slides don't play audio
    Object.entries(videoRefs.current).forEach(([idx, el]) => {
      if (!el) return;
      el.pause();
      if (Number(idx) !== newIndex) {
        el.currentTime = 0;
        el.muted = true; // always re-mute background videos
      }
    });
  }, []);

  /** Called by react-slick after each slide change */
  const handleAfterChange = useCallback((index) => {
    setActiveIndex(index);
    const slide = slides[index];
    const videoEl = videoRefs.current[index];

    if (slide?.videoUrl && videoEl) {
      // Inherit current mute preference for the new active video
      videoEl.muted = isMuted;
      sliderRef.current?.slickPause();
      videoEl.currentTime = 0;
      videoEl.play().catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, isMuted]);

  /** When a video finishes, advance to the next slide */
  const handleVideoEnded = useCallback(() => {
    sliderRef.current?.slickPlay();
    sliderRef.current?.slickNext();
  }, []);

  /** Autoplay the first slide's video on mount if it has one */
  useEffect(() => {
    if (!slides?.length) return;
    const firstSlide = slides[0];
    if (firstSlide?.videoUrl) {
      const videoEl = videoRefs.current[0];
      if (videoEl) {
        videoEl.muted = true; // must be muted for autoplay
        sliderRef.current?.slickPause();
        videoEl.play().catch(() => {});
      }
    }
  }, [slides]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 8000,
    fade: true,
    nextArrow: (
      <NextArrow customClass="!absolute !right-6 md:!right-12 !top-1/2 !-translate-y-1/2 !z-30" />
    ),
    prevArrow: (
      <PrevArrow customClass="!absolute !left-6 md:!left-12 !top-1/2 !-translate-y-1/2 !z-30" />
    ),
    dotsClass: "slick-dots !bottom-12",
    appendDots: (dots) => (
      <ul className="flex justify-center gap-2">
        {dots.map((dot, index) => (
          <li key={index} className={dot.props.className}>
            {dot.props.children}
          </li>
        ))}
      </ul>
    ),
    customPaging: () => (
      <button className="w-3 h-3 rounded-full bg-[#fdfbf7] opacity-50 hover:opacity-100 transition-opacity duration-300" />
    ),
    beforeChange: handleBeforeChange,
    afterChange: handleAfterChange,
  };

  if (!slides || slides.length === 0) return null;

  const activeSlideHasVideo = slides[activeIndex]?.videoUrl;

  return (
    <section id="home" className="relative">
      <Slider ref={sliderRef} {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className="relative">
            <div className="relative h-[100svh] md:h-[85vh]">
              {slide.videoUrl ? (
                <video
                  ref={(el) => { videoRefs.current[index] = el; }}
                  src={slide.videoUrl}
                  muted
                  playsInline
                  preload="metadata"
                  poster={slide.image}
                  onEnded={handleVideoEnded}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <img
                  src={slide.image}
                  alt={slide.headline || slide.altText}
                  className="w-full h-full object-cover object-center"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent" />

              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-8 md:px-16 lg:px-24">
                  <div className="max-w-3xl">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="w-16 h-[2px] bg-gradient-to-r from-transparent to-secondary"></div>
                      <span className="text-secondary tracking-[0.3em] text-sm font-semibold">
                        {slide.tag || "EXCLUSIVE COLLECTION"}
                      </span>
                    </div>
                    <motion.h2
                      key={`h-${slide.id}`}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-[#fdfbf7] mb-4 md:mb-6 leading-[1.1] font-bold drop-shadow-2xl whitespace-pre-line"
                    >
                      <span className="inline-block bg-gradient-to-r from-secondary via-[#f4d56f] to-secondary bg-clip-text text-transparent animate-gradient drop-shadow-[0_2px_20px_rgba(212,175,55,0.8)]">
                        {slide.headline}
                      </span>
                    </motion.h2>
                    <motion.p
                      key={`p-${slide.id}`}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                      className="text-base sm:text-lg md:text-xl text-white/95 mb-8 md:mb-10 drop-shadow-lg font-light leading-relaxed"
                    >
                      {slide.subtitle}
                    </motion.p>
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                      {slide.id && (
                        <Link
                          to={`/product/${slide.id}`}
                          className="group relative px-8 py-3 md:px-12 md:py-4 bg-gradient-to-r from-secondary via-[#f4d56f] to-secondary bg-[length:200%_100%] hover:bg-right text-primary rounded-full transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:shadow-[0_0_40px_rgba(212,175,55,0.9)] transform hover:scale-105 font-bold text-[15px] overflow-hidden text-center"
                        >
                          <span className="relative z-10">Shop Now</span>
                          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </Link>
                      )}
                      <Link
                        to="/catalog"
                        className="px-8 py-3 md:px-12 md:py-4 border-[1.5px] border-secondary text-[#fdfbf7] bg-primary/30 backdrop-blur-sm hover:bg-secondary hover:text-primary rounded-full transition-all duration-500 font-bold text-[15px] hover:-translate-y-1 shadow-lg text-center"
                      >
                        Explore Collection
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Mute / Unmute button — only shown when the active slide has a video */}
      <AnimatePresence>
        {activeSlideHasVideo && (
          <motion.button
            key="mute-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            className="absolute bottom-24 right-6 md:right-12 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-all duration-300 shadow-lg group"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
              {isMuted ? "volume_off" : "volume_up"}
            </span>
            <span className="text-xs font-semibold tracking-widest uppercase text-white/90">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}