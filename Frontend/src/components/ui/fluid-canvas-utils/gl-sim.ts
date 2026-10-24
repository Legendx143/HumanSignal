export const SIM_PRECISION = "precision highp float;\nprecision highp sampler2D;\n";

export interface SimFormat {
  internalFormat: number;
  format: number;
  type: number;
}

export interface SimContext {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  isWebGL2: boolean;
  linear: boolean;
  rgba: SimFormat;
  rg: SimFormat;
  r: SimFormat;
}

export interface SimTarget {
  width: number;
  height: number;
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  attach: (unit: number) => number;
}

export interface SimPair {
  width: number;
  height: number;
  read: SimTarget;
  write: SimTarget;
  swap: () => void;
}

export interface SimProgram {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  use: () => void;
}

export interface SimLoop {
  start: () => void;
  stop: () => void;
  dispose: () => void;
}

/**
 * Creates and initializes the WebGL context with floating-point texture support.
 */
export function createSimContext(canvas: HTMLCanvasElement): SimContext | null {
  const gl2 = canvas.getContext("webgl2", {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  }) as WebGL2RenderingContext | null;

  if (gl2) {
    const extColorBufferFloat = gl2.getExtension("EXT_color_buffer_float");
    const extFloatLinear = gl2.getExtension("OES_texture_float_linear");
    const linear = !!extFloatLinear;

    if (extColorBufferFloat) {
      return {
        gl: gl2,
        isWebGL2: true,
        linear,
        rgba: {
          internalFormat: gl2.RGBA16F,
          format: gl2.RGBA,
          type: gl2.HALF_FLOAT,
        },
        rg: {
          internalFormat: gl2.RG16F,
          format: gl2.RG,
          type: gl2.HALF_FLOAT,
        },
        r: {
          internalFormat: gl2.R16F,
          format: gl2.RED,
          type: gl2.HALF_FLOAT,
        },
      };
    }
  }

  // Fallback to WebGL 1
  const gl1 = (canvas.getContext("webgl", {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  }) ||
    canvas.getContext("experimental-webgl", {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    })) as WebGLRenderingContext | null;

  if (!gl1) return null;

  const halfFloat = gl1.getExtension("OES_texture_half_float");
  const halfFloatLinear = gl1.getExtension("OES_texture_half_float_linear");
  const floatTex = gl1.getExtension("OES_texture_float");
  const floatLinear = gl1.getExtension("OES_texture_float_linear");

  const type = halfFloat ? halfFloat.HALF_FLOAT_OES : floatTex ? gl1.FLOAT : null;
  if (!type) return null;

  const linear = !!(halfFloat ? halfFloatLinear : floatLinear);

  const rgbaFormat: SimFormat = {
    internalFormat: gl1.RGBA,
    format: gl1.RGBA,
    type,
  };

  return {
    gl: gl1,
    isWebGL2: false,
    linear,
    rgba: rgbaFormat,
    rg: rgbaFormat,
    r: rgbaFormat,
  };
}

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 uTexel;

