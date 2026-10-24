"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { useThemeVersion } from "@/components/ui/fluid-canvas-utils/image-data";
import { usePrefersReducedMotion } from "@/components/ui/fluid-canvas-utils/motion";
import {
  SIM_PRECISION,
  blit,
  createPair,
  createQuad,
  createSimContext,
  createSimLoop,
  createSimProgram,
  createTarget,
  cssColourRgb,
  deletePair,
  deleteTarget,
  luminance,
  type SimPair,
  type SimTarget,
} from "@/components/ui/fluid-canvas-utils/gl-sim";

export type FluidCanvasQuality = "low" | "medium" | "high";
export type FluidCanvasStatus = "starting" | "running" | "unsupported";

export interface FluidCanvasHandle {
  /** Stir the fluid: one splat at a point (0–1, y down), or a burst of a few at random when no point is given. */
  splat: (x?: number, y?: number) => void;
}

export interface FluidCanvasProps {
  /** Dye colours: up to four CSS colours or tokens, or `'accent'` for a set derived from the theme accent. */
  colors?: "accent" | string[];
  /** How fast the dye fades, per second. 0 keeps it forever; 3 clears a splat in about a second. */
  dissipation?: number;
  /** Vorticity confinement: how hard small swirls are kept alive. 0 is laminar; 40 is turbulent. */
  curl?: number;
  /** Splat size, as a fraction of the shorter side. */
  splatRadius?: number;
  /** Simulation and dye resolution. Low for backgrounds on weak devices, high for a showpiece. */
  quality?: FluidCanvasQuality;
  /** Bloom strength, 0–1. Brightest in dark mode, a soft halo in light mode. Off at low quality. */
  glow?: number;
  /** After a few seconds untouched, keep the fluid moving with gentle random splats. */
  idle?: boolean;
  /** Freeze the simulation on its current frame. */
  paused?: boolean;
  /** Let touch drags stir the fluid instead of scrolling the page. Leave off for a hero the reader scrolls past. */
  captureTouch?: boolean;
  /** Describe the image for assistive tech. Without it the canvas is decorative and hidden. */
  label?: string;
  /** Called when the simulation starts, or when it falls back. */
  onStatusChange?: (status: FluidCanvasStatus) => void;
  /** Content drawn on top of the fluid. */
  children?: ReactNode;
  /** Merged last, so it wins. Give the component a size here. */
  className?: string;
}

const QUALITY = {
  low: { sim: 64, dye: 384, iterations: 20, bloom: false },
  medium: { sim: 128, dye: 768, iterations: 28, bloom: true },
  high: { sim: 192, dye: 1152, iterations: 40, bloom: true },
} as const;

const HEAD = `${SIM_PRECISION}
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
`;

const SPLAT = `${HEAD}
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec4 uColor;
uniform vec2 uPoint;
uniform float uRadius;
void main () {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  gl_FragColor = texture2D(uTarget, vUv) + uColor * exp(-dot(p, p) / uRadius);
}`;

const ADVECT = `${HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform vec2 uSourceTexel;
uniform float uDt;
uniform float uDissipation;
vec4 bilerp (sampler2D s, vec2 uv, vec2 size) {
  vec2 st = uv / size - 0.5;
  vec2 i = floor(st);
  vec2 f = fract(st);
  vec4 a = texture2D(s, (i + vec2(0.5, 0.5)) * size);
  vec4 b = texture2D(s, (i + vec2(1.5, 0.5)) * size);
  vec4 c = texture2D(s, (i + vec2(0.5, 1.5)) * size);
  vec4 d = texture2D(s, (i + vec2(1.5, 1.5)) * size);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
void main () {
#ifdef MANUAL_FILTERING
  vec2 coord = vUv - uDt * bilerp(uVelocity, vUv, uTexel).xy * uTexel;
  vec4 result = bilerp(uSource, coord, uSourceTexel);
#else
  vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexel;
  vec4 result = texture2D(uSource, coord);
#endif
  gl_FragColor = result / (1.0 + uDissipation * uDt);
}`;

