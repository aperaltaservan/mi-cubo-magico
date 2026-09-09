// ============================================================
//  giiker.js — Conexion Bluetooth con el cubo inteligente
//              (Xiaomi Mi Smart Magic Cube / GiiKER SuperCube)
// ============================================================
//  Protocolo: servicio aadb / caracteristica aadc, paquetes de
//  20 bytes: los 16 primeros son el estado del cubo y los que
//  siguen, el historial de giros (el mas reciente primero).
//  Los i3s mandan el paquete cifrado (byte 18 = 0xa7) y entonces
//  solo caben 2 giros de historial en vez de 4.
// ============================================================

export const SERVICE_UUID = '0000aadb-0000-1000-8000-00805f9b34fb';
export const CHAR_UUID = '0000aadc-0000-1000-8000-00805f9b34fb';
export const SYS_SERVICE_UUID = '0000aaaa-0000-1000-8000-00805f9b34fb';
export const SYS_READ_UUID = '0000aaab-0000-1000-8000-00805f9b34fb';
export const SYS_WRITE_UUID = '0000aaac-0000-1000-8000-00805f9b34fb';

// Servicios que pedimos permiso para mirar. Web Bluetooth sólo deja ver los
// servicios declarados aquí, así que la lista incluye los de otros cubos
// conocidos: si el tuyo no es un GiiKER, al menos sabremos qué expone.
export const KNOWN_SERVICES = [
  '0000aadb-0000-1000-8000-00805f9b34fb',   // GiiKER / Xiaomi (datos)
  '0000aaaa-0000-1000-8000-00805f9b34fb',   // GiiKER (sistema)
  '0000fff0-0000-1000-8000-00805f9b34fb',   // varios cubos chinos
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '0000fe95-0000-1000-8000-00805f9b34fb',   // Xiaomi
  '0000180f-0000-1000-8000-00805f9b34fb',   // batería
  '0000180a-0000-1000-8000-00805f9b34fb',   // información del dispositivo
  '00001800-0000-1000-8000-00805f9b34fb',   // acceso genérico
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e',   // Nordic UART (GAN v2)
  '0000fff1-0000-1000-8000-00805f9b34fb',
  '8653000a-43e6-47b7-9cb0-5fc21d4ae340',   // GAN gen3
  '00000010-0000-fff7-fff6-fff5fff4fff0',   // GAN gen4
];

// Tabla de descifrado de los cubos i3s
const DECRYPT_KEY = [
  0xb0, 0x51, 0x68, 0xe0, 0x56, 0x89, 0xed, 0x77, 0x26, 0x1a, 0xc1, 0xa1,
  0xd2, 0x7e, 0x96, 0x51, 0x5d, 0x0d, 0xec, 0xf9, 0x59, 0xeb, 0x58, 0x18,
  0x71, 0x51, 0xd6, 0x83, 0x82, 0xc7, 0x02, 0xa9, 0x27, 0xa5, 0xab, 0x29,
];

/** Codigo de cara del cubo -> letra. El cubo usa su propio sistema. */
export const GIIKER_FACES = ['B', 'D', 'L', 'U', 'R', 'F'];

export function decryptPacket(data) {
  if (data.length < 20 || data[18] !== 0xa7) return { bytes: data, encrypted: false };
  // En los i3s los bytes 18 y 19 son la marca y los desplazamientos: no se
  // descifran, y por eso sólo quedan 2 giros de historial en vez de 4.
  const o1 = data[19] >> 4;
  const o2 = data[19] & 0x0f;
  const out = new Uint8Array(20);
  for (let i = 0; i < 18; i++) {
    out[i] = (data[i] + DECRYPT_KEY[o1 + i] + DECRYPT_KEY[o2 + i]) & 0xff;
  }
  out[18] = data[18];
  out[19] = data[19];
  return { bytes: out, encrypted: true };
}

export function parsePacket(raw) {
  const { bytes, encrypted } = decryptPacket(raw);
  const moves = [];
  const n = encrypted ? 2 : 4;
  for (let i = 0; i < n; i++) {
    const b = bytes[16 + i];
    let amount = b & 0x0f;
    if (amount === 9) amount = 2;
    if (amount > 3) amount = amount % 4 || 1;
    moves.push({ code: b >> 4, amount });
  }
  return { bytes, raw, moves, encrypted, solved: looksSolved(bytes) };
}

/**
 * ¿El cubo dice que está resuelto?
 *
 * Los 16 primeros bytes son el estado: posición de las 8 esquinas, su giro,
 * posición de las 12 aristas y su giro. Resuelto = permutaciones en orden y
 * giros todos iguales. No hace falta saber qué valor significa "sin girar":
 * que las 8 esquinas coincidan ya implica que ninguna está girada, porque
 * los giros de las esquinas tienen que sumar múltiplo de 3.
 */
