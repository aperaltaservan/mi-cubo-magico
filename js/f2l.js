// ============================================================
//  f2l.js — Los 41 casos de la segunda capa (hueco delantero-derecho)
// ============================================================
//  Generado por dev/build_f2l.js. Los casos no salen de ninguna
//  tabla: se recorren todas las formas de sacar el par del hueco
//  sin tocar el resto del cubo, asi que la solucion de cada caso
//  es ese camino al reves y es correcta por construccion.
//
//  No editar a mano: vuelve a generarlo con
//      node dev/build_f2l.js
// ============================================================

export const F2L_GRUPOS = ["Los dos arriba","Esquina metida","Arista metida","Los dos dentro"];

export const F2L_CASES = [
  { id: "f2l1", num: 1, name: "F2L 1 · par junto, blanco de lado", group: "Los dos arriba", caso: "U01|U01", alg: "F' U F" },
  { id: "f2l2", num: 2, name: "F2L 2 · par separado, blanco de lado", group: "Los dos arriba", caso: "U01|U20", alg: "R U R'" },
  { id: "f2l3", num: 3, name: "F2L 3 · par junto, blanco de lado", group: "Los dos arriba", caso: "U02|U11", alg: "F' U' F" },
  { id: "f2l4", num: 4, name: "F2L 4 · par separado, blanco de lado", group: "Los dos arriba", caso: "U02|U30", alg: "R U' R'" },
  { id: "f2l5", num: 5, name: "F2L 5 · par junto, blanco arriba", group: "Los dos arriba", caso: "U00|U10", alg: "F' U' F R U R'" },
  { id: "f2l6", num: 6, name: "F2L 6 · par junto, blanco arriba", group: "Los dos arriba", caso: "U00|U11", alg: "F' U2 F2 R' F' R" },
  { id: "f2l7", num: 7, name: "F2L 7 · par separado, blanco arriba", group: "Los dos arriba", caso: "U00|U20", alg: "R U2 R2 F R F'" },
  { id: "f2l8", num: 8, name: "F2L 8 · par separado, blanco arriba", group: "Los dos arriba", caso: "U00|U21", alg: "R U R' F' U' F" },
  { id: "f2l9", num: 9, name: "F2L 9 · par junto, blanco arriba", group: "Los dos arriba", caso: "U00|U01", alg: "F' U2 F U F' U' F" },
  { id: "f2l10", num: 10, name: "F2L 10 · par separado, blanco arriba", group: "Los dos arriba", caso: "U00|U30", alg: "R U2 R' U' R U R'" },
  { id: "f2l11", num: 11, name: "F2L 11 · par junto, blanco de lado", group: "Los dos arriba", caso: "U01|U00", alg: "F' U2 F U' R U R'" },
  { id: "f2l12", num: 12, name: "F2L 12 · par junto, blanco de lado", group: "Los dos arriba", caso: "U01|U10", alg: "R U' R' U' R U R'" },
  { id: "f2l13", num: 13, name: "F2L 13 · par junto, blanco de lado", group: "Los dos arriba", caso: "U01|U11", alg: "F' U' F U2 F' U F" },
  { id: "f2l14", num: 14, name: "F2L 14 · par separado, blanco de lado", group: "Los dos arriba", caso: "U01|U21", alg: "F' U2 F U2 F' U F" },
  { id: "f2l15", num: 15, name: "F2L 15 · par separado, blanco de lado", group: "Los dos arriba", caso: "U01|U30", alg: "R U' R' U R U R'" },
  { id: "f2l16", num: 16, name: "F2L 16 · par separado, blanco de lado", group: "Los dos arriba", caso: "U01|U31", alg: "R U' R' U2 F' U' F" },
  { id: "f2l17", num: 17, name: "F2L 17 · par junto, blanco de lado", group: "Los dos arriba", caso: "U02|U00", alg: "F' U F U2 R U R'" },
  { id: "f2l18", num: 18, name: "F2L 18 · par junto, blanco de lado", group: "Los dos arriba", caso: "U02|U01", alg: "F' U F U' F' U' F" },
  { id: "f2l19", num: 19, name: "F2L 19 · par junto, blanco de lado", group: "Los dos arriba", caso: "U02|U10", alg: "R U2 R' U2 R U' R'" },
  { id: "f2l20", num: 20, name: "F2L 20 · par separado, blanco de lado", group: "Los dos arriba", caso: "U02|U20", alg: "R U R' U' R U2 R'" },
  { id: "f2l21", num: 21, name: "F2L 21 · par separado, blanco de lado", group: "Los dos arriba", caso: "U02|U21", alg: "F' U' F U' F' U' F" },
  { id: "f2l22", num: 22, name: "F2L 22 · par separado, blanco de lado", group: "Los dos arriba", caso: "U02|U31", alg: "R U2 R' U F' U' F" },
  { id: "f2l23", num: 23, name: "F2L 23 · par junto, blanco arriba", group: "Los dos arriba", caso: "U00|U00", alg: "F R' F' R U R U R'" },
  { id: "f2l24", num: 24, name: "F2L 24 · par separado, blanco arriba", group: "Los dos arriba", caso: "U00|U31", alg: "R' F R F' U' F' U' F" },
  { id: "f2l25", num: 25, name: "F2L 25 · esquina metida girada", group: "Esquina metida", caso: "S1|U00", alg: "F' U2 F R U2 R'" },
  { id: "f2l26", num: 26, name: "F2L 26 · esquina metida girada", group: "Esquina metida", caso: "S1|U01", alg: "R U' R' F' U' F" },
  { id: "f2l27", num: 27, name: "F2L 27 · esquina metida girada", group: "Esquina metida", caso: "S2|U00", alg: "F' U F R U R'" },
  { id: "f2l28", num: 28, name: "F2L 28 · esquina metida girada", group: "Esquina metida", caso: "S2|U01", alg: "R U2 R' F' U2 F" },
  { id: "f2l29", num: 29, name: "F2L 29 · esquina bien, arista fuera", group: "Esquina metida", caso: "S0|U00", alg: "R' F R F' R U R'" },
  { id: "f2l30", num: 30, name: "F2L 30 · esquina bien, arista fuera", group: "Esquina metida", caso: "S0|U01", alg: "F R' F' R F' U' F" },
  { id: "f2l31", num: 31, name: "F2L 31 · arista metida del revés", group: "Arista metida", caso: "U00|S1", alg: "F' U2 F R U R'" },
  { id: "f2l32", num: 32, name: "F2L 32 · arista bien, esquina fuera", group: "Arista metida", caso: "U01|S0", alg: "R U R' U2 R U R'" },
  { id: "f2l33", num: 33, name: "F2L 33 · arista metida del revés", group: "Arista metida", caso: "U01|S1", alg: "F' U' F R' F R F'" },
  { id: "f2l34", num: 34, name: "F2L 34 · arista bien, esquina fuera", group: "Arista metida", caso: "U02|S0", alg: "R U' R' U2 R U' R'" },
  { id: "f2l35", num: 35, name: "F2L 35 · arista metida del revés", group: "Arista metida", caso: "U02|S1", alg: "R U R' U' F' U F" },
  { id: "f2l36", num: 36, name: "F2L 36 · arista bien, esquina fuera", group: "Arista metida", caso: "U00|S0", alg: "F R' F' R U' R U R'" },
  { id: "f2l37", num: 37, name: "F2L 37 · esquina y arista metidas pero mal", group: "Los dos dentro", caso: "S1|S0", alg: "F R' F' R2 U2 R' U' R U R'" },
  { id: "f2l38", num: 38, name: "F2L 38 · esquina y arista metidas pero mal", group: "Los dos dentro", caso: "S1|S1", alg: "F' U F R U' R' U2 R U R'" },
  { id: "f2l39", num: 39, name: "F2L 39 · esquina y arista metidas pero mal", group: "Los dos dentro", caso: "S2|S0", alg: "R' F R F2 U2 F U F' U' F" },
  { id: "f2l40", num: 40, name: "F2L 40 · esquina y arista metidas pero mal", group: "Los dos dentro", caso: "S2|S1", alg: "F R' F' R2 U' R' U2 F' U' F" },
  { id: "f2l41", num: 41, name: "F2L 41 · esquina y arista metidas pero mal", group: "Los dos dentro", caso: "S0|S1", alg: "F R' F' R2 U R' U' R U' R' F' U' F" },
];
