import { useEffect, useRef } from "react";

export interface ParticleViewerProps {
  sizeNm: number;
  pdi: number;
  ionizablePct: number;
  helperPct: number;
  cholPct: number;
  pegPct: number;
  encapsulation: number;
  cargoLabel: string;
}

/**
 * Interactive 3D cross-section of the predicted lipid nanoparticle:
 * PEG corona, lipid shell, cholesterol-rich interstices and the nucleic-acid core.
 */
export function ParticleViewer3D(props: ParticleViewerProps) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef(props);
  state.current = props;

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const el = host.current;
      if (!el || disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 1.4, 6.2);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      el.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.cursor = "grab";

      scene.add(new THREE.AmbientLight(0xffffff, 0.75));
      const key = new THREE.DirectionalLight(0xffffff, 1.5);
      key.position.set(4, 6, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x8fd6cf, 0.7);
      rim.position.set(-5, -2, -4);
      scene.add(rim);

      const root = new THREE.Group();
      scene.add(root);

      // half-shell cut-away so the core stays visible
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(2, 64, 48, 0, Math.PI * 1.35),
        new THREE.MeshStandardMaterial({
          color: 0x3f7f79,
          roughness: 0.35,
          metalness: 0.05,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.55,
        }),
      );
      root.add(shell);

      const inner = new THREE.Mesh(
        new THREE.SphereGeometry(1.62, 48, 36, 0, Math.PI * 1.35),
        new THREE.MeshStandardMaterial({
          color: 0xd7a24a,
          roughness: 0.5,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4,
        }),
      );
      root.add(inner);

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.1, 3),
        new THREE.MeshStandardMaterial({ color: 0x2b3440, roughness: 0.6, flatShading: true }),
      );
      root.add(core);

      // nucleic-acid strands in the core
      const strands = new THREE.Group();
      for (let s = 0; s < 5; s++) {
        const pts: InstanceType<typeof THREE.Vector3>[] = [];
        for (let i = 0; i <= 40; i++) {
          const t = (i / 40) * Math.PI * 4 + s;
          const r = 0.35 + 0.5 * Math.sin(t / 3 + s);
          pts.push(new THREE.Vector3(r * Math.cos(t), (i / 40 - 0.5) * 1.5 + 0.2 * Math.sin(s), r * Math.sin(t)));
        }
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, 0.045, 6, false),
          new THREE.MeshStandardMaterial({ color: 0x7fd6c8, emissive: 0x0d3a35, roughness: 0.4 }),
        );
        strands.add(tube);
      }
      root.add(strands);

      // PEG corona
      const pegGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const pegMat = new THREE.MeshStandardMaterial({ color: 0xb4553a, roughness: 0.7 });
      const peg = new THREE.InstancedMesh(pegGeo, pegMat, 220);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < 220; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / 220);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        dummy.position.set(
          2.24 * Math.sin(phi) * Math.cos(theta),
          2.24 * Math.cos(phi),
          2.24 * Math.sin(phi) * Math.sin(theta),
        );
        dummy.updateMatrix();
        peg.setMatrixAt(i, dummy.matrix);
      }
      root.add(peg);

      // pointer orbit
      let drag = false;
      let px = 0;
      let py = 0;
      let rotY = 0.6;
      let rotX = 0.18;
      let spin = true;
      const down = (e: PointerEvent) => {
        drag = true;
        spin = false;
        px = e.clientX;
        py = e.clientY;
        renderer.domElement.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!drag) return;
        rotY += (e.clientX - px) * 0.008;
        rotX = Math.max(-1.2, Math.min(1.2, rotX + (e.clientY - py) * 0.006));
        px = e.clientX;
        py = e.clientY;
      };
      const up = () => {
        drag = false;
      };
      renderer.domElement.addEventListener("pointerdown", down);
      renderer.domElement.addEventListener("pointermove", move);
      renderer.domElement.addEventListener("pointerup", up);
      renderer.domElement.addEventListener("pointerleave", up);

      const resize = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      let raf = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        const p = state.current;
        if (spin) rotY += 0.0035;
        root.rotation.set(rotX, rotY, 0);

        // live scaling from predictions
        const scale = 0.55 + (p.sizeNm / 210) * 0.85;
        root.scale.setScalar(scale);
        shell.scale.setScalar(1 + (p.ionizablePct - 50) / 260);
        inner.scale.setScalar(0.95 + (p.cholPct - 38.5) / 220);
        core.scale.setScalar(0.7 + (p.encapsulation / 100) * 0.55);
        strands.scale.setScalar(0.7 + (p.encapsulation / 100) * 0.55);
        peg.scale.setScalar(1 + p.pegPct / 24);
        (peg.material as InstanceType<typeof THREE.MeshStandardMaterial>).opacity = 1;
        peg.visible = p.pegPct > 0.05;
        (shell.material as InstanceType<typeof THREE.MeshStandardMaterial>).opacity =
          0.4 + Math.min(0.4, p.pdi * 1.2);
        renderer.render(scene, camera);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        renderer.domElement.removeEventListener("pointerdown", down);
        renderer.domElement.removeEventListener("pointermove", move);
        renderer.domElement.removeEventListener("pointerup", up);
        renderer.domElement.removeEventListener("pointerleave", up);
        renderer.dispose();
        el.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className="relative">
      <div ref={host} className="h-[260px] w-full rounded-lg bg-ink overflow-hidden" />
      <div className="pointer-events-none absolute left-3 bottom-3 font-mono text-[10px] text-paper/70 leading-relaxed">
        <span className="block text-primary">▸ {props.cargoLabel} core · {props.encapsulation.toFixed(0)}% encapsulated</span>
        D₅₀ {props.sizeNm.toFixed(0)} nm · PDI {props.pdi.toFixed(3)} · drag to orbit
      </div>
    </div>
  );
}
