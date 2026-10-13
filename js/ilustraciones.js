// Ilustraciones SVG de los productos — dibujadas a mano para esta demo.
// Se arman como texto y solo usan atributos de presentación (fill, stroke):
// nada de style="" inline, para que pasen la Content-Security-Policy.

const ILUSTRACIONES = (() => {
  const PUNTOS = [[50, 29], [68, 40], [67, 62], [50, 71], [33, 62], [32, 40], [50, 50]];
  const OREGANO = [[42, 33], [58, 36], [61, 50], [44, 46], [38, 55], [57, 66], [45, 68], [70, 52], [29, 50], [52, 58]];

  const svg = (contenido) =>
    `<svg class="ilustracion" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${contenido}</svg>`;

  const basePizza = (queso = '#f7d67a', salsa = '#c8402f') => `
    <circle cx="50" cy="50" r="46" fill="#d49a52"/>
    <circle cx="50" cy="50" r="45" fill="none" stroke="#b97a3a" stroke-width="2"/>
    <circle cx="50" cy="50" r="39" fill="${salsa}"/>
    <circle cx="50" cy="50" r="36.5" fill="${queso}"/>
    <circle cx="40" cy="37" r="7" fill="#ffffff" opacity="0.22"/>
    <circle cx="62" cy="56" r="8" fill="#ffffff" opacity="0.18"/>
    <circle cx="44" cy="63" r="5" fill="#ffffff" opacity="0.2"/>`;

  const repetir = (puntos, dibujo) => puntos.map(([x, y], i) => dibujo(x, y, i)).join('');

  const aceituna = (x, y) =>
    `<circle cx="${x}" cy="${y}" r="4" fill="#33361f"/><circle cx="${x}" cy="${y}" r="1.6" fill="#f7d67a"/>`;

  const tomate = (x, y) => `
    <circle cx="${x}" cy="${y}" r="7.5" fill="#d94a35"/>
    <circle cx="${x}" cy="${y}" r="5.5" fill="#ee7458"/>
    <circle cx="${x - 2}" cy="${y - 1.5}" r="0.9" fill="#f9d9a8"/>
    <circle cx="${x + 2}" cy="${y - 1}" r="0.9" fill="#f9d9a8"/>
    <circle cx="${x}" cy="${y + 2.3}" r="0.9" fill="#f9d9a8"/>`;

  const cebolla = (x, y) => `
    <circle cx="${x}" cy="${y}" r="6.5" fill="none" stroke="#fffaf0" stroke-width="2.2"/>
    <circle cx="${x}" cy="${y}" r="3.3" fill="none" stroke="#dcb8e8" stroke-width="1.4"/>`;

  const longaniza = (x, y) => `
    <circle cx="${x}" cy="${y}" r="6.5" fill="#a5352b"/>
    <circle cx="${x - 2}" cy="${y - 1.5}" r="1.1" fill="#d98a7c"/>
    <circle cx="${x + 2}" cy="${y + 1}" r="1.1" fill="#d98a7c"/>
    <circle cx="${x - 0.5}" cy="${y + 2.8}" r="0.9" fill="#d98a7c"/>`;

  const tira = (x, y, giro, color) =>
    `<rect x="${x - 5}" y="${y - 1.5}" width="10" height="3" rx="1.5" fill="${color}" transform="rotate(${giro} ${x} ${y})"/>`;

  const hoja = (x, y, giro) =>
    `<path d="M0 -8 C5 -4 5 4 0 8 C-5 4 -5 -4 0 -8Z" fill="#4c8a3c" transform="translate(${x} ${y}) rotate(${giro})"/>
     <path d="M0 -6 L0 6" stroke="#356b2b" stroke-width="0.8" transform="translate(${x} ${y}) rotate(${giro})"/>`;

  const jamon = (x, y, giro) =>
    `<ellipse cx="${x}" cy="${y}" rx="8" ry="5" fill="#e8929a" transform="rotate(${giro} ${x} ${y})"/>
     <ellipse cx="${x}" cy="${y}" rx="4.5" ry="2" fill="#f4bcc0" transform="rotate(${giro} ${x} ${y})"/>`;

  const oregano = () => repetir(OREGANO, (x, y) => `<circle cx="${x}" cy="${y}" r="1.1" fill="#4f7d3a"/>`);

  const botella = (cuerpo, etiqueta, tapa) => `
    <rect x="45" y="9" width="10" height="6" rx="1.5" fill="${tapa}"/>
    <path d="M45 15 H55 V27 C55 34 66 35 66 46 V84 C66 88.5 62.5 91 58 91 H42 C37.5 91 34 88.5 34 84 V46 C34 35 45 34 45 27 Z" fill="${cuerpo}"/>
    <rect x="34" y="52" width="32" height="18" fill="${etiqueta}"/>
    <rect x="34" y="59" width="32" height="2.5" fill="#ffffff" opacity="0.55"/>
    <rect x="39" y="40" width="3.5" height="44" rx="1.75" fill="#ffffff" opacity="0.28"/>`;

  const dibujos = {
    muzzarella: () => basePizza() + repetir(PUNTOS.slice(0, 6), aceituna),

    napolitana: () => basePizza() + repetir([PUNTOS[0], PUNTOS[2], PUNTOS[4], PUNTOS[6]], tomate) + oregano(),

    fugazzeta: () => basePizza('#f9e6a8', '#eecb78') + repetir(PUNTOS, cebolla),

    calabresa: () => basePizza()
      + repetir([PUNTOS[0], PUNTOS[2], PUNTOS[4], PUNTOS[6]], longaniza)
      + tira(68, 40, 30, '#3f8f4a') + tira(50, 71, -20, '#d94a35') + tira(32, 40, -40, '#3f8f4a'),

    'cuatro-quesos': () => basePizza() + `
      <path d="M50 50 L50 13.5 A36.5 36.5 0 0 1 86.5 50 Z" fill="#fbeec2"/>
      <path d="M50 50 L86.5 50 A36.5 36.5 0 0 1 50 86.5 Z" fill="#f2c14e"/>
      <path d="M50 50 L50 86.5 A36.5 36.5 0 0 1 13.5 50 Z" fill="#eef0d2"/>
      <path d="M50 13.5 V86.5 M13.5 50 H86.5" stroke="#dcae52" stroke-width="1.2"/>
      <circle cx="34" cy="62" r="2" fill="#7fa39a"/><circle cx="41" cy="72" r="1.6" fill="#7fa39a"/>
      <circle cx="28" cy="56" r="1.4" fill="#7fa39a"/><circle cx="42" cy="58" r="1.3" fill="#7fa39a"/>
      <circle cx="64" cy="66" r="3" fill="#e0a12e"/><circle cx="72" cy="58" r="2" fill="#e0a12e"/>
      <circle cx="62" cy="32" r="3.5" fill="#ffffff" opacity="0.7"/><circle cx="72" cy="42" r="2.2" fill="#ffffff" opacity="0.7"/>`,

    'rucula-jamon': () => basePizza('#fbf0d2', '#f1dfb0')
      + jamon(40, 38, -25) + jamon(63, 46, 20) + jamon(46, 64, 10)
      + hoja(55, 32, 35) + hoja(33, 53, -50) + hoja(66, 63, 60) + hoja(52, 51, -15) + hoja(41, 71, 80)
      + tira(60, 58, 40, '#fff6dd') + tira(38, 46, -30, '#fff6dd'),

    'gaseosa-linea': () => botella('#3a1f14', '#c1272d', '#c1272d'),

    agua: () => botella('#bfe3f5', '#2f86c5', '#2f86c5')
      + `<path d="M34 76 Q42 72 50 76 T66 76 V84 C66 88.5 62.5 91 58 91 H42 C37.5 91 34 88.5 34 84 Z" fill="#8fcdee" opacity="0.7"/>`,

    'cerveza-ipa': () => `
      <path d="M30 22 H70 L65 87 Q64.7 91 61 91 H39 Q35.3 91 35 87 Z" fill="#f0a92b"/>
      <path d="M30 22 H70 L69 34 H31 Z" fill="#fff8ea"/>
      <circle cx="36" cy="20" r="7" fill="#fff8ea"/><circle cx="48" cy="17" r="8" fill="#fff8ea"/>
      <circle cx="60" cy="19" r="7.5" fill="#fff8ea"/><circle cx="67" cy="23" r="5" fill="#fff8ea"/>
      <circle cx="44" cy="52" r="1.6" fill="#f9d680"/><circle cx="55" cy="64" r="1.3" fill="#f9d680"/>
      <circle cx="49" cy="76" r="1.6" fill="#f9d680"/><circle cx="58" cy="46" r="1.2" fill="#f9d680"/>
      <path d="M37 38 L40 84" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.35"/>`,

    flan: () => `
      <ellipse cx="50" cy="80" rx="42" ry="9" fill="#ffffff" stroke="#e6d6c2" stroke-width="1.5"/>
      <path d="M29 77 L36 44 Q50 38 64 44 L71 77 Q50 85 29 77 Z" fill="#eba63c"/>
      <path d="M36 44 Q50 38 64 44 Q50 50 36 44 Z" fill="#9a4f16"/>
      <path d="M38 45 Q39 56 37 62 M62 45 Q61 54 63 58 M50 48 Q51 58 49 64" stroke="#9a4f16" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <circle cx="78" cy="73" r="7" fill="#fffaf0" stroke="#e6d6c2" stroke-width="1"/>
      <path d="M74 72 Q78 68 82 72" stroke="#e6d6c2" stroke-width="1.2" fill="none"/>
      <ellipse cx="20" cy="76" rx="7" ry="4" fill="#b8742c"/>`,

    helado: () => `
      <circle cx="39" cy="44" r="16" fill="#f8e7bd"/>
      <circle cx="61" cy="44" r="16" fill="#7a4a2b"/>
      <path d="M48 36 Q61 22 75 38 Q72 46 68 41 Q66 50 61 42 Q57 49 54 41 Q51 44 48 36 Z" fill="#3f2110"/>
      <circle cx="34" cy="39" r="4" fill="#ffffff" opacity="0.4"/>
      <path d="M20 56 H80 C80 75 67 86 50 86 C33 86 20 75 20 56 Z" fill="#ffffff" stroke="#e6d6c2" stroke-width="1.5"/>
      <rect x="40" y="86" width="20" height="5" rx="2.5" fill="#ffffff" stroke="#e6d6c2" stroke-width="1.5"/>`,
  };

  // Para catálogos de otros rubros que todavía no tengan dibujo propio.
  const generico = () => `
    <circle cx="50" cy="50" r="42" fill="#ffffff" stroke="#e6d6c2" stroke-width="2"/>
    <circle cx="50" cy="50" r="28" fill="none" stroke="#f0e2d0" stroke-width="2"/>`;

  return {
    de: (id) => svg((dibujos[id] || generico)()),
  };
})();
