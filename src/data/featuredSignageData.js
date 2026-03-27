const withBase = (relativePath) => `${import.meta.env.BASE_URL}${relativePath}`;

const toAssetPath = (folderName, fileName) =>
  withBase(`${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`);

export const featuredSignageItems = [
  {
    id: '3d-built-up-letters',
    title: '3D Built-up Letters',
    categorySlug: '3d-built-up-letters',
    route: '/featured/3d-built-up-letters',
    folderName: '3D Lettering',
    description: 'Premium dimensional lettering with standout visual impact.',
    heading: '3D Built-up Letters',
    blurb:
      'Precision-built dimensional lettering for storefronts and commercial facades with premium finish and long-term durability.',
    longDescription:
      'Our 3D built-up letters are engineered for businesses that need a bold, premium identity on the street. We offer custom depth, face materials, and illumination options to match your brand style while ensuring excellent readability in both day and night conditions.',
    details:
      'From concept and fabrication to final fitment, each sign is produced with accurate detailing and clean return edges. Suitable for retail, hospitality, and office environments where brand presence and durability are equally important.',
    highlights: ['Premium acrylic/metal finishes', 'Frontlit and halo-lit options', 'Indoor and outdoor installation'],
    images: [toAssetPath('3D Lettering', '1.jpg'), toAssetPath('3D Lettering', '2.jpg')],
  },
  {
    id: '2d-box-signage',
    title: '2D Box Signage',
    categorySlug: '2d-box-signage',
    route: '/featured/2d-box-signage',
    folderName: '2D Signage',
    description: 'Clean and modern box signage for retail and commercial fronts.',
    heading: '2D Box Signage',
    blurb:
      'Modern boxed signage solutions designed for clarity, clean branding, and strong front-of-store visibility.',
    longDescription:
      '2D box signage gives you a modern and professional fascia style with a crisp, structured look. It works particularly well for businesses that prefer clean geometry, bold letterforms, and highly visible storefront branding.',
    details:
      'Each unit is fabricated for longevity and can be supplied in a range of finishes, depths, and color combinations. We can also configure illumination options to improve visibility for high-footfall and evening trade locations.',
    highlights: ['Slim profile construction', 'Durable weather-ready build', 'Custom sizes and colors'],
    images: [toAssetPath('2D Signage', '1.jpg'), toAssetPath('2D Signage', '2.jpg')],
  },
  {
    id: 'flex-face',
    title: 'Flex Face Sign',
    categorySlug: 'flex-face',
    route: '/featured/flex-face',
    folderName: 'Flex Face',
    description: 'Large format illuminated sign systems built for visibility.',
    heading: 'Flex Face Sign',
    blurb:
      'Large-format illuminated flex systems for high-impact branding across long facades and elevated installations.',
    longDescription:
      'Flex face signage is ideal for larger display areas where seamless visuals and strong night-time illumination are required. It offers excellent value for wide fascia runs while maintaining a clean and impactful front view.',
    details:
      'Our systems are designed with durable framework and quality lighting setup to ensure even brightness. This makes flex face a practical choice for supermarkets, showrooms, and commercial sites with big frontage requirements.',
    highlights: ['Great for very large signs', 'Even front illumination', 'Cost-effective for broad storefronts'],
    images: [toAssetPath('Flex Face', '1.jpg'), toAssetPath('Flex Face', '2.jpg')],
  },
  {
    id: 'lightbox',
    title: 'Lightbox Sign',
    categorySlug: 'lightbox',
    route: '/featured/lightbox',
    folderName: 'Light Box',
    description: 'Bright, even illumination for day-and-night brand presence.',
    heading: 'Lightbox Sign',
    blurb:
      'Bright and even LED-lit lightbox signage for day-and-night readability with a professional visual finish.',
    longDescription:
      'Lightbox signs are built to deliver consistent illumination and clear messaging, making them highly effective for menu boards, directional signs, and retail identity panels. They are compact, durable, and visually clean.',
    details:
      'We design lightboxes in multiple profiles, mounting styles, and face materials so they integrate neatly with your brand environment. LED systems are selected for stable output, energy efficiency, and low maintenance performance.',
    highlights: ['High brightness LED system', 'Uniform light diffusion', 'Ideal for shopfronts and menus'],
    images: [
      toAssetPath('Light Box', '1.jpg'),
      toAssetPath('Light Box', '2.jpg'),
      toAssetPath('Light Box', '3.jpg'),
    ],
  },
  {
    id: 'printed-board',
    title: 'Printed Board Sign',
    categorySlug: 'printed-board',
    route: '/featured/printed-board',
    folderName: 'Printed Board Sign',
    description: 'Durable, high-quality printed signage for indoor and outdoor use.',
    heading: 'Printed Board Sign',
    blurb:
      'Durable printed board signage for indoor and outdoor use with crisp graphics and consistent color quality.',
    longDescription:
      'Printed board signage is a versatile option for promotions, wayfinding, and permanent branded displays. It is suitable for both short-term campaigns and long-term installation where visual clarity and durability matter.',
    details:
      'We provide multiple board material options and production finishes depending on your usage environment. With accurate color reproduction and robust print quality, these signs are excellent for storefronts, offices, and events.',
    highlights: ['UV-stable print quality', 'Rigid board material options', 'Quick turnaround production'],
    images: [toAssetPath('Printed Board Sign', '1.jpg'), toAssetPath('Printed Board Sign', '2.jpg')],
  },
];

export const getFeaturedSignageBySlug = (slug) =>
  featuredSignageItems.find((item) => item.categorySlug === String(slug || '').toLowerCase());

