import { OrbitControls } from "@react-three/drei";

type CameraRigProps = {
  reducedMotion: boolean;
};

export function CameraRig({ reducedMotion }: CameraRigProps) {
  return (
    <OrbitControls
      target={[0, 0.35, 0]}
      enablePan
      enableZoom
      minPolarAngle={0.18}
      maxPolarAngle={Math.PI - 0.22}
      minDistance={2.45}
      maxDistance={28}
      enableDamping={!reducedMotion}
      dampingFactor={0.08}
      rotateSpeed={0.78}
      zoomSpeed={0.68}
      panSpeed={0.52}
    />
  );
}
