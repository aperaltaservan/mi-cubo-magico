// ============================================================
//  fx.js — Voz, sonidos y confeti
// ============================================================

export const fx = {
  voiceOn: true,
  soundOn: true,
  _voice: null,
  // Se habla en el idioma de la app. Se guarda el codigo completo
  // (es-ES) para pedirle al navegador una voz de ese idioma; si no
  // tiene ninguna, habla con la que sea antes que quedarse muda.
  _lang: 'es-ES',

  setIdioma(codigo) {
    this._lang = codigo === 'en' ? 'en-US' : 'es-ES';
    this._voice = this._pickVoice();
  },

  _pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    const all = speechSynthesis.getVoices();
    if (!all.length) return null;
    const base = this._lang.slice(0, 2);
    const exacta = new RegExp(this._lang.replace('-', '[-_]'), 'i');
    return all.find((v) => exacta.test(v.lang))
      || all.find((v) => new RegExp('^' + base, 'i').test(v.lang))
      || null;
  },

  init() {
    if ('speechSynthesis' in window) {
      this._voice = this._pickVoice();
      speechSynthesis.addEventListener('voiceschanged', () => {
        this._voice = this._pickVoice();
      });
    }
  },

  say(text, { interrupt = true, rate = 0.95 } = {}) {
    if (!this.voiceOn || !('speechSynthesis' in window) || !text) return;
    if (interrupt) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = this._lang;
    u.rate = rate;
    u.pitch = 1.15;
    if (this._voice) u.voice = this._voice;
    speechSynthesis.speak(u);
  },

  shutUp() { if ('speechSynthesis' in window) speechSynthesis.cancel(); },

  _ctx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(freq, dur = 0.12, type = 'sine', vol = 0.18, delay = 0) {
    if (!this.soundOn) return;
    const ctx = this._ctx();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  },

  click() { this.tone(660, 0.07, 'triangle', 0.12); },
  good() { this.tone(880, 0.1, 'sine', 0.16); this.tone(1320, 0.14, 'sine', 0.12, 0.09); },
  oops() { this.tone(240, 0.18, 'sawtooth', 0.1); },
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.28, 'triangle', 0.16, i * 0.11));
  },

  confetti(host, n = 90) {
    const box = document.createElement('div');
    box.className = 'confetti';
    const cols = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#ff8c42', '#c77dff'];
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = cols[(Math.random() * cols.length) | 0];
      p.style.animationDelay = (Math.random() * 0.6) + 's';
      p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(p);
    }
    (host || document.body).appendChild(box);
    setTimeout(() => box.remove(), 3600);
  },
};

// Narrar varias frases seguidas, sin que se pisen unas a otras
fx.sayMany = function (textos, alTerminar) {
  if (!this.voiceOn || !('speechSynthesis' in window)) { if (alTerminar) alTerminar(); return; }
  speechSynthesis.cancel();
  const limpias = textos.map((t) => String(t).replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  if (!limpias.length) { if (alTerminar) alTerminar(); return; }
  limpias.forEach((texto, i) => {
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = this._lang;
    u.rate = 1;
    u.pitch = 1.1;
    if (this._voice) u.voice = this._voice;
    if (i === limpias.length - 1 && alTerminar) u.onend = alTerminar;
    speechSynthesis.speak(u);
  });
};
