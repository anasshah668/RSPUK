const mmToPt = (mm) => (Number(mm) * 72) / 25.4;

export async function inspectPdfFile(file) {
  const buffer = await file.arrayBuffer();
  const text = new TextDecoder('latin1').decode(buffer);
  const boxes = [...text.matchAll(/\/MediaBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\]/g)];
  const pageMarks = text.match(/\/Type\s*\/Page(?![sA-Za-z])/g);
  const pageCount = Math.max(pageMarks?.length || 0, boxes.length, 1);
  const box = boxes[0];
  if (!box) {
    return { pageCount, widthPt: null, heightPt: null };
  }
  const widthPt = Math.abs(Number(box[3]) - Number(box[1]));
  const heightPt = Math.abs(Number(box[4]) - Number(box[2]));
  return { pageCount, widthPt, heightPt };
}

export function pdfPageFitsProduct({ widthPt, heightPt }, { widthMm, heightMm }, tolerance = 0.18) {
  if (!widthPt || !heightPt || !widthMm || !heightMm) return true;
  const targetW = mmToPt(widthMm);
  const targetH = mmToPt(heightMm);
  const bleed = mmToPt(3);
  const fits = (w, h) =>
    Math.abs(w - targetW) <= targetW * tolerance + bleed &&
    Math.abs(h - targetH) <= targetH * tolerance + bleed;
  return fits(widthPt, heightPt) || fits(heightPt, widthPt);
}

export function formatPdfPageMm(widthPt, heightPt) {
  if (!widthPt || !heightPt) return '';
  const w = Math.round((widthPt / 72) * 25.4);
  const h = Math.round((heightPt / 72) * 25.4);
  return `${w} × ${h} mm`;
}
