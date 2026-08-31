// Carrito, checkout y armado del mensaje de WhatsApp — Delivery online demo.
// No hay backend: el "pedido" se arma como texto y se abre en WhatsApp para que
// el cliente lo envíe él mismo — así el dueño no paga comisión de marketplace.

let panelMode = 'carrito';
let checkoutData = { nombre: '', telefono: '', tipoEntrega: 'retiro', direccion: '', metodoPago: 'efectivo', notas: '' };

function abrirCarrito() {
  panelMode = 'carrito';
  document.getElementById('overlay').classList.add('open');
  document.getElementById('sidePanel').classList.add('open');
  renderCarritoPanel();
}

function cerrarPanel() {
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('sidePanel').classList.remove('open');
}

function renderCarritoPanel() {
  if (panelMode !== 'carrito') return;
  const items = Object.values(carrito);
  const header = document.getElementById('sidePanelTitle');
  header.textContent = 'Tu pedido';

  const body = document.getElementById('sidePanelBody');
  if (items.length === 0) {
    body.innerHTML = `<p class="cart-empty">Todavía no agregaste nada del menú.</p>`;
  } else {
    body.innerHTML = items.map(({ item, cantidad }) => `
      <div class="cart-item">
        <div>
          <div class="cart-item-name">${cantidad} × ${item.nombre}</div>
          <div class="cart-item-precio">${formatearPrecio(item.precio)} c/u</div>
        </div>
        <div class="qty-control">
          <button class="qty-btn" data-menos="${item.id}">−</button>
          <span class="qty-val">${cantidad}</span>
          <button class="qty-btn" data-mas="${item.id}">+</button>
        </div>
      </div>
    `).join('');
    body.querySelectorAll('[data-mas]').forEach((btn) => btn.addEventListener('click', () => cambiarCantidad(btn.dataset.mas, 1)));
    body.querySelectorAll('[data-menos]').forEach((btn) => btn.addEventListener('click', () => cambiarCantidad(btn.dataset.menos, -1)));
  }

  const footer = document.getElementById('sidePanelFooter');
  footer.innerHTML = `
    <div class="total-row"><span>Total</span><span>${formatearPrecio(totalCarrito())}</span></div>
    <button class="btn btn-primary" id="btnIrCheckout" ${items.length === 0 ? 'disabled' : ''}>Continuar con el pedido →</button>
  `;
  if (items.length > 0) {
    document.getElementById('btnIrCheckout').addEventListener('click', irACheckout);
  }
}

function irACheckout() {
  panelMode = 'checkout';
  document.getElementById('sidePanelTitle').textContent = 'Datos de entrega';
  const body = document.getElementById('sidePanelBody');
  body.innerHTML = `
    <div class="form-field">
      <label for="inpNombre">Nombre y apellido</label>
      <input type="text" id="inpNombre" value="${checkoutData.nombre}" placeholder="Ej: Marina Gómez">
    </div>
    <div class="form-field">
      <label for="inpTelefono">Tu WhatsApp</label>
      <input type="tel" id="inpTelefono" value="${checkoutData.telefono}" placeholder="Ej: 11 5555-5555">
    </div>
    <div class="form-field">
      <label>Entrega</label>
      <label class="radio-option"><input type="radio" name="entrega" value="retiro" ${checkoutData.tipoEntrega === 'retiro' ? 'checked' : ''}> Retiro en el local</label>
      <label class="radio-option"><input type="radio" name="entrega" value="envio" ${checkoutData.tipoEntrega === 'envio' ? 'checked' : ''}> Envío a domicilio</label>
    </div>
    <div class="form-field" id="campoDireccion" style="display:${checkoutData.tipoEntrega === 'envio' ? 'block' : 'none'}">
      <label for="inpDireccion">Dirección de entrega</label>
      <input type="text" id="inpDireccion" value="${checkoutData.direccion}" placeholder="Calle, número, piso/depto">
    </div>
    <div class="form-field">
      <label>Método de pago</label>
      <label class="radio-option"><input type="radio" name="pago" value="efectivo" ${checkoutData.metodoPago === 'efectivo' ? 'checked' : ''}> Efectivo</label>
      <label class="radio-option"><input type="radio" name="pago" value="transferencia" ${checkoutData.metodoPago === 'transferencia' ? 'checked' : ''}> Transferencia</label>
      <label class="radio-option disabled"><input type="radio" name="pago" disabled> Mercado Pago <span class="tag-proximamente">Próximamente</span></label>
    </div>
    <div class="form-field">
      <label for="inpNotas">Notas (opcional)</label>
      <textarea id="inpNotas" placeholder="Ej: sin aceitunas, tocar timbre 2B...">${checkoutData.notas}</textarea>
    </div>
    <p id="avisoCheckout" style="color:var(--color-danger);font-size:0.82rem;font-weight:600;display:none;"></p>
  `;

  document.querySelectorAll('input[name="entrega"]').forEach((r) => r.addEventListener('change', (e) => {
    checkoutData.tipoEntrega = e.target.value;
    document.getElementById('campoDireccion').style.display = e.target.value === 'envio' ? 'block' : 'none';
  }));

  const footer = document.getElementById('sidePanelFooter');
  footer.innerHTML = `
    <button class="btn btn-secondary" id="btnVolverCarrito" style="margin-bottom:0.6rem;">← Volver al pedido</button>
    <button class="btn btn-whatsapp" id="btnConfirmarPedido">Enviar pedido por WhatsApp</button>
  `;
  document.getElementById('btnVolverCarrito').addEventListener('click', () => { panelMode = 'carrito'; renderCarritoPanel(); });
  document.getElementById('btnConfirmarPedido').addEventListener('click', confirmarPedido);
}

