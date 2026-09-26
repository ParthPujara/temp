import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, PresentationControls } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import useInView from '../../hooks/useInView'
import Model from './Model'

export default function HeroModel({ modelUrl }) {
  // Pause rendering while the hero is scrolled off-screen
  const [containerRef, visible] = useInView()

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        frameloop={visible ? 'always' : 'never'}
        // Vertical swipes scroll the page on phones; horizontal swipes rotate the model
        style={{ touchAction: 'pan-y' }}
      >
        {/* Camera and lights never move, so lighting stays fixed while dragging */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-4, -2, 3]} intensity={20} color="#7C3AED" />

        <Suspense fallback={null}>
          {/* Drag anywhere on the canvas rotates the model itself, not the camera */}
          <PresentationControls
            global
            polar={[-Infinity, Infinity]}
            azimuth={[-Infinity, Infinity]}
            speed={1.5}
          >
            <Model url={modelUrl} />
          </PresentationControls>
          <Environment preset="city" />
        </Suspense>

        <EffectComposer>
          <Bloom intensity={0.8} luminanceThreshold={0.2} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
