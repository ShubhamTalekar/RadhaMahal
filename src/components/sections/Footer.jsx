import { Link } from "react-router-dom";
import { Mail, Phone, Heart } from "lucide-react";
import { CONTACT_EMAIL } from "../../constants";

const Facebook = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const Instagram = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const YouTube = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
);

export function Footer() {
  return (
    <footer id="contact" className="bg-primary text-[#fdfbf7]">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h2 
              className="text-3xl mb-4"
             
            >
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f4d56f] bg-clip-text text-transparent">
                Radha Mahal
              </span>
            </h2>
            <p className="text-[#fdfbf7]/80 mb-6">
              Weaving dreams into reality with exquisite ethnic wear that celebrates India's rich heritage.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/radhamahalbyneha/" target="_blank" rel="noopener noreferrer" className="bg-[#d4af37] hover:bg-[#b8941f] text-primary p-2 rounded-full transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@nehamakwana1885/shorts" target="_blank" rel="noopener noreferrer" className="bg-[#d4af37] hover:bg-[#b8941f] text-primary p-2 rounded-full transition-all duration-300">
                <YouTube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 
              className="text-xl mb-6 text-[#d4af37]"
             
            >
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-[#fdfbf7]/80 hover:text-[#d4af37] transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-[#fdfbf7]/80 hover:text-[#d4af37] transition-colors duration-300">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/catalog?sort=New+Arrivals" className="text-[#fdfbf7]/80 hover:text-[#d4af37] transition-colors duration-300">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/our-story" className="text-[#fdfbf7]/80 hover:text-[#d4af37] transition-colors duration-300">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-[#fdfbf7]/80 hover:text-[#d4af37] transition-colors duration-300">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 
              className="text-xl mb-6 text-[#d4af37]"
             
            >
              Customer Care
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-[#fdfbf7]/80 hover:text-[#d4af37] transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-[#fdfbf7]/80 hover:text-[#d4af37] transition-colors duration-300">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-[#fdfbf7]/80 hover:text-[#d4af37] transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#fdfbf7]/80 hover:text-[#d4af37] transition-colors duration-300">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 
              className="text-xl mb-6 text-[#d4af37]"
             
            >
              Get In Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <span className="text-[#fdfbf7]/80">+91 96190 95314</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <span className="text-[#fdfbf7]/80">{CONTACT_EMAIL}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#d4af37]/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#fdfbf7]/80 text-sm">
              © {new Date().getFullYear()} Radha Mahal by Neha. All rights reserved.
            </p>
            <p className="text-[#fdfbf7]/80 text-sm flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
