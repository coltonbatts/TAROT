import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type CameraRigProps = {
  selectedSlug: string | null;
  focusPoint: THREE.Vector3 | null;
  controlsEnabled: boolean;
  reducedMotion: boolean;
};

export function CameraRig({
  selectedSlug,
  focusPoint,
  controlsEnabled,
  reducedMotion,
}: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const orbitMemory = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const prevSlug = useRef<string | null>(null);

  useLayoutEffect(() => {
    const prev = prevSlug.current;
    const next = selectedSlug;
    if (next && !prev && controlsRef.current) {
      orbitMemory.current = {
        position: camera.position.clone(),
        target: controlsRef.current.target.clone(),
      };
    }
    prevSlug.current = next;
  }, [selectedSlug, camera]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    controls.enabled = controlsEnabled;
    const dt = Math.min(delta, 0.05);
    const k = reducedMotion ? 22 : 9;
    const t = 1 - Math.exp(-k * dt);

    if (focusPoint) {
      const outward = focusPoint.clone();
      if (outward.lengthSq() < 1e-6) {
        outward.set(0, 0, 1);
      } else {
        outward.normalize();
      }

      const offset = outward.multiplyScalar(2.95);
      offset.y += 0.45;
      const desiredPosition = focusPoint.clone().add(offset);
      camera.position.lerp(desiredPosition, t);
      controls.target.lerp(focusPoint, t);
    } else if (orbitMemory.current) {
      camera.position.lerp(orbitMemory.current.position, t);
      controls.target.lerp(orbitMemory.current.target, t);
      if (camera.position.distanceTo(orbitMemory.current.position) < 0.06) {
        camera.position.copy(orbitMemory.current.position);
        controls.target.copy(orbitMemory.current.target);
        orbitMemory.current = null;
      }
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 0.35, 0]}
      enablePan
      enableZoom
      minPolarAngle={0.18}
      maxPolarAngle={Math.PI - 0.22}
      minDistance={2.45}
      maxDistance={28}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.78}
      zoomSpeed={0.68}
      panSpeed={0.52}
    />
  );
}
