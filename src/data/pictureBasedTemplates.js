import {
  page,
  tb,
  rect,
  circle,
  linear,
  bg,
  decoration,
  scene,
  photoArea,
  photoCircle,
  photoHint,
  dotGrid,
  printFooter,
} from './templateSceneBuilders';

const A4_W = 794;
const A4_H = 1123;
const A4_LAND_W = 1123;
const A4_LAND_H = 794;
const A3_W = 1123;
const A3_H = 1587;
const BC_W = 1050;
const BC_H = 600;

const ORANGE = '#f97316';
const ORANGE_DARK = '#ea580c';
const INK = '#1f2937';
const MUTED = '#6b7280';

const PHOTO_PALETTES = [
  { accent: '#f97316', accentDark: '#ea580c', label: 'Orange' },
  { accent: '#2563eb', accentDark: '#1d4ed8', label: 'Blue' },
  { accent: '#059669', accentDark: '#047857', label: 'Emerald' },
  { accent: '#db2777', accentDark: '#be185d', label: 'Pink' },
  { accent: '#7c3aed', accentDark: '#6d28d9', label: 'Violet' },
  { accent: '#dc2626', accentDark: '#b91c1c', label: 'Red' },
  { accent: '#0891b2', accentDark: '#0e7490', label: 'Cyan' },
  { accent: '#ca8a04', accentDark: '#a16207', label: 'Gold' },
];

const pad = (n) => String(n).padStart(2, '0');

/** Reference-style creative agency flyer (portrait). */
function marketingAgencyPortrait(accent = ORANGE, accentDark = ORANGE_DARK) {
  const w = A4_W;
  const h = A4_H;
  return scene([
    bg(w, h, '#ffffff'),
    ...dotGrid(620, 40, 4, 4, 14, 4, '#e5e7eb'),
    ...dotGrid(40, 720, 4, 4, 14, 4, '#e5e7eb'),
    decoration(circle({ left: 180, top: -80, radius: 320, fill: accent, opacity: 0.15 })),
    decoration(circle({ left: 520, top: 520, radius: 200, fill: accent, opacity: 0.12 })),
    photoCircle({ left: 397, top: 80, radius: 210, originX: 'center', originY: 'center' }),
    photoHint(220, 250, 354, 'Team or hero photo'),
    rect({ left: 0, top: 500, width: w, height: 90, fill: accent, selectable: true }),
    tb({ left: 50, top: 518, width: w - 100, text: 'CREATIVE MARKETING AGENCY', fontSize: 30, fill: '#ffffff', fontWeight: 'bold', textAlign: 'center', charSpacing: 40 }),
    tb({ left: 50, top: 620, width: 320, text: 'WHY CHOOSE US?', fontSize: 22, fill: accent, fontWeight: 'bold' }),
    tb({ left: 50, top: 670, width: 320, text: '✦  Expert strategy\n✦  Creative campaigns\n✦  Measurable results\n✦  Dedicated support', fontSize: 18, lineHeight: 1.7, fill: INK }),
    tb({ left: 420, top: 620, width: 320, text: 'OUR SERVICES', fontSize: 22, fill: accent, fontWeight: 'bold' }),
    tb({ left: 420, top: 670, width: 320, text: '◎  Brand identity\n◎  Social media\n◎  Web design\n◎  Content creation', fontSize: 18, lineHeight: 1.7, fill: INK }),
    decoration(circle({ left: -60, top: 900, radius: 180, fill: accent, opacity: 0.9 })),
    rect({ left: 0, top: h - 140, width: w, height: 140, fill: accentDark, selectable: true }),
    tb({ left: 50, top: h - 115, width: w - 100, text: 'CONTACT US', fontSize: 20, fill: '#ffffff', fontWeight: 'bold', textAlign: 'center' }),
    tb({ left: 50, top: h - 80, width: w - 100, text: '07xxx xxx xxx  ·  hello@youragency.com  ·  www.youragency.com', fontSize: 16, fill: '#fff7ed', textAlign: 'center' }),
  ]);
}

