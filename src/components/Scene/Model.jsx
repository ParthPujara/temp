import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { MathUtils } from 'three'
import { revealProgress } from '../../lib/revealProgress'

const { damp, lerp, smoothstep } = MathUtils

// Theme colors from src/index.css (three.js can't read Tailwind classes)
const CYAN_PRIMARY = '#00E5FF'
const VIOLET_ACCENT = '#7C3AED'

const WIRE_RADIUS = 1.4
const STONE_SCALE = 0.8
// Expanded wireframe diameter as a fraction of the screen height
const EXPANDED_FIT = 1.1

// Stone inside a wireframe shell. On scroll the stone swells, glows and collapses
// while the wireframe expands around the About text (see About.jsx for the text timing).
export default function Model() {
  const spinRef = useRef()
  const wireRef = useRef()
  const wireMaterialRef = useRef()
  const stoneRef = useRef()
  const stoneMaterialRef = useRef()
  const smoothProgress = useRef(0)

  useFrame((state, delta) => {
    // Ease toward the scroll position so the model never jumps
    const progress = (smoothProgress.current = damp(smoothProgress.current, revealProgress.get(), 6, delta))

    spinRef.current.rotation.y += delta * 0.3

    // Stone: swells and glows, then collapses as the About text emerges
    const swell = smoothstep(progress, 0, 0.2)
    const collapse = smoothstep(progress, 0.2, 0.45)
    stoneRef.current.scale.setScalar(STONE_SCALE * (1 + 0.15 * swell) * (1 - collapse))
    stoneRef.current.visible = collapse < 1
    stoneMaterialRef.current.emissiveIntensity = 2.5 * swell
    stoneMaterialRef.current.opacity = 1 - collapse

    // Wireframe: expands to frame the About content and fades so the text stays readable
    const expand = smoothstep(progress, 0.15, 0.75)
    const expandedScale = (state.viewport.height * EXPANDED_FIT) / (2 * WIRE_RADIUS)
    wireRef.current.scale.setScalar(lerp(1, expandedScale, expand))
    wireMaterialRef.current.opacity = lerp(1, 0.35, expand)
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={spinRef}>
        <mesh ref={wireRef}>
          <icosahedronGeometry args={[WIRE_RADIUS, 1]} />
          <meshStandardMaterial
            ref={wireMaterialRef}
            color={CYAN_PRIMARY}
            emissive={CYAN_PRIMARY}
            emissiveIntensity={0.6}
            wireframe
            transparent
          />
        </mesh>

        <mesh ref={stoneRef} scale={STONE_SCALE}>
          <icosahedronGeometry args={[WIRE_RADIUS, 0]} />
          <meshStandardMaterial
            ref={stoneMaterialRef}
            color={VIOLET_ACCENT}
            emissive={VIOLET_ACCENT}
            emissiveIntensity={0}
            metalness={0.6}
            roughness={0.25}
            transparent
          />
        </mesh>
      </group>
    </Float>
  )
}
