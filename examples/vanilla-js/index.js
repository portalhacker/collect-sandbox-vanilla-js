'use strict';

function storeGTMContainerId(gtmContainerId) {
  const gtmCookieMaxAgeDays = 180;
  document.cookie = `gtm-container-id=${gtmContainerId}; max-age=${
    gtmCookieMaxAgeDays * 24 * 60 * 60
  }; path=/`;
}

function getGTMContainerIdCookie() {
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('gtm-container-id='))
    ?.split('=')[1];
}

function initGTM(gtmContainerId) {
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', gtmContainerId);
}

function updatetGTMContainerIDInputPlaceholder(gtmContainerId) {
  const gtmContainerIdInput = document.querySelector('#gtm-container-id-input');
  gtmContainerIdInput.placeholder = gtmContainerId;
}

const gtmContainerIdParam = new URLSearchParams(window.location.search).get(
  'gtm-container-id'
);
if (gtmContainerIdParam) {
  storeGTMContainerId(gtmContainerIdParam);
}
const gtmContainerIdCookie = getGTMContainerIdCookie();
if (gtmContainerIdCookie) {
  initGTM(gtmContainerIdCookie);
  updatetGTMContainerIDInputPlaceholder(gtmContainerIdCookie);
}
