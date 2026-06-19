import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../styles/designerTour.css';

export const DESIGNER_TOUR_STORAGE_KEY = 'rspuk_product_designer_tour_v1_done';

let activeDriver = null;

const TOUR_ICONS = {
  welcome: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>`,
  tools: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03a2.25 2.25 0 113.182 3.182L14.6 18.36M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336 4.5 4.5 0 00-6.336-4.486c-.048.58-.025 1.192.14 1.743"/></svg>`,
  canvas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 4.5v15m6-15v15M4.5 9h15M4.5 15h15M4.5 4.5h15a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V5.25a.75.75 0 01.75-.75z"/></svg>`,
  toolbar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"/></svg>`,
  sides: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>`,
  finish: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>`,
};

const TOUR_CLOSE_ICON = `<svg class="rspuk-tour-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>`;

function styleTourCloseButton(closeButton) {
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close tour');
  closeButton.innerHTML = TOUR_CLOSE_ICON;
  closeButton.classList.add('rspuk-tour-close');
}

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
    accent.setAttribute('aria-hidden', 'true');
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
  styleTourCloseButton(popover.closeButton);
  popover.nextButton.classList.add('rspuk-tour-btn', 'rspuk-tour-btn-primary');
  popover.previousButton.classList.add('rspuk-tour-btn', 'rspuk-tour-btn-secondary');

  popover.progress.className = 'driver-popover-progress-text rspuk-tour-progress';
  popover.progress.innerHTML = `
    <div class="rspuk-tour-progress-meta">
      <div
        class="rspuk-tour-dots"
        role="progressbar"
        aria-label="Tour progress"
        aria-valuenow="${activeIndex + 1}"
        aria-valuemin="1"
        aria-valuemax="${total}"
      >
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

export function hasCompletedDesignerTour() {
  try {
    return localStorage.getItem(DESIGNER_TOUR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markDesignerTourComplete() {
  try {
    localStorage.setItem(DESIGNER_TOUR_STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function destroyDesignerTour() {
  if (activeDriver?.isActive?.()) {
    activeDriver.destroy();
  }
  activeDriver = null;
}

function buildTourSteps(isDoubleSided) {
  const steps = [
    {
      tourIcon: 'welcome',
      popover: {
        title: 'Welcome to the online designer',
        description:
          'This quick tour shows you where to add artwork, edit your design, and save a print-ready PDF for your order.',
        side: 'over',
        align: 'center',
      },
    },
    {
      tourIcon: 'tools',
      element: '[data-tour="designer-tools-rail"]',
      popover: {
        title: 'Design tools',
        description:
          'Use Uploads, Text, Background, QR codes, and Elements to build your design. Click a tool to open its panel.',
        side: 'right',
        align: 'start',
      },
    },
    {
      tourIcon: 'canvas',
      element: '[data-tour="designer-canvas"]',
      popover: {
        title: 'Your canvas',
        description:
          'Design inside the green safe area. The yellow cut line shows where your product will be trimmed.',
        side: 'right',
        align: 'center',
      },
    },
    {
      tourIcon: 'toolbar',
      element: '[data-tour="designer-toolbar"]',
      popover: {
        title: 'Editing toolbar',
        description:
          'Pan the canvas, zoom in or out, and adjust fonts, colours, and text styling for selected items.',
        side: 'bottom',
        align: 'start',
      },
    },
  ];

  if (isDoubleSided) {
    steps.push({
      tourIcon: 'sides',
      element: '[data-tour="designer-sides"]',
      popover: {
        title: 'Front & back sides',
        description:
          'This product is double-sided. Switch between Front and Back to design each print side separately.',
        side: 'left',
        align: 'start',
      },
    });
  }

  steps.push(
    {
      tourIcon: 'download',
      element: '[data-tour="designer-actions"]',
      popover: {
        title: 'Preview & download',
        description:
          'Preview your design in 3D, then use Save & Download to save a PDF to your device. This unlocks Review & Confirm.',
        side: 'top',
        align: 'end',
      },
    },
    {
      tourIcon: 'finish',
      popover: {
        title: "You're ready to design",
        description:
          'When finished, download your PDF, then click Review & Confirm to check your order and add to basket or checkout.',
        side: 'over',
        align: 'center',
      },
    },
  );

  return steps;
}

/**
 * @param {{ isDoubleSided?: boolean, onStepPrepare?: (action: string) => void, markComplete?: boolean }} options
 */
export function startDesignerTour(options = {}) {
  const { isDoubleSided = false, onStepPrepare, markComplete = true } = options;

  if (activeDriver?.isActive?.()) {
    return activeDriver;
  }

  const driverObj = driver({
    animate: true,
    showProgress: true,
    progressText: '',
    nextBtnText: 'Continue',
    prevBtnText: 'Back',
    doneBtnText: 'Start designing',
    popoverClass: 'rspuk-designer-tour-popover',
    overlayColor: 'rgba(15, 23, 42, 0.72)',
    overlayOpacity: 1,
    stagePadding: 12,
    stageRadius: 10,
    smoothScroll: true,
    allowClose: true,
    steps: buildTourSteps(isDoubleSided),
    onPopoverRender: decorateTourPopover,
    onHighlightStarted: (_element, step) => {
      const selector =
        typeof step?.element === 'string'
          ? step.element
          : step?.element?.getAttribute?.('data-tour')
            ? `[data-tour="${step.element.getAttribute('data-tour')}"]`
            : '';

      if (selector === '[data-tour="designer-tools-rail"]') {
        onStepPrepare?.('open-drawer');
      }
    },
    onDestroyed: () => {
      if (markComplete) {
        markDesignerTourComplete();
      }
      activeDriver = null;
    },
  });

  activeDriver = driverObj;
  driverObj.drive();
  return driverObj;
}
