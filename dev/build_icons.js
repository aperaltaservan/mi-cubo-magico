// ============================================================
//  dev/build_icons.js — Dibuja los iconos de la app
// ============================================================
//  Genera los PNG que hacen falta para instalarla en el móvil.
//  Se escriben a mano, píxel a píxel, porque el proyecto no tiene
//  dependencias y no las va a tener por unos cuadraditos.
//
//  Tienen que ser PNG: iOS no acepta SVG para el icono de la
//  pantalla de inicio, y ése es justo el caso que nos importa.
//
//  El dibujo es la cara de un cubo: nueve cuadrados de colores
//  sobre el morado de la app. Ocupa el 62% del ancho, que cae
//  dentro de la zona segura de los iconos "maskable" (el círculo
//  central del 80%), así que Android puede recortarlo en redondo
//  sin comerse nada.
//
//  Uso:  npm run iconos
// ============================================================

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const FONDO = [0x24, 0x1a, 0x35];      // el morado del fondo de la app
const HUECO = [0x14, 0x0d, 0x22];      // las juntas entre pegatinas

// Nueve pegatinas, con los seis colores del cubo repartidos
const COLORES = {
  b: [0xfa, 0xfa, 0xfa],   // blanco
  a: [0xff, 0xd9, 0x3d],   // amarillo
  v: [0x4c, 0xaf, 0x50],   // verde
  z: [0x21, 0x96, 0xf3],   // azul
  r: [0xe5, 0x39, 0x35],   // rojo
  n: [0xff, 0x8c, 0x42],   // naranja
};
const CARA = [
  'v', 'a', 'r',
  'n', 'b', 'v',
  'a', 'z', 'n',
];

// ---------- un PNG mínimo, sin dependencias ----------
const TABLA = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = TABLA[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function trozo(tipo, datos) {
  const cabecera = Buffer.alloc(4);
  cabecera.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const cola = Buffer.alloc(4);
  cola.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([cabecera, cuerpo, cola]);
}

/** @param {number} lado @param {Uint8Array} rgb  lado*lado*3 bytes */
function png(lado, rgb) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(lado, 0);
  ihdr.writeUInt32BE(lado, 4);
  ihdr[8] = 8;      // 8 bits por canal
  ihdr[9] = 2;      // color verdadero, sin transparencia (iOS la rellena de negro)
  // 10, 11, 12 quedan a 0: compresión, filtro e interlazado estándar

  // cada línea lleva delante su byte de filtro, aquí siempre 0 (ninguno)
  const crudo = Buffer.alloc(lado * (lado * 3 + 1));
  for (let y = 0; y < lado; y++) {
    crudo[y * (lado * 3 + 1)] = 0;
    rgb.subarray(y * lado * 3, (y + 1) * lado * 3)
      .forEach((v, i) => { crudo[y * (lado * 3 + 1) + 1 + i] = v; });
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(crudo, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

/** Pinta la cara del cubo en un lienzo cuadrado */
function dibujar(lado) {
  const px = new Uint8Array(lado * lado * 3);
  const pon = (x, y, c) => {
    const i = (y * lado + x) * 3;
    px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2];
  };
  for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) pon(x, y, FONDO);

  const caja = Math.round(lado * 0.62);          // la cara, dentro de la zona segura
  const desde = Math.round((lado - caja) / 2);
  const junta = Math.max(1, Math.round(caja * 0.035));
  const celda = (caja - junta * 4) / 3;
  const redondeo = Math.max(1, Math.round(celda * 0.18));

  // el marco oscuro de la cara
  for (let y = desde; y < desde + caja; y++) {
    for (let x = desde; x < desde + caja; x++) pon(x, y, HUECO);
  }

  for (let f = 0; f < 3; f++) {
    for (let c = 0; c < 3; c++) {
      const color = COLORES[CARA[f * 3 + c]];
      const x0 = Math.round(desde + junta + c * (celda + junta));
      const y0 = Math.round(desde + junta + f * (celda + junta));
      const lado2 = Math.round(celda);
      for (let y = 0; y < lado2; y++) {
        for (let x = 0; x < lado2; x++) {
          // esquinas redondeadas, a lo bruto pero suficiente a este tamaño
          const dx = Math.min(x, lado2 - 1 - x);
          const dy = Math.min(y, lado2 - 1 - y);
          if (dx < redondeo && dy < redondeo) {
            const r = redondeo - 0.5;
            if ((r - dx) ** 2 + (r - dy) ** 2 > r * r) continue;
          }
          pon(x0 + x, y0 + y, color);
        }
      }
    }
  }
  return px;
}

const CARPETA = join(RAIZ, 'icons');
mkdirSync(CARPETA, { recursive: true });

// 192 y 512 los pide el manifiesto; 180 es el que usa iOS.
for (const lado of [180, 192, 512]) {
  const nombre = lado === 180 ? 'apple-touch-icon.png' : 'icon-' + lado + '.png';
  const datos = png(lado, dibujar(lado));
  writeFileSync(join(CARPETA, nombre), datos);
  console.log('  icons/' + nombre + '  ' + lado + '×' + lado + '  ' + datos.length + ' bytes');
}
console.log('Iconos generados.');
