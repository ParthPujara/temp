import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import Model from './Model'

export default function SceneCanvas() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      // Vertical swipes scroll the page on phones; horizontal swipes rotate the model
      style={{ touchAction: 'pan-y' }}
    >
      {/* Camera and lights never move, so lighting stays fixed while dragging */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-4, -2, 3]} intensity={20} color="#7C3AED" />

      <Suspense fallback={null}>
        <Model />
        <Environment preset="city" />
      </Suspense>

      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.2} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}