void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(uTexel.x, 0.0);
  vR = vUv + vec2(uTexel.x, 0.0);
  vT = vUv + vec2(0.0, uTexel.y);
  vB = vUv - vec2(0.0, uTexel.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/**
 * Compiles a GLSL shader.
 */
function compileShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

/**
 * Creates a program with vertex and fragment shaders and reflects uniform locations.
 */
export function createSimProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  fragmentSource: string,
): SimProgram {
  const vert = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create GL program");

  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  gl.deleteShader(vert);
  gl.deleteShader(frag);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${info}`);
  }

  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < uniformCount; i++) {
    const info = gl.getActiveUniform(program, i);
    if (info) {
      // Strip array bracket like uP0[0]
      const name = info.name.replace(/\[0\]$/, "");
      uniforms[name] = gl.getUniformLocation(program, name);
    }
  }

  return {
    program,
    uniforms,
    use: () => gl.useProgram(program),
  };
}

/**
 * Sets up a full-screen quad vertex buffer.
 */
export function createQuad(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): () => void {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  return () => {
    gl.deleteBuffer(buffer);
  };
}

/**
 * Renders the full-screen quad to either a SimTarget or canvas default framebuffer (if target === null).
 */
export function blit(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  target: SimTarget | null,
): void {
  if (target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, target.width, target.height);
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

/**
 * Creates an FBO and Texture target.
 */
export function createTarget(
  sim: SimContext,
  width: number,
  height: number,
  format: SimFormat = sim.rgba,
  filter: number = sim.gl.NEAREST,
): SimTarget {
  const { gl } = sim;
  const texture = gl.createTexture();
  if (!texture) throw new Error("Failed to create texture");

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    format.internalFormat,
    width,
    height,
    0,
    format.format,
    format.type,
    null,
  );

  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error("Failed to create framebuffer");
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );

  return {
    width,
    height,
    texture,
    fbo,
    attach: (unit: number) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return unit;
    },
  };
}

/**
 * Creates a ping-pong pair for fluid simulation steps.
 */
export function createPair(
  sim: SimContext,
  width: number,
  height: number,
  format: SimFormat = sim.rgba,
  filter: number = sim.gl.NEAREST,
): SimPair {
  let read = createTarget(sim, width, height, format, filter);
  let write = createTarget(sim, width, height, format, filter);

  return {
    width,
    height,
    get read() {
      return read;
    },
    get write() {
      return write;
    },
    swap: () => {
      const temp = read;
      read = write;
      write = temp;
    },
  };
}

export function deleteTarget(
  sim: SimContext,
  target: SimTarget | null,
): void {
  if (!target) return;
  const { gl } = sim;
  gl.deleteTexture(target.texture);
  gl.deleteFramebuffer(target.fbo);
}

export function deletePair(
  sim: SimContext,
  pair: SimPair | null,
): void {
  if (!pair) return;
  deleteTarget(sim, pair.read);
  deleteTarget(sim, pair.write);
}

/**
 * Creates an animation frame loop.
 */
export function createSimLoop(
  canvas: HTMLCanvasElement,
  frameCallback: (dt: number) => void,
): SimLoop {
  let animId: number | null = null;
  let lastTime = 0;
  let running = false;

  const tick = (now: number) => {
    if (!running) return;
    const dt = lastTime === 0 ? 1 / 60 : Math.min((now - lastTime) / 1000, 0.033);
    lastTime = now;
    frameCallback(dt);
    animId = requestAnimationFrame(tick);
  };

  return {
    start: () => {
      if (running) return;
      running = true;
      lastTime = 0;
      animId = requestAnimationFrame(tick);
    },
    stop: () => {
      running = false;
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    },
    dispose: () => {
      running = false;
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    },
  };
}

/**
 * Parses CSS color (hex, rgb, rgba, hsl, hsla, or var(--...)) into [r, g, b] in [0, 1].
 */
export function cssColourRgb(
  colorStr: string,
  element?: HTMLElement | null,
): [number, number, number] {
  if (typeof window === "undefined") return [0.5, 0.5, 0.5];

  let resolved = colorStr.trim();
  if (resolved.startsWith("var(") && element) {
    const varName = resolved.slice(4, -1).trim();
    resolved = getComputedStyle(element).getPropertyValue(varName).trim();
  }

  // If resolved is HSL like "215 20% 65%" or "hsl(215, 20%, 65%)"
  if (resolved.includes("%") || resolved.startsWith("hsl")) {
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) {
      ctx.fillStyle = resolved.startsWith("hsl") ? resolved : `hsl(${resolved})`;
      const computed = ctx.fillStyle; // returns "#rrggbb" or "rgba(...)"
      if (computed.startsWith("#")) {
        const hex = computed.slice(1);
        const num = parseInt(hex, 16);
        return [
          ((num >> 16) & 255) / 255,
          ((num >> 8) & 255) / 255,
          (num & 255) / 255,
        ];
      }
    }
  }

  if (resolved.startsWith("#")) {
    let hex = resolved.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const num = parseInt(hex, 16);
    return [
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255,
    ];
  }

  const rgbMatch = resolved.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]!, 10) / 255,
      parseInt(rgbMatch[2]!, 10) / 255,
      parseInt(rgbMatch[3]!, 10) / 255,
    ];
  }

  // Default fallback (e.g. for cyan accent)
  return [0.03, 0.71, 0.83];
}

/**
 * Computes relative luminance from RGB components.
 */
export function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
