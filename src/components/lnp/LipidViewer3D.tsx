import { useEffect, useRef, useState } from "react";

import { ELEMENT_COLORS, ELEMENT_RADII, parseSdf, smilesSdfUrl, type Molecule3D } from "@/lib/lnp/structures";

/** Ball-and-stick 3D view of an ionizable lipid, embedded from its SMILES. */
export function LipidViewer3D({ smiles, name }: { smiles: string; name: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [mol, setMol] = useState<Molecule3D | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setMol(null);
    fetch(smilesSdfUrl(smiles))
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((t) => {
        if (cancelled) return;
        setMol(parseSdf(t));
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [smiles]);

  useEffect(() => {
    if (!mol) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const el = host.current;
      if (!el || disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      el.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.cursor = "grab";

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(5, 8, 10);
      scene.add(key);

      const root = new THREE.Group();
      scene.add(root);

      const center = mol.atoms.reduce(
        (a, at) => ({ x: a.x + at.x / mol.atoms.length, y: a.y + at.y / mol.atoms.length, z: a.z + at.z / mol.atoms.length }),
        { x: 0, y: 0, z: 0 },
      );
      const v = (a: { x: number; y: number; z: number }) => new THREE.Vector3(a.x - center.x, a.y - center.y, a.z - center.z);

      const sphere = new THREE.SphereGeometry(1, 16, 12);
      for (const at of mol.atoms) {
        if (at.el === "H") continue;
        const m = new THREE.Mesh(
          sphere,
          new THREE.MeshStandardMaterial({ color: ELEMENT_COLORS[at.el] ?? 0x8b93a1, roughness: 0.35 }),
        );
        m.position.copy(v(at));
        m.scale.setScalar(ELEMENT_RADII[at.el] ?? 0.35);
        root.add(m);
      }

      const bondMat = new THREE.MeshStandardMaterial({ color: 0x9aa4b2, roughness: 0.5 });
      const cyl = new THREE.CylinderGeometry(1, 1, 1, 8);
      for (const b of mol.bonds) {
        const A = mol.atoms[b.a];
        const B = mol.atoms[b.b];
        if (!A || !B || A.el === "H" || B.el === "H") continue;
        const p1 = v(A);
        const p2 = v(B);
        const mid = p1.clone().add(p2).multiplyScalar(0.5);
        const dir = p2.clone().sub(p1);
        const bond = new THREE.Mesh(cyl, bondMat);
        bond.position.copy(mid);
        bond.scale.set(0.075, dir.length(), 0.075);
        bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        root.add(bond);
      }

      const box = new THREE.Box3().setFromObject(root);
      const radius = box.getSize(new THREE.Vector3()).length() / 2 || 5;
      camera.position.set(0, 0, radius * 2.1);

      let drag = false;
      let px = 0;
      let py = 0;
      let rotY = 0;
      let rotX = 0;
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
        rotX = Math.max(-1.3, Math.min(1.3, rotX + (e.clientY - py) * 0.006));
        px = e.clientX;
        py = e.clientY;
      };
      const up = () => {
        drag = false;
      };
      const wheel = (e: WheelEvent) => {
        e.preventDefault();
        camera.position.z = Math.max(radius * 0.8, Math.min(radius * 5, camera.position.z + e.deltaY * 0.01));
      };
      const c = renderer.domElement;
      c.addEventListener("pointerdown", down);
      c.addEventListener("pointermove", move);
      c.addEventListener("pointerup", up);
      c.addEventListener("pointerleave", up);
      c.addEventListener("wheel", wheel, { passive: false });

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
        if (spin) rotY += 0.004;
        root.rotation.set(rotX, rotY, 0);
        renderer.render(scene, camera);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        c.removeEventListener("pointerdown", down);
        c.removeEventListener("pointermove", move);
        c.removeEventListener("pointerup", up);
        c.removeEventListener("pointerleave", up);
        c.removeEventListener("wheel", wheel);
        renderer.dispose();
        el.removeChild(c);
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [mol]);

  return (
    <div className="relative">
      <div ref={host} className="h-[320px] w-full rounded-lg bg-ink overflow-hidden" />
      {status !== "ready" ? (
        <div className="absolute inset-0 grid place-items-center font-mono text-[11px] text-paper/70 px-6 text-center">
          {status === "loading"
            ? `Embedding 3D coordinates for ${name}…`
            : "3D embedding service unreachable — SMILES shown below instead."}
        </div>
      ) : (
        <div className="pointer-events-none absolute left-3 bottom-3 font-mono text-[10px] text-paper/70">
          <span className="block text-primary">▸ {name}</span>
          {mol?.atoms.filter((a) => a.el !== "H").length} heavy atoms · drag to rotate, scroll to zoom
        </div>
      )}
    </div>
  );
}
