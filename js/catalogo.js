// Catálogo público con carrito — Delivery online demo (Pizzería IO Consulting).
// Reusa el mismo data/menu.json que menu-qr-demo (mismo "motor de catálogo").

let MENU = null;
const carrito = {}; // { itemId: { item, cantidad } }

// Escapa cualquier texto antes de insertarlo con innerHTML: lo que tipea el
// usuario y también lo que viene del menú (hoy es un JSON propio, pero mañana
// puede venir de un panel o una planilla editable por terceros).
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatearPrecio(n) {
  return '$' + n.toLocaleString('es-AR');
}

async function cargarMenu() {
  try {
    const res = await fetch('data/menu.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    MENU = await res.json();
  } catch (e) {
    document.getElementById('categorias').innerHTML =
      '<p class="cart-empty" role="alert">No pudimos cargar el menú. Recargá la página para volver a intentar.</p>';
    return;
  }
  document.getElementById('nombreNegocio').textContent = MENU.negocio.nombre;
  renderCategoryNav();
  renderCategorias();
}

function renderCategoryNav() {
  const nav = document.getElementById('categoryNav');
  nav.innerHTML = MENU.categorias.map((cat, i) =>
    `<button type="button" data-cat="${escapeHtml(cat.id)}" class="${i === 0 ? 'active' : ''}">${escapeHtml(cat.nombre)}</button>`
  ).join('');
  nav.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('cat-' + btn.dataset.cat).scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' });
    });
  });
}

function renderCategorias() {
  const cont = document.getElementById('categorias');
  cont.innerHTML = MENU.categorias.map((cat) => `
    <section id="cat-${escapeHtml(cat.id)}">
      <h2 class="categoria-titulo">${escapeHtml(cat.nombre)}</h2>
      ${cat.items.map((item) => renderItemCard(item)).join('')}
    </section>
  `).join('');
  cont.querySelectorAll('[data-agregar]').forEach((btn) => {
    btn.addEventListener('click', () => {
      agregarAlCarrito(btn.dataset.agregar);
    });
  });
  cont.querySelectorAll('[data-mas]').forEach((btn) => btn.addEventListener('click', () => cambiarCantidad(btn.dataset.mas, 1)));
  cont.querySelectorAll('[data-menos]').forEach((btn) => btn.addEventListener('click', () => cambiarCantidad(btn.dataset.menos, -1)));
}

// Control − cantidad + compartido por el catálogo y el panel del carrito.
function renderQtyControl(item, cantidad) {
  const id = escapeHtml(item.id);
  const nombre = escapeHtml(item.nombre);
  return `<div class="qty-control">
    <button type="button" class="qty-btn" data-menos="${id}" aria-label="Quitar uno de ${nombre}">−</button>
    <span class="qty-val" aria-label="${cantidad} en el pedido">${cantidad}</span>
    <button type="button" class="qty-btn" data-mas="${id}" aria-label="Agregar uno más de ${nombre}">+</button>
  </div>`;
}

function renderItemCard(item) {
  const enCarrito = carrito[item.id];
  const id = escapeHtml(item.id);
  const nombre = escapeHtml(item.nombre);
  const badges = `${item.destacado ? '<span class="badge badge-destacado">Recomendado</span>' : ''}${item.agotado ? '<span class="badge badge-agotado">Agotado</span>' : ''}`;
  const acciones = item.agotado
    ? `<button type="button" class="btn-agregar" disabled>Agotado</button>`
    : enCarrito
      ? renderQtyControl(item, enCarrito.cantidad)
      : `<button type="button" class="btn-agregar" data-agregar="${id}" aria-label="Agregar ${nombre} al pedido">Agregar</button>`;

  return `
    <div class="item-card" id="item-${id}">
      <div class="item-info">
        <h3>${nombre}${badges}</h3>
        ${item.descripcion ? `<p>${escapeHtml(item.descripcion)}</p>` : ''}
        <div class="item-precio">${formatearPrecio(item.precio)}</div>
      </div>
      <div class="item-actions">${acciones}</div>
    </div>
  `;
}

function buscarItemPorId(id) {
  for (const cat of MENU.categorias) {
    const item = cat.items.find((i) => i.id === id);
    if (item) return item;
  }
  return null;
}

function agregarAlCarrito(id) {
  const item = buscarItemPorId(id);
  if (!item || item.agotado) return;
  carrito[id] = { item, cantidad: 1 };
  refrescarVistas();
}

function cambiarCantidad(id, delta) {
  if (!carrito[id]) return;
  carrito[id].cantidad += delta;
  if (carrito[id].cantidad <= 0) delete carrito[id];
  refrescarVistas();
}

function totalCarrito() {
  return Object.values(carrito).reduce((acc, { item, cantidad }) => acc + item.precio * cantidad, 0);
}

function cantidadTotalItems() {
  return Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0);
}

// Las vistas se redibujan enteras, así que el botón que tenía el foco deja de
// existir. Se anota cuál era y se vuelve a enfocar su equivalente, para que
// quien navega con teclado no pierda el lugar.
function recordarFoco() {
  const el = document.activeElement;
  if (!el || !el.dataset) return null;
  const id = el.dataset.agregar || el.dataset.mas || el.dataset.menos;
  if (!id) return null;
  const zona = el.closest('#sidePanel') ? '#sidePanel' : '#categorias';
  return { id, zona, eraMenos: Boolean(el.dataset.menos) };
}

function restaurarFoco(foco) {
  if (!foco) return;
  const zona = document.querySelector(foco.zona);
  const sel = (attr) => zona.querySelector(`[data-${attr}="${CSS.escape(foco.id)}"]`);
  const destino = (foco.eraMenos ? sel('menos') : sel('mas')) || sel('mas') || sel('agregar')
    || zona.querySelector('#btnIrCheckout:not([disabled])')
    || document.getElementById('btnClosePanel');
  if (destino) destino.focus();
}

function refrescarVistas() {
  const foco = recordarFoco();
  renderCategorias();
  renderCartFab();
  if (typeof renderCarritoPanel === 'function') renderCarritoPanel();
  restaurarFoco(foco);
}

function renderCartFab() {
  const fab = document.getElementById('cartFab');
  const cant = cantidadTotalItems();
  if (cant === 0) {
    fab.classList.remove('visible');
    return;
  }
  fab.classList.add('visible');
  const total = formatearPrecio(totalCarrito());
  fab.setAttribute('aria-label', `Ver pedido: ${cant} ${cant === 1 ? 'producto' : 'productos'}, total ${total}`);
  fab.innerHTML = `<span aria-hidden="true">🛒</span> Ver pedido <span class="cart-count">${cant}</span> · ${total}`;
}

document.addEventListener('DOMContentLoaded', cargarMenu);
