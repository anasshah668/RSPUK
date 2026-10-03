import { useEffect } from 'react';

const DEFAULT_TITLE = 'Custom Signage, Printing & Fabrication Company | RSP UK';
const DEFAULT_DESCRIPTION =
  'RSP UK provides custom signage, commercial printing, window graphics, fabrication, and print products in Middlesbrough. Get a free quote today.';

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

export function usePageSeo({ title, description, path, image } = {}) {
  useEffect(() => {
    const nextTitle = title || DEFAULT_TITLE;
    const nextDescription = description || DEFAULT_DESCRIPTION;
    const origin = window.location.origin;
    const canonical = `${origin}${path || window.location.pathname}`;
    const ogImage = image || `${origin}/logo.png`;

    const previousTitle = document.title;
    document.title = nextTitle;
    upsertMeta('name', 'description', nextDescription);
    upsertMeta('property', 'og:title', nextTitle);
    upsertMeta('property', 'og:description', nextDescription);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertLink('canonical', canonical);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, path, image]);
}

export default usePageSeo;
