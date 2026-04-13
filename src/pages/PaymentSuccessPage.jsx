import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const font = { fontFamily: 'Lexend Deca, sans-serif' };

function receiptHelpText(receiptEmailSent, receiptEmailReason) {
  if (receiptEmailSent) {
    return null;
  }
  switch (receiptEmailReason) {
    case 'no_sendgrid':
      return 'Receipt email was not sent because SendGrid is not configured (set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL on the server).';
    case 'no_smtp':
      return 'Receipt email was not sent because outgoing mail is not configured on the server yet.';
    case 'no_nodemailer':
      return 'Receipt email was not sent — mail is not configured on the server.';
    case 'disabled':
      return 'Receipt emails are turned off (RECEIPT_EMAIL_ENABLED=false).';
    case 'send_failed':
      return 'We could not send the receipt email. Your payment still went through — save this page or contact us with your order reference.';
    case 'no_customer_email':
      return 'No email was on file for a receipt.';
    default:
      return 'If you do not receive a receipt shortly, check spam or contact us with your order reference below.';
  }
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
    amount,
    currency = 'GBP',
    email,
    customerName,
    orderTitle,
    receiptEmailSent,
    receiptEmailReason,
  } = s;

  const amountLabel =
    typeof amount === 'number'
      ? new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount)
      : `£${amount}`;

  const receiptNote = receiptHelpText(Boolean(receiptEmailSent), receiptEmailReason);

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
              <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
                <span className="text-gray-500">Amount paid</span>
                <span className="font-bold text-emerald-700 tabular-nums">{amountLabel}</span>
              </div>
            </div>

            {receiptEmailSent && email && (
              <p className="text-sm text-gray-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                A receipt has been sent to <strong className="text-emerald-900">{email}</strong>. Please check your
                inbox (and spam).
              </p>
            )}
            {!receiptEmailSent && receiptNote && (
              <p className="text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                {receiptNote}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
