import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import useInView from '../../hooks/useInView'
import GeodesicSphere from './GeodesicSphere'

export default function AboutModel() {
  // Pause rendering while the section is scrolled off-screen
  const [containerRef, visible] = useInView()

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        frameloop={visible ? 'always' : 'never'}
      >
        <GeodesicSphere />

        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={1} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
