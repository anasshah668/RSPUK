import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Features from '../components/Features';
import CustomNeonPrinting from '../components/CustomNeonPrinting';
import Products from '../components/Products';
import About from '../components/About';
import Contact from '../components/Contact';
import Newsletter from '../components/Newsletter';

const HomePage = () => {
  return (
    <>
      <div id="home">
        <Hero />
      </div>
      <Services />
      <Features />
      <CustomNeonPrinting />
      <Products />
      <About />
      <Contact />
      <Newsletter />
    </>
  );
};

export default HomePage;
