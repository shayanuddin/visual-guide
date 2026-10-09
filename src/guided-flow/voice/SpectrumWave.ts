import { gsap } from "gsap";

// Glowing spectrum waveform: dense vertical bars that rise in drifting bursts,
// with fine sine strands weaving through them, coloured by a horizontal sweep
// and lit with a soft additive glow. Drawn on a canvas every frame from a
// 0…1 input level. Silence collapses to a row of short ticks and a flat line.

export interface SpectrumWaveOptions {
  width: number;
  height: number;
  /** Colour stops left → right. */
  colors: string[];
}

const BAR_W = 2;
const BAR_GAP = 2;
const BAR_MIN = 2;
const STRANDS = 7;
const BURSTS = 4;

export class SpectrumWave {
  private ctx: CanvasRenderingContext2D;
  private mask: HTMLCanvasElement;
  private mctx: CanvasRenderingContext2D;
  private dpr = Math.min(2, window.devicePixelRatio || 1);
  private level = 0;
  private target = 0;
  private t = 0;
  private noise: number[];
  private running = false;

  constructor(private canvas: HTMLCanvasElement, private opt: SpectrumWaveOptions) {
    const { width, height } = opt;
    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    this.ctx = canvas.getContext("2d")!;
    this.mask = document.createElement("canvas");
    this.mask.width = canvas.width;
    this.mask.height = canvas.height;
    this.mctx = this.mask.getContext("2d")!;
    this.noise = Array.from({ length: Math.ceil(width / (BAR_W + BAR_GAP)) }, () => 1);
  }

  /** Input level 0…1 (smoothed internally). */
  setLevel(v: number) {
    this.target = Math.max(0, Math.min(1, v));
  }

  start() {
    if (this.running) return;
    this.running = true;
    gsap.ticker.add(this.frame);
  }

  stop() {
    this.running = false;
    gsap.ticker.remove(this.frame);
  }

  private frame = (_time: number, deltaMs: number) => {
    const dt = Math.min(0.05, deltaMs / 1000);
    this.t += dt;
    // Rise fast, fall slower — reads as speech rather than flicker
    const k = this.target > this.level ? 0.35 : 0.12;
    this.level += (this.target - this.level) * k;
    if (Math.random() < 0.25) {
      for (let i = 0; i < this.noise.length; i++) this.noise[i] = 0.7 + Math.random() * 0.3;
    }
    this.draw();
  };

  /** Burst envelope at x (0…1): a few soft lumps that drift and breathe. */
  private envelope(x: number) {
    let e = 0;
    for (let b = 0; b < BURSTS; b++) {
      const c = (b + 0.5) / BURSTS + 0.06 * Math.sin(this.t * 0.9 + b * 2.1);
      const a = 0.7 + 0.3 * Math.sin(this.t * 2.4 + b * 1.7);
      const d = (x - c) / 0.062; // narrow lumps leave quiet gaps between bursts
      e = Math.max(e, a * Math.exp(-0.5 * d * d));
    }
    return e;
  }

  private draw() {
    const { width: W, height: H, colors } = this.opt;
    const m = this.mctx, ctx = this.ctx, s = this.dpr;
    const mid = H / 2;

    // 1. Shapes in white on the mask
    m.setTransform(s, 0, 0, s, 0, 0);
    m.globalCompositeOperation = "source-over";
    m.clearRect(0, 0, W, H);

    // Bars: brightest at the centre line, fading towards the tips
    const fade = m.createLinearGradient(0, 0, 0, H);
    fade.addColorStop(0, "rgba(255,255,255,0.15)");
    fade.addColorStop(0.5, "rgba(255,255,255,1)");
    fade.addColorStop(1, "rgba(255,255,255,0.15)");
    m.fillStyle = fade;
    const step = BAR_W + BAR_GAP;
    for (let i = 0, x = 1; x < W; i++, x += step) {
      const env = this.envelope(x / W);
      const h = BAR_MIN + (H - BAR_MIN) * Math.min(1, this.level * 1.15) * Math.pow(env, 0.85) * this.noise[i];
      m.fillRect(x, mid - h / 2, BAR_W, h);
    }

    // Strands: fine sine lines that bulge where the bars are tall
    m.lineWidth = 0.7;
    m.strokeStyle = "rgba(255,255,255,0.55)";
    for (let j = 0; j < STRANDS; j++) {
      m.beginPath();
      for (let x = 0; x <= W; x += 1.5) {
        const u = x / W;
        const amp = H * 0.34 * Math.min(1, this.level * 1.15) * (0.35 + this.envelope(u));
        const y = mid + amp * Math.sin(u * Math.PI * 4.2 + this.t * 3.1 + j * 0.38);
        if (x === 0) m.moveTo(x, y); else m.lineTo(x, y);
      }
      m.stroke();
    }

    // 2. Colour the shapes with the horizontal sweep
    m.globalCompositeOperation = "source-in";
    const sweep = m.createLinearGradient(0, 0, W, 0);
    colors.forEach((c, i) => sweep.addColorStop(colors.length === 1 ? 0 : i / (colors.length - 1), c));
    m.fillStyle = sweep;
    m.fillRect(0, 0, W, H);

    // 3. Glow pass, then the crisp pass, added onto the pill
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = `blur(${4 * s}px)`;
    ctx.globalAlpha = 1;
    ctx.drawImage(this.mask, 0, 0);
    ctx.drawImage(this.mask, 0, 0);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.drawImage(this.mask, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }
}
