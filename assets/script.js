const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const sceneCanvas = document.querySelector("#kim-3d-scene");

if (sceneCanvas) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  import("https://unpkg.com/three@0.164.1/build/three.module.js")
    .then((THREE) => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      const renderer = new THREE.WebGLRenderer({
        canvas: sceneCanvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      const clock = new THREE.Clock();
      const pointer = new THREE.Vector2(0, 0);
      const target = new THREE.Vector2(0, 0);

      camera.position.set(0, 0.1, 7);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
      keyLight.position.set(3, 4, 5);
      scene.add(keyLight);

      const blueMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0071e3,
        metalness: 0.18,
        roughness: 0.22,
        transmission: 0.34,
        thickness: 0.55,
        transparent: true,
        opacity: 0.54,
      });

      const silverMaterial = new THREE.MeshStandardMaterial({
        color: 0xf4f5f7,
        metalness: 0.42,
        roughness: 0.2,
        transparent: true,
        opacity: 0.84,
      });

      const ringGroup = new THREE.Group();
      const ringOne = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.018, 20, 160), blueMaterial);
      const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(2.22, 0.012, 16, 160), silverMaterial);
      const ringThree = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.01, 16, 120), silverMaterial);
      ringOne.rotation.set(0.78, 0.15, 0.3);
      ringTwo.rotation.set(1.2, -0.4, -0.24);
      ringThree.rotation.set(-0.45, 0.65, 0.12);
      ringGroup.add(ringOne, ringTwo, ringThree);
      ringGroup.position.set(1.9, 0.18, -0.8);
      scene.add(ringGroup);

      const portraitGroup = new THREE.Group();
      const loader = new THREE.TextureLoader();
      loader.load("assets/kim-avatar.jpg", (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const portrait = new THREE.Mesh(
          new THREE.PlaneGeometry(1.6, 2.05, 1, 1),
          new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.9 })
        );
        portrait.position.set(2.35, -0.14, -0.05);
        portrait.rotation.set(0.02, -0.34, 0.025);
        portraitGroup.add(portrait);
      });
      scene.add(portraitGroup);

      const dotCount = window.innerWidth < 720 ? 80 : 150;
      const positions = new Float32Array(dotCount * 3);
      for (let index = 0; index < dotCount; index += 1) {
        positions[index * 3] = (Math.random() - 0.5) * 8;
        positions[index * 3 + 1] = (Math.random() - 0.5) * 4.8;
        positions[index * 3 + 2] = (Math.random() - 0.5) * 4 - 1.5;
      }
      const dotGeometry = new THREE.BufferGeometry();
      dotGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const dots = new THREE.Points(
        dotGeometry,
        new THREE.PointsMaterial({
          color: 0x8aa7c7,
          size: 0.026,
          transparent: true,
          opacity: 0.48,
        })
      );
      scene.add(dots);

      const resize = () => {
        const rect = sceneCanvas.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height, false);
        camera.aspect = rect.width / Math.max(rect.height, 1);
        camera.updateProjectionMatrix();

        if (rect.width < 720) {
          ringGroup.position.set(0.65, -0.65, -1.2);
          ringGroup.scale.setScalar(0.78);
          portraitGroup.visible = false;
        } else {
          ringGroup.position.set(1.9, 0.18, -0.8);
          ringGroup.scale.setScalar(1);
          portraitGroup.visible = true;
        }
      };

      const onPointerMove = (event) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        target.set(x, y);
      };

      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      resize();

      const animate = () => {
        const elapsed = clock.getElapsedTime();
        pointer.lerp(target, 0.055);

        if (!reduceMotion) {
          ringGroup.rotation.y = elapsed * 0.12 + pointer.x * 0.35;
          ringGroup.rotation.x = pointer.y * 0.18;
          portraitGroup.rotation.y = pointer.x * 0.16;
          portraitGroup.rotation.x = -pointer.y * 0.1;
          dots.rotation.y = elapsed * 0.025;
          dots.rotation.x = pointer.y * 0.08;
          camera.position.x = pointer.x * 0.28;
          camera.position.y = 0.1 - pointer.y * 0.2;
          camera.lookAt(0.4, 0, 0);
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };

      animate();
    })
    .catch(() => {
      sceneCanvas.classList.add("is-static");
    });
}