/** Reference-style creative agency flyer (landscape). */
function marketingAgencyLandscape(accent = ORANGE, accentDark = ORANGE_DARK) {
  const w = A4_LAND_W;
  const h = A4_LAND_H;
  return scene([
    bg(w, h, '#ffffff'),
    ...dotGrid(40, 40, 4, 4, 14, 4, '#e5e7eb'),
    ...dotGrid(980, 620, 4, 4, 14, 4, '#e5e7eb'),
    photoArea({ left: 40, top: 40, width: 420, height: h - 80, rx: 200, ry: 200 }),
    photoHint(100, 330, 300, 'Your photo'),
    rect({ left: 500, top: 0, width: 80, height: h, fill: accent, selectable: true }),
    tb({ left: 520, top: 120, width: 560, text: 'CREATIVE\nMARKETING\nAGENCY', fontSize: 48, lineHeight: 1.05, fill: INK, fontWeight: 'bold' }),
    tb({ left: 600, top: 340, width: 220, text: 'WHY CHOOSE US?', fontSize: 18, fill: accent, fontWeight: 'bold' }),
    tb({ left: 600, top: 380, width: 220, text: 'Expert team\nProven results\nFast turnaround', fontSize: 15, lineHeight: 1.6, fill: MUTED }),
    tb({ left: 860, top: 340, width: 220, text: 'SERVICES', fontSize: 18, fill: accent, fontWeight: 'bold' }),
    tb({ left: 860, top: 380, width: 220, text: 'Branding\nSocial\nWeb design', fontSize: 15, lineHeight: 1.6, fill: MUTED }),
    rect({ left: 500, top: h - 70, width: w - 500, height: 70, fill: accentDark, selectable: true }),
    tb({ left: 520, top: h - 48, width: w - 540, text: '07xxx xxx xxx  ·  hello@youragency.com', fontSize: 16, fill: '#ffffff', textAlign: 'center' }),
  ]);
}

