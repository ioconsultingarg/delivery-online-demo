// Catálogo público con carrito — Delivery online demo (Pizzería Don Mario).
// Reusa el mismo data/menu.json que menu-qr-demo (mismo "motor de catálogo").

let MENU = null;
const carrito = {}; // { itemId: { item, cantidad } }

function formatearPrecio(n) {
  return '$' + n.toLocaleString('es-AR');
}

async function cargarMenu() {
  const res = await fetch('data/menu.json');
  MENU = await res.json();
  document.getElementById('nombreNegocio').textContent = MENU.negocio.nombre;
  renderCategoryNav();
  renderCategorias();
}

function renderCategoryNav() {
  const nav = document.getElementById('categoryNav');
  nav.innerHTML = MENU.categorias.map((cat, i) =>
    `<button data-cat="${cat.id}" class="${i === 0 ? 'active' : ''}">${cat.nombre}</button>`
  ).join('');
  nav.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('cat-' + btn.dataset.cat).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function renderCategorias() {
  const cont = document.getElementById('categorias');
  cont.innerHTML = MENU.categorias.map((cat) => `
    <section id="cat-${cat.id}">
      <h2 class="categoria-titulo">${cat.nombre}</h2>
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

function renderItemCard(item) {
  const enCarrito = carrito[item.id];
  const badges = `${item.destacado ? '<span class="badge badge-destacado">Recomendado</span>' : ''}${item.agotado ? '<span class="badge badge-agotado">Agotado</span>' : ''}`;
  const acciones = item.agotado
    ? `<button class="btn-agregar" disabled>Agotado</button>`
    : enCarrito
      ? `<div class="qty-control">
           <button class="qty-btn" data-menos="${item.id}">−</button>
           <span class="qty-val">${enCarrito.cantidad}</span>
           <button class="qty-btn" data-mas="${item.id}">+</button>
         </div>`
      : `<button class="btn-agregar" data-agregar="${item.id}">Agregar</button>`;

  return `
    <div class="item-card" id="item-${item.id}">
      <div class="item-info">
        <h3>${item.nombre}${badges}</h3>
        ${item.descripcion ? `<p>${item.descripcion}</p>` : ''}
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

function refrescarVistas() {
  renderCategorias();
  renderCartFab();
  if (typeof renderCarritoPanel === 'function') renderCarritoPanel();
}

function renderCartFab() {
  const fab = document.getElementById('cartFab');
  const cant = cantidadTotalItems();
  if (cant === 0) {
    fab.classList.remove('visible');
    return;
  }
  fab.classList.add('visible');
  fab.innerHTML = `🛒 Ver pedido <span class="cart-count">${cant}</span> · ${formatearPrecio(totalCarrito())}`;
}

document.addEventListener('DOMContentLoaded', cargarMenu);
