import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const font = { fontFamily: 'Lexend Deca, sans-serif' };

function receiptHelpContent({ receiptEmailSent, designServiceSuccess, trackingId }) {
  if (receiptEmailSent) {
    return null;
  }

  const trackLabel = designServiceSuccess ? 'My Design Orders' : 'Track Order';
  const trackPath = designServiceSuccess
    ? 'My Account > My Design Orders'
    : 'My Account > Track Order';

  return {
    bullets: [
      'Download the PDF below and save it on your device as your receipt.',
      trackingId
        ? `Track your order in ${trackPath} by entering your Tracking ID: ${trackingId}.`
        : `Track your order anytime from My Account > ${trackLabel}.`,
    ],
  };
}

/**
 * Shown after a successful Worldpay charge. Register in your router:
 *   <Route path="/payment-success" element={<PaymentSuccessPage />} />
 */
const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const s = location.state;

  if (!s?.paymentSuccess) {
    return <Navigate to="/" replace />;
  }

  const {
    orderReference,
    paymentId,
    trackingId,
    amount,
    currency = 'GBP',
    email,
    customerName,
    orderTitle,
    designServiceSuccess,
    receiptEmailSent,
  } = s;

  const amountLabel =
    typeof amount === 'number'
      ? new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount)
      : `£${amount}`;

  const receiptHelp = receiptHelpContent({
    receiptEmailSent: Boolean(receiptEmailSent),
    designServiceSuccess,
    trackingId,
  });
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  const handleDownloadReceiptPdf = async () => {
    if (downloadingReceipt) return;
    setDownloadingReceipt(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 18;
      let y = 22;

      const addRow = (label, value, boldValue = false) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        pdf.text(String(label), margin, y);
        pdf.setTextColor(17, 24, 39);
        pdf.setFont('helvetica', boldValue ? 'bold' : 'normal');
        const lines = pdf.splitTextToSize(String(value || '—'), pageWidth - margin * 2 - 52);
        pdf.text(lines, pageWidth - margin, y, { align: 'right' });
        y += Math.max(7, lines.length * 5);
      };

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(5, 150, 105);
      pdf.text('Payment receipt', margin, y);
      y += 10;

      if (orderTitle) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(55, 65, 81);
        pdf.text(`Order: ${orderTitle}`, margin, y);
        y += 8;
      }

      pdf.setDrawColor(229, 231, 235);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;

      addRow('Order reference', orderReference || '—', true);
      addRow('Payment reference', paymentId || '—');
      addRow('Tracking ID', trackingId || '—');
      addRow('Amount paid', amountLabel, true);
      addRow('Customer', customerName || 'Customer');
      addRow('Email', email || '—');

      y += 4;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(29, 78, 216);
      const trackText = trackingId
        ? `Track your order in My Account using Tracking ID ${trackingId}.`
        : 'Keep this receipt for your records.';
      const trackLines = pdf.splitTextToSize(trackText, pageWidth - margin * 2);
      pdf.text(trackLines, margin, y);

      y += trackLines.length * 5 + 8;
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text('Thank you for your payment.', margin, y);

      const safeRef = String(orderReference || paymentId || 'receipt').replace(/[^\w-]+/g, '_');
      pdf.save(`Receipt_${safeRef}.pdf`);
    } catch (error) {
      console.error('[receipt-pdf] download failed', error);
    } finally {
      setDownloadingReceipt(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4" style={font}>
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-white text-center">
            <div className="text-4xl mb-2" aria-hidden="true">
              ✓
            </div>
            <h1 className="text-2xl font-bold">Payment successful</h1>
            <p className="text-emerald-50 text-sm mt-2">Thank you{customerName ? `, ${customerName}` : ''}.</p>
          </div>

          <div className="px-6 py-6 space-y-4 text-gray-800">
            {orderTitle && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Order: </span>
                {orderTitle}
              </p>
            )}
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Order reference</span>
                <span className="font-mono font-semibold text-right break-all">{orderReference || '—'}</span>
              </div>
              {paymentId && paymentId !== orderReference && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Payment reference</span>
                  <span className="font-mono text-xs text-right break-all">{paymentId}</span>
                </div>
              )}
              {trackingId && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Tracking ID</span>
                  <span className="font-mono text-xs text-right break-all">{trackingId}</span>
                </div>
              )}
              <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
                <span className="text-gray-500">Amount paid</span>
                <span className="font-bold text-emerald-700 tabular-nums">{amountLabel}</span>
              </div>
            </div>
            {trackingId && (
              <p className="text-sm text-blue-800 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                {designServiceSuccess ? (
                  <>
                    Track progress in <strong>My Account &gt; My Design Orders</strong>. Your tracking ID is{' '}
                    <strong className="font-mono">{trackingId}</strong>.
                  </>
                ) : (
                  <>
                    You can track your order in <strong>My Account &gt; Track Order</strong> using Tracking ID{' '}
                    <strong className="font-mono">{trackingId}</strong>.
                  </>
                )}
              </p>
            )}

            {receiptEmailSent && email && (
              <p className="text-sm text-gray-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                A receipt has been sent to <strong className="text-emerald-900">{email}</strong>. Please check your
                inbox (and spam).
              </p>
            )}
            {!receiptEmailSent && receiptHelp && (
              <div className="text-sm text-gray-800 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                  {receiptHelp.bullets.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadReceiptPdf}
                disabled={downloadingReceipt}
                className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm disabled:opacity-60"
              >
                {downloadingReceipt ? 'Preparing PDF…' : 'Download receipt (PDF)'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
              >
                Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
