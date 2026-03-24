import React from 'react';
import Header from '../components/Header';
import TopAnnouncementBar from '../components/TopAnnouncementBar';
import ScrollToTopButton from '../components/ScrollToTopButton';
import CookieConsentModal from '../components/CookieConsentModal';
import Footer from '../components/Footer';

const DefaultLayout = ({ children }) => {
  return (
    <>
      <Header />
      <TopAnnouncementBar />
      {children}
      <Footer />
      <ScrollToTopButton />
      <CookieConsentModal />
    </>
  );
};

export default DefaultLayout;
