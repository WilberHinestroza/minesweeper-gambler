// Sonido sintetizado con Web Audio API. Sin assets externos.

import { loadSettings, saveSettings } from './storage';

let context = null;

export function isMuted() {
  return loadSettings().muted;
}

export function setMuted(value) {
  saveSettings({ muted: Boolean(value) });
}

export function toggleMuted() {
  const next = !isMuted();
  setMuted(next);
  return next;
}

// Debe llamarse dentro de un gesto del usuario para desbloquear el audio
// en navegadores móviles.
export function unlockAudio() {
  if (typeof window === 'undefined') return null;

  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;

  if (!context) context = new Ctor();
  if (context.state === 'suspended') context.resume();

  return context;
}

function tone(freq, start, duration, type, volume) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  const t0 = context.currentTime + start;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(gain);
  gain.connect(context.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.03);
}

export function playSound(name) {
  if (isMuted()) return;

  const ctx = unlockAudio();
  if (!ctx) return;

  switch (name) {
    case 'reveal':
      tone(520, 0, 0.08, 'triangle', 0.05);
      tone(780, 0.05, 0.09, 'triangle', 0.04);
      break;
    case 'mine':
      tone(150, 0, 0.28, 'sawtooth', 0.07);
      tone(90, 0.06, 0.34, 'sawtooth', 0.05);
      break;
    case 'dud':
      tone(320, 0, 0.1, 'square', 0.03);
      tone(240, 0.09, 0.12, 'square', 0.03);
      break;
    case 'cashout':
      [523, 659, 784, 1046].forEach((freq, index) => {
        tone(freq, index * 0.07, 0.13, 'triangle', 0.05);
      });
      break;
    case 'buy':
      tone(880, 0, 0.07, 'triangle', 0.04);
      tone(1174, 0.06, 0.1, 'triangle', 0.04);
      break;
    case 'item':
      tone(660, 0, 0.08, 'sine', 0.05);
      tone(990, 0.07, 0.12, 'sine', 0.04);
      break;
    case 'click':
      tone(300, 0, 0.04, 'square', 0.02);
      break;
    default:
      break;
  }
}
