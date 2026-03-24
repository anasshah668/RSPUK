import React from 'react';
import Header from '../components/Header';
import TopAnnouncementBar from '../components/TopAnnouncementBar';
import Footer from '../components/Footer';

const DefaultLayout = ({ children }) => {
  return (
    <>
      <Header />
      <TopAnnouncementBar />
      {children}
      <Footer />
    </>
  );
};

export default DefaultLayout;
