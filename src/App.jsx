import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NeonPreviewExitProvider } from './context/NeonPreviewExitContext';
import RouteRenderer from './components/RouteRenderer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <NeonPreviewExitProvider>
      <ScrollToTop />
      <AuthProvider>
        <div className="min-h-screen bg-blue-50">
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
          
          <RouteRenderer />
          <ToastContainer
            position="top-right"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
        </div>
        </CartProvider>
      </AuthProvider>
      </NeonPreviewExitProvider>
    </Router>
  );
}

export default App;