function buildPhotoFlyer(index, palette, layoutIndex) {
  const w = A4_W;
  const h = A4_H;
  const p = palette;
  const li = layoutIndex % 5;
  const headline = ['Grow Your Brand', 'Discover Our Studio', 'Your Story Matters', 'Premium Service', 'Book a Consultation'][index % 5];
  const objects = [bg(w, h, '#ffffff')];

  if (li === 0) {
    objects.push(
      photoArea({ left: 0, top: 0, width: w, height: 520 }),
      photoHint(180, 220, 434, 'Hero image'),
      rect({ left: 0, top: 520, width: w, height: 12, fill: p.accent, selectable: true }),
      tb({ left: 50, top: 560, width: w - 100, text: headline.toUpperCase(), fontSize: 42, fill: INK, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 50, top: 640, width: w - 100, text: 'Replace the photo above with your own image, then edit the headline and contact details below.', fontSize: 22, lineHeight: 1.45, fill: MUTED, textAlign: 'center' }),
      rect({ left: 50, top: 900, width: w - 100, height: 80, fill: p.accent, rx: 12, ry: 12, selectable: true }),
      tb({ left: 50, top: 924, width: w - 100, text: 'Get in touch — 07xxx xxx xxx', fontSize: 22, fill: '#ffffff', fontWeight: 'bold', textAlign: 'center' }),
    );
  } else if (li === 1) {
    objects.push(
      photoArea({ left: 50, top: 80, width: 340, height: 460, rx: 24, ry: 24 }),
      photoHint(90, 270, 260, 'Portrait photo'),
      tb({ left: 420, top: 120, width: 320, text: headline, fontSize: 36, fill: INK, fontWeight: 'bold' }),
      tb({ left: 420, top: 220, width: 320, text: 'Add supporting copy about your business, event, or offer.', fontSize: 20, lineHeight: 1.5, fill: MUTED }),
      rect({ left: 420, top: 420, width: 200, height: 56, fill: p.accent, rx: 28, ry: 28, selectable: true }),
      tb({ left: 420, top: 436, width: 200, text: 'Learn more', fontSize: 18, fill: '#ffffff', fontWeight: 'bold', textAlign: 'center' }),
      photoArea({ left: 50, top: 600, width: w - 100, height: 280, rx: 16, ry: 16 }),
      photoHint(200, 700, 394, 'Secondary image or team photo'),
    );
  } else if (li === 2) {
    objects.push(
      ...dotGrid(650, 60, 4, 4, 14, 4, '#e5e7eb'),
      photoCircle({ left: w / 2, top: 200, radius: 180, originX: 'center', originY: 'center' }),
      photoHint(220, 170, 354, 'Circular photo'),
      tb({ left: 50, top: 420, width: w - 100, text: headline.toUpperCase(), fontSize: 38, fill: p.accent, fontWeight: 'bold', textAlign: 'center', charSpacing: 30 }),
      tb({ left: 80, top: 520, width: w - 160, text: 'Perfect for agencies, coaches, and creative professionals.', fontSize: 22, lineHeight: 1.45, fill: INK, textAlign: 'center' }),
      printFooter(w, 'www.yourbrand.com'),
    );
  } else if (li === 3) {
    objects.push(
      rect({ left: 0, top: 0, width: w, height: 200, fill: p.accent, selectable: true }),
      tb({ left: 50, top: 70, width: w - 100, text: headline, fontSize: 40, fill: '#ffffff', fontWeight: 'bold', textAlign: 'center' }),
      photoArea({ left: 50, top: 240, width: w - 100, height: 500, rx: 20, ry: 20 }),
      photoHint(200, 450, 394, 'Main photo'),
      tb({ left: 50, top: 780, width: w - 100, text: 'Add pricing, dates, or service details here.', fontSize: 22, fill: MUTED, textAlign: 'center' }),
    );
  } else {
    objects.push(
      photoArea({ left: 0, top: 0, width: w * 0.55, height: h }),
      photoHint(80, 480, 280, 'Full-height photo'),
      tb({ left: w * 0.58, top: 120, width: w * 0.36, text: headline, fontSize: 32, fill: INK, fontWeight: 'bold' }),
      tb({ left: w * 0.58, top: 280, width: w * 0.36, text: 'Split layout with a bold image column and editable text column.', fontSize: 18, lineHeight: 1.5, fill: MUTED }),
      rect({ left: w * 0.58, top: 520, width: w * 0.34, height: 8, fill: p.accent }),
      tb({ left: w * 0.58, top: 560, width: w * 0.36, text: '07xxx xxx xxx\nhello@brand.com', fontSize: 18, lineHeight: 1.6, fill: INK }),
    );
  }

  return {
    id: `photo-flyer-${pad(index + 1)}`,
    name: `${p.label} Photo Flyer ${index + 1}`,
    category: 'Picture Templates',
    description: `A4 photo flyer — ${p.label.toLowerCase()} accent, image-led layout`,
    pages: [page(`photo-flyer-${pad(index + 1)}-p0`, w, h, { kind: 'solid', color: '#ffffff' }, scene(objects))],
  };
}

