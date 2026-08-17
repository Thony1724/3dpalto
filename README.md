# Braza — Carta con visor 3D / Realidad Aumentada

## Cómo verlo
Este sitio necesita servirse por HTTP (no abrir el .html con doble clic),
porque el navegador bloquea la carga de modelos 3D vía "file://".

Opción rápida, con Python instalado:
    cd braza-carta-3d
    python3 -m http.server 8080

Luego abre http://localhost:8080 en tu navegador (o en el celular, usando la
IP de tu compu en la misma red Wi-Fi, o publicado en GitHub Pages como ya
hiciste, para probar la cámara/RA).

## Qué incluye
- index.html / css/styles.css / js/script.js — el sitio (carta + visor).
- img/braza-rem.png — foto del Pollo a la Brasa (con fondo transparente).
- models/braza-rem.glb — modelo 3D del plato con volumen real: un disco de
  plato, dos lóbulos de pollo con vetas de carbón, ~16 papas apiladas,
  lechuga/tomate/cebolla/zanahoria y el vasito de salsa, cada uno como pieza
  3D independiente y coloreada según la foto real — no una imagen plana.
- herramientas/build-model.mjs — script para generar el .glb de nuevos platos
  (ver herramientas/README.md).

## Cambios de esta versión
- El modelo 3D ya no es una "tarjeta con la foto pegada": ahora cada
  ingrediente es una forma 3D real, así que al girarlo en el visor se ve el
  volumen del plato desde cualquier ángulo (antes se veía plano de canto).
- Se corrigió un bug donde, en celular, el visor podía quedar "invisible pero
  activo" y bloquear los botones del resto de la página (el botón de cerrar
  podía quedar tapado por el notch/barra del celular). Ahora:
  - El botón de cerrar respeta el área segura del celular (notch/gestos).
  - Se agregó un botón adicional "Cerrar visor", siempre visible, abajo del
    todo.
  - Si el modelo tarda más de 12 segundos en cargar (o falla), aparece un
    aviso con botón de cerrar en vez de quedar girando para siempre.

## Cómo funciona el visor 3D / RA
- Se usa el componente <model-viewer> de Google (se carga por CDN).
- En computadora: el plato se ve en 3D, se gira arrastrando y se acerca con
  la rueda del mouse.
- En celular: aparece además el botón "Ver en tu mesa (RA)", que activa la
  cámara y coloca el plato en Realidad Aumentada, a tamaño real:
    - Android: usa WebXR o Scene Viewer de Google (funciona directo con el
      .glb que ya está generado).
    - iPhone/iOS: Safari necesita, además del .glb, una versión .usdz del
      mismo modelo para poder abrir la cámara (Quick Look de Apple). Hoy el
      sitio funciona en 3D interactivo en iPhone, y en RA completa en
      Android; si quieres RA también en iPhone dime y genero el .usdz.

## Cómo agregar más platos a la carta
1. Duplica una tarjeta `<article class="dish-card">` en index.html.
2. Cambia foto, nombre, precio y descripción.
3. Si tienes su modelo 3D, agrega `data-model="models/tu-plato.glb"` y
   `data-poster="img/tu-plato.png"` al botón "Ver en 3D / RA" (ver
   herramientas/README.md para generar el .glb). Si todavía no tienes
   modelo, deja la tarjeta como "Próximamente en 3D" (hay 3 ejemplos ya
   armados en el archivo).