export function looksSolved(b) {
  if (!b || b.length < 16) return false;
  if (b[0] !== 0x12 || b[1] !== 0x34 || b[2] !== 0x56 || b[3] !== 0x78) return false;
  if (b[8] !== 0x12 || b[9] !== 0x34 || b[10] !== 0x56) return false;
  if (b[11] !== 0x78 || b[12] !== 0x9a || b[13] !== 0xbc) return false;
  if (b[14] !== 0x00 || b[15] !== 0x00) return false;          // aristas sin girar
  for (let i = 5; i < 8; i++) if (b[i] !== b[4]) return false; // esquinas iguales
  return (b[4] >> 4) === (b[4] & 0x0f);
}

function sameMove(a, b) { return a && b && a.code === b.code && a.amount === b.amount; }

/**
 * Compara el historial nuevo con el anterior y devuelve los giros nuevos
 * en orden cronologico. Recupera hasta 4 giros seguidos si se perdio algun
 * aviso por radio.
 */
export function newMoves(prev, cur) {
  if (!prev || !prev.length) return [];
  const n = cur.length;                       // 4 sin cifrar, 2 en los i3s
  for (let k = 0; k <= n; k++) {
    let match = true;
    for (let i = k; i < n; i++) {
      if (!sameMove(cur[i], prev[i - k])) { match = false; break; }
    }
    if (match) return cur.slice(0, k).reverse();
  }
  return [cur[0]];
}

export class SmartCube extends EventTarget {
  constructor() {
    super();
    this.device = null;
    this.server = null;
    this.char = null;
    this.prevMoves = null;
    this.battery = null;
    this.lastPacket = null;
  }

  get connected() { return !!(this.device && this.device.gatt && this.device.gatt.connected); }
  get name() { return this.device ? this.device.name || 'Cubo' : null; }

  static get available() {
    return typeof navigator !== 'undefined' && !!navigator.bluetooth;
  }

  async connect({ anyDevice = false } = {}) {
    if (!SmartCube.available) {
      throw new Error('Este navegador no tiene Bluetooth Web. Usa Chrome o Edge.');
    }
    const options = anyDevice
      ? { acceptAllDevices: true, optionalServices: KNOWN_SERVICES }
      : {
        filters: [
          { services: [SERVICE_UUID] },
          { namePrefix: 'Gi' },
          { namePrefix: 'gi' },
          { namePrefix: 'GI' },
          { namePrefix: 'Mi' },
          { namePrefix: 'MI' },
          { namePrefix: 'Rubik' },
          { namePrefix: 'Xiaomi' },
          { namePrefix: 'Cube' },
          { namePrefix: 'MHDW' },
        ],
        optionalServices: KNOWN_SERVICES,
      };

    this.device = await navigator.bluetooth.requestDevice(options);
    this.device.addEventListener('gattserverdisconnected', () => {
      this.char = null;
      this.prevMoves = null;
      this.dispatchEvent(new CustomEvent('disconnect'));
    });

    const server = await this.device.gatt.connect();
    this.server = server;

    let service;
    try {
      service = await server.getPrimaryService(SERVICE_UUID);
    } catch (e) {
      // No es un GiiKER/Xiaomi (o no anuncia ese servicio): apuntamos lo que
      // sí tiene, que es justo lo que hace falta para dar soporte a otro modelo.
      this.report = await this.inspect(server);
      const err = new Error(
        'Conecté con "' + this.name + '", pero no encuentro el servicio de los cubos ' +
        'GiiKER/Xiaomi. Servicios que sí tiene: ' +
        (this.report.length ? this.report.map((s) => s.service).join(', ') : 'ninguno visible'),
      );
      err.report = this.report;
      throw err;
    }
    this.char = await service.getCharacteristic(CHAR_UUID);

    // Lee el estado actual para no confundir el primer giro
    try {
      const v = await this.char.readValue();
      const pkt = parsePacket(new Uint8Array(v.buffer));
      this.prevMoves = pkt.moves;
      this.lastPacket = pkt;
    } catch (e) { this.prevMoves = null; }

    this.char.addEventListener('characteristicvaluechanged', (ev) => this._onValue(ev));
    await this.char.startNotifications();

    this._readBattery(server).catch(() => {});
    this.dispatchEvent(new CustomEvent('connect', { detail: { name: this.name } }));
    return this;
  }

  /** Lista los servicios y características visibles del aparato conectado */
  async inspect(server) { return inspeccionar(server); }