const CURL = `${HEAD}
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const VORTICITY = `${HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uCurlStrength;
uniform float uDt;
void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * C;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy + force * uDt;
  gl_FragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
}`;

const DIVERGENCE = `${HEAD}
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const SCALE = `${HEAD}
uniform sampler2D uTexture;
uniform float uValue;
void main () { gl_FragColor = uValue * texture2D(uTexture, vUv); }`;

const PRESSURE = `${HEAD}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `${HEAD}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

// The dye stores how much of each of the four palette colours is present, not a colour. Mixing to RGB happens here,
// at display time, so a theme or accent change recolours dye that is already on screen.
const PALETTE = `
uniform vec3 uP0;
uniform vec3 uP1;
uniform vec3 uP2;
uniform vec3 uP3;
vec3 paint (vec4 c) { return uP0 * c.r + uP1 * c.g + uP2 * c.b + uP3 * c.a; }
`;

const PREFILTER = `${HEAD}${PALETTE}
uniform sampler2D uDye;
void main () {
  vec3 light = paint(max(texture2D(uDye, vUv), 0.0));
  float bright = max(light.r, max(light.g, light.b));
  gl_FragColor = vec4(light * smoothstep(0.35, 1.1, bright), 1.0);
}`;

// Nine taps folded into five by sampling between texels, which relies on linear filtering.
const BLUR = `${HEAD}
uniform sampler2D uTexture;
uniform vec2 uDirection;
void main () {
  vec4 sum = texture2D(uTexture, vUv) * 0.2270270;
  sum += texture2D(uTexture, vUv + uDirection * 1.3846154) * 0.3162162;
  sum += texture2D(uTexture, vUv - uDirection * 1.3846154) * 0.3162162;
  sum += texture2D(uTexture, vUv + uDirection * 3.2307692) * 0.0702703;
  sum += texture2D(uTexture, vUv - uDirection * 3.2307692) * 0.0702703;
  gl_FragColor = sum;
}`;

const DISPLAY = `${HEAD}${PALETTE}
uniform sampler2D uDye;
uniform sampler2D uBloom;
uniform vec3 uSurface;
uniform float uDark;
uniform float uGlow;
void main () {
  vec4 c = max(texture2D(uDye, vUv), 0.0);
  vec3 light = paint(c);
  vec3 bloom = texture2D(uBloom, vUv).rgb * uGlow;
  vec3 colour;
  if (uDark > 0.5) {
    // On a dark surface dye is light: add it, and roll off softly instead of clipping to white.
    colour = uSurface + (1.0 - uSurface) * (1.0 - exp(-(light + bloom) * 1.15));
  } else {
    // On a light surface dye is pigment: its hue covers the surface in proportion to how much is there.
    float amount = c.r + c.g + c.b + c.a;
    colour = mix(uSurface, light / max(amount, 0.0001), 1.0 - exp(-amount * 1.4));
    float halo = max(bloom.r, max(bloom.g, bloom.b));
    colour = mix(colour, bloom / max(halo, 0.0001), (1.0 - exp(-halo * 1.2)) * 0.28);
  }
  // A least-significant-bit of noise, so slow gradients do not band.
  float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  gl_FragColor = vec4(colour + (noise - 0.5) / 255.0, 1.0);
}`;

const COPY = `${HEAD}
uniform sampler2D uTexture;
void main () { gl_FragColor = texture2D(uTexture, vUv); }`;

type Rgb = [number, number, number];

function toHsl([r, g, b]: Rgb): Rgb {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r
      ? (g - b) / d + (g < b ? 6 : 0)
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  return [h * 60, s, l];
}

function fromHsl([h, s, l]: Rgb): Rgb {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}

/**
 * Four dye colours from one accent: the accent, its two neighbours on the wheel and, used sparingly, its complement.
 * Lightness is pulled towards what reads on the surface — bright on dark, deep on light.
 */
