/*!
 * Linga Global School — Luminous Mesh Gradient
 * Lightweight WebGL canvas background: soft, blended, moving colour blobs
 * (the same technique premium product sites use for animated mesh gradients).
 * No external dependencies. Degrades silently if WebGL is unavailable.
 */
(function () {
  "use strict";

  // Pre-given luminous palette: yellow, red, lime, orange, sun/amber + a hot coral for depth
  var PALETTE = [
    "#FF3D3D", // red
    "#FF7A18", // orange
    "#FFC700", // sun / amber
    "#FFEE58", // yellow
    "#C6FF00", // lime
    "#FF9F1C"  // secondary orange for richness
  ];

  var VERT = [
    "attribute vec2 aPosition;",
    "void main(){",
    "  gl_Position = vec4(aPosition, 0.0, 1.0);",
    "}"
  ].join("\n");

  var FRAG = [
    "precision mediump float;",
    "uniform vec2  uResolution;",
    "uniform float uTime;",
    "uniform vec3  uColors[6];",
    "",
    "vec2 blobPos(int i, float t){",
    "  float fi = float(i);",
    "  float speed  = 0.10 + fi * 0.025;",
    "  float radius = 0.32 + 0.10 * sin(fi * 1.7 + 1.0);",
    "  float angle  = t * speed + fi * 2.35;",
    "  vec2 center = vec2(0.5, 0.5) + vec2(cos(angle), sin(angle * 1.3 + fi)) * radius;",
    "  return center;",
    "}",
    "",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / uResolution.xy;",
    "  float aspect = uResolution.x / uResolution.y;",
    "  vec2 auv = vec2(uv.x * aspect, uv.y);",
    "",
    "  vec3 color = vec3(0.0);",
    "  float totalWeight = 0.0;",
    "  for (int i = 0; i < 6; i++) {",
    "    vec2 c = blobPos(i, uTime);",
    "    vec2 ac = vec2(c.x * aspect, c.y);",
    "    float d = distance(auv, ac);",
    "    float w = smoothstep(0.62, 0.0, d);",
    "    w = pow(w, 1.4);",
    "    color += uColors[i] * w;",
    "    totalWeight += w;",
    "  }",
    "",
    "  vec3 finalColor = totalWeight > 0.001 ? color / totalWeight : vec3(0.0);",
    "  float alpha = clamp(totalWeight, 0.0, 1.0) * 0.88;",
    "  gl_FragColor = vec4(finalColor, alpha);",
    "}"
  ].join("\n");

  function hexToRgb(hex) {
    var n = parseInt(hex.replace("#", ""), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function compileShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function LuminousGradient(canvas, colors) {
    this.canvas = canvas;
    this.colors = colors;
    this.raf = null;
    this.start = null;
    this.paused = false;

    var gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false }) ||
              canvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) { this.supported = false; return; }
    this.gl = gl;
    this.supported = this._init();
    if (!this.supported) return;

    this._resize();
    var self = this;
    window.addEventListener("resize", function () { self._resize(); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { self.pause(); } else { self.play(); }
    });

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.reduceMotion = reduceMotion;
    this._render(0);          // paint one frame immediately (covers reduced-motion too)
    if (!reduceMotion) { this.play(); }
  }

  LuminousGradient.prototype._init = function () {
    var gl = this.gl;
    var vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    var fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);
    this.program = program;

    var quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    var aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    this.uResolution = gl.getUniformLocation(program, "uResolution");
    this.uTime = gl.getUniformLocation(program, "uTime");
    this.uColors = gl.getUniformLocation(program, "uColors[0]");

    var flat = [];
    for (var i = 0; i < this.colors.length; i++) {
      var rgb = hexToRgb(this.colors[i]);
      flat.push(rgb[0], rgb[1], rgb[2]);
    }
    gl.uniform3fv(this.uColors, new Float32Array(flat));

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return true;
  };

  LuminousGradient.prototype._resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth, h = window.innerHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  };

  LuminousGradient.prototype._render = function (t) {
    var gl = this.gl;
    gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uTime, t * 0.001);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  LuminousGradient.prototype._loop = function (now) {
    if (this.paused) return;
    if (this.start === null) this.start = now;
    this._render(now - this.start);
    var self = this;
    this.raf = requestAnimationFrame(function (n) { self._loop(n); });
  };

  LuminousGradient.prototype.play = function () {
    if (this.reduceMotion || !this.supported || this.raf) return;
    this.paused = false;
    var self = this;
    this.raf = requestAnimationFrame(function (n) { self._loop(n); });
  };

  LuminousGradient.prototype.pause = function () {
    this.paused = true;
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
  };

  function boot() {
    var canvas = document.getElementById("bgGradient");
    if (!canvas || !window.WebGLRenderingContext) return;
    new LuminousGradient(canvas, PALETTE);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
