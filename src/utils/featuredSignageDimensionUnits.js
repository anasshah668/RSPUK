export const RATE_UNIT_OPTIONS = [
  { value: 'cm', label: 'Centimetres (cm)' },
  { value: 'mm', label: 'Millimetres (mm)' },
  { value: 'ft', label: 'Feet (ft)' },
  { value: 'inch', label: 'Inches (in)' },
];

export function normalizeRateUnit(unit) {
  const u = String(unit || 'cm').toLowerCase().trim();
  if (u === 'ft' || u === 'feet') return 'ft';
  if (u === 'inch' || u === 'in' || u === 'inches') return 'inch';
  if (u === 'mm') return 'mm';
  return 'cm';
}

export function getDimensionRateLabels(rateUnit) {
  const u = normalizeRateUnit(rateUnit);
  const areaSuffix = u === 'cm' ? 'cm²' : u === 'mm' ? 'mm²' : u === 'ft' ? 'ft²' : 'in²';
  return {
    width: `Per ${u} width (£)`,
    height: `Per ${u} height (£)`,
    area: `Per ${areaSuffix} area (£) — if > 0, replaces width+height`,
    letterHeight: `Per ${u} letter height (£)`,
  };
}

function buildCommonFields(rateUnit) {
  const dim = getDimensionRateLabels(rateUnit);
  return [
    { key: 'basePrice', label: 'Base price (£)', step: '0.01' },
    { key: 'widthCmRate', label: dim.width, step: '0.01' },
    { key: 'heightCmRate', label: dim.height, step: '0.01' },
    { key: 'areaCm2Rate', label: dim.area, step: '0.0001' },
    { key: 'minOrderPrice', label: 'Minimum order total (£)', step: '0.01' },
    { key: 'outdoorAddon', label: 'Outdoor usage (£)', step: '0.01' },
    { key: 'installationAddon', label: 'Installation (£)', step: '0.01' },
    { key: 'deliveryAddon', label: 'Delivery (£)', step: '0.01' },
    { key: 'rushOrderAddon', label: 'Rush order (£)', step: '0.01' },
    { key: 'designServiceAddon', label: 'Design service (£)', step: '0.01' },
  ];
}

const STATIC_EXTRA_FIELDS = {
  '3d-built-up-letters': [
    { key: 'letterUnitAddon', label: 'Per letter (£)', step: '0.01', dimensionKeyed: 'letterHeightCmRate' },
    { key: 'letterHeightCmRate', step: '0.01', dimensionLabelKey: 'letterHeight' },
    { key: 'material_metal', label: 'Material: Metal (£)', step: '0.01' },
    { key: 'material_aluminum', label: 'Material: Aluminum (£)', step: '0.01' },
    { key: 'lightingType_backlit', label: 'Lighting: Backlit (£)', step: '0.01' },
    { key: 'lightingType_halo', label: 'Lighting: Halo (£)', step: '0.01' },
    { key: 'lightingType_none', label: 'Lighting: None (£)', step: '0.01' },
    { key: 'ledColor_rgb', label: 'LED: RGB (£)', step: '0.01' },
    { key: 'ledColor_warm', label: 'LED: Warm (£)', step: '0.01' },
    { key: 'mountingType_raceway', label: 'Mounting: Raceway (£)', step: '0.01' },
    { key: 'mountingType_hanging', label: 'Mounting: Hanging (£)', step: '0.01' },
  ],
  '2d-box-signage': [
    { key: 'lighting_yes', label: 'Lighting: Yes (£)', step: '0.01' },
    { key: 'sided_double-sided', label: 'Double-sided (£)', step: '0.01' },
    { key: 'frameMaterial_ms', label: 'Frame: MS (£)', step: '0.01' },
    { key: 'faceMaterial_flex', label: 'Face: Flex (£)', step: '0.01' },
    { key: 'mountingType_pole', label: 'Mounting: Pole (£)', step: '0.01' },
    { key: 'mountingType_hanging', label: 'Mounting: Hanging (£)', step: '0.01' },
  ],
  'flex-face': [
    { key: 'flexType_backlit', label: 'Flex: Backlit (£)', step: '0.01' },
    { key: 'frameIncluded_yes', label: 'Frame included (£)', step: '0.01' },
    { key: 'printingType_eco-solvent', label: 'Printing: Eco Solvent (£)', step: '0.01' },
    { key: 'lighting_yes', label: 'Lighting: Yes (£)', step: '0.01' },
  ],
  lightbox: [
    { key: 'brightnessLevel_high', label: 'Brightness: High (£)', step: '0.01' },
    { key: 'lightboxFrameType_acrylic', label: 'Frame: Acrylic (£)', step: '0.01' },
    { key: 'faceMaterial_fabric', label: 'Face: Fabric (£)', step: '0.01' },
  ],
  'printed-board': [
    { key: 'boardType_pvc', label: 'Board: PVC (£)', step: '0.01' },
    { key: 'boardType_acrylic', label: 'Board: Acrylic (£)', step: '0.01' },
    { key: 'lamination_yes', label: 'Lamination: Yes (£)', step: '0.01' },
    { key: 'finish_gloss', label: 'Finish: Gloss (£)', step: '0.01' },
  ],
};

export function fieldsForAdminCategory(slug, rateUnit = 'cm') {
  const unit = normalizeRateUnit(rateUnit);
  const dim = getDimensionRateLabels(unit);
  const extras = (STATIC_EXTRA_FIELDS[slug] || []).map((field) => {
    if (field.dimensionLabelKey) {
      return { ...field, label: dim[field.dimensionLabelKey] };
    }
    return field;
  });
  return [...buildCommonFields(unit), ...extras];
}
