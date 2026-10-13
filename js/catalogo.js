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
  aplicarNombreNegocio(leerNegocioDeUrl());
  renderCategoryNav();
  renderCategorias();
  activarScrollSpy();
}

/* ---------- Navegación de categorías ---------- */

function renderCategoryNav() {
  const nav = document.getElementById('categoryNav');
  nav.innerHTML = '<span class="nav-indicador" id="navIndicador" aria-hidden="true"></span>'
    + MENU.categorias.map((cat) =>
      `<button type="button" data-cat="${escapeHtml(cat.id)}">${escapeHtml(cat.nombre)}</button>`
    ).join('');
  nav.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('cat-' + btn.dataset.cat).scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' });
    });
  });
  marcarCategoriaActiva(MENU.categorias[0].id);
}

// Mueve la "pastilla" de color hasta la categoría activa.
function marcarCategoriaActiva(catId) {
  const nav = document.getElementById('categoryNav');
  const btn = nav.querySelector(`button[data-cat="${CSS.escape(catId)}"]`);
  if (!btn || btn.classList.contains('active')) return;
  nav.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b === btn);
    if (b === btn) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
  });
  ubicarIndicador();
  // En celular la barra scrollea de costado: se acompaña sin mover la página.
  const centro = btn.offsetLeft - (nav.clientWidth - btn.offsetWidth) / 2;
  nav.scrollTo({ left: Math.max(0, centro), behavior: 'smooth' });
}

function ubicarIndicador() {
  const nav = document.getElementById('categoryNav');
  const btn = nav.querySelector('button.active');
  const ind = document.getElementById('navIndicador');
  if (!btn || !ind) return;
  ind.style.width = btn.offsetWidth + 'px';
  ind.style.height = btn.offsetHeight + 'px';
  ind.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
  ind.classList.add('listo');
}

// La categoría activa sigue al scroll de la página.
function activarScrollSpy() {
  const nav = document.getElementById('categoryNav');
  let pendiente = false;
  const actualizar = () => {
    pendiente = false;
    const limite = nav.getBoundingClientRect().bottom + 24;
    let activa = MENU.categorias[0].id;
    for (const cat of MENU.categorias) {
      if (document.getElementById('cat-' + cat.id).getBoundingClientRect().top <= limite) activa = cat.id;
    }
    const alFinal = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (alFinal) activa = MENU.categorias[MENU.categorias.length - 1].id;
    marcarCategoriaActiva(activa);
    revelarVisibles();
  };
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } };
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', () => { ubicarIndicador(); pedir(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ubicarIndicador);
}

/* ---------- Tarjetas de producto ---------- */

function renderCategorias() {
  const cont = document.getElementById('categorias');
  cont.innerHTML = MENU.categorias.map((cat) => `
    <section id="cat-${escapeHtml(cat.id)}">
      <h2 class="categoria-titulo">${escapeHtml(cat.nombre)} <span class="categoria-cant">${cat.items.length}</span></h2>
      ${cat.items.map((item) => renderItemCard(item)).join('')}
    </section>
  `).join('');
  revelarAlScrollear(cont);
}

// Los clics se escuchan una sola vez en el contenedor: las tarjetas ya no se
// redibujan enteras, solo cambia el control de la que se tocó.
function escucharCatalogo() {
  document.getElementById('categorias').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.agregar) agregarAlCarrito(btn.dataset.agregar);
    else if (btn.dataset.mas) cambiarCantidad(btn.dataset.mas, 1, '#categorias');
    else if (btn.dataset.menos) cambiarCantidad(btn.dataset.menos, -1, '#categorias');
  });
}

// Las tarjetas aparecen de a una cuando entran en pantalla. Se revisa a mano
// en cada scroll (no con IntersectionObserver) para que ninguna pueda quedar
// invisible si el navegador demora o no entrega el aviso.
let tarjetasPorRevelar = [];

function revelarAlScrollear(cont) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  tarjetasPorRevelar = [...cont.querySelectorAll('.item-card')];
  tarjetasPorRevelar.forEach((t) => t.classList.add('reveal'));
  revelarVisibles();
}

