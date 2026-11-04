import { useEffect } from 'react';

const DEFAULT_TITLE = 'River Signs & Print | Custom Signage, Printing & Fabrication';
const DEFAULT_DESCRIPTION =
  'River Signs & Print provides custom signage, commercial printing, window graphics, fabrication, and print products in Middlesbrough. Get a free quote today.';

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function usePageSeo({ title, description, path, image, noindex = false, jsonLd } = {}) {
  useEffect(() => {
    const nextTitle = stripHtml(title) || DEFAULT_TITLE;
    const nextDescription = stripHtml(description) || DEFAULT_DESCRIPTION;
    const origin = window.location.origin;
    const canonical = `${origin}${path || window.location.pathname}`;
    const ogImage = image || `${origin}/og-image.png`;

    const previousTitle = document.title;
    document.title = nextTitle;
    upsertMeta('name', 'description', nextDescription);
    upsertMeta('property', 'og:title', nextTitle);
    upsertMeta('property', 'og:description', nextDescription);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:image:width', '1200');
    upsertMeta('property', 'og:image:height', '630');
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'River Signs & Print');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:image', ogImage);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertLink('canonical', canonical);

    let scriptEl;
    if (jsonLd) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.setAttribute('data-rspuk-jsonld', '1');
      scriptEl.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }

    return () => {
      document.title = previousTitle;
      scriptEl?.remove();
    };
  }, [title, description, path, image, noindex, jsonLd]);
}

export default usePageSeo;