function buildPhotoPoster(index, palette, layoutIndex) {
  const w = A3_W;
  const h = A3_H;
  const p = palette;
  const li = layoutIndex % 4;
  const title = ['LIVE EVENT', 'NOW OPEN', 'SUMMER SALE', 'JOIN US'][index % 4];
  const objects = [bg(w, h, '#111827')];

  if (li === 0) {
    objects.push(
      photoArea({ left: 80, top: 80, width: w - 160, height: 720, rx: 24, ry: 24 }),
      photoHint(280, 400, w - 560, 'Hero poster image'),
      tb({ left: 80, top: 860, width: w - 160, text: title, fontSize: 88, fill: '#ffffff', fontWeight: 'bold', textAlign: 'center' }),
      rect({ left: 200, top: 1020, width: w - 400, height: 8, fill: p.accent }),
      tb({ left: 80, top: 1080, width: w - 160, text: 'Saturday 7 September  ·  7PM', fontSize: 32, fill: p.accent, textAlign: 'center' }),
    );
  } else if (li === 1) {
    objects.push(
      photoArea({ left: 0, top: 0, width: w, height: h * 0.65 }),
      photoHint(300, 420, w - 600, 'Full-bleed photo'),
      rect({ left: 0, top: h * 0.65, width: w, height: h * 0.35, fill: p.accentDark, selectable: true }),
      tb({ left: 80, top: h * 0.7, width: w - 160, text: title, fontSize: 72, fill: '#ffffff', fontWeight: 'bold', textAlign: 'center' }),
    );
  } else if (li === 2) {
    objects.push(
      photoCircle({ left: w / 2, top: 380, radius: 280, originX: 'center', originY: 'center' }),
      photoHint(320, 320, w - 640, 'Circular feature photo'),
      tb({ left: 80, top: 720, width: w - 160, text: title, fontSize: 96, fill: p.accent, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 80, top: 1200, width: w - 160, text: 'Replace the circle with your image', fontSize: 28, fill: '#9ca3af', textAlign: 'center' }),
    );
  } else {
    objects.push(
      photoArea({ left: 80, top: 120, width: 480, height: h - 240, rx: 20, ry: 20 }),
      photoHint(180, 680, 280, 'Portrait photo'),
      tb({ left: 600, top: 200, width: w - 680, text: title, fontSize: 64, lineHeight: 1.05, fill: '#ffffff', fontWeight: 'bold' }),
      tb({ left: 600, top: 500, width: w - 680, text: 'Bold poster with side image and oversized typography.', fontSize: 26, lineHeight: 1.45, fill: '#d1d5db' }),
      rect({ left: 600, top: 720, width: 240, height: 72, fill: p.accent, rx: 36, ry: 36, selectable: true }),
      tb({ left: 600, top: 742, width: 240, text: 'Tickets', fontSize: 28, fill: '#ffffff', fontWeight: 'bold', textAlign: 'center' }),
    );
  }

  return {
    id: `photo-poster-${pad(index + 1)}`,
    name: `${p.label} Photo Poster ${index + 1}`,
    category: 'Picture Templates',
    description: `A3 photo poster — ${p.label.toLowerCase()} accent`,
    pages: [page(`photo-poster-${pad(index + 1)}-p0`, w, h, { kind: 'solid', color: '#111827' }, scene(objects))],
  };
}

function buildPhotoLeaflet(index, palette, layoutIndex) {
  const w = A4_W;
  const h = A4_H;
  const p = palette;
  const li = layoutIndex % 4;
  const objects = [bg(w, h, '#ffffff')];

  if (li === 0) {
    objects.push(
      photoArea({ left: 0, top: 0, width: w, height: 480 }),
      photoHint(200, 200, 394, 'Property or product photo'),
      tb({ left: 50, top: 520, width: w - 100, text: 'Premium Listing', fontSize: 44, fill: INK, fontWeight: 'bold' }),
      tb({ left: 50, top: 600, width: w - 100, text: '3 bed  ·  2 bath  ·  Garden  ·  £425,000', fontSize: 24, fill: MUTED }),
      rect({ left: 50, top: 700, width: w - 100, height: 200, fill: '#f3f4f6', rx: 16, ry: 16, selectable: true }),
      photoArea({ left: 70, top: 720, width: 300, height: 160, rx: 12, ry: 12 }),
      photoArea({ left: 400, top: 720, width: 324, height: 160, rx: 12, ry: 12 }),
      tb({ left: 70, top: 780, width: 300, text: 'Interior', fontSize: 18, fill: MUTED, textAlign: 'center' }),
      tb({ left: 400, top: 780, width: 324, text: 'Exterior', fontSize: 18, fill: MUTED, textAlign: 'center' }),
    );
  } else if (li === 1) {
    objects.push(
      photoArea({ left: 50, top: 80, width: 320, height: 400, rx: 16, ry: 16 }),
      photoHint(100, 250, 220, 'Team photo'),
      tb({ left: 400, top: 100, width: 340, text: 'About Us', fontSize: 36, fill: p.accent, fontWeight: 'bold' }),
      tb({ left: 400, top: 170, width: 340, text: 'Tell your story alongside a strong portrait or team image.', fontSize: 20, lineHeight: 1.5, fill: MUTED }),
      photoArea({ left: 50, top: 540, width: w - 100, height: 300, rx: 16, ry: 16 }),
      photoHint(200, 650, 394, 'Workspace or product gallery'),
      printFooter(w, 'www.yourcompany.com'),
    );
  } else if (li === 2) {
    objects.push(
      rect({ left: 0, top: 0, width: w, height: 160, fill: p.accent, selectable: true }),
      tb({ left: 50, top: 55, width: w - 100, text: 'OUR SERVICES', fontSize: 36, fill: '#ffffff', fontWeight: 'bold', textAlign: 'center' }),
      photoArea({ left: 50, top: 200, width: 220, height: 220, rx: 110, ry: 110 }),
      photoArea({ left: 287, top: 200, width: 220, height: 220, rx: 110, ry: 110 }),
      photoArea({ left: 524, top: 200, width: 220, height: 220, rx: 110, ry: 110 }),
      tb({ left: 50, top: 460, width: 220, text: 'Design', fontSize: 20, fill: INK, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 287, top: 460, width: 220, text: 'Print', fontSize: 20, fill: INK, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 524, top: 460, width: 220, text: 'Delivery', fontSize: 20, fill: INK, fontWeight: 'bold', textAlign: 'center' }),
      photoArea({ left: 50, top: 540, width: w - 100, height: 320, rx: 16, ry: 16 }),
      photoHint(200, 660, 394, 'Feature image'),
    );
  } else {
    objects.push(
      photoArea({ left: 0, top: 0, width: w * 0.42, height: h }),
      photoHint(60, 480, 240, 'Tall photo'),
      tb({ left: w * 0.46, top: 100, width: w * 0.48, text: 'Travel & Explore', fontSize: 40, fill: INK, fontWeight: 'bold' }),
      tb({ left: w * 0.46, top: 200, width: w * 0.48, text: 'Pair striking photography with destination details and booking info.', fontSize: 20, lineHeight: 1.5, fill: MUTED }),
      photoArea({ left: w * 0.46, top: 400, width: w * 0.48, height: 220, rx: 12, ry: 12 }),
      photoHint(w * 0.46 + 40, 480, w * 0.4, 'Secondary shot'),
    );
  }

  return {
    id: `photo-leaflet-${pad(index + 1)}`,
    name: `${p.label} Photo Leaflet ${index + 1}`,
    category: 'Picture Templates',
    description: `A4 photo leaflet — ${p.label.toLowerCase()} accent`,
    pages: [page(`photo-leaflet-${pad(index + 1)}-p0`, w, h, { kind: 'solid', color: '#ffffff' }, scene(objects))],
  };
}