function revelarVisibles() {
  if (!tarjetasPorRevelar.length) return;
  const limite = window.innerHeight - 30;
  let orden = 0;
  tarjetasPorRevelar = tarjetasPorRevelar.filter((t) => {
    if (t.getBoundingClientRect().top > limite) return true;
    t.style.setProperty('--demora', (orden++ * 70) + 'ms');
    t.classList.add('is-visible');
    return false;
  });
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

function renderAcciones(item) {
  const enCarrito = carrito[item.id];
  if (item.agotado) return `<button type="button" class="btn-agregar" disabled>Agotado</button>`;
  if (enCarrito) return renderQtyControl(item, enCarrito.cantidad);
  return `<button type="button" class="btn-agregar" data-agregar="${escapeHtml(item.id)}" aria-label="Agregar ${escapeHtml(item.nombre)} al pedido">Agregar</button>`;
}

function renderItemCard(item) {
  const id = escapeHtml(item.id);
  const badges = `${item.destacado ? '<span class="badge badge-destacado">Recomendado</span>' : ''}${item.agotado ? '<span class="badge badge-agotado">Agotado</span>' : ''}`;
  return `
    <div class="item-card${item.agotado ? ' agotado' : ''}${carrito[item.id] ? ' en-carrito' : ''}" id="item-${id}">
      <div class="item-ilustracion">${ILUSTRACIONES.de(item.id)}</div>
      <div class="item-info">
        <h3>${escapeHtml(item.nombre)}${badges}</h3>
        ${item.descripcion ? `<p>${escapeHtml(item.descripcion)}</p>` : ''}
        <div class="item-precio">${formatearPrecio(item.precio)}</div>
      </div>
      <div class="item-actions">${renderAcciones(item)}</div>
    </div>
  `;
}

// Redibuja solo el control de una tarjeta y devuelve su contenedor.
function actualizarItem(id) {
  const item = buscarItemPorId(id);
  const card = document.getElementById('item-' + id);
  if (!item || !card) return null;
  card.classList.toggle('en-carrito', Boolean(carrito[id]));
  const acciones = card.querySelector('.item-actions');
  acciones.innerHTML = renderAcciones(item);
  return acciones;
}

function buscarItemPorId(id) {
  for (const cat of MENU.categorias) {
    const item = cat.items.find((i) => i.id === id);
    if (item) return item;
  }
  return null;
}

/* ---------- Carrito ---------- */

function agregarAlCarrito(id) {
  const item = buscarItemPorId(id);
  if (!item || item.agotado) return;
  const totalAntes = totalCarrito();
  carrito[id] = { item, cantidad: 1 };
  const acciones = actualizarItem(id);
  if (acciones) {
    acciones.querySelector('[data-mas]').focus();
    ANIM.entradaControl(acciones.firstElementChild);
    ANIM.volar(document.querySelector(`#item-${CSS.escape(id)} .ilustracion`));
  }
  renderCartFab(totalAntes);
  if (typeof renderCarritoPanel === 'function') renderCarritoPanel();
}

// `zona` es el contenedor desde donde se tocó (catálogo o panel): ahí se
// devuelve el foco, para que quien navega con teclado no pierda el lugar.
function cambiarCantidad(id, delta, zona) {
  if (!carrito[id]) return;
  const totalAntes = totalCarrito();
  carrito[id].cantidad += delta;
  const quedo = carrito[id].cantidad > 0;
  if (!quedo) delete carrito[id];

  const acciones = actualizarItem(id);
  if (!quedo && acciones) ANIM.entradaControl(acciones.firstElementChild);
  renderCartFab(totalAntes);
  if (typeof renderCarritoPanel === 'function') renderCarritoPanel();

  const cont = document.querySelector(zona);
  const sel = (attr) => cont.querySelector(`[data-${attr}="${CSS.escape(id)}"]`);
  const destino = sel(delta > 0 ? 'mas' : 'menos') || sel('agregar')
    || cont.querySelector('#btnIrCheckout:not([disabled])')
    || document.getElementById('btnClosePanel');
  if (destino) destino.focus();
  if (quedo && sel('mas')) ANIM.cantidad(sel('mas').parentElement.querySelector('.qty-val'), delta);
}

function vaciarCarrito() {
  const ids = Object.keys(carrito);
  ids.forEach((k) => delete carrito[k]);
  ids.forEach(actualizarItem);
  renderCartFab(0);
}

function totalCarrito() {
  return Object.values(carrito).reduce((acc, { item, cantidad }) => acc + item.precio * cantidad, 0);
}

function cantidadTotalItems() {
  return Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0);
}

function renderCartFab(totalAntes = totalCarrito()) {
  const fab = document.getElementById('cartFab');
  const cant = cantidadTotalItems();
  const visible = cant > 0;
  fab.classList.toggle('visible', visible);
  fab.inert = !visible;
  if (!visible) return;
  const total = totalCarrito();
  fab.setAttribute('aria-label', `Ver pedido: ${cant} ${cant === 1 ? 'producto' : 'productos'}, total ${formatearPrecio(total)}`);
  document.getElementById('fabCount').textContent = cant;
  ANIM.total(document.getElementById('fabTotal'), totalAntes, total, formatearPrecio);
  ANIM.bump(document.getElementById('fabCount'));
}

document.addEventListener('DOMContentLoaded', () => {
  escucharCatalogo();
  cargarMenu();
});
