import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProducts } from '../shopifyClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [bag, setBag] = useState(() => JSON.parse(localStorage.getItem('bag')) || []);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('wishlist')) || []);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);

  useEffect(() => {
    let mounted = true;
    getProducts().then(products => {
      if (mounted && products?.length) {
        const uniqueCats = [...new Set(products.map(p => p.category))];
        setCategories(uniqueCats.filter(Boolean).sort());

        const baseColors = ['red', 'gold', 'blue', 'pastel', 'maroon', 'pink', 'black', 'green', 'yellow', 'wine', 'purple', 'orange', 'navy', 'cream', 'silver', 'floral', 'white', 'grey', 'gray', 'brown', 'peach', 'teal', 'magenta', 'cyan', 'olive', 'coral'];
        const uniqueOccasions = [...new Set(products.flatMap(p => p.occasion || []))];
        const validOccasions = uniqueOccasions.filter(tag => {
            const lower = tag.toLowerCase();
            if (baseColors.some(color => lower.includes(color))) return false;
            if (lower === 'carousel' || lower === 'hero') return false; 
            if (lower.includes('silk') || lower.includes('saree') || lower.includes('zari')) return false;
            return true;
        }).sort();
        setOccasions(validOccasions);
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => { 
    localStorage.setItem('bag', JSON.stringify(bag));
    if (!user?.email) return;

    const timer = setTimeout(() => {
      const BASE = import.meta.env.VITE_API_BASE_URL;
      fetch(`${BASE}/api/bag/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, bag })
      }).catch(err => console.error('Bag sync unavailable', err));
    }, 2000);

    return () => clearTimeout(timer);
  }, [bag, user]);

  useEffect(() => { 
    localStorage.setItem('wishlist', JSON.stringify(wishlist)); 
    if (!user?.email) return;

    const timer = setTimeout(() => {
      const BASE = import.meta.env.VITE_API_BASE_URL;
      fetch(`${BASE}/api/wishlist/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, wishlist })
      }).catch(err => console.error("Backend sync unavailable", err));
    }, 2000);

    return () => clearTimeout(timer);
  }, [wishlist, user]);

  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`radha_mahal_profile_${user.email}`, JSON.stringify(user));
    }
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  return (
    <AppContext.Provider value={{ bag, setBag, wishlist, setWishlist, user, setUser, categories, occasions }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
