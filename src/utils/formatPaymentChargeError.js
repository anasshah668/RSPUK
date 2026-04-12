/**
 * Walk nested API payloads (Worldpay-style details.validationErrors, etc.)
 */
function collectValidationMessages(node, out, seen) {
  if (node == null || typeof node !== "object") return;
  const errs = node.validationErrors;
  if (Array.isArray(errs)) {
    errs.forEach((e) => {
      const msg = String(e?.message || "").trim();
      if (msg && !seen.has(msg)) {
        seen.add(msg);
        out.push(msg);
      }
    });
  }
  if (node.details) collectValidationMessages(node.details, out, seen);
}

function firstNonEmpty(...candidates) {
  for (const c of candidates) {
    const t = String(c ?? "").trim();
    if (t) return t;
  }
  return "";
}

/**
 * End-user friendly copy: short headline + bullet points (no raw JSON).
 * @returns {{ headline: string, bullets: string[], hint?: string }}
 */
export function parsePaymentChargeError(error) {
  const data = error?.data;
  const status = error?.status;

  const seen = new Set();
  const bullets = [];
  if (data && typeof data === "object") {
    collectValidationMessages(data, bullets, seen);
  }

  const apiDetail = firstNonEmpty(
    data?.details?.message,
    data?.message,
    typeof data === "string" ? data : "",
  );

  const topMessage = String(error?.message || "").trim();

  let headline = "";
  if (bullets.length > 0) {
    headline = "Your payment could not be completed.";
  } else {
    headline =
      firstNonEmpty(apiDetail, topMessage) ||
      "Your payment could not be completed.";
  }

  const bulletSet = new Set(bullets);
  if (bullets.length === 0) {
    const extra = firstNonEmpty(
      topMessage !== headline ? topMessage : "",
      apiDetail !== headline ? apiDetail : "",
    );
    if (extra && !bulletSet.has(extra) && extra !== headline) {
      bullets.push(extra);
    }
  }

  // Network / timeout — keep one clear line
  if (!data && topMessage) {
    return {
      headline: "We couldn't reach the payment service.",
      bullets: [topMessage],
      hint: status ? `Error code: ${status}` : undefined,
    };
  }

  let hint;
  if (status >= 500) {
    hint =
      "Something went wrong on our side. Please try again in a few minutes.";
  } else if (status === 401 || status === 403) {
    hint =
      "The payment service is not configured correctly. Please contact support.";
  } else if (bullets.length > 0) {
    hint =
      "Please check the details above and try again, or use a different card.";
  }

  return { headline, bullets, hint };
}

/**
 * Single string for default react-toastify (same pattern as other app toasts).
 */
export function formatPaymentErrorForToast(error) {
  const { headline, bullets, hint } = parsePaymentChargeError(error);
  const lines = [headline];
  bullets.forEach((b) => lines.push(`• ${b}`));
  if (hint) lines.push(hint);
  return lines.join("\n");
}

/**
 * @deprecated Prefer parsePaymentChargeError for UI; kept for debugging.
 */
export function formatPaymentChargeError(error) {
  const parts = [];
  if (error?.message) parts.push(`Message: ${error.message}`);
  if (error?.status != null) parts.push(`HTTP status: ${error.status}`);
  const data = error?.data;
  if (data !== undefined && data !== null) {
    try {
      parts.push(`Response body:\n${JSON.stringify(data, null, 2)}`);
    } catch {
      parts.push(`Response body:\n${String(data)}`);
    }
  } else {
    parts.push("(No response body.)");
  }
  return parts.join("\n\n");
}
