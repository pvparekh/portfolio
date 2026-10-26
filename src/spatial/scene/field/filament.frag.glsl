uniform vec3 uAmber;
uniform vec3 uCoreColor;
uniform vec3 uEmber;
uniform vec3 uTint;
uniform vec3 uGreen;
uniform float uTintMix;
uniform float uCoreBoost;
uniform float uScrim;
uniform vec4 uScrimRect;   // centre.xy, half extents.zw in drawing-buffer pixels

varying vec2 vUv;
varying float vAlpha;
varying float vDist;
varying float vAccent;
varying float vGreen;
varying float vHot;

void main() {
  float across = abs(vUv.y);
  float body = exp(-across * across * 3.2);
  float core = exp(-across * across * 26.0);
  float along = vUv.x;
  float profile = smoothstep(0.0, 0.62, along) * (1.0 - smoothstep(0.86, 1.0, along));

  // Atmospheric perspective: far filaments cool toward ember and fade.
  vec3 base = mix(uAmber, uEmber, smoothstep(30.0, 260.0, vDist));
  base = mix(base, uTint, clamp(uTintMix + vAccent, 0.0, 1.0));
  base = mix(base, uGreen, clamp(vGreen, 0.0, 1.0));
  float fog = exp(-vDist * 0.0075);

  vec3 color = base * body + uCoreColor * core * (0.45 + vHot * 0.9) * uCoreBoost;
  float a = vAlpha * profile * fog * (1.0 + vHot * 0.6);

  // Reading scrim: attenuate light under the content column.
  vec2 d = max(abs(gl_FragCoord.xy - uScrimRect.xy) - uScrimRect.zw, 0.0);
  float mask = 1.0 - smoothstep(0.0, uScrimRect.z * 0.45, length(d));
  a *= 1.0 - uScrim * mask;

  gl_FragColor = vec4(color * a, a);
  #include <colorspace_fragment>
}
