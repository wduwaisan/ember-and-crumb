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
      /* ACES greys out warm browns badly — coffee came out murky under it.
         Neutral keeps the amber. */
      renderer.toneMapping = THREE.NeutralToneMapping ?? THREE.LinearToneMapping;
      renderer.toneMappingExposure = 1.25;
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
    c.width = 1024; c.height = 512;
    const g = c.getContext('2d');
    /* High-key studio: bright ceiling, clean walls, a soft floor bounce.
       Murkiness in the last pass came from a dark lower half dragging the
       whole reflection down. */
    const sky = g.createLinearGradient(0, 0, 0, 512);
    sky.addColorStop(0.00, '#ffffff');
    sky.addColorStop(0.30, '#fffdf6');
    sky.addColorStop(0.52, '#f6ecd6');
    sky.addColorStop(0.74, '#e8d6b8');
    sky.addColorStop(1.00, '#c9b48f');
    g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);

    /* A big soft box light overhead — this is what draws the long vertical
       highlight down the side of a glass. */
    const box = g.createLinearGradient(0, 0, 0, 190);
    box.addColorStop(0, 'rgba(255,255,255,1)');
    box.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = box; g.fillRect(120, 0, 300, 190);
    g.fillStyle = box; g.fillRect(640, 0, 220, 150);

    /* warm bounce from the right, cool fill from the left */
    const warm = g.createRadialGradient(800, 300, 4, 800, 300, 260);
    warm.addColorStop(0, 'rgba(255,214,158,.85)'); warm.addColorStop(1, 'rgba(255,214,158,0)');
    g.fillStyle = warm; g.fillRect(0, 0, 1024, 512);
    const cool = g.createRadialGradient(180, 280, 4, 180, 280, 240);
    cool.addColorStop(0, 'rgba(235,245,255,.7)'); cool.addColorStop(1, 'rgba(235,245,255,0)');
    g.fillStyle = cool; g.fillRect(0, 0, 1024, 512);

    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromEquirectangular(tex).texture;
    pmrem.dispose(); tex.dispose();
    return env;
  }

  /* ------------------------------------------------------------ materials
     Only ONE transmissive layer can be seen through at a time: three.js
     renders transmissive materials against a buffer that contains just the
     opaque objects. So the wall is plain alpha, the coffee is transmissive,
     and the ice is opaque — which is exactly the order that lets you see
     ice through coffee through the cup. */

  /* Thin clear plastic: no transmission, just a faint tint plus strong
     specular and clearcoat so it catches the softbox as a highlight. */
  const glass = () => new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transparent: true, opacity: 0.11,
    roughness: 0.03, metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0.02,
    specularIntensity: 1, reflectivity: 0.6,
    envMap, envMapIntensity: 2.2,
    side: THREE.DoubleSide, depthWrite: false,
  });

  /* The drink. Transmissive with attenuation, so it is deep and dark where
     the column is thick and glows amber where it thins at the edges. */
  const liquid = hex => {
    const base = new THREE.Color(hex);
    /* Very dark drinks (cold brew is nearly black) go to mud once attenuation
       stacks on top, so lift the surface tint and warm it before it is used. */
    const hsl = { h: 0, s: 0, l: 0 };
    base.getHSL(hsl);
    const tint = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 1.15 + 0.05), Math.max(hsl.l, 0.22));
    return new THREE.MeshPhysicalMaterial({
      color: tint, transmission: 0.94, thickness: 0.85,
      attenuationColor: base, attenuationDistance: 2.6,
      roughness: 0.05, metalness: 0, ior: 1.34,
      clearcoat: 0.55, clearcoatRoughness: 0.08,
      envMap, envMapIntensity: 1.2, transparent: true, side: THREE.DoubleSide,
    });
  };

  /* Ice is deliberately OPAQUE. Transmissive ice would vanish behind the
     transmissive coffee; a pale, glossy, slightly frosted solid reads far
     more like real ice through a drink. */
  const iceMat = () => new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.13, metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0.05,
    sheen: 0.6, sheenColor: new THREE.Color(0xffffff),
    emissive: new THREE.Color(0xdfeaf5), emissiveIntensity: 0.18,
    envMap, envMapIntensity: 0.9,
  });

  const cream = hex => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(hex), roughness: 0.7, sheen: 0.8,
    sheenColor: new THREE.Color(0xffffff), envMap, envMapIntensity: 0.75,
  });
  const matte = hex => new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex), roughness: 0.8, metalness: 0, envMap, envMapIntensity: 0.55,
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

    scene.add(new THREE.HemisphereLight(0xffffff, 0xc4a980, 1.15));

    const key = new THREE.DirectionalLight(0xfff8ec, 2.6);
    key.position.set(2.4, 6.0, 3.8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5; key.shadow.camera.far = 20;
    key.shadow.camera.left = -3.5; key.shadow.camera.right = 3.5;
    key.shadow.camera.top = 3.5; key.shadow.camera.bottom = -3.5;
    key.shadow.bias = -0.0012; key.shadow.radius = 4;
    scene.add(key);

    /* Back-left rim: this is what puts the bright edge down the side of the
       cup and makes ice cubes sparkle instead of going flat and grey. */
    const rim = new THREE.DirectionalLight(0xffffff, 2.2);
    rim.position.set(-3.4, 3.2, -3.6);
    scene.add(rim);

    /* Low warm bounce, standing in for light coming back off the table. */
    const bounce = new THREE.DirectionalLight(0xffd9a8, 0.7);
    bounce.position.set(0.5, -1.5, 2.5);
    scene.add(bounce);

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
    const H = iced ? 2.6 : 2.05;
    const rB = iced ? 0.66 : 0.66;
    const rT = iced ? 0.94 : 0.95;
    const wall = 0.04;
    const radiusAt = y => rB + (rT - rB) * Math.pow(Math.max(0, y) / H, iced ? 1 : 0.86);

    /* --- the cup wall, lathed with real thickness --- */
    const profile = [[0, 0], [rB, 0]];
    const steps = 24;
    for (let i = 1; i <= steps; i++) profile.push([radiusAt(i / steps * H), i / steps * H]);
    for (let i = steps; i >= 0; i--) {
      const y = i / steps * H;
      profile.push([Math.max(0.02, radiusAt(y) - wall), Math.max(wall, y)]);
    }
    profile.push([0, wall]);
    const shell = new THREE.Mesh(latheProfile(profile), iced ? glass() : matte(0xfffcf4));
    shell.castShadow = true;
    shell.renderOrder = 20;                       // the wall goes on last
    group.add(shell);

    /* A rolled lip. Small detail, but its highlight is most of what tells
       your eye the cup is made of thin plastic. */
    if (iced) {
      const lip = new THREE.Mesh(new THREE.TorusGeometry(rT + 0.005, 0.032, 12, 80), glass());
      lip.rotation.x = Math.PI / 2;
      lip.position.y = H;
      lip.renderOrder = 21;
      group.add(lip);
    }

    const fill = H * (iced ? 0.93 : 0.85);

    /* --- ice first, so it is inside the drink rather than floating on it --- */
    if (s.temp === 'iced') {
      /* Fixed layout rather than random: it has to look deliberate, and it
         must not reshuffle every time a syrup is tapped. */
      const cubes = [
        [-0.30, 0.42, 0.10, 0.52, 0.9], [ 0.33, 0.55,-0.16, 1.30, 0.8],
        [ 0.02, 0.95, 0.26,-0.70, 1.0], [-0.34, 1.05,-0.22, 0.35, 0.85],
        [ 0.31, 1.35, 0.14, 2.10, 0.95], [-0.06, 1.55,-0.30,-1.25, 0.8],
        [-0.33, 1.85, 0.18, 0.80, 0.9], [ 0.30, 2.00,-0.10, 1.75, 0.85],
        [ 0.00, 2.28, 0.22,-0.45, 1.0], [-0.28, 2.38,-0.16, 1.15, 0.9],
        [ 0.26, 2.52, 0.06, 0.25, 0.8],
      ];
      for (const [x, y, z, rot, sc] of cubes) {
        if (y > H + 0.1) continue;
        const room = radiusAt(y) - wall - 0.16;
        const size = 0.34 * sc;
        const c = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), iceMat());
        const d = Math.hypot(x, z) || 1;
        const k = Math.min(1, room / d);
        c.position.set(x * k, y, z * k);
        c.rotation.set(rot * 0.6, rot, rot * 0.35);
        c.castShadow = true;
        group.add(c);
      }
    }

    /* --- the drink, in transmissive bands --- */
    let y = 0;
    for (const band of s.layers) {
      const h = fill * band.h / 100;
      const geo = new THREE.CylinderGeometry(
        radiusAt(y + h) - wall * 1.2, radiusAt(y) - wall * 1.2, h, 72, 1, true);
      const m = new THREE.Mesh(geo, liquid(band.color));
      m.position.y = y + h / 2;
      m.renderOrder = 5;
      group.add(m);
      y += h;
    }

    /* the surface of the drink */
    const topR = radiusAt(fill) - wall * 1.2;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(topR, 72),
      s.foam ? cream(s.foam) : liquid(s.layers[s.layers.length - 1].color));
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = fill;
    disc.renderOrder = 6;
    group.add(disc);

    /* --- foam --- */
    if (s.foam) {
      const fh = 0.26;
      const foam = new THREE.Mesh(new THREE.CylinderGeometry(topR + 0.015, topR, fh, 72), cream(s.foam));
      foam.position.y = fill + fh / 2;
      foam.castShadow = true;
      group.add(foam);
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(topR + 0.015, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), cream(s.foam));
      dome.scale.y = 0.3;
      dome.position.y = fill + fh;
      group.add(dome);
    }

    /* --- lid and sleeve stay on the hot cup --- */
    if (!iced) {
      const lid = new THREE.Mesh(
        latheProfile([[0, 0], [rT + 0.04, 0], [rT + 0.05, 0.08], [rT - 0.02, 0.1],
                      [rT - 0.06, 0.2], [0.16, 0.24], [0.15, 0.19], [0, 0.19]]),
        matte(0xfffbf3));
      lid.position.y = H;
      lid.castShadow = true;
      group.add(lid);
      const sleeveR = radiusAt(H * 0.45) + 0.03;
      const sleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(sleeveR + 0.05, sleeveR, H * 0.42, 64, 1, true), matte(0xded0b6));
      sleeve.position.y = H * 0.44;
      sleeve.castShadow = true;
      group.add(sleeve);
    }

    /* --- dusting --- */
    if (s.dust && s.dust.length) {
      const top = fill + (s.foam ? 0.36 : 0.01);
      s.dust.forEach((hex, di) => {
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2 + di * 0.7;
          const r = topR * (0.18 + 0.62 * ((i * 37 % 10) / 10));
          const d = new THREE.Mesh(new THREE.SphereGeometry(0.03 + (i % 3) * 0.008, 8, 6), matte(hex));
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
