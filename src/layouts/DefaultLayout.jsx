import React, { useLayoutEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import TopAnnouncementBar from '../components/TopAnnouncementBar';
import ScrollToTopButton from '../components/ScrollToTopButton';
import GoogleReviewsBadge from '../components/GoogleReviewsBadge';
import CookieConsentModal from '../components/CookieConsentModal';
import Footer from '../components/Footer';

const DefaultLayout = ({ children }) => {
  const siteChromeRef = useRef(null);
  const [chromeHeight, setChromeHeight] = useState(80);

  useLayoutEffect(() => {
    const chrome = siteChromeRef.current;
    if (!chrome) return undefined;

    const updateHeight = () => {
      setChromeHeight(chrome.offsetHeight);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(chrome);
    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <>
      <div ref={siteChromeRef} className="fixed top-0 left-0 right-0 z-[100]">
        <Header />
        <TopAnnouncementBar />
      </div>
      <div style={{ paddingTop: chromeHeight }}>
        {children}
        <Footer />
      </div>
      <ScrollToTopButton />
      <GoogleReviewsBadge />
      <CookieConsentModal />
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    </>
  );
};

export default DefaultLayout;
