// Carrito, checkout y armado del mensaje de WhatsApp — Delivery online demo.
// No hay backend: el "pedido" se arma como texto y se abre en WhatsApp para que
// el cliente lo envíe él mismo — así el dueño no paga comisión de marketplace.
// escapeHtml() y renderQtyControl() están en catalogo.js; ANIM en animaciones.js.

let panelMode = 'carrito';
let checkoutData = { nombre: '', telefono: '', tipoEntrega: 'retiro', direccion: '', metodoPago: 'efectivo', notas: '' };
let focoAntesDeAbrir = null;

const TELEFONO_VALIDO = /^(?=(?:\D*\d){8,15}\D*$)[\d\s()+-]+$/;

// Mientras el panel está abierto, el resto de la página queda inerte: ni el
// teclado ni el lector de pantalla pueden salirse del diálogo.
function fondoDelPanel() {
  return document.querySelectorAll('body > header, body > nav, body > main, body > footer');
}

function abrirCarrito() {
  panelMode = 'carrito';
  focoAntesDeAbrir = document.activeElement;
  const panel = document.getElementById('sidePanel');
  document.getElementById('overlay').classList.add('open');
  panel.inert = false;
  panel.classList.add('open');
  fondoDelPanel().forEach((el) => { el.inert = true; });
  document.getElementById('cartFab').inert = true;
  renderCarritoPanel();
  ANIM.itemsPanel(document.getElementById('sidePanelBody'));
  document.getElementById('btnClosePanel').focus();
}

