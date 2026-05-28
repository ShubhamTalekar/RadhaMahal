import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getProducts } from '../shopifyClient';
import { supabase } from '../supabaseClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);

  const [bag, setBag] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [categories, setCategories] = useState([]);
  const [occasions,  setOccasions]  = useState([]);

  // Track the previous user email so we can detect account switches
  const prevEmailRef = useRef(user?.email || null);
  
  // Prevent infinite save loops by only uploading to Supabase if local state changes
  const [isBagLoaded, setIsBagLoaded] = useState(false);
  const [isWishlistLoaded, setIsWishlistLoaded] = useState(false);

  /* ── When the logged-in user changes ─────────────────────────────── */
  useEffect(() => {
    const currEmail = user?.email || null;

    if (currEmail !== prevEmailRef.current) {
      prevEmailRef.current = currEmail;

      if (!currEmail) {
        setBag([]);
        setWishlist([]);
        setIsBagLoaded(false);
        setIsWishlistLoaded(false);
      }
    }

    if (currEmail) {
      // Async fetch bag and wishlist from Supabase
      const fetchData = async () => {
        const { data: bagData } = await supabase.from('shopping_bags').select('items').eq('email', currEmail).single();
        if (bagData?.items) {
           setBag(bagData.items);
        } else {
           setBag([]);
        }
        setIsBagLoaded(true);

        const { data: wlData } = await supabase.from('wishlists').select('items').eq('email', currEmail).single();
        if (wlData?.items) {
           setWishlist(wlData.items);
        } else {
           setWishlist([]);
        }
        setIsWishlistLoaded(true);
      };
      
      fetchData();
    } else {
      setIsBagLoaded(true);
      setIsWishlistLoaded(true);
    }

    // Persist user record
    if (user) {
      // Only persist core auth info
      const minimalUser = {
        name: user.name,
        email: user.email,
        token: user.token,
        shopifyToken: user.shopifyToken,
        photoUrl: user.photoUrl
      };
      localStorage.setItem('user', JSON.stringify(minimalUser));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Hydrate full customer data from Shopify on load if token exists
  useEffect(() => {
    const hydrateCustomer = async () => {
      const minimalUser = JSON.parse(localStorage.getItem('user'));
      if (minimalUser?.shopifyToken) {
        import('../shopifyClient').then(async ({ getCustomer }) => {
          const fullCustomer = await getCustomer(minimalUser.shopifyToken);
          if (fullCustomer) {
            setUser(prev => ({ ...prev, ...fullCustomer }));
          }
        });
      }
    };
    hydrateCustomer();
  }, []);

  /* ── Persist bag changes to Supabase ──────────────────────── */
  useEffect(() => {
    if (!user?.email || !isBagLoaded) return;
    
    const timer = setTimeout(async () => {
      await supabase.from('shopping_bags').upsert({ email: user.email, items: bag }, { onConflict: 'email' });
    }, 1500);

    return () => clearTimeout(timer);
  }, [bag, user, isBagLoaded]);

  /* ── Persist wishlist changes to Supabase ─────────────────── */
  useEffect(() => {
    if (!user?.email || !isWishlistLoaded) return;

    const timer = setTimeout(async () => {
      await supabase.from('wishlists').upsert({ email: user.email, items: wishlist }, { onConflict: 'email' });
    }, 1500);

    return () => clearTimeout(timer);
  }, [wishlist, user, isWishlistLoaded]);

  /* ── Load Shopify categories & occasions ─────────────────────────── */
  useEffect(() => {
    let mounted = true;
    getProducts().then(products => {
      if (mounted && products?.length) {
        const uniqueCats = [...new Set(products.map(p => p.category))];
        setCategories(uniqueCats.filter(Boolean).sort());

        const baseColors = ['red','gold','blue','pastel','maroon','pink','black','green','yellow','wine','purple','orange','navy','cream','silver','floral','white','grey','gray','brown','peach','teal','magenta','cyan','olive','coral'];
        const uniqueOccasions = [...new Set(products.flatMap(p => p.occasion || []))];
        const validOccasions = uniqueOccasions.filter(tag => {
          const lower = tag.toLowerCase();
          if (baseColors.some(c => lower.includes(c))) return false;
          if (lower === 'carousel' || lower === 'hero') return false;
          if (lower.includes('silk') || lower.includes('saree') || lower.includes('zari')) return false;
          if (lower.includes('home page') || lower.includes('automated') || lower.includes('frontpage')) return false;
          return true;
        }).sort();
        setOccasions(validOccasions);
      }
    });
    return () => { mounted = false; };
  }, []);

  return (
    <AppContext.Provider value={{ bag, setBag, wishlist, setWishlist, user, setUser, categories, occasions }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
