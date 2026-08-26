import { useEffect, useRef, useState } from "react";

import { P53_PDB_URL, parsePdbCA, type Residue } from "@/lib/lnp/structures";

/** Cα-trace of the p53 DNA-binding domain (PDB 1TUP) with the mutated residue highlighted. */
export function ProteinViewer3D({ residue, variantId }: { residue: number | null; variantId: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [chain, setChain] = useState<Residue[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const target = useRef(residue);
  target.current = residue;

  useEffect(() => {
    let cancelled = false;
    fetch(P53_PDB_URL)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((t) => {
        if (cancelled) return;
        const ca = parsePdbCA(t, "A");
        if (!ca.length) throw new Error("no chain");
        setChain(ca);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!chain) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const el = host.current;
      if (!el || disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      el.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.cursor = "grab";

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(6, 10, 12);
      scene.add(key);

      const root = new THREE.Group();
      scene.add(root);

      const c = chain.reduce(
        (a, r) => ({ x: a.x + r.x / chain.length, y: a.y + r.y / chain.length, z: a.z + r.z / chain.length }),
        { x: 0, y: 0, z: 0 },
      );
      const pts = chain.map((r) => new THREE.Vector3(r.x - c.x, r.y - c.y, r.z - c.z));
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, pts.length * 6, 0.85, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x3f7f79, roughness: 0.45 }),
      );
      root.add(tube);

      // hotspot marker
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(2.6, 24, 18),
        new THREE.MeshStandardMaterial({ color: 0xb4553a, emissive: 0x3a1408, roughness: 0.3 }),
      );
      marker.visible = false;
      root.add(marker);

      const place = () => {
        const res = target.current;
        const hit = res == null ? undefined : chain.find((r) => r.seq === res);
        if (!hit) {
          marker.visible = false;
          return;
        }
        marker.visible = true;
        marker.position.set(hit.x - c.x, hit.y - c.y, hit.z - c.z);
      };
      place();

      const box = new THREE.Box3().setFromObject(tube);
      const radius = box.getSize(new THREE.Vector3()).length() / 2 || 30;
      camera.position.set(0, 0, radius * 2.2);

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
        camera.position.z = Math.max(radius, Math.min(radius * 5, camera.position.z + e.deltaY * 0.05));
      };
      const cv = renderer.domElement;
      cv.addEventListener("pointerdown", down);
      cv.addEventListener("pointermove", move);
      cv.addEventListener("pointerup", up);
      cv.addEventListener("pointerleave", up);
      cv.addEventListener("wheel", wheel, { passive: false });

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
      let last = target.current;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (last !== target.current) {
          last = target.current;
          place();
        }
        if (spin) rotY += 0.004;
        root.rotation.set(rotX, rotY, 0);
        const pulse = 1 + Math.sin(performance.now() / 320) * 0.12;
        marker.scale.setScalar(pulse);
        renderer.render(scene, camera);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        cv.removeEventListener("pointerdown", down);
        cv.removeEventListener("pointermove", move);
        cv.removeEventListener("pointerup", up);
        cv.removeEventListener("pointerleave", up);
        cv.removeEventListener("wheel", wheel);
        renderer.dispose();
        el.removeChild(cv);
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [chain]);

  return (
    <div className="relative">
      <div ref={host} className="h-[320px] w-full rounded-lg bg-ink overflow-hidden" />
      {status !== "ready" ? (
        <div className="absolute inset-0 grid place-items-center font-mono text-[11px] text-paper/70 px-6 text-center">
          {status === "loading" ? "Fetching PDB 1TUP (p53 core domain)…" : "Could not reach the PDB — structure unavailable offline."}
        </div>
      ) : (
        <div className="pointer-events-none absolute left-3 bottom-3 font-mono text-[10px] text-paper/70">
          <span className="block text-primary">▸ PDB 1TUP · p53 DNA-binding domain</span>
          {residue ? `residue ${residue} highlighted (${variantId})` : "no residue-level hotspot for this variant"}
        </div>
      )}
    </div>
  );
}
