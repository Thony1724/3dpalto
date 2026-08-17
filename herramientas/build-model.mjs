// build-model-v2.mjs
// Genera models/braza-rem.glb con geometría real por elemento del plato:
// base cerámica, pollo (2 lóbulos + veta de carbón), papas apiladas,
// ensalada (lechuga/tomate/cebolla/zanahoria) y vasito de salsa.
import * as THREE from 'three';
import { Document, NodeIO } from '@gltf-transform/core';
import fs from 'fs';

const OUT_PATH = './models/braza-rem.glb';

const doc = new Document();
const buffer = doc.createBuffer();

// ---------- utilidades ----------
function makeMaterial(name, hex, { roughness = 0.75, metallic = 0, emissive = null } = {}) {
  const c = new THREE.Color(hex);
  const m = doc.createMaterial(name)
    .setBaseColorFactor([c.r, c.g, c.b, 1])
    .setRoughnessFactor(roughness)
    .setMetallicFactor(metallic);
  if (emissive) {
    // pequeño brillo cálido para las zonas más doradas/caramelizadas
    const e = new THREE.Color(emissive);
    m.setEmissiveFactor([e.r * 0.06, e.g * 0.06, e.b * 0.06]);
  }
  return m;
}

// Convierte una THREE.BufferGeometry (ya transformada en espacio local) en un Primitive glTF
function addPrimitive(mesh, geometry, material) {
  geometry = geometry.index ? geometry.toNonIndexed() : geometry; // simplifica: sin índices, triángulos directos
  geometry.computeVertexNormals();

  const pos = geometry.attributes.position.array;
  const norm = geometry.attributes.normal.array;

  const posAccessor = doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer);
  const normAccessor = doc.createAccessor().setType('VEC3').setArray(new Float32Array(norm)).setBuffer(buffer);

  const prim = doc.createPrimitive()
    .setMaterial(material)
    .setAttribute('POSITION', posAccessor)
    .setAttribute('NORMAL', normAccessor);

  mesh.addPrimitive(prim);
}

// Aplica posición/rotación(y en radianes)/escala a una geometría, en el sitio (bake)
function place(geometry, [x, y, z], rotY = 0, scale = [1, 1, 1], rotX = 0, rotZ = 0) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rotX, rotY, rotZ));
  m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(...scale));
  geometry.applyMatrix4(m);
  return geometry;
}

function rand(min, max) { return min + Math.random() * (max - min); }
Math.seedrandomLike = null; // (sin dependencias externas; Math.random determinista no es crítico aquí)

// ---------- materiales (colores tomados de la foto real) ----------
const matPlate     = makeMaterial('ceramica',      '#DCD2C4', { roughness: 0.55 });
const matPlateRim   = makeMaterial('borde-plato',    '#9C8A78', { roughness: 0.7 });
const matChickenBase = makeMaterial('pollo-base',     '#A8501A', { roughness: 0.55, emissive: '#A8501A' });
const matChickenChar  = makeMaterial('pollo-carbon',   '#3B1204', { roughness: 0.65 });
const matChickenGold   = makeMaterial('pollo-dorado',   '#C97A3D', { roughness: 0.5, emissive: '#C97A3D' });
const matFries           = makeMaterial('papas',            '#E8C468', { roughness: 0.45, emissive: '#E8C468' });
const matLettuce           = makeMaterial('lechuga',           '#4F7A2E', { roughness: 0.6 });
const matTomato               = makeMaterial('tomate',            '#B32418', { roughness: 0.4 });
const matOnion                   = makeMaterial('cebolla',           '#E4C3CC', { roughness: 0.4 });
const matCarrot                     = makeMaterial('zanahoria',         '#E08A2E', { roughness: 0.5 });
const matSauceCup                     = makeMaterial('vaso-salsa',        '#EDE6DA', { roughness: 0.35 });
const matSauceTop                       = makeMaterial('salsa',              '#E8B93A', { roughness: 0.3 });

// ---------- geometría base ----------
const mesh = doc.createMesh('plato-braza');

const Y0 = 0.014; // superficie superior del plato

// Plato
addPrimitive(mesh, place(new THREE.CylinderGeometry(0.13, 0.132, 0.014, 56), [0, 0.007, 0]), matPlate);
addPrimitive(mesh, place(new THREE.TorusGeometry(0.121, 0.008, 10, 56), [0, Y0, 0], 0, [1, 0.35, 1], Math.PI / 2), matPlateRim);

