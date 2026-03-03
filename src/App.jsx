import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MissionSection from './components/MissionSection';
import Services from './components/Services';
import Features from './components/Features';
import Products from './components/Products';
import About from './components/About';
import Contact from './components/Contact';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import NeonTextBuilder from './pages/NeonTextBuilder';
import ProductDesigner from './pages/ProductDesigner';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [currentSection, setCurrentSection] = useState('home');

  const handleNavigate = (section) => {
    setCurrentSection(section);
    
    // Smooth scroll to section if it exists on the page
    if (section !== 'neon-builder' && section !== 'product-designer' && section !== 'home' && section !== 'login' && section !== 'register') {
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle scroll to show current section
  useEffect(() => {
    const handleScroll = () => {
      if (currentSection === 'neon-builder' || currentSection === 'product-designer') return;
      
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

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={handleNavigate} />

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
        <ProductDesigner productType="pen" onClose={() => setCurrentSection('home')} />
      ) : currentSection === 'neon-builder' ? (
        <NeonTextBuilder onClose={() => setCurrentSection('home')} />
      ) : currentSection === 'login' ? (
        <Login onNavigate={handleNavigate} onClose={() => setCurrentSection('home')} />
      ) : currentSection === 'register' ? (
        <Register onNavigate={handleNavigate} onClose={() => setCurrentSection('home')} />
      ) : (
        <>
          <div id="home">
            <Hero onGetStarted={handleNavigate} />
          </div>
          <MissionSection onNavigate={handleNavigate} />
          <Features />
          <Services onNavigate={handleNavigate} />
          <Products onNavigate={handleNavigate} />
          <About />
          <Contact />
          <Newsletter />
        </>
      )}

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
