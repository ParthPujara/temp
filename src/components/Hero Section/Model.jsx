import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Center, Float, useGLTF } from '@react-three/drei'

// Theme colors from src/index.css (three.js can't read Tailwind classes)
const CYAN_PRIMARY = '#00E5FF'
const VIOLET_ACCENT = '#7C3AED'

// Gentle idle spin shared by both model types
function useIdleRotation(ref, speed = 0.25) {
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed
  })
}

function GltfModel({ url, scale }) {
  const ref = useRef()
  const { scene } = useGLTF(url)
  useIdleRotation(ref)

  return (
    <Center>
      <primitive ref={ref} object={scene} scale={scale} />
    </Center>
  )
}

// Shown until a real .glb is placed in public/models/
function PlaceholderModel() {
  const ref = useRef()
  useIdleRotation(ref, 0.3)

  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial
          color={CYAN_PRIMARY}
          emissive={CYAN_PRIMARY}
          emissiveIntensity={0.6}
          wireframe
        />
      </mesh>
      <mesh scale={0.8}>
        <icosahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial color={VIOLET_ACCENT} metalness={0.6} roughness={0.25} />
      </mesh>
    </group>
  )
}

// Pass url="/models/your-model.glb" to load a real model
export default function Model({ url, scale = 1 }) {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
      {url ? <GltfModel url={url} scale={scale} /> : <PlaceholderModel />}
    </Float>
  )
}
