'use strict';

function setCart({ items }) {
  window.localStorage.setItem('cart', JSON.stringify(items));
}
function getCart() {
  return JSON.parse(window.localStorage.getItem('cart'));
}
function clearCart() {
  window.localStorage.removeItem('cart');
}

function addToCart({ productId, quantity, price }, element) {
  if (element) {
    element.disabled = true;
    element.style.cursor = 'not-allowed';
    element.textContent = 'Ajout...';
  }
  const cart = getCart() || [];
  const existingItem = cart.find((item) => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity, price });
  }
  setCart({ items: cart });
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'CAD',
      value: price * quantity,
      items: [
        {
          item_id: productId,
          price,
          quantity,
        },
      ],
    },
  });
  setTimeout(() => {
    document.location.reload();
  }, 600);
}

function removeFromCart({ productId, quantity }) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.productId === productId);
  if (existingItem) {
    if (existingItem.quantity > quantity) {
      existingItem.quantity -= quantity;
    } else {
      cart.splice(cart.indexOf(existingItem), 1);
    }
  }
  setCart({ items: cart });
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'remove_from_cart',
    ecommerce: {
      currency: 'CAD',
      value: existingItem.price * quantity,
      items: [
        {
          item_id: productId,
          price: existingItem.price,
          quantity,
        },
      ],
    },
  });
  document.location.reload();
}

function storeGTMContainerId(gtmContainerId) {
  const gtmCookieMaxAgeDays = 180;
  document.cookie = `gtm-container-id=${gtmContainerId}; max-age=${gtmCookieMaxAgeDays * 24 * 60 * 60
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

window.addEventListener('DOMContentLoaded', () => {
  window.getCart = getCart;
  window.addToCart = addToCart;

  if (
    document.location.href.includes('/cart') ||
    document.location.href.includes('/checkout')
  ) {
    const cart = getCart();
    const cartTable = document.getElementById('cart');
    const cartBody = cartTable.querySelector('tbody');
    const cartFoot = cartTable.querySelector('tfoot');
    const cartTotal = cartFoot.querySelector('#orderTotal');
    for (const product of cart) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><a href="../products/${product.productId}">${product.productId
        }</a></td>
        <td>${product.price} $</td>
        <td>${product.quantity}</td>
        <td>
          <button
            class="quantity-btn"
            onclick="addToCart({ productId: '${product.productId
        }', quantity: 1, price: ${product.price} }, undefined)">
            <img src="../icons/circle-plus.svg" alt="Add" width="20" height="20">
          </button>
          <button
            class="quantity-btn"
            onclick="removeFromCart({ productId: '${product.productId
        }', quantity: 1 })">
            <img src="../icons/circle-minus.svg" alt="Remove" width="20" height="20">
          </button>
        </td>
        <td>${(product.price * product.quantity).toFixed(2)} $</td>
        <td>
          <button
            class="delete-btn"
            onclick="removeFromCart({ productId: '${product.productId
        }', quantity: ${product.quantity} })">
            <img src="../icons/trash.svg" alt="Remove" width="20" height="20">
          </button>
        </td>
      `;
      cartBody.appendChild(row);
    }
    const total = cart.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
    cartTotal.textContent = total.toFixed(2) + ' $';
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: document.location.href.includes('/cart')
        ? 'view_cart'
        : 'begin_checkout',
      ecommerce: {
        value: total,
        currency: 'CAD',
        items: cart.map((product) => ({
          item_id: product.productId,
          price: product.price,
          quantity: product.quantity,
        })),
      },
    });
  } else if (
    document.location.href.includes('/confirmation') &&
    document.referrer.includes('/checkout')
  ) {
    const cart = getCart();
    const purchaseAmount = cart.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
    const orderId = Date.now().toString() + Math.random().toString();
    document.getElementById('confirmation-container').innerHTML = `
      <h1>✅ Thank you for your purchase!</h1>
      <p>Your order ID is ${orderId}.</p>
      <p>Your purchase amount is ${purchaseAmount.toFixed(2)} $.</p>
    `;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: orderId,
        value: purchaseAmount,
        tax: 0,
        shipping: 0,
        currency: 'CAD',
        items: cart.map((product) => ({
          item_id: product.productId,
          price: product.price,
          quantity: product.quantity,
        })),
      },
    });
    clearCart();
  }
});

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