function accentPalette(accent: Rgb, dark: boolean): Rgb[] {
  const [h, s, l] = toHsl(accent);
  const saturation = Math.max(0.6, s);
  const lightness = dark
    ? Math.min(0.7, Math.max(0.55, l))
    : Math.min(0.52, Math.max(0.4, l));
  return [0, 36, -36, 180].map((shift) =>
    fromHsl([(h + shift + 360) % 360, saturation, lightness]),
  );
}

/** Pick a palette slot for a splat: mostly the accent and its neighbours, now and then the complement. */
function slot(amount: number): [number, number, number, number] {
  const roll = Math.random();
  const index = roll < 0.4 ? 0 : roll < 0.65 ? 1 : roll < 0.88 ? 2 : 3;
  const out: [number, number, number, number] = [0, 0, 0, 0];
  out[index] = amount;
  out[(index + 1) % 3] += amount * 0.12;
  return out;
}

/**
 * Real-time stable fluids behind your content — Jos Stam’s method as GPU Gems chapter 38 lays it out.
 *
 * Every frame the velocity field is given vorticity confinement, made divergence-free by a Jacobi pressure solve
 * and advected through itself, and the dye is advected through the velocity, all in half-float textures that
 * ping-pong on the GPU. The pointer and every touch point push velocity and dye; left alone it keeps drifting with
 * gentle splats so a hero never goes still. The dye stores palette weights rather than colours, so switching the
 * theme or accent recolours what is already on screen instead of waiting for it to fade.
 *
 * It behaves like a background: it stops off screen and in a hidden tab, and interaction is heard on the wrapper,
 * so text laid on top still stirs what is under it. Under reduced motion it pre-simulates a few splats into a still
 * frame and only moves when clicked, by computing the result and showing it. Without float-texture WebGL, an accent
 * gradient stands in with a short note.
 */
