import { DEFAULT_BACKGROUND_STYLE } from '../utils/designerBackground';

export const FONT = 'Lexend Deca';

export const page = (id, width, height, backgroundStyle, json = null, pageName = null) => ({
  id,
  name: pageName || 'Page 1',
  width,
  height,
  json,
  thumbnail: null,
  backgroundStyle: backgroundStyle || { ...DEFAULT_BACKGROUND_STYLE },
});

export const tb = (props) => ({
  type: 'textbox',
  fontFamily: FONT,
  textAlign: 'left',
  ...props,
});

export const rect = (props) => ({ type: 'rect', ...props });
export const circle = (props) => ({ type: 'circle', ...props });
export const triangle = (props) => ({ type: 'triangle', ...props });

export const linear = (x1, y1, x2, y2, colorStops) => ({
  type: 'linear',
  gradientUnits: 'pixels',
  coords: { x1, y1, x2, y2 },
  colorStops,
});

export const bg = (width, height, fill, extra = {}) =>
  rect({
    left: 0,
    top: 0,
    width,
    height,
    fill,
    name: 'template-bg',
    selectable: false,
    evented: false,
    ...extra,
  });

export const decoration = (props) => ({
  name: 'template-decoration',
  selectable: false,
  evented: false,
  ...props,
});

export const scene = (objects) => ({ version: '5.3.0', objects });

/** Large image placeholder — users drag photos from Uploads onto the canvas. */
export const photoArea = (props) => ({
  type: 'rect',
  name: 'photo-area',
  fill: '#94a3b8',
  stroke: '#64748b',
  strokeWidth: 2,
  selectable: true,
  ...props,
});

export const photoCircle = (props) => ({
  type: 'circle',
  name: 'photo-area',
  fill: '#94a3b8',
  stroke: '#64748b',
  strokeWidth: 2,
  selectable: true,
  ...props,
});

export const photoHint = (left, top, width, text = 'Your photo here') =>
  tb({
    left,
    top,
    width,
    text: `${text}\nDrag image from Uploads`,
    fontSize: 20,
    lineHeight: 1.35,
    fill: '#f8fafc',
    textAlign: 'center',
    name: 'photo-hint',
    selectable: true,
  });

export const dotGrid = (left, top, rows = 4, cols = 4, gap = 14, size = 5, fill = '#cbd5e1') => {
  const dots = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      dots.push(
        decoration(
          circle({
            left: left + c * gap,
            top: top + r * gap,
            radius: size,
            fill,
          }),
        ),
      );
    }
  }
  return dots;
};

export const printFooter = (width, text, color = '#94a3b8') =>
  tb({
    left: 60,
    top: width === 794 ? 1040 : 1500,
    width: width - 120,
    text,
    fontSize: 18,
    fill: color,
    textAlign: 'center',
  });
