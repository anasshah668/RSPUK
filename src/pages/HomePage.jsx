import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Features from '../components/Features';
import WhyChooseUs from '../components/WhyChooseUs';
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
      <Features />
      <CustomNeonPrinting />
      <WhyChooseUs />
      <Transformation />
      <Products />
      <TrustedBy />
      <BuiltForResults />
      <Contact />
      <ReadyToLightUp />
    </>
  );
};

export default HomePage;