function buildPhotoBusinessCard(index, palette, layoutIndex) {
  const w = BC_W;
  const h = BC_H;
  const p = palette;
  const li = layoutIndex % 3;
  const name = ['Alex Morgan', 'Jordan Lee', 'Sam Taylor', 'Riley Chen'][index % 4];
  const objects = [bg(w, h, '#ffffff')];

  if (li === 0) {
    objects.push(
      photoArea({ left: 0, top: 0, width: 360, height: h }),
      photoHint(70, 240, 220, 'Your photo'),
      tb({ left: 400, top: 140, width: 600, text: name, fontSize: 44, fill: INK, fontWeight: 'bold' }),
      tb({ left: 400, top: 210, width: 600, text: 'Creative Director', fontSize: 22, fill: p.accent }),
      tb({ left: 400, top: 320, width: 580, text: '07xxx xxx xxx\nhello@yourbrand.com', fontSize: 20, lineHeight: 1.6, fill: MUTED }),
      rect({ left: 400, top: 480, width: 180, height: 6, fill: p.accent }),
    );
  } else if (li === 1) {
    objects.push(
      photoCircle({ left: 120, top: h / 2, radius: 95, originX: 'center', originY: 'center' }),
      photoHint(50, 220, 140, 'Headshot'),
      tb({ left: 260, top: 160, width: 720, text: name, fontSize: 48, fill: INK, fontWeight: 'bold' }),
      tb({ left: 260, top: 240, width: 720, text: 'Photographer  ·  Designer', fontSize: 22, fill: p.accent }),
      tb({ left: 260, top: 360, width: 720, text: 'www.yourbrand.com', fontSize: 20, fill: MUTED }),
      rect({ left: 0, top: h - 16, width: w, height: 16, fill: p.accent, selectable: true }),
    );
  } else {
    objects.push(
      rect({ left: 0, top: 0, width: w, height: h, fill: linear(0, 0, w, h, [{ offset: 0, color: p.accent }, { offset: 1, color: p.accentDark }]) }),
      photoArea({ left: 40, top: 40, width: 280, height: h - 80, rx: 16, ry: 16, stroke: '#ffffff', strokeWidth: 4 }),
      photoHint(90, 240, 180, 'Portrait'),
      tb({ left: 360, top: 180, width: 620, text: name, fontSize: 46, fill: '#ffffff', fontWeight: 'bold' }),
      tb({ left: 360, top: 260, width: 620, text: 'Marketing Consultant', fontSize: 22, fill: '#fff7ed' }),
      tb({ left: 360, top: 380, width: 620, text: '07xxx xxx xxx  ·  hello@brand.com', fontSize: 20, fill: '#ffedd5' }),
    );
  }

  return {
    id: `photo-card-${pad(index + 1)}`,
    name: `${p.label} Photo Card ${index + 1}`,
    category: 'Picture Templates',
    description: `Business card with photo area — ${p.label.toLowerCase()}`,
    pages: [page(`photo-card-${pad(index + 1)}-p0`, w, h, { kind: 'solid', color: '#ffffff' }, scene(objects))],
  };
}

