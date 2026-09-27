import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, PresentationControls } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import { contactAnchor, MERGE_AT } from '../../lib/scrollProgress'
import { MERGED_RADIUS } from './contactMerge'
import { domToWorld } from './domToWorld'

const { lerp, smoothstep } = MathUtils

// Theme colors from src/index.css (three.js can't read Tailwind classes)
const CYAN_PRIMARY = '#00E5FF'
const VIOLET_ACCENT = '#7C3AED'

const WIRE_RADIUS = 1.4 // same geometry as the hero model
const NODE_STONE = 0.65 // stone size in the timeline nodes it merges from...
const HERO_STONE = 0.8 // ...settling to the hero model's proportions
const SETTLE_END = 0.7 // contactProgress by which the stone has settled and stopped glowing
const MOVE_START = 0.5 // contactProgress where the model heads for its box on the right...
const MOVE_END = 0.9 // ...and arrives
const ANCHOR_FILL = 0.85 // wireframe size relative to the box

const target = new Vector3()

// The Contact model: the timeline nodes merge into this one hero-style stone-and-wireframe
// at the center of the screen (with a flash), and it then moves onto the empty box on the
// right of the Contact section. Floats and can be dragged like the hero model.
export default function ContactModel({ progressRef }) {
  const placeRef = useRef()
  const spinRef = useRef()
  const stoneRef = useRef()
  const stoneMaterialRef = useRef()

  useFrame((state, delta) => {
    const progress = progressRef.current
    const place = placeRef.current
    place.visible = progress >= MERGE_AT
    if (!place.visible) return

    // From the merge point at the center to the box on the right
    const move = smoothstep(progress, MOVE_START, MOVE_END)
    const mergedRadius = state.viewport.height * MERGED_RADIUS
    let anchorRadius = mergedRadius
    target.set(0, 0, 0)
    if (contactAnchor.current) anchorRadius = domToWorld(contactAnchor.current, state, target) * ANCHOR_FILL
    place.position.set(0, 0, 0).lerp(target, move)
    place.scale.setScalar(lerp(mergedRadius, anchorRadius, move) / WIRE_RADIUS)

    spinRef.current.rotation.y += delta * 0.3

    // Stone grows to hero proportions while the merge flash fades
    const settle = smoothstep(progress, MERGE_AT, SETTLE_END)
    stoneRef.current.scale.setScalar(lerp(NODE_STONE, HERO_STONE, settle))
    stoneMaterialRef.current.emissiveIntensity = 3 * (1 - settle)
  })

  return (
    <group ref={placeRef} visible={false}>
      {/* Inside the positioned group so dragging spins the model in place */}
      <PresentationControls
        global
        polar={[-Infinity, Infinity]}
        azimuth={[-Infinity, Infinity]}
        speed={1.5}
      >
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
          <group ref={spinRef}>
            <mesh>
              <icosahedronGeometry args={[WIRE_RADIUS, 1]} />
              <meshStandardMaterial
                color={CYAN_PRIMARY}
                emissive={CYAN_PRIMARY}
                emissiveIntensity={0.6}
                wireframe
              />
            </mesh>

            <mesh ref={stoneRef} scale={NODE_STONE}>
              <icosahedronGeometry args={[WIRE_RADIUS, 0]} />
              <meshStandardMaterial
                ref={stoneMaterialRef}
                color={VIOLET_ACCENT}
                emissive={VIOLET_ACCENT}
                emissiveIntensity={3}
                metalness={0.6}
                roughness={0.25}
              />
            </mesh>
          </group>
        </Float>
      </PresentationControls>
    </group>
  )
}
