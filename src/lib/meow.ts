export type MeowKind = "meow" | "sneeze" | "thud" | "boop" | "nom";

let ctx: AudioContext | undefined;

function context(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function unlockAudio(): void {
  const c = context();
  if (c.state === "suspended") void c.resume();
}

function env(gain: GainNode, t: number, peak: number, dur: number): void {
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

export function playTone(kind: MeowKind, muted: boolean): void {
  if (muted) return;
  const c = context();
  if (c.state === "suspended") void c.resume();
  const t = c.currentTime;

  if (kind === "sneeze") {
    burst(c, 0.16, 0.05, 900);
    return;
  }

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);

  if (kind === "meow") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(310, t + 0.16);
    env(gain, t, 0.055, 0.2);
    osc.start(t);
    osc.stop(t + 0.22);
    return;
  }

  if (kind === "boop") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.08);
    env(gain, t, 0.04, 0.12);
    osc.start(t);
    osc.stop(t + 0.14);
    return;
  }

  if (kind === "nom") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.setValueAtTime(390, t + 0.09);
    env(gain, t, 0.05, 0.18);
    osc.start(t);
    osc.stop(t + 0.2);
    return;
  }

  osc.type = "sine";
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);
  env(gain, t, 0.07, 0.16);
  osc.start(t);
  osc.stop(t + 0.18);
  burst(c, 0.08, 0.03, 180);
}

function burst(c: AudioContext, dur: number, vol: number, freq: number): void {
  const n = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = freq;
  const gain = c.createGain();
  gain.gain.value = vol;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start();
}