export const FluidCanvas = forwardRef<FluidCanvasHandle, FluidCanvasProps>(
  function FluidCanvas(
    {
      colors = "accent",
      dissipation = 0.4,
      curl = 24,
      splatRadius = 0.22,
      quality = "medium",
      glow = 0.5,
      idle = true,
      paused = false,
      captureTouch = false,
      label,
      onStatusChange,
      children,
      className,
    },
    ref,
  ) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reducedMotion = usePrefersReducedMotion();
    const themeVersion = useThemeVersion();
    const [status, setStatus] = useState<FluidCanvasStatus>("starting");
    const settings = useRef({
      dissipation,
      curl,
      splatRadius,
      glow,
      idle,
      paused,
      reducedMotion,
    });
    settings.current = {
      dissipation,
      curl,
      splatRadius,
      glow,
      idle,
      paused,
      reducedMotion,
    };
    const engine = useRef<{
      splat: FluidCanvasHandle["splat"];
      recolour: () => void;
      resume: () => void;
    } | null>(null);
    const colourKey = JSON.stringify(colors);
    const statusCallback = useRef(onStatusChange);
    statusCallback.current = onStatusChange;

    useEffect(() => statusCallback.current?.(status), [status]);

    useImperativeHandle(
      ref,
      () => ({ splat: (x, y) => engine.current?.splat(x, y) }),
      [],
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !wrapper) return;
      const sim = createSimContext(canvas);
      if (!sim) {
        setStatus("unsupported");
        return;
      }
      const { gl } = sim;
      const config = QUALITY[quality];
      const linear = sim.linear ? gl.LINEAR : gl.NEAREST;
      let programs: ReturnType<typeof makePrograms>;
      function makePrograms() {
        const manual = sim!.linear ? "" : "#define MANUAL_FILTERING\n";
        return {
          splat: createSimProgram(gl, SPLAT),
          advect: createSimProgram(gl, manual + ADVECT),
          curl: createSimProgram(gl, CURL),
          vorticity: createSimProgram(gl, VORTICITY),
          divergence: createSimProgram(gl, DIVERGENCE),
          scale: createSimProgram(gl, SCALE),
          pressure: createSimProgram(gl, PRESSURE),
          gradient: createSimProgram(gl, GRADIENT),
          prefilter: createSimProgram(gl, PREFILTER),
          blur: createSimProgram(gl, BLUR),
          display: createSimProgram(gl, DISPLAY),
          copy: createSimProgram(gl, COPY),
        };
      }
      try {
        programs = makePrograms();
      } catch {
        setStatus("unsupported");
        return;
      }
      const disposeQuad = createQuad(gl);

      let velocity: SimPair | null = null;
      let dye: SimPair | null = null;
      let pressure: SimPair | null = null;
      let divergence: SimTarget | null = null;
      let curlTarget: SimTarget | null = null;
      let bloom: SimPair | null = null;
      let aspect = 1;

      const size = (base: number) => {
        const long = Math.round(base * Math.max(aspect, 1 / aspect));
        return aspect >= 1 ? [long, base] : [base, long];
      };

      // Resize a pair by drawing the old field into the new one, so a resize keeps the fluid instead of clearing it.
      const resample = (
        old: SimPair | null,
        width: number,
        height: number,
        format = sim.rgba,
        filter = linear,
      ) => {
        if (old && old.width === width && old.height === height) return old;
        const next = createPair(sim, width, height, format, filter);
        if (old) {
          programs.copy.use();
          gl.uniform1i(programs.copy.uniforms.uTexture!, old.read.attach(0));
          blit(gl, next.read);
          deletePair(sim, old);
        }
        return next;
      };

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const ratio = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.max(1, Math.round(rect.width * ratio));
        canvas.height = Math.max(1, Math.round(rect.height * ratio));
        aspect = canvas.width / canvas.height;
        const [sw, sh] = size(config.sim);
        const shortSide = Math.min(canvas.width, canvas.height);
        const [dw, dh] = size(Math.min(config.dye, shortSide));
        velocity = resample(velocity, sw!, sh!, sim.rg);
        dye = resample(dye, dw!, dh!);
        pressure = resample(pressure, sw!, sh!, sim.r, gl.NEAREST);
        if (divergence) deleteTarget(sim, divergence);
        if (curlTarget) deleteTarget(sim, curlTarget);
        divergence = createTarget(sim, sw!, sh!, sim.r, gl.NEAREST);
        curlTarget = createTarget(sim, sw!, sh!, sim.r, gl.NEAREST);
        if (bloom) deletePair(sim, bloom);
        bloom = createPair(
          sim,
          Math.max(1, Math.round(canvas.width / 4)),
          Math.max(1, Math.round(canvas.height / 4)),
          sim.rgba,
          linear,
        );
      };

      const palette = {
        colours: [] as Rgb[],
        surface: [1, 1, 1] as Rgb,
        dark: false,
      };
      const recolour = () => {
        const surface = cssColourRgb("var(--color-surface)", wrapper);
        const dark = luminance(surface) < 0.45;
        const list = JSON.parse(colourKey) as "accent" | string[];
        const colours =
          list === "accent" || !list.length
            ? accentPalette(cssColourRgb("var(--color-accent)", wrapper), dark)
            : list.slice(0, 4).map((value) => cssColourRgb(value, wrapper));
        while (colours.length < 4)
          colours.push(colours[colours.length % Math.max(1, colours.length)]!);
        Object.assign(palette, { colours, surface, dark });
      };

      const splat = (
        x: number,
        y: number,
        dx: number,
        dy: number,
        colour: number[],
      ) => {
        if (!velocity || !dye) return;
        const p = programs.splat;
        p.use();
        const radius =
          (settings.current.splatRadius / 100) * (aspect > 1 ? aspect : 1);
        gl.uniform1f(p.uniforms.uAspect!, aspect);
        gl.uniform2f(p.uniforms.uPoint!, x, y);
        gl.uniform1f(p.uniforms.uRadius!, radius);
        gl.uniform2f(
          p.uniforms.uTexel!,
          1 / velocity.width,
          1 / velocity.height,
        );
        gl.uniform1i(p.uniforms.uTarget!, velocity.read.attach(0));
        gl.uniform4f(p.uniforms.uColor!, dx, dy, 0, 0);
        blit(gl, velocity.write);
        velocity.swap();
        gl.uniform1i(p.uniforms.uTarget!, dye.read.attach(0));
        gl.uniform4fv(p.uniforms.uColor!, colour);
        blit(gl, dye.write);
        dye.swap();
      };

      const randomSplats = (count: number, force = 1000, amount = 6) => {
        for (let index = 0; index < count; index++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = force * (0.5 + Math.random() * 0.5);
          splat(
            0.15 + Math.random() * 0.7,
            0.15 + Math.random() * 0.7,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            slot(amount),
          );
        }
      };

      const step = (dt: number) => {
        if (!velocity || !dye || !pressure || !divergence || !curlTarget)
          return;
        const { uniforms: u } = programs.curl;
        const texel = [1 / velocity.width, 1 / velocity.height] as const;
        const use = (program: typeof programs.curl) => {
          program.use();
          gl.uniform2f(program.uniforms.uTexel!, texel[0], texel[1]);
          return program.uniforms;
        };
        use(programs.curl);
        gl.uniform1i(u.uVelocity!, velocity.read.attach(0));
        blit(gl, curlTarget);

        let v = use(programs.vorticity);
        gl.uniform1i(v.uVelocity!, velocity.read.attach(0));
        gl.uniform1i(v.uCurl!, curlTarget.attach(1));
        gl.uniform1f(v.uCurlStrength!, settings.current.curl);
        gl.uniform1f(v.uDt!, dt);
        blit(gl, velocity.write);
        velocity.swap();

        v = use(programs.divergence);
        gl.uniform1i(v.uVelocity!, velocity.read.attach(0));
        blit(gl, divergence);

        v = use(programs.scale);
        gl.uniform1i(v.uTexture!, pressure.read.attach(0));
        gl.uniform1f(v.uValue!, 0.8);
        blit(gl, pressure.write);
        pressure.swap();

        v = use(programs.pressure);
        gl.uniform1i(v.uDivergence!, divergence.attach(0));
        for (let index = 0; index < config.iterations; index++) {
          gl.uniform1i(v.uPressure!, pressure.read.attach(1));
          blit(gl, pressure.write);
          pressure.swap();
        }

        v = use(programs.gradient);
        gl.uniform1i(v.uPressure!, pressure.read.attach(0));
        gl.uniform1i(v.uVelocity!, velocity.read.attach(1));
        blit(gl, velocity.write);
        velocity.swap();

        v = use(programs.advect);
        gl.uniform2f(v.uSourceTexel!, texel[0], texel[1]);
        gl.uniform1i(v.uVelocity!, velocity.read.attach(0));
        gl.uniform1i(v.uSource!, 0);
        gl.uniform1f(v.uDt!, dt);
        gl.uniform1f(v.uDissipation!, 0.2);
        blit(gl, velocity.write);
        velocity.swap();

        gl.uniform2f(v.uSourceTexel!, 1 / dye.width, 1 / dye.height);
        gl.uniform1i(v.uVelocity!, velocity.read.attach(0));
        gl.uniform1i(v.uSource!, dye.read.attach(1));
        gl.uniform1f(v.uDissipation!, settings.current.dissipation);
        blit(gl, dye.write);
        dye.swap();
      };

      const setPalette = (program: typeof programs.display) => {
        palette.colours.forEach((colour, index) =>
          gl.uniform3fv(program.uniforms[`uP${index}`]!, colour),
        );
      };

      const render = () => {
        if (!dye || !bloom) return;
        const glowOn = config.bloom && settings.current.glow > 0;
        if (glowOn) {
          let p = programs.prefilter;
          p.use();
          setPalette(p);
          gl.uniform1i(p.uniforms.uDye!, dye.read.attach(0));
          blit(gl, bloom.read);
          p = programs.blur;
          p.use();
          for (let pass = 0; pass < 2; pass++) {
            for (const [x, y] of [
              [1, 0],
              [0, 1],
            ] as const) {
              gl.uniform2f(
                p.uniforms.uDirection!,
                (x * (pass + 1)) / bloom.width,
                (y * (pass + 1)) / bloom.height,
              );
              gl.uniform1i(p.uniforms.uTexture!, bloom.read.attach(0));
              blit(gl, bloom.write);
              bloom.swap();
            }
          }
        }
        const p = programs.display;
        p.use();
        setPalette(p);
        gl.uniform3fv(p.uniforms.uSurface!, palette.surface);
        gl.uniform1f(p.uniforms.uDark!, palette.dark ? 1 : 0);
        gl.uniform1f(
          p.uniforms.uGlow!,
          glowOn ? settings.current.glow * (palette.dark ? 1.4 : 0.8) : 0,
        );
        gl.uniform1i(p.uniforms.uDye!, dye.read.attach(0));
        gl.uniform1i(p.uniforms.uBloom!, bloom.read.attach(1));
        blit(gl, null);
      };

      // Run the simulation forward without showing the frames in between — the reduced-motion answer to a splat.
      const settle = (steps: number) => {
        for (let index = 0; index < steps; index++) step(1 / 60);
        render();
      };

      interface Touch {
        x: number;
        y: number;
        dx: number;
        dy: number;
        moved: boolean;
        colour: number[];
      }
      const pointers = new Map<number, Touch>();
      let lastInput = 0;
      let idleClock = 0;
      let nextIdle = 0.6;

      const frame = (dt: number) => {
        if (settings.current.paused) return;
        for (const touch of pointers.values()) {
          if (!touch.moved) continue;
          touch.moved = false;
          splat(
            touch.x,
            touch.y,
            touch.dx * 6000,
            touch.dy * 6000,
            touch.colour,
          );
          touch.dx = touch.dy = 0;
        }
        if (settings.current.idle && performance.now() - lastInput > 2500) {
          idleClock += dt;
          if (idleClock > nextIdle) {
            idleClock = 0;
            nextIdle = 0.7 + Math.random() * 1.1;
            randomSplats(1, 650, 4);
          }
        }
        step(dt);
        render();
      };

      const loop = createSimLoop(canvas, frame);
      const resume = () => {
        if (settings.current.reducedMotion || settings.current.paused)
          loop.stop();
        else loop.start();
      };

      resize();
      recolour();
      if (reducedMotion) {
        randomSplats(5, 900, 7);
        settle(90);
      } else {
        randomSplats(4);
        render();
      }
      setStatus("running");
      resume();

      const uv = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        return [
          (event.clientX - rect.left) / rect.width,
          1 - (event.clientY - rect.top) / rect.height,
        ] as const;
      };
      const track = (event: PointerEvent) => {
        const [x, y] = uv(event);
        let touch = pointers.get(event.pointerId);
        if (!touch) {
          touch = { x, y, dx: 0, dy: 0, moved: false, colour: slot(0.16) };
          pointers.set(event.pointerId, touch);
          return touch;
        }
        touch.dx += (x - touch.x) * (aspect < 1 ? aspect : 1);
        touch.dy += (y - touch.y) / (aspect > 1 ? aspect : 1);
        touch.x = x;
        touch.y = y;
        touch.moved = Math.abs(touch.dx) + Math.abs(touch.dy) > 0;
        return touch;
      };
      const onMove = (event: PointerEvent) => {
        if (settings.current.reducedMotion) return;
        // Mouse stirs on hover; touch and pen stir while in contact.
        if (event.pointerType !== "mouse" && event.buttons === 0) return;
        lastInput = performance.now();
        track(event);
      };
      const onDown = (event: PointerEvent) => {
        lastInput = performance.now();
        if (settings.current.reducedMotion) {
          const [x, y] = uv(event);
          const angle = Math.random() * Math.PI * 2;
          splat(x, y, Math.cos(angle) * 800, Math.sin(angle) * 800, slot(6));
          settle(50);
          return;
        }
        const touch = track(event);
        touch.colour = slot(0.16);
        // A tap without a drag still leaves a mark.
        splat(touch.x, touch.y, 0, 0, slot(1.5));
      };
      const onEnd = (event: PointerEvent) => pointers.delete(event.pointerId);
      wrapper.addEventListener("pointermove", onMove, { passive: true });
      wrapper.addEventListener("pointerdown", onDown, { passive: true });
      wrapper.addEventListener("pointerup", onEnd, { passive: true });
      wrapper.addEventListener("pointercancel", onEnd, { passive: true });
      wrapper.addEventListener("pointerleave", onEnd, { passive: true });

      const resizeObserver = new ResizeObserver(() => {
        resize();
        render();
      });
      resizeObserver.observe(canvas);

      const onLost = (event: Event) => {
        event.preventDefault();
        loop.stop();
        setStatus("unsupported");
      };
      canvas.addEventListener("webglcontextlost", onLost);

      engine.current = {
        splat: (x, y) => {
          lastInput = performance.now();
          if (x === undefined || y === undefined) randomSplats(3, 900, 6);
          else {
            const angle = Math.random() * Math.PI * 2;
            splat(
              x,
              1 - y,
              Math.cos(angle) * 800,
              Math.sin(angle) * 800,
              slot(6),
            );
          }
          if (settings.current.reducedMotion || settings.current.paused)
            settle(settings.current.paused ? 0 : 50);
        },
        recolour: () => {
          recolour();
          render();
        },
        resume,
      };

      return () => {
        engine.current = null;
        loop.dispose();
        resizeObserver.disconnect();
        wrapper.removeEventListener("pointermove", onMove);
        wrapper.removeEventListener("pointerdown", onDown);
        wrapper.removeEventListener("pointerup", onEnd);
        wrapper.removeEventListener("pointercancel", onEnd);
        wrapper.removeEventListener("pointerleave", onEnd);
        canvas.removeEventListener("webglcontextlost", onLost);
        for (const pair of [velocity, dye, pressure, bloom])
          if (pair) deletePair(sim, pair);
        for (const target of [divergence, curlTarget])
          if (target) deleteTarget(sim, target);
        for (const program of Object.values(programs))
          gl.deleteProgram(program.program);
        disposeQuad();
      };
    }, [quality, reducedMotion, colourKey]);

    useEffect(() => engine.current?.recolour(), [themeVersion]);
    useEffect(() => engine.current?.resume(), [paused, reducedMotion]);

    const drawing = status === "running";

    return (
      <div
        ref={wrapperRef}
        className={cn("relative isolate overflow-hidden", className)}
        style={{ touchAction: captureTouch ? "none" : "pan-y" }}
      >
        {/* The gradient is always underneath, so there is never a blank frame before the first draw. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(90%_80%_at_25%_100%,color-mix(in_oklab,var(--color-accent)_70%,transparent)_0%,transparent_60%),radial-gradient(70%_70%_at_90%_10%,color-mix(in_oklab,var(--color-accent)_35%,transparent)_0%,transparent_70%)] bg-surface"
        />
        <canvas
          ref={canvasRef}
          role={label ? "img" : undefined}
          aria-label={label}
          aria-hidden={label ? undefined : true}
          className={cn(
            "absolute inset-0 -z-10 block size-full",
            !drawing && "invisible",
          )}
        />
        {status === "unsupported" && (
          <p className="absolute bottom-2 right-3 z-10 text-[11px] font-medium text-ink-faint">
            Fluid needs WebGL with float textures; showing a still gradient.
          </p>
        )}
        {children}
      </div>
    );
  },
);

export default FluidCanvas;
