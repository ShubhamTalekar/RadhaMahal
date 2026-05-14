import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const DEFAULTS = {
  titlePrefix: "Wedding &",
  titleHighlight: `Festive Collection ${new Date().getFullYear()}`,
  description:
    "Make every celebration unforgettable with our exclusive festive collection. Curated designs perfect for weddings, Diwali, and special occasions.",
  buttonText: "Shop Festive Collection",
  discountNum: "Up to 30%",
  discountLabel: "Festive Discount",
  designsNum: "100+",
  designsLabel: "Approx. New Designs",
  badgeTitle: "SALE",
  badgeLabel: "Limited Time",
  imageUrl:
    "https://images.unsplash.com/photo-1756483510767-35245638c057?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0cmFkaXRpb25hbCUyMGRyZXNzJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzM5MDgwNDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
};

export function FestiveBanner() {
  const [cfg, setCfg] = useState(DEFAULTS);

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
    fetch(`${BASE}/api/v1/public/banner`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setCfg((prev) => ({ ...prev, ...data.data }));
        }
      })
      .catch(() => {});
  }, []);

  // Resolve image URL (local uploads have a leading slash)
  const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  const imageSrc =
    cfg.imageUrl && cfg.imageUrl.startsWith("/")
      ? `${BASE}${cfg.imageUrl}`
      : cfg.imageUrl || DEFAULTS.imageUrl;

  return (
    <section className="py-24 bg-gradient-to-br from-[#3d1259] via-primary to-[#5d2380] relative overflow-hidden">
      {/* Animated decorative background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            backgroundImage: `radial-gradient(circle, #d4af37 2px, transparent 2px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#d4af37]/20 rounded-full blur-3xl animate-float"></div>
      <div
        className="absolute bottom-20 right-20 w-80 h-80 bg-[#f4d56f]/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-[#d4af37] animate-pulse" />
              <span className="text-[#d4af37] tracking-[0.3em] font-bold">
                FESTIVE SPECIAL
              </span>
              <Sparkles className="w-8 h-8 text-[#d4af37] animate-pulse" />
            </div>

            <h2 className="text-5xl md:text-7xl text-[#fdfbf7] mb-6 leading-tight font-bold">
              {cfg.titlePrefix}{" "}
              <span className="block bg-gradient-to-r from-[#d4af37] via-[#f4d56f] to-[#d4af37] bg-clip-text text-transparent animate-gradient drop-shadow-[0_0_30px_rgba(212,175,55,0.6)]">
                {cfg.titleHighlight}
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-[#fdfbf7]/95 mb-10 max-w-xl leading-relaxed">
              {cfg.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start mb-12">
              <Link
                to="/catalog?occasion=Festive"
                className="group relative px-10 py-5 bg-gradient-to-r from-[#d4af37] via-[#f4d56f] to-[#d4af37] bg-[length:200%_100%] text-primary rounded-full transition-all duration-500 shadow-[0_0_40px_rgba(212,175,55,0.8)] hover:shadow-[0_0_60px_rgba(212,175,55,1)] transform hover:scale-110 font-bold text-lg overflow-hidden text-center"
              >
                <span className="relative z-10">{cfg.buttonText}</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-12">
              <div className="text-center">
                <p className="text-5xl bg-gradient-to-r from-[#d4af37] to-[#f4d56f] bg-clip-text text-transparent font-bold mb-2">
                  {cfg.discountNum}
                </p>
                <p className="text-sm text-[#fdfbf7]/90 font-semibold tracking-wide">
                  {cfg.discountLabel}
                </p>
              </div>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent"></div>
              <div className="text-center">
                <p className="text-5xl bg-gradient-to-r from-[#d4af37] to-[#f4d56f] bg-clip-text text-transparent font-bold mb-2">
                  {cfg.designsNum}
                </p>
                <p className="text-sm text-[#fdfbf7]/90 font-semibold tracking-wide">
                  {cfg.designsLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative group">
            <div className="relative rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.4)] border-4 border-[#d4af37] group-hover:shadow-[0_0_80px_rgba(212,175,55,0.6)] transition-all duration-700">
              <img
                src={imageSrc}
                alt="Festive Collection"
                className="w-full h-[550px] object-cover transform group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent"></div>

              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-8 -right-8 bg-gradient-to-br from-[#d4af37] to-[#f4d56f] text-primary rounded-full w-40 h-40 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.8)] animate-float">
              <p className="text-3xl mb-1 font-bold">{cfg.badgeTitle}</p>
              <p className="text-xs font-semibold tracking-wide">{cfg.badgeLabel}</p>
              <div className="absolute inset-0 rounded-full border-4 border-[#d4af37] animate-ping opacity-20"></div>
            </div>

            {/* Corner decorations */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-l-4 border-b-4 border-[#d4af37] opacity-50"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 border-r-4 border-t-4 border-[#d4af37] opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
