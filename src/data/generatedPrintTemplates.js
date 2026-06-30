import {
  page,
  tb,
  rect,
  circle,
  triangle,
  linear,
  bg,
  decoration,
  scene,
  printFooter,
} from './templateSceneBuilders';

const BC_W = 1050;
const BC_H = 600;
const A4_W = 794;
const A4_H = 1123;
const A3_W = 1123;
const A3_H = 1587;

const PALETTES = [
  { id: 'ocean', label: 'Ocean', bg: '#0c4a6e', bg2: '#082f49', accent: '#38bdf8', text: '#f0f9ff', sub: '#7dd3fc', light: '#e0f2fe', dark: '#0f172a' },
  { id: 'sunset', label: 'Sunset', bg: '#9a3412', bg2: '#7c2d12', accent: '#fb923c', text: '#fff7ed', sub: '#fdba74', light: '#ffedd5', dark: '#431407' },
  { id: 'forest', label: 'Forest', bg: '#14532d', bg2: '#052e16', accent: '#4ade80', text: '#ecfdf5', sub: '#86efac', light: '#dcfce7', dark: '#14532d' },
  { id: 'royal', label: 'Royal', bg: '#4c1d95', bg2: '#2e1065', accent: '#c4b5fd', text: '#faf5ff', sub: '#ddd6fe', light: '#ede9fe', dark: '#1e1b4b' },
  { id: 'rose', label: 'Rose', bg: '#9f1239', bg2: '#881337', accent: '#fb7185', text: '#fff1f2', sub: '#fda4af', light: '#ffe4e6', dark: '#4c0519' },
  { id: 'slate', label: 'Slate', bg: '#1e293b', bg2: '#0f172a', accent: '#94a3b8', text: '#f8fafc', sub: '#cbd5e1', light: '#f1f5f9', dark: '#020617' },
  { id: 'gold', label: 'Gold', bg: '#292524', bg2: '#1c1917', accent: '#d4af37', text: '#fafaf9', sub: '#d6d3d1', light: '#fafaf9', dark: '#1c1917' },
  { id: 'mint', label: 'Mint', bg: '#134e4a', bg2: '#042f2e', accent: '#5eead4', text: '#f0fdfa', sub: '#99f6e4', light: '#ccfbf1', dark: '#042f2e' },
  { id: 'coral', label: 'Coral', bg: '#be123c', bg2: '#9f1239', accent: '#fda4af', text: '#fff1f2', sub: '#fecdd3', light: '#ffe4e6', dark: '#881337' },
  { id: 'sky', label: 'Sky', bg: '#1d4ed8', bg2: '#1e3a8a', accent: '#93c5fd', text: '#eff6ff', sub: '#bfdbfe', light: '#dbeafe', dark: '#172554' },
];

const INDUSTRIES = [
  'Studio', 'Bistro', 'Clinic', 'Atelier', 'Collective', 'Partners', 'Works', 'House', 'Group', 'Co.',
  'Labs', 'Bureau', 'Guild', 'Archive', 'Foundry', 'Mercantile', 'Exchange', 'Workshop', 'Gallery', 'Press',
  'Agency', 'Consulting', 'Design', 'Digital', 'Wellness', 'Legal', 'Finance', 'Property', 'Travel', 'Events',
  'Fitness', 'Bakery', 'Florist', 'Photography', 'Architecture', 'Education', 'Charity', 'Retail', 'Tech', 'Craft',
  'Salon', 'Spa', 'Catering', 'Logistics', 'Security', 'Media', 'Music', 'Fashion', 'Automotive', 'Energy',
];

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Harper',
  'Ellis', 'Rowan', 'Sage', 'Blake', 'Drew', 'Finley', 'Hayden', 'Jamie', 'Kai', 'Logan',
  'Noah', 'Olivia', 'Emma', 'Liam', 'Sophia', 'Mason', 'Isla', 'Ethan', 'Mia', 'Lucas',
  'Amelia', 'Henry', 'Charlotte', 'Jack', 'Grace', 'Leo', 'Ella', 'Oscar', 'Freya', 'Arthur',
  'Zara', 'Nadia', 'Priya', 'Omar', 'Yuki', 'Marco', 'Elena', 'Hassan', 'Ines', 'Felix',
];

const ROLES = [
  'Director', 'Founder', 'Designer', 'Consultant', 'Manager', 'Strategist', 'Creative Lead', 'Partner',
  'Photographer', 'Architect', 'Chef', 'Therapist', 'Advisor', 'Producer', 'Engineer', 'Marketer',
  'Coordinator', 'Specialist', 'Analyst', 'Developer', 'Curator', 'Stylist', 'Trainer', 'Agent',
  'Editor', 'Planner', 'Coach', 'Barista', 'Florist', 'Solicitor',
];

const pad = (n) => String(n).padStart(2, '0');