  async _readBattery(server) {
    const sys = await server.getPrimaryService(SYS_SERVICE_UUID);
    const w = await sys.getCharacteristic(SYS_WRITE_UUID);
    const r = await sys.getCharacteristic(SYS_READ_UUID);
    await w.writeValue(new Uint8Array([0xb5]));
    const v = await r.readValue();
    this.battery = v.getUint8(1);
    this.dispatchEvent(new CustomEvent('battery', { detail: { level: this.battery } }));
  }

  _onValue(ev) {
    const raw = new Uint8Array(ev.target.value.buffer);
    // los bytes tal cual, además del paquete ya entendido: así la grabación
    // de un cubo desconocido y la de un GiiKER pasan por el mismo sitio
    this.dispatchEvent(new CustomEvent('raw', {
      detail: { service: SERVICE_UUID, char: CHAR_UUID, bytes: raw },
    }));
    const pkt = parsePacket(raw);
    this.lastPacket = pkt;
    const fresh = newMoves(this.prevMoves, pkt.moves);
    this.prevMoves = pkt.moves;
    for (const m of fresh) {
      if (m.code < 1 || m.code > 6) continue;   // ranura de historial vacía
      this.dispatchEvent(new CustomEvent('move', {
        detail: { cubeFace: GIIKER_FACES[m.code - 1], amount: m.amount, code: m.code },
      }));
    }
    this.dispatchEvent(new CustomEvent('packet', { detail: pkt }));
  }

  disconnect() {
    if (this.device && this.device.gatt.connected) this.device.gatt.disconnect();
  }
}

/** Los servicios y características que se dejan ver del aparato conectado */
export async function inspeccionar(server) {
  const out = [];
  let services = [];
  try { services = await server.getPrimaryServices(); } catch (e) { return out; }
  for (const s of services) {
    const row = { service: s.uuid, chars: [] };
    try {
      for (const c of await s.getCharacteristics()) {
        const p = c.properties;
        row.chars.push(c.uuid + ' [' +
          [p.read && 'leer', p.write && 'escribir', p.notify && 'avisar']
            .filter(Boolean).join(',') + ']');
      }
    } catch (e) { /* sin permiso para mirar dentro */ }
    out.push(row);
  }
  return out;
}

/**
 * Escucha a cualquier aparato sin entender una palabra de lo que dice.
 *
 * Se conecta, se suscribe a todo lo que avise y saca los bytes tal cual.
 * No sirve para jugar: sirve para que alguien con un GAN, un MoYu o un
 * QiYi pueda grabar qué manda su cubo al dar unos giros conocidos, que
 * es lo único que falta para escribir su decodificador. A ciegas no se
 * puede, y adivinando tampoco.
 *
 * Aviso importante: Web Bluetooth sólo deja ver los servicios que se
 * piden por adelantado, así que un cubo con un servicio que no esté en
 * KNOWN_SERVICES saldrá mudo. Eso también es información: el volcado lo
 * dice, y entonces lo que hay que averiguar es su UUID.
 */
export class Escucha extends EventTarget {
  constructor() {
    super();
    this.device = null;
    this.server = null;
    this.chars = [];
    this.report = [];
  }

  get connected() { return !!(this.device && this.device.gatt && this.device.gatt.connected); }
  get name() { return this.device ? this.device.name || 'Aparato' : null; }

  async connect() {
    if (!SmartCube.available) {
      throw new Error('Este navegador no tiene Bluetooth Web. Usa Chrome o Edge.');
    }
    this.device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true, optionalServices: KNOWN_SERVICES,
    });
    this.device.addEventListener('gattserverdisconnected', () => {
      this.chars = [];
      this.dispatchEvent(new CustomEvent('disconnect'));
    });
    const server = await this.device.gatt.connect();
    this.server = server;
    this.report = await inspeccionar(server);

    let services = [];
    try { services = await server.getPrimaryServices(); } catch (e) { services = []; }
    for (const s of services) {
      let cs = [];
      try { cs = await s.getCharacteristics(); } catch (e) { continue; }
      for (const c of cs) {
        if (!c.properties.notify && !c.properties.indicate) continue;
        c.addEventListener('characteristicvaluechanged', (ev) => {
          this.dispatchEvent(new CustomEvent('raw', {
            detail: {
              service: s.uuid,
              char: c.uuid,
              bytes: new Uint8Array(ev.target.value.buffer),
            },
          }));
        });
        // alguna se niega a avisar aunque diga que puede; las demás siguen
        try { await c.startNotifications(); this.chars.push(c.uuid); } catch (e) { /* esa no */ }
      }
    }
    this.dispatchEvent(new CustomEvent('connect', { detail: { name: this.name } }));
    return this;
  }

  disconnect() {
    if (this.connected) this.device.gatt.disconnect();
  }
}
