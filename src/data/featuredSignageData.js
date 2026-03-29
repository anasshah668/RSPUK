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
  {
    id: 'posters',
    title: 'Posters',
    categorySlug: 'posters',
    route: '/featured/posters',
    folderName: 'Posters',
    description: 'High-impact poster printing for promotions, events, and retail campaigns.',
    heading: 'Posters',
    blurb:
      'Professional poster printing with sharp visuals and vibrant color output for indoor campaigns and display spaces.',
    longDescription:
      'Our poster printing service is built for brands that need eye-catching visuals at scale. Whether you are promoting an event, launching an offer, or building awareness in-store, we produce clean and consistent print quality across multiple sizes.',
    details:
      'Choose from a variety of paper stocks and finishes based on campaign duration and placement. Posters are suitable for retail displays, hospitality promotions, office communication, and public-facing announcements.',
    highlights: ['Multiple size options', 'Vibrant color reproduction', 'Fast campaign turnaround'],
    images: [],
  },
  {
    id: 'pvc-banners',
    title: 'PVC Banners',
    categorySlug: 'pvc-banners',
    route: '/featured/pvc-banners',
    folderName: 'PVC Banners',
    description: 'Durable PVC banners for outdoor promotions, events, and large-format messaging.',
    heading: 'PVC Banners',
    blurb:
      'Weather-resistant PVC banners designed for bold visibility in both indoor and outdoor environments.',
    longDescription:
      'PVC banners are ideal when you need large-format messaging with durability and value. They are commonly used for promotions, temporary branding, events, and construction hoardings where strong visibility is essential.',
    details:
      'We produce reinforced banners with finishing options such as hems and eyelets to make installation straightforward. Print output is optimized for readability from distance and reliable outdoor performance.',
    highlights: ['Outdoor-ready material', 'Large-format print support', 'Hems and eyelets available'],
    images: [],
  },
  {
    id: 'correx-foamex-aluminium-prints',
    title: 'Correx / Foamex / Aluminium Prints',
    categorySlug: 'correx-foamex-aluminium-prints',
    route: '/featured/correx-foamex-aluminium-prints',
    folderName: 'Correx Foamex Aluminium Prints',
    description: 'Rigid board printing options for temporary and long-term signage needs.',
    heading: 'Correx / Foamex / Aluminium Prints',
    blurb:
      'Rigid print solutions on Correx, Foamex, and Aluminium for projects requiring structure, durability, and clean presentation.',
    longDescription:
      'This range offers flexibility across budget, lifespan, and installation type. Correx suits short-term outdoor promotions, Foamex provides excellent indoor finish, and Aluminium delivers premium rigidity for long-term branding.',
    details:
      'We help match substrate to use-case, ensuring your graphics perform correctly in their intended environment. Suitable for estate boards, wall branding, directional signage, and premium display panels.',
    highlights: ['Material options for every use-case', 'Crisp direct print quality', 'Ideal for fixed signage'],
    images: [],
  },
  {
    id: 'backlit-prints',
    title: 'Backlit Prints',
    categorySlug: 'backlit-prints',
    route: '/featured/backlit-prints',
    folderName: 'Backlit Prints',
    description: 'Translucent print media optimized for illuminated lightbox applications.',
    heading: 'Backlit Prints',
    blurb:
      'Backlit graphic prints engineered for even light transmission and high visibility in illuminated displays.',
    longDescription:
      'Backlit prints are produced for applications where internal lighting is used to enhance impact and readability. They are widely used in retail, transport hubs, menu displays, and branding systems that operate day and night.',
    details:
      'We calibrate artwork output for illuminated conditions to maintain balanced color and contrast once lit. This helps preserve brand accuracy and visual clarity across varying ambient light levels.',
    highlights: ['Optimized for illuminated displays', 'Balanced color under lighting', 'Suitable for day/night branding'],
    images: [],
  },
  {
    id: 'canvas-prints',
    title: 'Canvas Prints',
    categorySlug: 'canvas-prints',
    route: '/featured/canvas-prints',
    folderName: 'Canvas Prints',
    description: 'Premium canvas prints for interior branding, decor, and visual storytelling.',
    heading: 'Canvas Prints',
    blurb:
      'High-quality canvas prints with rich color depth, ideal for decorative and brand-led interior applications.',
    longDescription:
      'Canvas prints are perfect when you want a softer, premium visual finish compared to standard poster media. They work well in offices, studios, hospitality spaces, and retail interiors where presentation quality is key.',
    details:
      'Produced using high-resolution print processes, our canvases offer strong tonal detail and durable finish. Available in multiple dimensions to suit wall displays and feature installations.',
    highlights: ['Premium interior finish', 'Rich color and tonal depth', 'Multiple display sizes'],
    images: [],
  },
  {
    id: 'printed-vinyl',
    title: 'Printed Vinyl',
    categorySlug: 'printed-vinyl',
    route: '/featured/printed-vinyl',
    folderName: 'Printed Vinyl',
    description: 'Custom printed vinyl graphics for walls, windows, and branded surfaces.',
    heading: 'Printed Vinyl',
    blurb:
      'Custom vinyl graphics for impactful branding across windows, walls, panels, and other smooth surfaces.',
    longDescription:
      'Printed vinyl gives you the freedom to transform spaces with full-color graphics, promotional messaging, and brand visuals. It is suitable for both short-term campaigns and long-term branded environments.',
    details:
      'We provide production guidance based on placement, durability needs, and finish type. This ensures cleaner installation, reliable adhesion, and consistent visual quality throughout campaign duration.',
    highlights: ['Full-color custom graphics', 'Versatile indoor/outdoor use', 'Ideal for branded environments'],
    images: [],
  },
  {
    id: 'frosted-vinyl',
    title: 'Frosted Vinyl',
    categorySlug: 'frosted-vinyl',
    route: '/featured/frosted-vinyl',
    folderName: 'Frosted Vinyl',
    description: 'Elegant privacy vinyl with a clean etched-glass look for internal glazing.',
    heading: 'Frosted Vinyl',
    blurb:
      'Frosted vinyl solutions that add privacy while maintaining a clean, professional glass finish.',
    longDescription:
      'Frosted vinyl is ideal for offices, meeting rooms, clinics, and reception spaces where privacy is needed without losing natural light. It creates a modern etched-glass appearance at a practical cost.',
    details:
      'Design options include full frosting, cut shapes, logo integration, and banding styles. The finish is subtle, premium, and highly effective for interior branding and privacy management.',
    highlights: ['Privacy without blocking light', 'Etched-glass visual effect', 'Custom logo and pattern options'],
    images: [],
  },
  {
    id: 'one-way-vision',
    title: 'One Way Vision',
    categorySlug: 'one-way-vision',
    route: '/featured/one-way-vision',
    folderName: 'One Way Vision',
    description: 'Perforated window graphics allowing outward visibility with external branding.',
    heading: 'One Way Vision',
    blurb:
      'Perforated window film that displays branding outside while preserving visibility from inside.',
    longDescription:
      'One Way Vision film is perfect for storefront windows, vehicle glazing, and public-facing glass where you need both advertising space and internal visibility. It balances messaging and function in one system.',
    details:
      'We print high-contrast graphics optimized for perforated media and viewing distance. This helps keep artwork clear externally while maintaining practical day-to-day visibility from inside.',
    highlights: ['External ad space on glazing', 'Internal outward visibility', 'Great for shops and vehicles'],
    images: [],
  },
  {
    id: 'cut-vinyl',
    title: 'Cut Vinyl',
    categorySlug: 'cut-vinyl',
    route: '/featured/cut-vinyl',
    folderName: 'Cut Vinyl',
    description: 'Precision-cut lettering and shapes for clean, minimal, long-lasting graphics.',
    heading: 'Cut Vinyl',
    blurb:
      'Precision-cut vinyl lettering and graphics for clean branding, wayfinding, and window communication.',
    longDescription:
      'Cut vinyl is a reliable choice for logos, text, directional signs, and opening-hours displays. It offers a crisp, minimal look and performs well across interior and exterior applications.',
    details:
      'Available in multiple colors and finishes, cut vinyl graphics are produced with accurate contour cutting for neat edges and professional presentation. Ideal for long-term branding consistency.',
    highlights: ['Sharp, clean graphic edges', 'Long-lasting finish', 'Excellent for text and logos'],
    images: [],
  },
  {
    id: 'privacy-films',
    title: 'Privacy Films',
    categorySlug: 'privacy-films',
    route: '/featured/privacy-films',
    folderName: 'Privacy Films',
    description: 'Functional privacy films for glazing with optional branding and decorative styles.',
    heading: 'Privacy Films',
    blurb:
      'Privacy films for office and commercial glazing that improve discretion while supporting a polished interior look.',
    longDescription:
      'Privacy films are used where controlled visibility is important, such as meeting rooms, treatment spaces, and partitioned areas. They help define zones while keeping a bright and modern environment.',
    details:
      'Solutions include full coverage, gradient effects, and branded layouts depending on your design requirements. Film selection is tailored to privacy level, glass type, and maintenance expectations.',
    highlights: ['Improved visual privacy', 'Suitable for office glazing', 'Custom decorative options'],
    images: [],
  },
];

export const getFeaturedSignageBySlug = (slug) =>
  featuredSignageItems.find((item) => item.categorySlug === String(slug || '').toLowerCase());

