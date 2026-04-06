import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Features from '../components/Features';
import WhyChooseUs from '../components/WhyChooseUs';
import StartDesigningPrint from '../components/StartDesigningPrint';
import FeaturedSignageProducts from '../components/FeaturedSignageProducts';
import CustomNeonPrinting from '../components/CustomNeonPrinting';
import Transformation from '../components/Transformation';
import Products from '../components/Products';
import TrustedBy from '../components/TrustedBy';
import BuiltForResults from '../components/BuiltForResults';
import Contact from '../components/Contact';
import ReadyToLightUp from '../components/ReadyToLightUp';

const HomePage = () => {
  return (
    <>
      <div id="home">
        <Hero />
      </div>
      <Services />
      <FeaturedSignageProducts />
      <Features />
      <CustomNeonPrinting />
      <Products />
      <WhyChooseUs />
      <StartDesigningPrint />
      <Transformation />
    
      <TrustedBy />
      <BuiltForResults />
      <Contact />
      <ReadyToLightUp />
    </>
  );
};

export default HomePage;
