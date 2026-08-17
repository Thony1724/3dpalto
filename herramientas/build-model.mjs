// build-model.mjs
// Genera models/braza-rem.glb : una "tarjeta" 3D con foto del plato,
// con grosor real, para poder verla en 3D/AR con <model-viewer>.
import { Document, NodeIO } from '@gltf-transform/core';
import { KHRMaterialsEmissiveStrength, ALL_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'fs';

const IMG_PATH = './img/braza-rem.png';
const OUT_PATH = './models/braza-rem.glb';

// Aspect ratio real de la imagen
const IMG_W = 558, IMG_H = 447;
const ratio = IMG_W / IMG_H;

// Dimensiones físicas del "plato" en metros (tamaño real aproximado de un plato de comida)
const W = 0.26;
const H = W / ratio;
const D = 0.012; // grosor

const doc = new Document();
const buffer = doc.createBuffer();

// ---- Texturas ----
const imgBytes = fs.readFileSync(IMG_PATH);
const texFood = doc.createTexture('food').setImage(imgBytes).setMimeType('image/png');

// ---- Materiales ----
const matFood = doc
  .createMaterial('plato')
  .setBaseColorTexture(texFood)
  .setAlphaMode('BLEND')
  .setDoubleSided(false)
  .setRoughnessFactor(0.55)
  .setMetallicFactor(0.0);

const matEdge = doc
  .createMaterial('borde')
  .setBaseColorFactor([0.86, 0.8, 0.72, 1])
  .setRoughnessFactor(0.85)
  .setMetallicFactor(0.0);

// ---- Geometría: caja delgada (tarjeta) con foto al frente ----
const hw = W / 2, hh = H / 2, hd = D / 2;

function face(positions, normal, uvs) {
  return { positions, normal, uvs };
}

// cada cara: 4 vértices (x,y,z), normal repetida, uv (u,v)
const faces = [
  // FRONT (+z) -> foto
  face(
    [-hw,-hh, hd,  hw,-hh, hd,  hw, hh, hd,  -hw, hh, hd],
    [0,0,1],
    [0,1, 1,1, 1,0, 0,0]
  ),
  // BACK (-z)
  face(
    [ hw,-hh,-hd, -hw,-hh,-hd, -hw, hh,-hd,  hw, hh,-hd],
    [0,0,-1],
    [0,1, 1,1, 1,0, 0,0]
  ),
  // TOP (+y)
  face(
    [-hw, hh, hd,  hw, hh, hd,  hw, hh,-hd,  -hw, hh,-hd],
    [0,1,0],
    [0,1, 1,1, 1,0, 0,0]
  ),
  // BOTTOM (-y)
  face(
    [-hw,-hh,-hd,  hw,-hh,-hd,  hw,-hh, hd,  -hw,-hh, hd],
    [0,-1,0],
    [0,1, 1,1, 1,0, 0,0]
  ),
  // RIGHT (+x)
  face(
    [ hw,-hh, hd,  hw,-hh,-hd,  hw, hh,-hd,  hw, hh, hd],
    [1,0,0],
    [0,1, 1,1, 1,0, 0,0]
  ),
  // LEFT (-x)
  face(
    [-hw,-hh,-hd, -hw,-hh, hd, -hw, hh, hd, -hw, hh,-hd],
    [-1,0,0],
    [0,1, 1,1, 1,0, 0,0]
  ),
];

function buildPrimitive(faceList, material) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  let base = 0;
  for (const f of faceList) {
    positions.push(...f.positions);
    for (let i = 0; i < 4; i++) normals.push(...f.normal);
    uvs.push(...f.uvs);
    indices.push(base, base+1, base+2, base, base+2, base+3);
    base += 4;
  }

  const posAccessor = doc.createAccessor().setType('VEC3').setArray(new Float32Array(positions)).setBuffer(buffer);
  const normAccessor = doc.createAccessor().setType('VEC3').setArray(new Float32Array(normals)).setBuffer(buffer);
  const uvAccessor = doc.createAccessor().setType('VEC2').setArray(new Float32Array(uvs)).setBuffer(buffer);
  const idxAccessor = doc.createAccessor().setType('SCALAR').setArray(new Uint16Array(indices)).setBuffer(buffer);

  return doc.createPrimitive()
    .setMaterial(material)
    .setAttribute('POSITION', posAccessor)
    .setAttribute('NORMAL', normAccessor)
    .setAttribute('TEXCOORD_0', uvAccessor)
    .setIndices(idxAccessor);
}

const mesh = doc.createMesh('plato-braza');
mesh.addPrimitive(buildPrimitive([faces[0]], matFood));   // frente con foto
mesh.addPrimitive(buildPrimitive(faces.slice(1), matEdge)); // resto (borde/atrás)

const node = doc.createNode('PlatoBraza').setMesh(mesh).setRotation([ -0.70710678, 0, 0, 0.70710678 ]);
// rotamos -90° en X para que la "cara frontal" quede mirando hacia arriba (como un plato en la mesa)

const scene = doc.createScene('Escena').addChild(node);
doc.getRoot().setDefaultScene(scene);

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await io.write(OUT_PATH, doc);
console.log('Modelo generado en', OUT_PATH);
