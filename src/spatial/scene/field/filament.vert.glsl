// Slipstream filament: one instanced screen-aligned ribbon per filament.
// All motion happens here from uniforms; nothing is uploaded per frame.

attribute vec2 corner;  // x: 0 tail -> 1 head, y: -1..1 across
attribute vec4 aSeed;   // x phase, y height, z depth, w density rank
attribute vec4 aProps;  // x crossing period (s), y length factor, z world width, w formation slot

uniform float uFlow;
uniform float uFormFlow;
uniform float uTime;
uniform float uDepth;
uniform float uTanHalfFov;
uniform float uAspect;
uniform vec2 uResolution;
uniform float uPixelRatio;
uniform float uVelocity;
uniform float uDensity;
uniform float uForm;
uniform float uFormKind;
uniform vec3 uFormCenter;
uniform vec4 uFormA;
uniform vec4 uFormB;
uniform vec4 uFormC;
uniform float uFormShare;
uniform vec2 uHighlight;
uniform float uFormAlpha;
uniform float uIntensity;

varying vec2 vUv;
varying float vAlpha;
varying float vDist;
varying float vAccent;
varying float vGreen;
varying float vHot;

const float PI = 3.14159265;
const float TAU = 6.2831853;

const float FORM_RING = 1.0;
const float FORM_GATES = 2.0;
const float FORM_LANES = 3.0;
const float FORM_RIBBON = 4.0;
const float FORM_TWO_PASS = 5.0;
const float FORM_KNOTS = 6.0;
const float FORM_MODULES = 7.0;
const float FORM_CONVERGE = 8.0;
const float FORM_CONFLUENCE = 9.0;
const float FORM_PLANES = 10.0;

float hash(float n) { return fract(sin(n * 91.3458) * 47453.5453); }
bool near(float a, float b) { return abs(a - b) < 0.5; }
bool bit(float mask, float index) { return mod(floor(mask / pow(2.0, index)), 2.0) > 0.5; }

// Walk a w x h rectangle perimeter (bottom edge at y = 0, centred on x).
// Returns position.xy and direction.zw.
vec4 perimeter(float s01, float w, float h) {
  float per = 2.0 * (w + h);
  float s = s01 * per;
  if (s < w) return vec4(-0.5 * w + s, 0.0, 1.0, 0.0);
  s -= w;
  if (s < h) return vec4(0.5 * w, s, 0.0, 1.0);
  s -= h;
  if (s < w) return vec4(0.5 * w - s, h, -1.0, 0.0);
  s -= w;
  return vec4(-0.5 * w, h - s, 0.0, -1.0);
}

// Gantry: left post, top beam, right post (no floor beam crossing the view).
vec4 gantry(float s01, float w, float h) {
  float s = s01 * (w + 2.0 * h);
  if (s < h) return vec4(-0.5 * w, s, 0.0, 1.0);
  s -= h;
  if (s < w) return vec4(-0.5 * w + s, h, 1.0, 0.0);
  s -= w;
  return vec4(0.5 * w, h - s, 0.0, -1.0);
}

vec3 ribbonCurve(float t, float sx, float sz, float tilt) {
  vec3 p = vec3(sx * (cos(t) + 0.32 * cos(2.0 * t)), 0.0, sz * (sin(t) - 0.18 * sin(3.0 * t)));
  return vec3(p.x, -p.z * sin(tilt), p.z * cos(tilt));
}

vec3 knotCurve(float t, float r) {
  float k = cos(3.0 * t) + 2.2;
  return vec3(k * cos(2.0 * t), k * sin(2.0 * t), -sin(3.0 * t)) * r / 3.2;
}

