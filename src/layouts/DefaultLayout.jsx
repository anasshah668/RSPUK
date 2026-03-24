import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    </>
  );
};

export default DefaultLayout;
