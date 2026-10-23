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
  /** Table 1 architecture: ionizable | liposome | sln | nlc | hybrid */
  platformId?: string;
  /** targeting-ligand surface density (mol%) — drawn as receptor-binding moieties */
  ligandPct?: number;
  /** SORT charged-lipid fraction (mol%) — drawn as surface charge markers */
  sortPct?: number;
}

const LEGEND: { color: string; label: string }[] = [
  { color: "#c9694a", label: "PEG-lipid corona" },
  { color: "#6fd3c6", label: "Ionizable / helper lipid shell" },
  { color: "#e2b25a", label: "Cholesterol layer" },
  { color: "#9fe3d8", label: "Nucleic-acid cargo" },
];

/**
 * Interactive 3D cut-away of the predicted lipid nanoparticle. A fixed octant "window"
 * is cut out of the particle so the layers are always visible while it rotates:
 * PEG corona → lipid shell (heads + tails) → cholesterol layer → nucleic-acid core.
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
      type Mat = InstanceType<typeof THREE.MeshStandardMaterial>;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      const camDir = new THREE.Vector3(0.62, 0.5, 0.82).normalize();
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.localClippingEnabled = true;
      el.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      renderer.domElement.style.cursor = "grab";
      renderer.domElement.style.touchAction = "none";

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const key = new THREE.DirectionalLight(0xffffff, 1.7);
      key.position.set(5, 7, 8);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x8fd6cf, 0.9);
      rim.position.set(-6, -3, -5);
      scene.add(rim);

      // fixed octant cut-away: fragments are removed only where x>0, y>0 and z>0 (world space)
      const clip = [
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
        new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
        new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
      ];
      const mat = (opts: ConstructorParameters<typeof THREE.MeshStandardMaterial>[0]): Mat =>
        new THREE.MeshStandardMaterial({ clippingPlanes: clip, clipIntersection: true, ...opts });

      const root = new THREE.Group();
      scene.add(root);
      const dummy = new THREE.Object3D();
      const yAxis = new THREE.Vector3(0, 1, 0);
      const fib = (i: number, n: number, k = 1) => {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i * k;
        return new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
      };

      // ---- layers (radii in scene units) ----
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(2, 72, 54),
        mat({ color: 0x2f8f86, roughness: 0.3, metalness: 0.05, side: THREE.DoubleSide, transparent: true, opacity: 0.45, depthWrite: false }),
      );
      root.add(shell);

      const chol = new THREE.Mesh(
        new THREE.SphereGeometry(1.55, 56, 42),
        mat({ color: 0xd9a441, roughness: 0.5, side: THREE.DoubleSide, transparent: true, opacity: 0.35, depthWrite: false }),
      );
      root.add(chol);

      // bumpy nucleic-acid / lipid-complex core
      const coreGeo = new THREE.IcosahedronGeometry(1.0, 4);
      const pos = coreGeo.getAttribute("position");
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).normalize();
        const n = Math.sin(v.x * 6.1) * Math.sin(v.y * 5.3) * Math.sin(v.z * 6.7);
        v.multiplyScalar(1 + 0.07 * n);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      coreGeo.computeVertexNormals();
      const core = new THREE.Mesh(coreGeo, mat({ color: 0x23424a, roughness: 0.55, side: THREE.DoubleSide }));
      root.add(core);

      // nucleic-acid strands winding through the core
      const strands = new THREE.Group();
      for (let s = 0; s < 7; s++) {
        const pts: InstanceType<typeof THREE.Vector3>[] = [];
        for (let i = 0; i <= 60; i++) {
          const t = (i / 60) * Math.PI * 5 + s * 0.9;
          const r = 0.25 + 0.45 * Math.abs(Math.sin(t / 3.2 + s));
          pts.push(new THREE.Vector3(r * Math.cos(t), (i / 60 - 0.5) * 1.6 + 0.15 * Math.sin(s * 2), r * Math.sin(t)));
        }
        strands.add(
          new THREE.Mesh(
            new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.05, 6, false),
            mat({ color: 0x9fe3d8, emissive: 0x14504a, roughness: 0.35 }),
          ),
        );
      }
      root.add(strands);

      // lipid shell: heads on the outer surface + tails pointing inward
      const HEADS = 900;
      const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 10, 10), mat({ color: 0xbff2ea, roughness: 0.35 }), HEADS);
      const tailGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.34, 5);
      tailGeo.translate(0, -0.17, 0);
      const tails = new THREE.InstancedMesh(tailGeo, mat({ color: 0x3f9d92, roughness: 0.5 }), HEADS);
      for (let i = 0; i < HEADS; i++) {
        const d = fib(i, HEADS);
        dummy.position.copy(d).multiplyScalar(2.0);
        dummy.quaternion.setFromUnitVectors(yAxis, d);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        heads.setMatrixAt(i, dummy.matrix);
        tails.setMatrixAt(i, dummy.matrix);
      }
      root.add(heads, tails);

      // PEG corona: chains with a bead at the tip
      const PEG_MAX = 420;
      const pegChainGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 5);
      pegChainGeo.translate(0, 0.2, 0);
      const pegMat = mat({ color: 0xc9694a, roughness: 0.6 });
      const pegChains = new THREE.InstancedMesh(pegChainGeo, pegMat, PEG_MAX);
      const pegBeads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 8), pegMat, PEG_MAX);
      for (let i = 0; i < PEG_MAX; i++) {
        const d = fib(i, PEG_MAX, 1.13);
        dummy.position.copy(d).multiplyScalar(2.02);
        dummy.quaternion.setFromUnitVectors(yAxis, d);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        pegChains.setMatrixAt(i, dummy.matrix);
        dummy.position.copy(d).multiplyScalar(2.45);
        dummy.quaternion.identity();
        dummy.updateMatrix();
        pegBeads.setMatrixAt(i, dummy.matrix);
      }
      root.add(pegChains, pegBeads);

      // targeting ligands (cones on stalks) protruding through the PEG corona
      const ligGeo = new THREE.ConeGeometry(0.12, 0.4, 8);
      ligGeo.translate(0, 0.2, 0);
      const ligands = new THREE.InstancedMesh(ligGeo, mat({ color: 0xe8bb4f, roughness: 0.4, emissive: 0x4a3607 }), 60);
      for (let i = 0; i < 60; i++) {
        const d = fib(i, 60, 1.37);
        dummy.position.copy(d).multiplyScalar(2.45);
        dummy.quaternion.setFromUnitVectors(yAxis, d);
        dummy.updateMatrix();
        ligands.setMatrixAt(i, dummy.matrix);
      }
      root.add(ligands);

      // SORT charged-lipid markers on the lipid shell
      const sortMarks = new THREE.InstancedMesh(
        new THREE.SphereGeometry(0.1, 10, 10),
        mat({ color: 0xe0483f, roughness: 0.35, emissive: 0x5a120e }),
        90,
      );
      for (let i = 0; i < 90; i++) {
        const d = fib(i, 90, 0.83);
        dummy.position.copy(d).multiplyScalar(2.08);
        dummy.quaternion.identity();
        dummy.updateMatrix();
        sortMarks.setMatrixAt(i, dummy.matrix);
      }
      root.add(sortMarks);

      // ---- orbit controls ----
      let drag = false;
      let px = 0;
      let py = 0;
      let rotY = 0.6;
      let rotX = 0.1;
      let spin = true;
      const down = (e: PointerEvent) => {
        drag = true;
        spin = false;
        px = e.clientX;
        py = e.clientY;
        renderer.domElement.style.cursor = "grabbing";
        renderer.domElement.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!drag) return;
        rotY += (e.clientX - px) * 0.008;
        rotX = Math.max(-1.3, Math.min(1.3, rotX + (e.clientY - py) * 0.006));
        px = e.clientX;
        py = e.clientY;
      };
      const up = () => {
        drag = false;
        renderer.domElement.style.cursor = "grab";
      };
      renderer.domElement.addEventListener("pointerdown", down);
      renderer.domElement.addEventListener("pointermove", move);
      renderer.domElement.addEventListener("pointerup", up);
      renderer.domElement.addEventListener("pointerleave", up);

      // frame the whole particle (incl. ligands/PEG) whatever the canvas shape
      const FIT_RADIUS = 3.45;
      const resize = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const vHalf = (camera.fov * Math.PI) / 360;
        const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
        const dist = FIT_RADIUS / Math.sin(Math.min(vHalf, hHalf));
        camera.position.copy(camDir).multiplyScalar(dist);
        camera.lookAt(0, 0, 0);
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
        root.scale.setScalar(0.72 + (p.sizeNm / 210) * 0.34);
        shell.scale.setScalar(1 + (p.ionizablePct - 50) / 400);
        chol.scale.setScalar(0.97 + (p.cholPct - 38.5) / 300);
        const enc = 0.75 + (p.encapsulation / 100) * 0.35;
        core.scale.setScalar(enc);
        strands.scale.setScalar(enc);
        (shell.material as Mat).opacity = 0.35 + Math.min(0.3, p.pdi * 0.9);

        const pegN = p.pegPct > 0.05 ? Math.round(Math.min(PEG_MAX, 40 + p.pegPct * 65)) : 0;
        pegChains.count = pegN;
        pegBeads.count = pegN;
        pegChains.visible = pegBeads.visible = pegN > 0;

        // architecture (paper Fig. 1): A liposome, B SLN / NLC, C ionizable LNP, D lipid-polymer hybrid
        const arch = p.platformId ?? "ionizable";
        const coreMat = core.material as Mat;
        const cholMat = chol.material as Mat;
        cholMat.opacity = 0.35;
        core.visible = true;
        strands.visible = true;
        if (arch === "liposome") {
          core.visible = false; // hollow aqueous lumen
          strands.scale.setScalar(0.6);
          cholMat.opacity = 0.22;
        } else if (arch === "sln" || arch === "nlc") {
          cholMat.opacity = arch === "sln" ? 0.8 : 0.6;
          coreMat.color.setHex(arch === "sln" ? 0x8a6f3a : 0x6f8a62);
          core.scale.setScalar(1.25);
          strands.scale.setScalar(0.5);
        } else if (arch === "hybrid") {
          coreMat.color.setHex(0x5a6f9a); // PLGA polymer core
          core.scale.setScalar(1.35);
          strands.scale.setScalar(0.45);
        } else {
          coreMat.color.setHex(0x23424a);
        }
        const ligN = Math.round(Math.min(60, (p.ligandPct ?? 0) * 12));
        ligands.count = ligN;
        ligands.visible = ligN > 0;
        const sortN = Math.round(Math.min(90, (p.sortPct ?? 0) * 3));
        sortMarks.count = sortN;
        sortMarks.visible = sortN > 0;
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
        if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className="relative h-full min-h-[360px] w-full overflow-hidden rounded-lg bg-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 48%, color-mix(in oklab, var(--primary) 38%, transparent), transparent 68%)" }}
      />
      <div ref={host} className="absolute inset-0" />
      <ul className="pointer-events-none absolute left-3 top-3 space-y-1 font-mono text-[10px] text-paper/80">
        {LEGEND.map((l) => (
          <li key={l.label} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
            {l.label}
          </li>
        ))}
        {(props.ligandPct ?? 0) > 0 ? (
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rotate-45" style={{ background: "#e8bb4f" }} />
            Targeting ligand {props.ligandPct!.toFixed(1)} mol%
          </li>
        ) : null}
        {(props.sortPct ?? 0) > 0 ? (
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: "#e0483f" }} />
            SORT charged lipid {props.sortPct} mol%
          </li>
        ) : null}
      </ul>
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-between gap-2 font-mono text-[10px] text-paper/70">
        <span>
          {props.cargoLabel} core · {props.encapsulation.toFixed(0)}% encapsulated
        </span>
        <span>
          D₅₀ {props.sizeNm.toFixed(0)} nm · PDI {props.pdi.toFixed(3)} · drag to orbit
        </span>
      </div>
    </div>
  );
}