function buildBusinessCard(id, index, palette, layoutIndex) {
  const w = BC_W;
  const h = BC_H;
  const industry = INDUSTRIES[index % INDUSTRIES.length];
  const name = `${FIRST_NAMES[index % FIRST_NAMES.length]} ${['Reed', 'Shaw', 'Cole', 'Lane', 'West', 'North', 'Brooks', 'Hayes', 'Grant', 'Pierce'][index % 10]}`;
  const role = ROLES[index % ROLES.length];
  const brand = `${industry.toUpperCase()} ${['CO.', 'LTD', 'STUDIO', 'GROUP', ''][index % 5]}`.trim();
  const p = palette;
  const li = layoutIndex % 10;
  const objects = [];

  if (li === 0) {
    objects.push(
      bg(w, h, '#ffffff'),
      rect({ left: 0, top: 0, width: 340, height: h, fill: linear(0, 0, 340, h, [{ offset: 0, color: p.bg }, { offset: 1, color: p.bg2 }]), selectable: true }),
      decoration(circle({ left: 120, top: 210, radius: 88, fill: p.accent, opacity: 0.22 })),
      tb({ left: 50, top: 230, width: 240, text: name.split(' ').map((x) => x[0]).join(''), fontSize: 72, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 390, top: 120, width: 600, text: name, fontSize: 52, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 390, top: 195, width: 600, text: role, fontSize: 24, fill: p.bg, charSpacing: 80 }),
      tb({ left: 390, top: 300, width: 580, text: `hello@${industry.toLowerCase().replace(/\s/g, '')}.com\n07xxx xxx xxx\nwww.${industry.toLowerCase().replace(/\s/g, '')}.co.uk`, fontSize: 22, lineHeight: 1.65, fill: p.dark }),
    );
  } else if (li === 1) {
    objects.push(
      rect({ left: 0, top: 0, width: w, height: 130, fill: p.bg, selectable: true }),
      tb({ left: 60, top: 38, width: w - 120, text: brand, fontSize: 38, fill: p.text, fontWeight: 'bold', textAlign: 'center', charSpacing: 60 }),
      tb({ left: 60, top: 200, width: w - 120, text: name, fontSize: 56, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 280, width: w - 120, text: role, fontSize: 24, fill: p.bg, textAlign: 'center' }),
      rect({ left: 420, top: 360, width: 210, height: 4, fill: p.accent }),
      tb({ left: 60, top: 400, width: w - 120, text: '07xxx xxx xxx  ·  hello@yourbrand.com', fontSize: 22, fill: p.dark, textAlign: 'center' }),
    );
  } else if (li === 2) {
    objects.push(
      bg(w, h, linear(0, 0, w, h, [{ offset: 0, color: p.bg }, { offset: 1, color: p.bg2 }])),
      decoration(circle({ left: 820, top: -80, radius: 200, fill: p.accent, opacity: 0.18 })),
      tb({ left: 70, top: 140, width: 700, text: name, fontSize: 58, fill: p.text, fontWeight: 'bold' }),
      tb({ left: 70, top: 220, width: 700, text: role.toUpperCase(), fontSize: 22, fill: p.accent, charSpacing: 140 }),
      tb({ left: 70, top: 340, width: 500, text: `+44 7xxx xxx xxx\nhello@${industry.toLowerCase()}.co.uk`, fontSize: 22, lineHeight: 1.7, fill: p.sub }),
      rect({ left: 0, top: h - 18, width: w, height: 18, fill: p.accent, selectable: true }),
    );
  } else if (li === 3) {
    objects.push(
      rect({ left: 40, top: 40, width: w - 80, height: h - 80, fill: '#ffffff', stroke: p.accent, strokeWidth: 3, rx: 16, ry: 16, selectable: true }),
      tb({ left: 100, top: 120, width: w - 200, text: brand, fontSize: 28, fill: p.bg, fontWeight: 'bold', textAlign: 'center', charSpacing: 100 }),
      tb({ left: 100, top: 200, width: w - 200, text: name, fontSize: 50, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 100, top: 280, width: w - 200, text: role, fontSize: 22, fill: p.bg, textAlign: 'center' }),
      tb({ left: 100, top: 380, width: w - 200, text: 'www.yourbrand.com', fontSize: 20, fill: '#64748b', textAlign: 'center' }),
    );
  } else if (li === 4) {
    objects.push(
      triangle({ left: 0, top: 0, width: 420, height: h, fill: p.bg, selectable: true }),
      tb({ left: 460, top: 150, width: 520, text: name, fontSize: 48, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 460, top: 220, width: 520, text: role, fontSize: 22, fill: p.bg }),
      tb({ left: 40, top: 250, width: 340, text: brand.slice(0, 12), fontSize: 32, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 460, top: 360, width: 520, text: '07xxx xxx xxx  ·  info@yourbrand.com', fontSize: 20, fill: '#475569' }),
    );
  } else if (li === 5) {
    objects.push(
      circle({ left: 70, top: 150, radius: 110, fill: p.bg, selectable: true }),
      tb({ left: 70, top: 195, width: 220, text: name[0], fontSize: 90, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 320, top: 160, width: 650, text: name, fontSize: 46, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 320, top: 230, width: 650, text: `${role} · ${industry}`, fontSize: 22, fill: p.bg }),
      rect({ left: 320, top: 300, width: 120, height: 4, fill: p.accent }),
      tb({ left: 320, top: 340, width: 650, text: 'hello@yourbrand.com\n07xxx xxx xxx', fontSize: 20, lineHeight: 1.6, fill: '#334155' }),
    );
  } else if (li === 6) {
    objects.push(
      rect({ left: w - 280, top: 0, width: 280, height: h, fill: linear(0, 0, 280, h, [{ offset: 0, color: p.accent }, { offset: 1, color: p.bg }]), selectable: true }),
      tb({ left: 60, top: 100, width: 680, text: name, fontSize: 54, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 60, top: 180, width: 680, text: role, fontSize: 24, fill: p.bg }),
      tb({ left: 60, top: 300, width: 680, text: brand, fontSize: 30, fill: p.accent, fontWeight: 'bold' }),
      tb({ left: 60, top: 400, width: 680, text: '07xxx xxx xxx\nwww.yourbrand.com', fontSize: 20, lineHeight: 1.6, fill: '#475569' }),
    );
  } else if (li === 7) {
    objects.push(
      rect({ left: 0, top: 0, width: 12, height: h, fill: p.accent, selectable: true }),
      tb({ left: 50, top: 80, width: 500, text: name, fontSize: 50, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 50, top: 155, width: 500, text: role, fontSize: 22, fill: p.bg }),
      tb({ left: 50, top: 240, width: 500, text: industry, fontSize: 28, fill: p.accent, fontWeight: 'bold' }),
      tb({ left: 600, top: 120, width: 400, text: 'T  07xxx xxx xxx\nE  hello@brand.com\nW  yourbrand.com', fontSize: 20, lineHeight: 1.8, fill: '#334155', textAlign: 'right' }),
      decoration(rect({ left: 600, top: 380, width: 380, height: 160, fill: p.light, rx: 12, ry: 12 })),
    );
  } else if (li === 8) {
    objects.push(
      rect({ left: 0, top: 0, width: w, height: h / 2, fill: p.bg, selectable: true }),
      tb({ left: 60, top: 70, width: w - 120, text: brand, fontSize: 36, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 340, width: w - 120, text: name, fontSize: 48, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 410, width: w - 120, text: `${role}  ·  07xxx xxx xxx`, fontSize: 20, fill: p.bg, textAlign: 'center' }),
    );
  } else {
    objects.push(
      decoration(circle({ left: -60, top: -60, radius: 180, fill: p.accent, opacity: 0.25 })),
      decoration(circle({ left: 780, top: 380, radius: 160, fill: p.bg, opacity: 0.15 })),
      tb({ left: 80, top: 160, width: 890, text: name, fontSize: 60, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 80, top: 240, width: 890, text: role, fontSize: 24, fill: p.bg, textAlign: 'center', charSpacing: 120 }),
      rect({ left: 400, top: 310, width: 250, height: 3, fill: p.accent }),
      tb({ left: 80, top: 360, width: 890, text: `${industry}  ·  hello@yourbrand.com  ·  07xxx xxx xxx`, fontSize: 20, fill: '#475569', textAlign: 'center' }),
    );
  }

  return {
    id: `gen-card-${pad(index + 1)}`,
    name: `${palette.label} ${industry} Card`,
    category: 'Business Cards',
    description: `${BC_W}×${BC_H} — ${palette.label.toLowerCase()} ${industry.toLowerCase()} business card`,
    pages: [page(`gen-card-${pad(index + 1)}-p0`, BC_W, BC_H, { kind: 'solid', color: p.light }, scene(objects))],
  };
}

