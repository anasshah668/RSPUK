import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CommonCheckout from '../components/CommonCheckout';
import { paymentService } from '../services/paymentService';
import { thirdPartyService } from '../services/thirdPartyService';
import { uploadService } from '../services/uploadService';
import { useCart } from '../context/CartContext';
import { useVatInclusive } from '../hooks/useVatInclusive';
import {
  grossFromNet,
  payableFromNet,
  vatAmountFromNet,
} from '../utils/vatUtils';
import { formatPaymentErrorForToast } from '../utils/formatPaymentChargeError';

const sliderItems = [
  {
    title: 'Secure Payments',
    text: 'All card details are captured through hosted Worldpay secure fields.',
  },
  {
    title: 'Fast Processing',
    text: 'Payments are authorized quickly so your order can move to production immediately.',
  },
  {
    title: 'Trusted methods',
    text: 'Major cards, Maestro, Apple Pay, Google Pay, PayPal, and more where enabled.',
  },
];

const ORDER_REVIEW_SUMMARY_LABELS = new Set([
  'Size',
  'Backing',
  'Colour',
  'Color',
  'Font',
  'Tube',
  'Mounting',
  'Quantity',
  'Material',
  'Product',
  'Product type',
  'Item',
]);


function isTradeprintPrintReadyArtworkUrl(url) {
  const normalized = String(url || '').split('?')[0].toLowerCase();
  if (!/^https?:\/\//i.test(normalized)) return false;
  if (normalized.endsWith('.pdf')) return true;
  // Cloudinary raw uploads for PDFs
  if (normalized.includes('/raw/upload/')) return true;
  return false;
}

function isRecoverableWorldpaySessionConflict(error) {
  const status = Number(error?.status || error?.data?.status || 0);
  if (status !== 409) return false;
  const message = String(error?.message || '').toLowerCase();
  const hasConflictPayload = Boolean(
    error?.data?.details?._embedded?.token?.conflicts
    || error?.data?._embedded?.token?.conflicts
  );
  return (
    hasConflictPayload
    || message.includes('verified token creation failed')
    || message.includes('one-time')
    || message.includes('conflict')
  );
}

/** Remove base64 / oversized strings before sending line items to the server for admin fulfilment. */
function stripHeavyFieldsFromLineItem(item) {
  if (!item || typeof item !== 'object') return {};
  const out = { ...item };
  Object.keys(out).forEach((k) => {
    const v = out[k];
    if (typeof v === 'string' && (v.startsWith('data:') || v.length > 8000)) {
      delete out[k];
      if (/image|upload|artwork|canvas|designfile/i.test(k)) {
        out.artworkAttached = true;
      }
    }
  });
  return out;
}

function normalizeSelectedAttributesFromLineItem(item) {
  if (!item || typeof item !== 'object') return {};
  if (
    item.selectedAttributes &&
    typeof item.selectedAttributes === 'object' &&
    !Array.isArray(item.selectedAttributes)
  ) {
    return item.selectedAttributes;
  }

  const fromSnapshot =
    item.selectionSnapshot &&
    typeof item.selectionSnapshot === 'object' &&
    !Array.isArray(item.selectionSnapshot) &&
    item.selectionSnapshot.attributes &&
    typeof item.selectionSnapshot.attributes === 'object' &&
    !Array.isArray(item.selectionSnapshot.attributes)
      ? item.selectionSnapshot.attributes
      : null;
  if (fromSnapshot) return fromSnapshot;

  if (Array.isArray(item.productOptions)) {
    const mapped = {};
    item.productOptions.forEach((row) => {
      const label = String(row?.label || '').trim();
      const value = row?.value;
      if (!label || value == null || String(value).trim() === '') return;
      mapped[label] = String(value);
    });
    return mapped;
  }
  return {};
}

function pickOrderReviewSummaryRows(summary) {
  if (!Array.isArray(summary)) return [];
  return summary
    .filter((row) => {
      if (!row?.label) return false;
      const label = String(row.label);
      const val = String(row.value ?? '').trim();
      if (!val) return false;
      if (ORDER_REVIEW_SUMMARY_LABELS.has(label)) return val.length <= 72;
      if (/detail|description|^text$/i.test(label)) return false;
      return val.length <= 44;
    })
    .slice(0, 4);
}

function formatSourceLabel(source) {
  const value = String(source || '').trim();
  if (!value) return '';
  if (value === 'third-party') return 'Trade Print';
  if (value === 'in-house') return 'In House';
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getTradeprintServiceLevel(item) {
  const value = String(
    item?.serviceLevel ||
    item?.deliveryOption ||
    item?.selectedAttributes?.deliveryOption ||
    ''
  ).trim().toLowerCase();
  if (value === 'express') return 'Express';
  if (value === 'saver') return 'Saver';
  return 'Standard';
}

function getTradeprintFileUrls(item) {
  if (Array.isArray(item?.fileUrls)) {
    return item.fileUrls.filter((url) => /^https?:\/\//i.test(String(url || '')));
  }
  if (/^https?:\/\//i.test(String(item?.artworkPreviewUrl || ''))) {
    return [item.artworkPreviewUrl];
  }
  return [];
}

function getCheckoutLineKey(item, idx) {
  return String(item?.lineId || item?.id || `line-${idx}`);
}

/**
 * Detect whether a Tradeprint validation failure was caused by the artwork
 * (e.g. "Line item artwork validation failed", or any errorDetails entry
 * mentioning artwork / fileUrls).
 */
function isArtworkValidationFailure(summary, details) {
  const text = String(summary || '').toLowerCase();
  if (text.includes('artwork') || text.includes('fileurl') || text.includes('file url')) {
    return true;
  }
  if (Array.isArray(details)) {
    return details.some((d) => {
      const message = String(d?.message || '').toLowerCase();
      const argument = String(d?.argument || '').toLowerCase();
      return (
        message.includes('artwork') ||
        message.includes('fileurl') ||
        argument.includes('artwork') ||
        argument.includes('fileurl') ||
        argument === 'fileurls'
      );
    });
  }
  return false;
}

/**
 * Returns the order-item indices flagged in errorDetails.property values like
 * "instance.orderItems[2]". Empty array means no specific index is known.
 */
function extractFailingOrderItemIndices(details) {
  if (!Array.isArray(details)) return [];
  const indices = new Set();
  details.forEach((d) => {
    const property = String(d?.property || '');
    const match = property.match(/orderItems\[(\d+)\]/);
    if (match) indices.add(Number(match[1]));
  });
  return [...indices];
}

function getTradeprintProductionData(item) {
  const attributes = normalizeSelectedAttributesFromLineItem(item);
  const {
    deliveryOption: _deliveryOption,
    source: _source,
    ...productionData
  } = attributes || {};
  return productionData;
}

async function normalizeThirdPartyLinesForValidation(lines) {
  const normalized = [];

  for (const line of lines) {
    const productId = line.thirdPartyProductKey || line.productId;
    if (!productId) {
      normalized.push(line);
      continue;
    }

    const productionData = getTradeprintProductionData(line);
    const serviceLevel = getTradeprintServiceLevel(line);

    try {
      const res = await thirdPartyService.getQuantities({
        productId,
        serviceLevel,
        productionData,
      });
      const tiers = (Array.isArray(res?.quantities) ? res.quantities : [])
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
        .sort((a, b) => a - b);

      if (tiers.length === 0) {
        normalized.push(line);
        continue;
      }

      const requestedQty = Number(line.quantity);
      if (tiers.includes(requestedQty)) {
        normalized.push(line);
        continue;
      }

      normalized.push({ ...line, quantity: tiers[0] });
    } catch {
      normalized.push(line);
    }
  }

  return normalized;
}

async function submitTradeprintOrderAfterPayment({ lineItems, customerInfo, orderReference }) {
  const thirdPartyLines = lineItems.filter(
    (item) => String(item?.source || '').trim() === 'third-party',
  );
  if (thirdPartyLines.length === 0) {
    return { skipped: true };
  }

  const linesReady = await normalizeThirdPartyLinesForValidation(thirdPartyLines);

  try {
    return await thirdPartyService.placeCheckoutOrder({
      lineItems: linesReady,
      customerInfo,
      orderReference,
    });
  } catch (error) {
    const data = error?.data || {};
    return {
      success: false,
      stage: data.stage || 'place',
      errorMessage:
        data.errorMessage || error?.message || 'Tradeprint order placement failed',
      errorDetails: data.errorDetails || [],
    };
  }
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, clearCart, refreshCart, cartItems } = useCart();
  const vatInclusive = useVatInclusive();
  const checkoutItems = Array.isArray(location.state?.checkoutItems) ? location.state.checkoutItems : null;
  const isMultiCheckout = Boolean(checkoutItems?.length);

  const checkoutData = useMemo(() => {
    const passed = location?.state?.checkoutData;
    if (passed && typeof passed === 'object') return passed;

    if (Array.isArray(checkoutItems) && checkoutItems.length > 0) {
      const totalAmount = checkoutItems.reduce(
        (sum, i) => sum + Number(i?.price || 0),
        0
      );
      const first = checkoutItems[0] || {};
      const sources = [
        ...new Set(
          checkoutItems
            .map((i) => String(i?.source || '').trim())
            .filter(Boolean)
        ),
      ];

      return {
        title:
          checkoutItems.length === 1
            ? first.title || first.name || 'Order'
            : `Order (${checkoutItems.length} items)`,
        description:
          checkoutItems.length === 1
            ? first.description || ''
            : 'Multi-item checkout',
        amount: totalAmount,
        amountBasis: first.amountBasis || null,
        summary: Array.isArray(first.summary) ? first.summary : [],
        selectedAttributes: first.selectedAttributes,
        selectionSnapshot: first.selectionSnapshot,
        productOptions: first.productOptions,
        designOption: first.designOption,
        source: sources.length === 1 ? sources[0] : sources.join(', '),
        thirdPartyProductKey: first.thirdPartyProductKey,
        artworkPreviewUrl: first.artworkPreviewUrl,
        fileUrls: first.fileUrls,
        deliveryOption: first.deliveryOption,
      };
    }

    return undefined;
  }, [location?.state?.checkoutData, checkoutItems]);

  const checkoutSourceLabel = formatSourceLabel(checkoutData?.source);
 
  const [activeSlide, setActiveSlide] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('worldpay-card');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [worldpayReloadSignal, setWorldpayReloadSignal] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationSummary, setValidationSummary] = useState('');
  // Artwork re-upload state (only used when Tradeprint rejects current artwork).
  // Keyed by `getCheckoutLineKey(item, idx)`.
  const [artworkOverridesByLine, setArtworkOverridesByLine] = useState({}); // { [key]: { url, fileName } }
  const [artworkUploadingByLine, setArtworkUploadingByLine] = useState({}); // { [key]: boolean }
  const [artworkUploadErrorByLine, setArtworkUploadErrorByLine] = useState({}); // { [key]: string }
  // When true, the inline "re-upload artwork" panel is shown above the checkout form.
  const [needsArtworkReupload, setNeedsArtworkReupload] = useState(false);
  // Indices of third-party lines flagged by the validate API (when known).
  const [failingArtworkLineKeys, setFailingArtworkLineKeys] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    orderComments: '',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderItems.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const allCustomNeon =
    isMultiCheckout && checkoutItems.every((i) => i.type === 'custom-neon');
  const multiNeonNetTotal = useMemo(() => {
    if (!isMultiCheckout || !allCustomNeon) return 0;
    return checkoutItems.reduce(
      (s, i) => s + Number(i.price || 0) * Number(i.quantity || 1),
      0
    );
  }, [isMultiCheckout, allCustomNeon, checkoutItems]);

  const singleNetAmount = Number(checkoutData?.amount) > 0 ? Number(checkoutData?.amount) : 50;
  const isNeonNetCheckout = isMultiCheckout ? allCustomNeon : checkoutData?.amountBasis === 'net';
  const netAmount = isMultiCheckout && allCustomNeon ? multiNeonNetTotal : singleNetAmount;
  const payAmount = useMemo(() => {
    if (isMultiCheckout) {
      return checkoutItems.reduce(
        (s, i) => {
          const incomingPrice = Number(i?.price || 0);
          if (!Number.isFinite(incomingPrice)) return s;
          if (i?.type === 'checkout-order') return s + incomingPrice;
          if (i?.type === 'custom-neon') return s + payableFromNet(incomingPrice, vatInclusive);
          return s + incomingPrice;
        },
        0
      );
    }
    return isNeonNetCheckout ? payableFromNet(singleNetAmount, vatInclusive) : singleNetAmount;
  }, [
    isMultiCheckout,
    checkoutItems,
    vatInclusive,
    isNeonNetCheckout,
    singleNetAmount,
  ]);

  const lineDisplayAmount = (item) => {
    const incomingPrice = Number(item?.price || 0);
    if (!Number.isFinite(incomingPrice)) return 0;
    if (item?.type === 'checkout-order') return incomingPrice;
    if (item?.type === 'custom-neon') return payableFromNet(incomingPrice, vatInclusive);
    return incomingPrice;
  };

  const checkoutBannerTitle = isMultiCheckout
    ? `Your order (${checkoutItems.length} ${checkoutItems.length === 1 ? 'item' : 'items'})`
    : checkoutData?.title || 'Secure Checkout';

  const reviewSummaryRows = useMemo(
    () => pickOrderReviewSummaryRows(checkoutData?.summary),
    [checkoutData?.summary]
  );
  const sanitizedCustomerInfo = {
    name: String(customerInfo.name || '').trim(),
    email: String(customerInfo.email || '').trim().toLowerCase(),
    phone: String(customerInfo.phone || '').trim(),
    address: String(customerInfo.address || '').trim(),
    city: String(customerInfo.city || '').trim(),
    postalCode: String(customerInfo.postalCode || '').trim(),
    orderComments: String(customerInfo.orderComments || '').trim(),
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedCustomerInfo.email);
  const isPhoneValid = /^[+0-9()\-\s]{7,30}$/.test(sanitizedCustomerInfo.phone);
  const isUkPostcodeLoose = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(sanitizedCustomerInfo.postalCode.replace(/\s+/g, ' ').trim());

  const submitBlockedReason = (() => {
    if (isPaying) return null;
    if (!sanitizedCustomerInfo.name) return 'Enter your full name in Contact & Delivery.';
    if (!sanitizedCustomerInfo.email) return 'Enter your email address.';
    if (!isEmailValid) return 'Enter a valid email address.';
    if (!sanitizedCustomerInfo.phone) return 'Enter your phone number.';
    if (!isPhoneValid) return 'Enter a valid phone number (digits, spaces, + and brackets allowed).';
    if (!sanitizedCustomerInfo.address) return 'Enter your street address.';
    if (!sanitizedCustomerInfo.city) return 'Enter your city or town.';
    if (!sanitizedCustomerInfo.postalCode) return 'Enter your postcode.';
    if (!isUkPostcodeLoose) return 'Enter a valid UK postcode (e.g. SW1A 1AA).';
    if (!acceptTerms) return 'Tick the box to accept the Terms & Conditions.';
    return null;
  })();

  const buildLineItemsForAdmin = () =>
    isMultiCheckout && checkoutItems?.length
      ? checkoutItems.map((item) => {
          const normalizedSelectedAttributes = normalizeSelectedAttributesFromLineItem(item);
          const cleaned = stripHeavyFieldsFromLineItem({
            ...item,
            selectedAttributes: normalizedSelectedAttributes,
          });
          return {
            ...cleaned,
            selectedAttributes: normalizedSelectedAttributes,
          };
        })
      : [
          stripHeavyFieldsFromLineItem({
            type: 'checkout-line',
            title: checkoutData?.title || 'Order',
            description:
              typeof checkoutData?.description === 'string'
                ? checkoutData?.description.slice(0, 800)
                : '',
            quantity: 1,
            price: payAmount,
            summary: Array.isArray(checkoutData?.summary) ? checkoutData?.summary : [],
            source: checkoutData?.source,
            thirdPartyProductKey: checkoutData?.thirdPartyProductKey,
            artworkPreviewUrl: checkoutData?.artworkPreviewUrl,
            fileUrls: checkoutData?.fileUrls,
            deliveryOption: checkoutData?.deliveryOption,
            selectedAttributes:
              checkoutData?.selectedAttributes &&
              typeof checkoutData?.selectedAttributes === 'object' &&
              !Array.isArray(checkoutData?.selectedAttributes)
                ? checkoutData?.selectedAttributes
                : {},
          }),
        ];

  /**
   * Apply any user-uploaded artwork overrides to a line. If an override exists
   * for the line key, replace `fileUrls` / `artworkPreviewUrl` and clear
   * `withoutArtwork` so Tradeprint validates against the new artwork.
   */
  const applyArtworkOverrideToLine = (item, key) => {
    const override = artworkOverridesByLine[key];
    if (!override?.url) return item;
    return {
      ...item,
      fileUrls: [override.url],
      artworkPreviewUrl: override.url,
      withoutArtwork: false,
      artworkAttached: true,
    };
  };

  const runThirdPartyPreValidation = async () => {
    setValidationErrors([]);
    setValidationSummary('');

    if (paymentMethod !== 'worldpay-card') return true;

    const lineItemsForAdmin = buildLineItemsForAdmin();
    // Apply any artwork re-uploads the user has made since the last attempt
    // before sending the validation request.
    const linesWithOverrides = lineItemsForAdmin.map((item, idx) =>
      applyArtworkOverrideToLine(item, getCheckoutLineKey(item, idx)),
    );
    const thirdPartyLines = linesWithOverrides.filter(
      (item) => String(item?.source || '').trim() === 'third-party'
    );
    if (thirdPartyLines.length === 0) return true;

    const linesReadyForValidation = await normalizeThirdPartyLinesForValidation(thirdPartyLines);

    const artworkIssues = linesReadyForValidation
      .map((line, index) => {
        const urls = getTradeprintFileUrls(line);
        if (urls.length === 0) return null;
        const bad = urls.filter((url) => !isTradeprintPrintReadyArtworkUrl(url));
        if (bad.length === 0) return null;
        return {
          index,
          title: line.title || line.name || `Item ${index + 1}`,
          urls: bad,
        };
      })
      .filter(Boolean);

    if (artworkIssues.length > 0) {
      const summary =
        'Tradeprint requires print-ready PDF artwork for this product. Please upload a PDF (not a JPG/PNG photo) on the product page or re-upload below.';
      setValidationSummary(summary);
      setValidationErrors(
        artworkIssues.map((issue) => ({
          message: `${issue.title}: artwork must be a PDF file.`,
          property: `instance.orderItems[${issue.index}]`,
          argument: 'fileUrls',
        })),
      );
      setNeedsArtworkReupload(true);
      setFailingArtworkLineKeys(
        linesWithOverrides
          .map((item, idx) => ({ item, key: getCheckoutLineKey(item, idx) }))
          .filter((entry) => String(entry.item?.source || '').trim() === 'third-party')
          .map((entry) => entry.key),
      );
      toast.error(summary);
      return false;
    }

    try {
      const result = await thirdPartyService.validateOrders({
        lineItems: linesReadyForValidation,
        customerInfo: sanitizedCustomerInfo,
        orderReference: `CHECKOUT-${Date.now()}`,
      });
      if (result?.success) {
        // Validation cleared — drop the re-upload panel state.
        setNeedsArtworkReupload(false);
        setFailingArtworkLineKeys([]);
        return true;
      }

      const details = Array.isArray(result?.errorDetails) ? result.errorDetails : [];
      const summary =
        result?.errorMessage ||
        details[0]?.message ||
        'We could not validate your order with the printer. Please review the details and try again.';
      setValidationSummary(summary);
      setValidationErrors(details);

      const isArtworkIssue = isArtworkValidationFailure(summary, details);
      if (isArtworkIssue) {
        // Map third-party lines back to keys so the UI can highlight which
        // ones need a fresh upload. If errorDetails specifies indices, only
        // mark those; otherwise mark every third-party line.
        const flaggedIndices = extractFailingOrderItemIndices(details);
        const thirdPartyKeys = [];
        let tpCounter = 0;
        linesWithOverrides.forEach((item, idx) => {
          if (String(item?.source || '').trim() !== 'third-party') return;
          const key = getCheckoutLineKey(item, idx);
          const indexAmongThirdParty = tpCounter;
          tpCounter += 1;
          if (
            flaggedIndices.length === 0 ||
            flaggedIndices.includes(indexAmongThirdParty)
          ) {
            thirdPartyKeys.push(key);
          }
        });

        setFailingArtworkLineKeys(thirdPartyKeys);
        setNeedsArtworkReupload(true);
        toast.error(
          'Your artwork was rejected by the printer. Please upload a new file to continue.',
        );
      } else {
        setNeedsArtworkReupload(false);
        setFailingArtworkLineKeys([]);
        toast.error(summary);
      }
      return false;
    } catch (error) {
      const summary =
        error?.data?.message ||
        error?.message ||
        'Order validation request failed. Please try again.';
      setValidationSummary(summary);
      setValidationErrors([]);
      setNeedsArtworkReupload(false);
      setFailingArtworkLineKeys([]);
      toast.error(summary);
      return false;
    }
  };

  const handleCheckout = async (paymentPayload = null) => {
    if (isPaying) return;
    if (!sanitizedCustomerInfo.name || !sanitizedCustomerInfo.email || !sanitizedCustomerInfo.phone
      || !sanitizedCustomerInfo.address || !sanitizedCustomerInfo.city || !sanitizedCustomerInfo.postalCode) {
      toast.error('Please complete all contact and address fields (including city and postcode).');
      return;
    }
    if (!isUkPostcodeLoose) {
      toast.error('Please enter a valid UK postcode.');
      return;
    }
    if (!isEmailValid) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!isPhoneValid) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    if (!acceptTerms) {
      toast.error('Please accept the Terms & Conditions to continue.');
      return;
    }

    try {
      setIsPaying(true);
      let paymentId = null;
      if (paymentMethod === 'worldpay-card') {
        const sessionForCharge = paymentPayload?.sessionHref || paymentPayload?.sessionState;
        if (!sessionForCharge) {
          throw new Error('Secure card session was not generated. Please re-enter card details and try again.');
        }
        const lineItemsForAdmin = buildLineItemsForAdmin().map((item, idx) =>
          applyArtworkOverrideToLine(item, getCheckoutLineKey(item, idx)),
        );

        const orderReference = `CHECKOUT-${Date.now()}`;

        const paymentResult = await paymentService.chargeWorldpay({
          sessionState: sessionForCharge,
          amount: payAmount,
          currency: 'GBP',
          orderReference,
          customerInfo: sanitizedCustomerInfo,
          billingAddress: {
            address1: sanitizedCustomerInfo.address,
            city: sanitizedCustomerInfo.city,
            postalCode: sanitizedCustomerInfo.postalCode,
            countryCode: 'GB',
          },
          lineItems: lineItemsForAdmin,
          orderDetails: isMultiCheckout
            ? {
                title: `Order (${checkoutItems.length} items)`,
                description: 'Multi-item checkout',
                summary: checkoutItems.map((item, idx) => ({
                  label: (item.title || item.name || `Item ${idx + 1}`).slice(0, 100),
                  value: `Qty ${item.quantity || 1} · £${lineDisplayAmount(item).toFixed(2)}`,
                })),
              }
            : {
                title: checkoutData?.title,
                description: checkoutData?.description,
                summary: checkoutData?.summary || [],
              },
        });
        paymentId = paymentResult?.paymentId || null;

        let tradeprintResult = null;
        const hasThirdPartyLines = lineItemsForAdmin.some(
          (item) => String(item?.source || '').trim() === 'third-party',
        );
        if (hasThirdPartyLines) {
          tradeprintResult = await submitTradeprintOrderAfterPayment({
            lineItems: lineItemsForAdmin,
            customerInfo: sanitizedCustomerInfo,
            orderReference: paymentResult?.orderReference || orderReference,
          });
        }
        if (tradeprintResult?.success === false && !tradeprintResult?.skipped) {
          console.warn('[checkout] payment succeeded but Tradeprint placement failed', tradeprintResult);
          toast.warn(
            'Payment received. Our team will complete your print order submission shortly.',
          );
        }

        const ref = paymentResult?.orderReference || paymentId || '—';
        const trackingId = paymentResult?.trackingId || null;
        const receiptEmailSent = Boolean(paymentResult?.receiptEmailSent);
        const receiptEmailReason = paymentResult?.receiptEmailReason ?? null;

        try {
          await clearCart();
        } catch (clearErr) {
          console.warn('[checkout] payment succeeded but basket clear failed', clearErr);
        }
        try {
          await refreshCart();
        } catch (refreshErr) {
          console.warn('[checkout] payment succeeded but basket refresh failed', refreshErr);
        }

        navigate('/payment-success', {
          replace: true,
          state: {
            paymentSuccess: true,
            orderReference: ref,
            paymentId,
            trackingId,
            amount: payAmount,
            currency: 'GBP',
            email: sanitizedCustomerInfo.email,
            customerName: sanitizedCustomerInfo.name,
            orderTitle: isMultiCheckout
              ? checkoutItems.length === 1
                ? checkoutItems[0].title || checkoutItems[0].name || 'Order'
                : `${checkoutItems.length} items`
              : checkoutData?.title,
            receiptEmailSent,
            receiptEmailReason,
            tradeprintOrderReference:
              tradeprintResult?.orderReference ||
              tradeprintResult?.tradeprintOrder?.orderReference ||
              null,
            tradeprintStatus:
              tradeprintResult?.tradeprintOrder?.status ||
              (tradeprintResult?.success ? 'Processing' : null),
          },
        });
        return;
      }

      toast.success('Your order details have been saved. Complete payment when card checkout is available.');

      await addToCart(
        {
          id: `checkout-${Date.now()}`,
          type: 'checkout-order',
          title: isMultiCheckout
            ? `Order (${checkoutItems.length} items)`
            : checkoutData?.title,
          description: isMultiCheckout
            ? 'Multi-item checkout (pending payment)'
            : checkoutData?.description,
          paymentMethod,
          paymentId,
          price: payAmount,
          quantity: 1,
          customer: sanitizedCustomerInfo,
        },
        1
      );

      navigate('/');
    } catch (error) {
      if (paymentMethod === 'worldpay-card' && isRecoverableWorldpaySessionConflict(error)) {
        setWorldpayReloadSignal((v) => v + 1);
        toast.error(
          'We refreshed secure card fields for a safe retry. Please re-enter card details and submit again.'
        );
        return;
      }
      toast.error(formatPaymentErrorForToast(error));
    } finally {
      setIsPaying(false);
    }
  };
  // List of third-party lines that should be shown in the artwork re-upload
  // panel. Falls back to all third-party lines when the validate API didn't
  // tell us which one(s) failed.
  const artworkReuploadLines = useMemo(() => {
    if (!needsArtworkReupload) return [];
    const allLines = buildLineItemsForAdmin();
    const thirdPartyEntries = allLines
      .map((item, idx) => ({ item, key: getCheckoutLineKey(item, idx) }))
      .filter((entry) => String(entry.item?.source || '').trim() === 'third-party');
    if (failingArtworkLineKeys.length === 0) return thirdPartyEntries;
    const keySet = new Set(failingArtworkLineKeys);
    return thirdPartyEntries.filter((entry) => keySet.has(entry.key));
    // buildLineItemsForAdmin reads checkoutItems / checkoutData from closure,
    // both of which are already in the dependency list via their drivers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    needsArtworkReupload,
    failingArtworkLineKeys,
    isMultiCheckout,
    checkoutItems,
    checkoutData,
    payAmount,
  ]);

  const handleArtworkReupload = async (key, file) => {
    if (!file) return;
    setArtworkUploadErrorByLine((prev) => ({ ...prev, [key]: '' }));
    setArtworkUploadingByLine((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await uploadService.uploadArtwork(file);
      const hostedUrl = result?.url;
      if (!hostedUrl) {
        throw new Error('Upload did not return a URL.');
      }
      setArtworkOverridesByLine((prev) => ({
        ...prev,
        [key]: { url: hostedUrl, fileName: file.name || 'artwork' },
      }));
      // Clear the prior error banner so the user sees the cleared state and
      // can press Pay Securely again.
      setValidationErrors([]);
      setValidationSummary('');
      toast.success('Artwork uploaded. You can now retry the payment.');
    } catch (error) {
      console.error('[checkout] artwork re-upload failed', error);
      const message =
        error?.data?.message ||
        error?.message ||
        'Could not upload artwork. Please try again.';
      setArtworkUploadErrorByLine((prev) => ({ ...prev, [key]: message }));
      toast.error(message);
    } finally {
      setArtworkUploadingByLine((prev) => ({ ...prev, [key]: false }));
    }
  };

  const dismissArtworkReupload = () => {
    setNeedsArtworkReupload(false);
    setFailingArtworkLineKeys([]);
    setArtworkUploadErrorByLine({});
  };

  const isAnyArtworkUploading = Object.values(artworkUploadingByLine).some(Boolean);
  const allFlaggedLinesHaveOverride =
    artworkReuploadLines.length > 0 &&
    artworkReuploadLines.every((entry) => Boolean(artworkOverridesByLine[entry.key]?.url));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl space-y-6">
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Secure Checkout
              </h1>
              <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Complete your payment safely with Worldpay.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Back Home
            </button>
          </div>
        </div>

        {/* Slider-only section as requested */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-xl text-white shadow-lg p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-200" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Checkout Highlights
          </p>
          <h2 className="text-xl font-bold mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            {sliderItems[activeSlide].title}
          </h2>
          <p className="text-sm text-blue-100 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            {sliderItems[activeSlide].text}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {sliderItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`h-2.5 rounded-full transition-all ${idx === activeSlide ? 'w-7 bg-white' : 'w-2.5 bg-white/40'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {(validationSummary || validationErrors.length > 0) && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3l-6.93-12a2 2 0 00-3.48 0L3.34 16a2 2 0 001.73 3z"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold text-red-800"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  We can't process this order yet
                </p>
                {validationSummary && (
                  <p
                    className="text-sm text-red-700 mt-1"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    {validationSummary}
                  </p>
                )}
                {validationErrors.length > 0 && (
                  <ul
                    className="mt-2 list-disc list-inside space-y-1 text-xs text-red-700"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    {validationErrors.map((err, idx) => (
                      <li key={`${err?.argument || 'err'}-${idx}`}>
                        {err?.argument ? (
                          <span className="font-semibold">{err.argument}: </span>
                        ) : null}
                        {err?.message || 'Validation failed.'}
                      </li>
                    ))}
                  </ul>
                )}
                <p
                  className="text-[11px] text-red-600 mt-2"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Please update your selection and try again. Your card has not been charged.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValidationSummary('');
                  setValidationErrors([]);
                }}
                className="text-xs font-semibold text-red-700 hover:text-red-900"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {needsArtworkReupload && artworkReuploadLines.length > 0 && (
          <section
            className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm"
            role="region"
            aria-label="Artwork re-upload required"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-amber-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Re-upload your artwork to continue
                  </h3>
                  <p className="text-sm text-amber-800 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    The printer couldn't validate the artwork supplied for the
                    {artworkReuploadLines.length === 1 ? ' item' : ' items'} below.
                    Upload a new file (image or PDF) and we'll re-check before any payment is taken.
                    Your card has not been charged.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismissArtworkReupload}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Dismiss
              </button>
            </div>

            <ul className="mt-4 space-y-3">
              {artworkReuploadLines.map(({ item, key }, idx) => {
                const override = artworkOverridesByLine[key];
                const isUploading = Boolean(artworkUploadingByLine[key]);
                const lineError = artworkUploadErrorByLine[key];
                const itemTitle = item?.title || item?.name || `Item ${idx + 1}`;
                const previewUrl = override?.url || (
                  /^https?:\/\//i.test(String(item?.artworkPreviewUrl || ''))
                    ? item.artworkPreviewUrl
                    : ''
                );
                const isImagePreview = previewUrl && !/\.pdf(\?|$)/i.test(previewUrl);

                return (
                  <li
                    key={key}
                    className="rounded-xl bg-white border border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-lg bg-amber-50 border border-amber-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {previewUrl && isImagePreview ? (
                          <img src={previewUrl} alt={`${itemTitle} artwork`} className="w-full h-full object-cover" />
                        ) : previewUrl ? (
                          <span className="text-[10px] font-semibold text-amber-700 px-1 text-center leading-tight">PDF</span>
                        ) : (
                          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4 4 4m0 0l4-4 4 4M4 8h16" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-semibold text-gray-900 truncate"
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          title={itemTitle}
                        >
                          {itemTitle}
                        </p>
                        <p
                          className="text-[11px] text-gray-500 mt-0.5"
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          Qty {item?.quantity || 1} · Source: {formatSourceLabel(item?.source) || 'Trade Print'}
                        </p>
                        {override ? (
                          <p
                            className="text-[11px] text-green-700 font-medium mt-1 flex items-center gap-1.5"
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            New artwork uploaded{override.fileName ? ` · ${override.fileName}` : ''}
                          </p>
                        ) : isUploading ? (
                          <p
                            className="text-[11px] text-blue-700 font-medium mt-1 flex items-center gap-1.5"
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                            Uploading new artwork…
                          </p>
                        ) : lineError ? (
                          <p
                            className="text-[11px] text-red-600 font-medium mt-1"
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            {lineError}
                          </p>
                        ) : (
                          <p
                            className="text-[11px] text-amber-700 font-medium mt-1"
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            Upload a replacement file to retry validation.
                          </p>
                        )}
                      </div>
                    </div>

                    <label className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60 sm:flex-shrink-0">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleArtworkReupload(key, file);
                          e.target.value = '';
                        }}
                      />
                      {isUploading
                        ? 'Uploading…'
                        : override
                          ? 'Replace artwork'
                          : 'Upload artwork'}
                    </label>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
              <p
                className="text-[11px] text-amber-800"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                {allFlaggedLinesHaveOverride
                  ? 'All artwork ready. Press Pay Securely below to re-validate and complete the order.'
                  : 'Once every flagged item has new artwork attached, press Pay Securely to retry.'}
              </p>
              <span
                className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                  allFlaggedLinesHaveOverride
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                {artworkReuploadLines.filter((e) => artworkOverridesByLine[e.key]).length}
                {' / '}
                {artworkReuploadLines.length} re-uploaded
              </span>
            </div>
          </section>
        )}

        <CommonCheckout
          title={checkoutBannerTitle}
          totalAmount={payAmount}
          onPreValidate={runThirdPartyPreValidation}
          orderSummary={
            isMultiCheckout ? (
              <div className="space-y-3">
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden bg-gray-50/40">
                  {checkoutItems.map((item, idx) => (
                    <li
                      key={item.lineId || item.id || `line-${idx}`}
                      className="flex justify-between gap-3 px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 leading-snug line-clamp-2">
                          {item.title || item.name || 'Item'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
                          Qty {item.quantity || 1}
                        </p>
                        {formatSourceLabel(item.source) ? (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Source: {formatSourceLabel(item.source)}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 font-semibold text-gray-900 tabular-nums self-start">
                        £{lineDisplayAmount(item).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-baseline gap-3 pt-1">
                  <span className="text-sm font-semibold text-gray-900">Total due</span>
                  <span className="text-lg font-bold text-blue-700 tabular-nums">
                    £{payAmount.toFixed(2)}
                  </span>
                </div>
                {allCustomNeon ? (
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Neon lines use your header VAT setting (UK 20% when Inc VAT is on).
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Item
                  </p>
                  <p
                    className="font-semibold text-gray-900 mt-1 leading-snug"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    {checkoutData?.title}
                  </p>
                  {checkoutSourceLabel ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Source: {checkoutSourceLabel}
                    </p>
                  ) : null}
                </div>
                {reviewSummaryRows.length > 0 ? (
                  <dl className="grid gap-2 text-sm">
                    {reviewSummaryRows.map((row) => (
                      <div key={row.label} className="flex justify-between gap-3 min-w-0">
                        <dt className="text-gray-500 shrink-0">{row.label}</dt>
                        <dd className="text-gray-900 font-medium text-right truncate" title={row.value}>
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {isNeonNetCheckout ? (
                  <div
                    className="border-t border-gray-100 pt-3 mt-1 space-y-2 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    <p className="text-xs text-gray-500">
                      Custom neon is priced <strong>ex VAT</strong>. Totals follow the header VAT switch (UK 20%).
                    </p>
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal (ex VAT)</span>
                      <span className="font-semibold tabular-nums">£{netAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>VAT (20%)</span>
                      <span className="font-semibold tabular-nums">
                        £{vatAmountFromNet(netAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Total (inc VAT)</span>
                      <span className="font-semibold tabular-nums">
                        £{grossFromNet(netAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-dashed border-gray-200">
                      <span>Due now {vatInclusive ? '(inc VAT)' : '(ex VAT)'}</span>
                      <span className="text-blue-700 tabular-nums">£{payAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900">Total due</span>
                    <span className="text-lg font-bold text-blue-700 tabular-nums">
                      £{payAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )
          }
          customerInfo={customerInfo}
          onCustomerInfoChange={setCustomerInfo}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          acceptTerms={acceptTerms}
          onAcceptTermsChange={setAcceptTerms}
          onSubmit={handleCheckout}
          isProcessingPayment={isPaying}
          submitDisabled={
            isPaying
            || !sanitizedCustomerInfo.name
            || !sanitizedCustomerInfo.email
            || !sanitizedCustomerInfo.phone
            || !sanitizedCustomerInfo.address
            || !sanitizedCustomerInfo.city
            || !sanitizedCustomerInfo.postalCode
            || !isEmailValid
            || !isPhoneValid
            || !isUkPostcodeLoose
            || !acceptTerms
            || isAnyArtworkUploading
            || (needsArtworkReupload && !allFlaggedLinesHaveOverride)
          }
          submitBlockedReason={
            isAnyArtworkUploading
              ? 'Please wait for your artwork to finish uploading.'
              : needsArtworkReupload && !allFlaggedLinesHaveOverride
                ? 'Upload artwork for every flagged item to retry payment.'
                : submitBlockedReason
          }
          submitLabel={
            isPaying
              ? 'Processing Payment...'
              : needsArtworkReupload
                ? 'Retry Payment'
                : 'Pay Securely'
          }
          worldpayReloadSignal={worldpayReloadSignal}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