const HERO_TEMPLATES = [
  {
    id: 'photo-agency-portrait',
    name: 'Creative Agency (Portrait)',
    category: 'Picture Templates',
    description: 'A4 794×1123 — photo-led agency flyer like reference',
    pages: [page('photo-agency-portrait-p0', A4_W, A4_H, { kind: 'solid', color: '#ffffff' }, marketingAgencyPortrait())],
  },
  {
    id: 'photo-agency-landscape',
    name: 'Creative Agency (Landscape)',
    category: 'Picture Templates',
    description: 'A4 landscape 1123×794 — photo-led agency flyer',
    pages: [page('photo-agency-landscape-p0', A4_LAND_W, A4_LAND_H, { kind: 'solid', color: '#ffffff' }, marketingAgencyLandscape())],
  },
  ...PHOTO_PALETTES.slice(0, 4).map((palette, i) => ({
    id: `photo-agency-portrait-${palette.label.toLowerCase()}`,
    name: `Agency Flyer ${palette.label}`,
    category: 'Picture Templates',
    description: `A4 portrait — ${palette.label.toLowerCase()} photo agency layout`,
    pages: [
      page(
        `photo-agency-portrait-${palette.label.toLowerCase()}-p0`,
        A4_W,
        A4_H,
        { kind: 'solid', color: '#ffffff' },
        marketingAgencyPortrait(palette.accent, palette.accentDark),
      ),
    ],
  })),
  ...PHOTO_PALETTES.slice(0, 4).map((palette) => ({
    id: `photo-agency-landscape-${palette.label.toLowerCase()}`,
    name: `Agency Landscape ${palette.label}`,
    category: 'Picture Templates',
    description: `A4 landscape — ${palette.label.toLowerCase()} photo agency layout`,
    pages: [
      page(
        `photo-agency-landscape-${palette.label.toLowerCase()}-p0`,
        A4_LAND_W,
        A4_LAND_H,
        { kind: 'solid', color: '#ffffff' },
        marketingAgencyLandscape(palette.accent, palette.accentDark),
      ),
    ],
  })),
];

function generatePhotoCategory(buildFn, count) {
  const templates = [];
  for (let i = 0; i < count; i += 1) {
    const palette = PHOTO_PALETTES[i % PHOTO_PALETTES.length];
    templates.push(buildFn(i, palette, i));
  }
  return templates;
}

export const GENERATED_PHOTO_FLYERS = generatePhotoCategory(buildPhotoFlyer, 12);
export const GENERATED_PHOTO_POSTERS = generatePhotoCategory(buildPhotoPoster, 10);
export const GENERATED_PHOTO_LEAFLETS = generatePhotoCategory(buildPhotoLeaflet, 10);
export const GENERATED_PHOTO_CARDS = generatePhotoCategory(buildPhotoBusinessCard, 8);

export const PICTURE_BASED_TEMPLATES = [
  ...HERO_TEMPLATES,
  ...GENERATED_PHOTO_FLYERS,
  ...GENERATED_PHOTO_POSTERS,
  ...GENERATED_PHOTO_LEAFLETS,
  ...GENERATED_PHOTO_CARDS,
];