// --- Pollo (lóbulo pierna + lóbulo pechuga + vetas de carbón) ---
addPrimitive(mesh, place(new THREE.SphereGeometry(1, 20, 14), [-0.068, Y0 + 0.028, 0.040], 0.5, [0.058, 0.032, 0.070]), matChickenBase);
addPrimitive(mesh, place(new THREE.SphereGeometry(1, 20, 14), [-0.026, Y0 + 0.030, -0.017], -0.3, [0.062, 0.036, 0.058]), matChickenGold);
addPrimitive(mesh, place(new THREE.SphereGeometry(1, 16, 10), [-0.016, Y0 + 0.050, -0.048], 0.2, [0.044, 0.018, 0.038]), matChickenChar);
addPrimitive(mesh, place(new THREE.SphereGeometry(1, 16, 10), [-0.072, Y0 + 0.048, 0.055], 0.1, [0.030, 0.014, 0.030]), matChickenChar);
addPrimitive(mesh, place(new THREE.SphereGeometry(1, 16, 10), [-0.040, Y0 + 0.056, 0.005], -0.2, [0.028, 0.014, 0.026]), matChickenChar);

// --- Papas (bastones apilados) ---
const friesCenter = [-0.062, 0, -0.080];
for (let i = 0; i < 16; i++) {
  const len = rand(0.038, 0.052);
  const x = friesCenter[0] + rand(-0.045, 0.045);
  const z = friesCenter[2] + rand(-0.035, 0.035);
  const y = Y0 + 0.005 + i * 0.0016 + rand(0, 0.003);
  const rotY = rand(0, Math.PI);
  const rotZ = rand(-0.25, 0.25);
  addPrimitive(mesh, place(new THREE.BoxGeometry(0.007, 0.007, len), [x, y, z], rotY, [1, 1, 1], 0, rotZ), matFries);
}

// --- Ensalada (lechuga + tomate + cebolla + zanahoria) ---
const saladCenter = [0.057, 0, -0.038];
for (let i = 0; i < 6; i++) {
  const x = saladCenter[0] + rand(-0.05, 0.05);
  const z = saladCenter[2] + rand(-0.05, 0.05);
  addPrimitive(mesh, place(new THREE.IcosahedronGeometry(0.024, 0), [x, Y0 + 0.008, z], rand(0, Math.PI), [1, 0.28, 1]), matLettuce);
}
for (let i = 0; i < 3; i++) {
  const x = saladCenter[0] + rand(-0.03, 0.045);
  const z = saladCenter[2] + rand(-0.02, 0.045);
  addPrimitive(mesh, place(new THREE.CylinderGeometry(0.017, 0.017, 0.006, 16), [x, Y0 + 0.017, z], 0), matTomato);
}
for (let i = 0; i < 3; i++) {
  const x = saladCenter[0] + rand(-0.035, 0.03);
  const z = saladCenter[2] + rand(-0.03, 0.03);
  addPrimitive(mesh, place(new THREE.TorusGeometry(0.013, 0.0035, 8, 20), [x, Y0 + 0.019, z], 0, [1, 1, 1], Math.PI / 2, rand(0, Math.PI)), matOnion);
}
for (let i = 0; i < 5; i++) {
  const x = saladCenter[0] + rand(-0.04, 0.04);
  const z = saladCenter[2] + rand(-0.04, 0.04);
  addPrimitive(mesh, place(new THREE.CylinderGeometry(0.0018, 0.0018, 0.028, 6), [x, Y0 + 0.014, z], 0, [1, 1, 1], Math.PI / 2, rand(0, Math.PI)), matCarrot);
}

// --- Vasito de salsa ---
addPrimitive(mesh, place(new THREE.CylinderGeometry(0.035, 0.030, 0.030, 28), [0.073, Y0 + 0.015, 0.035], 0), matSauceCup);
addPrimitive(mesh, place(new THREE.CylinderGeometry(0.032, 0.032, 0.006, 28), [0.073, Y0 + 0.033, 0.035], 0), matSauceTop);

const node = doc.createNode('PlatoBraza').setMesh(mesh);
const scene = doc.createScene('Escena').addChild(node);
doc.getRoot().setDefaultScene(scene);

const io = new NodeIO();
await io.write(OUT_PATH, doc);
console.log('Modelo volumétrico generado en', OUT_PATH);
