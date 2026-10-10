/* ================= QUALITY AND POST-PROCESSING ================= */
import {G} from '../core/state.js';
import {QUALITY, R3} from './core.js';

/* ---------- quality, resize, post ---------- */
export const GradeShader = {
  uniforms: {tDiffuse: {value: null}, exposure: {value: 1.18}, vig: {value: 0.85}, time: {value: 0}},
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: [
    'uniform sampler2D tDiffuse;uniform float exposure;uniform float vig;uniform float time;varying vec2 vUv;',
    'vec3 rrt(vec3 v){vec3 a=v*(v+0.0245786)-0.000090537;vec3 b=v*(0.983729*v+0.4329510)+0.238081;return a/b;}',
    'vec3 aces(vec3 c){const mat3 mi=mat3(vec3(0.59719,0.07600,0.02840),vec3(0.35458,0.90834,0.13383),vec3(0.04823,0.01566,0.83777));',
    'const mat3 mo=mat3(vec3(1.60475,-0.10208,-0.00327),vec3(-0.53108,1.10813,-0.07276),vec3(-0.07367,-0.00605,1.07602));',
    'c*=exposure/0.6;c=mi*c;c=rrt(c);c=mo*c;return clamp(c,0.0,1.0);}',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time)*43758.5453);}',
    'void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;c=aces(max(c,0.0));',
    'vec2 q=vUv-0.5;c*=1.0-vig*dot(q,q)*1.15;',
    'float l=dot(c,vec3(0.2126,0.7152,0.0722));c=mix(vec3(l),c,1.12);',
    'c=mix(c*12.92,1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-0.055,step(0.0031308,c));',
    'c+=(hash(gl_FragCoord.xy)-0.5)/255.0*1.6;gl_FragColor=vec4(c,1.0);}'
  ].join('\n')
};
export function setQuality(name, manual) {
  const rn = R3.rn,
    q = QUALITY[name];
  if (manual) R3.auto = false;
  R3.qName = name;
  R3.q = q;
  if (R3.composer) {
    R3.composer.renderTarget1.dispose();
    R3.composer.renderTarget2.dispose();
    if (R3.bloom && R3.bloom.dispose) R3.bloom.dispose();
    R3.composer = null;
    R3.bloom = null;
    R3.grade = null;
  }
  const pr = Math.min(window.devicePixelRatio || 1, q.dpr);
  rn.setPixelRatio(pr);
  rn.setSize(R3.w, R3.h, false);
  const pw = Math.max(2, Math.floor(R3.w * pr)),
    ph = Math.max(2, Math.floor(R3.h * pr)),
    gl2 = rn.capabilities.isWebGL2;
  const floatOK = gl2
    ? rn.extensions.has('EXT_color_buffer_float')
    : rn.extensions.has('EXT_color_buffer_half_float') && rn.extensions.has('OES_texture_half_float_linear');
  const wantShadow = q.shadow > 0;
  if (rn.shadowMap.enabled !== wantShadow) {
    rn.shadowMap.enabled = wantShadow;
    R3.dirtyMats = true;
  }
  if (wantShadow && R3.moon.shadow.mapSize.x !== q.shadow) {
    R3.moon.shadow.mapSize.set(q.shadow, q.shadow);
    if (R3.moon.shadow.map) {
      R3.moon.shadow.map.dispose();
      R3.moon.shadow.map = null;
    }
  }
  let post =
    q.post &&
    floatOK &&
    !R3.noPost &&
    THREE.EffectComposer &&
    THREE.RenderPass &&
    THREE.ShaderPass &&
    THREE.UnrealBloomPass;
  if (post) {
    try {
      const RT = q.msaa && gl2 && !R3.noMsaa ? THREE.WebGLMultisampleRenderTarget : THREE.WebGLRenderTarget;
      const rt = new RT(pw, ph, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter
      });
      const c = new THREE.EffectComposer(rn, rt);
      c.addPass(new THREE.RenderPass(R3.scene, R3.camera));
      R3.bloom = new THREE.UnrealBloomPass(new THREE.Vector2(pw, ph), 0.62, 0.6, 0.92);
      c.addPass(R3.bloom);
      R3.grade = new THREE.ShaderPass(GradeShader);
      c.addPass(R3.grade);
      R3.composer = c;
    } catch (e) {
      R3.composer = null;
      post = false;
    }
  }
  const tm = post ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  if (rn.toneMapping !== tm) {
    rn.toneMapping = tm;
    R3.dirtyMats = true;
  }
  rn.toneMappingExposure = 1.18;
  if (R3.dirtyMats) {
    R3.scene.traverse(o => {
      if (o.material) o.material.needsUpdate = true;
    });
    R3.dirtyMats = false;
  }
  R3.postOn = !!post;
  R3.probe = post ? 3 : 0;
  R3.ft = [];
  G.dirty = true;
}
export function resize3D(w, h) {
  R3.w = Math.max(2, w);
  R3.h = Math.max(2, h);
  R3.camera.aspect = R3.w / R3.h;
  R3.camera.updateProjectionMatrix();
  setQuality(R3.qName);
}
// if the post chain comes out black on this GPU, fall back a step instead of showing nothing
export function probeFrame() {
  const gl = R3.rn.getContext(),
    w = gl.drawingBufferWidth,
    h = gl.drawingBufferHeight,
    px = new Uint8Array(4);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    gl.readPixels(
      (w * (0.2 + 0.3 * (i % 3))) | 0,
      (h * (0.2 + 0.3 * ((i / 3) | 0))) | 0,
      1,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      px
    );
    sum += px[0] + px[1] + px[2];
  }
  if (sum < 60) {
    if (!R3.noMsaa && R3.q.msaa) R3.noMsaa = true;
    else R3.noPost = true;
    setQuality(R3.qName);
  }
}
