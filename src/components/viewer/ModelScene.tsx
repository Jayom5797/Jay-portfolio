"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  Environment,
  OrbitControls,
  useBounds,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface Explodable {
  object: THREE.Object3D;
  base: THREE.Vector3; // original local position
  dir: THREE.Vector3; // radial direction from model center
}

/**
 * Loads a GLB/GLTF and, when `explode > 0`, separates its parts radially from
 * the model center — a generic "exploded view" that works on any assembly
 * without per-model configuration. Parts are the meaningful child objects of
 * the scene (or, if the scene is a single wrapper, that wrapper's children).
 */
function Model({
  url,
  explode,
  rotation,
}: {
  url: string;
  explode: number;
  rotation: [number, number, number];
}) {
  const { scene } = useGLTF(url);
  // Clone so the same cached GLTF can be shown in multiple viewers safely.
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // Compute the explodable parts + their radial directions once per model.
  const parts = useMemo<Explodable[]>(() => {
    // Determine the parts to explode: prefer the direct children of the root.
    // If the root has a single child (common GLB wrapper), descend one level.
    let container: THREE.Object3D = cloned;
    while (container.children.length === 1 && container.children[0].children.length > 0) {
      container = container.children[0];
    }
    const children = container.children.filter((c) => {
      // Only move things that render (meshes/groups), skip lights/cameras.
      return (c as THREE.Object3D).type !== "Camera" && (c as THREE.Object3D).type !== "Light";
    });

    // World center of the whole model.
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());

    return children.map((child) => {
      const childBox = new THREE.Box3().setFromObject(child);
      const childCenter = childBox.getCenter(new THREE.Vector3());
      let dir = childCenter.clone().sub(center);
      if (dir.lengthSq() < 1e-6) {
        // Part sits at the exact center — give it a deterministic direction.
        dir = new THREE.Vector3(
          (child.id % 3) - 1,
          ((child.id >> 2) % 3) - 1,
          ((child.id >> 4) % 3) - 1,
        );
        if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      }
      dir.normalize();
      return { object: child, base: child.position.clone(), dir };
    });
  }, [cloned]);

  // Scale the offset by the model size so the slider feels consistent.
  const spread = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    return box.getSize(new THREE.Vector3()).length() * 0.35;
  }, [cloned]);

  // Apply the explode offset whenever it changes.
  useEffect(() => {
    for (const p of parts) {
      p.object.position.copy(p.base).addScaledVector(p.dir, explode * spread);
    }
  }, [parts, explode, spread]);

  // Orientation correction is applied on a wrapper group (in radians) so it
  // composes cleanly with Bounds' auto-fit around the corrected model.
  const rad = (d: number) => (d * Math.PI) / 180;
  return (
    <group rotation={[rad(rotation[0]), rad(rotation[1]), rad(rotation[2])]}>
      <primitive object={cloned} />
    </group>
  );
}

/** Refits the camera to the model bounds whenever the model changes. */
function AutoFit({ children, trigger }: { children: React.ReactNode; trigger: unknown }) {
  const api = useBounds();
  useEffect(() => {
    // Defer to next frame so geometry is present before fitting.
    const id = requestAnimationFrame(() => api.refresh().clip().fit());
    return () => cancelAnimationFrame(id);
  }, [api, trigger]);
  return <>{children}</>;
}

export default function ModelScene({
  url,
  resetSignal,
  explode = 0,
  rotation = [0, 0, 0],
}: {
  url: string;
  /** Increment to trigger a camera reset from the parent controls. */
  resetSignal: number;
  /** 0 = assembled, 1 = fully separated (exploded view). */
  explode?: number;
  /** Orientation correction in degrees [x, y, z]. */
  rotation?: [number, number, number];
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [fitKey, setFitKey] = useState(0);

  // When the parent asks for a reset, re-run the AutoFit and reset controls.
  useEffect(() => {
    if (resetSignal === 0) return;
    controlsRef.current?.reset();
    setFitKey((k) => k + 1);
  }, [resetSignal]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [3, 2, 4], fov: 45, near: 0.01, far: 1000 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      className="!absolute inset-0"
    >
      <color attach="background" args={["#0d0f12"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} />

      {/* Fallback is null — the loading UI is a DOM overlay in ModelViewer,
          which avoids drei <Html> mount/unmount races under React 19. */}
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.2}>
          <AutoFit trigger={`${url}-${fitKey}-${rotation.join(",")}`}>
            <Model url={url} explode={explode} rotation={rotation} />
          </AutoFit>
        </Bounds>
        <Environment preset="studio" />
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        enableZoom
        enableRotate
        dampingFactor={0.08}
        minDistance={0.2}
        maxDistance={50}
      />
    </Canvas>
  );
}
