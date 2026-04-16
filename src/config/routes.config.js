import { lazy } from "react";

// Lazy load all page components for better performance
const HomePage = lazy(() => import("../pages/HomePage"));
const AboutUs = lazy(() => import("../pages/AboutUs"));
const GetQuote = lazy(() => import("../pages/GetQuote"));
const GalleryPage = lazy(() => import("../pages/GalleryPage"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const OAuthCallback = lazy(() => import("../pages/OAuthCallback"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const ProductDesigner = lazy(() => import("../pages/ProductDesigner"));
const GenericProductDesigner = lazy(
  () => import("../pages/GenericProductDesigner"),
);
const NeonTextBuilder = lazy(() => import("../pages/NeonTextBuilder"));
const CustomNeonBuilder = lazy(() => import("../pages/CustomNeonBuilder"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const PaymentSuccessPage = lazy(() => import("../pages/PaymentSuccessPage"));
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const CategoryProducts = lazy(() => import("../pages/CategoryProducts"));
const Account = lazy(() => import("../pages/Account"));
const FeaturedPrintedBoardPage = lazy(
  () => import("../pages/FeaturedPrintedBoardPage"),
);
const Featured2DBoxSignagePage = lazy(
  () => import("../pages/Featured2DBoxSignagePage"),
);
const Featured3DBuiltUpLettersPage = lazy(
  () => import("../pages/Featured3DBuiltUpLettersPage"),
);
const FeaturedFlexFacePage = lazy(
  () => import("../pages/FeaturedFlexFacePage"),
);
const FeaturedLightboxPage = lazy(
  () => import("../pages/FeaturedLightboxPage"),
);
const FeaturedPostersPage = lazy(() => import("../pages/FeaturedPostersPage"));
const FeaturedPvcBannersPage = lazy(
  () => import("../pages/FeaturedPvcBannersPage"),
);
const FeaturedCorrexFoamexAluminiumPrintsPage = lazy(
  () => import("../pages/FeaturedCorrexFoamexAluminiumPrintsPage"),
);
const FeaturedBacklitPrintsPage = lazy(
  () => import("../pages/FeaturedBacklitPrintsPage"),
);
const FeaturedCanvasPrintsPage = lazy(
  () => import("../pages/FeaturedCanvasPrintsPage"),
);
const FeaturedPrintedVinylPage = lazy(
  () => import("../pages/FeaturedPrintedVinylPage"),
);
const FeaturedFrostedVinylPage = lazy(
  () => import("../pages/FeaturedFrostedVinylPage"),
);
const FeaturedOneWayVisionPage = lazy(
  () => import("../pages/FeaturedOneWayVisionPage"),
);
const FeaturedCutVinylPage = lazy(
  () => import("../pages/FeaturedCutVinylPage"),
);
const FeaturedPrivacyFilmsPage = lazy(
  () => import("../pages/FeaturedPrivacyFilmsPage"),
);
const FeaturedQuoteRequestPage = lazy(
  () => import("../pages/FeaturedQuoteRequestPage"),
);

// Route configuration
export const routes = [
  // Public routes with header and footer
  {
    path: "/",
    component: HomePage,
    exact: true,
    layout: "default", // Header + Footer
  },
  {
    path: "/about-us",
    component: AboutUs,
    layout: "default",
  },
  {
    path: "/get-free-quote",
    component: GetQuote,
    layout: "default",
  },
  {
    path: "/gallery",
    component: GalleryPage,
    layout: "default",
  },
  {
    path: "/login",
    component: Login,
    layout: "default",
  },
  {
    path: "/register",
    component: Register,
    layout: "default",
  },
  {
    path: "/oauth-callback",
    component: OAuthCallback,
    layout: "minimal",
  },
  {
    path: "/neon-builder",
    component: NeonTextBuilder,
    layout: "default",
  },
  {
    path: "/custom-neon-builder",
    component: CustomNeonBuilder,
    layout: "default",
  },
  {
    path: "/checkout",
    component: CheckoutPage,
    layout: "default",
  },
  {
    path: "/payment-success",
    component: PaymentSuccessPage,
    layout: "minimal",
  },
  {
    path: "/product-designer",
    component: ProductDesigner,
    layout: "minimal",
  },
  {
    path: "/generic-product-designer",
    component: GenericProductDesigner,
    layout: "minimal",
  },
  // Featured signage dedicated pages
  {
    path: "/featured/printed-board",
    component: FeaturedPrintedBoardPage,
    layout: "default",
  },
  {
    path: "/featured/2d-box-signage",
    component: Featured2DBoxSignagePage,
    layout: "default",
  },
  {
    path: "/featured/3d-built-up-letters",
    component: Featured3DBuiltUpLettersPage,
    layout: "default",
  },
  {
    path: "/featured/flex-face",
    component: FeaturedFlexFacePage,
    layout: "default",
  },
  {
    path: "/featured/lightbox",
    component: FeaturedLightboxPage,
    layout: "default",
  },
  {
    path: "/featured/posters",
    component: FeaturedPostersPage,
    layout: "default",
  },
  {
    path: "/featured/pvc-banners",
    component: FeaturedPvcBannersPage,
    layout: "default",
  },
  {
    path: "/featured/correx-foamex-aluminium-prints",
    component: FeaturedCorrexFoamexAluminiumPrintsPage,
    layout: "default",
  },
  {
    path: "/featured/backlit-prints",
    component: FeaturedBacklitPrintsPage,
    layout: "default",
  },
  {
    path: "/featured/canvas-prints",
    component: FeaturedCanvasPrintsPage,
    layout: "default",
  },
  {
    path: "/featured/printed-vinyl",
    component: FeaturedPrintedVinylPage,
    layout: "default",
  },
  {
    path: "/featured/frosted-vinyl",
    component: FeaturedFrostedVinylPage,
    layout: "default",
  },
  {
    path: "/featured/one-way-vision",
    component: FeaturedOneWayVisionPage,
    layout: "default",
  },
  {
    path: "/featured/cut-vinyl",
    component: FeaturedCutVinylPage,
    layout: "default",
  },
  {
    path: "/featured/privacy-films",
    component: FeaturedPrivacyFilmsPage,
    layout: "default",
  },
  {
    path: "/featured/:categorySlug/quote",
    component: FeaturedQuoteRequestPage,
    layout: "default",
  },
  {
    path: "/featured/:categorySlug/requirements",
    component: FeaturedQuoteRequestPage,
    layout: "default",
  },
  // Category products route: /category/:categorySlug
  {
    path: "/category/:categorySlug",
    component: CategoryProducts,
    layout: "default",
  },
  // Account (My Account)
  {
    path: "/account",
    component: Account,
    layout: "default",
  },
  // Product detail route: /category/productname/encryptedId
  {
    path: "/:category/:productName/:encryptedId",
    component: ProductDetail,
    layout: "default",
  },
  // Admin routes without header/footer
  {
    path: "/admin/login",
    component: AdminLogin,
    layout: "minimal", // No header/footer
  },
  {
    path: "/admin",
    component: AdminDashboard,
    layout: "minimal",
    protected: true, // Requires admin authentication
  },
];

// Route helper functions
export const getRoutePath = (routeName, params = {}) => {
  const routeMap = {
    home: "/",
    aboutUs: "/about-us",
    getQuote: "/get-free-quote",
    gallery: "/gallery",
    login: "/login",
    register: "/register",
    account: "/account",
    neonBuilder: "/neon-builder",
    customNeonBuilder: "/custom-neon-builder",
    checkout: "/checkout",
    paymentSuccess: "/payment-success",
    productDesigner: "/product-designer",
    genericProductDesigner: "/generic-product-designer",
    productDetail: (category, productName, encryptedId) =>
      `/${category}/${productName}/${encryptedId}`,
    adminLogin: "/admin/login",
    admin: "/admin",
  };

  if (typeof routeMap[routeName] === "function") {
    return routeMap[routeName](...Object.values(params));
  }

  return routeMap[routeName] || "/";
};

export default routes;
