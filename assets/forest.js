(function(){
  // Simple on-screen badge helper
  function showBadge(text, bg){
    try {
      const b = document.createElement('div');
      b.textContent = text;
      Object.assign(b.style, {
        position: 'fixed', left: '8px', bottom: '8px', padding: '6px 10px',
        background: bg || 'rgba(20,20,20,0.75)', color: '#fff', font: '12px/1.2 monospace',
        borderRadius: '6px', zIndex: 10000
      });
      document.body ? document.body.appendChild(b) : document.addEventListener('DOMContentLoaded', ()=>document.body.appendChild(b));
      setTimeout(()=> b.remove(), 15000);
    } catch(e) {}
  }
  // Debug badge disabled in production
  const THREE_CDN = "https://unpkg.com/three@0.160.0/build/three.min.js";
  function loadThreeIfNeeded(cb){
    if (window.THREE) { cb(); return; }
    const primary = document.createElement('script');
    primary.src = THREE_CDN;
    primary.async = true;
    primary.onload = cb;
    primary.onerror = function(){
      console.error('[Forest3D] Failed to load THREE.js from unpkg, trying jsdelivr...');
      const fallback = document.createElement('script');
      fallback.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
      fallback.async = true;
      fallback.onload = cb;
      fallback.onerror = function(){ console.error('[Forest3D] Failed to load THREE.js from both CDNs'); };
      document.head.appendChild(fallback);
    };
    document.head.appendChild(primary);
    // Safety: if THREE appears by other means, start anyway after a short delay
    setTimeout(()=>{ if (window.THREE) cb(); }, 2500);
  }

  function start(){
    try { if (!window.THREE) return; } catch(e){ return; }

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const DPR = Math.min(isMobile ? 1 : 1.5, window.devicePixelRatio || 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(DPR);
    // Better color and tone mapping for smooth visuals
    try {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
    } catch(_){}
    // Transparent clear color so scene behaves as page background
    renderer.setClearColor(0x000000, 0);
    console.log('[Forest3D] renderer ready');
    Object.assign(renderer.domElement.style, {
      position: 'fixed', left: '0', top: '0', width: '100%', height: '100%', zIndex: '0', pointerEvents: 'none'
    });
    document.body.prepend(renderer.domElement);
    // Ensure page backgrounds are transparent so 3D shows behind content
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';

    // Debug badge removed for production

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xa7d5c8, 0.0022);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 5000);
    camera.position.set(0, 14, 40);

    const hemi = new THREE.HemisphereLight(0xb9e7ff, 0x6e8b5a, 0.65);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(-40, 60, 50);
    scene.add(dir);

    // Debug geometry removed

    const groundGeo = new THREE.PlaneGeometry(4000, 4000, 1, 1);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0xb5dfb6 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI/2; ground.position.y = -1.2;
    scene.add(ground);

    function makeTree(scale){
      const s = scale || 1;
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4*s, 0.6*s, 5*s, 6),
        new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.9 })
      );
      trunk.position.y = 2.5*s; g.add(trunk);
      const foliageColors = [0x5aa86a, 0x4f9a60, 0x66bb6a, 0x3f8f57];
      for (let i=0;i<3;i++){
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry((2.4 - i*0.4)*s, (3 - i*0.2)*s, 6),
          new THREE.MeshStandardMaterial({ color: foliageColors[i%foliageColors.length], roughness: 0.8 })
        );
        cone.position.y = (4 + i*1.2)*s; g.add(cone);
      }
      g.userData.swayPhase = Math.random()*Math.PI*2;
      g.userData.swayAmp = (0.4 + Math.random()*0.6) * (s*0.5);
      return g;
    }

    function makeDeer(){
      const d = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.4, 0.9), new THREE.MeshStandardMaterial({ color: 0x9c7b59 }));
      body.position.y = 1.2; d.add(body);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.7), new THREE.MeshStandardMaterial({ color: 0xa48262 }));
      head.position.set(1.6, 1.9, 0); d.add(head);
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.4), new THREE.MeshStandardMaterial({ color: 0x9c7b59 }));
      neck.position.set(1.2, 1.6, 0); d.add(neck);
      const hornL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.1), new THREE.MeshStandardMaterial({ color: 0xd9cbb8 }));
      hornL.position.set(1.9, 2.4, 0.2); d.add(hornL);
      const hornR = hornL.clone(); hornR.position.z = -0.2; d.add(hornR);
      const legGeo = new THREE.BoxGeometry(0.2, 1.2, 0.2);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x6e4f3b });
      const coords = [[1.0,0.35],[1.6,0.35],[-1.0,-0.35],[-1.6,-0.35]];
      coords.forEach(c=>{ const leg=new THREE.Mesh(legGeo,legMat); leg.position.set(c[0],0.6,c[1]); d.add(leg); });
      d.userData.stepPhase = Math.random()*Math.PI*2;
      return d;
    }

    function makeBird(){
      const b = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.3,0.3), new THREE.MeshStandardMaterial({ color: 0x3e7ca8 }));
      body.position.y = 0.2; b.add(body);
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.06,0.2), new THREE.MeshStandardMaterial({ color: 0x4b89b4 }));
      wingL.position.set(-0.2, 0.25, 0); b.add(wingL);
      const wingR = wingL.clone(); wingR.position.x = 0.2; b.add(wingR);
      b.userData.wingL = wingL; b.userData.wingR = wingR;
      b.userData.phase = Math.random()*Math.PI*2;
      return b;
    }

    const trees = [];
    const forestLength = 2000;
    const band = 70;
    const count = 140; // reduced for smoother performance
    for (let i=0;i<count;i++){
      const s = 0.8 + Math.random()*1.6;
      const t = makeTree(s);
      const x = (Math.random()*2 - 1) * band * (0.2 + Math.random());
      const z = -Math.random()*forestLength - 40;
      t.position.set(x,0,z);
      t.rotation.y = Math.random()*Math.PI*2;
      trees.push(t); scene.add(t);
    }

    const animals = [];
    for (let i=0;i<4;i++){
      const deer = makeDeer();
      deer.position.set((Math.random()<0.5?-1:1)*(20+Math.random()*35), 0, -80 - Math.random()*forestLength*0.8);
      deer.scale.setScalar(0.9 + Math.random()*0.6);
      animals.push({ obj: deer, dir: (Math.random()<0.5?1:-1) });
      scene.add(deer);
    }

    const birds = [];
    for (let i=0;i<8;i++){
      const b = makeBird();
      const radius = 18 + Math.random()*22;
      const height = 10 + Math.random()*10;
      b.position.set(radius, height, -120 - Math.random()*800);
      birds.push({ obj: b, r: radius, h: height, speed: 0.3 + Math.random()*0.6, theta: Math.random()*Math.PI*2 });
      scene.add(b);
    }

    function resize(){
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w/h; camera.updateProjectionMatrix();
    }
    resize(); window.addEventListener('resize', resize);

    let targetZ = camera.position.z;
    let scrollNeedsUpdate = true;
    function updateScrollTarget(){
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = window.scrollY / maxScroll;
      const travel = -900;
      targetZ = 40 + p * travel;
      camera.position.y = 12 + p * 3;
      camera.rotation.z = (p-0.5) * 0.04;
      scrollNeedsUpdate = false;
    }
    updateScrollTarget();
    window.addEventListener('scroll', ()=>{ if (!scrollNeedsUpdate){ scrollNeedsUpdate = true; requestAnimationFrame(updateScrollTarget); } }, { passive: true });

    const clock = new THREE.Clock();
    function animate(){
      const t = clock.getElapsedTime();
      // smoother damping toward target
      camera.position.z += (targetZ - camera.position.z) * 0.045;
      camera.lookAt(0, 6, camera.position.z - 80);

      // lighter sway
      for (let i=0;i<trees.length;i++){
        const tr = trees[i];
        const sway = Math.sin(t*0.5 + tr.userData.swayPhase) * 0.018 * tr.userData.swayAmp;
        tr.rotation.z = sway;
      }

      // animals slower drift
      for (const a of animals){
        const obj = a.obj;
        const sp = 0.11 * a.dir;
        obj.position.x += sp * Math.sin(t*0.18 + (obj.userData.stepPhase||0));
        obj.position.z += 0.016 * Math.cos(t*0.14 + (obj.userData.stepPhase||0));
        obj.rotation.y = Math.sin(t*0.18)*0.08 + (a.dir>0?Math.PI:0);
      }

      // birds gentler motion
      for (const b of birds){
        b.theta += 0.009 * b.speed;
        b.obj.position.x = Math.cos(b.theta) * b.r;
        b.obj.position.z += -0.2 * b.speed;
        const wing = Math.sin(t*6.5 + b.obj.userData.phase) * 0.6;
        b.obj.userData.wingL.rotation.z = wing;
        b.obj.userData.wingR.rotation.z = -wing;
        b.obj.position.y = b.h + Math.sin(t*0.5 + b.obj.userData.phase)*0.55;
      }

      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);

    // Pause rendering when tab is hidden to save resources
    document.addEventListener('visibilitychange', ()=>{
      if (document.hidden) {
        renderer.setAnimationLoop(null);
      } else {
        renderer.setAnimationLoop(animate);
      }
    });

    // Fail-safe: if something goes wrong and no frames render, notify
    setTimeout(()=>{
      const hasCanvas = !!document.querySelector('canvas');
      if (!hasCanvas) {
        showBadge('No canvas found. CDN blocked?', 'rgba(200, 60, 60, 0.9)');
      }
    }, 4000);
  }

  loadThreeIfNeeded(start);
})();
