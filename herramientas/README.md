# Cómo generar el modelo 3D (GLB) de un nuevo plato

Este script arma el plato con geometría real (no una foto pegada): un disco
para la base, y una pieza 3D distinta por cada ingrediente (proteína, guarnición,
ensalada, salsa...), coloreada según la foto real del plato.

1. Instala dependencias una sola vez, dentro de esta carpeta:
   npm install @gltf-transform/core three
2. Copia build-model.mjs y edítalo:
   - Cambia los nombres de los materiales/colores (busca los `makeMaterial(...)`)
     por los tonos de tu nuevo plato (puedes tomarlos con el cuentagotas de
     cualquier editor de imágenes sobre tu foto).
   - Ajusta las formas y posiciones (CylinderGeometry, SphereGeometry,
     BoxGeometry, TorusGeometry, IcosahedronGeometry de three.js) según los
     ingredientes de ese plato. Todo se coloca en metros, con Y hacia arriba.
3. Ejecuta: node build-model.mjs
4. (Opcional pero recomendado) valida el archivo:
   npx --yes gltf-validator models/tu-plato.glb   (o usa el paquete gltf-validator)
5. Copia el .glb resultante a la carpeta `models/` del sitio y enlázalo en un
   botón `data-open-viewer` en index.html (mismo patrón que "Pollo a la Brasa").

Nota: esto genera una versión estilizada/low-poly del plato (formas simples
con los colores reales), no un escaneo fotorrealista. Para un modelo
fotorrealista idéntico a la foto se necesita fotogrametría (varias fotos
desde distintos ángulos) o un modelador 3D — dime si quieres que exploremos
esa opción para platos clave de la carta.
