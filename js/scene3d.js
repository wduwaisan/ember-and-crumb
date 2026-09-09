/* ==========================================================================
   Ember & Crumb — real-time 3D
   --------------------------------------------------------------------------
   Every object here is built from maths, not modelled in an external app:
   lathed profiles for cups and bottles, extruded profiles for cookies,
   stacked solids for cakes. Materials are physically based — the glass
   genuinely refracts what is behind it — and lighting comes from a
   procedurally generated environment map.

   This is progressive enhancement. The CSS previews stay exactly as they
   were; 3D is layered on top only once WebGL is confirmed working, so a
   machine without it, or a slow CDN, loses nothing.
   ========================================================================== */
import * as THREE from 'three';

const Scene3D = (() => {
  let renderer = null, envMap = null, available = false;
  const views = new Map();          // container element -> view record
  let raf = 0;

  /* ---------------------------------------------------------------- setup */
  function boot() {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      envMap = buildEnvironment();
      available = true;
    } catch (e) {
      console.warn('[Ember & Crumb] WebGL unavailable, keeping the flat previews:', e.message);
      available = false;
    }
    return available;
  }

  /* A warm studio in a canvas: bright soft ceiling, cream walls, darker floor.
     Cheaper than loading an HDR and it matches the site's palette. */
  function buildEnvironment() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 256);
    sky.addColorStop(0.00, '#ffffff');
    sky.addColorStop(0.35, '#fdf7e4');
    sky.addColorStop(0.55, '#e7d8bd');
    sky.addColorStop(1.00, '#7d6448');
    g.fillStyle = sky; g.fillRect(0, 0, 512, 256);
    /* a soft key light and a warm bounce, so glass has something to reflect */
    const key = g.createRadialGradient(150, 40, 4, 150, 40, 120);
    key.addColorStop(0, 'rgba(255,255,255,1)'); key.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = key; g.fillRect(0, 0, 512, 256);
    const warm = g.createRadialGradient(400, 150, 4, 400, 150, 150);
    warm.addColorStop(0, 'rgba(224,168,110,.75)'); warm.addColorStop(1, 'rgba(224,168,110,0)');
    g.fillStyle = warm; g.fillRect(0, 0, 512, 256);

    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromEquirectangular(tex).texture;
    pmrem.dispose(); tex.dispose();
    return env;
  }

  /* ------------------------------------------------------------ materials */
  const glass = () => new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transmission: 1, thickness: 0.04, roughness: 0.015,
    ior: 1.46, clearcoat: 1, clearcoatRoughness: 0.02,
    attenuationDistance: 40,
    specularIntensity: 1, envMap, envMapIntensity: 1.35,
    transparent: true, side: THREE.DoubleSide, depthWrite: false,
  });
  const liquid = hex => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(hex), roughness: 0.18, metalness: 0,
    clearcoat: 0.85, clearcoatRoughness: 0.16,
    envMap, envMapIntensity: 0.95, side: THREE.DoubleSide,
  });
  const cream = hex => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(hex), roughness: 0.82, sheen: 0.6,
    sheenColor: new THREE.Color(0xffffff), envMap, envMapIntensity: 0.4,
  });
  const matte = hex => new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex), roughness: 0.85, metalness: 0, envMap, envMapIntensity: 0.35,
  });
  const iceMat = () => new THREE.MeshPhysicalMaterial({
    color: 0xeaf4ff, transmission: 0.92, thickness: 0.3, roughness: 0.18,
    ior: 1.31, envMap, envMapIntensity: 1.1, transparent: true,
  });

  /* --------------------------------------------------------------- helpers */
  function latheProfile(points, segments = 96) {
    return new THREE.LatheGeometry(points.map(p => new THREE.Vector2(p[0], p[1])), segments);
  }

  function makeView(el, { fov = 26, dist = 7.2, height = 1.25 } = {}) {
    const scene = new THREE.Scene();
    scene.environment = envMap;

    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
    camera.position.set(1.15, height + 1.5, dist);
    camera.lookAt(0, height * 0.92, 0);

    scene.add(new THREE.HemisphereLight(0xfff6e6, 0x9c7f5f, 0.85));
    const key = new THREE.DirectionalLight(0xfff3e0, 2.1);
    key.position.set(2.6, 5.2, 3.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5; key.shadow.camera.far = 18;
    key.shadow.camera.left = -3; key.shadow.camera.right = 3;
    key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
    key.shadow.bias = -0.0012; key.shadow.radius = 3;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd7a8, 0.8);
    rim.position.set(-3.2, 2.4, -2.6);
    scene.add(rim);

    /* Catches the shadow without painting a floor over the page background. */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const group = new THREE.Group();
    group.rotation.y = -0.42;              // three-quarter, so it reads as solid
    scene.add(group);

    const canvas = document.createElement('canvas');
    canvas.className = 'scene3d';
    el.append(canvas);

    const view = { el, canvas, scene, camera, group, spin: 0, dirty: true };
    views.set(el, view);
    return view;
  }

  function clear(group) {
    for (let i = group.children.length - 1; i >= 0; i--) {
      const o = group.children[i];
      o.traverse(n => { n.geometry?.dispose?.(); });
      group.remove(o);
    }
  }

  const shade = (hex, k) => new THREE.Color(hex).offsetHSL(0, 0, k).getHex();

  /* ======================================================== the drink cup */
  /* Profile is drawn in cross-section, then spun. Iced cups are straighter
     and taller; hot cups taper more and get a lid and a sleeve. */
  function buildCup(group, s) {
    const iced = s.temp !== 'hot';
    const H = iced ? 2.5 : 2.0;
    const rB = iced ? 0.72 : 0.68;       // radius at the base
    const rT = iced ? 0.92 : 0.95;       // radius at the rim
    const wall = 0.045;

    const outer = [];
    const steps = 22;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const r = rB + (rT - rB) * Math.pow(u, iced ? 1 : 0.86);
      outer.push([r, u * H]);
    }
    /* Turn back down the inside so the glass has real thickness to refract. */
    const profile = [[0, 0], ...outer, [rT - wall * 0.6, H]];
    for (let i = steps; i >= 0; i--) {
      const u = i / steps;
      const r = (rB + (rT - rB) * Math.pow(u, iced ? 1 : 0.86)) - wall;
      profile.push([Math.max(0.02, r), u * H + wall]);
    }
    profile.push([0, wall]);

    const shell = new THREE.Mesh(latheProfile(profile), iced ? glass() : matte(0xfffcf4));
    shell.castShadow = true; shell.receiveShadow = true;
    shell.renderOrder = 10;               // glass after its contents
    group.add(shell);

    /* --- the liquid, as stacked bands --- */
    const fill = H * (iced ? 0.88 : 0.83);
    let y = 0;
    for (const band of s.layers) {
      const h = fill * band.h / 100;
      const rAt = t => (rB + (rT - rB) * Math.pow(t / H, iced ? 1 : 0.86)) - wall * 1.4;
      const geo = new THREE.CylinderGeometry(rAt(y + h), rAt(y), h, 64, 1, true);
      const m = new THREE.Mesh(geo, liquid(band.color));
      m.position.y = y + h / 2;
      group.add(m);
      y += h;
    }
    /* cap the column so you do not see down an open tube */
    const topR = (rB + (rT - rB) * Math.pow(fill / H, iced ? 1 : 0.86)) - wall * 1.4;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(topR, 64),
      s.foam ? cream(s.foam) : liquid(s.layers[s.layers.length - 1].color));
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = fill + 0.002;
    group.add(disc);

    /* --- foam --- */
    if (s.foam) {
      const fh = 0.3;
      const foam = new THREE.Mesh(
        new THREE.CylinderGeometry(topR + 0.02, topR, fh, 64, 1, false),
        cream(s.foam));
      foam.position.y = fill + fh / 2;
      foam.castShadow = true;
      group.add(foam);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(topR + 0.02, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), cream(s.foam));
      dome.scale.y = 0.34;
      dome.position.y = fill + fh;
      group.add(dome);
    }

    /* --- ice --- */
    if (s.temp === 'iced') {
      /* Ice floats, so sit it at the surface where it is actually visible
         rather than burying it under an opaque column of coffee. */
      const top = s.foam ? -0.42 : 0.0;      // tuck under the foam when there is one
      const cubes = [[-0.30, top + 0.00, 0.12, 0.5], [0.32, top - 0.05, -0.14, -0.7],
                     [-0.08, top - 0.32, 0.24, 1.2], [0.20, top - 0.36, 0.02, 0.3],
                     [-0.30, top - 0.64, -0.18, -1.1]];
      for (const [x, dy, z, rot] of cubes) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), iceMat());
        c.position.set(x, fill + dy, z);
        c.rotation.set(rot * 0.7, rot, rot * 0.4);
        c.castShadow = true;
        group.add(c);
      }
    }

    /* --- straw --- */
    if (s.temp === 'iced') {
      const straw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, H * 1.5, 20),
        matte(0xb8794b));
      straw.position.set(0.16, H * 0.78, 0.34);
      straw.rotation.set(0.16, 0, -0.22);
      straw.castShadow = true;
      group.add(straw);
    }

    /* --- lid and sleeve on a hot cup --- */
    if (!iced) {
      const lid = new THREE.Mesh(
        latheProfile([[0, 0], [rT + 0.04, 0], [rT + 0.05, 0.08], [rT - 0.02, 0.1],
                      [rT - 0.06, 0.2], [0.16, 0.24], [0.15, 0.19], [0, 0.19]]),
        matte(0xfffbf3));
      lid.position.y = H;
      lid.castShadow = true;
      group.add(lid);

      const sleeveR = (rB + (rT - rB) * 0.45) + 0.03;
      const sleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(sleeveR + 0.05, sleeveR, H * 0.42, 64, 1, true),
        matte(0xded0b6));
      sleeve.position.y = H * 0.44;
      sleeve.castShadow = true;
      group.add(sleeve);
    }

    /* --- dusting on top --- */
    if (s.dust && s.dust.length) {
      const top = fill + (s.foam ? 0.42 : 0.02);
      s.dust.forEach((hex, di) => {
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2 + di * 0.7;
          const r = topR * (0.18 + 0.6 * ((i * 37 % 10) / 10));
          const d = new THREE.Mesh(new THREE.SphereGeometry(0.028 + (i % 3) * 0.008, 8, 6), matte(hex));
          d.position.set(Math.cos(a) * r, top + 0.02, Math.sin(a) * r);
          group.add(d);
        }
      });
    }
  }

  /* ============================================================ public API */
  function mount(el, kind, opts) {
    if (!available || !el) return null;
    let v = views.get(el);
    if (!v) v = makeView(el, opts);
    v.kind = kind;
    return v;
  }

  function update(el, state) {
    const v = views.get(el); if (!v) return;
    clear(v.group);
    if (v.kind === 'drink') buildCup(v.group, state);
    v.dirty = true;
    start();
  }

  function unmount(el) {
    const v = views.get(el); if (!v) return;
    clear(v.group); v.canvas.remove(); views.delete(el);
  }

  /* One renderer, many viewports: cheaper than a WebGL context per preview. */
  function frame() {
    raf = 0;
    let more = false;
    for (const v of views.values()) {
      const r = v.el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const onScreen = r.bottom > -200 && r.top < innerHeight + 200;
      if (!onScreen) continue;

      if (v.spinning) { v.group.rotation.y += 0.0045; more = true; }
      else if (!v.dirty) continue;
      v.dirty = false;

      const w = Math.round(r.width), h = Math.round(r.height);
      if (v.canvas.width !== w * renderer.getPixelRatio() || v.canvas.height !== h * renderer.getPixelRatio()) {
        v.canvas.width = w * renderer.getPixelRatio();
        v.canvas.height = h * renderer.getPixelRatio();
        v.canvas.style.width = w + 'px'; v.canvas.style.height = h + 'px';
      }
      v.camera.aspect = w / h;
      v.camera.updateProjectionMatrix();

      renderer.setSize(w, h, false);
      renderer.render(v.scene, v.camera);
      v.canvas.getContext('2d').drawImage(renderer.domElement, 0, 0);
    }
    if (more) start();
  }
  function start() { if (!raf && available) raf = requestAnimationFrame(frame); }

  const spin = (el, on) => { const v = views.get(el); if (v) { v.spinning = on; start(); } };

  return { boot, mount, update, unmount, spin, start, get available() { return available; } };
})();

/* Expose to the classic scripts and tell them 3D is ready. */
window.Scene3D = Scene3D;
if (Scene3D.boot()) {
  document.documentElement.classList.add('has-3d');
  dispatchEvent(new CustomEvent('ec:3d-ready'));
}
