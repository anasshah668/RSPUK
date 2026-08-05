import { COMPANY_CONTACT } from '../config/companyContact';
import { UK_VAT_RATE } from './vatUtils';

const TEAL = [0, 77, 86]; // #004D56

const formatMoney = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0.00';
  return n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatReceiptDate = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const receiptNumberFromRef = (orderReference, paymentId) => {
  const raw = String(orderReference || paymentId || '');
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 4) return digits.slice(-5);
  if (raw) return raw.replace(/[^\w]/g, '').slice(-8).toUpperCase() || '00000';
  return String(Date.now()).slice(-5);
};

async function loadImageDataUrl(src) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Failed to load ${src}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getImageSize(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
    img.onerror = () => resolve({ width: 1, height: 1 });
    img.src = dataUrl;
  });
}

/**
 * Build printable line rows from checkout / success payload.
 * Rates & amounts are ex-VAT (net) to match River Signs sale receipts.
 */
export function buildSaleReceiptLines({ lineItems, orderTitle, amountPaid, amountBasis }) {
  const today = formatReceiptDate();
  if (Array.isArray(lineItems) && lineItems.length > 0) {
    return lineItems.map((item) => {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const rawPrice = Number(item.price);
      const isNet =
        item.amountBasis === 'net' ||
        item.type === 'custom-neon' ||
        item.type === 'featured-signage';

      // `price` on cart/checkout line items is always the total for the whole
      // line (it already accounts for quantity / print-run size) — it is never
      // a per-unit rate, so it must not be multiplied by qty again here. This
      // mirrors the totals shown on the checkout page (see `lineDisplayAmount`
      // in CheckoutPage.jsx).
      let amountNet = 0;
      if (Number.isFinite(rawPrice)) {
        amountNet = isNet ? rawPrice : rawPrice / (1 + UK_VAT_RATE);
      }

      return {
        date: item.date || today,
        description: item.title || item.name || item.description || 'Item',
        vat: item.vatLabel || '20.0% S',
        qty,
        rate: amountNet / qty,
        amount: amountNet,
      };
    });
  }

  const paid = Number(amountPaid);
  const netTotal =
    amountBasis === 'net'
      ? paid
      : Number.isFinite(paid)
        ? paid / (1 + UK_VAT_RATE)
        : 0;

  return [
    {
      date: today,
      description: orderTitle || 'Order',
      vat: '20.0% S',
      qty: 1,
      rate: netTotal,
      amount: netTotal,
    },
  ];
}

/**
 * Generate and download a River Signs–style SALE RECEIPT PDF.
 */
