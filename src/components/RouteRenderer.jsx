import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from '../config/routes.config';
import DefaultLayout from '../layouts/DefaultLayout';
import MinimalLayout from '../layouts/MinimalLayout';
import { useAuth } from '../context/AuthContext';

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-blue-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
        Loading...
      </p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { user, authReady } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (!authReady) {
    return <LoadingFallback />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Component {...rest} />;
};

const RouteRenderer = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {routes.map((route, index) => {
          const Component = route.protected 
            ? (props) => <ProtectedRoute component={route.component} {...props} />
            : route.component;
          
          const Layout = route.layout === 'minimal' ? MinimalLayout : DefaultLayout;

          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Layout>
                  <Component />
                </Layout>
              }
            />
          );
        })}
        {/* 404 - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default RouteRenderer;