void formationPose(float u, float r2, float r3, float r4,
                   out vec3 p, out vec3 d, out float len, out float a,
                   out float accent, out float green, out float hot) {
  vec3 C = uFormCenter;
  vec4 A = uFormA;
  vec4 B = uFormB;
  vec4 Cx = uFormC;
  float idx = 0.0;
  p = C; d = vec3(1.0, 0.0, 0.0); len = 1.5; a = 1.0; accent = 0.0; green = 0.0; hot = 0.0;

  if (near(uFormKind, FORM_RING)) {
    float t = fract(r2 + uFormFlow * A.z * (0.8 + 0.4 * r4));
    float ang = -2.3 + A.w * 0.5 + t * (TAU - A.w);
    float rr = A.x + (r3 - 0.5) * A.y;
    p = C + vec3(cos(ang) * rr, sin(ang) * rr, (u - 0.5) * A.y * 0.7);
    d = vec3(-sin(ang), cos(ang), 0.0);
    len = B.x * (0.5 + r4);
    a = smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.94, 1.0, t));
  } else if (near(uFormKind, FORM_GATES)) {
    if (r3 < B.w) {
      float side = u < 0.5 ? -1.0 : 1.0;
      float range = A.x * A.w + 50.0;
      float zz = C.z + 24.0 - fract(r2 - uFormFlow * B.z * 3.0) * range;
      p = vec3(C.x + side * A.y * 0.72, 0.05 + r4 * 0.08, zz);
      d = vec3(0.0, 0.0, 1.0);
      len = B.y * 2.6;
      a = 0.7;
    } else {
      idx = floor(u * A.x);
      vec4 q = gantry(fract(r2 + uFormFlow * B.z * (0.7 + 0.6 * r4)), A.y, A.z);
      p = vec3(C.x + q.x, C.y + q.y, C.z - idx * A.w);
      d = vec3(q.zw, 0.0);
      len = B.y * (0.6 + 0.8 * r4);
      green = near(idx, B.x) ? 0.55 + 0.45 * sin(uTime * 2.2) : 0.0;
    }
  } else if (near(uFormKind, FORM_LANES)) {
    idx = floor(u * A.x);
    vec3 dir = normalize(B.xyz);
    vec3 side = B.w > 0.5 ? vec3(0.0, 1.0, 0.0) : normalize(cross(dir, vec3(0.0, 1.0, 0.0)));
    float off = (idx - (A.x - 1.0) * 0.5) * A.y;
    float along = fract(r2 + uFormFlow * A.w * (0.75 + 0.5 * r4));
    p = C + side * (off * (1.0 + Cx.x * along)) + dir * ((along - 0.5) * A.z) + vec3(0.0, (r3 - 0.5) * 0.06, 0.0);
    d = normalize(dir + side * off * Cx.x / max(A.z, 1.0));
    len = mix(1.0, 3.2, r3);
    accent = r4 < Cx.y ? 1.0 : 0.0;
    a = smoothstep(0.0, 0.08, along) * (1.0 - smoothstep(0.9, 1.0, along));
  } else if (near(uFormKind, FORM_RIBBON)) {
    float beadShare = 0.07;
    if (u < beadShare) {
      idx = floor(u / beadShare * A.w);
      float t = idx / A.w * TAU + 0.35;
      p = C + ribbonCurve(t, A.x, A.y, B.y);
      d = normalize(ribbonCurve(t + 0.01, A.x, A.y, B.y) - ribbonCurve(t, A.x, A.y, B.y));
      float lit = idx < B.x - 0.5 ? 1.0 : 0.0;
      len = 0.45;
      a = 0.35 + 0.65 * lit;
      hot = lit * 1.4;
      idx = 0.0;
    } else {
      float t = fract(r2 + uFormFlow * A.z * (0.8 + 0.4 * r4)) * TAU;
      p = C + ribbonCurve(t, A.x, A.y, B.y) + vec3(0.0, (r3 - 0.5) * 0.12, 0.0);
      d = normalize(ribbonCurve(t + 0.01, A.x, A.y, B.y) - ribbonCurve(t, A.x, A.y, B.y));
      len = B.z * (0.5 + r4);
      accent = 0.65;
    }
  } else if (near(uFormKind, FORM_TWO_PASS)) {
    if (r3 < B.y) {
      float side = u < 0.5 ? -1.0 : 1.0;
      vec4 q = perimeter(fract(r2 + uFormFlow * 0.03), A.x, A.y);
      p = C + vec3(side * A.z * 0.5, q.y - A.y * 0.5, q.x);
      d = vec3(0.0, q.w, q.z);
      len = 1.2;
      a = 0.75;
    } else {
      float along = fract(r2 + uFormFlow * A.w * (0.8 + 0.4 * r4));
      float x = (along - 0.5) * A.z * 3.2;
      float y = (u - 0.5) * A.y * 0.8;
      if (x < -A.z * 0.5) y += sin(along * 40.0 + u * 20.0) * 0.18;
      p = C + vec3(x, y, (r4 - 0.5) * A.x * 0.8);
      green = x > A.z * 0.5 ? 1.0 : 0.0;
      len = B.x;
      a = smoothstep(0.0, 0.06, along) * (1.0 - smoothstep(0.92, 1.0, along));
    }
  } else if (near(uFormKind, FORM_KNOTS)) {
    idx = floor(u * A.x);
    float t = fract(r2 + uFormFlow * A.w * (0.8 + 0.4 * r4)) * TAU;
    vec3 o = vec3((idx - (A.x - 1.0) * 0.5) * A.z, 0.0, 0.0);
    p = C + o + knotCurve(t, A.y);
    d = normalize(knotCurve(t + 0.01, A.y) - knotCurve(t, A.y));
    len = B.x * (0.5 + r4);
  } else if (near(uFormKind, FORM_MODULES)) {
    idx = floor(u * A.x);
    float cols = A.y;
    float rows = ceil(A.x / cols);
    float col = mod(idx, cols);
    float row = floor(idx / cols);
    vec2 o = vec2((col - (cols - 1.0) * 0.5) * (A.z + B.x), -(row - (rows - 1.0) * 0.5) * (A.w + B.y));
    float s01 = fract(r2 + uFormFlow * B.z * (0.7 + 0.6 * r4));
    vec4 q = perimeter(s01, A.z, A.w);
    if (B.w > 1.5) {
      // Lying on the floor like a plan: grid rows recede in depth.
      p = C + vec3(o.x + q.x, (r3 - 0.5) * 0.04, -o.y * 1.6 - q.y * 1.6 + A.w * 0.8);
      d = normalize(vec3(q.z, 0.0, -q.w * 1.6));
    } else {
      p = C + vec3(o.x + q.x, o.y + q.y - A.w * 0.5, (r3 - 0.5) * 0.08);
      d = vec3(q.zw, 0.0);
    }
    len = Cx.w * (0.6 + 0.8 * r4);
    float perSteps = s01 * 2.0 * (A.z + A.w);
    if (bit(Cx.x, idx)) a *= step(0.45, fract(perSteps * 1.4));
    if (bit(Cx.y, idx)) { a *= step(0.7, fract(perSteps * 3.0)); len *= 0.35; }
    if (mod(B.w, 2.0) > 0.5) a *= 0.55 + 0.45 * sin(uTime * 1.3 + idx * 1.7);
    if (near(idx, Cx.z)) hot = 0.6 + 0.4 * sin(uTime * 1.6);
  } else if (near(uFormKind, FORM_CONVERGE)) {
    // Ground-hugging streams running out to the horizon (not a radial warp).
    vec3 start = C + vec3((u * 2.0 - 1.0) * A.x, 0.08 + r3 * r3 * 1.6, 0.0);
    vec3 vp = C + vec3((u * 2.0 - 1.0) * A.x * 0.12, 0.6, -A.y);
    float along = fract(r2 + uFormFlow * A.z * (0.8 + 0.4 * r4));
    p = mix(start, vp, along);
    d = normalize(vp - start);
    len = mix(3.0, 0.4, along);
    a = smoothstep(0.0, 0.1, along) * (1.0 - along);
  } else if (near(uFormKind, FORM_CONFLUENCE)) {
    if (r3 < B.z) {
      vec4 q = perimeter(fract(r2 + uFormFlow * 0.02), A.x, A.y);
      p = C + vec3(0.0, q.y - A.y * 0.5, q.x);
      d = vec3(0.0, q.w, q.z);
      len = 1.3;
    } else if (u < 0.5) {
      float along = fract(r2 + uFormFlow * A.w * 0.6 * (0.7 + 0.6 * r4));
      float spread = 1.0 - along * along;
      float wob = uTime * (0.6 + r4) + u * 40.0;
      p = C + vec3(mix(-22.0, -0.6, along),
                   (r4 - 0.5) * A.y * 2.6 * spread + sin(wob) * 0.25,
                   (r3 - 0.5) * A.x * 2.6 * spread + cos(wob * 0.8) * 0.25);
      d = normalize(vec3(1.0, sin(wob * 1.3) * 0.6 * spread, cos(wob) * 0.6 * spread));
      len = B.x * (0.5 + r3);
      a = smoothstep(0.0, 0.1, along) * (0.45 + 0.35 * hash(floor(uTime * 6.0) + u * 97.0));
    } else {
      idx = floor(r4 * A.z);
      float along = fract(r2 + uFormFlow * A.w * (0.85 + 0.3 * r3));
      p = C + vec3(mix(0.6, 28.0, along), (idx - (A.z - 1.0) * 0.5) * (A.y * 0.85 / A.z), (r3 - 0.5) * 0.12);
      d = vec3(1.0, 0.0, 0.0);
      len = B.x * 1.2;
      accent = r3 > 1.0 - B.y ? 1.0 : 0.0;
      a = smoothstep(0.0, 0.05, along) * (1.0 - smoothstep(0.85, 1.0, along));
    }
  } else if (near(uFormKind, FORM_PLANES)) {
    idx = floor(u * A.x);
    vec4 q = perimeter(fract(r2 + uFormFlow * B.z * (0.7 + 0.6 * r4)), A.y, A.z);
    p = C + vec3(idx * B.x + q.x, idx * B.y + q.y - A.z * 0.5, -idx * A.w);
    d = vec3(q.zw, 0.0);
    len = B.w * (0.6 + 0.8 * r4);
  }

  hot += near(idx, uHighlight.x) ? uHighlight.y : 0.0;
}

