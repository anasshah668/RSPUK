import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../styles/designerTour.css';

export const ONLINE_DESIGNER_TOUR_KEY = 'rspuk_online_designer_tour_v1_done';

let activeDriver = null;

const TOUR_ICONS = {
  welcome: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>`,
  tools: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>`,
  canvas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>`,
  toolbar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>`,
  finish: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>`,
};

const TOUR_CLOSE_ICON = `<svg class="rspuk-tour-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`;

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

export function hasCompletedOnlineDesignerTour() {
  try {
    return localStorage.getItem(ONLINE_DESIGNER_TOUR_KEY) === '1';
  } catch {
    return false;
  }
}

export function destroyOnlineDesignerTour() {
  if (activeDriver?.isActive?.()) activeDriver.destroy();
  activeDriver = null;
}

export function startOnlineDesignerTour(options = {}) {
  const { onStepPrepare, markComplete = true } = options;
  if (activeDriver?.isActive?.()) return activeDriver;

  const steps = [
    {
      tourIcon: 'welcome',
      popover: {
        title: 'Welcome to Online Design Tool',
        description: 'Create social posts, flyers, and print designs. This quick tour shows the essentials.',
        side: 'over',
        align: 'center',
      },
    },
    {
      tourIcon: 'tools',
      element: '[data-tour="online-tools-rail"]',
      popover: {
        title: 'Tools panel',
        description: 'Insert text, backgrounds, icons, QR codes, templates, and stock photos from the left rail.',
        side: 'right',
        align: 'start',
      },
    },
    {
      tourIcon: 'canvas',
      element: '[data-tour="online-canvas"]',
      popover: {
        title: 'Your canvas',
        description: 'Design here. Drag images onto the canvas, snap to centre guides, and zoom as needed.',
        side: 'left',
        align: 'center',
      },
    },
    {
      tourIcon: 'toolbar',
      element: '[data-tour="online-toolbar"]',
      popover: {
        title: 'Editing toolbar',
        description: 'Undo, align, pan, duplicate, and layer controls. Use keyboard shortcuts: Ctrl+Z, Ctrl+C, Ctrl+V, Delete.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      tourIcon: 'download',
      element: '[data-tour="online-download"]',
      popover: {
        title: 'Export your work',
        description: 'Save as PDF or PNG, or save/load projects. Your work auto-saves locally as you design.',
        side: 'top',
        align: 'end',
      },
    },
    {
      tourIcon: 'finish',
      popover: {
        title: 'You\'re ready to create',
        description: 'Pick a template to start fast, or build from scratch. Click the ? button anytime to replay this tour.',
        side: 'over',
        align: 'center',
      },
    },
  ];

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
    steps,
    onPopoverRender: decorateTourPopover,
    onHighlightStarted: (_element, step) => {
      if (step?.element === '[data-tour="online-tools-rail"]') {
        onStepPrepare?.('open-drawer');
      }
    },
    onDestroyed: () => {
      if (markComplete) {
        try {
          localStorage.setItem(ONLINE_DESIGNER_TOUR_KEY, '1');
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