export async function downloadSaleReceiptPdf({
  orderReference,
  paymentId,
  trackingId,
  amountPaid,
  currency = 'GBP',
  customerName,
  email,
  customerAddressLines = [],
  orderTitle,
  lineItems,
  amountBasis,
  paidAt,
} = {}) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  let y = 16;

  const company = COMPANY_CONTACT;
  const receiptNo = receiptNumberFromRef(orderReference, paymentId);
  const dateStr = formatReceiptDate(paidAt || new Date());

  // —— Company block (left) + logo (right) ——
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  pdf.text(company.legalName || 'RIVER SIGNS AND PRINT LTD', marginX, y);

  let logoLoaded = false;
  try {
    const logoUrl = await loadImageDataUrl(company.logoPath || '/logo.png');
    const { width: iw, height: ih } = await getImageSize(logoUrl);
    const logoW = 44;
    const logoH = Math.min(18, (logoW * ih) / iw);
    const padX = 4;
    const padY = 3;
    const boxW = logoW + padX * 2;
    const boxH = logoH + padY * 2;
    const boxX = pageWidth - marginX - boxW;
    const boxY = y - 7;

    // Dark panel so white parts of the logo stay visible on the white receipt
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'F');
    pdf.addImage(logoUrl, 'PNG', boxX + padX, boxY + padY, logoW, logoH);
    logoLoaded = true;
  } catch {
    logoLoaded = false;
  }

  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(20, 20, 20);
  const addr = company.receiptAddressLines || company.addressLines || [];
  addr.forEach((line) => {
    pdf.text(String(line), marginX, y);
    y += 4.2;
  });
  pdf.text(String(company.receiptPhone || company.phoneDisplay || ''), marginX, y);
  y += 4.2;
  pdf.text(String(company.receiptEmail || company.email || ''), marginX, y);
  y += 4.2;
  pdf.text(String(company.website || 'www.riversigns.co.uk'), marginX, y);
  y += 5.5;
  pdf.text(`VAT Registration No.: ${company.vatNumber || '—'}`, marginX, y);
  y += 4.2;
  pdf.text(`Company Registration No. ${company.companyNumber || '—'}`, marginX, y);

  y = Math.max(y + 10, logoLoaded ? 60 : 52);

  // —— INVOICE TO (left) + SALE RECEIPT bars (right) ——
  const barsX = pageWidth - marginX - 62;
  const barsW = 62;
  const barH = 7;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text('INVOICE TO', marginX, y);

  let invoiceY = y + 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  const invoiceLines = [
    customerName || 'Customer',
    ...customerAddressLines.filter(Boolean),
    email ? email : null,
  ].filter(Boolean);
  invoiceLines.forEach((line) => {
    const wrapped = pdf.splitTextToSize(String(line), barsX - marginX - 6);
    pdf.text(wrapped, marginX, invoiceY);
    invoiceY += wrapped.length * 4.2;
  });

  let barY = y - 3;
  const drawBar = (label) => {
    pdf.setFillColor(...TEAL);
    pdf.rect(barsX, barY, barsW, barH, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text(label, barsX + barsW / 2, barY + 4.7, { align: 'center' });
    barY += barH + 1.2;
  };
  drawBar(`SALE RECEIPT  ${receiptNo}`);
  drawBar(`DATE  ${dateStr}`);
  pdf.setFillColor(...TEAL);
  pdf.rect(barsX, barY, barsW, 3.5, 'F');

  y = Math.max(invoiceY, barY + 8);

  // Thick teal divider (with small centre gap like the sample)
  const gap = 4;
  const mid = pageWidth / 2;
  pdf.setFillColor(...TEAL);
  pdf.rect(marginX, y, mid - gap / 2 - marginX, 2.2, 'F');
  pdf.rect(mid + gap / 2, y, pageWidth - marginX - (mid + gap / 2), 2.2, 'F');
  y += 8;

  // —— Table ——
  const cols = {
    date: { x: marginX, w: 22 },
    description: { x: marginX + 22, w: 78 },
    vat: { x: marginX + 100, w: 22 },
    qty: { x: marginX + 122, w: 14 },
    rate: { x: marginX + 136, w: 24 },
    amount: { x: marginX + 160, w: contentWidth - 160 },
  };

  const headerH = 7;
  pdf.setFillColor(...TEAL);
  pdf.rect(marginX, y, contentWidth, headerH, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  const headerY = y + 4.6;
  pdf.text('DATE', cols.date.x + 1, headerY);
  pdf.text('DESCRIPTION', cols.description.x + 1, headerY);
  pdf.text('VAT', cols.vat.x + cols.vat.w - 1, headerY, { align: 'right' });
  pdf.text('QTY', cols.qty.x + cols.qty.w - 1, headerY, { align: 'right' });
  pdf.text('RATE', cols.rate.x + cols.rate.w - 1, headerY, { align: 'right' });
  pdf.text('AMOUNT', cols.amount.x + cols.amount.w - 1, headerY, { align: 'right' });
  y += headerH;

  const lines = buildSaleReceiptLines({
    lineItems,
    orderTitle,
    amountPaid,
    amountBasis,
  });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(20, 20, 20);
  pdf.setDrawColor(210, 210, 210);

  let netSum = 0;
  lines.forEach((row) => {
    const descLines = pdf.splitTextToSize(String(row.description || ''), cols.description.w - 2);
    const rowH = Math.max(8, descLines.length * 4 + 3);
    if (y + rowH > 270) {
      pdf.addPage();
      y = 20;
    }
    const textY = y + 5;
    pdf.text(String(row.date || ''), cols.date.x + 1, textY);
    pdf.text(descLines, cols.description.x + 1, textY);
    pdf.text(String(row.vat || '20.0% S'), cols.vat.x + cols.vat.w - 1, textY, { align: 'right' });
    pdf.text(String(row.qty ?? 1), cols.qty.x + cols.qty.w - 1, textY, { align: 'right' });
    pdf.text(formatMoney(row.rate), cols.rate.x + cols.rate.w - 1, textY, { align: 'right' });
    pdf.text(formatMoney(row.amount), cols.amount.x + cols.amount.w - 1, textY, { align: 'right' });
    netSum += Number(row.amount) || 0;
    y += rowH;
    pdf.line(marginX, y, pageWidth - marginX, y);
  });

  // Totals
  const vatSum = Math.round(netSum * UK_VAT_RATE * 100) / 100;
  const grossFromLines = Math.round((netSum + vatSum) * 100) / 100;
  const paid = Number(amountPaid);
  const totalDue = Number.isFinite(paid) ? paid : grossFromLines;

  y += 8;
  const totalsX = pageWidth - marginX - 70;
  const addTotalRow = (label, value, bold = false) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(40, 40, 40);
    pdf.text(label, totalsX, y);
    pdf.text(formatMoney(value), pageWidth - marginX, y, { align: 'right' });
    y += 5.5;
  };
  addTotalRow('Net', netSum);
  addTotalRow('VAT (20%)', vatSum);
  pdf.setDrawColor(...TEAL);
  pdf.setLineWidth(0.4);
  pdf.line(totalsX, y - 2, pageWidth - marginX, y - 2);
  addTotalRow(`Total (${currency})`, totalDue, true);

  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(90, 90, 90);
  if (trackingId) {
    pdf.text(`Tracking ID: ${trackingId}`, marginX, y);
    y += 4;
  }
  if (paymentId) {
    pdf.text(`Payment ref: ${paymentId}`, marginX, y);
    y += 4;
  }
  if (orderReference) {
    pdf.text(`Order reference: ${orderReference}`, marginX, y);
    y += 4;
  }
  y += 2;
  pdf.setTextColor(...TEAL);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Thank you for your business.', marginX, y);

  const safeRef = String(orderReference || paymentId || receiptNo).replace(/[^\w-]+/g, '_');
  pdf.save(`Sale_Receipt_${safeRef}.pdf`);
}
