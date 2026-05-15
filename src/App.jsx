import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './Layout';
import Home from './pages/Home';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import ShoppingBag from './pages/ShoppingBag';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import OurStory from './pages/OurStory';
import SizeGuide from './pages/SizeGuide';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import VideoConsultation from './pages/VideoConsultation';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import AuthGuard from './components/AuthGuard';
import SplashScreen from './pages/SplashScreen';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import { ErrorBoundary } from './components/ErrorBoundary';
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
          <Route path="product/:id" element={<ErrorBoundary><ProductDetail /></ErrorBoundary>} />
          <Route path="bag" element={<AuthGuard><ShoppingBag /></AuthGuard>} />
          <Route path="checkout" element={<AuthGuard><ErrorBoundary><Checkout /></ErrorBoundary></AuthGuard>} />
          <Route path="wishlist" element={<AuthGuard><Wishlist /></AuthGuard>} />
          <Route path="profile" element={<AuthGuard><Profile /></AuthGuard>} />
          <Route path="our-story" element={<OurStory />} />
          <Route path="size-guide" element={<SizeGuide />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="video-consultation" element={<VideoConsultation />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AppProvider>
  );
}

export default App;
