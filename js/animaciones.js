// Animaciones de la demo, sobre Anime.js v4 (js/vendor/anime.umd.min.js, MIT).
// Todo es decorativo: si la librería no carga o la persona pidió menos
// movimiento (prefers-reduced-motion), cada función deja el estado final y listo.

const ANIM = (() => {
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
  const activo = () => Boolean(window.anime) && !reducir.matches;

  // Titular del hero: entra palabra por palabra.
  function hero() {
    const titulo = document.getElementById('heroTitulo');
    if (!titulo || !activo()) return;
    const texto = titulo.textContent.trim();
    titulo.setAttribute('aria-label', texto);
    titulo.textContent = '';
    texto.split(/\s+/).forEach((palabra, i, todas) => {
      const span = document.createElement('span');
      span.className = 'hero-palabra';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = palabra;
      titulo.append(span, i < todas.length - 1 ? ' ' : '');
    });
    anime.animate('.hero-palabra', {
      opacity: [0, 1],
      y: [22, 0],
      filter: ['blur(8px)', 'blur(0px)'],
      duration: 700,
      delay: anime.stagger(70, { start: 80 }),
      ease: 'outExpo',
    });
    anime.animate('.hero-eyebrow, .hero-sub, .hero-chips li', {
      opacity: [0, 1],
      y: [10, 0],
      duration: 600,
      delay: anime.stagger(90, { start: 450 }),
      ease: 'outQuad',
    });
    anime.animate('#heroPizza', {
      opacity: [0, 1],
      scale: [0.7, 1],
      rotate: [-40, 0],
      duration: 1100,
      delay: 150,
      ease: 'outExpo',
    });
  }

  // El botón "Agregar" se convierte en el contador (y viceversa).
  function entradaControl(el) {
    if (!el || !activo()) return;
    anime.animate(el, { opacity: [0, 1], scale: [0.8, 1], duration: 320, ease: 'outBack' });
  }

  // El número de cantidad "gira" hacia arriba o hacia abajo.
  function cantidad(el, delta) {
    if (!el || !activo()) return;
    anime.animate(el, { opacity: [0, 1], y: [delta > 0 ? 10 : -10, 0], duration: 240, ease: 'outQuad' });
  }

  // El total del botón flotante sube o baja contando.
  function total(el, desde, hasta, formatear) {
    if (!el) return;
    if (!activo() || desde === hasta) { el.textContent = formatear(hasta); return; }
    const estado = { v: desde };
    anime.animate(estado, {
      v: hasta,
      duration: 450,
      ease: 'outQuad',
      onUpdate: () => { el.textContent = formatear(Math.round(estado.v)); },
      onComplete: () => { el.textContent = formatear(hasta); },
    });
  }

  function bump(el) {
    if (!el || reducir.matches) return;
    el.classList.remove('bump');
    void el.offsetWidth; // reinicia la animación CSS
    el.classList.add('bump');
  }

  // Una copia de la ilustración viaja desde la tarjeta hasta el carrito.
  // Va dentro de un <div>: en un <svg>, "x" e "y" son atributos propios y
  // Anime.js animaría esos en lugar de mover el elemento.
  function volar(origen) {
    if (!origen || !activo()) return;
    const r = origen.getBoundingClientRect();
    const clon = document.createElement('div');
    clon.className = 'volador';
    clon.style.left = r.left + 'px';
    clon.style.top = r.top + 'px';
    clon.style.width = r.width + 'px';
    clon.style.height = r.height + 'px';
    clon.appendChild(origen.cloneNode(true));
    document.body.appendChild(clon);
    anime.animate(clon, {
      x: window.innerWidth / 2 - (r.left + r.width / 2),
      y: window.innerHeight - 50 - (r.top + r.height / 2),
      scale: 0.2,
      rotate: 160,
      duration: 520,
      ease: 'inOutQuad',
      onComplete: () => clon.remove(),
    });
    anime.animate(clon, { opacity: 0, duration: 160, delay: 380, ease: 'linear' });
  }

  // Los ítems del carrito entran escalonados al abrir el panel.
  function itemsPanel(contenedor) {
    const items = contenedor.querySelectorAll('.cart-item');
    if (!items.length || !activo()) return;
    anime.animate(items, {
      opacity: [0, 1],
      x: [24, 0],
      duration: 420,
      delay: anime.stagger(55, { start: 120 }),
      ease: 'outExpo',
    });
  }

  // El momento firma: el pedido se "escribe solo" dentro de un chat de WhatsApp.
  function chat(caja) {
    const lineas = caja.querySelectorAll('.wa-linea');
    const meta = caja.querySelector('.wa-meta');
    if (!activo()) return;
    anime.animate(caja.querySelector('.wa-burbuja'), {
      opacity: [0, 1], scale: [0.92, 1], duration: 380, delay: 150, ease: 'outBack',
    });
    anime.animate(lineas, {
      opacity: [0, 1],
      y: [8, 0],
      duration: 320,
      delay: anime.stagger(85, { start: 380 }),
      ease: 'outQuad',
    });
    anime.animate(meta, {
      opacity: [0, 1],
      duration: 300,
      delay: 380 + lineas.length * 85 + 150,
    });
  }

  return { activo, hero, entradaControl, cantidad, total, bump, volar, itemsPanel, chat };
})();

// Se ejecuta apenas carga el script (el hero ya está en el HTML), para que el
// titular no llegue a verse quieto antes de animarse.
document.getElementById('heroPizza').innerHTML = ILUSTRACIONES.de('napolitana');
ANIM.hero();
