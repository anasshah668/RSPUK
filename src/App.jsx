import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RouteRenderer from './components/RouteRenderer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
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
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
