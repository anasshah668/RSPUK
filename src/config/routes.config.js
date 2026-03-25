import { lazy } from 'react';

// Lazy load all page components for better performance
const HomePage = lazy(() => import('../pages/HomePage'));
const AboutUs = lazy(() => import('../pages/AboutUs'));
const GetQuote = lazy(() => import('../pages/GetQuote'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const OAuthCallback = lazy(() => import('../pages/OAuthCallback'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const ProductDesigner = lazy(() => import('../pages/ProductDesigner'));
const NeonTextBuilder = lazy(() => import('../pages/NeonTextBuilder'));
const CustomNeonBuilder = lazy(() => import('../pages/CustomNeonBuilder'));
const AdminLogin = lazy(() => import('../pages/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const CategoryProducts = lazy(() => import('../pages/CategoryProducts'));
const FeaturedPrintedBoardPage = lazy(() => import('../pages/FeaturedPrintedBoardPage'));
const Featured2DBoxSignagePage = lazy(() => import('../pages/Featured2DBoxSignagePage'));
const Featured3DBuiltUpLettersPage = lazy(() => import('../pages/Featured3DBuiltUpLettersPage'));
const FeaturedFlexFacePage = lazy(() => import('../pages/FeaturedFlexFacePage'));
const FeaturedLightboxPage = lazy(() => import('../pages/FeaturedLightboxPage'));

// Route configuration
export const routes = [
  // Public routes with header and footer
  {
    path: '/',
    component: HomePage,
    exact: true,
    layout: 'default', // Header + Footer
  },
  {
    path: '/about-us',
    component: AboutUs,
    layout: 'default',
  },
  {
    path: '/get-free-quote',
    component: GetQuote,
    layout: 'default',
  },
  {
    path: '/login',
    component: Login,
    layout: 'default',
  },
  {
    path: '/register',
    component: Register,
    layout: 'default',
  },
  {
    path: '/oauth-callback',
    component: OAuthCallback,
    layout: 'minimal',
  },
  {
    path: '/neon-builder',
    component: NeonTextBuilder,
    layout: 'default',
  },
  {
    path: '/custom-neon-builder',
    component: CustomNeonBuilder,
    layout: 'default',
  },
  {
    path: '/product-designer',
    component: ProductDesigner,
    layout: 'default',
  },
  // Featured signage dedicated pages
  {
    path: '/featured/printed-board',
    component: FeaturedPrintedBoardPage,
    layout: 'default',
  },
  {
    path: '/featured/2d-box-signage',
    component: Featured2DBoxSignagePage,
    layout: 'default',
  },
  {
    path: '/featured/3d-built-up-letters',
    component: Featured3DBuiltUpLettersPage,
    layout: 'default',
  },
  {
    path: '/featured/flex-face',
    component: FeaturedFlexFacePage,
    layout: 'default',
  },
  {
    path: '/featured/lightbox',
    component: FeaturedLightboxPage,
    layout: 'default',
  },
  // Category products route: /category/:categorySlug
  {
    path: '/category/:categorySlug',
    component: CategoryProducts,
    layout: 'default',
  },
  // Product detail route: /category/productname/encryptedId
  {
    path: '/:category/:productName/:encryptedId',
    component: ProductDetail,
    layout: 'default',
  },
  // Admin routes without header/footer
  {
    path: '/admin/login',
    component: AdminLogin,
    layout: 'minimal', // No header/footer
  },
  {
    path: '/admin',
    component: AdminDashboard,
    layout: 'minimal',
    protected: true, // Requires admin authentication
  },
];

// Route helper functions
export const getRoutePath = (routeName, params = {}) => {
  const routeMap = {
    home: '/',
    aboutUs: '/about-us',
    getQuote: '/get-free-quote',
    login: '/login',
    register: '/register',
    neonBuilder: '/neon-builder',
    customNeonBuilder: '/custom-neon-builder',
    productDesigner: '/product-designer',
    productDetail: (category, productName, encryptedId) => 
      `/${category}/${productName}/${encryptedId}`,
    adminLogin: '/admin/login',
    admin: '/admin',
  };

  if (typeof routeMap[routeName] === 'function') {
    return routeMap[routeName](...Object.values(params));
  }
  
  return routeMap[routeName] || '/';
};

export default routes;
