# Cómo generar el modelo 3D (GLB) de un nuevo plato

1. Guarda la foto del plato con fondo transparente en `img/nombre-plato.png`.
2. Instala dependencias una sola vez:
   npm install @gltf-transform/core @gltf-transform/extensions
3. Copia `build-model.mjs`, cambia IMG_PATH y OUT_PATH, y ajusta W/H si el plato
   es más grande o pequeño que 26 cm.
4. Ejecuta: node build-model.mjs
5. Copia el .glb resultante a la carpeta `models/` del sitio y enlázalo en un
   botón `data-open-viewer` en index.html (mismo patrón que "Pollo a la Brasa").