function buildFlyer(id, index, palette, layoutIndex) {
  const w = A4_W;
  const h = A4_H;
  const p = palette;
  const li = layoutIndex % 10;
  const topic = ['Open Day', 'Grand Opening', 'Summer Sale', 'Workshop', 'Open Mic', 'Food Festival', 'Job Fair', 'Wellness Week', 'Art Walk', 'Charity Run'][index % 10];
  const objects = [];

  if (li === 0) {
    objects.push(
      bg(w, h, linear(0, 0, w, h, [{ offset: 0, color: p.bg }, { offset: 1, color: p.bg2 }])),
      decoration(circle({ left: 520, top: -100, radius: 240, fill: p.accent, opacity: 0.35 })),
      tb({ left: 60, top: 120, width: 674, text: topic.toUpperCase(), fontSize: 34, fill: p.sub, fontWeight: 'bold', charSpacing: 180 }),
      tb({ left: 60, top: 200, width: 674, text: `${INDUSTRIES[index % INDUSTRIES.length]}\nInvites You`, fontSize: 88, lineHeight: 1.02, fill: p.text, fontWeight: 'bold' }),
      tb({ left: 60, top: 520, width: 674, text: 'Saturday 15 June  ·  10am – 6pm  ·  City Centre', fontSize: 28, fill: p.sub }),
      rect({ left: 60, top: 900, width: 320, height: 88, fill: p.accent, rx: 44, ry: 44, selectable: true }),
      tb({ left: 60, top: 924, width: 320, text: 'Learn More', fontSize: 32, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      printFooter(w, 'www.yourbrand.com  ·  07xxx xxx xxx', p.sub),
    );
  } else if (li === 1) {
    objects.push(
      bg(w, h, p.light),
      rect({ left: 0, top: 0, width: w, height: 460, fill: p.bg, selectable: true }),
      tb({ left: 60, top: 180, width: 674, text: 'Your headline here', fontSize: 40, fill: p.sub, textAlign: 'center' }),
      tb({ left: 60, top: 520, width: 674, text: topic, fontSize: 64, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 60, top: 620, width: 674, text: 'Add details about your event, offer, or announcement. Keep it clear and compelling for passers-by.', fontSize: 26, lineHeight: 1.5, fill: '#334155' }),
      printFooter(w, 'Contact: hello@yourbrand.com'),
    );
  } else if (li === 2) {
    objects.push(
      bg(w, h, p.bg2),
      circle({ left: 220, top: 280, radius: 200, fill: p.accent, selectable: true }),
      tb({ left: 220, top: 350, width: 400, text: '30%', fontSize: 120, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 120, width: 674, text: 'LIMITED OFFER', fontSize: 42, fill: p.text, fontWeight: 'bold', textAlign: 'center', charSpacing: 100 }),
      tb({ left: 60, top: 720, width: 674, text: 'This weekend only — selected items across the store', fontSize: 28, fill: p.sub, textAlign: 'center' }),
      printFooter(w, 'Terms apply  ·  yourbrand.com'),
    );
  } else if (li === 3) {
    objects.push(
      bg(w, h, linear(180, 0, 600, h, [{ offset: 0, color: p.light }, { offset: 1, color: p.sub }])),
      rect({ left: 0, top: 0, width: w, height: 200, fill: p.bg, selectable: true }),
      tb({ left: 60, top: 60, width: 674, text: 'SAVE THE DATE', fontSize: 36, fill: p.text, fontWeight: 'bold', textAlign: 'center', charSpacing: 80 }),
      tb({ left: 60, top: 280, width: 674, text: '24\nAUG', fontSize: 140, lineHeight: 0.9, fill: p.bg, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 560, width: 674, text: topic, fontSize: 48, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 680, width: 674, text: 'Doors 7pm  ·  Tickets from £12', fontSize: 28, fill: p.bg, textAlign: 'center' }),
    );
  } else if (li === 4) {
    objects.push(
      bg(w, h, '#ffffff'),
      rect({ left: 0, top: 0, width: 220, height: h, fill: p.bg, selectable: true }),
      tb({ left: 30, top: 200, width: 160, text: 'SERVICES', fontSize: 28, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 260, top: 100, width: 500, text: INDUSTRIES[index % INDUSTRIES.length], fontSize: 52, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 260, top: 200, width: 500, text: '✓  Consultation\n✓  Design & planning\n✓  Delivery & support\n✓  Ongoing maintenance', fontSize: 28, lineHeight: 1.8, fill: '#334155' }),
      rect({ left: 260, top: 880, width: 280, height: 72, fill: p.accent, rx: 12, ry: 12, selectable: true }),
      tb({ left: 260, top: 900, width: 280, text: 'Book now', fontSize: 28, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
    );
  } else if (li === 5) {
    objects.push(
      bg(w, h, p.light),
      rect({ left: 60, top: 80, width: 300, height: 280, fill: p.sub, rx: 12, ry: 12, selectable: true }),
      rect({ left: 400, top: 80, width: 334, height: 280, fill: p.bg, rx: 12, ry: 12, selectable: true }),
      rect({ left: 60, top: 400, width: 674, height: 280, fill: p.accent, rx: 12, ry: 12, selectable: true }),
      tb({ left: 60, top: 740, width: 674, text: topic, fontSize: 56, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 840, width: 674, text: 'Photo areas — replace with your images', fontSize: 24, fill: p.bg, textAlign: 'center' }),
    );
  } else if (li === 6) {
    objects.push(
      bg(w, h, '#ffffff'),
      rect({ left: 0, top: 0, width: 14, height: h, fill: p.accent, selectable: true }),
      tb({ left: 60, top: 100, width: 674, text: 'Introducing', fontSize: 32, fill: p.bg }),
      tb({ left: 60, top: 160, width: 674, text: `${INDUSTRIES[index % INDUSTRIES.length]} ${topic}`, fontSize: 64, lineHeight: 1.05, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 60, top: 400, width: 674, text: 'A fresh approach for customers who value quality, clarity, and craft.', fontSize: 28, lineHeight: 1.45, fill: '#475569' }),
      printFooter(w, 'hello@yourbrand.com'),
    );
  } else if (li === 7) {
    objects.push(
      bg(w, h, p.light),
      tb({ left: 60, top: 200, width: 674, text: topic, fontSize: 96, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      rect({ left: 280, top: 420, width: 234, height: 6, fill: p.accent }),
      tb({ left: 100, top: 480, width: 594, text: 'Minimal, elegant flyer layout with room for one strong message.', fontSize: 30, lineHeight: 1.4, fill: '#64748b', textAlign: 'center' }),
    );
  } else if (li === 8) {
    objects.push(
      bg(w, h, linear(0, 0, w, h, [{ offset: 0, color: p.accent }, { offset: 0.5, color: p.bg }, { offset: 1, color: p.bg2 }])),
      tb({ left: 60, top: 180, width: 674, text: 'PARTY\nNIGHT', fontSize: 110, lineHeight: 0.95, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 520, width: 674, text: 'DJ  ·  Live acts  ·  Late bar', fontSize: 32, fill: p.sub, textAlign: 'center' }),
      tb({ left: 60, top: 900, width: 674, text: 'FRI 9PM  ·  £5 ENTRY', fontSize: 36, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
    );
  } else {
    objects.push(
      bg(w, h, '#ffffff'),
      rect({ left: 0, top: 0, width: w, height: 120, fill: p.bg, selectable: true }),
      tb({ left: 60, top: 38, width: 674, text: INDUSTRIES[index % INDUSTRIES.length].toUpperCase(), fontSize: 36, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 200, width: 674, text: topic, fontSize: 52, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 60, top: 300, width: 674, text: 'Professional flyer with clean hierarchy and generous whitespace.', fontSize: 26, lineHeight: 1.5, fill: '#475569' }),
      rect({ left: 60, top: 500, width: 674, height: 300, fill: p.light, rx: 16, ry: 16, selectable: true }),
      printFooter(w, '07xxx xxx xxx  ·  www.yourbrand.com'),
    );
  }

  return {
    id: `gen-flyer-${pad(index + 1)}`,
    name: `${palette.label} ${topic} Flyer`,
    category: 'Flyers',
    description: `A4 ${w}×${h} — ${palette.label.toLowerCase()} ${topic.toLowerCase()} flyer`,
    pages: [page(`gen-flyer-${pad(index + 1)}-p0`, w, h, { kind: 'solid', color: p.light }, scene(objects))],
  };
}

function buildLeaflet(id, index, palette, layoutIndex) {
  const w = A4_W;
  const h = A4_H;
  const p = palette;
  const li = layoutIndex % 10;
  const headline = ['Your Trusted Partner', 'Discover More', 'Expert Care', 'Quality You Can See', 'Built For Growth', 'Welcome Home', 'Fresh Ideas', 'Local & Proud', 'Premium Service', 'Start Today'][index % 10];
  const objects = [];

  if (li === 0) {
    objects.push(
      bg(w, h, linear(0, 0, w, h, [{ offset: 0, color: p.bg }, { offset: 1, color: p.bg2 }])),
      rect({ left: 0, top: 0, width: w, height: 400, fill: '#334155', selectable: true }),
      tb({ left: 60, top: 180, width: 674, text: 'Property image area', fontSize: 28, fill: '#94a3b8', textAlign: 'center' }),
      tb({ left: 60, top: 460, width: 674, text: headline, fontSize: 52, fill: p.text, fontWeight: 'bold' }),
      tb({ left: 60, top: 560, width: 674, text: '3 bedrooms  ·  2 bathrooms  ·  Garden  ·  £425,000', fontSize: 26, fill: p.sub }),
      tb({ left: 60, top: 700, width: 674, text: 'Arrange a viewing today. Flexible appointments available seven days a week.', fontSize: 24, lineHeight: 1.5, fill: p.light }),
      printFooter(w, 'Estate Agents  ·  07xxx xxx xxx', p.sub),
    );
  } else if (li === 1) {
    objects.push(
      bg(w, h, '#ffffff'),
      rect({ left: 0, top: 0, width: w, height: 160, fill: p.bg, selectable: true }),
      tb({ left: 60, top: 50, width: 674, text: INDUSTRIES[index % INDUSTRIES.length].toUpperCase(), fontSize: 40, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 200, width: 674, text: headline, fontSize: 44, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      rect({ left: 60, top: 320, width: 200, height: 320, fill: p.light, rx: 12, ry: 12, selectable: true }),
      rect({ left: 297, top: 320, width: 200, height: 320, fill: p.light, rx: 12, ry: 12, selectable: true }),
      rect({ left: 534, top: 320, width: 200, height: 320, fill: p.light, rx: 12, ry: 12, selectable: true }),
      tb({ left: 70, top: 360, width: 180, text: 'Strategy', fontSize: 24, fill: p.bg, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 307, top: 360, width: 180, text: 'Design', fontSize: 24, fill: p.bg, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 544, top: 360, width: 180, text: 'Support', fontSize: 24, fill: p.bg, fontWeight: 'bold', textAlign: 'center' }),
      printFooter(w, 'www.yourcompany.com'),
    );
  } else if (li === 2) {
    objects.push(
      bg(w, h, p.light),
      rect({ left: 0, top: 0, width: w, height: 240, fill: p.bg, selectable: true }),
      tb({ left: 60, top: 80, width: 674, text: 'OUR MENU', fontSize: 64, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 300, width: 400, text: 'Starters  ·  Mains  ·  Desserts', fontSize: 28, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 60, top: 380, width: 500, text: 'Soup of the day  ·············  £5.50\nChef special  ·················  £14.00\nSeasonal salad  ·············  £8.50', fontSize: 24, lineHeight: 1.9, fill: '#334155' }),
      printFooter(w, 'Reservations: 07xxx xxx xxx'),
    );
  } else if (li === 3) {
    objects.push(
      bg(w, h, linear(0, 0, w, 0, [{ offset: 0, color: p.light }, { offset: 1, color: '#ffffff' }])),
      circle({ left: 520, top: 60, radius: 120, fill: p.accent, opacity: 0.35, selectable: true }),
      tb({ left: 60, top: 120, width: 674, text: 'Caring for you', fontSize: 56, fill: p.bg, fontWeight: 'bold' }),
      tb({ left: 60, top: 220, width: 674, text: 'GP appointments  ·  Dental  ·  Physio  ·  Pharmacy', fontSize: 26, fill: p.dark }),
      rect({ left: 60, top: 360, width: 674, height: 280, fill: '#ffffff', rx: 16, ry: 16, stroke: p.sub, strokeWidth: 2, selectable: true }),
      tb({ left: 90, top: 420, width: 614, text: 'Same-week appointments available.\nFriendly team. Modern facilities.', fontSize: 28, lineHeight: 1.5, fill: '#334155', textAlign: 'center' }),
    );
  } else if (li === 4) {
    objects.push(
      bg(w, h, '#ffffff'),
      rect({ left: 0, top: 0, width: 180, height: h, fill: p.bg, selectable: true }),
      tb({ left: 220, top: 100, width: 520, text: 'Enrol now', fontSize: 48, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 220, top: 200, width: 520, text: 'Courses starting September\nFlexible study options\nExpert tutors', fontSize: 26, lineHeight: 1.7, fill: '#334155' }),
      tb({ left: 30, top: 400, width: 120, text: 'EDU', fontSize: 48, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
    );
  } else if (li === 5) {
    objects.push(
      bg(w, h, p.bg2),
      tb({ left: 60, top: 140, width: 674, text: 'Together we can', fontSize: 48, fill: p.sub, textAlign: 'center' }),
      tb({ left: 60, top: 220, width: 674, text: 'make a\ndifference', fontSize: 96, lineHeight: 1, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 100, top: 520, width: 594, text: 'Your donation supports local families with food, shelter, and advice.', fontSize: 28, lineHeight: 1.45, fill: p.light, textAlign: 'center' }),
      rect({ left: 247, top: 760, width: 300, height: 80, fill: p.accent, rx: 40, ry: 40, selectable: true }),
      tb({ left: 247, top: 784, width: 300, text: 'Donate', fontSize: 32, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
    );
  } else if (li === 6) {
    objects.push(
      bg(w, h, p.light),
      tb({ left: 60, top: 80, width: 674, text: 'NEW COLLECTION', fontSize: 36, fill: p.bg, fontWeight: 'bold', charSpacing: 80 }),
      rect({ left: 60, top: 160, width: 674, height: 420, fill: p.sub, rx: 16, ry: 16, selectable: true }),
      tb({ left: 60, top: 620, width: 674, text: headline, fontSize: 48, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 60, top: 700, width: 674, text: 'Crafted materials. Thoughtful details. Available in store now.', fontSize: 26, fill: '#475569' }),
    );
  } else if (li === 7) {
    objects.push(
      bg(w, h, '#ffffff'),
      rect({ left: 0, top: 0, width: 264, height: h, fill: p.light, selectable: true }),
      rect({ left: 265, top: 0, width: 264, height: h, fill: p.sub, selectable: true }),
      rect({ left: 530, top: 0, width: 264, height: h, fill: p.accent, selectable: true }),
      tb({ left: 20, top: 120, width: 224, text: 'Who we are', fontSize: 26, fill: p.bg, fontWeight: 'bold' }),
      tb({ left: 285, top: 120, width: 224, text: 'What we do', fontSize: 26, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 550, top: 120, width: 224, text: 'Contact', fontSize: 26, fill: p.dark, fontWeight: 'bold' }),
      tb({ left: 20, top: 200, width: 224, text: 'Local team.\nTrusted since 2010.', fontSize: 20, lineHeight: 1.5, fill: '#334155' }),
      tb({ left: 285, top: 200, width: 224, text: 'Services tailored to you.', fontSize: 20, lineHeight: 1.5, fill: '#334155' }),
      tb({ left: 550, top: 200, width: 224, text: '07xxx xxx xxx\nhello@brand.com', fontSize: 20, lineHeight: 1.5, fill: '#334155' }),
    );
  } else if (li === 8) {
    objects.push(
      bg(w, h, linear(0, h, w, 0, [{ offset: 0, color: p.bg }, { offset: 1, color: p.bg2 }])),
      tb({ left: 60, top: 160, width: 674, text: 'Explore\n' + (['Paris', 'Rome', 'Lisbon', 'Tokyo', 'NYC'][index % 5]), fontSize: 88, lineHeight: 1, fill: p.text, fontWeight: 'bold' }),
      tb({ left: 60, top: 420, width: 674, text: 'Flights + hotel packages from £499', fontSize: 32, fill: p.sub }),
      printFooter(w, 'Travel with confidence  ·  ATOL protected', p.sub),
    );
  } else {
    objects.push(
      bg(w, h, '#ffffff'),
      rect({ left: 0, top: 0, width: w, height: 300, fill: p.accent, selectable: true }),
      tb({ left: 60, top: 100, width: 674, text: 'MEGA PROMO', fontSize: 64, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 360, width: 674, text: headline, fontSize: 44, fill: p.bg, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 60, top: 500, width: 674, text: 'Visit us in store or shop online for exclusive deals this season.', fontSize: 26, lineHeight: 1.5, fill: '#334155', textAlign: 'center' }),
      printFooter(w, 'www.yourbrand.com'),
    );
  }

  return {
    id: `gen-leaflet-${pad(index + 1)}`,
    name: `${palette.label} ${headline.split(' ')[0]} Leaflet`,
    category: 'Leaflets & Brochures',
    description: `A4 ${w}×${h} — ${palette.label.toLowerCase()} leaflet layout`,
    pages: [page(`gen-leaflet-${pad(index + 1)}-p0`, w, h, { kind: 'solid', color: p.light }, scene(objects))],
  };
}

function buildPoster(id, index, palette, layoutIndex) {
  const w = A3_W;
  const h = A3_H;
  const p = palette;
  const li = layoutIndex % 10;
  const event = ['LIVE MUSIC', 'FILM NIGHT', 'MARATHON', 'EXHIBITION', 'NOW HIRING', 'BIG SALE', 'INSPIRE', 'MASTERCLASS', 'STREET FAIR', 'GALA'][index % 10];
  const objects = [];

  if (li === 0) {
    objects.push(
      bg(w, h, p.bg2),
      decoration(circle({ left: 700, top: -120, radius: 320, fill: p.accent, opacity: 0.28 })),
      tb({ left: 80, top: 280, width: w - 160, text: event, fontSize: 120, fill: p.text, fontWeight: 'bold', textAlign: 'center', charSpacing: 40 }),
      tb({ left: 80, top: 520, width: w - 160, text: INDUSTRIES[index % INDUSTRIES.length].toUpperCase(), fontSize: 42, fill: p.sub, textAlign: 'center', charSpacing: 120 }),
      tb({ left: 80, top: 1200, width: w - 160, text: 'SAT 7 SEPT  ·  7PM  ·  CITY HALL', fontSize: 36, fill: p.light, textAlign: 'center', fontWeight: 'bold' }),
    );
  } else if (li === 1) {
    objects.push(
      bg(w, h, linear(0, 0, w, h, [{ offset: 0, color: p.bg }, { offset: 1, color: '#000000' }])),
      tb({ left: 80, top: 200, width: w - 160, text: 'TONIGHT', fontSize: 80, fill: p.accent, fontWeight: 'bold', textAlign: 'center', charSpacing: 200 }),
      tb({ left: 80, top: 420, width: w - 160, text: event.replace(' ', '\n'), fontSize: 140, lineHeight: 0.95, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 80, top: 1100, width: w - 160, text: 'Tickets at the door  ·  £15', fontSize: 40, fill: p.sub, textAlign: 'center' }),
    );
  } else if (li === 2) {
    objects.push(
      rect({ left: 80, top: 120, width: w - 160, height: 700, fill: '#1e293b', selectable: true }),
      tb({ left: 120, top: 420, width: w - 240, text: 'Movie poster image', fontSize: 36, fill: '#94a3b8', textAlign: 'center' }),
      tb({ left: 80, top: 900, width: w - 160, text: event, fontSize: 72, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 80, top: 1050, width: w - 160, text: 'Doors 6:30pm  ·  Screen 2', fontSize: 32, fill: p.sub, textAlign: 'center' }),
    );
  } else if (li === 3) {
    objects.push(
      tb({ left: 80, top: 180, width: w - 160, text: '10K', fontSize: 200, fill: p.accent, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 80, top: 450, width: w - 160, text: 'CHALLENGE', fontSize: 64, fill: p.text, fontWeight: 'bold', textAlign: 'center', charSpacing: 80 }),
      tb({ left: 80, top: 600, width: w - 160, text: 'Register now — all abilities welcome', fontSize: 32, fill: p.sub, textAlign: 'center' }),
      rect({ left: 280, top: 1100, width: 560, height: 100, fill: p.accent, rx: 50, ry: 50, selectable: true }),
      tb({ left: 280, top: 1128, width: 560, text: 'Sign up', fontSize: 40, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
    );
  } else if (li === 4) {
    objects.push(
      bg(w, h, p.light),
      rect({ left: 0, top: 0, width: w, height: 240, fill: p.bg, selectable: true }),
      tb({ left: 80, top: 400, width: w - 160, text: event, fontSize: 88, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 80, top: 600, width: w - 160, text: 'Open roles across design, ops & customer success', fontSize: 30, fill: '#334155', textAlign: 'center' }),
      tb({ left: 80, top: 1200, width: w - 160, text: 'careers@yourcompany.com', fontSize: 36, fill: p.bg, fontWeight: 'bold', textAlign: 'center' }),
    );
  } else if (li === 5) {
    objects.push(
      circle({ left: 280, top: 320, radius: 260, fill: p.accent, selectable: true }),
      tb({ left: 280, top: 430, width: 520, text: '50%', fontSize: 160, fill: p.dark, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 80, top: 140, width: w - 160, text: 'OFF EVERYTHING', fontSize: 48, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 80, top: 1100, width: w - 160, text: 'This weekend only', fontSize: 40, fill: p.sub, textAlign: 'center' }),
    );
  } else if (li === 6) {
    objects.push(
      tb({ left: 100, top: 350, width: w - 200, text: '“Design is intelligence\nmade visible.”', fontSize: 64, lineHeight: 1.2, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      rect({ left: 400, top: 700, width: 320, height: 8, fill: p.accent }),
      tb({ left: 100, top: 780, width: w - 200, text: 'Annual creative conference', fontSize: 32, fill: p.sub, textAlign: 'center' }),
    );
  } else if (li === 7) {
    objects.push(
      rect({ left: 80, top: 100, width: w - 160, height: 500, fill: p.bg, rx: 20, ry: 20, selectable: true }),
      tb({ left: 120, top: 300, width: w - 240, text: 'WORKSHOP', fontSize: 56, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 80, top: 700, width: w - 160, text: 'Hands-on session for beginners', fontSize: 40, fill: p.light, textAlign: 'center' }),
      tb({ left: 80, top: 1100, width: w - 160, text: 'Book: hello@studio.com', fontSize: 32, fill: p.accent, textAlign: 'center' }),
    );
  } else if (li === 8) {
    objects.push(
      bg(w, h, linear(45, 0, w, h, [{ offset: 0, color: p.accent }, { offset: 0.4, color: p.bg }, { offset: 1, color: p.bg2 }])),
      tb({ left: 80, top: 250, width: w - 160, text: 'COMMUNITY\n' + event.split(' ')[0], fontSize: 100, lineHeight: 1, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 80, top: 1050, width: w - 160, text: 'Free entry  ·  Family friendly  ·  Local vendors', fontSize: 30, fill: p.light, textAlign: 'center' }),
    );
  } else {
    objects.push(
      rect({ left: 0, top: 0, width: w, height: h, fill: linear(0, 0, w, h, [{ offset: 0, color: p.bg }, { offset: 1, color: p.bg2 }]) }),
      decoration(circle({ left: -80, top: 1000, radius: 280, fill: p.accent, opacity: 0.2 })),
      tb({ left: 80, top: 300, width: w - 160, text: 'GALA\nEVENING', fontSize: 120, lineHeight: 1, fill: p.text, fontWeight: 'bold', textAlign: 'center' }),
      tb({ left: 80, top: 650, width: w - 160, text: 'Black tie optional  ·  Charity auction', fontSize: 32, fill: p.sub, textAlign: 'center' }),
      tb({ left: 80, top: 1250, width: w - 160, text: 'Friday 18 October', fontSize: 40, fill: p.light, fontWeight: 'bold', textAlign: 'center' }),
    );
  }

  return {
    id: `gen-poster-${pad(index + 1)}`,
    name: `${palette.label} ${event} Poster`,
    category: 'Posters',
    description: `A3 ${w}×${h} — ${palette.label.toLowerCase()} poster design`,
    pages: [page(`gen-poster-${pad(index + 1)}-p0`, w, h, { kind: 'solid', color: p.bg2 }, scene(objects))],
  };
}

function generateCategory(buildFn, count = 50) {
  const templates = [];
  for (let i = 0; i < count; i += 1) {
    const palette = PALETTES[i % PALETTES.length];
    const layoutIndex = Math.floor(i / PALETTES.length) + (i % 5);
    templates.push(buildFn(`gen-${i}`, i, palette, layoutIndex));
  }
  return templates;
}

export const GENERATED_BUSINESS_CARD_TEMPLATES = generateCategory(buildBusinessCard, 50);
export const GENERATED_FLYER_TEMPLATES = generateCategory(buildFlyer, 50);
export const GENERATED_LEAFLET_TEMPLATES = generateCategory(buildLeaflet, 50);
export const GENERATED_POSTER_TEMPLATES = generateCategory(buildPoster, 50);

export const GENERATED_PRINT_TEMPLATES = [
  ...GENERATED_BUSINESS_CARD_TEMPLATES,
  ...GENERATED_FLYER_TEMPLATES,
  ...GENERATED_LEAFLET_TEMPLATES,
  ...GENERATED_POSTER_TEMPLATES,
];
