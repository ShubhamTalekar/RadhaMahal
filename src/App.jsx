import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './Layout';
import Home from './Home';
import ProductCatalog from './ProductCatalog';
import ProductDetail from './ProductDetail';
import ShoppingBag from './ShoppingBag';
import Checkout from './Checkout';
import Wishlist from './Wishlist';
import Profile from './Profile';
import OurStory from './OurStory';
import SizeGuide from './SizeGuide';
import Contact from './Contact';
import Login from './Login';
import Register from './Register';
import VideoConsultation from './VideoConsultation';
import FAQ from './FAQ';
import Terms from './Terms';
import Privacy from './Privacy';
import AuthGuard from './components/AuthGuard';
import SplashScreen from './SplashScreen';
import './index.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AppProvider>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
          <Route path="catalog" element={<ProductCatalog />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="bag" element={<AuthGuard><ShoppingBag /></AuthGuard>} />
          <Route path="checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
          <Route path="wishlist" element={<AuthGuard><Wishlist /></AuthGuard>} />
          <Route path="profile" element={<Profile />} />
          <Route path="our-story" element={<OurStory />} />
          <Route path="size-guide" element={<SizeGuide />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="video-consultation" element={<VideoConsultation />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AppProvider>
  );
}

export default App;