function guardarCheckoutForm() {
  checkoutData.nombre = document.getElementById('inpNombre').value.trim();
  checkoutData.telefono = document.getElementById('inpTelefono').value.trim();
  checkoutData.metodoPago = document.querySelector('input[name="pago"]:checked')?.value || 'efectivo';
  checkoutData.notas = document.getElementById('inpNotas').value.trim();
  const inpDireccion = document.getElementById('inpDireccion');
  checkoutData.direccion = inpDireccion ? inpDireccion.value.trim() : '';
}

function confirmarPedido() {
  guardarCheckoutForm();
  const aviso = document.getElementById('avisoCheckout');
  if (!checkoutData.nombre || !checkoutData.telefono || (checkoutData.tipoEntrega === 'envio' && !checkoutData.direccion)) {
    aviso.textContent = 'Completá nombre, teléfono' + (checkoutData.tipoEntrega === 'envio' ? ' y dirección' : '') + ' para continuar.';
    aviso.style.display = 'block';
    return;
  }

  const mensaje = armarMensajeWhatsApp();
  const url = `https://wa.me/${MENU.negocio.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank', 'noopener');

  panelMode = 'confirmacion';
  renderConfirmacion(mensaje);
}

function armarMensajeWhatsApp() {
  const lineas = [];
  lineas.push(`¡Hola ${MENU.negocio.nombre}! Quiero hacer este pedido:`);
  lineas.push('');
  Object.values(carrito).forEach(({ item, cantidad }) => {
    lineas.push(`• ${cantidad} × ${item.nombre} — ${formatearPrecio(item.precio * cantidad)}`);
  });
  lineas.push('');
  lineas.push(`Total: ${formatearPrecio(totalCarrito())}`);
  lineas.push('');
  lineas.push(`Entrega: ${checkoutData.tipoEntrega === 'envio' ? 'Envío a domicilio — ' + checkoutData.direccion : 'Retiro en el local'}`);
  lineas.push(`Pago: ${checkoutData.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}`);
  if (checkoutData.notas) lineas.push(`Notas: ${checkoutData.notas}`);
  lineas.push('');
  lineas.push(`Nombre: ${checkoutData.nombre}`);
  lineas.push(`Tel: ${checkoutData.telefono}`);
  return lineas.join('\n');
}

function renderConfirmacion(mensaje) {
  document.getElementById('sidePanelTitle').textContent = 'Pedido armado';
  document.getElementById('sidePanelBody').innerHTML = `
    <div class="confirm-screen">
      <div class="icon">✅</div>
      <h3>¡Se abrió WhatsApp con tu pedido!</h3>
      <p style="font-size:0.85rem;color:var(--color-text-light);">Solo tenés que enviar el mensaje que ya está redactado. Así se ve:</p>
      <div class="confirm-summary-box">${mensaje}</div>
    </div>
  `;
  document.getElementById('sidePanelFooter').innerHTML = `
    <button class="btn btn-primary" id="btnNuevoPedido">Hacer otro pedido</button>
  `;
  document.getElementById('btnNuevoPedido').addEventListener('click', () => {
    Object.keys(carrito).forEach((k) => delete carrito[k]);
    checkoutData = { nombre: '', telefono: '', tipoEntrega: 'retiro', direccion: '', metodoPago: 'efectivo', notas: '' };
    refrescarVistas();
    cerrarPanel();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cartFab').addEventListener('click', abrirCarrito);
  document.getElementById('overlay').addEventListener('click', cerrarPanel);
  document.getElementById('btnClosePanel').addEventListener('click', cerrarPanel);
});
