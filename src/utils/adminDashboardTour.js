import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../styles/designerTour.css';

export const ADMIN_DASHBOARD_TOUR_KEY = 'rspuk_admin_dashboard_tour_v1_done';

let activeDriver = null;

const TOUR_ICONS = {
  welcome: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>`,
  navigation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>`,
  orders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  finish: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>`,
};

const TOUR_CLOSE_ICON = `<svg class="rspuk-tour-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`;

const TAB_LABELS = {
  overview: 'Overview',
  products: 'Products',
  categories: 'Categories',
  orders: 'Orders',
  quotes: 'Quotes',
  'design-service': 'Design service',
  'neon-pricing': 'Neon pricing',
  'featured-pricing': 'Featured pricing',
  settings: 'Settings',
};

const TAB_STEPS = {
  overview: [
    {
      tourIcon: 'default',
      element: '[data-tour="admin-overview-activity"]',
      popover: {
        title: 'Activity feed',
        description: 'New orders, quotes, and design requests appear here. Click an item to jump to the relevant tab.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      tourIcon: 'default',
      element: '[data-tour="admin-overview-stats"]',
      popover: {
        title: 'Key metrics',
        description: 'Track orders, revenue, users, products, and pending quotes at a glance.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      tourIcon: 'default',
      element: '[data-tour="admin-overview-charts"]',
      popover: {
        title: 'Charts',
        description: 'Revenue by month and new user registrations help you spot trends over time.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  products: [
    {
      tourIcon: 'default',
      element: '[data-tour="admin-products-add"]',
      popover: {
        title: 'Add in-house products',
        description: 'Create catalogue products with your own pricing and images. These appear in the shop and are not sent to Tradeprint.',
        side: 'bottom',
        align: 'end',
      },
    },
    {
      tourIcon: 'default',
      element: '[data-tour="admin-products-list"]',
      popover: {
        title: 'Product list',
        description: 'Edit, delete, or check whether each item is In-house or Tradeprint-synced.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  categories: [
    {
      tourIcon: 'default',
      element: '[data-tour="admin-categories-add"]',
      popover: {
        title: 'Manage categories',
        description: 'Add shop categories customers use to filter products on the homepage.',
        side: 'bottom',
        align: 'end',
      },
    },
    {
      tourIcon: 'default',
      element: '[data-tour="admin-categories-list"]',
      popover: {
        title: 'Category list',
        description: 'Set display names, sort order, and active status for each category.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  orders: [
    {
      tourIcon: 'orders',
      element: '[data-tour="admin-orders-list"]',
      popover: {
        title: 'Orders',
        description: 'View paid checkouts and update order status. Tradeprint orders are labelled separately.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  quotes: [
    {
      tourIcon: 'default',
      element: '[data-tour="admin-quotes-list"]',
      popover: {
        title: 'Quote requests',
        description: 'Review customer quote submissions and send responses from here.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  'design-service': [
    {
      tourIcon: 'default',
      element: '[data-tour="admin-design-service"]',
      popover: {
        title: 'Design service requests',
        description: 'Manage paid design-service jobs, deliverables, and customer communication.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  'neon-pricing': [
    {
      tourIcon: 'settings',
      element: '[data-tour="admin-neon-pricing"]',
      popover: {
        title: 'Neon pricing rules',
        description: 'Configure neon builder pricing, materials, and calculation options.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  'featured-pricing': [
    {
      tourIcon: 'settings',
      element: '[data-tour="admin-featured-pricing"]',
      popover: {
        title: 'Featured signage pricing',
        description: 'Set pricing rules used on featured category pages and quote flows.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  settings: [
    {
      tourIcon: 'settings',
      element: '[data-tour="admin-settings-announcement"]',
      popover: {
        title: 'Site announcement',
        description: 'Edit the message bar shown below the main site header.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      tourIcon: 'settings',
      element: '[data-tour="admin-settings-gallery"]',
      popover: {
        title: 'Gallery projects',
        description: 'Add and manage projects shown on the public gallery page.',
        side: 'top',
        align: 'start',
      },
    },
    {
      tourIcon: 'settings',
      element: '[data-tour="admin-settings-faqs"]',
      popover: {
        title: 'FAQs',
        description: 'Create and delete FAQs displayed on the public FAQs page.',
        side: 'top',
        align: 'start',
      },
    },
    {
      tourIcon: 'settings',
      element: '[data-tour="admin-settings-sync"]',
      popover: {
        title: 'Tradeprint sync',
        description: 'Fetch third-party print products into your catalogue. Synced items use live Tradeprint pricing.',
        side: 'top',
        align: 'start',
      },
    },
  ],
};

function decorateTourPopover(popover, { driver: driverInstance }) {
  const wrapper = popover.wrapper;
  const activeIndex = driverInstance.getActiveIndex() ?? 0;
  const steps = driverInstance.getConfig().steps || [];
  const total = steps.length;
  const step = steps[activeIndex] || {};
  const iconKey = step.tourIcon || 'default';

  let accent = wrapper.querySelector('.rspuk-tour-accent');
  if (!accent) {
    accent = document.createElement('div');
    accent.className = 'rspuk-tour-accent';
    wrapper.insertBefore(accent, wrapper.firstChild);
  }

  let iconWrap = wrapper.querySelector('.rspuk-tour-icon-wrap');
  if (!iconWrap) {
    iconWrap = document.createElement('div');
    iconWrap.className = 'rspuk-tour-icon-wrap';
    wrapper.insertBefore(iconWrap, popover.title);
  }
  iconWrap.innerHTML = TOUR_ICONS[iconKey] || TOUR_ICONS.default;

  popover.title.classList.add('rspuk-tour-title');
  popover.description.classList.add('rspuk-tour-description');
  popover.footer.classList.add('rspuk-tour-footer');
  popover.closeButton.type = 'button';
  popover.closeButton.setAttribute('aria-label', 'Close tour');
  popover.closeButton.innerHTML = TOUR_CLOSE_ICON;
  popover.closeButton.classList.add('rspuk-tour-close');
  popover.nextButton.classList.add('rspuk-tour-btn', 'rspuk-tour-btn-primary');
  popover.previousButton.classList.add('rspuk-tour-btn', 'rspuk-tour-btn-secondary');

  popover.progress.className = 'driver-popover-progress-text rspuk-tour-progress';
  popover.progress.innerHTML = `
    <div class="rspuk-tour-progress-meta">
      <div class="rspuk-tour-dots" role="progressbar" aria-valuenow="${activeIndex + 1}" aria-valuemin="1" aria-valuemax="${total}">
        ${Array.from({ length: total }, (_, index) => {
          const classes = ['rspuk-tour-dot'];
          if (index === activeIndex) classes.push('is-active');
          if (index < activeIndex) classes.push('is-done');
          return `<span class="${classes.join(' ')}"></span>`;
        }).join('')}
      </div>
      <span class="rspuk-tour-step-count">Step ${activeIndex + 1} of ${total}</span>
    </div>
  `;
}

export function hasCompletedAdminDashboardTour() {
  try {
    return localStorage.getItem(ADMIN_DASHBOARD_TOUR_KEY) === '1';
  } catch {
    return false;
  }
}

export function destroyAdminDashboardTour() {
  if (activeDriver?.isActive?.()) activeDriver.destroy();
  activeDriver = null;
}

function buildSteps(activeTab) {
  const tabLabel = TAB_LABELS[activeTab] || 'this section';
  const tabSteps = TAB_STEPS[activeTab] || [];

  return [
    {
      tourIcon: 'welcome',
      popover: {
        title: 'Admin dashboard guide',
        description: `This quick tour explains how to use the dashboard. You are on the ${tabLabel} tab.`,
        side: 'over',
        align: 'center',
      },
    },
    {
      tourIcon: 'navigation',
      element: '[data-tour="admin-header"]',
      popover: {
        title: 'Dashboard header',
        description: 'Return to the public website or sign out securely from here.',
        side: 'bottom',
        align: 'end',
      },
    },
    {
      tourIcon: 'navigation',
      element: '[data-tour="admin-tabs"]',
      popover: {
        title: 'Main navigation',
        description: 'Switch between overview, products, orders, quotes, pricing, and site settings. Red badges mean new items need attention.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      tourIcon: 'navigation',
      element: `[data-tour="admin-tab-${activeTab}"]`,
      popover: {
        title: `${tabLabel} tab`,
        description: `You are viewing ${tabLabel}. Use the other tabs to manage different parts of the business.`,
        side: 'bottom',
        align: 'center',
      },
    },
    ...tabSteps,
    {
      tourIcon: 'default',
      element: '[data-tour="admin-guide-btn"]',
      popover: {
        title: 'Replay anytime',
        description: 'Open this guide on any tab whenever you need a refresher.',
        side: 'left',
        align: 'end',
      },
    },
    {
      tourIcon: 'finish',
      popover: {
        title: 'You are all set',
        description: 'Explore each tab at your own pace. Click Guide again on any page for a tab-specific walkthrough.',
        side: 'over',
        align: 'center',
      },
    },
  ];
}

export function startAdminDashboardTour(options = {}) {
  const { activeTab = 'overview', onSwitchTab, markComplete = false } = options;
  if (activeDriver?.isActive?.()) return activeDriver;

  const steps = buildSteps(activeTab);

  const driverObj = driver({
    animate: true,
    showProgress: true,
    progressText: '',
    nextBtnText: 'Continue',
    prevBtnText: 'Back',
    doneBtnText: 'Got it',
    popoverClass: 'rspuk-designer-tour-popover',
    overlayColor: 'rgba(15, 23, 42, 0.72)',
    overlayOpacity: 1,
    stagePadding: 10,
    stageRadius: 10,
    smoothScroll: true,
    allowClose: true,
    steps,
    onPopoverRender: decorateTourPopover,
    onHighlightStarted: (element) => {
      const tabAttr = element?.getAttribute?.('data-tour') || '';
      const match = tabAttr.match(/^admin-tab-(.+)$/);
      if (match && typeof onSwitchTab === 'function') {
        onSwitchTab(match[1]);
      }
    },
    onDestroyed: () => {
      if (markComplete) {
        try {
          localStorage.setItem(ADMIN_DASHBOARD_TOUR_KEY, '1');
        } catch {
          /* ignore */
        }
      }
      activeDriver = null;
    },
  });

  activeDriver = driverObj;
  driverObj.drive();
  return driverObj;
}