function cerrarPanel() {
  const panel = document.getElementById('sidePanel');
  if (!panel.classList.contains('open')) return;
  if (panelMode === 'checkout') guardarCheckoutForm();
  document.getElementById('overlay').classList.remove('open');
  panel.classList.remove('open');
  panel.inert = true;
  fondoDelPanel().forEach((el) => { el.inert = false; });
  const fab = document.getElementById('cartFab');
  fab.inert = !fab.classList.contains('visible');
  const destino = focoAntesDeAbrir && focoAntesDeAbrir.isConnected && !fab.inert ? focoAntesDeAbrir : null;
  (destino || document.querySelector('#categoryNav button') || document.body).focus();
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
        <div class="cart-item-ilustracion">${ILUSTRACIONES.de(item.id)}</div>
        <div class="cart-item-texto">
          <div class="cart-item-name">${escapeHtml(item.nombre)}</div>
          <div class="cart-item-precio">${formatearPrecio(item.precio)} c/u</div>
        </div>
        ${renderQtyControl(item, cantidad)}
      </div>
    `).join('');
  }

  const footer = document.getElementById('sidePanelFooter');
  footer.innerHTML = `
    <div class="total-row"><span>Total</span><span>${formatearPrecio(totalCarrito())}</span></div>
    <button type="button" class="btn btn-primary" id="btnIrCheckout" ${items.length === 0 ? 'disabled' : ''}>Continuar con el pedido →</button>
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
      <input type="text" id="inpNombre" autocomplete="name" maxlength="80" value="${escapeHtml(checkoutData.nombre)}" placeholder="Ej: Marina Gómez">
    </div>
    <div class="form-field">
      <label for="inpTelefono">Tu WhatsApp</label>
      <input type="tel" id="inpTelefono" autocomplete="tel" inputmode="tel" maxlength="20" value="${escapeHtml(checkoutData.telefono)}" placeholder="Ej: 11 2345-6789">
    </div>
    <fieldset class="form-field">
      <legend>Entrega</legend>
      <label class="radio-option"><input type="radio" name="entrega" value="retiro" ${checkoutData.tipoEntrega === 'retiro' ? 'checked' : ''}> Retiro en el local</label>
      <label class="radio-option"><input type="radio" name="entrega" value="envio" ${checkoutData.tipoEntrega === 'envio' ? 'checked' : ''}> Envío a domicilio</label>
    </fieldset>
    <div class="form-field" id="campoDireccion" ${checkoutData.tipoEntrega === 'envio' ? '' : 'hidden'}>
      <label for="inpDireccion">Dirección de entrega</label>
      <input type="text" id="inpDireccion" autocomplete="street-address" maxlength="120" value="${escapeHtml(checkoutData.direccion)}" placeholder="Calle, número, piso/depto">
    </div>
    <fieldset class="form-field">
      <legend>Método de pago</legend>
      <label class="radio-option"><input type="radio" name="pago" value="efectivo" ${checkoutData.metodoPago === 'efectivo' ? 'checked' : ''}> Efectivo</label>
      <label class="radio-option"><input type="radio" name="pago" value="transferencia" ${checkoutData.metodoPago === 'transferencia' ? 'checked' : ''}> Transferencia</label>
      <label class="radio-option disabled"><input type="radio" name="pago" disabled> Mercado Pago <span class="tag-proximamente">Próximamente</span></label>
    </fieldset>
    <div class="form-field">
      <label for="inpNotas">Notas (opcional)</label>
      <textarea id="inpNotas" maxlength="300" placeholder="Ej: sin aceitunas, tocar timbre 2B...">${escapeHtml(checkoutData.notas)}</textarea>
    </div>
    <p class="aviso-error" id="avisoCheckout" role="alert" hidden></p>
    <p class="nota-privacidad">Esto es una demo: tus datos no se guardan ni se envían a ningún servidor. Solo se usan en tu navegador para redactar el mensaje de WhatsApp.</p>
  `;

  document.querySelectorAll('input[name="entrega"]').forEach((r) => r.addEventListener('change', (e) => {
    checkoutData.tipoEntrega = e.target.value;
    document.getElementById('campoDireccion').hidden = e.target.value !== 'envio';
  }));

  const footer = document.getElementById('sidePanelFooter');
  footer.innerHTML = `
    <button type="button" class="btn btn-secondary btn-volver" id="btnVolverCarrito">← Volver al pedido</button>
    <button type="button" class="btn btn-whatsapp" id="btnConfirmarPedido">Enviar pedido por WhatsApp</button>
  `;
  document.getElementById('btnVolverCarrito').addEventListener('click', () => {
    guardarCheckoutForm();
    panelMode = 'carrito';
    renderCarritoPanel();
    document.getElementById('btnIrCheckout').focus();
  });
  document.getElementById('btnConfirmarPedido').addEventListener('click', confirmarPedido);
  document.getElementById('inpNombre').focus();
}

function guardarCheckoutForm() {
  const inpNombre = document.getElementById('inpNombre');
  if (!inpNombre) return;
  checkoutData.nombre = inpNombre.value.trim();
  checkoutData.telefono = document.getElementById('inpTelefono').value.trim();
  checkoutData.metodoPago = document.querySelector('input[name="pago"]:checked')?.value || 'efectivo';
  checkoutData.notas = document.getElementById('inpNotas').value.trim();
  const inpDireccion = document.getElementById('inpDireccion');
  checkoutData.direccion = inpDireccion ? inpDireccion.value.trim() : '';
}

function validarCheckout() {
  const conEnvio = checkoutData.tipoEntrega === 'envio';
  if (!checkoutData.nombre || !checkoutData.telefono || (conEnvio && !checkoutData.direccion)) {
    return { campo: !checkoutData.nombre ? 'inpNombre' : !checkoutData.telefono ? 'inpTelefono' : 'inpDireccion',
      texto: 'Completá nombre, teléfono' + (conEnvio ? ' y dirección' : '') + ' para continuar.' };
  }
  if (!TELEFONO_VALIDO.test(checkoutData.telefono)) {
    return { campo: 'inpTelefono', texto: 'Revisá el teléfono: solo números, con código de área (ej: 11 2345-6789).' };
  }
  return null;
}

function confirmarPedido() {
  guardarCheckoutForm();
  const aviso = document.getElementById('avisoCheckout');
  const error = validarCheckout();
  if (error) {
    aviso.textContent = error.texto;
    aviso.hidden = false;
    document.getElementById(error.campo).focus();
    return;
  }

  const mensaje = armarMensajeWhatsApp();
  // Sin número configurado, WhatsApp deja elegir a quién mandarle el mensaje.
  const numero = String(MENU.negocio.whatsapp || '').replace(/\D/g, '');
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
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

// El pedido se muestra como se va a ver en el chat del local: es lo que vende
// la demo, así que se anima línea por línea (ver ANIM.chat).
function renderConfirmacion(mensaje) {
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const lineas = mensaje.split('\n').map((l) =>
    `<div class="wa-linea${l ? '' : ' wa-espacio'}">${escapeHtml(l)}</div>`
  ).join('');
  const inicial = escapeHtml(MENU.negocio.nombre.trim().charAt(0).toUpperCase());

  document.getElementById('sidePanelTitle').textContent = 'Pedido armado';
  document.getElementById('sidePanelBody').innerHTML = `
    <div class="confirm-screen">
      <h3>¡Se abrió WhatsApp con tu pedido!</h3>
      <p class="confirm-ayuda">Solo tenés que tocar enviar. Así le llega al local:</p>
      <div class="wa" id="waChat">
        <div class="wa-top" aria-hidden="true">
          <span class="wa-avatar">${inicial}</span>
          <span class="wa-contacto"><strong>${escapeHtml(MENU.negocio.nombre)}</strong><small>en línea</small></span>
        </div>
        <div class="wa-cuerpo">
          <div class="wa-burbuja">
            ${lineas}
            <div class="wa-meta" aria-hidden="true">
              <span>${hora}</span>
              <svg class="wa-tildes" viewBox="0 0 18 12" width="18" height="12" focusable="false"><path d="M1 6.5 4.5 10 11 2M7 9l1.2 1L15 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('sidePanelFooter').innerHTML = `
    <button type="button" class="btn btn-primary" id="btnNuevoPedido">Hacer otro pedido</button>
  `;
  const btnNuevo = document.getElementById('btnNuevoPedido');
  btnNuevo.addEventListener('click', () => {
    checkoutData = { nombre: '', telefono: '', tipoEntrega: 'retiro', direccion: '', metodoPago: 'efectivo', notas: '' };
    vaciarCarrito();
    cerrarPanel();
  });
  btnNuevo.focus();
  ANIM.chat(document.getElementById('waChat'));
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cartFab').addEventListener('click', abrirCarrito);
  document.getElementById('overlay').addEventListener('click', cerrarPanel);
  document.getElementById('btnClosePanel').addEventListener('click', cerrarPanel);
  document.getElementById('sidePanelBody').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.mas) cambiarCantidad(btn.dataset.mas, 1, '#sidePanel');
    else if (btn.dataset.menos) cambiarCantidad(btn.dataset.menos, -1, '#sidePanel');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarPanel();
  });
});
