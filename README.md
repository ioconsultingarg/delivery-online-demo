# delivery-online-demo

Catálogo con carrito y pedido online, demo de portfolio de **IO Consulting**. Mismo cliente ficticio que `menu-qr-demo` y `landing-comercio-demo` ("Pizzería Don Mario"), reusando el mismo `data/menu.json` — es el mismo "motor de catálogo" con un frontend distinto.

## Problema que resuelve

Hoy muchos comercios toman pedidos de delivery por teléfono o WhatsApp manual, escribiendo a mano cada ítem, o pagan comisión a un marketplace (PedidosYa, Rappi) para tener un catálogo online. Este demo arma el pedido en un catálogo con carrito, y lo manda formateado directo al WhatsApp del negocio — sin intermediario ni comisión.

## Demo

`https://ioconsultingarg.github.io/delivery-online-demo/`

Flujo: elegir productos del catálogo (con contador de cantidad) → ver el carrito en el panel lateral → completar datos de entrega y pago → el pedido se abre ya redactado en WhatsApp, listo para enviar.

## Stack

- HTML/CSS/JS puro, sin build step
- Catálogo cargado desde `data/menu.json` (mismo formato que `menu-qr-demo`)
- Carrito en memoria (`js/catalogo.js` + `js/carrito.js`) — se reinicia al recargar la página, es intencional para esta versión demo
- Mensaje de pedido armado como texto y enviado vía `wa.me` (WhatsApp), sin backend ni servidor de pedidos

## Cómo correrlo local

El catálogo usa `fetch()` para cargar `data/menu.json`, así que no funciona abriendo `index.html` directo desde el explorador de archivos. Levantá un servidor local simple:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Qué es real y qué es simulado

- El carrito, el cálculo de total y el armado del mensaje son reales y funcionan del todo en el navegador
- Al confirmar, se abre WhatsApp Web/App con el pedido ya redactado — el envío final lo hace la persona, no es un webhook automático (es intencional: así el dueño no necesita nada corriendo del otro lado para recibir pedidos)
- El pago con Mercado Pago aparece como opción pero deshabilitada ("Próximamente") — la demo no procesa pagos reales; una implementación real usaría Mercado Pago Checkout Pro
- No hay panel de administración de pedidos en esta versión — el "backoffice" del negocio sigue siendo el WhatsApp del local, igual que hoy

## Cómo adaptarlo a otro rubro

1. Reemplazar `data/menu.json` por el catálogo del nuevo negocio (funciona igual para una rotisería, una verdulería con envío, o un catálogo de productos de librería)
2. Cambiar las variables de color en `css/styles.css` (bloque `:root`)
3. Actualizar el número de WhatsApp en `negocio.whatsapp` dentro de `menu.json`

## Estructura

```
delivery-online-demo/
├── index.html         (catálogo + carrito + checkout)
├── css/styles.css
├── js/catalogo.js       (carga el menú y arma las tarjetas de producto)
├── js/carrito.js         (panel lateral: carrito, checkout, mensaje de WhatsApp)
├── data/menu.json         (mismo catálogo que menu-qr-demo)
├── README.md
└── LICENSE
```

## Próximas mejoras posibles

- Integrar Mercado Pago Checkout Pro para cobro online real
- Panel de administración de pedidos (verlos entrar en tiempo real, marcarlos como "en camino"/"entregado")
- Guardar el pedido en Supabase o Google Sheets además de mandarlo por WhatsApp, para tener un historial

---
Parte del portfolio de demos de transformación digital de IO Consulting.
