import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Features from './components/Features';
import Products from './components/Products';
import CustomNeonPrinting from './components/CustomNeonPrinting';
import About from './components/About';
import Contact from './components/Contact';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import NeonTextBuilder from './pages/NeonTextBuilder';
import CustomNeonBuilder from './pages/CustomNeonBuilder';
import ProductDesigner from './pages/ProductDesigner';
import ProductDetail from './pages/ProductDetail';
import GetQuote from './pages/GetQuote';
import AboutUs from './pages/AboutUs';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [sectionParams, setSectionParams] = useState({});

  const handleNavigate = (section, params = {}) => {
    setCurrentSection(section);
    setSectionParams(params);
    
    // Update URL for admin routes
    if (section === 'admin-login') {
      window.history.pushState({}, '', '/admin/login');
    } else if (section === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (section === 'home' && (window.location.pathname === '/admin' || window.location.pathname === '/admin/login')) {
      window.history.pushState({}, '', '/');
    }
    
    // Scroll to top for full-page sections
    const fullPageSections = ['neon-builder', 'custom-neon-builder', 'product-designer', 'quote', 'about-us', 'admin', 'admin-login', 'login', 'register', 'product-detail'];
    const productDetailSections = ['shop-mug', 'shop-pen', 'shop-shirt', 'shop-flyer', 'shop-banner', 'shop-sticker', 'shop-business-card', 'shop-brochure'];
    
    if (fullPageSections.includes(section) || section === 'home') {
      // Scroll to top immediately for full-page sections
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (!productDetailSections.includes(section)) {
      // Smooth scroll to section if it exists on the page
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // For product detail pages, scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Handle URL routes for admin
  useEffect(() => {
    const path = window.location.pathname;
    
    if (path === '/admin/login' || path === '/admin/login/') {
      setCurrentSection('admin-login');
    } else if (path === '/admin' || path === '/admin/') {
      setCurrentSection('admin');
    }
  }, []);

  // Handle URL routes for admin
  useEffect(() => {
    const path = window.location.pathname;
    
    if (path === '/admin/login' || path === '/admin/login/') {
      setCurrentSection('admin-login');
    } else if (path === '/admin' || path === '/admin/') {
      setCurrentSection('admin');
    }
  }, []);

  // Handle scroll to show current section
  useEffect(() => {
    const handleScroll = () => {
      if (currentSection === 'neon-builder' || currentSection === 'custom-neon-builder' || currentSection === 'product-designer') return;
      
      const sections = ['home', 'services', 'how-it-works', 'about', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            // Update active section if needed
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSection]);

  // Hide header on admin pages
  const hideHeader = currentSection === 'admin' || currentSection === 'admin-login';

  return (
    <AuthProvider>
      <div className="min-h-screen bg-blue-50">
        {!hideHeader && <Header onNavigate={handleNavigate} />}

      {/* Flicker Animation CSS */}
      <style>{`
        @keyframes flicker {
          0%, 100% {
            opacity: 1;
          }
          2% {
            opacity: 0.98;
          }
          4% {
            opacity: 1;
          }
          8% {
            opacity: 0.99;
          }
          70% {
            opacity: 1;
          }
          72% {
            opacity: 0.97;
          }
          74% {
            opacity: 0.99;
          }
          76% {
            opacity: 1;
          }
          78% {
            opacity: 0.96;
          }
          80% {
            opacity: 1;
          }
        }
      `}</style>

      {currentSection === 'product-designer' ? (
        <ProductDesigner 
          productType={sectionParams.productType || 'pen'}
          productCategory={sectionParams.productCategory || null}
          uploadedImage={sectionParams.uploadedImage}
          onClose={() => setCurrentSection('home')} 
        />
      ) : currentSection === 'custom-neon-builder' ? (
        <CustomNeonBuilder onNavigate={handleNavigate} onClose={() => setCurrentSection('home')} />
      ) : currentSection === 'neon-builder' ? (
        <NeonTextBuilder onClose={() => setCurrentSection('home')} />
      ) : currentSection === 'quote' ? (
        <GetQuote onNavigate={handleNavigate} onClose={() => setCurrentSection('home')} />
      ) : currentSection === 'about-us' ? (
        <AboutUs onNavigate={handleNavigate} onClose={() => setCurrentSection('home')} />
      ) : currentSection === 'admin-login' ? (
        <AdminLogin onNavigate={handleNavigate} onClose={() => setCurrentSection('home')} />
      ) : currentSection === 'admin' ? (
        <AdminDashboard onNavigate={handleNavigate} onClose={() => setCurrentSection('home')} />
      ) : currentSection === 'login' ? (
        <Login onNavigate={handleNavigate} onClose={() => setCurrentSection('home')} />
      ) : currentSection === 'register' ? (
        <Register onNavigate={handleNavigate} onClose={() => setCurrentSection('home')} />
      ) : currentSection === 'product-detail' ? (
        <ProductDetail 
          productId={sectionParams.productId}
          product={sectionParams.product}
          onNavigate={handleNavigate} 
          onClose={() => setCurrentSection('home')} 
        />
      ) : currentSection.startsWith('shop-') ? (
        <ProductDetail 
          productType={currentSection.replace('shop-', '')} 
          onNavigate={handleNavigate} 
          onClose={() => setCurrentSection('home')} 
        />
      ) : (
        <>
          <div id="home">
            <Hero onGetStarted={handleNavigate} />
          </div>
          <Services onNavigate={handleNavigate} />
          <Features />
          <CustomNeonPrinting onNavigate={handleNavigate} />
          <Products onNavigate={handleNavigate} />
          <About onNavigate={handleNavigate} />
          <Contact />
          <Newsletter />
        </>
      )}

        {!hideHeader && <Footer onNavigate={handleNavigate} />}
      </div>
    </AuthProvider>
  );
}

export default App;
