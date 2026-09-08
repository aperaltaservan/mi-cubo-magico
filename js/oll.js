// ============================================================
//  oll.js — Los 57 casos de OLL (orientar la última capa)
// ============================================================
//  Generado por dev/build_oll.js a partir del conjunto estándar
//  de github.com/Roman-/oll_trainer, y VERIFICADO uno por uno:
//  cada algoritmo respeta las dos primeras capas, orienta la
//  última, y su caso es distinto de todos los demás. Entre los
//  57 cubren las 57 orientaciones posibles.
//
//  No editar a mano: vuelve a generarlo con
//      node dev/build_oll.js
// ============================================================

export const OLL_GRUPOS = ["Cruz hecha", "Punto", "Formas de I", "Formas de L", "Rayos", "Peces", "Formas de T", "Formas de C", "Formas de P", "Formas de W", "Cuadrados", "Salto de caballo", "Formas raras", "Esquinas listas", "Otros"];

export const OLL_FULL = [
  { id: "oll1", num: 1, name: "OLL 1 · Runway", group: "Punto", alg: "R U2 R2 F R F' U2 R' F R F'" },
  { id: "oll2", num: 2, name: "OLL 2 · Zamboni", group: "Punto", alg: "F R U R' U' F' f R U R' U' f'", alt: ["y r U r' U2 R U2 R' U2 r U' r'"] },
  { id: "oll3", num: 3, name: "OLL 3 · Anti-Mouse", group: "Punto", alg: "f R U R' U' f' U' F R U R' U' F'" },
  { id: "oll4", num: 4, name: "OLL 4 · Mouse", group: "Punto", alg: "f R U R' U' f' U F R U R' U' F'" },
  { id: "oll5", num: 5, name: "OLL 5 · Lefty Square", group: "Cuadrados", alg: "r' U2 R U R' U r" },
  { id: "oll6", num: 6, name: "OLL 6 · Righty Square", group: "Cuadrados", alg: "r U2 R' U' R U' r'" },
  { id: "oll7", num: 7, name: "OLL 7 · Fat Sune", group: "Rayos", alg: "r U R' U R U2 r'" },
  { id: "oll8", num: 8, name: "OLL 8 · Fat Antisune", group: "Rayos", alg: "r' U' R U' R' U2 r", alt: ["y2 l' U' L U' L' U2 l"] },
  { id: "oll9", num: 9, name: "OLL 9 · Kite", group: "Peces", alg: "R U R' U' R' F R2 U R' U' F'", alt: ["R' U' R y r U' r' U r U r'"] },
  { id: "oll10", num: 10, name: "OLL 10 · Anti-Kite", group: "Peces", alg: "R U R' U R' F R F' R U2 R'", alt: ["R U R' y R' F R U' R' F' R"] },
  { id: "oll11", num: 11, name: "OLL 11 · Downstairs", group: "Rayos", alg: "r' R2 U R' U R U2 R' U M'" },
  { id: "oll12", num: 12, name: "OLL 12 · Upstairs", group: "Rayos", alg: "M' R' U' R U' R' U2 R U' M", alt: ["y F R U R' U' F' U F R U R' U' F'"] },
  { id: "oll13", num: 13, name: "OLL 13 · Gun", group: "Salto de caballo", alg: "r U' r' U' r U r' y' R' U R", alt: ["F U R U' R2 F' R U R U' R'"] },
  { id: "oll14", num: 14, name: "OLL 14 · Anti-Gun", group: "Salto de caballo", alg: "R' F R U R' F' R F U' F'" },
  { id: "oll15", num: 15, name: "OLL 15 · Squeegee", group: "Salto de caballo", alg: "r' U' r R' U' R U r' U r" },
  { id: "oll16", num: 16, name: "OLL 16 · Anti-Squeegee", group: "Salto de caballo", alg: "r U r' R U R' U' r U' r'" },
  { id: "oll17", num: 17, name: "OLL 17 · Slash", group: "Punto", alg: "R U R' U R' F R F' U2 R' F R F'" },
  { id: "oll18", num: 18, name: "OLL 18 · Crown", group: "Punto", alg: "y R U2 R2 F R F' U2 M' U R U' r'", alt: ["r U R' U R U2 r' r' U' R U' R' U2 r"] },
  { id: "oll19", num: 19, name: "OLL 19 · Bunny", group: "Punto", alg: "M U R U R' U' M' R' F R F'" },
  { id: "oll20", num: 20, name: "OLL 20 · Checkers", group: "Punto", alg: "M U R U R' U' M2 U R U' r'", alt: ["r U R' U' M2 U R U' R' U' M'"] },
  { id: "oll21", num: 21, name: "OLL 21 · Double Headlights", group: "Cruz hecha", alg: "R U2 R' U' R U R' U' R U' R'", alt: ["y R U R' U R U' R' U R U2 R'"] },
  { id: "oll22", num: 22, name: "OLL 22 · Pi-Shape", group: "Cruz hecha", alg: "R U2 R2 U' R2 U' R2 U2 R" },
  { id: "oll23", num: 23, name: "OLL 23 · U-Shape", group: "Cruz hecha", alg: "R2 D R' U2 R D' R' U2 R'", alt: ["y2 R2 D' R U2 R' D R U2 R"] },
  { id: "oll24", num: 24, name: "OLL 24 · Hammerhead", group: "Cruz hecha", alg: "r U R' U' r' F R F'", alt: ["y R U R D R' U' R D' R2"] },
  { id: "oll25", num: 25, name: "OLL 25 · L-Shape", group: "Cruz hecha", alg: "y F' r U R' U' r' F R", alt: ["x R' U R D' R' U' R D x'"] },
  { id: "oll26", num: 26, name: "OLL 26 · Antisune", group: "Cruz hecha", alg: "R U2 R' U' R U' R'", alt: ["y' R' U' R U' R' U2 R"] },
  { id: "oll27", num: 27, name: "OLL 27 · Sune", group: "Cruz hecha", alg: "R U R' U R U2 R'", alt: ["y' R' U2 R U R' U R"] },
  { id: "oll28", num: 28, name: "OLL 28 · Stealth", group: "Esquinas listas", alg: "r U R' U' M U R U' R'" },
  { id: "oll29", num: 29, name: "OLL 29 · Spotted Chameleon", group: "Formas raras", alg: "y R U R' U' R U' R' F' U' F R U R'", alt: ["M U R U R' U' R' F R F' M'"] },
  { id: "oll30", num: 30, name: "OLL 30 · Anti-Spotted Chameleon", group: "Formas raras", alg: "y' F U R U2 R' U' R U2 R' U' F'", alt: ["y' F R' F R2 U' R' U' R U R' F2"] },
  { id: "oll31", num: 31, name: "OLL 31 · Couch", group: "Formas de P", alg: "R' U' F U R U' R' F' R" },
  { id: "oll32", num: 32, name: "OLL 32 · Anti-Couch", group: "Formas de P", alg: "R U B' U' R' U R B R'", alt: ["S R U R' U' R' F R f'"] },
  { id: "oll33", num: 33, name: "OLL 33 · Key", group: "Formas de T", alg: "R U R' U' R' F R F'" },
  { id: "oll34", num: 34, name: "OLL 34 · City", group: "Formas de C", alg: "R U R2 U' R' F R U R U' F'" },
  { id: "oll35", num: 35, name: "OLL 35 · Fish Salad", group: "Peces", alg: "R U2 R2 F R F' R U2 R'" },
  { id: "oll36", num: 36, name: "OLL 36 · Sea Mew", group: "Formas de W", alg: "R' U' R U' R' U R U l U' R' U x", alt: ["y2 R U R' F' R U R' U' R' F R U' R' F R F'"] },
  { id: "oll37", num: 37, name: "OLL 37 · Mounted Fish", group: "Peces", alg: "F R U' R' U' R U R' F'" },
  { id: "oll38", num: 38, name: "OLL 38 · Mario", group: "Formas de W", alg: "R U R' U R U' R' U' R' F R F'" },
  { id: "oll39", num: 39, name: "OLL 39 · Fung", group: "Rayos", alg: "L F' L' U' L U F U' L'", alt: ["F R U R' U' F' R' U' R U' R' U2 R"] },
  { id: "oll40", num: 40, name: "OLL 40 · Anti-Fung", group: "Rayos", alg: "R' F R U R' U' F' U R" },
  { id: "oll41", num: 41, name: "OLL 41 · Awkward Fish", group: "Formas raras", alg: "R U R' U R U2 R' F R U R' U' F'" },
  { id: "oll42", num: 42, name: "OLL 42 · Anti-Awkward Fish", group: "Formas raras", alg: "R' U' R U' R' U2 R F R U R' U' F'", alt: ["y R' F R F' R' F R F' R U R' U' R U R'"] },
  { id: "oll43", num: 43, name: "OLL 43 · Anti-P", group: "Formas de P", alg: "y R' U' F' U F R", alt: ["f' L' U' L U f"] },
  { id: "oll44", num: 44, name: "OLL 44 · P-Shape", group: "Formas de P", alg: "f R U R' U' f'", alt: ["y2 F U R U' R' F'"] },
  { id: "oll45", num: 45, name: "OLL 45 · T-Shape", group: "Formas de T", alg: "F R U R' U' F'" },
  { id: "oll46", num: 46, name: "OLL 46 · Seein' Headlights", group: "Formas de C", alg: "R' U' R' F R F' U R" },
  { id: "oll47", num: 47, name: "OLL 47 · Anti-Breakneck", group: "Formas de L", alg: "F' L' U' L U L' U' L U F", alt: ["R' U' R' F R F' R' F R F' U R"] },
  { id: "oll48", num: 48, name: "OLL 48 · Breakneck", group: "Formas de L", alg: "F R U R' U' R U R' U' F'" },
  { id: "oll49", num: 49, name: "OLL 49 · Right back squeezy", group: "Formas de L", alg: "r U' r2 U r2 U r2 U' r" },
  { id: "oll50", num: 50, name: "OLL 50 · Right front squeezy", group: "Formas de L", alg: "r' U r2 U' r2 U' r2 U r'", alt: ["y' R U2 R' U' R U' R' F R U R' U' F'"] },
  { id: "oll51", num: 51, name: "OLL 51 · Bottlecap", group: "Formas de I", alg: "f R U R' U' R U R' U' f'", alt: ["y2 F U R U' R' U R U' R' F'"] },
  { id: "oll52", num: 52, name: "OLL 52 · Rice Cooker", group: "Formas de I", alg: "R' U' R U' R' U y' R' U R B", alt: ["R U R' U R U' y R U' R' F'"] },
  { id: "oll53", num: 53, name: "OLL 53 · Frying Pan", group: "Formas de L", alg: "r' U' R U' R' U R U' R' U2 r", alt: ["y r' U2 R U R' U' R U R' U r"] },
  { id: "oll54", num: 54, name: "OLL 54 · Anti-Frying Pan", group: "Formas de L", alg: "r U R' U R U' R' U R U2 r'", alt: ["y' r U2 R' U' R U R' U' R U' r'"] },
  { id: "oll55", num: 55, name: "OLL 55 · Highway", group: "Formas de I", alg: "y R' F R U R U' R2 F' R2 U' R' U R U R'" },
  { id: "oll56", num: 56, name: "OLL 56 · Streetlights", group: "Formas de I", alg: "r' U' r U' R' U R U' R' U R r' U r" },
  { id: "oll57", num: 57, name: "OLL 57 · H-Shape", group: "Esquinas listas", alg: "R U R' U' M' U R U' r'" },
];