void main() {
  vec3 cam = cameraPosition;

  // Free flow: hairlines crossing left to right at many depths, world-fixed in z.
  float dist = 0.8 + mod(cam.z - aSeed.z * uDepth, uDepth);
  float halfW = dist * uTanHalfFov * uAspect * 1.2 + 2.0;
  float halfH = dist * uTanHalfFov * 1.15 + 1.0;
  float phase = fract(aSeed.x + uFlow / aProps.x - cam.x / (2.0 * halfW));
  vec3 pos = vec3(cam.x + (phase * 2.0 - 1.0) * halfW,
                  abs(cam.y + (aSeed.y * 2.0 - 1.0) * halfH - 0.03) + 0.03,
                  cam.z - dist);
  vec3 dir = normalize(vec3(1.0, 0.0, 0.06));
  float grow = 0.45 + phase * 0.9;
  float len = 2.0 * halfW * aProps.y * grow;
  float alpha = smoothstep(0.0, 0.1, phase) * (1.0 - smoothstep(0.82, 1.0, phase));
  float width = aProps.z;
  float accent = 0.0;
  float green = 0.0;
  float hot = 0.0;

  float slot = aProps.w;
  bool member = slot < uFormShare && uForm > 0.001;
  if (member) {
    float u = slot / uFormShare;
    vec3 fp; vec3 fd; float fl; float fa; float fAccent; float fGreen; float fHot;
    formationPose(u, hash(u * 13.7 + 1.3), aSeed.y, aSeed.x, fp, fd, fl, fa, fAccent, fGreen, fHot);
    float w = smoothstep(u * 0.35, u * 0.35 + 0.65, uForm);
    pos = mix(pos, fp, w);
    dir = normalize(mix(dir, fd, w));
    len = mix(len, fl, w);
    alpha = mix(alpha * step(aSeed.w, uDensity) * uIntensity, fa * uFormAlpha, w);
    width = mix(width, 0.035, w);
    accent = fAccent * w;
    green = fGreen * w;
    hot = fHot * w;
  } else {
    alpha *= step(aSeed.w, uDensity) * uIntensity;
  }

  len *= 1.0 + min(uVelocity, 1.6) * 1.5;

  vec3 head = pos;
  vec3 tail = pos - dir * len;
  mat4 vp = projectionMatrix * viewMatrix;
  vec4 ch = vp * vec4(head, 1.0);
  vec4 ct = vp * vec4(tail, 1.0);
  if (alpha < 0.003 || ch.w < 0.15 || ct.w < 0.15) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vAlpha = 0.0;
    return;
  }

  vec2 sh = ch.xy / ch.w * 0.5 * uResolution;
  vec2 st = ct.xy / ct.w * 0.5 * uResolution;
  vec2 sd = sh - st;
  float sl = length(sd);
  vec2 nrm = sl > 0.001 ? vec2(-sd.y, sd.x) / sl : vec2(0.0, 1.0);

  vec4 c = mix(ct, ch, corner.x);
  float depth = c.w;
  // Fake depth of field: very near filaments widen and soften (Resn-style focal falloff).
  float dof = 1.0 + max(0.0, 3.5 - depth) * 1.6;
  float projHalf = width * dof * 0.25 * uResolution.y / (depth * uTanHalfFov);
  float minHalf = 0.7 * uPixelRatio;
  float halfPx = max(projHalf, minHalf);
  alpha *= clamp(projHalf / minHalf, 0.3, 1.0) / sqrt(dof);
  float pad = uPixelRatio;
  c.xy += nrm * corner.y * (halfPx + pad) * 2.0 / uResolution * c.w;

  gl_Position = c;
  vUv = vec2(corner.x, corner.y * (halfPx + pad) / halfPx);
  vAlpha = alpha;
  vDist = depth;
  vAccent = accent;
  vGreen = green;
  vHot = hot;
}
