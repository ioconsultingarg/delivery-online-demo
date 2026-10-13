// Capa de la demo dirigida al dueño del negocio (no a quien hace el pedido):
// personalización con el nombre de su local y contacto con IO Consulting.

const DEMO = {
  // A dónde llegan las consultas de "Quiero esto para mi negocio".
  // whatsapp: formato internacional sin "+" (ej. 549 + código de área + número).
  // Si queda vacío, el botón abre un mail a `email`.
  contacto: { whatsapp: '', email: 'contacto@ioconsulting.com.ar' },
  negocioPersonalizado: '',
};

function limpiarNombreNegocio(texto) {
  return String(texto ?? '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

// ...?negocio=La+Esquina muestra la demo con el nombre de ese local.
function leerNegocioDeUrl() {
  return limpiarNombreNegocio(new URLSearchParams(window.location.search).get('negocio'));
}

function linkConNegocio(nombre) {
  const url = new URL(window.location.href);
  url.hash = '';
  if (nombre) url.searchParams.set('negocio', nombre); else url.searchParams.delete('negocio');
  return url.toString();
}

function linkContacto() {
  const negocio = DEMO.negocioPersonalizado;
  const texto = 'Hola IO Consulting, vi la demo de pedidos online y quiero algo así para mi negocio'
    + (negocio ? ` (${negocio})` : '') + '.';
  const numero = DEMO.contacto.whatsapp.replace(/\D/g, '');
  if (numero) return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  return `mailto:${DEMO.contacto.email}?subject=${encodeURIComponent('Quiero pedidos online para mi negocio')}&body=${encodeURIComponent(texto)}`;
}

// Los botones de contacto llevan data-cta-negocio; su destino se recalcula
// cada vez que cambia el nombre del negocio.
function actualizarCtas(raiz = document) {
  const porWhatsapp = Boolean(DEMO.contacto.whatsapp);
  raiz.querySelectorAll('a[data-cta-negocio]').forEach((a) => {
    a.href = linkContacto();
    if (porWhatsapp) { a.target = '_blank'; a.rel = 'noopener'; }
  });
}

// Pone el nombre del negocio en toda la página (título, hero, barra de demo).
function aplicarNombreNegocio(nombre) {
  const limpio = limpiarNombreNegocio(nombre);
  if (limpio && MENU) {
    DEMO.negocioPersonalizado = limpio;
    MENU.negocio.nombre = limpio;
  }
  if (!MENU) return;
  document.getElementById('nombreNegocio').textContent = MENU.negocio.nombre;
  document.title = `Pedí online — ${MENU.negocio.nombre}`;
  if (DEMO.negocioPersonalizado) {
    document.getElementById('demoBarTexto').textContent =
      `Preparada para ${DEMO.negocioPersonalizado}: así pedirían tus clientes. Armá un pedido y mirá cómo te llega.`;
    document.getElementById('negocioTitulo').textContent = `Así se vería ${DEMO.negocioPersonalizado}.`;
  }
  actualizarCtas();
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('inpNegocio');
  const aviso = document.getElementById('negocioLink');

  const personalizar = () => {
    const nombre = limpiarNombreNegocio(input.value);
    if (!nombre) { input.focus(); return; }
    aplicarNombreNegocio(nombre);
    const link = linkConNegocio(nombre);
    window.history.replaceState(null, '', link);
    document.getElementById('negocioLinkUrl').textContent = link;
    aviso.hidden = false;
    document.getElementById('btnVerArriba').focus();
  };

  document.getElementById('btnPersonalizar').addEventListener('click', personalizar);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') personalizar(); });

  document.getElementById('btnVerArriba').addEventListener('click', () => {
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducir ? 'auto' : 'smooth' });
  });

  document.getElementById('btnCopiarLink').addEventListener('click', async (e) => {
    const boton = e.currentTarget;
    try {
      await navigator.clipboard.writeText(document.getElementById('negocioLinkUrl').textContent);
      boton.textContent = 'Link copiado';
    } catch (err) {
      boton.textContent = 'Copialo desde la barra de direcciones';
    }
  });

  actualizarCtas();
});
